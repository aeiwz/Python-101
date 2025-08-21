// pages/api/py-run.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";

const IMAGE = process.env.PY_RUN_IMAGE || "python-ml:latest";
const ALLOW_LOCAL_PY = process.env.ALLOW_LOCAL_PY === "1"; // optional fallback

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { code } = (req.body ?? {}) as { code?: string };
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing code" });
  }

  try {
    const result = await runSnippet(code);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
}

function runSnippet(code: string): Promise<{ code: number | null; stdout: string; stderr: string; runner: string }> {
  return new Promise((resolve, reject) => {
    let cmd = "docker";
    let args = ["run", "--rm", "-i", IMAGE, "python", "-I", "-"];
    let runner = `docker:${IMAGE}`;

    let proc: ReturnType<typeof spawn>;

    try {
      proc = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });
    } catch (e: any) {
      // Synchronous failure (e.g., spawn ENOENT). Try local Python if allowed.
      if (ALLOW_LOCAL_PY) {
        try {
          cmd = "python";
          args = ["-I", "-"];
          runner = "local:python";
          proc = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });
        } catch (e2: any) {
          return reject(new Error(`Failed to start docker and local python: ${e2.message}`));
        }
      } else {
        return reject(new Error(`Failed to start docker: ${e.message}. Is Docker available on this host?`));
      }
    }

    let stdout = "";
    let stderr = "";

    proc.on("error", (e) => {
      // Async spawn error (e.g., docker not installed). Try local Python if allowed and not already trying it.
      if (ALLOW_LOCAL_PY && runner.startsWith("docker:")) {
        try {
          const fallback = spawn("python", ["-I", "-"], { stdio: ["pipe", "pipe", "pipe"] });
          runner = "local:python";
          fallback.stdout.on("data", (d) => (stdout += d.toString()));
          fallback.stderr.on("data", (d) => (stderr += d.toString()));
          fallback.on("close", (code) => resolve({ code, stdout, stderr, runner }));
          fallback.stdin.end(code);
          return;
        } catch (e2: any) {
          return reject(new Error(`Docker unavailable and local python failed: ${e2.message}`));
        }
      }
      reject(new Error(`Runner error: ${e.message}`));
    });

    if (proc.stdout) {
      proc.stdout.on("data", (d) => (stdout += d.toString()));
    }
    if (proc.stderr) {
      proc.stderr.on("data", (d) => (stderr += d.toString()));
    }
    proc.on("close", (code) => resolve({ code, stdout, stderr, runner }));

    // feed code
    if (proc.stdin) {
      proc.stdin.write(code);
      proc.stdin.end();
    }
  });
}
