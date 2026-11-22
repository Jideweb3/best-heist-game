// config.js — every number that shapes The Velvet Vault: canvas size, colours,
// speeds, and the whole museum floor plan (walls, cases, loot, patrols, cameras).
// One room, drawn to fit a 1280x800 frame with no scrolling.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;
export const HUD_HEIGHT = 64;

// How fast Vera the thief moves, and how fast the alarm rises and falls.
export const THIEF_SPEED = 195;
export const THIEF_RADIUS = 14;
export const GUARD_SPEED = 95;
export const GUARD_CHASE_SPEED = 128;
export const ALARM_RISE_GUARD = 48;
export const ALARM_RISE_CAMERA = 34;
export const ALARM_DECAY = 20;
export const ALARM_CAUGHT = 100;
export const GUARD_TOUCH_CAUGHT = 30;
export const COIN_COUNT = 3;

// The room's palette: deep velvet, brass and marble.
export const COLORS = {
  floorA: '#33291f',
  floorB: '#2d261d',
  carpet: '#6e1423',
  carpetTrim: '#c9a227',
  wall: '#4a4238',
  wallTop: '#6b5f4e',
  caseGlass: '#7fb3c8',
  caseFrame: '#8a6d3b',
  pedestal: '#5d5346',
  statue: '#9a8f7a',
  vault: '#b08d2e',
  vaultDark: '#7a5f16',
  guard: '#2e4a6b',
  guardCone: 'rgba(255, 214, 90, 0.24)',
  guardConeSeen: 'rgba(255, 70, 60, 0.32)',
  cameraCone: 'rgba(255, 120, 60, 0.26)',
  cameraConeSeen: 'rgba(255, 70, 60, 0.30)',
  thief: '#b03a48',
  gem: '#4fd2ff',
  gemGold: '#ffd24a',
  hud: '#171310',
  hudLine: '#c9a227',
  text: '#f2e8d5',
  textDim: '#b8a98a',
};

// Rectangles are { x, y, w, h }. Sight blockers are the tall things: outer walls,
// interior walls, the statue plinth and the vault safe. Display cases and pedestals
// are low, so they block movement but a guard can see over them.

// Outer walls, with a gap in the bottom wall for the exit door (x 96..176).
export const OUTER_WALLS = [
  { x: 0, y: HUD_HEIGHT, w: 16, h: CANVAS_HEIGHT - HUD_HEIGHT }, // left
  { x: 1264, y: HUD_HEIGHT, w: 16, h: CANVAS_HEIGHT - HUD_HEIGHT }, // right
  { x: 0, y: HUD_HEIGHT, w: CANVAS_WIDTH, h: 16 }, // top
  { x: 0, y: 784, w: 96, h: 16 }, // bottom, left of the door
  { x: 176, y: 784, w: 1104, h: 16 }, // bottom, right of the door
];

// Interior walls: tall, block movement AND sight. They split the room into routes.
export const INNER_WALLS = [
  { x: 430, y: 300, w: 16, h: 240 }, // vertical spine, left-centre
  { x: 700, y: 420, w: 260, h: 16 }, // horizontal spine, right-centre
  { x: 980, y: 120, w: 16, h: 180 }, // guard wall on the vault approach
];

// Display cases: long glass cases, low enough to see over.
export const DISPLAY_CASES = [
  { x: 220, y: 180, w: 160, h: 40 },
  { x: 560, y: 180, w: 160, h: 40 },
  { x: 220, y: 620, w: 160, h: 40 },
  { x: 560, y: 620, w: 160, h: 40 },
  { x: 900, y: 560, w: 160, h: 40 },
];

// Pedestals: small square stands, some holding loot.
export const PEDESTALS = [
  { x: 746, y: 286, w: 28, h: 28 },
  { x: 286, y: 446, w: 28, h: 28 },
  { x: 1036, y: 456, w: 28, h: 28 },
  { x: 606, y: 486, w: 28, h: 28 },
  { x: 166, y: 366, w: 28, h: 28 },
];

// The statue plinth in the middle of the room: tall, blocks sight.
export const STATUE = { x: 600, y: 300, w: 80, h: 60 };

// The vault safe at the far (top-right) end, holding the Velvet Diamond.
export const VAULT = { x: 1060, y: 110, w: 150, h: 100 };
export const VAULT_LOOT = { x: 1135, y: 252, label: 'Velvet Diamond' };

// The exit door in the bottom wall.
export const EXIT_DOOR = { x: 96, y: 784, w: 80, h: 16 };

// Small loot: six gems resting on cases and pedestals.
export const GEM_SPOTS = [
  { x: 300, y: 200, kind: 'sapphire' },
  { x: 640, y: 200, kind: 'emerald' },
  { x: 300, y: 460, kind: 'ruby' },
  { x: 760, y: 300, kind: 'sapphire' },
  { x: 1050, y: 470, kind: 'emerald' },
  { x: 980, y: 580, kind: 'ruby' },
];

// Guards: name, patrol waypoints, and where they start facing.
export const GUARD_DEFS = [
  {
    name: 'Milo',
    waypoints: [
      { x: 260, y: 280 },
      { x: 260, y: 560 },
      { x: 560, y: 560 },
      { x: 560, y: 280 },
    ],
    coneRange: 235,
    coneHalfAngle: 0.61,
  },
  {
    name: 'Rosa',
    waypoints: [
      { x: 740, y: 240 },
      { x: 1150, y: 240 },
      { x: 1150, y: 340 },
      { x: 740, y: 340 },
    ],
    coneRange: 225,
    coneHalfAngle: 0.61,
  },
];

// Security cameras: wall mount, sweep limits, cone range.
export const CAMERA_DEFS = [
  { x: 640, y: 80, minAngle: Math.PI * 0.28, maxAngle: Math.PI * 0.72, speed: 0.55, coneRange: 240, coneHalfAngle: 0.42 },
  { x: 1264, y: 480, minAngle: Math.PI * 0.78, maxAngle: Math.PI * 1.22, speed: 0.45, coneRange: 225, coneHalfAngle: 0.42 },
  { x: 16, y: 480, minAngle: -Math.PI * 0.22, maxAngle: Math.PI * 0.22, speed: 0.5, coneRange: 225, coneHalfAngle: 0.42 },
];

// Vera starts by the entrance door, bottom-left.
export const THIEF_START = { x: 136, y: 730 };
