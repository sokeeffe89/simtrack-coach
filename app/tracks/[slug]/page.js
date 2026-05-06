import { getTrackBySlug, tracks } from "../../../lib/tracks";

export function generateStaticParams() {
  return tracks.map((track) => ({
    slug: track.slug
  }));
}

export function generateMetadata({ params }) {
  const track = getTrackBySlug(params.slug);

  return {
    title: track ? `${track.name} | SimTrack Coach` : "Track | SimTrack Coach",
    description: track ? track.summary : "Sim racing track guide"
  };
}

export default function TrackPage({ params }) {
  const track = getTrackBySlug(params.slug);

  if (!track) {
    return (
      <main className="page">
        <a href="/" className="button secondary">← Back home</a>
        <section className="section">
          <h1>Track not found</h1>
          <p className="heroText">This track guide does not exist yet.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <a href="/" className="button secondary">← Back home</a>

      <section className="trackHero">
        <div>
          <p className="eyebrow">{track.country} · {track.length}</p>
          <h1>{track.name}</h1>
          <p className="heroText">{track.summary}</p>

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
        </div>

        <div className="heroPanel">
          <h2>AI Coaching Focus</h2>
          <p className="cornerTitle">{track.focus}</p>
          <p>{track.aiTip}</p>
        </div>
      </section>

      <section className="section detailGrid">
        <div className="roadmap">
          <p className="eyebrow">Corner guide</p>
          <h2>How to drive it</h2>

          <div className="cornerList">
            {track.corners.map((corner) => (
              <article className="cornerCard" key={corner.name}>
                <h3>{corner.name}</h3>
                <p><strong>Do:</strong> {corner.guide}</p>
                <p><strong>Avoid:</strong> {corner.mistake}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="roadmap">
          <p className="eyebrow">Setup direction</p>
          <h2>Car setup focus</h2>
          <p className="heroText">{track.setup}</p>

          <div className="miniPanel">
            <strong>Best lap-time gains</strong>
            <p>
              Focus first on braking consistency, clean corner exits, and reducing steering scrub before chasing aggressive setup changes.
            </p>
          </div>

          <div className="miniPanel">
            <strong>Next feature</strong>
            <p>
              This page will later compare your telemetry against target traces and generate corner-specific AI coaching.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
