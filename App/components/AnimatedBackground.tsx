// components/AnimatedBackground.tsx
import { useEffect, useRef } from "react";

/**
 * AnimatedBackground
 * - Full-viewport canvas with soft particles + link lines
 * - Colors come from CSS vars (see CSS below), so dark/light switches instantly
 * - Pauses for prefers-reduced-motion users
 */
export default function AnimatedBackground({
  density = 0.00008,   // particles per pixel; lower = fewer
  maxSpeed = 0.25,     // px per frame (before DPR scaling)
  className = "",
}: {
  density?: number;
  maxSpeed?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    function readVar(name: string, fallback: string) {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }

    function resize() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];

    function seed() {
      const count = Math.round(window.innerWidth * window.innerHeight * density);
      pts = new Array(count).fill(0).map(() => {
        const r = 1 + Math.random() * 1.7;
        const vx = (Math.random() * 2 - 1) * maxSpeed;
        const vy = (Math.random() * 2 - 1) * maxSpeed;
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx,
          vy,
          r,
        };
      });
    }

    function frame() {
      const dot = readVar("--abg-dot", "#94a3b8");
      const link = readVar("--abg-link", "#64748b44");
      const glow = readVar("--abg-glow", "#60a5fa33");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // move + draw particles
      ctx.fillStyle = dot;
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = window.innerWidth + 5;
        if (p.x > window.innerWidth + 5) p.x = -5;
        if (p.y < -5) p.y = window.innerHeight + 5;
        if (p.y > window.innerHeight + 5) p.y = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // link close neighbors
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            ctx.strokeStyle = link;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // soft vignette glow
      const g = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      g.addColorStop(0, "transparent");
      g.addColorStop(1, glow);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      raf = requestAnimationFrame(frame);
    }

    function start() {
      resize();
      seed();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      cancelAnimationFrame(raf);
    }
    function handle() {
      stop();
      if (mql.matches) {
        // reduced motion requested
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      start();
    }

    window.addEventListener("resize", () => {
      resize();
      seed();
    });
    // re-read colors on theme class change
    const mo = new MutationObserver(() => { /* colors pulled each frame */ });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    handle();
    stopRef.current = stop;

    return () => {
      stop();
      mo.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [density, maxSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={`abg-canvas ${className}`}
      aria-hidden="true"
    />
  );
}
