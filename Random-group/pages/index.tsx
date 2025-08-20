// pages/index.tsx
import Link from "next/link";
import { useState } from "react";
import { FaDna, FaGamepad } from "react-icons/fa";
import { FiSettings, FiSearch } from "react-icons/fi";
import { BiTestTube } from "react-icons/bi";
import { MdErrorOutline } from "react-icons/md";
import { BsCheckCircle } from "react-icons/bs";

type LookupResult = { cardId: string; base: "A" | "T" | "C" | "G" | "?" };

export default function Home() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");

  async function search() {
    const q = name.trim();
    if (!q) {
      setError("Please enter your name.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const query = new URLSearchParams({
        student: q,
        t: String(Date.now()), // cache-buster
      }).toString();

      const r = await fetch(`/api/cards/lookup?${query}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      });
      const j = await r.json();

      if (!r.ok) {
        setError(j?.error || "Lookup failed");
        return;
      }

      if (j?.notFound) {
        setError("No redemption for that name yet.");
        return;
      }

      if (!j?.cardId || !j?.data?.base) {
        setError("Invalid response from server.");
        return;
      }

      setResult({
        cardId: String(j.cardId),
        base: j.data.base as LookupResult["base"],
      });
    } catch (err) {
      console.error(err);
      setError("Unable to search right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        display: "flex",
        minHeight: "calc(100vh - 70px)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        gap: 18,
        padding: 16,
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FaDna size={28} color="var(--accent)" />
        <h1 style={{ fontSize: 32, margin: 0 }}>DNA Base Game</h1>
      </div>
      <p style={{ color: "var(--muted)", margin: 0 }}>
        Choose your role or find your redeemed base
      </p>

      {/* Role buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          width: "100%",
          maxWidth: 640,
          marginTop: 12,
        }}
      >
        <Link
          href="/user"
          className="btn role"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          <FaGamepad />
          <span>User</span>
        </Link>

        <Link
          href="/admin"
          className="btn role warn"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          <FiSettings />
          <span>Admin</span>
        </Link>
      </div>

      {/* Divider */}
      <div style={{ opacity: 0.5, fontSize: 12, marginTop: 8 }}>— or —</div>

      {/* Search my base (by name) */}
      <section
        style={{
          background: "var(--card)",
          border: "1px solid #2b3565",
          borderRadius: 16,
          padding: 16,
          width: "100%",
          maxWidth: 760,
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <BiTestTube size={18} color="var(--accent)" />
          <h2 style={{ margin: 0, fontSize: 18, letterSpacing: 0.2 }}>
            Search my base (by name)
          </h2>
        </div>

        <div className="controls" style={{ margin: 0 }}>
          <div>
            <label htmlFor="student">Your name</label>
            <input
              id="student"
              type="text"
              placeholder="e.g. Alice Kim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              style={{ width: 300 }}
            />
          </div>
          <button className="primary" onClick={search} disabled={!name.trim() || loading}>
            <FiSearch /> {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {/* Result / error */}
        <div style={{ marginTop: 10, minHeight: 24 }}>
          {error && (
            <div className="hint" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MdErrorOutline color="red" /> {error}
            </div>
          )}

          {result && (
            <div
              className="card"
              style={{
                marginTop: 8,
                maxWidth: 520,
                position: "relative",
                borderStyle: "dashed",
              }}
            >
              <span className="badge" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <BsCheckCircle /> Found
              </span>
              <div className="subtitle">DNA Base (Redeemed)</div>

              <div
                className="base"
                data-b={result.base}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              >
                <FaDna size={44} />
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 900,
                    letterSpacing: 2,
                    lineHeight: 1,
                  }}
                >
                  {result.base}
                </div>
              </div>

              <div className="id" style={{ marginTop: 10 }}>
                Card ID: <code>{result.cardId}</code>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
        © 2025 aeiwz | DNA Base Game
      </footer>
    </main>
  );
}
