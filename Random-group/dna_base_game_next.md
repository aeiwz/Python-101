# DNA Base Game — Next.js + Redis (Full Project)

This is a complete Next.js (Pages Router) app that reproduces the three static pages as React screens and replaces `localStorage` with Redis for storage. It uses **Upstash Redis** (serverless-friendly), but you can swap in `ioredis` with a self‑hosted Redis by editing `src/lib/redis.ts`.

---

## 1) File tree

```
DNA-Base-Game/
├─ package.json
├─ next.config.mjs
├─ tsconfig.json
├─ .env.local.example
├─ public/
│  └─ favicon.ico
├─ src/
│  ├─ lib/
│  │  └─ redis.ts
│  ├─ components/
│  │  ├─ UI.tsx
│  │  ├─ DeckGrid.tsx
│  │  └─ Badge.tsx
│  └─ styles/
│     └─ globals.css
├─ pages/
│  ├─ _app.tsx
│  ├─ index.tsx
│  ├─ admin.tsx
│  ├─ user.tsx
│  └─ api/
│     └─ cards/
│        ├─ index.ts
│        ├─ export.ts
│        └─ redeem.ts
└─ README.md
```

---

## 2) package.json

```json
{
  "name": "dna-base-game",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "@upstash/redis": "^1.30.0",
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "swr": "^2.2.5"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "typescript": "^5.5.4"
  }
}
```

---

## 3) next.config.mjs

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
```

---

## 4) tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/lib/*": ["src/lib/*"],
      "@/components/*": ["src/components/*"],
      "@/styles/*": ["src/styles/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## 5) .env.local.example

```bash
# Upstash Redis (recommended for serverless/Vercel)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# If you switch to a self-hosted Redis client, put your REDIS_URL, etc. here
```

---

## 6) src/lib/redis.ts

```ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Redis schema (all keys namespaced with `dna:`):
 *   dna:cards       -> HASH   id => base (A/T/C/G)
 *   dna:order       -> LIST   card ids in creation order (for roster/CSV)
 *   dna:used        -> HASH   id => timestamp string
 *   dna:seed        -> STRING last used seed (optional)
 */
export const KEYS = {
  CARDS: "dna:cards",
  ORDER: "dna:order",
  USED: "dna:used",
  SEED: "dna:seed",
};

export type Card = { id: string; base: "A" | "T" | "C" | "G" };
export type Deck = Card[];

export function uid() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${part()}-${part()}`;
}

export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function strHash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h *= 16777619;
  }
  return h >>> 0;
}

export function shuffled<T>(array: T[], rng: () => number) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

---

## 7) src/components/UI.tsx

```tsx
import { PropsWithChildren } from "react";

export function Page({ children }: PropsWithChildren) {
  return <main className="container">{children}</main>;
}

export function Button(
  {
    kind = "default",
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "default" | "primary" | "warn" }
) {
  return <button className={`btn ${kind}`} {...props} />;
}

