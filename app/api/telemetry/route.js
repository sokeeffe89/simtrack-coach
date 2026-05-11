import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.SIMTRACK_INGEST_TOKEN}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    profile_id,
    sim_name,
    track_slug,
    car_name,
    session_name,
    uploaded_file,
    laps
  } = body;

  if (!profile_id || !sim_name || !track_slug || !car_name || !laps?.length) {
    return NextResponse.json(
      { error: "Missing required telemetry fields" },
      { status: 400 }
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("telemetry_sessions")
    .insert([
      {
        profile_id,
        sim_name,
        track_slug,
        car_name,
        session_name: session_name || "iRacing sync session",
        uploaded_file: uploaded_file || "desktop-agent"
      }
    ])
    .select()
    .single();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  for (const lap of laps) {
    const { data: savedLap, error: lapError } = await supabase
      .from("telemetry_laps")
      .insert([
        {
          session_id: session.id,
          lap_number: lap.lap_number,
          lap_time_ms: lap.lap_time_ms,
          is_valid: lap.is_valid ?? true
        }
      ])
      .select()
      .single();

    if (lapError) {
      return NextResponse.json({ error: lapError.message }, { status: 500 });
    }

    if (lap.sectors?.length) {
      const sectorRows = lap.sectors.map((sector, index) => ({
        lap_id: savedLap.id,
        sector_number: sector.sector_number || index + 1,
        sector_time_ms: sector.sector_time_ms
      }));

      const { error: sectorError } = await supabase
        .from("telemetry_sectors")
        .insert(sectorRows);

      if (sectorError) {
        return NextResponse.json({ error: sectorError.message }, { status: 500 });
      }
    }

    if (lap.points?.length) {
      const pointRows = lap.points.map((point, index) => ({
        lap_id: savedLap.id,
        sample_index: point.sample_index ?? index,
        lap_percent: point.lap_percent ?? null,
        distance_m: point.distance_m ?? null,
        speed_kph: point.speed_kph ?? null,
        throttle: point.throttle ?? null,
        brake: point.brake ?? null,
        steering: point.steering ?? null,
        gear: point.gear ?? null,
        rpm: point.rpm ?? null
      }));

      const { error: pointError } = await supabase
        .from("telemetry_points")
        .insert(pointRows);

      if (pointError) {
        return NextResponse.json({ error: pointError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({
    success: true,
    session_id: session.id
  });
}
