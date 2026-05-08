import { trackMaps } from "../lib/trackMaps";

export default function TrackMap({ trackSlug, bestSectors = {} }) {
  const map = trackMaps[trackSlug];

  if (!map) {
    return (
      <div className="trackMapShell">
        <p className="heroText">Track map not available yet.</p>
      </div>
    );
  }

  return (
    <div className="trackMapShell">
      <svg viewBox={map.viewBox} className="trackMapSvg" role="img">
        <title>Track sector map</title>

        {map.sectors.map((sector) => {
          const isBest = Boolean(bestSectors[sector.sector]);

          return (
            <path
              key={sector.sector}
              d={sector.path}
              className={isBest ? "trackSector trackSectorBest" : "trackSector"}
            />
          );
        })}

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
        <span><i className="legendBest" /> Best sector in uploaded data</span>
        <span><i className="legendBase" /> Sector route</span>
      </div>
    </div>
  );
}
