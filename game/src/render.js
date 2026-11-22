// render.js — everything Vera's world looks like: the marble floor and velvet
// carpet, the glass cases and the golden vault, the guards and their cones,
// the cameras, Vera herself, and the HUD with its alarm meter and loot count.
// All art is drawn shapes — no images anywhere.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  HUD_HEIGHT,
  COLORS,
  OUTER_WALLS,
  INNER_WALLS,
  DISPLAY_CASES,
  PEDESTALS,
  STATUE,
  VAULT,
  VAULT_LOOT,
  EXIT_DOOR,
  THIEF_RADIUS,
} from './config.js';

const TITLE_FONT = 'bold 24px Georgia, serif';
const HUD_FONT = 'bold 15px Arial, sans-serif';
const SMALL_FONT = '13px Arial, sans-serif';
const BIG_FONT = 'bold 52px Georgia, serif';

// A small diamond shape, used for gems and the loot counter.
function drawDiamond(ctx, x, y, size, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.7, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.7, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.35, y - size * 0.2);
  ctx.lineTo(x, y);
  ctx.lineTo(x - size * 0.35, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
}

function drawCone(ctx, points, fill, edge) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fill();
  // A thin edge so the cone still reads when the screenshot is shrunk.
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawFloor(ctx) {
  for (let ty = 0; ty < 10; ty++) {
    for (let tx = 0; tx < 16; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(tx * 80, HUD_HEIGHT + ty * 80, 80, 80);
    }
  }
  // The red carpet runs from the entrance door up the middle of the room.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(560, HUD_HEIGHT, 160, CANVAS_HEIGHT - HUD_HEIGHT - 16);
  ctx.fillStyle = COLORS.carpetTrim;
  ctx.fillRect(556, HUD_HEIGHT, 4, CANVAS_HEIGHT - HUD_HEIGHT - 16);
  ctx.fillRect(720, HUD_HEIGHT, 4, CANVAS_HEIGHT - HUD_HEIGHT - 16);
  // A round rug under the statue.
  ctx.fillStyle = COLORS.carpet;
  ctx.beginPath();
  ctx.arc(640, 330, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.carpetTrim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(640, 330, 92, 0, Math.PI * 2);
  ctx.stroke();
}

function drawWalls(ctx) {
  for (const wall of [...OUTER_WALLS, ...INNER_WALLS]) {
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y + 4, wall.w, wall.h - 4);
  }
  // The exit door: a brass-framed gap in the bottom wall, with a green sign.
  ctx.fillStyle = '#1d5c33';
  ctx.fillRect(EXIT_DOOR.x, EXIT_DOOR.y - 6, EXIT_DOOR.w, 10);
  ctx.fillStyle = '#e8f5e9';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', EXIT_DOOR.x + EXIT_DOOR.w / 2, EXIT_DOOR.y + 2);
  ctx.textAlign = 'left';
}

