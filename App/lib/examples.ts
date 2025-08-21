// lib/examples.ts
import fs from "node:fs";
import path from "node:path";

export type ExampleMeta = {
  filename: string;   // e.g., 001_hello_world.py
  slug: string;       // e.g., 001-hello-world
  title: string;      // e.g., 001 • hello world
  summary: string;    // first docstring/comment/line
};

export type ExampleFull = ExampleMeta & { raw: string };

const CANDIDATE_DIRS = [
  process.env.EXAMPLES_DIR,     // optional override via .env.local
  "examples",                   // recommended location
  path.join("pages", "api", "examples"),
  path.join("public", "examples"),
].filter(Boolean) as string[];

export function resolveExamplesDir(): string {
  for (const c of CANDIDATE_DIRS) {
    const abs = path.join(process.cwd(), c);
    if (fs.existsSync(abs)) return abs;
  }
  throw new Error(
    "Examples folder not found. Create /examples or /pages/api/examples, " +
    "or set EXAMPLES_DIR in .env.local."
  );
}

function titleFromFilename(fn: string) {
  const base = fn.replace(/\.py$/i, "");
  const [idx, ...rest] = base.split("_");
  return `${idx} • ${rest.join(" ").replace(/-/g, " ")}`;
}

function slugFromFilename(fn: string) {
  return fn.replace(/\.py$/i, "").replace(/_/g, "-");
}

function extractSummary(src: string) {
  const doc = src.match(/^[ \t]*("""|''')([\s\S]*?)\1/m);
  if (doc && doc[2].trim()) return doc[2].trim().split("\n")[0].slice(0, 160);
  const firstLine = src.split("\n").map((s) => s.trim()).find(Boolean) || "Python example";
  return firstLine.slice(0, 160);
}

export function getAllExampleMetas(): ExampleMeta[] {
  const dir = resolveExamplesDir();
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".py")).sort();
  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), "utf8");
    return {
      filename,
      slug: slugFromFilename(filename),
      title: titleFromFilename(filename),
      summary: extractSummary(raw),
    };
  });
}

export function getExampleBySlug(slug: string): ExampleFull | null {
  const dir = resolveExamplesDir();
  const base = slug.replace(/-/g, "_");
  const filename = `${base}.py`;
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return {
    filename,
    slug,
    title: titleFromFilename(filename),
    summary: extractSummary(raw),
    raw,
  };
}