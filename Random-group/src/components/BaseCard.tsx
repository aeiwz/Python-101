// src/components/BaseCard.tsx
import { FaDna } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";

type Props = {
  index: number;               // 0-based
  id: string;
  base: "A" | "T" | "C" | "G";
  usedAt?: string | null;
};

export default function BaseCard({ index, id, base, usedAt }: Props) {
  const isUsed = !!usedAt;
  return (
    <div className={`card ${isUsed ? "used" : ""}`}>
      {isUsed && (
        <span className="ribbon">
          <FiCheckCircle size={14} /> Used
        </span>
      )}
      <span className="badge">#{index + 1}</span>
      <div className="subtitle">DNA Base</div>
      <div className="base" data-b={base}>
        <FaDna size={42} />
        <div style={{ fontSize: 28, fontWeight: 800 }}>{base}</div>
      </div>
      <div className="id">ID: {id}</div>
      <div className="foot">
        {isUsed ? `Redeemed at ${usedAt}` : "Give this card to a student ➜ keep the ID safe"}
      </div>
    </div>
  );
}
