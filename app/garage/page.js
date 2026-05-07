"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function GaragePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carName, setCarName] = useState("");
  const [carClass, setCarClass] = useState("GT3");

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }

    loadUser();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <main className="page"><p>Loading garage...</p></main>;
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
          <p className="eyebrow">Garage locked</p>
          <h1>Log in to view your garage.</h1>
          <p className="heroText">Your garage will store cars, favourite tracks, telemetry sessions, and future AI coaching history.</p>
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
          <form className="authForm" onSubmit={(e) => e.preventDefault()}>
            <label>Car name</label>
            <input value={carName} onChange={(e) => setCarName(e.target.value)} placeholder="Ferrari 296 GT3" />

            <label>Class</label>
            <select value={carClass} onChange={(e) => setCarClass(e.target.value)}>
              <option>GT3</option>
              <option>GT4</option>
              <option>F4</option>
              <option>LMP2</option>
            </select>

            <button className="button primary" type="submit">Save car soon</button>
          </form>
        </div>

        <div className="roadmap">
          <h2>Next garage features</h2>
          <div className="miniPanel">
            <strong>Saved cars</strong>
            <p>Store cars by sim and class.</p>
          </div>
          <div className="miniPanel">
            <strong>Telemetry sessions</strong>
            <p>Upload CSV laps and generate coaching notes.</p>
          </div>
          <div className="miniPanel">
            <strong>Favourite tracks</strong>
            <p>Build your personal practice plan.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
