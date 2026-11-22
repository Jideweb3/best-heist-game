// guards.js — the patrols and the cameras: guards walk their waypoints and pause
// at each one, cameras sweep back and forth on the wall, and both of them see
// Vera only when she is inside their cone, in range, and in clear line of sight.

import { castRay, hasLineOfSight } from './world.js';
import { GUARD_SPEED, GUARD_CHASE_SPEED } from './config.js';

const CONE_RAYS = 26;

// Turn `from` toward `to` by at most `step` radians, taking the short way round.
function turnToward(from, to, step) {
  let diff = to - from;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) <= step) return to;
  return from + Math.sign(diff) * step;
}

// Is the target inside this cone: close enough, inside the angle, and visible?
function insideCone(ox, oy, facing, range, halfAngle, tx, ty) {
  const dx = tx - ox;
  const dy = ty - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  let diff = Math.atan2(dy, dx) - facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > halfAngle) return false;
  return hasLineOfSight(ox, oy, tx, ty);
}

// The cone as a polygon: rays fan out across it and each one stops at the
// nearest wall, so the drawn cone hugs the room instead of passing through it.
function conePolygon(ox, oy, facing, range, halfAngle) {
  const points = [{ x: ox, y: oy }];
  for (let i = 0; i <= CONE_RAYS; i++) {
    const angle = facing - halfAngle + (2 * halfAngle * i) / CONE_RAYS;
    const dist = castRay(ox, oy, angle, range);
    points.push({ x: ox + Math.cos(angle) * dist, y: oy + Math.sin(angle) * dist });
  }
  return points;
}

export class Guard {
  constructor(def) {
    this.name = def.name;
    this.waypoints = def.waypoints;
    this.coneRange = def.coneRange;
    this.coneHalfAngle = def.coneHalfAngle;
    this.x = def.waypoints[0].x;
    this.y = def.waypoints[0].y;
    this.targetIndex = 1;
    this.facing = 0;
    this.pause = 0;
    this.state = 'patrol'; // patrol | investigate | chase
    this.investigateX = 0;
    this.investigateY = 0;
    this.investigateTimer = 0;
    this.seesThief = false;
  }

  // Walk the patrol, pause at each waypoint, and turn to face where we go.
  // A tossed coin pulls a guard off patrol to look at the spot; a high alarm
  // sends the guard after Vera instead.
  update(dt, thief, alarm, coinSpot) {
    if (coinSpot && this.state !== 'chase') {
      this.state = 'investigate';
      this.investigateX = coinSpot.x;
      this.investigateY = coinSpot.y;
      this.investigateTimer = 4;
    }
    if (alarm >= 70) this.state = 'chase';
    else if (this.state === 'chase') this.state = 'patrol';

    if (this.state === 'investigate') {
      this.investigateTimer -= dt;
      const arrived = this.walkToward(this.investigateX, this.investigateY, dt);
      if (arrived || this.investigateTimer <= 0) this.state = 'patrol';
      return;
    }
    if (this.state === 'chase') {
      this.walkToward(thief.x, thief.y, dt, GUARD_CHASE_SPEED);
      this.facing = turnToward(this.facing, Math.atan2(thief.y - this.y, thief.x - this.x), dt * 6);
      return;
    }
    if (this.pause > 0) {
      this.pause -= dt;
      return;
    }
    const target = this.waypoints[this.targetIndex];
    const arrived = this.walkToward(target.x, target.y, dt);
    if (arrived) {
      this.targetIndex = (this.targetIndex + 1) % this.waypoints.length;
      this.pause = 1.4;
    }
  }

  // Step toward a point at patrol speed (or the speed given). Returns true on arrival.
  walkToward(tx, ty, dt, speed = GUARD_SPEED) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    const step = speed * dt;
    if (dist <= step) {
      this.x = tx;
      this.y = ty;
      return true;
    }
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    this.facing = turnToward(this.facing, Math.atan2(dy, dx), dt * 5);
    return false;
  }

  sees(tx, ty) {
    this.seesThief = insideCone(this.x, this.y, this.facing, this.coneRange, this.coneHalfAngle, tx, ty);
    return this.seesThief;
  }

  cone() {
    return conePolygon(this.x, this.y, this.facing, this.coneRange, this.coneHalfAngle);
  }
}

export class Camera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.minAngle = def.minAngle;
    this.maxAngle = def.maxAngle;
    this.speed = def.speed;
    this.coneRange = def.coneRange;
    this.coneHalfAngle = def.coneHalfAngle;
    this.angle = (def.minAngle + def.maxAngle) / 2;
    this.direction = 1;
    this.seesThief = false;
  }

  // Sweep from one limit to the other and back, like a real security camera.
  update(dt) {
    this.angle += this.direction * this.speed * dt;
    if (this.angle >= this.maxAngle) {
      this.angle = this.maxAngle;
      this.direction = -1;
    } else if (this.angle <= this.minAngle) {
      this.angle = this.minAngle;
      this.direction = 1;
    }
  }

  sees(tx, ty) {
    this.seesThief = insideCone(this.x, this.y, this.angle, this.coneRange, this.coneHalfAngle, tx, ty);
    return this.seesThief;
  }

  cone() {
    return conePolygon(this.x, this.y, this.angle, this.coneRange, this.coneHalfAngle);
  }
}
