import type { Buf, SimulationConfig } from "../types";

export class ParallelPhysicsEngine {
  private workers: Worker[] = [];
  private numWorkers: number;
  private resultHandlers: Map<number, (result: Float32Array) => void> = new Map();

  constructor(numWorkers: number = 4) {
    this.numWorkers = numWorkers;
    this.initWorkers();
  }

  private initWorkers(): void {
    // Terminate old workers if any
    for (const w of this.workers) {
      w.terminate();
    }
    this.workers = [];
    this.resultHandlers.clear();
    
    // Create worker pool with persistent handlers
    for (let i = 0; i < this.numWorkers; i++) {
      const worker = new Worker(
        new URL("./physics.worker.ts", import.meta.url),
        { type: "module" }
      );
      
      // Single persistent message handler per worker
      worker.onmessage = (msg: MessageEvent) => {
        const handler = this.resultHandlers.get(i);
        if (handler) {
          handler(new Float32Array(msg.data));
          this.resultHandlers.delete(i);
        }
      };
      
      this.workers.push(worker);
    }
    console.log(`✓ Initialized ${this.numWorkers} physics workers`);
  }

  setNumWorkers(newCount: number): void {
    if (newCount !== this.numWorkers && newCount >= 1 && newCount <= 32) {
      console.log(`Changing workers: ${this.numWorkers} → ${newCount}`);
      this.numWorkers = newCount;
      this.initWorkers();
    }
  }

  initSharedBuffer(size: number): Buf {
    return new Float32Array(size);
  }

  async stepParallel(
    buf: Buf,
    dt: number,
    width: number,
    height: number,
    config: SimulationConfig
  ): Promise<void> {
    const n = buf.length / 5;
    const chunkSize = Math.ceil(n / this.numWorkers);

    const promises: Promise<void>[] = [];

    for (let i = 0; i < this.numWorkers; i++) {
      const startIndex = i * chunkSize;
      const endIndex = Math.min((i + 1) * chunkSize, n);
      if (startIndex >= n) break;

      const worker = this.workers[i];
      const chunkStart = startIndex * 5;
      const chunkEnd = endIndex * 5;

      const promise = new Promise<void>((resolve) => {
        // Set handler for this worker
        this.resultHandlers.set(i, (result: Float32Array) => {
          buf.set(result, chunkStart);
          resolve();
        });

        // Send chunk data (structured clone, fast for modern browsers)
        const chunkData = buf.slice(chunkStart, chunkEnd);
        worker.postMessage({
          buffer: chunkData.buffer,
          dt,
          width,
          height,
          config: {
            gravityOn: config.gravityOn,
            collisionsOn: config.collisionsOn,
            windOn: config.windOn,
            activeType: config.activeType,
          },
          startIndex: 0,
          endIndex: endIndex - startIndex,
        });
      });

      promises.push(promise);
    }

    await Promise.all(promises);
  }

  destroy(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
  }
}
