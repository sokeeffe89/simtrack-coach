"use client";

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getSpaLocation(lapPercent) {
  const pct = Number(lapPercent || 0);

  if (pct < 15) return "La Source / Eau Rouge";
  if (pct < 30) return "Raidillon / Kemmel";
  if (pct < 45) return "Les Combes / Bruxelles";
  if (pct < 65) return "Pouhon / Fagnes";
  if (pct < 85) return "Blanchimont";
  return "Bus Stop";
}

export default function CoachingInsights({
  bestLapPoints = [],
  comparisonLapPoints = [],
  trackSlug = "spa"
}) {
  if (!bestLapPoints.length || !comparisonLapPoints.length) {
    return <p className="heroText">Not enough telemetry data for coaching insights yet.</p>;
  }

  const chunks = [];

  for (let i = 0; i < bestLapPoints.length; i += 3) {
    const bestChunk = bestLapPoints.slice(i, i + 3);
    const comparisonChunk = comparisonLapPoints.slice(i, i + 3);

    if (!bestChunk.length || !comparisonChunk.length) continue;

    chunks.push({
      lapPercent: bestChunk[0].lap_percent,
      bestSpeed: average(bestChunk.map((p) => p.speed_kph || 0)),
      comparisonSpeed: average(comparisonChunk.map((p) => p.speed_kph || 0)),
      bestBrake: average(bestChunk.map((p) => p.brake || 0)),
      comparisonBrake: average(comparisonChunk.map((p) => p.brake || 0)),
      bestThrottle: average(bestChunk.map((p) => p.throttle || 0)),
      comparisonThrottle: average(comparisonChunk.map((p) => p.throttle || 0))
    });
  }

  let biggestSpeedLoss = null;
  let biggestBrakeDiff = null;
  let biggestThrottleDiff = null;

  chunks.forEach((chunk) => {
    const speedGap = chunk.bestSpeed - chunk.comparisonSpeed;
    const brakeGap = chunk.comparisonBrake - chunk.bestBrake;
    const throttleGap = chunk.bestThrottle - chunk.comparisonThrottle;

    if (!biggestSpeedLoss || speedGap > biggestSpeedLoss.value) {
      biggestSpeedLoss = {
        lapPercent: chunk.lapPercent,
        value: speedGap
      };
    }

    if (!biggestBrakeDiff || brakeGap > biggestBrakeDiff.value) {
      biggestBrakeDiff = {
        lapPercent: chunk.lapPercent,
        value: brakeGap
      };
    }

    if (!biggestThrottleDiff || throttleGap > biggestThrottleDiff.value) {
      biggestThrottleDiff = {
        lapPercent: chunk.lapPercent,
        value: throttleGap
      };
    }
  });

  const getLocation = (lapPercent) => {
    if (trackSlug === "spa") {
      return getSpaLocation(lapPercent);
    }

    return `around ${lapPercent}% of the lap`;
  };

  return (
    <div className="cornerList">
      <div className="cornerCard">
        <h3>Speed Delta</h3>
        <p>
          Biggest speed loss appears at <strong>{getLocation(biggestSpeedLoss?.lapPercent)}</strong>.
        </p>
      </div>

      <div className="cornerCard">
        <h3>Braking Insight</h3>
        <p>
          Heavier braking appears at <strong>{getLocation(biggestBrakeDiff?.lapPercent)}</strong>.
        </p>
      </div>

      <div className="cornerCard">
        <h3>Throttle Insight</h3>
        <p>
          Throttle application is weaker at <strong>{getLocation(biggestThrottleDiff?.lapPercent)}</strong>.
        </p>
      </div>
    </div>
  );
}
