function getSectorColour(rating) {
  if (rating === "excellent") return "#32d583";
  if (rating === "opportunity") return "#f5a524";
  if (rating === "focus") return "#f04438";
  return "#93a7b7";
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
          viewBox="0 0 1000 700"
          className="realTrackMapImage"
          role="img"
          aria-label="Spa-Francorchamps sector map"
        >
          <path
            d="M175 540 C120 515 108 465 150 430 C198 390 255 425 300 370 C360 295 430 225 515 150"
            fill="none"
            stroke={getSectorColour(sectorRatings[1])}
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M515 150 C565 110 645 120 690 165 C735 210 695 255 740 300 C790 350 900 315 935 390"
            fill="none"
            stroke={getSectorColour(sectorRatings[2])}
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M935 390 C975 485 880 555 760 585 C590 625 355 610 175 540"
            fill="none"
            stroke={getSectorColour(sectorRatings[3])}
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <text x="255" y="430" className="trackMapLabel">S1</text>
          <text x="760" y="250" className="trackMapLabel">S2</text>
          <text x="680" y="620" className="trackMapLabel">S3</text>
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
