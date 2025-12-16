import type { Buf, SimulationConfig } from "../types";

export function stepSequential(
  buf: Buf,
  dt: number,
  width: number,
  height: number,
  config: SimulationConfig
): void {
  const n = buf.length / 5;
  const { gravityOn, collisionsOn, windOn, activeType } = config;

  for (let i = 0; i < n; i++) {
    const b = i * 5;
    const type = buf[b + 4];
    if (activeType !== null && type !== activeType) continue;

    let x = buf[b];
    let y = buf[b + 1];
    let vx = buf[b + 2];
    let vy = buf[b + 3];

    // Apply gravity
    if (gravityOn) {
      vy += 9.81 * dt * 15;
    }

    // Apply wind effect
    if (windOn) {
      vx += Math.sin(y * 0.01) * dt * 50;
    }

    // Update position
    x += vx * dt;
    y += vy * dt;

    // Boundary collision with damping
    if (x < 0) {
      x = 0;
      vx = -vx * 0.8;
    }
    if (x > width) {
      x = width;
      vx = -vx * 0.8;
    }
    if (y < 0) {
      y = 0;
      vy = -vy * 0.8;
    }
    if (y > height) {
      y = height;
      vy = -Math.abs(vy) * 0.8;
    }

    // Simple collision/turbulence
    if (collisionsOn) {
      const turbulence = (Math.sin(x * 10 + y * 6) * 99) % 0.1;
      vx += (Math.random() - 0.5) * turbulence;
      vy += (Math.random() - 0.5) * turbulence;
    }

    // Write back
    buf[b] = x;
    buf[b + 1] = y;
    buf[b + 2] = vx;
    buf[b + 3] = vy;
  }
}

// Simulated parallel: process in batches to reduce cache misses
export function stepParallelSimulated(
  buf: Buf,
  dt: number,
  width: number,
  height: number,
  config: SimulationConfig,
  numWorkers: number
): void {
  const n = buf.length / 5;
  const { gravityOn, collisionsOn, windOn, activeType } = config;
  const chunkSize = Math.ceil(n / numWorkers);

  // Process in chunks (simulating parallel batches)
  for (let chunk = 0; chunk < numWorkers; chunk++) {
    const start = chunk * chunkSize;
    const end = Math.min(start + chunkSize, n);

    for (let i = start; i < end; i++) {
      const b = i * 5;
      const type = buf[b + 4];
      if (activeType !== null && type !== activeType) continue;

      let x = buf[b];
      let y = buf[b + 1];
      let vx = buf[b + 2];
      let vy = buf[b + 3];

      if (gravityOn) {
        vy += 9.81 * dt * 15;
      }

      if (windOn) {
        vx += Math.sin(y * 0.01) * dt * 50;
      }

      x += vx * dt;
      y += vy * dt;

      if (x < 0) {
        x = 0;
        vx = -vx * 0.8;
      }
      if (x > width) {
        x = width;
        vx = -vx * 0.8;
      }
      if (y < 0) {
        y = 0;
        vy = -vy * 0.8;
      }
      if (y > height) {
        y = height;
        vy = -Math.abs(vy) * 0.8;
      }

      if (collisionsOn) {
        const turbulence = (Math.sin(x * 10 + y * 6) * 99) % 0.1;
        vx += (Math.random() - 0.5) * turbulence;
        vy += (Math.random() - 0.5) * turbulence;
      }

      buf[b] = x;
      buf[b + 1] = y;
      buf[b + 2] = vx;
      buf[b + 3] = vy;
    }
  }
}
