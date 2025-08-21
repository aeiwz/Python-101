// pages/api/examples/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "node:fs";
import path from "node:path";

const LOCAL_DIR = path.join(process.cwd(), "public", "examples");

// GitHub fallback (matches your repo layout)
const GH_USER = process.env.GH_USER ?? "aeiwz";
const GH_REPO = process.env.GH_REPO ?? "Python-101";
const GH_PATH_PREFIX = process.env.GH_PATH_PREFIX ?? "App/public/examples";
const GH_TOKEN = process.env.GITHUB_TOKEN || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query as { slug: string };
  const filename = slug.replace(/-/g, "_") + ".py";

  // Local first
  const localPath = path.join(LOCAL_DIR, filename);
  if (fs.existsSync(localPath)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(fs.readFileSync(localPath, "utf8"));
  }

  // GitHub fallback
  const listURL = `https://api.github.com/repos/${encodeURIComponent(
    GH_USER
  )}/${encodeURIComponent(GH_REPO)}/contents/${encodeURIComponent(GH_PATH_PREFIX)}/${encodeURIComponent(
    filename
  )}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "nextjs-examples-detail",
  };
  if (GH_TOKEN) headers.Authorization = `Bearer ${GH_TOKEN}`;

  const r = await fetch(listURL, { headers });
  if (r.ok) {
    const raw = await r.text();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(raw);
  }

  return res.status(404).send("# Example not found");
}
