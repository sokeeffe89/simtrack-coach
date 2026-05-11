"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

export default function LapComparisonChart({ bestLapPoints = [], comparisonLapPoints = [] }) {
  if (!bestLapPoints.length || !comparisonLapPoints.length) {
    return <p className="heroText">Not enough telemetry points to compare laps yet.</p>;
  }

  const data = bestLapPoints.map((point, index) => {
    const comparisonPoint = comparisonLapPoints[index];

    return {
      lapPercent: point.lap_percent,
      bestSpeed: point.speed_kph,
      comparisonSpeed: comparisonPoint?.speed_kph ?? null,
      bestBrake: point.brake !== null ? point.brake * 100 : null,
      comparisonBrake: comparisonPoint?.brake !== null ? comparisonPoint.brake * 100 : null,
      bestThrottle: point.throttle !== null ? point.throttle * 100 : null,
      comparisonThrottle: comparisonPoint?.throttle !== null ? comparisonPoint.throttle * 100 : null
    };
  });

  return (
    <div className="traceChartShell">
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 167, 183, 0.18)" />
          <XAxis
            dataKey="lapPercent"
            tick={{ fill: "#93a7b7", fontSize: 12 }}
            label={{
              value: "Lap %",
              position: "insideBottom",
              offset: -4,
              fill: "#93a7b7"
            }}
          />
          <YAxis tick={{ fill: "#93a7b7", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "#101a24",
              border: "1px solid #243748",
              borderRadius: "12px",
              color: "#eaf2f8"
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="bestSpeed" stroke="#43d7c6" strokeWidth={2} dot={false} name="Best lap speed" />
          <Line type="monotone" dataKey="comparisonSpeed" stroke="#93a7b7" strokeWidth={2} dot={false} name="Comparison speed" />
          <Line type="monotone" dataKey="bestBrake" stroke="#f04438" strokeWidth={2} dot={false} name="Best brake %" />
          <Line type="monotone" dataKey="comparisonBrake" stroke="#f5a524" strokeWidth={2} dot={false} name="Comparison brake %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
