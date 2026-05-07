"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function GaragePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [carName, setCarName] = useState("");
  const [carClass, setCarClass] = useState("GT3");
  const [sim, setSim] = useState("iRacing");

  const [cars, setCars] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      await loadCars(data.user.id);

      setLoading(false);
    }

    loadUser();
  }, []);

  async function loadCars(userId) {
    const { data, error } = await supabase
      .from("garage_cars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCars(data);
    }
  }

  async function saveCar(e) {
    e.preventDefault();

    if (!carName.trim()) {
      setMessage("Please enter a car name.");
      return;
    }

    setMessage("Saving car...");

    const { error } = await supabase
      .from("garage_cars")
      .insert([
        {
          user_id: user.id,
          car_name: carName,
          class_name: carClass,
          sim
        }
      ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCarName("");
    setMessage("Car saved.");

    await loadCars(user.id);
  }

  async function deleteCar(id) {
    const { error } = await supabase
      .from("garage_cars")
      .delete()
      .eq("id", id);

    if (!error) {
      await loadCars(user.id);
    }
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
        <nav className="nav">
          <a href="/" className="logo">SimTrack Coach</a>

          <div>
            <a href="/tracks">Tracks</a>
            <a href="/login">Login</a>
          </div>
        </nav>

        <section className="authPanel">
          <p className="eyebrow">Garage locked</p>

          <h1>Log in to access your garage.</h1>

          <p className="heroText">
            Save cars, telemetry sessions, favourite tracks, and AI coaching history.
          </p>

          <a href="/login" className="button primary">
            Log in
          </a>
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

          <button onClick={logout} className="navButton">
            Log out
          </button>
        </div>
      </nav>

      <section className="section">
        <p className="eyebrow">Driver garage</p>

        <h1>Your garage</h1>

        <p className="heroText">
          Logged in as {user.email}
        </p>
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

            <select
              value={carClass}
              onChange={(e) => setCarClass(e.target.value)}
            >
              <option>GT3</option>
              <option>GT4</option>
              <option>F4</option>
              <option>LMP2</option>
            </select>

            <label>Sim</label>

            <select
              value={sim}
              onChange={(e) => setSim(e.target.value)}
            >
              <option>iRacing</option>
              <option>ACC</option>
              <option>Assetto Corsa</option>
            </select>

            <button className="button primary" type="submit">
              Save car
            </button>
          </form>

          {message && (
            <p className="formMessage">{message}</p>
          )}
        </div>

        <div className="roadmap">
          <h2>Saved cars</h2>

          {cars.length === 0 && (
            <p className="heroText">
              No saved cars yet.
            </p>
          )}

          <div className="cornerList">
            {cars.map((car) => (
              <div className="cornerCard" key={car.id}>
                <h3>{car.car_name}</h3>

                <p>
                  <strong>Class:</strong> {car.class_name}
                </p>

                <p>
                  <strong>Sim:</strong> {car.sim}
                </p>

                <button
                  onClick={() => deleteCar(car.id)}
                  className="textButton"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
