// pages/admin.tsx
import { useEffect, useState } from "react";
import DeckGrid from "@/components/DeckGrid";
import { FaDna } from "react-icons/fa";
import { FiPrinter, FiDownload, FiRefreshCw } from "react-icons/fi";

type Card = { id: string; base: "A" | "T" | "C" | "G"; usedAt?: string | null };
type Summary = { total: number; counts: { A: number; T: number; C: number; G: number }; used: number };

export default function Admin() {
  const [cards, setCards] = useState<Card[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [count, setCount] = useState<number>(40);
  const [seed, setSeed] = useState<string>("");

  async function refresh() {
    const r = await fetch("/api/cards");
    const j = await r.json();
    setCards(j.cards ?? []);
    setSummary(j.summary ?? null);
  }

  useEffect(() => { refresh(); }, []);

  async function generate() {
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate", count, seed }),
    });
    await refresh();
  }

  function printCards() { window.print(); }
  function exportCSV() { window.open("/api/cards/export", "_blank"); }
  async function resetAll() {
    if (!confirm("Clear ALL saved data (cards, order, used log, student mappings)?")) return;
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    await refresh();
  }

  return (
    <>
      <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FaDna size={22} color="var(--accent)" />
        <h1>DNA Base Game — Admin</h1>
      </header>

      <p className="hint">Generate print-ready cards (each card = 1 ID, 1 base). Export CSV or print. Reset wipes Redis too.</p>

      <div className="controls">
        <div>
          <label htmlFor="count">Number of students</label>
          <input
            type="number"
            id="count"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value || "0", 10))}
          />
        </div>
        <div>
          <label htmlFor="seed">Seed (optional, reproducible shuffle)</label>
          <input
            type="text"
            id="seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="e.g. CLASS8-2025"
          />
        </div>

        <button className="primary" onClick={generate}><FaDna /> Generate cards</button>
        <button onClick={printCards}><FiPrinter /> Print cards</button>
        <button onClick={exportCSV}><FiDownload /> Export CSV</button>
        <button className="warn" onClick={resetAll}><FiRefreshCw /> Reset</button>
      </div>

      <div className="hint" id="summary">
        {summary && (
          <>
            <b>{summary.total}</b> cards →&nbsp;
            <span className="pill" data-b="A">A: {summary.counts.A}</span>&nbsp;
            <span className="pill" data-b="T">T: {summary.counts.T}</span>&nbsp;
            <span className="pill" data-b="C">C: {summary.counts.C}</span>&nbsp;
            <span className="pill" data-b="G">G: {summary.counts.G}</span>
          </>
        )}
      </div>

      <DeckGrid cards={cards} />
    </>
  );
}
