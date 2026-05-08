"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { tracks } from "../../../lib/tracks";
import TrackMap from "../../../components/TrackMap";

function formatMs(ms) {
  if (!ms && ms !== 0) return "—";

  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");

  return `${minutes}:${seconds}`;
}

export default function TelemetrySessionPage({ params }) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    async function loadSession() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setMessage("Please log in to view telemetry.");
        setLoading(false);
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from("telemetry_sessions")
        .select("*")
        .eq("id", params.sessionId)
        .single();

      if (sessionError) {
        setMessage(sessionError.message);
        setLoading(false);
        return;
      }

      const { data: lapData, error: lapError } = await supabase
        .from("telemetry_laps")
        .select("*, telemetry_sectors(*)")
        .eq("session_id", params.sessionId)
        .order("lap_number", { ascending: true });

      if (lapError) {
        setMessage(lapError.message);
        setLoading(false);
        return;
      }

      setSession(sessionData);
      setLaps(lapData || []);
      setLoading(false);
    }

    loadSession();
  }, [params.sessionId]);

  if (loading) {
    return (
      <main className="page">
        <p>Loading telemetry session...</p>
      </main>
    );
  }

  if (message) {
    return (
      <main className="page">
        <nav className="nav">
          <a href="/" className="logo">SimTrack Coach</a>
          <div>
            <a href="/garage">Garage</a>
            <a href="/upload">Upload</a>
          </div>
        </nav>

        <section className="authPanel">
          <p className="eyebrow">Telemetry</p>
          <h1>Unable to load session</h1>
          <p className="heroText">{message}</p>
        </section>
      </main>
    );
  }

  const track = tracks.find((t) => t.slug === session.track_slug);

  const bestLap = laps.reduce((best, lap) => {
    if (!best || lap.lap_time_ms < best.lap_time_ms) return lap;
    return best;
  }, null);

  const bestSectors = {};

  laps.forEach((lap) => {
    (lap.telemetry_sectors || []).forEach((sector) => {
      const sectorNumber = sector.sector_number;

      if (
        !bestSectors[sectorNumber] ||
        sector.sector_time_ms < bestSectors[sectorNumber]
      ) {
        bestSectors[sectorNumber] = sector.sector_time_ms;
      }
    });
  });

 const sectorStats = {};

laps.forEach((lap) => {
  (lap.telemetry_sectors || []).forEach((sector) => {
    const sectorNumber = sector.sector_number;

    if (!sectorStats[sectorNumber]) {
      sectorStats[sectorNumber] = [];
    }

    sectorStats[sectorNumber].push(sector.sector_time_ms);
  });
});

const sectorRatings = {};

Object.entries(sectorStats).forEach(([sectorNumber, values]) => {
  const best = Math.min(...values);
  const worst = Math.max(...values);
  const spread = worst - best;

  if (spread < 300) {
    sectorRatings[sectorNumber] = "excellent";
  } else if (spread < 900) {
    sectorRatings[sectorNumber] = "opportunity";
  } else {
    sectorRatings[sectorNumber] = "focus";
  }
}); 
  const idealLapMs = Object.values(bestSectors).reduce(
    (sum, value) => sum + value,
    0
  );

  const potentialGainMs =
    bestLap && idealLapMs ? bestLap.lap_time_ms - idealLapMs : null;

  return (
    <main className="page">
      <nav className="nav">
        <a href="/" className="logo">SimTrack Coach</a>

        <div>
          <a href="/garage">Garage</a>
          <a href="/upload">Upload</a>
          <a href="/tracks">Tracks</a>
        </div>
      </nav>

      <section className="trackHero">
        <div>
          <p className="eyebrow">
            {session.sim_name} · {track?.name || session.track_slug}
          </p>

          <h1>{session.session_name || "Telemetry session"}</h1>

          <p className="heroText">
            {session.car_name} · {laps.length} laps uploaded
          </p>

          <div className="chips">
            <span>Best lap {formatMs(bestLap?.lap_time_ms)}</span>
            <span>Ideal lap {formatMs(idealLapMs || null)}</span>
          </div>

          <div className="chips mutedChips">
            <span>
              Potential gain{" "}
              {potentialGainMs !== null
                ? `${(potentialGainMs / 1000).toFixed(3)}s`
                : "—"}
            </span>
            <span>{session.uploaded_file}</span>
          </div>
        </div>

        <div className="heroPanel">
          <h2>Track Map</h2>
          <TrackMap
              trackSlug={session.track_slug}
              sectorRatings={sectorRatings}
            />
        </div>
      </section>

      <section className="section detailGrid">
        <div className="roadmap">
          <p className="eyebrow">Lap table</p>
          <h2>Lap and sector breakdown</h2>

          <div className="cornerList">
            {laps.map((lap) => {
              const sectors = [...(lap.telemetry_sectors || [])].sort(
                (a, b) => a.sector_number - b.sector_number
              );

              return (
                <article className="cornerCard" key={lap.id}>
                  <h3>
                    Lap {lap.lap_number} · {formatMs(lap.lap_time_ms)}
                  </h3>

                  <div className="chips">
                    {sectors.map((sector) => {
                      const isBest =
                        bestSectors[sector.sector_number] ===
                        sector.sector_time_ms;

                      return (
                        <span key={sector.id}>
                          S{sector.sector_number}: {formatMs(sector.sector_time_ms)}
                          {isBest ? " ★" : ""}
                        </span>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="roadmap">
          <p className="eyebrow">Ideal lap</p>
          <h2>Best sectors</h2>

          <div className="cornerList">
            {Object.entries(bestSectors).map(([sectorNumber, sectorTime]) => (
              <div className="miniPanel" key={sectorNumber}>
                <strong>Sector {sectorNumber}</strong>
                <p>{formatMs(sectorTime)}</p>
              </div>
            ))}
          </div>

          <div className="miniPanel" style={{ marginTop: "18px" }}>
            <strong>Ideal lap</strong>
            <p>{formatMs(idealLapMs || null)}</p>
          </div>

          <div className="miniPanel" style={{ marginTop: "18px" }}>
            <strong>Potential gain</strong>
            <p>
              {potentialGainMs !== null
                ? `${(potentialGainMs / 1000).toFixed(3)} seconds`
                : "—"}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
