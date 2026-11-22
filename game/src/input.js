// input.js — keyboard and mouse: WASD or arrow keys to walk, click to walk to
// a spot, E to toss a distraction coin, Enter or a click to start and restart.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.moveTarget = null;
    this.coinTossed = false;
    this.startPressed = false;
    this.canvas = canvas;

    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }
      this.keys.add(event.key.toLowerCase());
      if (event.key === 'Enter' || event.key === ' ') this.startPressed = true;
      if (event.key.toLowerCase() === 'e') this.coinTossed = true;
      // Any key cancels a click-to-move walk.
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase())) {
        this.moveTarget = null;
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
    canvas.addEventListener('mousedown', (event) => {
      this.startPressed = true;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.moveTarget = {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    });
    canvas.addEventListener('blur', () => this.keys.clear());
  }

  // The walk direction from the keys: a normalised { x, y } or null.
  keyDirection() {
    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x === 0 && y === 0) return null;
    const len = Math.hypot(x, y);
    return { x: x / len, y: y / len };
  }

  // True once when Enter, Space or a click happens; then it resets.
  takeStartPress() {
    const pressed = this.startPressed;
    this.startPressed = false;
    return pressed;
  }

  // True once when E is pressed; then it resets.
  takeCoinToss() {
    const tossed = this.coinTossed;
    this.coinTossed = false;
    return tossed;
  }
}
