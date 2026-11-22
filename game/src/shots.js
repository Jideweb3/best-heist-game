// shots.js — the staged photo scenes: ?shot=1, ?shot=2 or ?shot=3 in the URL
// poses the game into a photogenic mid-action frame using its own rendering,
// then freezes the simulation so the screenshot is stable and repeatable.

import { VAULT_LOOT } from './config.js';

// Point a guard at a spot and stop him there.
function poseGuard(guard, x, y, facing) {
  guard.x = x;
  guard.y = y;
  guard.facing = facing;
  guard.pause = 999;
  guard.state = 'patrol';
}

// Point a camera at a fixed angle and stop its sweep.
function poseCamera(camera, angle) {
  camera.angle = angle;
  camera.speed = 0;
}

// Stage one of the three photo scenes onto the game. Returns true when a
// scene was staged (the caller then freezes the simulation).
export function stageShot(game, shotNumber) {
  // Reset the loot to a clean slate, then each scene takes what it needs.
  for (const gem of game.gems) gem.taken = false;
  game.vaultTaken = false;
  game.coinsLeft = 3;
  game.coinSpot = null;
  game.state = 'playing';
  game.frozen = true;

  if (shotNumber === 1) {
    // THE COVER: Vera crossing open floor mid-room, both guards' cones on her,
    // a camera cone sweeping in, the vault and its diamond in frame, gems out,
    // and the alarm meter sitting at about half.
    game.thief.x = 640;
    game.thief.y = 520;
    game.thief.facing = Math.PI * 0.25;
    poseGuard(game.guards[0], 480, 420, 0.35);
    poseGuard(game.guards[1], 900, 300, Math.PI * 0.85);
    poseCamera(game.cameras[0], Math.PI * 0.42);
    poseCamera(game.cameras[1], Math.PI);
    poseCamera(game.cameras[2], 0);
    game.alarm = 50;
    game.gemsCollected = 0;
    game.score = 0;
    return true;
  }

  if (shotNumber === 2) {
    // THE SNEAK: Vera tucked behind a display case, Milo's cone sweeping just
    // past her, alarm low, two gems already in her pocket.
    game.thief.x = 300;
    game.thief.y = 585;
    game.thief.facing = -Math.PI / 2;
    poseGuard(game.guards[0], 300, 400, 0.85);
    poseGuard(game.guards[1], 900, 300, Math.PI * 0.9);
    poseCamera(game.cameras[0], Math.PI * 0.6);
    poseCamera(game.cameras[1], Math.PI * 0.9);
    poseCamera(game.cameras[2], -0.1);
    game.gems[0].taken = true;
    game.gems[1].taken = true;
    game.alarm = 15;
    game.gemsCollected = 2;
    game.score = 200;
    return true;
  }

  if (shotNumber === 3) {
    // THE VAULT: Vera at the vault with the Velvet Diamond in hand, alarm high,
    // Rosa closing in on her, the escape door waiting below.
    game.thief.x = VAULT_LOOT.x;
    game.thief.y = VAULT_LOOT.y + 18;
    game.thief.facing = -Math.PI / 2;
    poseGuard(game.guards[0], 560, 420, 0);
    poseGuard(game.guards[1], 1000, 330, -0.42);
    poseCamera(game.cameras[0], Math.PI * 0.5);
    poseCamera(game.cameras[1], Math.PI * 1.1);
    poseCamera(game.cameras[2], 0);
    game.vaultTaken = true;
    game.gems[0].taken = true;
    game.gems[2].taken = true;
    game.gems[4].taken = true;
    game.alarm = 85;
    game.gemsCollected = 3;
    game.score = 800;
    return true;
  }

  return false;
}

// Work out, once, who can see Vera in the staged frame, so the frozen shot
// shows the right cone colours and the SPOTTED warning when she is caught
// in a cone. The simulation stays frozen after this.
export function detectStagedScene(game) {
  let spotted = false;
  for (const guard of game.guards) {
    if (guard.sees(game.thief.x, game.thief.y)) spotted = true;
  }
  for (const camera of game.cameras) {
    if (camera.sees(game.thief.x, game.thief.y)) spotted = true;
  }
  game.spotted = spotted;
}
