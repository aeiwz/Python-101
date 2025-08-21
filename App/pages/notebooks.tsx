// pages/notebooks.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FaHome, FaSearch, FaGithub, FaCode, FaDatabase, FaRobot } from "react-icons/fa";
import { SiGooglecolab, SiJupyter, SiPython } from "react-icons/si";
import { GiDna2 } from "react-icons/gi";
import { ImCool } from "react-icons/im";
import { GrPersonalComputer } from "react-icons/gr";
import { CiBeaker1 } from "react-icons/ci";


const USER = "aeiwz";
const REPO = "Python-101";
const PATH_PREFIX = "App/notebooks";

type NB = { slug: string; title: string; icon: ReactNode; desc: string };

const NOTEBOOKS: NB[] = [
  {
    slug: "01_computer_language",
    title: "01 Computer Language",
    icon: <GrPersonalComputer />,
    desc: "Introduction to computers, algorithms, and programming languages — how humans instruct machines."
  },
  {
    slug: "02_principles_of_programming",
    title: "02 Principles of Programming",
    icon: <CiBeaker1 />,
    desc: "Core programming principles: logic, control flow, problem solving, and computational thinking."
  },
  {
    slug: "03_python_frameworks",
    title: "03 Python Frameworks",
    icon: <SiPython />,
    desc: "Overview of popular Python frameworks and environments for scientific computing and data analysis."
  },
  {
    slug: "04_python_syntax",
    title: "04 Python Syntax",
    icon: <FaCode />,
    desc: "The essential grammar of Python: variables, operators, loops, and functions."
  },
  {
    slug: "05_data_types",
    title: "05 Data Types",
    icon: <FaDatabase />,
    desc: "Understanding Python's built-in data types: numbers, strings, booleans, lists, tuples, and more."
  },
  {
    slug: "06_data_structures_management",
    title: "06 Data Structures & Management",
    icon: <FaDatabase />,
    desc: "Efficient storage and manipulation of data using lists, sets, dictionaries, and advanced structures."
  },
  {
    slug: "07_bioinformatics_data_analysis",
    title: "07 Bioinformatics Data Analysis",
    icon: <GiDna2 />,
    desc: "Applying Python to biology: sequence analysis, data wrangling, and practical bioinformatics workflows."
  },
  {
    slug: "08_ml_scikit_learn",
    title: "08 Machine Learning (scikit-learn)",
    icon: <FaRobot />,
    desc: "Introduction to machine learning with scikit-learn: regression, classification, clustering, and model evaluation."
  },
];

function nbPath(slug: string) {
  return `${PATH_PREFIX}/${slug}.ipynb`;
}
function colabUrl(slug: string) {
  return `https://colab.research.google.com/github/${USER}/${REPO}/blob/main/${nbPath(slug)}`;
}
function binderUrl(slug: string) {
  return `https://mybinder.org/v2/gh/${USER}/${REPO}/main?labpath=${encodeURIComponent(nbPath(slug))}`;
}
function githubUrl(slug: string) {
  return `https://github.com/${USER}/${REPO}/blob/main/${nbPath(slug)}`;
}

export default function NotebooksPage() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(""), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return NOTEBOOKS.filter(
      (n) =>
        !needle ||
        n.title.toLowerCase().includes(needle) ||
        n.slug.toLowerCase().includes(needle)
    );
  }, [q]);

  return (
    <main className="container py-4">
      {/* Top bar */}
      <nav className="navbar navbar-expand-lg border-bottom mb-4">
        <div className="container-fluid">
          <a href="/" className="btn btn-outline-secondary btn-sm">
            <FaHome className="me-1" /> Home
          </a>
          <span className="navbar-text ms-3 fw-bold theme-title">Notebooks</span>

          <div className="ms-auto d-flex align-items-center" style={{ gap: 8 }}>
            <div className="input-group input-group-sm" style={{ minWidth: 260 }}>
              <span className="input-group-text theme-input-addon">
                <FaSearch />
              </span>
              <input
                className="form-control theme-input"
                placeholder="Search notebooks…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* ✨ Cool Description Section */}
      <div className="p-4 mb-4 rounded theme-desc-box text-center">
        <h2 className="fw-bold"> <SiPython /> Python 1 <ImCool /> 1 Notebook Collection</h2>
        <p className="mb-0">
          Explore interactive Jupyter notebooks covering the essentials of Python programming —
          from <strong>basic syntax</strong> and <strong>data structures</strong>
          to <strong>bioinformatics</strong> and <strong>machine learning</strong>.
          Launch them instantly in <span className="text-warning">Colab</span>,
          <span className="text-info"> Binder</span>, or your own <span className="text-primary">Jupyter</span> environment.
        </p>
      </div>

      {/* Grid */}
      <div className="row g-3">
        {items.map((n) => {
          const path = nbPath(n.slug);
          const colab = colabUrl(n.slug);
          const binder = binderUrl(n.slug);
          const gh = githubUrl(n.slug);

          return (
            <div className="col-12 col-md-6" key={n.slug}>
              <div className="card theme-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="fw-bold mb-1 theme-card-title d-flex align-items-center gap-2">
                      {n.icon} {n.title}
                    </div>
                  </div>

                  {/* Description on new line */}
                  <p className="mt-1 small text-secondary">{n.desc}</p>
                  {/* Actions */}
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <a
                      className="btn btn-warning btn-sm d-flex align-items-center gap-2 theme-colab"
                      href={colab}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <SiGooglecolab /> Open in Colab
                    </a>

                    <a
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 theme-btn"
                      href={binder}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <SiJupyter /> Open in Binder
                    </a>

                    <a
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 theme-btn"
                      href={gh}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FaGithub /> View on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}