// pages/api/cards/export.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { redis, KEYS } from "@/lib/redis";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
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
