// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="footer mt-5">
      <div className="container py-3 border-top text-center text-secondary small">
        <i className="bi bi-code-slash me-1" />
        © {new Date().getFullYear()} • Theerayut | Build with Next.js, React & Bootstrap
        <div className="mt-1">
          <a
            href="https://github.com/aeiwz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary me-3"
          >
            <i className="bi bi-github me-1" /> aeiwz
          </a>
          <a
            href="https://www.linkedin.com/in/aeiwtheerayut"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary"
          >
            <i className="bi bi-linkedin me-1" /> aeiwtheerayut
          </a>
        </div>
      </div>
    </footer>
  );
}