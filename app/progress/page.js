"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function msToLap(ms) {
  if (!ms) return "--";

  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");

  return `${minutes}:${seconds}`;
}

function getBestLap(laps = []) {
  return [...laps]
    .filter((lap) => lap.lap_time_ms)
    .sort((a, b) => a.lap_time_ms - b.lap_time_ms)[0];
}

function getIdealLap(laps = []) {
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

  return Object.values(bestSectors).reduce((sum, value) => sum + value, 0);
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProgress() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", data.user.id)
        .single();

      if (profileError) {
        setMessage(profileError.message);
        setLoading(false);
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from("telemetry_sessions")
        .select(`
          *,
          telemetry_laps(
            *,
            telemetry_sectors(*)
          )
        `)
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: true });

      if (sessionError) {
        setMessage(sessionError.message);
        setLoading(false);
        return;
      }

      setSessions(sessionData || []);
      setLoading(false);
    }

    loadProgress();
  }, []);

  const stats = useMemo(() => {
    const rows = sessions.map((session) => {
      const laps = session.telemetry_laps || [];
      const bestLap = getBestLap(laps);
      const idealLapMs = getIdealLap(laps);
      const gain =
        bestLap && idealLapMs ? bestLap.lap_time_ms - idealLapMs : null;

      return {
        id: session.id,
        sessionName: session.session_name || "Telemetry Session",
        track: session.track_slug,
        car: session.car_name,
        sim: session.sim_name,
        date: new Date(session.created_at).toLocaleDateString(),
        bestLapMs: bestLap?.lap_time_ms || null,
        idealLapMs: idealLapMs || null,
        gainMs: gain,
        lapCount: laps.length
      };
    });

    const fastest = [...rows]
      .filter((row) => row.bestLapMs)
      .sort((a, b) => a.bestLapMs - b.bestLapMs)[0];

    const totalLaps = rows.reduce((sum, row) => sum + row.lapCount, 0);

    const gains = rows
      .map((row) => row.gainMs)
      .filter((gain) => gain !== null && gain >= 0);

    const avgGain =
      gains.length > 0
        ? gains.reduce((sum, gain) => sum + gain, 0) / gains.length
        : null;

    const byTrack = {};

    rows.forEach((row) => {
      if (!byTrack[row.track]) {
        byTrack[row.track] = {
          track: row.track,
          sessions: 0,
          bestLapMs: null,
          totalGain: 0,
          gainCount: 0
        };
      }

      byTrack[row.track].sessions += 1;

      if (
        row.bestLapMs &&
        (!byTrack[row.track].bestLapMs ||
          row.bestLapMs < byTrack[row.track].bestLapMs)
      ) {
        byTrack[row.track].bestLapMs = row.bestLapMs;
      }

      if (row.gainMs !== null) {
        byTrack[row.track].totalGain += row.gainMs;
        byTrack[row.track].gainCount += 1;
      }
    });

    return {
      rows,
      fastest,
      totalLaps,
      avgGain,
      byTrack: Object.values(byTrack)
    };
  }, [sessions]);

  const chartData = stats.rows.map((row, index) => ({
    name: `${index + 1}`,
    bestLap: row.bestLapMs ? row.bestLapMs / 1000 : null,
    idealLap: row.idealLapMs ? row.idealLapMs / 1000 : null,
    session: row.sessionName
  }));

  if (loading) {
    return <main className="page"><p>Loading progress...</p></main>;
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
          <p className="eyebrow">Progress dashboard</p>
          <h1>Log in to view your progress.</h1>
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
          <a href="/sessions">Sessions</a>
          <a href="/upload">Upload</a>
        </div>
      </nav>

      <section className="section">
        <p className="eyebrow">Driver progress</p>
        <h1>Progress Dashboard</h1>
        <p className="heroText">
          Track your best laps, ideal laps, and available time gain across uploaded sessions.
        </p>
      </section>

      {message && <p className="formMessage">{message}</p>}

      <section className="stats">
        <div>
          <span>Total sessions</span>
          <strong>{sessions.length}</strong>
        </div>
        <div>
          <span>Total laps</span>
          <strong>{stats.totalLaps}</strong>
        </div>
        <div>
          <span>Fastest lap</span>
          <strong>{msToLap(stats.fastest?.bestLapMs)}</strong>
        </div>
      </section>

      <section className="section roadmap">
        <div className="rowHeader">
          <div>
            <p className="eyebrow">Trend</p>
            <h2>Best lap vs ideal lap</h2>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="heroText">Upload telemetry sessions to build your progress chart.</p>
        ) : (
          <div className="traceChartShell">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 167, 183, 0.18)" />
                <XAxis dataKey="name" tick={{ fill: "#93a7b7", fontSize: 12 }} />
                <YAxis tick={{ fill: "#93a7b7", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#101a24",
                    border: "1px solid #243748",
                    borderRadius: "12px",
                    color: "#eaf2f8"
                  }}
                />
                <Line type="monotone" dataKey="bestLap" stroke="#43d7c6" strokeWidth={2} name="Best lap seconds" />
                <Line type="monotone" dataKey="idealLap" stroke="#32d583" strokeWidth={2} name="Ideal lap seconds" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="section roadmap">
        <p className="eyebrow">Track breakdown</p>
        <h2>Progress by track</h2>

        <div className="cornerList">
          {stats.byTrack.map((track) => {
            const avgTrackGain =
              track.gainCount > 0 ? track.totalGain / track.gainCount : null;

            return (
              <div className="cornerCard" key={track.track}>
                <h3>{track.track}</h3>
                <p><strong>Sessions:</strong> {track.sessions}</p>
                <p><strong>Best lap:</strong> {msToLap(track.bestLapMs)}</p>
                <p>
                  <strong>Avg potential gain:</strong>{" "}
                  {avgTrackGain ? `${(avgTrackGain / 1000).toFixed(3)}s` : "--"}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
