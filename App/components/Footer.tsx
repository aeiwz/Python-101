// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="footer mt-5">
      <div className="container py-3 border-top text-center text-secondary small">
        <i className="bi bi-code-slash me-1" />
        © {new Date().getFullYear()} • Theerayut | Build with Next.js, React & Boostrap
      </div>
    </footer>
  );
}