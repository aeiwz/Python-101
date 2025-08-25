// pages/api/views.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { redis } from "../../lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const page = (req.query.page as string) || "landing";
  const totalKey = `views:total:${page}`;
  const total = (await redis.get<number>(totalKey)) ?? 0;

  // (Optional) cache a few seconds at the edge
  res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=30");
  res.status(200).json({ page, total });
}