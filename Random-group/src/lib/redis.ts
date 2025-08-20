// src/lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Redis schema (all keys namespaced with `dna:`)
 *   dna:cards           HASH   id -> base (A/T/C/G)
 *   dna:order           LIST   ordered card ids for roster/grid/export
 *   dna:used            HASH   id -> timestamp string (when redeemed)
 *   dna:seed            STRING last used seed (optional)
 *   dna:student_redeem  HASH   studentId -> JSON({ id, when })   (optional feature)
 *   dna:redeemed_by     HASH   cardId    -> studentId            (optional feature)
 */
export const KEYS = {
  CARDS: "dna:cards",
  ORDER: "dna:order",
  USED: "dna:used",
  SEED: "dna:seed",
  STUDENT_REDEEM: "dna:student_redeem",
  REDEEMED_BY: "dna:redeemed_by",
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
