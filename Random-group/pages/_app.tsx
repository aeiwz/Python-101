// pages/_app.tsx
import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <header>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7c4-5 12-5 16 0M4 17c4 5 12 5 16 0" stroke="#7dd3fc" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <h1>DNA Base Game — Admin</h1>
      </header>
      <main className="container">
        <Component {...pageProps} />
      </main>
    </>
  );
}