function drawFurniture(ctx, game) {
  // Glass display cases with something glinting inside each one.
  for (const c of DISPLAY_CASES) {
    ctx.fillStyle = COLORS.caseFrame;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(127, 179, 200, 0.55)';
    ctx.fillRect(c.x + 5, c.y + 5, c.w - 10, c.h - 10);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(c.x + 8, c.y + 7, c.w - 16, 4);
  }
  // Pedestals.
  for (const p of PEDESTALS) {
    ctx.fillStyle = COLORS.pedestal;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(p.x, p.y, p.w, 4);
  }
  // The statue: a marble figure on its plinth.
  ctx.fillStyle = COLORS.statue;
  ctx.fillRect(STATUE.x, STATUE.y, STATUE.w, STATUE.h);
  ctx.fillStyle = '#c9bfa8';
  ctx.beginPath();
  ctx.arc(STATUE.x + STATUE.w / 2, STATUE.y + STATUE.h / 2, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6d6350';
  ctx.beginPath();
  ctx.arc(STATUE.x + STATUE.w / 2, STATUE.y + STATUE.h / 2 - 6, 10, 0, Math.PI * 2);
  ctx.fill();

  // The vault: a big golden safe with a round door and a brass label.
  const v = VAULT;
  ctx.fillStyle = COLORS.vaultDark;
  ctx.fillRect(v.x - 4, v.y - 4, v.w + 8, v.h + 8);
  ctx.fillStyle = COLORS.vault;
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.strokeStyle = '#e8c95a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(v.x + v.w / 2, v.y + v.h / 2, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = COLORS.vaultDark;
  ctx.beginPath();
  ctx.arc(v.x + v.w / 2, v.y + v.h / 2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1d05';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('VAULT', v.x + v.w / 2, v.y + v.h - 12);
  ctx.textAlign = 'left';
  // The Velvet Diamond glows on its stand in front of the safe.
  if (!game.vaultTaken) {
    const pulse = 1 + 0.12 * Math.sin(game.time * 3);
    ctx.fillStyle = 'rgba(255, 210, 74, 0.25)';
    ctx.beginPath();
    ctx.arc(VAULT_LOOT.x, VAULT_LOOT.y, 30 * pulse, 0, Math.PI * 2);
    ctx.fill();
    drawDiamond(ctx, VAULT_LOOT.x, VAULT_LOOT.y, 22, COLORS.gemGold);
    ctx.fillStyle = COLORS.gemGold;
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VELVET DIAMOND', VAULT_LOOT.x, VAULT_LOOT.y + 40);
    ctx.textAlign = 'left';
  }
}

function drawLoot(ctx, game) {
  for (const gem of game.gems) {
    if (gem.taken) continue;
    const colour = gem.kind === 'ruby' ? '#ff5a6e' : gem.kind === 'emerald' ? '#3ddc84' : COLORS.gem;
    drawDiamond(ctx, gem.x, gem.y, 11, colour);
  }
  // Where a tossed coin landed, a little brass glint the guards walk toward.
  if (game.coinSpot) {
    ctx.fillStyle = '#ffd24a';
    ctx.beginPath();
    ctx.arc(game.coinSpot.x, game.coinSpot.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3b0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(game.coinSpot.x, game.coinSpot.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPatrolLines(ctx, game) {
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 8]);
  for (const guard of game.guards) {
    ctx.beginPath();
    const pts = guard.waypoints;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawGuards(ctx, game) {
  for (const guard of game.guards) {
    drawCone(ctx, guard.cone(), guard.seesThief ? COLORS.guardConeSeen : COLORS.guardCone,
      guard.seesThief ? 'rgba(255, 70, 60, 0.65)' : 'rgba(255, 214, 90, 0.55)');
  }
  for (const guard of game.guards) {
    // Body: a navy uniform with a cap brim pointing where he looks.
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dce8f5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 15, 0, Math.PI * 2);
    ctx.stroke();
    const bx = guard.x + Math.cos(guard.facing) * 15;
    const by = guard.y + Math.sin(guard.facing) * 15;
    ctx.strokeStyle = '#dce8f5';
    ctx.beginPath();
    ctx.moveTo(bx - Math.sin(guard.facing) * 6, by + Math.cos(guard.facing) * 6);
    ctx.lineTo(bx + Math.sin(guard.facing) * 6, by - Math.cos(guard.facing) * 6);
    ctx.stroke();
    ctx.fillStyle = '#f2e8d5';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 6, 0, Math.PI * 2);
    ctx.fill();
    // Name tag, so the player can tell the patrols apart.
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(guard.name.toUpperCase(), guard.x, guard.y - 22);
    ctx.textAlign = 'left';
  }
}

function drawCameras(ctx, game) {
  for (const camera of game.cameras) {
    drawCone(ctx, camera.cone(), camera.seesThief ? COLORS.cameraConeSeen : COLORS.cameraCone,
      camera.seesThief ? 'rgba(255, 70, 60, 0.65)' : 'rgba(255, 150, 80, 0.55)');
  }
  for (const camera of game.cameras) {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(camera.x - 9, camera.y - 9, 18, 18);
    ctx.fillStyle = camera.seesThief ? '#ff4040' : '#c9a227';
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(camera.x, camera.y);
    ctx.lineTo(camera.x + Math.cos(camera.angle) * 14, camera.y + Math.sin(camera.angle) * 14);
    ctx.stroke();
  }
}

function drawThief(ctx, game) {
  const t = game.thief;
  // Vera: a velvet-red figure with a black mask and a beret, facing her walk.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(t.x, t.y + 12, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(t.x, t.y, THIEF_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e8b4b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(t.x, t.y, THIEF_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  // Mask stripe across the eyes.
  ctx.strokeStyle = '#171310';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(t.x - 10, t.y - 3);
  ctx.lineTo(t.x + 10, t.y - 3);
  ctx.stroke();
  // Beret.
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.arc(t.x, t.y - 6, 8, Math.PI, 0);
  ctx.fill();
  // Direction tick.
  ctx.strokeStyle = '#f2e8d5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(t.x, t.y);
  ctx.lineTo(t.x + Math.cos(t.facing) * 17, t.y + Math.sin(t.facing) * 17);
  ctx.stroke();
  // Her name, so the cover frame reads at a glance.
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VERA', t.x, t.y - 22);
  ctx.textAlign = 'left';
}

function drawHud(ctx, game) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = COLORS.hudLine;
  ctx.fillRect(0, HUD_HEIGHT - 3, CANVAS_WIDTH, 3);

  // Title and objective, left.
  ctx.fillStyle = COLORS.text;
  ctx.font = TITLE_FONT;
  ctx.fillText('THE VELVET VAULT', 18, 30);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = SMALL_FONT;
  const objective = game.vaultTaken
    ? 'Diamond grabbed — escape through the EXIT door!'
    : 'Steal the Velvet Diamond, then escape through the EXIT door.';
  ctx.fillText(objective, 18, 52);

  // Alarm meter, centre.
  const meterX = 470;
  const meterW = 300;
  const meterY = 22;
  ctx.fillStyle = COLORS.text;
  ctx.font = HUD_FONT;
  ctx.fillText('ALARM', meterX, meterY - 6);
  ctx.fillStyle = '#3a3230';
  ctx.fillRect(meterX, meterY, meterW, 18);
  const alarmFrac = Math.max(0, Math.min(1, game.alarm / 100));
  const alarmColour = alarmFrac < 0.5 ? '#3ddc84' : alarmFrac < 0.8 ? '#ffb020' : '#ff4040';
  ctx.fillStyle = alarmColour;
  ctx.fillRect(meterX, meterY, meterW * alarmFrac, 18);
  ctx.strokeStyle = COLORS.hudLine;
  ctx.lineWidth = 2;
  ctx.strokeRect(meterX, meterY, meterW, 18);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText(`${Math.round(game.alarm)}%`, meterX + meterW + 10, meterY + 14);

  // Loot and coins, right.
  const lootText = `LOOT ${game.gemsCollected}/${game.gemsTotal}`;
  ctx.fillStyle = COLORS.text;
  ctx.font = HUD_FONT;
  ctx.fillText(lootText, 900, 28);
  drawDiamond(ctx, 1010, 22, 9, COLORS.gemGold);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = SMALL_FONT;
  ctx.fillText(`Coins (E): ${game.coinsLeft}`, 900, 50);
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(`Score: ${game.score}`, 1080, 50);

  // "SPOTTED!" flashes under the HUD while any cone holds Vera.
  if (game.spotted && game.state === 'playing') {
    const flash = Math.sin(game.time * 10) > 0 ? '#ff4040' : '#ffb020';
    ctx.fillStyle = flash;
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!  BREAK LINE OF SIGHT!', CANVAS_WIDTH / 2, HUD_HEIGHT + 34);
    ctx.textAlign = 'left';
  }
}

function drawScreenOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10, 8, 6, 0.78)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = accent;
  ctx.font = BIG_FONT;
  ctx.textAlign = 'center';
  ctx.fillText(title, CANVAS_WIDTH / 2, 300);
  ctx.fillStyle = COLORS.text;
  ctx.font = '18px Arial, sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_WIDTH / 2, 360 + i * 32);
  });
  ctx.textAlign = 'left';
}

