import { useEffect, useRef } from "react";
import type { Buf } from "../types";
import { particleColors } from "../types";

interface CanvasViewProps {
  buffer: Buf | null;
  filter: number | null;
  label: string;
  ms: number;
  fps: number;
  avg: number;
  gravityOn: boolean;
  collisionsOn: boolean;
  windOn: boolean;
}

export function CanvasView({
  buffer,
  filter,
  label,
  ms,
  fps,
  avg,
  gravityOn,
  collisionsOn,
  windOn,
}: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Draw particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    const n = buffer.length / 5;

    // Draw particles
    for (let i = 0; i < n; i++) {
      const b = i * 5;
      const type = buffer[b + 4];
      if (filter !== null && type !== filter) continue;

      const x = buffer[b];
      const y = buffer[b + 1];
      ctx.fillStyle = particleColors[type];
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }

    // Add subtle visual effects for enabled features
    if (gravityOn) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "rgba(0,255,255,0.05)");
      grad.addColorStop(1, "rgba(0,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    if (collisionsOn) {
      const grad = ctx.createLinearGradient(0, h, w, 0);
      grad.addColorStop(0, "rgba(255,0,0,0.03)");
      grad.addColorStop(1, "rgba(255,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    if (windOn) {
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(0,255,0,0.03)");
      grad.addColorStop(1, "rgba(0,255,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  });

  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(135deg, rgba(60, 20, 90, 0.4) 0%, rgba(30, 10, 50, 0.6) 100%)",
        borderRadius: 12,
        padding: 14,
        boxShadow: "0 8px 32px rgba(100, 50, 150, 0.4), 0 0 0 1px rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          marginBottom: 8,
          color: "#e8e4f3",
          fontWeight: 600,
          letterSpacing: "0.02em",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: "100%",
          height: 480,
          border: "2px solid rgba(100, 60, 150, 0.4)",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "linear-gradient(135deg, #0a0012 0%, #1a0028 100%)",
          }}
        />
      </div>
      <div style={{ 
        marginTop: 10, 
        fontSize: 13, 
        color: "#d4d0e3",
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <span style={{
          background: "rgba(100, 60, 200, 0.3)",
          padding: "4px 10px",
          borderRadius: 6,
          fontWeight: 600,
        }}>
          {ms.toFixed(2)} ms
        </span>
        <span style={{
          background: "rgba(60, 150, 100, 0.3)",
          padding: "4px 10px",
          borderRadius: 6,
          fontWeight: 600,
        }}>
          {fps} FPS
        </span>
        <span style={{ 
          fontSize: 11, 
          opacity: 0.8,
          padding: "4px 8px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: 4,
        }}>
          avg: {avg.toFixed(2)} ms
        </span>
      </div>
    </div>
  );
}
