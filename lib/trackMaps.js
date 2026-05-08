export const trackMaps = {
  spa: {
  viewBox: "0 0 620 420",
  sectors: [
    {
      sector: 1,
      label: "Sector 1",
      path: "M115 315 C80 300, 72 265, 98 240 C125 215, 160 232, 182 205 C210 170, 248 142, 282 116 C306 98, 325 72, 356 64"
    },
    {
      sector: 2,
      label: "Sector 2",
      path: "M356 64 C392 52, 432 75, 438 104 C444 134, 405 132, 415 158 C430 198, 500 180, 522 220 C546 262, 510 296, 468 278"
    },
    {
      sector: 3,
      label: "Sector 3",
      path: "M468 278 C430 258, 404 296, 366 316 C315 344, 245 350, 190 334 C158 324, 138 325, 115 315"
    }
  ],
  labels: [
    { text: "S1", x: 205, y: 190 },
    { text: "S2", x: 455, y: 175 },
    { text: "S3", x: 310, y: 340 }
  ],
  corners: [
    { name: "La Source", x: 72, y: 246 },
    { name: "Eau Rouge", x: 210, y: 160 },
    { name: "Raidillon", x: 270, y: 116 },
    { name: "Les Combes", x: 350, y: 52 },
    { name: "Pouhon", x: 452, y: 170 },
    { name: "Blanchimont", x: 506, y: 288 },
    { name: "Bus Stop", x: 238, y: 356 },
    { name: "Start / Finish", x: 78, y: 340 }
  ]
},
  monza: {
    viewBox: "0 0 520 340",
    sectors: [
      {
        sector: 1,
        label: "Sector 1",
        path: "M90 280 L255 280 C315 280, 340 235, 292 212"
      },
      {
        sector: 2,
        label: "Sector 2",
        path: "M292 212 C240 180, 270 125, 342 126 C420 126, 460 88, 410 54"
      },
      {
        sector: 3,
        label: "Sector 3",
        path: "M410 54 C475 100, 485 208, 390 258 C305 303, 175 302, 90 280"
      }
    ],
    labels: [
      { text: "S1", x: 210, y: 267 },
      { text: "S2", x: 350, y: 118 },
      { text: "S3", x: 398, y: 245 }
    ]
  },

  silverstone: {
    viewBox: "0 0 520 340",
    sectors: [
      {
        sector: 1,
        label: "Sector 1",
        path: "M90 235 C125 145, 210 102, 282 128"
      },
      {
        sector: 2,
        label: "Sector 2",
        path: "M282 128 C350 152, 360 72, 440 105 C505 132, 468 205, 392 196"
      },
      {
        sector: 3,
        label: "Sector 3",
        path: "M392 196 C335 192, 305 268, 220 270 C150 272, 100 255, 90 235"
      }
    ],
    labels: [
      { text: "S1", x: 188, y: 145 },
      { text: "S2", x: 394, y: 122 },
      { text: "S3", x: 245, y: 260 }
    ]
  },

  suzuka: {
    viewBox: "0 0 520 340",
    sectors: [
      {
        sector: 1,
        label: "Sector 1",
        path: "M95 250 C138 195, 182 170, 220 150 C260 130, 268 96, 236 76"
      },
      {
        sector: 2,
        label: "Sector 2",
        path: "M236 76 C312 42, 438 58, 448 132 C458 205, 360 198, 318 165"
      },
      {
        sector: 3,
        label: "Sector 3",
        path: "M318 165 C260 120, 215 208, 262 250 C306 292, 168 302, 95 250"
      }
    ],
    labels: [
      { text: "S1", x: 175, y: 175 },
      { text: "S2", x: 360, y: 100 },
      { text: "S3", x: 250, y: 255 }
    ]
  }
};
