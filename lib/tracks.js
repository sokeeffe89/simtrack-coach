export const tracks = [
  {
    slug: "spa",
    name: "Spa-Francorchamps",
    country: "Belgium",
    length: "7.004 km",
    sims: ["iRacing", "ACC", "AC"],
    classes: ["GT3", "LMP2"],
    focus: "High-speed commitment and elevation change",
    summary:
      "Spa rewards confidence, rhythm, and clean exits. The lap is built around Eau Rouge/Raidillon, Pouhon, Blanchimont, and the Bus Stop.",
    aiTip:
      "Brake or lift lightly before compression, keep one clean steering input through Eau Rouge, and commit early before the Raidillon crest.",
    setup:
      "Medium-low aero, stable rear under compression, strong braking stability, and traction from slow exits.",
    corners: [
      {
        name: "La Source",
        guide: "Brake straight, rotate late, and maximise the downhill exit.",
        mistake: "Turning in too early and compromising the run to Eau Rouge."
      },
      {
        name: "Eau Rouge / Raidillon",
        guide: "Settle the car before compression, minimise steering correction, and commit early.",
        mistake: "Lifting too late or making a second steering input over the crest."
      },
      {
        name: "Les Combes",
        guide: "Prioritise the final exit rather than attacking the first apex too hard.",
        mistake: "Overdriving entry and losing rhythm through the sequence."
      },
      {
        name: "Pouhon",
        guide: "Trust the car, trail brake lightly, and keep minimum speed high.",
        mistake: "Adding too much steering and scrubbing speed mid-corner."
      }
    ]
  },
  {
    slug: "monza",
    name: "Monza",
    country: "Italy",
    length: "5.793 km",
    sims: ["iRacing", "ACC", "AC"],
    classes: ["GT3", "F4"],
    focus: "Late braking and traction zones",
    summary:
      "Monza is all about braking confidence, kerb control, low drag, and clean chicane exits.",
    aiTip:
      "Brake deep but stable, release smoothly, and prioritise straight-line traction out of each chicane.",
    setup:
      "Low aero, strong braking stability, compliant kerb behaviour, and traction-focused differential settings.",
    corners: [
      {
        name: "Rettifilo",
        guide: "Brake hard in a straight line and square off the second part for exit.",
        mistake: "Carrying too much speed into the first apex and missing the second."
      },
      {
        name: "Roggia",
        guide: "Use the kerb only if the car remains stable and get back to throttle early.",
        mistake: "Attacking the first kerb too aggressively."
      },
      {
        name: "Lesmo 1 and 2",
        guide: "Use a disciplined turn-in and delay throttle until the car is ready.",
        mistake: "Early throttle causing understeer or exit correction."
      },
      {
        name: "Ascari",
        guide: "Sacrifice the first part slightly to maximise the final exit.",
        mistake: "Overdriving entry and killing speed onto the straight."
      }
    ]
  },
  {
    slug: "silverstone",
    name: "Silverstone",
    country: "United Kingdom",
    length: "5.891 km",
    sims: ["iRacing", "AC"],
    classes: ["GT3", "F4"],
    focus: "Flow and high-speed direction change",
    summary:
      "Silverstone rewards smooth steering, high-speed balance, and carrying momentum through linked corners.",
    aiTip:
      "The lap time is in reducing scrub. Keep the car flowing through Maggots and Becketts with minimal steering correction.",
    setup:
      "Stable aero platform, responsive front end, and predictable rear balance through high-speed direction changes.",
    corners: [
      {
        name: "Copse",
        guide: "Commit with one clean input and avoid hesitation.",
        mistake: "Tiny lifts or steering corrections that cost speed into Maggots."
      },
      {
        name: "Maggots / Becketts",
        guide: "Think of it as one flowing sequence rather than separate corners.",
        mistake: "Overworking the steering and scrubbing speed."
      },
      {
        name: "Stowe",
        guide: "Brake cleanly, aim for a late apex, and prioritise exit.",
        mistake: "Over-slowing entry and losing time to Vale."
      },
      {
        name: "Club",
        guide: "Rotate the car early enough to get full throttle on exit.",
        mistake: "Rushing throttle before the car is straight."
      }
    ]
  },
  {
    slug: "suzuka",
    name: "Suzuka",
    country: "Japan",
    length: "5.807 km",
    sims: ["iRacing", "AC"],
    classes: ["GT3", "F4"],
    focus: "Rhythm and technical flow",
    summary:
      "Suzuka is a rhythm circuit where one mistake early in a sequence compromises several corners.",
    aiTip:
      "Treat the Esses as one connected rhythm section. Do not overdrive the first left.",
    setup:
      "Balanced aero, responsive front end, and stable rear rotation for fast linked corners.",
    corners: [
      {
        name: "Esses",
        guide: "Enter with discipline and let the car breathe between direction changes.",
        mistake: "Overdriving the first turn and chasing the rest of the sequence."
      },
      {
        name: "Degner 1",
        guide: "Commit with a clean turn-in and avoid unnecessary brake pressure.",
        mistake: "Hesitating on entry and losing minimum speed."
      },
      {
        name: "Hairpin",
        guide: "Brake straight, rotate patiently, and focus on traction.",
        mistake: "Trying to carry too much entry speed."
      },
      {
        name: "130R",
        guide: "Keep steering calm and trust the aero balance.",
        mistake: "Adding correction at peak load."
      }
    ]
  }
];

export function getTrackBySlug(slug) {
  return tracks.find((track) => track.slug === slug);
}
