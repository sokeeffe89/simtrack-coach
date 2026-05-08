export default function TrackMap({ trackSlug }) {
  const supportedTracks = ["spa"];

  if (!supportedTracks.includes(trackSlug)) {
    return (
      <div className="trackMapShell">
        <p className="heroText">Track map asset not available yet.</p>
      </div>
    );
  }

  return (
    <div className="trackMapShell">
      <div className="realTrackMap">
        <img
          src={`/tracks/${trackSlug}.svg`}
          alt={`${trackSlug} circuit map`}
          className="realTrackMapImage"
        />
      </div>
    </div>
  );
}
