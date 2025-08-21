// pages/console.tsx
import { useEffect, useRef, useState } from "react";
import { FiHome } from "react-icons/fi"

type ExampleMeta = { filename: string; slug: string; title: string; summary: string; };

export default function ConsolePage() {
  const [items, setItems] = useState<ExampleMeta[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ExampleMeta | null>(null);
  const [code, setCode] = useState<string>("");
  const [out, setOut] = useState<string>("(loading Python runtime…)\n");
  const [ready, setReady] = useState(false);

  // Keep a single Pyodide instance across renders
  const pyodideRef = useRef<any>(null);

  const append = (s: string) => setOut((o) => o + (s.endsWith("\n") ? s : s + "\n"));

  // Load examples list once
  useEffect(() => {
    fetch("/api/examples")
      .then(r => r.json())
      .then(d => {
        setItems(d.items || []);
        if (d.items?.length) choose(d.items[0]); // auto-select first
      })
      .catch(() => setItems([]));
  }, []);

  // Load Pyodide once (StrictMode‑safe)
  useEffect(() => {
    let mounted = true;
    const SCRIPT_ID = "pyodide-0-26-1";
    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if (document.getElementById(SCRIPT_ID)) return resolve();
        const el = document.createElement("script");
        el.id = SCRIPT_ID;
        el.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
        el.onload = () => resolve();
        el.onerror = () => reject(new Error("Failed to load Pyodide script"));
        document.head.appendChild(el);
      });

    (async () => {
      try {
        if (pyodideRef.current) return;
        await ensureScript();
        // @ts-ignore
        const py = await window.loadPyodide({
          stdout: (s: string) => append(s),
          stderr: (s: string) => append(s),
        });
        pyodideRef.current = py;
        if (mounted) {
          append("Python ready.");
          setReady(true);
        }
      } catch (e: any) {
        append("Error loading Python: " + e.message);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Pick an example and fetch its code
  function choose(meta: ExampleMeta) {
    setSelected(meta);
    setCode("# Loading…");
    setOut(ready ? "" : "(loading Python runtime…)\n");
    fetch(`/api/examples/${meta.slug}`)
      .then(r => (r.ok ? r.text() : Promise.reject("not found")))
      .then(txt => setCode(txt))
      .catch(() => setCode("# Example not found"));
  }

  async function run() {
    const py = pyodideRef.current;
    if (!py) return;
    setOut(""); // fresh run
    try {
      await py.runPythonAsync(code);
    } catch (e: any) {
      append(String(e));
    }
  }

  const filtered = query.trim()
    ? items.filter(x =>
        x.title.toLowerCase().includes(query.toLowerCase()) ||
        x.filename.toLowerCase().includes(query.toLowerCase()) ||
        x.summary.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <main className="container py-4">
      <nav className="navbar navbar-expand-lg border-bottom mb-4">
        <div className="container-fluid">
          <a href="/" className="btn btn-outline-secondary btn-sm">
            <i className="bi" /> < FiHome /> Back
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
                className={`list-group-item list-group-item-action${selected?.slug === ex.slug ? " active" : ""}`}
                onClick={() => choose(ex)}
                title={ex.summary}
              >
                {ex.title}
              </button>
            ))}
            {!filtered.length && <div className="text-secondary small p-2">No matches</div>}
          </div>
        </div>

        {/* Editor + Output */}
        <div className="col-md-9">
          <label className="form-label small text-secondary">
            Editor {selected ? `• ${selected.title}` : ""}
          </label>
          <textarea
            className="form-control"
            style={{ minHeight: 280, fontFamily: "ui-monospace, Menlo, monospace" }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />

          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-primary" onClick={run} disabled={!ready}>
              Run
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setOut("")}>
              Clear
            </button>
          </div>

          <label className="form-label small text-secondary mt-3">Console Output</label>
          <pre className="border rounded p-2" style={{ height: 280, overflow: "auto", whiteSpace: "pre-wrap" }}>
            {out}
          </pre>

          <div className="alert alert-warning mt-3 small mb-0">
            ⚠️ Pyodide can’t install heavy native packages like <code>pandas</code> or <code>scikit‑learn</code>.
            For those, open a Colab/Binder notebook instead.
          </div>
        </div>
      </div>
    </main>
  );
}