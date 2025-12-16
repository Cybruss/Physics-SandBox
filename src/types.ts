export type Buf = Float32Array;

export interface SimulationConfig {
  gravityOn: boolean;
  collisionsOn: boolean;
  windOn: boolean;
  activeType: number | null;
  numParticles: number;
}

export interface PerformanceMetrics {
  ms: number;
  fps: number;
  avg: number;
}

export const particleTypes = ["Sand", "Smoke", "Fire", "Water"];
export const particleColors = ["#C2B280", "#888888", "yellow", "white"];
