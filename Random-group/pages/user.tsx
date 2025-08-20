// pages/user.tsx
import { useEffect, useState } from "react";

// Icons
import { FaDna } from "react-icons/fa";
import { FaDice } from "react-icons/fa6";
import { BiTestTube } from "react-icons/bi";

type PickCard = { id: string; base: "A" | "T" | "C" | "G" } | null;

type StateResponse = {
  remaining: number;
};

export default function UserPage() {
  const [remaining, setRemaining] = useState<number>(0);
  const [pick, setPick] = useState<PickCard>(null);
  const [msg, setMsg] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [didRedeem, setDidRedeem] = useState<boolean>(false); // hide buttons after redeem

  async function refresh() {
    try {
      const r = await fetch("/api/cards");
      const j: StateResponse = await r.json();
      setRemaining(j?.remaining ?? 0);
    } catch {
      // ignore fetch errors for now
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function draw() {
    setMsg("");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "draw" }),
      });
      const json = await res.json();
      if (json.error) {
        setMsg(`❌ ${json.error}`);
        setPick(null);
        return;
      }
      setPick(json.pick);
      setMsg("Drawn! Enter your name and tap Redeem to lock it.");
      await refresh();
    } catch {
      setMsg("❌ Unable to draw right now.");
    }
  }

  async function redeem() {
    if (!pick) {
      setMsg("Draw a card first.");
      return;
    }
    if (!name.trim()) {
      setMsg("Please enter your name before redeeming.");
      return;
    }
    try {

      const res = await fetch("/api/cards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // if you implemented one-redeem-per-student, backend expects "student"
        body: JSON.stringify({ id: pick.id, op: "redeem", student: name.trim() }),
      });
      const json = await res.json();
      if (json.error) {
        setMsg(`❌ ${json.error}`);
        return;
      }
      setMsg(`✅ Redeemed! Keep this ID: ${pick.id}`);
      setDidRedeem(true); // hide buttons now
      await refresh();
    } catch {
      setMsg("❌ Unable to redeem right now.");
    }
  }

  return (
    <>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FaDna size={22} color="var(--accent)" />
        <h1>DNA Base Game — User</h1>
      </header>

      <p className="hint">
        1) Tap <b>Draw</b> to get a random card. 2) Enter your <b>Name</b>. 3) Tap <b>Redeem</b> to lock it.
      </p>

      {/* Name input (required before redeem) */}
      <div className="controls">
        <div>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Alex Kim"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={didRedeem}
          />
        </div>
        <span className="hint" style={{ marginLeft: 8 }}>Remaining: {remaining}</span>
      </div>

      {/* Action buttons — hidden after redeem */}
      {!didRedeem && (
        <div className="controls">
          <button className="primary" onClick={draw} aria-label="Draw random">
            <FaDice /> Draw random
          </button>
          <button onClick={redeem} aria-label="Redeem current card" disabled={!pick}>
            <BiTestTube /> Redeem
          </button>
        </div>
      )}

      <div className="hint" aria-live="polite">{msg}</div>

      {pick && (
        <div className="card" style={{ maxWidth: 360, marginTop: 12 }}>
          <span className="badge">{didRedeem ? "Redeemed" : "Your draw"}</span>
          <div className="subtitle">DNA Base</div>
          <div className="base" data-b={pick.base}>
            <FaDna size={42} />
            <div style={{ fontSize: 28, fontWeight: 800 }}>{pick.base}</div>
          </div>
          <div className="id">ID: {pick.id}</div>
        </div>
      )}
    </>
  );
}
