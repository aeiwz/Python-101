// pages/_app.tsx
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Footer from "@/components/Footer";
import Head from "next/head";
import { useEffect, useState } from "react";
import { ImCool } from "react-icons/im";
import { SiPython } from "react-icons/si";

type Theme = "light" | "dark";

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Initial theme: localStorage -> OS preference -> "dark"
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null);
    const system: Theme =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light" : "dark";
    const initial = saved ?? system;
    setTheme(initial);
    document.documentElement.setAttribute("data-bs-theme", initial); // Bootstrap
    document.documentElement.setAttribute("data-theme", initial);    // YOUR CSS
  }, []);

  // Apply on changes
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"/>
        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"/>
        <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <title>Python Programming1< ImCool />1</title>

        {/* Prevent flash of wrong theme on first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (!t) {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-bs-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
}());
            `.trim()
          }}
        />
      </Head>

      <div className="container py-3">
        <nav className="navbar navbar-expand-lg border-bottom mb-3">
          <div className="container-fluid">
            <a className="navbar-brand fw-bold" href="/">
              <i className="bi "/> < SiPython /> Python1<ImCool />1
            </a>
            <div className="d-flex gap-2">
              <a href="/console" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-terminal"/> Console
              </a>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="btn btn-primary btn-sm" aria-label="Toggle theme">
                <i className={theme === "dark" ? "bi bi-moon-stars" : "bi bi-brightness-high"} />
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