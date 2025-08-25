// pages/api/hit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { redis } from "../../lib/redis";
import crypto from "node:crypto";

function clientIp(req: NextApiRequest) {
  const xf = (req.headers["x-forwarded-for"] || "") as string;
  return (xf.split(",")[0] || req.socket.remoteAddress || "").trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const page = (req.query.page as string) || "landing";
  const totalKey = `views:total:${page}`;
  const uniquesKey = `views:uniques:${page}:${new Date().toISOString().slice(0, 10)}`;
  const dayKey = `views:day:${page}:${new Date().toISOString().slice(0, 10)}`;

  // Unique-per-day by IP (hashed)
  const ip = clientIp(req);
  const ipHash = ip ? crypto.createHash("sha256").update(ip).digest("hex") : "";

  const seen = ip ? await redis.sismember(uniquesKey, ipHash) : 1;

  const p = redis.pipeline();
  if (!seen) {
    p.incr(totalKey);
    if (ip) {
      p.sadd(uniquesKey, ipHash);
      p.expire(uniquesKey, 60 * 60 * 24 * 2);
    }
  }
  p.incr(dayKey).expire(dayKey, 60 * 60 * 24 * 40);

  await p.exec();

  const total = (await redis.get<number>(totalKey)) ?? 0;
  res.status(200).json({ ok: true, page, incremented: !seen, total });
}