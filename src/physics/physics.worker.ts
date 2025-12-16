// Web Worker for parallel physics computation
// This runs on a separate thread, enabling true parallelism

interface WorkerMessage {
  buffer: ArrayBuffer;
  dt: number;
  width: number;
  height: number;
  config: {
    gravityOn: boolean;
    collisionsOn: boolean;
    windOn: boolean;
    activeType: number | null;
  };
  startIndex: number;
  endIndex: number;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { buffer, dt, width, height, config, startIndex, endIndex } = e.data;
  const arr = new Float32Array(buffer);
  const { gravityOn, collisionsOn, windOn, activeType } = config;

  // Process the assigned chunk of particles
  for (let i = startIndex; i < endIndex; i++) {
    const b = i * 5;
    const type = arr[b + 4];
    if (activeType !== null && type !== activeType) continue;

    let x = arr[b];
    let y = arr[b + 1];
    let vx = arr[b + 2];
    let vy = arr[b + 3];

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

    // Write back to array
    arr[b] = x;
    arr[b + 1] = y;
    arr[b + 2] = vx;
    arr[b + 3] = vy;
  }

  // Send result back (transferable)
  // @ts-ignore - WorkerGlobalScope postMessage has different signature
  self.postMessage(arr.buffer, [arr.buffer]);
};
