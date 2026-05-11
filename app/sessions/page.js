import { supabase } from "../../lib/supabase";

function msToLap(ms) {
  if (!ms) return "--";

  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");

  return `${minutes}:${seconds}`;
}

export default async function SessionsPage() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="page">
        <nav className="nav">
          <a href="/" className="logo">SimTrack Coach</a>
        </nav>

        <section className="authPanel">
          <p className="eyebrow">Telemetry library</p>
          <h1>Log in to view your sessions.</h1>
          <a href="/login" className="button primary">Log in</a>
        </section>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  const { data: sessions } = await supabase
    .from("telemetry_sessions")
    .select(`
      *,
      telemetry_laps(
        *,
        telemetry_sectors(*)
      )
    `)
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <main className="page">
      <nav className="nav">
        <a href="/" className="logo">SimTrack Coach</a>
        <div>
          <a href="/tracks">Tracks</a>
          <a href="/garage">Garage</a>
          <a href="/upload">Upload</a>
        </div>
      </nav>

      <section className="section">
        <p className="eyebrow">Telemetry library</p>
        <h1>My Sessions</h1>
        <p className="heroText">
          Review your telemetry history and revisit coaching sessions.
        </p>
      </section>

      <section className="cornerList">
        {(sessions || []).map((session) => {
          const laps = session.telemetry_laps || [];

          const bestLap = [...laps]
            .filter((lap) => lap.lap_time_ms)
            .sort((a, b) => a.lap_time_ms - b.lap_time_ms)[0];

          const bestSectors = {};

          laps.forEach((lap) => {
            (lap.telemetry_sectors || []).forEach((sector) => {
              if (
                !bestSectors[sector.sector_number] ||
                sector.sector_time_ms < bestSectors[sector.sector_number]
              ) {
                bestSectors[sector.sector_number] = sector.sector_time_ms;
              }
            });
          });

          const idealLapMs = Object.values(bestSectors).reduce(
            (sum, sectorTime) => sum + sectorTime,
            0
          );

          const gain =
            bestLap && idealLapMs
              ? bestLap.lap_time_ms - idealLapMs
              : null;

          return (
            <div className="cornerCard" key={session.id}>
              <h3>{session.session_name || "Telemetry Session"}</h3>

              <p><strong>Track:</strong> {session.track_slug}</p>
              <p><strong>Car:</strong> {session.car_name}</p>
              <p><strong>Sim:</strong> {session.sim_name}</p>
              <p><strong>Best lap:</strong> {msToLap(bestLap?.lap_time_ms)}</p>
              <p><strong>Ideal lap:</strong> {msToLap(idealLapMs)}</p>
              <p><strong>Potential gain:</strong> {gain ? `${(gain / 1000).toFixed(3)}s` : "--"}</p>

              <a
                href={`/telemetry/${session.id}`}
                className="button primary"
                style={{ marginTop: "12px", display: "inline-block" }}
              >
                Open session
              </a>
            </div>
          );
        })}
      </section>
    </main>
  );
}
