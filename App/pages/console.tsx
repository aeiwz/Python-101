// pages/console.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { FiHome, FiPlay, FiTrash2, FiCpu, FiServer, FiAlertTriangle } from "react-icons/fi";

/* --- Editor (CodeMirror) --- */
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";

type ExampleMeta = { filename: string; slug: string; title: string; summary: string };

/* --- Pyodide support maps --- */
const PYODIDE_VER = "0.26.1";

// import name -> how to load
const SUPPORTED_MAP: Record<string, { kind: "pyodide" | "micropip"; pkg?: string }> = {
  numpy: { kind: "pyodide" },
  pandas: { kind: "pyodide" },
  matplotlib: { kind: "pyodide" },
  seaborn: { kind: "micropip" },
  "matplotlib.pyplot": { kind: "pyodide", pkg: "matplotlib" },
  polars: { kind: "micropip" }, // optional; pure-python but heavy
};

// hard-blocked in the browser/WASM (needs native code)
const UNSUPPORTED = new Set([
  "sklearn", "scikit-learn", "xgboost", "lightgbm", "torch", "tensorflow", "jax", "cv2",
]);

function scanImports(src: string): string[] {
  const mods = new Set<string>();
  const re1 = /^\s*import\s+([a-zA-Z0-9_\.]+)/gm;
  const re2 = /^\s*from\s+([a-zA-Z0-9_\.]+)\s+import\s+/gm;
  let m;
  while ((m = re1.exec(src))) mods.add(m[1]);
  while ((m = re2.exec(src))) mods.add(m[1]);
  return [...mods].map((s) => s.split(".")[0]); // top-level
}

/** Detects dark mode:
 *  - true if <html> or <body> has class "dark"
 *  - otherwise falls back to prefers-color-scheme
 */
function useIsDark(): boolean {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      return (
        root.classList.contains("dark") ||
        document.body?.classList?.contains("dark") ||
        window.matchMedia?.("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMQ = () => setDark((d) => (document.documentElement.classList.contains("dark") ? true : mq?.matches ?? d));

    // Watch .dark class changes (if you toggle theme via class)
    const obs = new MutationObserver(() => onMQ());
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    document.body && obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    mq?.addEventListener?.("change", onMQ);
    return () => {
      obs.disconnect();
      mq?.removeEventListener?.("change", onMQ);
    };
  }, []);

  return dark;
}

