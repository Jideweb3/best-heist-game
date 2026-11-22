// main.js — the heist itself: the game state, the loop, the alarm, the loot,
// the win and the caught moment. It wires the room, the patrols, the input,
// the sound and the drawing together and nothing else.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  THIEF_SPEED,
  THIEF_RADIUS,
  THIEF_START,
  GEM_SPOTS,
  VAULT_LOOT,
  EXIT_DOOR,
  GUARD_DEFS,
  CAMERA_DEFS,
  ALARM_RISE_GUARD,
  ALARM_RISE_CAMERA,
  ALARM_DECAY,
  ALARM_CAUGHT,
  GUARD_TOUCH_CAUGHT,
  COIN_COUNT,
} from './config.js';
import { moveCircle } from './world.js';
import { Guard, Camera } from './guards.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { drawScene } from './render.js';
import { stageShot, detectStagedScene } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const input = new Input(canvas);
const sounds = new SoundBank();

// The whole game in one object, so the renderer and the photo scenes read it.
const game = {
  state: 'title', // title | playing | caught | won
  frozen: false, // photo scenes freeze the simulation but keep rendering
  time: 0,
  alarm: 0,
  score: 0,
  gemsCollected: 0,
  gemsTotal: GEM_SPOTS.length + 1,
  vaultTaken: false,
  coinsLeft: COIN_COUNT,
  coinSpot: null,
  spotted: false,
  thief: { x: THIEF_START.x, y: THIEF_START.y, facing: -Math.PI / 2 },
  guards: GUARD_DEFS.map((def) => new Guard(def)),
  cameras: CAMERA_DEFS.map((def) => new Camera(def)),
  gems: GEM_SPOTS.map((spot) => ({ ...spot, taken: false })),
};

function resetGame() {
  game.state = 'playing';
  game.alarm = 0;
  game.score = 0;
  game.gemsCollected = 0;
  game.vaultTaken = false;
  game.coinsLeft = COIN_COUNT;
  game.coinSpot = null;
  game.spotted = false;
  game.thief.x = THIEF_START.x;
  game.thief.y = THIEF_START.y;
  game.thief.facing = -Math.PI / 2;
  game.guards = GUARD_DEFS.map((def) => new Guard(def));
  game.cameras = CAMERA_DEFS.map((def) => new Camera(def));
  game.gems = GEM_SPOTS.map((spot) => ({ ...spot, taken: false }));
}

function collectGem(gem) {
  gem.taken = true;
  game.gemsCollected += 1;
  game.score += 100;
  sounds.pickup();
}

function collectVault() {
  game.vaultTaken = true;
  game.gemsCollected += 1;
  game.score += 500;
  sounds.vault();
}

// One tick of play: move Vera, run the patrols, work out who sees her,
// and move the alarm up or down.
function update(dt) {
  // Vera walks: keys first, or toward a clicked spot.
  const keyDir = input.keyDirection();
  let dx = 0;
  let dy = 0;
  if (keyDir) {
    dx = keyDir.x * THIEF_SPEED * dt;
    dy = keyDir.y * THIEF_SPEED * dt;
    game.thief.facing = Math.atan2(keyDir.y, keyDir.x);
    input.moveTarget = null;
  } else if (input.moveTarget) {
    const tx = input.moveTarget.x - game.thief.x;
    const ty = input.moveTarget.y - game.thief.y;
    const dist = Math.hypot(tx, ty);
    if (dist < 6) {
      input.moveTarget = null;
    } else {
      const step = Math.min(dist, THIEF_SPEED * dt);
      dx = (tx / dist) * step;
      dy = (ty / dist) * step;
      game.thief.facing = Math.atan2(ty, tx);
    }
  }
  if (dx !== 0 || dy !== 0) {
    const moved = moveCircle(game.thief.x, game.thief.y, THIEF_RADIUS, dx, dy);
    game.thief.x = moved.x;
    game.thief.y = moved.y;
  }

  // E tosses a coin: the nearest patrolling guard walks over to look at it.
  if (input.takeCoinToss() && game.coinsLeft > 0 && game.state === 'playing') {
    game.coinsLeft -= 1;
    game.coinSpot = { x: game.thief.x, y: game.thief.y + 30 };
    sounds.coin();
  }

  // Patrols and cameras.
  for (const guard of game.guards) guard.update(dt, game.thief, game.alarm, game.coinSpot);
  for (const camera of game.cameras) camera.update(dt);

  // Who can see Vera right now?
  let seenByGuard = false;
  let seenByCamera = false;
  for (const guard of game.guards) {
    if (guard.sees(game.thief.x, game.thief.y)) seenByGuard = true;
  }
  for (const camera of game.cameras) {
    if (camera.sees(game.thief.x, game.thief.y)) seenByCamera = true;
  }
  game.spotted = seenByGuard || seenByCamera;

  // The alarm fills while Vera is seen and drains while she is hidden.
  if (seenByGuard) game.alarm += ALARM_RISE_GUARD * dt;
  else if (seenByCamera) game.alarm += ALARM_RISE_CAMERA * dt;
  else game.alarm -= ALARM_DECAY * dt;
  game.alarm = Math.max(0, Math.min(ALARM_CAUGHT, game.alarm));

  // A soft tick while spotted, so the tension is audible.
  if (game.spotted && Math.floor(game.time * 4) !== Math.floor((game.time - dt) * 4)) {
    sounds.alarmTick();
  }

  // A guard who touches Vera catches her on the spot.
  for (const guard of game.guards) {
    const dist = Math.hypot(guard.x - game.thief.x, guard.y - game.thief.y);
    if (dist < GUARD_TOUCH_CAUGHT) {
      game.state = 'caught';
      sounds.caught();
      return;
    }
  }

  // Small loot: walk over a gem to pocket it.
  for (const gem of game.gems) {
    if (!gem.taken && Math.hypot(gem.x - game.thief.x, gem.y - game.thief.y) < 28) {
      collectGem(gem);
    }
  }

  // The big prize: the Velvet Diamond on its stand by the vault.
  if (!game.vaultTaken && Math.hypot(VAULT_LOOT.x - game.thief.x, VAULT_LOOT.y - game.thief.y) < 40) {
    collectVault();
  }

  // Full alarm means caught.
  if (game.alarm >= ALARM_CAUGHT) {
    game.state = 'caught';
    sounds.caught();
    return;
  }

  // Diamond in hand and out the exit door: a clean getaway.
  if (game.vaultTaken && game.thief.y > 760 && game.thief.x > EXIT_DOOR.x && game.thief.x < EXIT_DOOR.x + EXIT_DOOR.w) {
    game.state = 'won';
    game.score += Math.max(0, 600 - Math.floor(game.time)) + game.coinsLeft * 50;
    sounds.win();
  }
}

// The frame loop: advance the simulation (unless a photo scene froze it),
// then draw. Title, caught and won screens wait for Enter, Space, R or a click.
let lastTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  game.time += dt;

  if (game.state === 'playing' && !game.frozen) update(dt);
  if (game.state !== 'playing') {
    if (input.takeStartPress() || input.keys.has('r')) {
      sounds.unlock();
      resetGame();
    }
  } else {
    sounds.unlock();
  }
  drawScene(ctx, game);
  requestAnimationFrame(frame);
}

// A photo scene (?shot=1, 2 or 3) stages the room and freezes it; otherwise
// the game opens on its title screen.
const shotParam = new URLSearchParams(window.location.search).get('shot');
if (shotParam !== null) {
  const staged = stageShot(game, Number(shotParam));
  if (staged) detectStagedScene(game);
  else game.state = 'title';
}
requestAnimationFrame(frame);
