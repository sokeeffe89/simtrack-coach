import { tracks } from "../../lib/tracks";

export const metadata = {
  title: "Track Library | SimTrack Coach",
  description: "Browse sim racing track guides for iRacing, ACC, and Assetto Corsa."
};

export default function TracksPage() {
  return (
    <main className="page">
      <nav className="nav">
        <a href="/" className="logo">SimTrack Coach</a>
        <div>
          <a href="/tracks">Tracks</a>
          <a href="/">Home</a>
        </div>
      </nav>

      <section className="section libraryHero">
        <p className="eyebrow">Track library</p>
        <h1>Find your next lap time.</h1>
        <p className="heroText">
          Browse starter guides for the most useful sim racing circuits. Each guide includes corner technique, setup direction, and class-based coaching focus.
        </p>
      </section>

      <section className="filterPanel">
        <div>
          <span>Total tracks</span>
          <strong>{tracks.length}</strong>
        </div>
        <div>
          <span>Supported sims</span>
          <strong>iRacing · ACC · AC</strong>
        </div>
        <div>
          <span>Coaching level</span>
          <strong>Track + class</strong>
        </div>
      </section>

      <section className="trackGrid sectionCompact">
        {tracks.map((track) => (
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

            <p className="tip">{track.summary}</p>
          </a>
        ))}
      </section>
    </main>
  );
}