export default function ConsolePage() {
  const [items, setItems] = useState<ExampleMeta[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ExampleMeta | null>(null);
  const [code, setCode] = useState<string>("# Loading…");
  const [out, setOut] = useState<string>("(loading Python runtime…)\n");
  const [ready, setReady] = useState(false);
  const [serverOnlyReason, setServerOnlyReason] = useState<string>("");

  const isDark = useIsDark();

  // Pyodide singleton
  const pyodideRef = useRef<any>(null);

  const append = (s: string) => setOut((o) => o + (s.endsWith("\n") ? s : s + "\n"));

  // List examples
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/examples");
        const d = await r.json();
        setItems(d.items || []);
        if (d.items?.length) choose(d.items[0]);
      } catch {
        setItems([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boot Pyodide
  useEffect(() => {
    let mounted = true;
    const SCRIPT_ID = `pyodide-${PYODIDE_VER}`;
    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if (document.getElementById(SCRIPT_ID)) return resolve();
        const el = document.createElement("script");
        el.id = SCRIPT_ID;
        el.src = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VER}/full/pyodide.js`;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error("Failed to load Pyodide script"));
        document.head.appendChild(el);
      });

    (async () => {
      try {
        if (pyodideRef.current) return;
        await ensureScript();
        // @ts-ignore
        const py = await (window as any).loadPyodide({
          stdout: (s: string) => append(s),
          stderr: (s: string) => append(s),
        });
        pyodideRef.current = py;

        // preload common deps
        await py.loadPackage(["micropip", "numpy"]);
        if (mounted) {
          append("Python ready.");
          setReady(true);
        }
      } catch (e: any) {
        append("Error loading Python: " + e.message);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(meta: ExampleMeta) {
    setSelected(meta);
    setCode("# Loading…");
    setOut(ready ? "" : "(loading Python runtime…)\n");
    setServerOnlyReason("");
    fetch(`/api/examples/${meta.slug}`)
      .then((r) => (r.ok ? r.text() : Promise.reject("not found")))
      .then((txt) => {
        setCode(txt);
        // pre-scan and warn if unsupported
        const requested = scanImports(txt);
        const blocked = requested.filter((m) => UNSUPPORTED.has(m));
        setServerOnlyReason(
          blocked.length
            ? `Requires native packages not available in the browser: ${blocked.join(", ")}`
            : ""
        );
      })
      .catch(() => setCode("# Example not found"));
  }

  async function ensurePackagesFor(codeText: string) {
    const py = pyodideRef.current;
    if (!py) return;

    const requested = scanImports(codeText);
    const blocked = requested.filter((m) => UNSUPPORTED.has(m));
    if (blocked.length) {
      throw new Error(
        `These packages are not supported in the browser: ${blocked.join(
          ", "
        )}. Use "Run on Server" instead.`
      );
    }

    const viaPyodide = new Set<string>();
    const viaMicropip = new Set<string>();
    for (const mod of requested) {
      const spec = SUPPORTED_MAP[mod];
      if (!spec) continue;
      if (spec.kind === "pyodide") viaPyodide.add(spec.pkg ?? mod);
      if (spec.kind === "micropip") viaMicropip.add(spec.pkg ?? mod);
    }

    if (viaPyodide.size) {
      append(`... Loading (pyodide): ${[...viaPyodide].join(", ")}`);
      await py.loadPackage([...viaPyodide]);
    }
    if (viaMicropip.size) {
      append(`... Installing (micropip): ${[...viaMicropip].join(", ")}`);
      await py.runPythonAsync(`
import micropip
for pkg in ${JSON.stringify([...viaMicropip])}:
    try:
        await micropip.install(pkg)
    except Exception as e:
        print("micropip failed for", pkg, ":", e)
`);
    }
  }

  async function runBrowser() {
    const py = pyodideRef.current;
    if (!py) return;
    setOut("");
    try {
      await ensurePackagesFor(code);
      await py.runPythonAsync(code);
    } catch (e: any) {
      append(String(e?.message ?? e));
    }
  }

  async function runServer() {
    setOut("");
    setServerOnlyReason(""); // clear old banner
    try {
      const r = await fetch("/api/py-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await r.json();
      if (data.stderr) append(data.stderr);
      if (data.stdout) append(data.stdout);
      if (!data.stdout && !data.stderr) append("(no output)");
    } catch (e: any) {
      append("Server error: " + (e?.message ?? e));
    }
  }

  const filtered = query.trim()
    ? items.filter(
        (x) =>
          x.title.toLowerCase().includes(query.toLowerCase()) ||
          x.filename.toLowerCase().includes(query.toLowerCase()) ||
          x.summary.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  /* Editor theme + extensions */
  const cmTheme = isDark ? githubDark : githubLight;
  const cmExt = useMemo(() => [python()], []);

  return (
    <main className="container py-4">
      {/* Glass navbar */}
      <nav className="navbar navbar-expand-lg glass mb-4 px-3 py-2 rounded-3">
        <div className="container-fluid">
          <a href="/" className="btn btn-outline-secondary btn-sm">
            <FiHome className="me-1" /> Back
          </a>
          <span className="navbar-text ms-3 fw-bold">Python Console</span>
          <div className="ms-auto small text-secondary">
            {ready ? <span className="text-success">● Ready</span> : <span>● Loading…</span>}
          </div>
        </div>
      </nav>

      <div className="row g-3">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="glass p-2 rounded-3">
            <input
              className="form-control form-control-sm mb-2"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="list-group" style={{ maxHeight: 500, overflow: "auto" }}>
              {filtered.map((ex) => (
                <button
                  key={ex.slug}
                  className={`list-group-item list-group-item-action${
                    selected?.slug === ex.slug ? " active" : ""
                  }`}
                  onClick={() => choose(ex)}
                  title={ex.summary}
                >
                  {ex.title}
                </button>
              ))}
              {!filtered.length && <div className="text-secondary small p-2">No matches</div>}
            </div>
          </div>
        </div>

        {/* Editor + Output */}
        <div className="col-md-9">
          <div className="glass p-3 rounded-3">
            <label className="form-label small text-secondary">
              Editor {selected ? `• ${selected.title}` : ""}
            </label>

            {/* CodeMirror editor */}
            <div className="rounded-3 overflow-hidden glass-editor">
              <CodeMirror
                value={code}
                height="280px"
                theme={cmTheme}
                extensions={cmExt}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                  bracketMatching: true,
                  autocompletion: true,
                }}
                onChange={(val) => setCode(val)}
              />
            </div>

            {serverOnlyReason && (
              <div className="alert alert-warning glass border-0 d-flex align-items-start gap-2 mt-2 small mb-0 rounded-3">
                <FiAlertTriangle className="mt-1" />
                <div>
                  <strong>Native dependency detected.</strong> {serverOnlyReason}
                </div>
              </div>
            )}

            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-primary" onClick={runBrowser} disabled={!ready}>
                <FiPlay className="me-1" /> Run{" "}
                <span className="ms-1 small">
                </span>
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setOut("")}>
                <FiTrash2 className="me-1" /> Clear
              </button>
            </div>

            <label className="form-label small text-secondary mt-3">Console Output</label>
            <pre
              className="border rounded p-2 glass"
              style={{ height: 280, overflow: "auto", whiteSpace: "pre-wrap", background: "transparent" }}
            >
              {out}
            </pre>

            <div className="alert alert-info glass border-0 mt-3 small mb-0 rounded-3">
              <strong>Tip:</strong> Browser mode (Pyodide) supports many scientific packages
              like <code>numpy</code>, and <code>pandas</code>. For
              packages that need native extensions (e.g., <code>scikit‑learn</code>) or when
              you need to <em>see plots</em> (matplotlib / seaborn / plotly), please run on your
              <strong> local console</strong> (or Jupyter). The in‑browser runtime has no GUI
              backends.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}