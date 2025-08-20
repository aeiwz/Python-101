import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type Data = { student: string; base: "A" | "T" | "C" | "G" | "?"; when: string };
type Ok = { cardId: string; data: Data };

function noStore(res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

// Try to coerce a hash value to {student, base, when}
async function coerceValue(cardId: string, raw: unknown): Promise<Data | null> {
  // Case 1: already an object (your current situation)
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const student = typeof o.student === "string" ? o.student : "";
    if (!student) return null;
    const base = (typeof o.base === "string" ? o.base : "?") as Data["base"];
    const when = typeof o.when === "string" ? o.when : "(unknown)";
    return { student, base, when };
  }

  // Case 2: JSON string
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (p && typeof p === "object" && typeof p.student === "string") {
        const base = (typeof p.base === "string" ? p.base : "?") as Data["base"];
        const when = typeof p.when === "string" ? p.when : "(unknown)";
        return { student: p.student, base, when };
      }
    } catch {
      // not JSON -> maybe legacy value is just the student name
      const s = raw.trim();
      if (s) {
        // enrich if we can (optional)
        const base = ((await redis.hget<string>("dna:cards", cardId)) ?? "?") as Data["base"];
        const when = (await redis.hget<string>("dna:used", cardId)) ?? "(legacy)";
        return { student: s, base, when };
      }
    }
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  noStore(res);

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const student = String(req.query.student ?? "").trim();
  if (!student) return res.status(400).json({ error: "Missing student param" });
  const needle = student.toLowerCase();

  try {
    // Upstash client may deserialize automatically; use unknown to be safe
    const redeemed = (await redis.hgetall<Record<string, unknown>>("dna:redeemed_by")) ?? {};

    let hit: Ok | null = null;

    for (const [cardId, raw] of Object.entries(redeemed)) {
      const data = await coerceValue(cardId, raw);
      if (!data) continue;

      if (data.student.toLowerCase() === needle) {
        hit = { cardId, data };
        break;
      }
    }

    if (!hit) return res.status(200).json({ notFound: true });

    // Optional self-heal: make sure value is stored as proper JSON string
    await redis.hset("dna:redeemed_by", {
      [hit.cardId]: JSON.stringify(hit.data),
    });

    return res.status(200).json(hit);
  } catch (err) {
    console.error("lookup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
