"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { tracks } from "../../lib/tracks";

function formatMs(ms) {
  if (!ms && ms !== 0) return "—";

  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");

  return `${minutes}:${seconds}`;
}

export default function GaragePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [carName, setCarName] = useState("");
  const [carClass, setCarClass] = useState("GT3");
  const [sim, setSim] = useState("iRacing");

  const [cars, setCars] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("spa");
  const [telemetrySessions, setTelemetrySessions] = useState([]);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", data.user.id)
        .single();

      if (profileError) {
        setMessage(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      await loadCars(profileData.id);
      await loadFavourites(profileData.id);
      await loadTelemetrySessions(profileData.id);

      setLoading(false);
    }

    loadUser();
  }, []);

  async function loadCars(profileId) {
    const { data } = await supabase
      .from("garage_cars")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (data) setCars(data);
  }

  async function loadFavourites(profileId) {
    const { data } = await supabase
      .from("favourite_tracks")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (data) setFavourites(data);
  }

  async function loadTelemetrySessions(profileId) {
    const { data: sessions, error } = await supabase
      .from("telemetry_sessions")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error || !sessions) {
      setTelemetrySessions([]);
      return;
    }

    const enriched = [];

    for (const session of sessions) {
      const { data: laps } = await supabase
        .from("telemetry_laps")
        .select("*, telemetry_sectors(*)")
        .eq("session_id", session.id)
        .order("lap_number", { ascending: true });

      const validLaps = laps || [];
      const bestLap = validLaps.reduce((best, lap) => {
        if (!best || lap.lap_time_ms < best.lap_time_ms) return lap;
        return best;
      }, null);

      const bestSectors = {};

      validLaps.forEach((lap) => {
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

      const idealLapMs = Object.values(bestSectors).reduce(
        (sum, value) => sum + value,
        0
      );

      const potentialGainMs =
        bestLap && idealLapMs ? bestLap.lap_time_ms - idealLapMs : null;

      enriched.push({
        ...session,
        laps: validLaps,
        bestLap,
        idealLapMs: idealLapMs || null,
        potentialGainMs
      });
    }

    setTelemetrySessions(enriched);
  }

  async function saveCar(e) {
    e.preventDefault();

    if (!profile) return;

    const { error } = await supabase.from("garage_cars").insert([
      {
        profile_id: profile.id,
        car_name: carName,
        class_name: carClass,
        sim_name: sim
      }
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCarName("");
    setMessage("Car saved.");

    await loadCars(profile.id);
  }

  async function deleteCar(id) {
    await supabase.from("garage_cars").delete().eq("id", id);
    await loadCars(profile.id);
  }

  async function addFavouriteTrack() {
    if (!profile) return;

    const { error } = await supabase.from("favourite_tracks").insert([
      {
        profile_id: profile.id,
        track_slug: selectedTrack
      }
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Favourite track added.");
    await loadFavourites(profile.id);
  }

  async function removeFavourite(id) {
    await supabase.from("favourite_tracks").delete().eq("id", id);
    await loadFavourites(profile.id);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="page">
        <p>Loading garage...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page">
        <p>Please log in.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <nav className="nav">
        <a href="/" className="logo">SimTrack Coach</a>

        <div>
          <a href="/tracks">Tracks</a>
          <a href="/upload">Upload</a>
          <button onClick={logout} className="navButton">Log out</button>
        </div>
      </nav>

      <section className="section">
        <p className="eyebrow">Driver garage</p>
        <h1>Your garage</h1>
        <p className="heroText">Logged in as {user.email}</p>
      </section>

      <section className="garageGrid">
        <div className="roadmap">
          <h2>Add car</h2>

          <form className="authForm" onSubmit={saveCar}>
            <label>Car name</label>
            <input
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              placeholder="Ferrari 296 GT3"
            />

            <label>Class</label>
            <select value={carClass} onChange={(e) => setCarClass(e.target.value)}>
              <option>GT3</option>
              <option>GT4</option>
              <option>F4</option>
              <option>LMP2</option>
            </select>

            <label>Sim</label>
            <select value={sim} onChange={(e) => setSim(e.target.value)}>
              <option>iRacing</option>
              <option>ACC</option>
              <option>Assetto Corsa</option>
            </select>

            <button className="button primary" type="submit">
              Save car
            </button>
          </form>

          <h2 style={{ marginTop: "40px" }}>Favourite tracks</h2>

          <div className="authForm">
            <label>Select track</label>

            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              {tracks.map((track) => (
                <option key={track.slug} value={track.slug}>
                  {track.name}
                </option>
              ))}
            </select>

            <button
              className="button primary"
              type="button"
              onClick={addFavouriteTrack}
            >
              Add favourite
            </button>
          </div>

          {message && <p className="formMessage">{message}</p>}
        </div>

        <div className="roadmap">
          <h2>Saved cars</h2>

          {cars.length === 0 && (
            <p className="heroText">No saved cars yet.</p>
          )}

          <div className="cornerList">
            {cars.map((car) => (
              <div className="cornerCard" key={car.id}>
                <h3>{car.car_name}</h3>
                <p><strong>Class:</strong> {car.class_name}</p>
                <p><strong>Sim:</strong> {car.sim_name}</p>

                <button
                  onClick={() => deleteCar(car.id)}
                  className="textButton"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "40px" }}>Favourite tracks</h2>

          {favourites.length === 0 && (
            <p className="heroText">No favourite tracks yet.</p>
          )}

          <div className="cornerList">
            {favourites.map((fav) => {
              const track = tracks.find((t) => t.slug === fav.track_slug);

              return (
                <div className="cornerCard" key={fav.id}>
                  <h3>{track?.name || fav.track_slug}</h3>

                  <button
                    onClick={() => removeFavourite(fav.id)}
                    className="textButton"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section roadmap">
        <div className="rowHeader">
          <div>
            <p className="eyebrow">Telemetry dashboard</p>
            <h2>Your uploaded sessions</h2>
          </div>

          <a href="/upload" className="button secondary">
            Upload telemetry
          </a>
        </div>

        {telemetrySessions.length === 0 && (
          <p className="heroText">No telemetry sessions uploaded yet.</p>
        )}

        <div className="trackGrid">
          {telemetrySessions.map((session) => {
            const track = tracks.find((t) => t.slug === session.track_slug);

            return (
              <article className="trackCard" key={session.id}>
                <div className="trackTop">
                  <h3>{session.session_name || "Telemetry session"}</h3>
                  <span>{session.sim_name}</span>
                </div>

                <p className="focus">
                  {track?.name || session.track_slug} · {session.car_name}
                </p>

                <div className="chips">
                  <span>{session.laps.length} laps</span>
                  <span>Best {formatMs(session.bestLap?.lap_time_ms)}</span>
                </div>

                <div className="chips mutedChips">
                  <span>Ideal {formatMs(session.idealLapMs)}</span>
                  <span>
                    Gain{" "}
                    {session.potentialGainMs !== null
                      ? `${(session.potentialGainMs / 1000).toFixed(3)}s`
                      : "—"}
                  </span>
                </div>

                <p className="tip">
                  Best actual lap compared against the theoretical ideal lap
                  built from your best uploaded sector times.
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
