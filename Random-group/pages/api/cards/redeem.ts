// pages/api/cards/redeem.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { redis, KEYS } from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { id, op, student } = req.body || {};
  if (!id) return res.status(400).json({ error: "Missing id" });

  const base = await redis.hget<string>(KEYS.CARDS, id);
  if (!base) return res.status(404).json({ error: "ID not found. Check typing." });

  if (op === "redeem") {
    if (!student || !String(student).trim()) {
      return res.status(400).json({ error: "Missing student name" });
    }
    const name = String(student).trim();

    // Prevent double-use of the card
    const alreadyWhen = await redis.hget(KEYS.USED, id);
    if (alreadyWhen) {
      return res.json({ error: `Already used at ${alreadyWhen}. Base: ${base}` });
    }

    // Prevent second redeem by same student
    const prior = await redis.hget<string>(KEYS.STUDENT_REDEEM, name);
    if (prior) {
      try {
        const prev = JSON.parse(prior) as { id: string; when: string };
        return res.json({ error: `Student "${name}" already redeemed ${prev.id} at ${prev.when}.` });
      } catch {
        return res.json({ error: `Student "${name}" already redeemed previously.` });
      }
    }

    // Mark used + bi-directional mappings (now with base)
    const now = new Date().toLocaleString();
    await Promise.all([
      redis.hset(KEYS.USED, { [id]: now }),
      redis.hset(KEYS.REDEEMED_BY, { [id]: JSON.stringify({ student: name, base, when: now }) }),
      redis.hset(KEYS.STUDENT_REDEEM, { [name]: JSON.stringify({ id, base, when: now }) }),
    ]);

    return res.json({ ok: true, base, when: now });
  }

  if (op === "unredeem") {
    // read who redeemed from new or legacy structure
    const raw = await redis.hget<string>(KEYS.REDEEMED_BY, id);
    let studentName: string | null = null;
    try {
      const obj = raw ? JSON.parse(raw) as { student?: string } : null;
      studentName = obj?.student ?? null;
    } catch {
      // legacy: raw was just the student name
      studentName = raw ?? null;
    }

    await Promise.all([
      redis.hdel(KEYS.USED, id),
      redis.hdel(KEYS.REDEEMED_BY, id),
      studentName ? redis.hdel(KEYS.STUDENT_REDEEM, studentName) : Promise.resolve(),
    ]);
    return res.json({ ok: true });
  }

  return res.status(400).json({ error: "Unknown op" });
}
