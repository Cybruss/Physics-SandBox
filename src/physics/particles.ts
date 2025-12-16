import type { Buf } from "../types";

export function initParticles(count: number, width: number, height: number): Buf {
  const arr = new Float32Array(count * 5);
  for (let i = 0; i < count; i++) {
    const base = i * 5;
    arr[base] = Math.random() * width;
    arr[base + 1] = Math.random() * height;
    arr[base + 2] = (Math.random() - 0.5) * 80; // vx
    arr[base + 3] = (Math.random() - 0.5) * 80; // vy
    arr[base + 4] = Math.floor(Math.random() * 4); // type (0-3)
  }
  return arr;
}
