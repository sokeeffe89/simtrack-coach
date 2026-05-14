import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_LAPS_PER_REQUEST = 25;
const MAX_POINTS_PER_LAP = 5000;
const POINT_INSERT_BATCH_SIZE = 750;

function jsonError(message, status = 400, details = null) {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    { status }
  );
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toIntegerOrNull(value) {
  const number = toNumberOrNull(value);
  return number === null ? null : Math.trunc(number);
}

function chunkRows(rows, size) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

function validatePayload(body) {
  const requiredFields = ["profile_id", "sim_name", "track_slug", "car_name", "laps"];
  const missingFields = requiredFields.filter((field) => !body?.[field]);

  if (missingFields.length) {
    return `Missing required telemetry field(s): ${missingFields.join(", ")}`;
  }

  if (!Array.isArray(body.laps) || body.laps.length === 0) {
    return "Telemetry payload must include at least one lap.";
  }

  if (body.laps.length > MAX_LAPS_PER_REQUEST) {
    return `Too many laps in one request. Maximum is ${MAX_LAPS_PER_REQUEST}.`;
  }

  return null;
}

async function getOrCreateSession({ profile_id, sim_name, track_slug, car_name, session_name, uploaded_file, external_session_id }) {
  if (external_session_id) {
    const { data: existing } = await supabase
      .from("telemetry_sessions")
      .select("id")
      .eq("profile_id", profile_id)
      .eq("source_type", "desktop-agent")
      .eq("external_session_id", external_session_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("telemetry_sessions")
        .update({ last_ingested_at: new Date().toISOString() })
        .eq("id", existing.id);

      return existing;
    }
  }

  const { data: created, error } = await supabase
    .from("telemetry_sessions")
    .insert([
      {
        profile_id,
        sim_name,
        track_slug,
        car_name,
        session_name: session_name || "iRacing sync session",
        uploaded_file: uploaded_file || "desktop-agent",
        source_type: "desktop-agent",
        external_session_id: external_session_id || null,
        last_ingested_at: new Date().toISOString()
      }
    ])
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created;
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.SIMTRACK_INGEST_TOKEN}`;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SIMTRACK_INGEST_TOKEN) {
    return jsonError("Server ingest configuration is incomplete.", 500);
  }

  if (!authHeader || authHeader !== expectedToken) {
    return jsonError("Unauthorized", 401);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return jsonError(validationError, 400);
  }

  const {
    profile_id,
    sim_name,
    track_slug,
    car_name,
    session_name,
    uploaded_file,
    external_session_id,
    laps
  } = body;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profile_id)
    .single();

  if (!profile) {
    return jsonError("Profile not found for telemetry ingest.", 404);
  }

  let session;

  try {
    session = await getOrCreateSession({
      profile_id,
      sim_name,
      track_slug,
      car_name,
      session_name,
      uploaded_file,
      external_session_id
    });
  } catch (error) {
    return jsonError("Failed to create telemetry session.", 500, error.message);
  }

  let savedLapCount = 0;
  let savedPointCount = 0;
  let skippedDuplicateLaps = 0;

  for (const lap of laps) {
    const lapNumber = toIntegerOrNull(lap.lap_number);

    const { data: existingLap } = await supabase
      .from("telemetry_laps")
      .select("id")
      .eq("session_id", session.id)
      .eq("lap_number", lapNumber)
      .maybeSingle();

    if (existingLap) {
      skippedDuplicateLaps += 1;
      continue;
    }

    const { data: savedLap, error: lapError } = await supabase
      .from("telemetry_laps")
      .insert([
        {
          session_id: session.id,
          lap_number: lapNumber,
          lap_time_ms: toIntegerOrNull(lap.lap_time_ms),
          is_valid: lap.is_valid ?? true
        }
      ])
      .select()
      .single();

    if (lapError) {
      return jsonError("Failed to create telemetry lap.", 500, lapError.message);
    }

    savedLapCount += 1;

    if (Array.isArray(lap.sectors) && lap.sectors.length) {
      const sectorRows = lap.sectors
        .filter((sector) => sector.sector_time_ms)
        .map((sector, index) => ({
          lap_id: savedLap.id,
          sector_number: toIntegerOrNull(sector.sector_number) || index + 1,
          sector_time_ms: toIntegerOrNull(sector.sector_time_ms)
        }));

      if (sectorRows.length) {
        await supabase.from("telemetry_sectors").insert(sectorRows);
      }
    }

    if (Array.isArray(lap.points) && lap.points.length) {
      const pointRows = lap.points.map((point, index) => ({
        lap_id: savedLap.id,
        sample_index: toIntegerOrNull(point.sample_index) ?? index,
        lap_percent: toNumberOrNull(point.lap_percent),
        distance_m: toNumberOrNull(point.distance_m),
        speed_kph: toNumberOrNull(point.speed_kph),
        throttle: toNumberOrNull(point.throttle),
        brake: toNumberOrNull(point.brake),
        steering: toNumberOrNull(point.steering),
        gear: toIntegerOrNull(point.gear),
        rpm: toIntegerOrNull(point.rpm)
      }));

      for (const pointChunk of chunkRows(pointRows, POINT_INSERT_BATCH_SIZE)) {
        await supabase.from("telemetry_points").insert(pointChunk);
      }

      savedPointCount += pointRows.length;
    }
  }

  return NextResponse.json({
    success: true,
    session_id: session.id,
    saved_laps: savedLapCount,
    saved_points: savedPointCount,
    skipped_duplicate_laps: skippedDuplicateLaps
  });
}
