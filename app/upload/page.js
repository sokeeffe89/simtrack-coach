"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { tracks } from "../../lib/tracks";

function timeToMs(value) {
  if (!value) return null;

  const clean = String(value).trim();

  if (clean.includes(":")) {
    const parts = clean.split(":");
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    return Math.round((minutes * 60 + seconds) * 1000);
  }

  const seconds = Number(clean);
  if (!Number.isNaN(seconds)) {
    return Math.round(seconds * 1000);
  }

  return null;
}

export default function UploadPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [simName, setSimName] = useState("iRacing");
  const [trackSlug, setTrackSlug] = useState("spa");
  const [carName, setCarName] = useState("");
  const [sessionName, setSessionName] = useState("");

  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", data.user.id)
        .single();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setLoading(false);
    }

    loadUser();
  }, []);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);

    if (lines.length < 2) {
      setMessage("CSV looks empty.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const rows = lines.slice(1).map((line) => {
      const values = line.split(",");
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index]?.trim();
      });

      return row;
    });

    const lapTimeHeader =
      headers.find((h) => h.includes("lap") && h.includes("time")) ||
      headers.find((h) => h === "laptime") ||
      headers.find((h) => h === "time");

    const sector1Header = headers.find((h) => h.includes("sector") && h.includes("1"));
    const sector2Header = headers.find((h) => h.includes("sector") && h.includes("2"));
    const sector3Header = headers.find((h) => h.includes("sector") && h.includes("3"));

    const laps = rows
      .map((row, index) => ({
        lap_number: Number(row.lap || row.lap_number || index + 1),
        lap_time_ms: timeToMs(row[lapTimeHeader]),
        sectors: [
          timeToMs(row[sector1Header]),
          timeToMs(row[sector2Header]),
          timeToMs(row[sector3Header])
        ].filter(Boolean)
      }))
      .filter((lap) => lap.lap_time_ms);

    setPreview({
      fileName: file.name,
      totalRows: rows.length,
      detectedLaps: laps.length,
      laps
    });

    setMessage(`Detected ${laps.length} lap(s).`);
  }

  async function saveSession() {
    if (!profile) {
      setMessage("Profile not loaded.");
      return;
    }

    if (!preview || preview.laps.length === 0) {
      setMessage("Upload a valid CSV first.");
      return;
    }

    if (!carName.trim()) {
      setMessage("Enter a car name.");
      return;
    }

    setMessage("Saving telemetry session...");

    const { data: session, error: sessionError } = await supabase
      .from("telemetry_sessions")
      .insert([
        {
          profile_id: profile.id,
          sim_name: simName,
          track_slug: trackSlug,
          car_name: carName,
          session_name: sessionName || "Telemetry upload",
          uploaded_file: preview.fileName
        }
      ])
      .select()
      .single();

    if (sessionError) {
      setMessage(sessionError.message);
      return;
    }

    for (const lap of preview.laps) {
      const { data: savedLap, error: lapError } = await supabase
        .from("telemetry_laps")
        .insert([
          {
            session_id: session.id,
            lap_number: lap.lap_number,
            lap_time_ms: lap.lap_time_ms,
            is_valid: true
          }
        ])
        .select()
        .single();

      if (lapError) {
        setMessage(lapError.message);
        return;
      }

      for (let i = 0; i < lap.sectors.length; i++) {
        const { error: sectorError } = await supabase
          .from("telemetry_sectors")
          .insert([
            {
              lap_id: savedLap.id,
              sector_number: i + 1,
              sector_time_ms: lap.sectors[i]
            }
          ]);

        if (sectorError) {
          setMessage(sectorError.message);
          return;
        }
      }
    }

    setMessage("Telemetry session saved.");
  }

  if (loading) {
    return <main className="page"><p>Loading...</p></main>;
  }

  if (!user) {
    return (
      <main className="page">
        <nav className="nav">
          <a href="/" className="logo">SimTrack Coach</a>
          <div>
            <a href="/tracks">Tracks</a>
            <a href="/login">Login</a>
          </div>
        </nav>

        <section className="authPanel">
          <p className="eyebrow">Telemetry locked</p>
          <h1>Log in to upload telemetry.</h1>
          <a href="/login" className="button primary">Log in</a>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <nav className="nav">
        <a href="/" className="logo">SimTrack Coach</a>
        <div>
          <a href="/tracks">Tracks</a>
          <a href="/garage">Garage</a>
        </div>
      </nav>

      <section className="section">
        <p className="eyebrow">Telemetry upload</p>
        <h1>Upload a lap session.</h1>
        <p className="heroText">
          Start with a simple CSV containing lap time and optional sector columns.
        </p>
      </section>

      <section className="garageGrid">
        <div className="roadmap">
          <h2>Session details</h2>

          <div className="authForm">
            <label>Session name</label>
            <input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="Spa practice run" />

            <label>Sim</label>
            <select value={simName} onChange={(e) => setSimName(e.target.value)}>
              <option>iRacing</option>
              <option>ACC</option>
              <option>Assetto Corsa</option>
            </select>

            <label>Track</label>
            <select value={trackSlug} onChange={(e) => setTrackSlug(e.target.value)}>
              {tracks.map((track) => (
                <option key={track.slug} value={track.slug}>{track.name}</option>
              ))}
            </select>

            <label>Car</label>
            <input value={carName} onChange={(e) => setCarName(e.target.value)} placeholder="Ferrari 296 GT3" />

            <label>CSV file</label>
            <input type="file" accept=".csv" onChange={handleFile} />

            <button className="button primary" type="button" onClick={saveSession}>
              Save telemetry session
            </button>
          </div>

          {message && <p className="formMessage">{message}</p>}
        </div>

        <div className="roadmap">
          <h2>Detected data</h2>

          {!preview && (
            <p className="heroText">
              No CSV uploaded yet.
            </p>
          )}

          {preview && (
            <>
              <div className="miniPanel">
                <strong>{preview.fileName}</strong>
                <p>Rows: {preview.totalRows}</p>
                <p>Laps detected: {preview.detectedLaps}</p>
              </div>

              <div className="cornerList">
                {preview.laps.slice(0, 8).map((lap) => (
                  <div className="cornerCard" key={lap.lap_number}>
                    <h3>Lap {lap.lap_number}</h3>
                    <p><strong>Lap time:</strong> {(lap.lap_time_ms / 1000).toFixed(3)}s</p>
                    <p><strong>Sectors:</strong> {lap.sectors.length || "None detected"}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
