"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function TelemetryTraceChart({ points = [] }) {
  if (!points.length) {
    return <p className="heroText">No telemetry trace points available.</p>;
  }

  const data = points.map((point) => ({
    lapPercent: point.lap_percent,
    speed: point.speed_kph,
    throttle: point.throttle !== null ? point.throttle * 100 : null,
    brake: point.brake !== null ? point.brake * 100 : null
  }));

  return (
    <div className="traceChartShell">
      <ResponsiveContainer width="100%" height={320}>
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
          <YAxis
            tick={{ fill: "#93a7b7", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "#101a24",
              border: "1px solid #243748",
              borderRadius: "12px",
              color: "#eaf2f8"
            }}
          />
          <Line type="monotone" dataKey="speed" stroke="#43d7c6" strokeWidth={2} dot={false} name="Speed km/h" />
          <Line type="monotone" dataKey="throttle" stroke="#32d583" strokeWidth={2} dot={false} name="Throttle %" />
          <Line type="monotone" dataKey="brake" stroke="#f04438" strokeWidth={2} dot={false} name="Brake %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
