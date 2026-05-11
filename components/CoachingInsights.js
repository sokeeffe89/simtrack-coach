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

function getRecommendation(type, location) {
  if (type === "speed") {
    return `Focus on carrying more minimum speed through ${location}. Avoid adding unnecessary steering lock and prioritise a clean exit.`;
  }

  if (type === "brake") {
    return `Review your braking into ${location}. Try releasing the brake more progressively and avoid holding too much brake pressure mid-corner.`;
  }

  if (type === "throttle") {
    return `Work on earlier throttle confidence through ${location}. Aim to straighten the car sooner before committing to full throttle.`;
  }

  return "Review this section against your best lap trace.";
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
    if (trackSlug === "spa") return getSpaLocation(lapPercent);
    return `around ${lapPercent}% of the lap`;
  };

  const speedLocation = getLocation(biggestSpeedLoss?.lapPercent);
  const brakeLocation = getLocation(biggestBrakeDiff?.lapPercent);
  const throttleLocation = getLocation(biggestThrottleDiff?.lapPercent);

  return (
    <div className="cornerList">
      <div className="cornerCard">
        <h3>Speed Delta</h3>
        <p>
          Biggest speed loss appears at <strong>{speedLocation}</strong>.
        </p>
        <p>
          <strong>Likely cause:</strong> lower minimum speed or excess steering scrub.
        </p>
        <p>{getRecommendation("speed", speedLocation)}</p>
      </div>

      <div className="cornerCard">
        <h3>Braking Insight</h3>
        <p>
          Heavier braking appears at <strong>{brakeLocation}</strong>.
        </p>
        <p>
          <strong>Likely cause:</strong> braking too hard or holding brake pressure too long.
        </p>
        <p>{getRecommendation("brake", brakeLocation)}</p>
      </div>

      <div className="cornerCard">
        <h3>Throttle Insight</h3>
        <p>
          Throttle application is weaker at <strong>{throttleLocation}</strong>.
        </p>
        <p>
          <strong>Likely cause:</strong> delayed throttle pickup or poor car rotation before exit.
        </p>
        <p>{getRecommendation("throttle", throttleLocation)}</p>
      </div>
    </div>
  );
}