export function InputLabel({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
```

---

## 8) src/components/Badge.tsx

```tsx
import { PropsWithChildren } from "react";

export default function Badge({ children }: PropsWithChildren) {
  return <span className="badge">{children}</span>;
}
```

---

## 9) src/components/DeckGrid.tsx

```tsx
import Badge from "@/components/Badge";

export default function DeckGrid({
  cards,
}: {
  cards: { id: string; base: "A" | "T" | "C" | "G" }[];
}) {
  if (!cards?.length) return <div className="hint">No cards yet. Click <b>Generate cards</b>.</div>;
  return (
    <div className="grid">
      {cards.map((c, i) => (
        <div key={c.id} className="card">
          <Badge>#{i + 1}</Badge>
          <div className="subtitle">DNA Base</div>
          <div className="base" data-b={c.base}>
            {c.base}
          </div>
          <div className="mono">ID: {c.id}</div>
          <div className="foot">Give this card to a student ➜ keep the ID safe</div>
        </div>
      ))}
    </div>
  );
}
```

---

## 10) src/styles/globals.css

```css
:root{ --bg:#0b1020; --card:#111834; --ink:#e9f0ff; --muted:#9fb0d3; --accent:#7dd3fc; --A:#ef4444; --T:#f59e0b; --C:#22c55e; --G:#3b82f6; }
*{box-sizing:border-box}
body{margin:0; font-family:system-ui, -apple-system, Segoe UI, Roboto, Inter; background:var(--bg); color:var(--ink)}
header{display:flex; gap:12px; align-items:center; padding:16px 20px; border-bottom:1px solid #1e2a55; position:sticky; top:0; background:linear-gradient(180deg, rgba(11,16,32,.9), rgba(11,16,32,.7)); backdrop-filter:saturate(120%) blur(6px)}
h1{font-size:18px; margin:0; letter-spacing:.3px}
.container{padding:18px; max-width:1100px; margin:0 auto}
.controls{display:flex; flex-wrap:wrap; gap:10px; align-items:end; margin:12px 0 20px}
.label{font-size:12px; color:var(--muted); display:block; margin-bottom:6px}
input[type="number"], input[type="text"]{background:#0f1530; color:var(--ink); border:1px solid #2c3768; border-radius:10px; padding:10px 12px;}
select{background:#0f1530; color:var(--ink); border:1px solid #2c3768; border-radius:10px; padding:10px 12px}
.btn{padding:10px 14px; border-radius:10px; border:1px solid #2c3768; background:#14204a; color:var(--ink); cursor:pointer}
.btn.primary{border-color:#3a4aa0; background:#1a2b66}
.btn.warn{border-color:#7a2b2b; background:#401a1a}
.hint{color:var(--muted); font-size:12px}
.grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:12px}
.card{background:var(--card); border:1px dashed #2b3565; border-radius:16px; padding:14px; position:relative; overflow:hidden}
.badge{position:absolute; top:10px; right:10px; font-size:11px; color:#a6b7e5; border:1px solid #2e3a72; border-radius:20px; padding:4px 8px}
.base{font-size:52px; font-weight:800; letter-spacing:2px; margin:10px 0 0}
.base[data-b="A"]{color:var(--A)} .base[data-b="T"]{color:var(--T)} .base[data-b="C"]{color:var(--C)} .base[data-b="G"]{color:var(--G)}
.subtitle{color:var(--muted); font-size:12px}
.mono{font-family:ui-monospace, Menlo, Consolas, monospace; font-size:12px; letter-spacing:.5px; margin-top:8px}
.foot{margin-top:12px; font-size:11px; color:#9ab3ff}
.table{width:100%; border-collapse:collapse; background:#0f1530; border:1px solid #2c3768; border-radius:12px; overflow:hidden}
.table th, .table td{padding:10px; border-bottom:1px solid #1e2a55; font-size:14px}
.table th{color:#c8d5ff; text-align:left; background:#121a3b}
.pill{display:inline-block; font-size:12px; padding:3px 8px; border-radius:999px; border:1px solid #2e3a72}

/* Print */
@media print{
  header, .controls, .no-print{display:none !important}
  body{background:white; color:black}
  .grid{grid-template-columns:repeat(4,1fr)}
  .card{border:1px solid #999; -webkit-print-color-adjust:exact; print-color-adjust:exact}
}
```

---

## 11) pages/_app.tsx

```tsx
import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <header>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7c4-5 12-5 16 0M4 17c4 5 12 5 16 0" stroke="#7dd3fc" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <h1>DNA Base Game</h1>
      </header>
      <Component {...pageProps} />
    </>
  );
}
```

---

## 12) pages/index.tsx (Landing)

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <main style={{display:'flex', minHeight:'calc(100vh - 70px)', alignItems:'center', justifyContent:'center', flexDirection:'column', textAlign:'center'}}>
      <h1 style={{fontSize:28, margin:0, marginBottom:10}}>DNA Base Game</h1>
      <p style={{color:'var(--muted)', marginBottom:30}}>Select your role to continue</p>
      <div style={{display:'flex', gap:20, flexWrap:'wrap', justifyContent:'center'}}>
        <Link className="btn" href="/user">🎮 User</Link>
        <Link className="btn warn" href="/admin">⚙️ Admin</Link>
      </div>
      <footer style={{marginTop:40, fontSize:12, color:'var(--muted)'}}>© 2025 DNA Base Game</footer>
    </main>
  );
}
```

---

## 13) pages/admin.tsx

```tsx
import useSWR from "swr";
import { useState } from "react";
import { Page, Button, InputLabel } from "@/components/UI";
import DeckGrid from "@/components/DeckGrid";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Card = { id: string; base: "A" | "T" | "C" | "G" };

type Summary = {
  total: number;
  counts: { A: number; T: number; C: number; G: number };
  used: number;
};

export default function AdminPage() {
  const { data, mutate } = useSWR<{ cards: Card[]; summary: Summary }>("/api/cards", fetcher);
  const [count, setCount] = useState<number>(40);
  const [seed, setSeed] = useState<string>("");
  const [redeemId, setRedeemId] = useState("");

  const generate = async () => {
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate", count, seed }),
    });
    mutate();
  };

  const exportCSV = () => {
    window.open("/api/cards/export", "_blank");
  };

  const resetAll = async () => {
    if (!confirm("Clear saved cards and redemption log?")) return;
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    mutate();
  };

  const redeem = async () => {
    await fetch("/api/cards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: redeemId, op: "redeem" }),
    });
    setRedeemId("");
    mutate();
  };

  const unredeem = async () => {
    await fetch("/api/cards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: redeemId, op: "unredeem" }),
    });
    setRedeemId("");
    mutate();
  };

  const summary = data?.summary ?? { total: 0, counts: { A: 0, T: 0, C: 0, G: 0 }, used: 0 };

  return (
    <Page>
      <p className="hint">Generate print‑ready cards with balanced A/T/C/G. Manage redemption, export CSV, or reset.</p>
      <div className="controls">
        <InputLabel label="Number of students">
          <input type="number" value={count} onChange={(e)=>setCount(parseInt(e.target.value||"0",10))} />
        </InputLabel>
        <InputLabel label="Seed (optional, reproducible shuffle)">
          <input type="text" placeholder="e.g. CLASS8-2025" value={seed} onChange={(e)=>setSeed(e.target.value)} />
        </InputLabel>
        <Button kind="primary" onClick={generate}>Generate cards</Button>
        <Button onClick={() => window.print()}>Print cards</Button>
        <Button onClick={exportCSV}>Export CSV</Button>
        <Button kind="warn" onClick={resetAll}>Reset (clear saved)</Button>
      </div>

      <div className="hint">
        <b>{summary.total}</b> cards →&nbsp;
        <span className="pill">A: {summary.counts.A}</span>&nbsp;
        <span className="pill">T: {summary.counts.T}</span>&nbsp;
        <span className="pill">C: {summary.counts.C}</span>&nbsp;
        <span className="pill">G: {summary.counts.G}</span>&nbsp; | Used: {summary.used}
      </div>

      <DeckGrid cards={data?.cards ?? []} />

      <h3 className="no-print">Redeem / Check‑in</h3>
      <div className="controls no-print">
        <InputLabel label="Card ID">
          <input type="text" value={redeemId} onChange={(e)=>setRedeemId(e.target.value)} placeholder="e.g. MBDL9K-3A2F" />
        </InputLabel>
        <Button kind="primary" onClick={redeem}>Redeem</Button>
        <Button onClick={unredeem}>Un‑redeem</Button>
      </div>
    </Page>
  );
}
```

---

## 14) pages/user.tsx

```tsx
import useSWR from "swr";
import { useEffect, useState } from "react";
import { Page, Button } from "@/components/UI";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

type Pick = { id: string; base: "A" | "T" | "C" | "G" } | null;

type State = {
  remaining: number;
};

export default function UserPage() {
  const { data, mutate } = useSWR<State>("/api/cards", fetcher);
  const [pick, setPick] = useState<Pick>(null);
  const [msg, setMsg] = useState<string>("");

  const draw = async () => {
    const res = await fetch("/api/cards", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "draw" })});
    const json = await res.json();
    if (json.error) { setMsg(json.error); return; }
    setPick(json.pick);
    setMsg("Drawn. Tap Redeem to lock it.");
    mutate();
  };

  const redeem = async () => {
    if (!pick) { setMsg("Draw a card first."); return; }
    const res = await fetch("/api/cards/redeem", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id: pick.id, op: "redeem" })});
    const json = await res.json();
    if (json.error) { setMsg(json.error); return; }
    setMsg(`✅ Redeemed! Keep this ID: ${pick.id}`);
    mutate();
  };

  const clearPick = () => { setPick(null); setMsg(""); };

  return (
    <Page>
      <p className="hint">Tap <b>Draw</b> to get a random card from the jar. Then tap <b>Redeem</b> to lock it (one time only).</p>
      <div className="controls">
        <Button kind="primary" onClick={draw}>Draw random</Button>
        <Button onClick={redeem}>Redeem</Button>
        <Button onClick={clearPick}>Clear</Button>
        <span className="hint" style={{marginLeft:8}}>Remaining: {data?.remaining ?? 0}</span>
      </div>

      <div className="hint">{msg}</div>

      <div>
        {pick && (
          <div className="card" style={{maxWidth:360}}>
            <span className="badge">Your draw</span>
            <div className="base" data-b={pick.base}>{pick.base}</div>
            <div className="mono">ID: {pick.id}</div>
          </div>
        )}
      </div>
    </Page>
  );
}
```

---

## 15) pages/api/cards/index.ts

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { redis, KEYS, uid, strHash, mulberry32, shuffled } from "@/lib/redis";

const BASES = ["A", "T", "C", "G"] as const;

type Data = any;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "GET") {
    // list deck + summary
    const [cardHash, usedHash, order] = await Promise.all([
      redis.hgetall<Record<string, string>>(KEYS.CARDS),
      redis.hgetall<Record<string, string>>(KEYS.USED),
      redis.lrange(KEYS.ORDER, 0, -1),
    ]);
    const ids = order ?? Object.keys(cardHash ?? {});
    const cards = ids.map((id) => ({ id, base: (cardHash?.[id] as any) ?? "?" }));
    const counts = { A: 0, T: 0, C: 0, G: 0 } as Record<string, number>;
    cards.forEach((c) => (counts[c.base] = (counts[c.base] || 0) + 1));
    const used = usedHash ? Object.keys(usedHash).length : 0;
    const remaining = cards.length - used;
    return res.json({ cards, summary: { total: cards.length, counts, used }, remaining });
  }

  if (req.method === "POST") {
    const { action } = req.body || {};

    if (action === "generate") {
      const count = Math.max(4, parseInt(req.body.count ?? 40, 10));
      const seedStr = String(req.body.seed ?? "").trim();
      const rng = seedStr ? mulberry32(strHash(seedStr)) : Math.random;

      const bases: (typeof BASES[number])[] = [];
      for (let i = 0; i < count; i++) bases.push(BASES[i % 4]);
      const shuffledBases = shuffled(bases, rng);

      // wipe and set
      await redis.del(KEYS.CARDS, KEYS.ORDER, KEYS.USED);
      const ids: string[] = [];
      for (let i = 0; i < count; i++) {
        const id = uid();
        ids.push(id);
      }
      const hmset: [string, string][] = ids.map((id, i) => [id, shuffledBases[i]]);
      await Promise.all([
        redis.hset(KEYS.CARDS, Object.fromEntries(hmset)),
        redis.rpush(KEYS.ORDER, ids),
        seedStr ? redis.set(KEYS.SEED, seedStr) : redis.del(KEYS.SEED),
      ]);

      return res.json({ ok: true, count });
    }

    if (action === "draw") {
      // choose uniformly from remaining
      const [cardHash, usedHash] = await Promise.all([
        redis.hgetall<Record<string, string>>(KEYS.CARDS),
        redis.hgetall<Record<string, string>>(KEYS.USED),
      ]);
      const used = new Set(Object.keys(usedHash ?? {}));
      const pool = Object.entries(cardHash ?? {}).filter(([id]) => !used.has(id));
      if (!cardHash || Object.keys(cardHash).length === 0) return res.json({ error: "No deck yet. Teacher must generate cards first." });
      if (pool.length === 0) return res.json({ error: "Jar is empty — all cards redeemed." });
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return res.json({ pick: { id: pick[0], base: pick[1] } });
    }

    if (action === "reset") {
      await redis.del(KEYS.CARDS, KEYS.ORDER, KEYS.USED, KEYS.SEED);
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
```

---

## 16) pages/api/cards/redeem.ts

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { redis, KEYS } from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }
  const { id, op } = req.body || {};
  if (!id) return res.status(400).json({ error: "Missing id" });

  const exists = await redis.hget<string>(KEYS.CARDS, id);
  if (!exists) return res.status(404).json({ error: "ID not found. Check typing." });

  if (op === "redeem") {
    const already = await redis.hget(KEYS.USED, id);
    if (already) return res.json({ error: `Already used at ${already}. Base: ${exists}` });
    const now = new Date().toLocaleString();
    await redis.hset(KEYS.USED, { [id]: now });
    return res.json({ ok: true, when: now, base: exists });
  }

  if (op === "unredeem") {
    await redis.hdel(KEYS.USED, id);
    return res.json({ ok: true });
  }

  return res.status(400).json({ error: "Unknown op" });
}
```

---

## 17) pages/api/cards/export.ts

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { redis, KEYS } from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const [cardHash, usedHash, order] = await Promise.all([
    redis.hgetall<Record<string, string>>(KEYS.CARDS),
    redis.hgetall<Record<string, string>>(KEYS.USED),
    redis.lrange(KEYS.ORDER, 0, -1),
  ]);
  const ids = order ?? Object.keys(cardHash ?? {});
  const rows = ["index,id,base,used,used_at"];
  ids.forEach((id, i) => {
    const base = cardHash?.[id] ?? "?";
    const when = usedHash?.[id] ?? "";
    const used = when ? "YES" : "NO";
    rows.push(`${i + 1},${id},${base},${used},${when}`);
  });
  const csv = rows.join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=dna_cards.csv");
  res.send(csv);
}
```

---

## 18) pages/admin + user headers (SVG icon)

> Already included in `_app.tsx` header to match the look & feel.

---

## 19) README.md

```md
# DNA Base Game — Next.js + Redis

A teaching game for A/T/C/G pairing. Admin generates balanced cards; students draw & redeem exactly once. State is stored in Redis.

## Quick start

1. Create your Redis database in Upstash and copy the REST URL + TOKEN.
2. `cp .env.local.example .env.local` and fill both vars.
3. `npm i`
4. `npm run dev`

Open:
- Admin: http://localhost:3000/admin
- User:  http://localhost:3000/user

## Deploying to Vercel

- Add the two env vars in Vercel Project Settings → Environment Variables.
- Push to GitHub and import your repo into Vercel.

## Data model

- `dna:cards` (HASH) — `id => base`
- `dna:order` (LIST) — original order to render roster/CSV
- `dna:used`  (HASH) — `id => timestamp`
- `dna:seed`  (STRING) — last seed (optional)

## Notes

- CSV export available at `/api/cards/export`.
- Print layout uses CSS `@media print`.
- If you prefer self‑hosted Redis, replace `src/lib/redis.ts` accordingly.
```

