// pages/api/examples/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "node:fs";
import path from "node:path";

const LOCAL_DIR = path.join(process.cwd(), "public", "examples");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query as { slug: string };

  // convert slug back to filename
  const filename = slug.replace(/-/g, "_") + ".py";
  const filepath = path.join(LOCAL_DIR, filename);

  if (fs.existsSync(filepath)) {
    const code = fs.readFileSync(filepath, "utf8");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(code);
  }

  return res.status(404).send("# Example not found");
}
