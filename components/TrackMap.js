export default function TrackMap({ trackSlug, sectorRatings = {} }) {
  const hasSvgAsset = trackSlug === "spa";

  if (!hasSvgAsset) {
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

        <div className="sectorOverlay sectorOne">
          S1 · {sectorRatings[1] || "pending"}
        </div>

        <div className="sectorOverlay sectorTwo">
          S2 · {sectorRatings[2] || "pending"}
        </div>

        <div className="sectorOverlay sectorThree">
          S3 · {sectorRatings[3] || "pending"}
        </div>
      </div>

      <div className="trackMapLegend">
        <span><i className="legendExcellent" /> Excellent</span>
        <span><i className="legendOpportunity" /> Opportunity</span>
        <span><i className="legendFocus" /> Focus area</span>
      </div>
    </div>
  );
}
