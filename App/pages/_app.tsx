// pages/_app.tsx
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import "@/styles/animated-background.css";
import AnimatedBackground from "@/components/AnimatedBackground";
import Footer from "@/components/Footer";
import Head from "next/head";
import { useEffect, useState } from "react";
import { ImCool } from "react-icons/im";
import { SiPython } from "react-icons/si";

type Theme = "light" | "dark";

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  // iOS/Android viewport polyfill for 100vh issues
  useEffect(() => {
    const setVh = () => {
      const vh = (window.innerHeight || document.documentElement.clientHeight) * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh, { passive: true });
    window.addEventListener("orientationchange", setVh, { passive: true });
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    if (vv?.addEventListener) vv.addEventListener("resize", setVh as any, { passive: true });
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      if (vv?.removeEventListener) vv.removeEventListener("resize", setVh as any);
    };
  }, []);

  // Initial theme: localStorage -> OS preference -> dark
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null);
    const system: Theme =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    const initial = saved ?? system ?? "dark";
    setTheme(initial);

    const root = document.documentElement;
    root.setAttribute("data-bs-theme", initial);
    root.setAttribute("data-theme", initial);
    root.classList.toggle("dark", initial === "dark");
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-bs-theme", theme);
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        />
        <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <title>Python Programming 101</title>

        {/* Pre-paint theme + .dark class to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (!t) { t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
    var r = document.documentElement;
    r.setAttribute('data-bs-theme', t);
    r.setAttribute('data-theme', t);
    r.classList.toggle('dark', t === 'dark');
  } catch(e) {}
}());
            `.trim(),
          }}
        />
      </Head>

      {/* Animated background behind everything */}
      <AnimatedBackground
        density={0.00005}      // mobile-friendly
        maxParticles={120}
        targetFps={30}
        linkDistance={90}
      />

      {/* Your app content above the canvas */}
      <div className="container py-3 abg-content">
        <nav className="navbar navbar-expand-lg border-bottom mb-3">
          <div className="container-fluid">
            <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="/">
              <SiPython /> <span>Python1</span><ImCool />1
            </a>
            <div className="d-flex gap-2">
              <a href="/console" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-terminal" /> Console
              </a>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="btn btn-primary btn-sm"
                aria-label="Toggle theme"
              >
                <i className={theme === "dark" ? "bi bi-brightness-high" : "bi bi-moon-stars"} />
              </button>
            </div>
          </div>
        </nav>

        <Component {...pageProps} />
      </div>
      <Footer />
    </>
  );
}
