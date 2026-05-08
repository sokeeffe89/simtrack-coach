import { trackMaps } from "../lib/trackMaps";

export default function TrackMap({ trackSlug, sectorRatings = {} }) {
  const map = trackMaps[trackSlug];

  if (!map) {
    return (
      <div className="trackMapShell">
        <p className="heroText">Track map not available yet.</p>
      </div>
    );
  }

  function getClass(sectorNumber) {
    const rating = sectorRatings[sectorNumber];

    if (rating === "excellent") return "trackSector trackSectorExcellent";
    if (rating === "opportunity") return "trackSector trackSectorOpportunity";
    if (rating === "focus") return "trackSector trackSectorFocus";

    return "trackSector";
  }

  return (
    <div className="trackMapShell">
      <svg viewBox={map.viewBox} className="trackMapSvg" role="img">
        <title>Track sector map</title>

        {map.sectors.map((sector) => (
          <path
            key={sector.sector}
            d={sector.path}
            className={getClass(sector.sector)}
          />
        ))}

        {map.sectors.map((sector, index) => (
          <text
            key={sector.label}
            x={index === 0 ? 120 : index === 1 ? 310 : 300}
            y={index === 0 ? 210 : index === 1 ? 95 : 255}
            className="trackMapLabel"
          >
            S{sector.sector}
          </text>
        ))}
      </svg>

      <div className="trackMapLegend">
        <span><i className="legendExcellent" /> Excellent</span>
        <span><i className="legendOpportunity" /> Opportunity</span>
        <span><i className="legendFocus" /> Focus area</span>
      </div>
    </div>
  );
}
