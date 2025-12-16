import { useEffect, useRef } from "react";

interface PerformanceGraphProps {
  seqHistory: number[];
  parHistory: number[];
  seqMs: number;
  parMs: number;
}

export function PerformanceGraph({
  seqHistory,
  parHistory,
  seqMs,
  parMs,
}: PerformanceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Modern gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, "#0a0a1a");
    bgGradient.addColorStop(1, "#1a0a2e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // Grid lines for better readability
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Combined max for scaling
    const combined = [...seqHistory, ...parHistory];
    const maxVal = Math.max(8, ...combined, seqMs, parMs);

    const drawLine = (arr: number[], color: string, shadowColor: string) => {
      if (!arr || arr.length === 0) return;
      
      // Draw shadow/glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = shadowColor;
      
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      for (let i = 0; i < arr.length; i++) {
        const x = (i / Math.max(1, arr.length - 1)) * w;
        const y = h - Math.min(arr[i] / maxVal, 1) * (h - 10) - 5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    };

    drawLine(seqHistory, "#ff6b9d", "rgba(255, 107, 157, 0.5)"); // seq pink
    drawLine(parHistory, "#4ecdc4", "rgba(78, 205, 196, 0.5)"); // par cyan

    // Modern labels with badges
    ctx.shadowBlur = 0;
    
    // Sequential badge
    ctx.fillStyle = "rgba(255, 107, 157, 0.3)";
    ctx.fillRect(8, 8, 115, 20);
    ctx.fillStyle = "#ff6b9d";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText(`SEQ ${seqMs.toFixed(2)} ms`, 14, 22);
    
    // Parallel badge
    ctx.fillStyle = "rgba(78, 205, 196, 0.3)";
    ctx.fillRect(8, 32, 115, 20);
    ctx.fillStyle = "#4ecdc4";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText(`PAR ${parMs.toFixed(2)} ms`, 14, 46);

    // Max value indicator
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.fillText(`max: ${maxVal.toFixed(1)} ms`, w - 80, 15);

  }, [seqHistory, parHistory, seqMs, parMs]);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(40, 20, 60, 0.5) 0%, rgba(20, 10, 40, 0.6) 100%)",
      padding: 14,
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
    }}>
      <div style={{
        fontSize: 13,
        marginBottom: 10,
        fontWeight: 700,
        color: "#f0ecff",
        letterSpacing: "0.03em",
      }}>
        📈 Performance Graph
      </div>
      <canvas
        ref={canvasRef}
        width={360}
        height={160}
        style={{
          width: "100%",
          height: 160,
          background: "transparent",
          borderRadius: 8,
          border: "1px solid rgba(100, 60, 150, 0.3)",
        }}
      />
      <div style={{
        fontSize: 10,
        color: "#9ca3af",
        marginTop: 8,
        fontStyle: "italic",
        opacity: 0.7,
      }}>
        Real-time execution time history (last 200 frames)
      </div>
    </div>
  );
}
