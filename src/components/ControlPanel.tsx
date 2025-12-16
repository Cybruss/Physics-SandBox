
import { particleTypes } from "../types";

interface ControlPanelProps {
  numParticles: number;
  setNumParticles: (n: number) => void;
  numWorkers: number;
  setNumWorkers: (w: number) => void;
  activeType: number | null;
  setActiveType: (t: number | null) => void;
  gravityOn: boolean;
  setGravityOn: (g: boolean) => void;
  collisionsOn: boolean;
  setCollisionsOn: (c: boolean) => void;
  windOn: boolean;
  setWindOn: (w: boolean) => void;
  running: boolean;
  setRunning: (r: boolean) => void;
  onReset: () => void;
  seqAvg: number;
  parAvg: number;
  ratio: number | null;
  seqHistory: number[];
  parHistory: number[];
}

export function ControlPanel({
  numParticles,
  setNumParticles,
  numWorkers,
  setNumWorkers,
  activeType,
  setActiveType,
  gravityOn,
  setGravityOn,
  collisionsOn,
  setCollisionsOn,
  windOn,
  setWindOn,
  running,
  setRunning,
  onReset,
  seqAvg,
  parAvg,
  ratio,
  seqHistory,
  parHistory,
}: ControlPanelProps) {
  return (
    <div
      style={{
        width: 400,
        background: "linear-gradient(135deg, rgba(60, 20, 90, 0.5) 0%, rgba(30, 10, 50, 0.7) 100%)",
        padding: 20,
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(120, 60, 200, 0.5), 0 0 0 1px rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          color: "#e8e4f3", 
          fontWeight: 600, 
          fontSize: 14,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <span>Particles</span>
          <span style={{
            background: "rgba(100, 60, 200, 0.4)",
            padding: "2px 10px",
            borderRadius: 6,
            fontSize: 13,
          }}>{numParticles}</span>
        </label>
        <input
          type="range"
          min={1000}
          max={30000}
          step={1000}
          value={numParticles}
          onChange={(e) => setNumParticles(parseInt(e.target.value))}
          style={{ 
            width: "100%",
            height: 6,
            borderRadius: 3,
            background: "rgba(100, 60, 200, 0.3)",
            outline: "none",
            cursor: "pointer",
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          color: "#e8e4f3", 
          fontWeight: 600, 
          fontSize: 14,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <span>Worker Chunks</span>
          <span style={{
            background: "rgba(100, 200, 150, 0.3)",
            padding: "2px 10px",
            borderRadius: 6,
            fontSize: 13,
          }}>{numWorkers}</span>
        </label>
        <input
          type="range"
          min={1}
          max={32}
          step={1}
          value={numWorkers}
          onChange={(e) => setNumWorkers(parseInt(e.target.value))}
          style={{ 
            width: "100%",
            height: 6,
            borderRadius: 3,
            background: "rgba(100, 200, 150, 0.3)",
            outline: "none",
            cursor: "pointer",
          }}
        />
        <div style={{ 
          fontSize: 11, 
          color: "#b8b0d0",
          marginTop: 6,
          opacity: 0.8,
        }}>
          CPU cores: {navigator.hardwareConcurrency || "unknown"} | Range: 1-32 chunks
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          color: "#e8e4f3", 
          fontWeight: 600, 
          fontSize: 14,
          display: "block",
          marginBottom: 8,
        }}>
          Particle Type
        </label>
        <select
          value={activeType ?? ""}
          onChange={(e) =>
            setActiveType(e.target.value === "" ? null : parseInt(e.target.value))
          }
          style={{
            width: "100%",
            background: "rgba(60, 30, 90, 0.6)",
            color: "#e8e4f3",
            borderRadius: 8,
            padding: 10,
            border: "1px solid rgba(255,255,255,0.15)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="">All Types</option>
          {particleTypes.map((p, i) => (
            <option key={i} value={i}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div style={{ 
        display: "flex", 
        gap: 16, 
        marginBottom: 16,
        flexWrap: "wrap",
      }}>
        <label style={{ 
          fontSize: 13, 
          color: "#d8d4e8",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
        }}>
          <input
            type="checkbox"
            checked={gravityOn}
            onChange={() => setGravityOn(!gravityOn)}
            style={{ cursor: "pointer", width: 16, height: 16 }}
          />
          Gravity
        </label>
        <label style={{ 
          fontSize: 13, 
          color: "#d8d4e8",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
        }}>
          <input
            type="checkbox"
            checked={collisionsOn}
            onChange={() => setCollisionsOn(!collisionsOn)}
            style={{ cursor: "pointer", width: 16, height: 16 }}
          />
          Collision
        </label>
        <label style={{ 
          fontSize: 13, 
          color: "#d8d4e8",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
        }}>
          <input
            type="checkbox"
            checked={windOn}
            onChange={() => setWindOn(!windOn)}
            style={{ cursor: "pointer", width: 16, height: 16 }}
          />
          Wind
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          onClick={() => setRunning(!running)}
          style={{
            flex: 1,
            padding: 12,
            background: running 
              ? "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)"
              : "linear-gradient(135deg, #00d4aa 0%, #00b894 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: running
              ? "0 4px 15px rgba(255, 107, 53, 0.4)"
              : "0 4px 15px rgba(0, 212, 170, 0.4)",
            transition: "all 0.3s ease",
          }}
        >
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          onClick={onReset}
          style={{
            flex: 1,
            padding: 12,
            background: "linear-gradient(135deg, rgba(100, 60, 200, 0.4) 0%, rgba(60, 30, 120, 0.6) 100%)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
        >
          🔄 Reset
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 14,
          background: "rgba(40, 20, 60, 0.5)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            marginBottom: 10,
            fontWeight: 700,
            color: "#f0ecff",
            letterSpacing: "0.03em",
          }}
        >
          📊 Performance Comparison
        </div>
        <div style={{ 
          fontSize: 13, 
          marginBottom: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ color: "#d8d4e8" }}>Sequential avg:</span>
          <span style={{
            background: "rgba(255, 102, 102, 0.3)",
            padding: "3px 10px",
            borderRadius: 6,
            fontWeight: 600,
            color: "#ffb3b3",
          }}>{seqAvg.toFixed(2)} ms</span>
        </div>
        <div style={{ 
          fontSize: 13,
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ color: "#d8d4e8" }}>Parallel avg:</span>
          <span style={{
            background: "rgba(102, 184, 255, 0.3)",
            padding: "3px 10px",
            borderRadius: 6,
            fontWeight: 600,
            color: "#b3d9ff",
          }}>{parAvg.toFixed(2)} ms</span>
        </div>
        <div style={{ 
          fontSize: 14, 
          marginTop: 12,
          padding: 10,
          background: "rgba(0,0,0,0.2)",
          borderRadius: 8,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 12, color: "#b8b0d0", marginBottom: 4 }}>Speedup</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {ratio ? ratio.toFixed(2) : "—"}×
          </div>
          {ratio && ratio > 1 ? (
            <div style={{ color: "#00ff88", fontSize: 13, marginTop: 4, fontWeight: 600 }}>
              ⚡ {((ratio - 1) * 100).toFixed(0)}% faster
            </div>
          ) : ratio && ratio < 1 ? (
            <div style={{ color: "#ff6666", fontSize: 13, marginTop: 4, fontWeight: 600 }}>
              🐌 {((1 - ratio) * 100).toFixed(0)}% slower
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          background: "rgba(35, 15, 50, 0.5)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 13,
            marginBottom: 10,
            fontWeight: 700,
            color: "#f0ecff",
            letterSpacing: "0.03em",
          }}
        >
          ⏱️ Latest Frame Times
        </div>
        <div style={{ 
          fontSize: 12, 
          color: "#d8d4e8",
          marginBottom: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>Sequential:</span>
          <span style={{
            background: "rgba(255, 102, 102, 0.25)",
            padding: "2px 8px",
            borderRadius: 5,
            fontWeight: 600,
          }}>
            {seqHistory.length
              ? seqHistory[seqHistory.length - 1].toFixed(2)
              : 0}{" "}
            ms
          </span>
        </div>
        <div style={{ 
          fontSize: 12, 
          color: "#d8d4e8",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>Parallel:</span>
          <span style={{
            background: "rgba(102, 184, 255, 0.25)",
            padding: "2px 8px",
            borderRadius: 5,
            fontWeight: 600,
          }}>
            {parHistory.length
              ? parHistory[parHistory.length - 1].toFixed(2)
              : 0}{" "}
            ms
          </span>
        </div>
        <div style={{ 
          fontSize: 10, 
          color: "#9ca3af", 
          marginTop: 8,
          fontStyle: "italic",
          opacity: 0.7,
        }}>
          Real-time performance metrics from the last frame.
        </div>
      </div>
    </div>
  );
}
