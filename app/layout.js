export const metadata = {
  title: "SimTrack Coach",
  description: "Sim racing track guides, telemetry coaching, and lap-time improvement tools."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
