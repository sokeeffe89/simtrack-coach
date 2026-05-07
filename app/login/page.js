"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("Working...");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(mode === "login" ? "Logged in. Redirecting..." : "Account created. Check your email if confirmation is enabled.");

    if (mode === "login") {
      window.location.href = "/garage";
    }
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

      <section className="authPanel">
        <p className="eyebrow">Driver access</p>
        <h1>{mode === "login" ? "Log in" : "Create account"}</h1>
        <p className="heroText">Save your garage, telemetry sessions, favourite tracks, and coaching progress.</p>

        <form onSubmit={handleSubmit} className="authForm">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          <button className="button primary" type="submit">
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        {message && <p className="formMessage">{message}</p>}

        <button className="textButton" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}
