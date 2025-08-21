import { ImCool } from "react-icons/im";
import {
  FaRobot,
  FaTerminal,
  FaBookOpen
} from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";

export default function Home() {
  return (
    <main className="container py-4">
      <div className="card border-0 shadow-sm bg-surface">
        <div className="card-body p-4 p-lg-5">
          {/* Hero */}
          <section className="text-center">
            <h1 className="display-4 fw-bold mb-3 lh-1">
              Learn <span className="brand-grad">Python</span> - Build Anything.
            </h1>
            <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: 820 }}>
              From programming basics to data analysis and machine learning.
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <a href="/notebooks" className="btn btn-primary btn-lg d-flex align-items-center gap-2">
                <FaRobot /> Open notebook
              </a>
              <a href="/console" className="btn btn-outline-primary btn-lg d-flex align-items-center gap-2">
                <FaTerminal /> Open Python Console
              </a>
            </div>
          </section>

          {/* Feature cards */}
          <section className="mt-5">
            <div className="row justify-content-center g-3">
              {/* Data 101 → Notebooks */}
              <div className="col-12 col-md-4">
                <div className="card h-100 glow-tile">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center gap-2">
                      <FaBookOpen /> Python 1 <ImCool /> 1
                    </h5>
                    <p className="text-secondary mb-3">
                      Open the full set of course notebooks (Python basics, data types, bioinformatics, and ML).
                    </p>
                    <a className="link-primary" href="/notebooks">Open notebooks →</a>
                  </div>
                </div>
              </div>

              {/* Console → Console page */}
              <div className="col-12 col-md-4">
                <div className="card h-100 glow-tile">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center gap-2">
                      <FaTerminal /> Console
                    </h5>
                    <p className="text-secondary mb-3">
                      Run quick experiments in the browser console: evaluate code, print results, and debug ideas.
                    </p>
                    <a className="link-primary" href="/console">Open console →</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center mt-4">
            <hr className="my-4" />
            <p className="lead text-secondary">
              <IoRocketOutline /> Ready to start? Open the{" "}
              <a href="/console" className="link-primary">interactive console</a>{" "}
              and write your first Python program.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}