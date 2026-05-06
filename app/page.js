import { tracks } from "../lib/tracks";

export default function Home() {
  const featuredTracks = tracks.slice(0, 4);

  return (
    <main className="page">
      <nav className="nav">
        <a href="/" className="logo">SimTrack Coach</a>
        <div>
          <a href="/tracks">Tracks</a>
          <a href="#roadmap">Roadmap</a>
        </div>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">Telemetry coaching for sim racers</p>
          <h1>Drive every track faster.</h1>
          <p className="heroText">
            Learn racing tracks, understand braking zones, and get car-class-specific coaching for iRacing, ACC, and Assetto Corsa.
          </p>
          <div className="actions">
            <a href="/tracks" className="button primary">Explore Track Library</a>
            <a href="#roadmap" className="button secondary">View Roadmap</a>
          </div>
        </div>

        <div className="heroPanel">
          <h2>AI Corner Coach</h2>
          <p className="cornerTitle">Spa — Eau Rouge / Raidillon</p>
          <ul>
            <li>Brake or lift lightly before compression.</li>
            <li>Keep one clean steering input.</li>
            <li>Commit to throttle before the crest.</li>
          </ul>
        </div>
      </section>

      <section className="stats">
        <div>
          <span>Launch sims</span>
          <strong>iRacing · ACC · AC</strong>
        </div>
        <div>
          <span>Coaching depth</span>
          <strong>Class-based first</strong>
        </div>
        <div>
          <span>Telemetry</span>
          <strong>CSV upload next</strong>
        </div>
      </section>

      <section id="tracks" className="section">
        <div className="sectionHeader rowHeader">
          <div>
            <p className="eyebrow">Featured tracks</p>
            <h2>Popular starter guides</h2>
          </div>
          <a href="/tracks" className="button secondary">View all tracks</a>
        </div>

        <div className="trackGrid">
          {featuredTracks.map((track) => (
            <a className="trackCard" key={track.slug} href={`/tracks/${track.slug}`}>
              <div className="trackTop">
                <h3>{track.name}</h3>
                <span>{track.country}</span>
              </div>

              <p className="focus">{track.focus}</p>

              <div className="chips">
                {track.sims.map((sim) => (
                  <span key={sim}>{sim}</span>
                ))}
              </div>

              <div className="chips mutedChips">
                {track.classes.map((carClass) => (
                  <span key={carClass}>{carClass}</span>
                ))}
              </div>

              <p className="tip">{track.aiTip}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="roadmap" className="section roadmap">
        <div>
          <p className="eyebrow">Product roadmap</p>
          <h2>Next build phases</h2>
        </div>

        <div className="roadmapGrid">
          <div>
            <strong>Phase 1</strong>
            <p>Track guides, car-class coaching, track pages, and Supabase data.</p>
          </div>
          <div>
            <strong>Phase 2</strong>
            <p>Login, garage, saved favourites, public leaderboards.</p>
          </div>
          <div>
            <strong>Phase 3</strong>
            <p>Telemetry upload, lap delta analysis, AI corner feedback.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