export function drawScene(ctx, game) {
  drawFloor(ctx);
  drawWalls(ctx);
  drawFurniture(ctx, game);
  drawLoot(ctx, game);
  drawPatrolLines(ctx, game);
  drawGuards(ctx, game);
  drawCameras(ctx, game);
  drawThief(ctx, game);
  drawHud(ctx, game);

  if (game.state === 'title') {
    drawScreenOverlay(ctx, 'THE VELVET VAULT', [
      'You are Vera, gentleman thief. The Velvet Diamond waits in the vault, top-right.',
      'Move with WASD or arrow keys — or click where to walk. E tosses a coin to distract a guard.',
      'Guards and cameras sweep the room. Stay out of their cones or the alarm fills.',
      'At 100% alarm you are CAUGHT. Grab the diamond, then slip out the EXIT door.',
      '',
      'Press ENTER or click to begin the heist.',
    ], COLORS.gemGold);
  } else if (game.state === 'caught') {
    drawScreenOverlay(ctx, 'CAUGHT!', [
      `The alarm hit 100% — the guards have Vera. Loot kept: ${game.gemsCollected} gems.`,
      `Score: ${game.score}`,
      '',
      'Press ENTER or R to try again.',
    ], '#ff4040');
  } else if (game.state === 'won') {
    drawScreenOverlay(ctx, 'CLEAN GETAWAY!', [
      'Vera slips out the door with the Velvet Diamond. The museum never saw her.',
      `Loot: ${game.gemsCollected}/${game.gemsTotal} gems, the Velvet Diamond, and ${game.coinsLeft} coins to spare.`,
      `Final score: ${game.score}`,
      '',
      'Press ENTER or R to play again.',
    ], '#3ddc84');
  }
}
