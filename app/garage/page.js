# Replace `app/garage/page.js` with this

```js
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { tracks } from "../../lib/tracks";

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

    if (data) {
      setCars(data);
    }
  }

  async function loadFavourites(profileId) {
    const { data } = await supabase
      .from("favourite_tracks")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (data) {
      setFavourites(data);
    }
  }

  async function saveCar(e) {
    e.preventDefault();

    if (!profile) return;

    const { error } = await supabase
      .from("garage_cars")
      .insert([
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
    await supabase
      .from("garage_cars")
      .delete()
      .eq("id", id);

    await loadCars(profile.id);
  }

  async function addFavouriteTrack() {
    if (!profile) return;

    const { error } = await supabase
      .from("favourite_tracks")
      .insert([
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
    await supabase
      .from("favourite_tracks")
      .delete()
      .eq("id", id);

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
    </main>
  );
}
