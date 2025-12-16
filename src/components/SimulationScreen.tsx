import { useEffect, useRef, useState } from "react";
import type { Buf, SimulationConfig } from "../types";
import { initParticles } from "../physics/particles";
import { stepSequential, stepParallelSimulated } from "../physics/physicsEngine";
import { CanvasView } from "./CanvasView";
import { ControlPanel } from "./ControlPanel";
import { PerformanceGraph } from "./PerformanceGraph";

interface SimulationScreenProps {
  chosenType: number | null;
}

export function SimulationScreen({ chosenType }: SimulationScreenProps) {
  const rafRef = useRef<number | null>(null);
  const seqBuf = useRef<Buf | null>(null);
  const parBuf = useRef<Buf | null>(null);

  // UI / simulation toggles
  const [running, setRunning] = useState(true);
  const [numParticles, setNumParticles] = useState(8000);
  const [numWorkers, setNumWorkers] = useState(() => {
    const hc = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : 4;
    return Math.max(4, Math.min(16, hc * 2)); // Default to 2x cores, min 4, max 16
  });
  const [gravityOn, setGravityOn] = useState(true);
  const [collisionsOn, setCollisionsOn] = useState(true);
  const [windOn, setWindOn] = useState(true);
  const [activeType, setActiveType] = useState<number | null>(chosenType);

  // Performance metrics
  const [seqMs, setSeqMs] = useState(0);
  const [parMs, setParMs] = useState(0);
  const [fpsLeft, setFpsLeft] = useState(0);
  const [fpsRight, setFpsRight] = useState(0);

  // Histories for sparkline graph
  const seqHistoryRef = useRef<number[]>([]);
  const parHistoryRef = useRef<number[]>([]);
  const [, setGraphTick] = useState(0);

  // Canvas dimensions (tracked for physics bounds)
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);

  function resetAll() {
    // Initialize particles for both buffers
    const master = initParticles(numParticles, canvasWidth, canvasHeight);
    seqBuf.current = new Float32Array(master);
    parBuf.current = new Float32Array(master);

    // Clear histories
    seqHistoryRef.current = [];
    parHistoryRef.current = [];
    setSeqMs(0);
    setParMs(0);
    setFpsLeft(0);
    setFpsRight(0);
  }

  // Reset on mount / when particle count changes
  useEffect(() => {
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numParticles]);

  // Reset when worker count changes
  useEffect(() => {
    console.log(`[Effect] numWorkers changed to ${numWorkers}`);
    resetAll();
  }, [numWorkers]);

  // Main animation loop
  useEffect(() => {
    let last = performance.now();
    let framesLeft = 0;
    let framesRight = 0;
    let lastFPS = performance.now();

    const loop = async (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!running) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const config: SimulationConfig = {
        gravityOn,
        collisionsOn,
        windOn,
        activeType,
        numParticles,
      };

      // Sequential execution (always runs)
      const t0 = performance.now();
      if (seqBuf.current) {
        stepSequential(seqBuf.current, dt, canvasWidth, canvasHeight, config);
      }
      const t1 = performance.now();
      const seqMsFrame = t1 - t0;
      setSeqMs(seqMsFrame);
      seqHistoryRef.current.push(seqMsFrame);
      if (seqHistoryRef.current.length > 200) seqHistoryRef.current.shift();
      framesLeft++;

      // Parallel execution (simulated chunked processing)
      const t2 = performance.now();
      if (parBuf.current) {
        stepParallelSimulated(parBuf.current, dt, canvasWidth, canvasHeight, config, numWorkers);
      }
      const t3 = performance.now();
      const parMsFrame = t3 - t2;
      setParMs(parMsFrame);
      parHistoryRef.current.push(parMsFrame);
      if (parHistoryRef.current.length > 200) parHistoryRef.current.shift();
      framesRight++;

      // Update FPS counters
      const now2 = performance.now();
      if (now2 - lastFPS > 500) {
        setFpsLeft(Math.round((framesLeft / (now2 - lastFPS)) * 1000));
        setFpsRight(Math.round((framesRight / (now2 - lastFPS)) * 1000));
        framesLeft = 0;
        framesRight = 0;
        lastFPS = now2;
        setGraphTick((t) => t + 1);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    running,
    gravityOn,
    collisionsOn,
    windOn,
    activeType,
    canvasWidth,
    canvasHeight,
    numParticles,
  ]);

  // Calculate averages and ratio
  const seqAvg =
    seqHistoryRef.current.length
      ? seqHistoryRef.current.reduce((a, b) => a + b, 0) /
        seqHistoryRef.current.length
      : seqMs;
  const parAvg =
    parHistoryRef.current.length
      ? parHistoryRef.current.reduce((a, b) => a + b, 0) /
        parHistoryRef.current.length
      : parMs;
  const ratio = parAvg > 0 ? seqAvg / parAvg : null;

  // Update canvas dimensions for physics calculations
  useEffect(() => {
    const updateDimensions = () => {
      // Estimate canvas size based on window
      setCanvasWidth(Math.floor(window.innerWidth * 0.35));
      setCanvasHeight(480);
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e8e4f3",
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0f0520 100%)",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          margin: 0,
          marginBottom: 20,
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, #fff 0%, #c7b8ea 50%, #9d8fd9 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 0 30px rgba(157, 143, 217, 0.3)",
        }}
      >
        Physics Sandbox — Sequential vs Parallel
      </h1>

      <div style={{ display: "flex", gap: 16 }}>
        {/* LEFT: canvases side-by-side */}
        <div style={{ flex: 1.5 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <CanvasView
              buffer={seqBuf.current}
              filter={activeType}
              label="Sequential (main thread)"
              ms={seqMs}
              fps={fpsLeft}
              avg={seqAvg}
              gravityOn={gravityOn}
              collisionsOn={collisionsOn}
              windOn={windOn}
            />
            <CanvasView
              buffer={parBuf.current}
              filter={activeType}
              label={`Parallel (simulated: ${numWorkers} chunks)`}
              ms={parMs}
              fps={fpsRight}
              avg={parAvg}
              gravityOn={gravityOn}
              collisionsOn={collisionsOn}
              windOn={windOn}
            />
          </div>
        </div>

        {/* RIGHT: controls & graph */}
        <div>
          <ControlPanel
            numParticles={numParticles}
            setNumParticles={setNumParticles}
            numWorkers={numWorkers}
            setNumWorkers={setNumWorkers}
            activeType={activeType}
            setActiveType={setActiveType}
            gravityOn={gravityOn}
            setGravityOn={setGravityOn}
            collisionsOn={collisionsOn}
            setCollisionsOn={setCollisionsOn}
            windOn={windOn}
            setWindOn={setWindOn}
            running={running}
            setRunning={setRunning}
            onReset={resetAll}
            seqAvg={seqAvg}
            parAvg={parAvg}
            ratio={ratio}
            seqHistory={seqHistoryRef.current}
            parHistory={parHistoryRef.current}
          />
          <div style={{ marginTop: 12 }}>
            <PerformanceGraph
              seqHistory={seqHistoryRef.current}
              parHistory={parHistoryRef.current}
              seqMs={seqMs}
              parMs={parMs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
