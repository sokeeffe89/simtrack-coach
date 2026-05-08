function getSectorColour(rating) {
  if (rating === "excellent") return "trackSectorExcellent";
  if (rating === "opportunity") return "trackSectorOpportunity";
  if (rating === "focus") return "trackSectorFocus";
  return "";
}

export default function TrackMap({ trackSlug, sectorRatings = {} }) {
  if (trackSlug !== "spa") {
    return (
      <div className="trackMapShell">
        <p className="heroText">Track map asset not available yet.</p>
      </div>
    );
  }

  return (
    <div className="trackMapShell">
      <div className="realTrackMap">
        <svg
          viewBox="0 0 800 500"
          className="realTrackMapImage"
          role="img"
          aria-label="Spa-Francorchamps sector map"
        >
          <path
            d="M145 370 C95 350 85 305 125 275 C165 245 210 270 245 230 C285 185 335 135 395 85"
            className={`trackSectorInline ${getSectorColour(sectorRatings[1])}`}
          />

          <path
            d="M395 85 C430 55 485 65 520 100 C555 135 525 170 560 205 C595 240 680 215 705 270"
            className={`trackSectorInline ${getSectorColour(sectorRatings[2])}`}
          />

          <path
            d="M705 270 C735 335 665 385 575 405 C455 430 285 420 145 370"
            className={`trackSectorInline ${getSectorColour(sectorRatings[3])}`}
          />

          <text x="120" y="385" className="trackMapLabel">S1</text>
          <text x="540" y="115" className="trackMapLabel">S2</text>
          <text x="555" y="420" className="trackMapLabel">S3</text>
        </svg>
      </div>

      <div className="trackMapLegend">
        <span><i className="legendExcellent" /> Excellent</span>
        <span><i className="legendOpportunity" /> Opportunity</span>
        <span><i className="legendFocus" /> Focus area</span>
      </div>
    </div>
  );
}
