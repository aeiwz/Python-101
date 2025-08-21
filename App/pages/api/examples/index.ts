// pages/api/examples/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "node:fs";
import path from "node:path";

/* ----------------------- Config: local + GitHub fallback ----------------------- */
// Try local first (works when deployed with files bundled into /public/examples)
const CANDIDATES = [
  path.join("public", "examples"),
] as string[];

// GitHub fallback (override via env if needed)
const GH_USER = process.env.GH_USER ?? "aeiwz";
const GH_REPO = process.env.GH_REPO ?? "Python-101";
// 👇 Your files are here in the repo: App/public/examples
const GH_PATH_PREFIX = process.env.GH_PATH_PREFIX ?? "App/public/examples";
const GH_TOKEN = process.env.GITHUB_TOKEN; // optional for private repos / higher rate limits

/* --------------------------------- Utilities --------------------------------- */
function resolveLocalDir(): string {
  for (const c of CANDIDATES) {
    const abs = path.join(process.cwd(), c);
    if (fs.existsSync(abs)) return abs;
  }
  return "";
}

function toSlug(filename: string) {
  return filename.replace(/\.py$/i, "").replace(/_/g, "-");
}

// "001_hello_world_basics.py" -> "001 • hello world basics"
function toTitle(filename: string) {
  const base = filename.replace(/\.py$/i, "");
  const [idx, ...rest] = base.split("_");
  const tail = rest.join(" ").replace(/-/g, " ");
  return `${idx ?? ""}${idx ? " • " : ""}${tail || base}`;
}

function extractSummary(src: string) {
  const doc = src.match(/^[ \t]*("""|''')([\s\S]*?)\1/m);
  if (doc && doc[2].trim()) return doc[2].trim().split("\n")[0].slice(0, 200);
  const first = src.split("\n").map((s) => s.trim()).find(Boolean) || "Python example";
  return first.slice(0, 200);
}

function sortByIndexThenName(files: string[]) {
  return files.sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });
}

/* --------------------------------- Handler ---------------------------------- */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const q = String(req.query.q ?? "").trim().toLowerCase();

  // Cache (1h at edge; allow client revalidation)
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, must-revalidate");

  const localDir = resolveLocalDir();

  try {
    let items: Array<{ filename: string; slug: string; title: string; summary: string }>;

    if (localDir) {
      // -------- Local mode --------
      const files = sortByIndexThenName(
        fs.readdirSync(localDir).filter((f) => f.toLowerCase().endsWith(".py"))
      );

      items = files.map((filename) => {
        const raw = fs.readFileSync(path.join(localDir, filename), "utf8");
        return {
          filename,
          slug: toSlug(filename),
          title: toTitle(filename),
          summary: extractSummary(raw),
        };
      });
    } else {
      // -------- GitHub fallback --------
      const listURL = `https://api.github.com/repos/${encodeURIComponent(GH_USER)}/${encodeURIComponent(GH_REPO)}/contents/${encodeURIComponent(GH_PATH_PREFIX)}`;

      const baseHeaders: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "nextjs-examples-list",
      };
      if (GH_TOKEN) baseHeaders.Authorization = `Bearer ${GH_TOKEN}`;

      const r = await fetch(listURL, { headers: baseHeaders });
      if (!r.ok) {
        const txt = await r.text();
        return res.status(r.status).json({
          error: `GitHub list failed: ${txt || r.statusText}`,
          hint: `Check GH_USER=${GH_USER} GH_REPO=${GH_REPO} GH_PATH_PREFIX=${GH_PATH_PREFIX}`,
        });
      }

      type GHItem = { name: string; type: "file" | "dir"; download_url: string | null };
      const files = (await r.json()) as GHItem[];

      const pyFiles = sortByIndexThenName(
        files
          .filter((f) => f.type === "file" && f.name.toLowerCase().endsWith(".py"))
          .map((f) => f.name)
      );

      const urlByName = new Map(files.map((f) => [f.name, f.download_url]));

      items = [];
      for (const filename of pyFiles) {
        const direct = urlByName.get(filename);
        if (!direct) continue;

        const rawRes = await fetch(direct, {
          headers: GH_TOKEN
            ? { Authorization: `Bearer ${GH_TOKEN}`, "User-Agent": "nextjs-examples-list" }
            : { "User-Agent": "nextjs-examples-list" },
        });
        const raw = rawRes.ok ? await rawRes.text() : "";

        items.push({
          filename,
          slug: toSlug(filename),
          title: toTitle(filename),
          summary: extractSummary(raw),
        });
      }
    }

    // Optional search filter
    const filtered = q
      ? items.filter(
          (x) =>
            x.title.toLowerCase().includes(q) ||
            x.filename.toLowerCase().includes(q) ||
            x.slug.toLowerCase().includes(q) ||
            x.summary.toLowerCase().includes(q)
        )
      : items;

    if (req.method === "HEAD") return res.status(200).end();
    return res.status(200).json({
      items: filtered,
      count: filtered.length,
      source: localDir ? "local" : "github",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}
