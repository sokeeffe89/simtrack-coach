import fs from 'fs';
import path from 'path';

function loadConfig() {
  const configPath = path.resolve('./config.txt');
  const values = {};

  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    content.split('\n').forEach((line) => {
      const [key, ...rest] = line.split('=');
      if (!key || !rest.length) return;
      values[key.trim()] = rest.join('=').trim();
    });
  }

  return {
    apiUrl: process.env.SIMTRACK_API_URL || values.SIMTRACK_API_URL,
    token: process.env.SIMTRACK_INGEST_TOKEN || values.SIMTRACK_INGEST_TOKEN,
    profileId: process.env.SIMTRACK_PROFILE_ID || values.SIMTRACK_PROFILE_ID
  };
}

function buildSamplePayload(profileId) {
  return {
    profile_id: profileId,
    sim_name: 'iRacing',
    track_slug: 'spa',
    car_name: 'Ferrari 296 GT3',
    session_name: `Desktop Agent ${new Date().toISOString()}`,
    uploaded_file: 'desktop-agent',
    laps: [
      {
        lap_number: 1,
        lap_time_ms: 138420,
        is_valid: true,
        sectors: [
          { sector_number: 1, sector_time_ms: 44980 },
          { sector_number: 2, sector_time_ms: 50920 },
          { sector_number: 3, sector_time_ms: 42520 }
        ],
        points: [
          { sample_index: 0, lap_percent: 0, speed_kph: 86, throttle: 0.25, brake: 0.75, steering: -0.06, gear: 2, rpm: 6400 }
        ]
      }
    ]
  };
}

async function run() {
  const config = loadConfig();

  if (!config.apiUrl || !config.token || !config.profileId) {
    console.error('Missing config. Create desktop-agent/config.txt from config.example.txt');
    process.exit(1);
  }

  const response = await fetch(`${config.apiUrl}/api/telemetry/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`
    },
    body: JSON.stringify(buildSamplePayload(config.profileId))
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Ingest failed:', data);
    process.exit(1);
  }

  console.log('Telemetry sent successfully:', data);
}

run();
