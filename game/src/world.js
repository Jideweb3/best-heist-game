// world.js — the room's geometry: what blocks movement, what blocks sight,
// and the ray tests that let vision cones stop at walls instead of passing through.

import {
  OUTER_WALLS,
  INNER_WALLS,
  DISPLAY_CASES,
  PEDESTALS,
  STATUE,
  VAULT,
} from './config.js';

// Everything a walking body bumps into.
export const MOVE_BLOCKERS = [
  ...OUTER_WALLS,
  ...INNER_WALLS,
  ...DISPLAY_CASES,
  ...PEDESTALS,
  STATUE,
  VAULT,
];

// Everything a guard's eyes cannot see through (tall things only).
export const SIGHT_BLOCKERS = [...OUTER_WALLS, ...INNER_WALLS, STATUE, VAULT];

// Does point (px, py) sit inside rect r?
export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Push a circle (cx, cy, radius) out of a rectangle it overlaps.
// Returns the corrected centre, or the centre unchanged when there is no overlap.
export function pushCircleOutOfRect(cx, cy, radius, r) {
  const nearestX = Math.max(r.x, Math.min(cx, r.x + r.w));
  const nearestY = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  const distSq = dx * dx + dy * dy;
  if (distSq >= radius * radius) return { x: cx, y: cy };
  if (distSq === 0) {
    // Centre is inside the rectangle: shove it out along the shortest side.
    const left = cx - r.x;
    const right = r.x + r.w - cx;
    const top = cy - r.y;
    const bottom = r.y + r.h - cy;
    const m = Math.min(left, right, top, bottom);
    if (m === left) return { x: r.x - radius, y: cy };
    if (m === right) return { x: r.x + r.w + radius, y: cy };
    if (m === top) return { x: cx, y: r.y - radius };
    return { x: cx, y: r.y + r.h + radius };
  }
  const dist = Math.sqrt(distSq);
  const push = (radius - dist) / dist;
  return { x: cx + dx * push, y: cy + dy * push };
}

// Move a circle by (dx, dy), resolving collisions against every blocker.
// Axis-separated so Vera slides along walls instead of sticking to corners.
export function moveCircle(x, y, radius, dx, dy) {
  let nx = x + dx;
  for (const r of MOVE_BLOCKERS) {
    const fixed = pushCircleOutOfRect(nx, y, radius, r);
    nx = fixed.x;
  }
  let ny = y + dy;
  for (const r of MOVE_BLOCKERS) {
    const fixed = pushCircleOutOfRect(nx, ny, radius, r);
    ny = fixed.y;
  }
  return { x: nx, y: ny };
}

// Does the segment from (x1, y1) to (x2, y2) touch rectangle r?
export function segmentHitsRect(x1, y1, x2, y2, r) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Slab test: find where the segment enters and leaves the rect's x and y bands.
  let tMin = 0;
  let tMax = 1;
  for (const [p, q] of [
    [-dx, x1 - r.x],
    [dx, r.x + r.w - x1],
    [-dy, y1 - r.y],
    [dy, r.y + r.h - y1],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > tMax) return false;
        if (t > tMin) tMin = t;
      } else {
        if (t < tMin) return false;
        if (t < tMax) tMax = t;
      }
    }
  }
  return true;
}

// Is there a clear line of sight between two points (no tall blocker between)?
export function hasLineOfSight(x1, y1, x2, y2) {
  for (const r of SIGHT_BLOCKERS) {
    if (segmentHitsRect(x1, y1, x2, y2, r)) return false;
  }
  return true;
}

// Cast one ray from (ox, oy) along angle, up to maxDist.
// Returns how far the ray travels before it hits a sight blocker.
export function castRay(ox, oy, angle, maxDist) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  for (const r of SIGHT_BLOCKERS) {
    const hit = rayRectDistance(ox, oy, dx, dy, r);
    if (hit !== null && hit < best) best = hit;
  }
  return best;
}

// Distance along a unit ray to the first edge of rect r, or null when it misses.
function rayRectDistance(ox, oy, dx, dy, r) {
  let tMin = 0;
  let tMax = Infinity;
  const slabs = [
    [-dx, ox - r.x],
    [dx, r.x + r.w - ox],
    [-dy, oy - r.y],
    [dy, r.y + r.h - oy],
  ];
  for (const [p, q] of slabs) {
    if (p === 0) {
      if (q < 0) return null;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > tMax) return null;
        if (t > tMin) tMin = t;
      } else {
        if (t < tMin) return null;
        if (t < tMax) tMax = t;
      }
    }
  }
  return tMin;
}
