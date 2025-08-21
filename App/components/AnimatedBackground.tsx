// components/AnimatedBackground.tsx
import { useEffect, useRef } from "react";

type Props = {
  density?: number;         // particles per pixel
  maxSpeed?: number;        // px per frame (pre-DPR)
  linkDistance?: number;    // px for linking lines
  maxParticles?: number;    // absolute cap (mobile-friendly)
  targetFps?: number;       // throttle, e.g., 30 on mobile
  className?: string;
  respectReducedMotion?: boolean;
};

export default function AnimatedBackground({
  density = 0.00008,
  maxSpeed = 0.75,
  linkDistance = 110,
  maxParticles = 160,           // <- hard cap for mobile
  targetFps = 30,               // <- throttle to 30 fps
  className = "",
  respectReducedMotion = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    function readVar(name: string, fallback: string) {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }

    function resize() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];

    function seed() {
      const area = window.innerWidth * window.innerHeight;
      const n = Math.min(maxParticles, Math.max(8, Math.round(area * density)));
      pts = new Array(n).fill(0).map(() => {
        const r = 1 + Math.random() * 1.7;
        const vx = (Math.random() * 2 - 1) * maxSpeed;
        const vy = (Math.random() * 2 - 1) * maxSpeed;
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx, vy, r,
        };
      });
    }

    // Spatial grid for neighbor search (near-linear)
    const grid = new Map<number, number[]>(); // cellKey -> particle indices
    let cols = 0, rows = 0, cell = Math.max(40, Math.min(140, linkDistance)); // clamp
    const link2 = linkDistance * linkDistance;

    function buildGrid() {
      grid.clear();
      cols = Math.max(1, Math.ceil(window.innerWidth / cell));
      rows = Math.max(1, Math.ceil(window.innerHeight / cell));
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / cell)));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / cell)));
        const key = cy * cols + cx;
        let arr = grid.get(key);
        if (!arr) grid.set(key, (arr = []));
        arr.push(i);
      }
    }

    // RAF throttle
    const frameInterval = 1000 / Math.max(10, targetFps);
    let raf = 0;
    let last = performance.now();

    function frame(now: number) {
      if (now - last < frameInterval) { raf = requestAnimationFrame(frame); return; }
      last = now;

      const dot = readVar("--abg-dot", "#94a3b8");
      const link = readVar("--abg-link", "#64748b44");
      const glow = readVar("--abg-glow", "#60a5fa33");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // move + draw particles
      ctx.fillStyle = dot;
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5) p.x = window.innerWidth + 5;
        if (p.x > window.innerWidth + 5) p.x = -5;
        if (p.y < -5) p.y = window.innerHeight + 5;
        if (p.y > window.innerHeight + 5) p.y = -5;

        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      // rebuild grid & link neighbors in nearby cells
      buildGrid();
      ctx.lineWidth = 1;
      ctx.strokeStyle = link;

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const baseKey = cy * cols + cx;
          const cells = [
            baseKey,
            baseKey + 1,
            baseKey + cols,
            baseKey + cols + 1,
            baseKey - 1,
            baseKey - cols,
            baseKey - cols - 1,
            baseKey - cols + 1,
            baseKey + cols - 1,
          ];
          // merge particle indices from these cells
          const idxs: number[] = [];
          for (const k of cells) {
            const arr = grid.get(k);
            if (arr) idxs.push(...arr);
          }
          // link pairs in this local set (still much smaller than global n²)
          for (let i = 0; i < idxs.length; i++) {
            const a = pts[idxs[i]];
            for (let j = i + 1; j < idxs.length; j++) {
              const b = pts[idxs[j]];
              const dx = a.x - b.x, dy = a.y - b.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < link2) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // soft vignette
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
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() { cancelAnimationFrame(raf); }

    // Start/stop respecting reduced motion if requested
    function handle() {
      stop();
      if (respectReducedMotion && mql.matches) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      start();
    }

    // Stable handlers so we can remove them
    const onResize = () => { resize(); seed(); };

    window.addEventListener("resize", onResize, { passive: true });
    const mo = new MutationObserver(() => { /* colors are read each frame */ });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    handle();
    stopRef.current = stop;

    return () => {
      stop();
      mo.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [density, maxSpeed, linkDistance, maxParticles, targetFps, respectReducedMotion]);

  return <canvas ref={canvasRef} className={`abg-canvas ${className}`} aria-hidden="true" />;
}
