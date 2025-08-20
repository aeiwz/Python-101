// src/components/SummaryPills.tsx
type Counts = { A: number; T: number; C: number; G: number };
export default function SummaryPills({ total, counts }: { total: number; counts: Counts }) {
  return (
    <div className="hint">
      <b>{total}</b> cards →&nbsp;
      <span className="pill">A: {counts.A}</span>&nbsp;
      <span className="pill">T: {counts.T}</span>&nbsp;
      <span className="pill">C: {counts.C}</span>&nbsp;
      <span className="pill">G: {counts.G}</span>
    </div>
  );
}
