// pages/api/cards/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { redis, KEYS, uid, strHash, mulberry32, shuffled } from "@/lib/redis";

const BASES = ["A", "T", "C", "G"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const [cardHash, usedHash, order] = await Promise.all([
      redis.hgetall<Record<string, string>>(KEYS.CARDS),
      redis.hgetall<Record<string, string>>(KEYS.USED),
      redis.lrange(KEYS.ORDER, 0, -1),
    ]);

    const ids = order ?? Object.keys(cardHash ?? {});
    // include usedAt so Admin can show "Used" on cards
    const cards = ids.map((id) => ({
      id,
      base: (cardHash?.[id] as any) ?? "?",
      usedAt: usedHash?.[id] ?? null as string | null,
    }));

    const counts = { A: 0, T: 0, C: 0, G: 0 } as Record<string, number>;
    for (const c of cards) counts[c.base] = (counts[c.base] || 0) + 1;

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

      // Balanced then shuffled bases
      const bases: (typeof BASES[number])[] = [];
      for (let i = 0; i < count; i++) bases.push(BASES[i % 4]);
      const shuffledBases = shuffled(bases, rng);

      // reset deck
      await redis.del(
        KEYS.CARDS,
        KEYS.ORDER,
        KEYS.USED,
        KEYS.SEED,
        KEYS.STUDENT_REDEEM,
        KEYS.REDEEMED_BY
      );

      // create ids and write cards hash (id -> base)
      const ids: string[] = Array.from({ length: count }, () => uid());
      const hm = Object.fromEntries(ids.map((id, i) => [id, shuffledBases[i]]));
      await redis.hset(KEYS.CARDS, hm);

      // write order list — spread array for Upstash
      await redis.rpush(KEYS.ORDER, ...ids);

      // remember seed (optional)
      if (seedStr) await redis.set(KEYS.SEED, seedStr);

      return res.json({ ok: true, count });
    }

    if (action === "draw") {
      const [cardHash, usedHash] = await Promise.all([
        redis.hgetall<Record<string, string>>(KEYS.CARDS),
        redis.hgetall<Record<string, string>>(KEYS.USED),
      ]);
      if (!cardHash || Object.keys(cardHash).length === 0) {
        return res.json({ error: "No deck yet. Teacher must generate cards first." });
      }
      const used = new Set(Object.keys(usedHash ?? {}));
      const pool = Object.entries(cardHash).filter(([id]) => !used.has(id));
      if (pool.length === 0) return res.json({ error: "Jar is empty — all cards redeemed." });
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return res.json({ pick: { id: pick[0], base: pick[1] } });
    }


    if (action === "reset") {
      // Wipe **all** app data in Redis (safe even if some keys don't exist)
      await redis.del(
        KEYS.CARDS,
        KEYS.ORDER,
        KEYS.USED,
        KEYS.SEED,
        KEYS.STUDENT_REDEEM,
        KEYS.REDEEMED_BY
      );
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
