import { useEffect, useRef, useState } from "react";
import { particleTypes } from "../types";

interface LandingScreenProps {
  onStart: (type: number | null) => void;
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparkles = useRef<
    { x: number; y: number; size: number; speed: number }[]
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    sparkles.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.5,
    }));

    let animationFrame = 0;
    const animate = () => {
      if (!ctx) return;
      const t = Date.now() * 0.0005;
      const gradient = ctx.createLinearGradient(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );
      gradient.addColorStop(0, `hsl(${(t * 30) % 360}, 85%, 12%)`);
      gradient.addColorStop(0.3, `hsl(${(t * 40 + 40) % 360}, 75%, 18%)`);
      gradient.addColorStop(0.7, `hsl(${(t * 50 + 80) % 360}, 80%, 22%)`);
      gradient.addColorStop(1, `hsl(${(t * 60 + 120) % 360}, 90%, 15%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      sparkles.current.forEach((s) => {
        const alpha = 0.4 + Math.sin(t * 2 + s.x) * 0.3;
        ctx.globalAlpha = alpha;
        const hue = (t * 100 + s.x * 0.2) % 360;
        ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        s.y -= s.speed;
        if (s.y < 0) s.y = window.innerHeight;
      });
      ctx.globalAlpha = 1;

      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          padding: "2vw",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            fontWeight: 900,
            textShadow:
              "0 0 30px rgba(138, 43, 226, 0.8), 0 0 60px rgba(0, 212, 255, 0.6), 0 0 90px rgba(255, 20, 147, 0.4)",
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #fff 0%, #e0c3fc 50%, #8ec5fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Parallel Physics Sandbox
        </h1>
        <p
          style={{
            fontSize: "clamp(1.1rem, 1.8vw, 1.6rem)",
            maxWidth: "90vw",
            marginBottom: "2.5rem",
            opacity: 0.95,
            lineHeight: 1.6,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          Experience thousands of particles moving in real time! Compare
          Sequential vs Parallel execution, explore physics, and enjoy
          mesmerizing particle motion.
        </p>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)",
            padding: "1.5rem 2rem",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            maxWidth: "90vw",
            marginBottom: "2.5rem",
          }}
        >
          <h3 style={{
            marginTop: 0,
            marginBottom: "1rem",
            fontSize: "clamp(1.3rem, 2vw, 1.8rem)",
            fontWeight: 700,
            color: "#fff",
          }}>How It Works</h3>
          <p style={{ 
            fontSize: "clamp(0.9rem, 1.1vw, 1.1rem)", 
            opacity: 0.9,
            lineHeight: 1.8,
            margin: 0,
          }}>
            <strong style={{ color: "#ffd6a5" }}>Sequential:</strong> Updates each particle one by one on the
            main thread.
            <br />
            <strong style={{ color: "#caffbf" }}>Parallel:</strong> Distributes particle updates across
            multiple chunks for optimized processing.
            <br />
            <strong style={{ color: "#a9def9" }}>Wind:</strong> Applies horizontal motion to particles for a
            natural flow effect.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1vw",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={() => setSelectedType(null)}
            style={{
              padding: "0.7rem 1.5rem",
              borderRadius: 12,
              border: selectedType === null ? "2px solid #ffb703" : "2px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
              background: selectedType === null 
                ? "linear-gradient(135deg, #ffb703 0%, #ff8c00 100%)" 
                : "rgba(255,255,255,0.1)",
              color: selectedType === null ? "#1a0a2e" : "white",
              fontWeight: 700,
              fontSize: "clamp(0.9rem, 1vw, 1rem)",
              transition: "all 0.3s ease",
              boxShadow: selectedType === null ? "0 4px 15px rgba(255, 183, 3, 0.4)" : "none",
              backdropFilter: "blur(8px)",
            }}
          >
            All
          </button>
          {particleTypes.map((name, i) => (
            <button
              key={i}
              onClick={() => setSelectedType(i)}
              style={{
                padding: "0.7rem 1.5rem",
                borderRadius: 12,
                border: selectedType === i ? "2px solid #ffb703" : "2px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
                background: selectedType === i 
                  ? "linear-gradient(135deg, #ffb703 0%, #ff8c00 100%)" 
                  : "rgba(255,255,255,0.1)",
                color: selectedType === i ? "#1a0a2e" : "white",
                fontWeight: 700,
                fontSize: "clamp(0.9rem, 1vw, 1rem)",
                transition: "all 0.3s ease",
                boxShadow: selectedType === i ? "0 4px 15px rgba(255, 183, 3, 0.4)" : "none",
                backdropFilter: "blur(8px)",
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "3rem", position: "relative", top: "-50px" }}>
          <button
            onClick={() => onStart(selectedType)}
            style={{
              padding: "1.3rem 3.5rem",
              borderRadius: 16,
              border: "2px solid rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              fontWeight: 800,
              background: "linear-gradient(135deg, #ff006e 0%, #d90057 50%, #ff006e 100%)",
              color: "#fff",
              boxShadow:
                "0 0 30px rgba(255,0,110,0.8), 0 0 60px rgba(255,110,199,0.6), 0 8px 25px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(255,0,110,1), 0 0 80px rgba(255,110,199,0.8), 0 12px 35px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(255,0,110,0.8), 0 0 60px rgba(255,110,199,0.6), 0 8px 25px rgba(0,0,0,0.3)";
            }}
          >
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
