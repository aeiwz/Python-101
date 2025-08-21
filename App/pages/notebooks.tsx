// App/pages/notebooks.tsx
import React from "react";

const USER = "aeiwz";
const REPO = "Python-101";
// Optional: your own JupyterHub/Server base URL (no trailing slash)
const JUPYTER_BASE = process.env.NEXT_PUBLIC_JUPYTER_BASE ?? ""; // e.g. "https://hub.yourschool.edu/user/you"

type NB = { slug: string; title: string };

const NOTEBOOKS: NB[] = [
  { slug: "01_computer_language", title: "01 Computer Language" },
  { slug: "02_principles_of_programming", title: "02 Principles of Programming" },
  { slug: "03_python_frameworks", title: "03 Python Frameworks" },
  { slug: "04_python_syntax", title: "04 Python Syntax" },
  { slug: "05_data_types", title: "05 Data Types" },
  { slug: "06_data_structures_management", title: "06 Data Structures & Management" },
  { slug: "07_bioinformatics_data_analysis", title: "07 Bioinformatics Data Analysis" },
  { slug: "08_ml_scikit_learn", title: "08 Machine Learning (scikit‑learn)" },
];

function buildPaths(slug: string) {
  const path = `App/notebooks/${slug}.ipynb`;
  const colab = `https://colab.research.google.com/github/${USER}/${REPO}/blob/main/${path}`;
  const binder = `https://mybinder.org/v2/gh/${USER}/${REPO}/main?filepath=${encodeURIComponent(path)}`;
  const jhub = JUPYTER_BASE ? `${JUPYTER_BASE}/lab/tree/${path}` : "";
  const github = `https://github.com/${USER}/${REPO}/blob/main/${path}`;
  return { path, colab, binder, jhub, github };
}

export default function Notebooks() {
  return (
    <main className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg border-bottom mb-4">
        <div className="container-fluid">
          <a href="/" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-house me-1" /> Home
          </a>
          <span className="navbar-text ms-3 fw-bold">
            <i className="bi bi-journal-richtext me-1" /> Notebooks
          </span>
        </div>
      </nav>

      <h1 className="h4 mb-3">Course Notebooks</h1>
      <p className="text-secondary">
        Launch each notebook on <b>Colab</b> or <b>Binder</b>. If you have access to a JupyterHub/Server,
        use that button (set <code>NEXT_PUBLIC_JUPYTER_BASE</code> in <code>.env.local</code>).
      </p>

      <div className="row row-cols-1 row-cols-md-2 g-3">
        {NOTEBOOKS.map((n) => {
          const { path, colab, binder, jhub, github } = buildPaths(n.slug);
          return (
            <div className="col" key={n.slug}>
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{n.title}</h5>
                  <p className="text-secondary small mb-3">
                    <code>{path}</code>
                  </p>

                  <div className="d-flex flex-wrap gap-2 mt-auto">
                    <a className="btn btn-warning" href={colab} target="_blank" rel="noreferrer">
                      <i className="bi bi-box-arrow-up-right me-1" />
                      Open in Colab
                    </a>

                    <a className="btn btn-secondary" href={binder} target="_blank" rel="noreferrer">
                      <i className="bi bi-cloud me-1" />
                      Open in Binder
                    </a>

                    {jhub && (
                      <a className="btn btn-success" href={jhub} target="_blank" rel="noreferrer">
                        <i className="bi bi-hdd-network me-1" />
                        Open in JupyterHub
                      </a>
                    )}

                    <a className="btn btn-outline-dark" href={github} target="_blank" rel="noreferrer">
                      <i className="bi bi-github me-1" />
                      View on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="alert alert-info small mt-4">
        <i className="bi bi-info-circle me-1" /> Tip: put datasets alongside notebooks (e.g.{" "}
        <code>App/notebooks/data/</code>) so Colab/Binder/Jupyter can load them via relative paths.
      </div>
    </main>
  );
}