// src/components/DeckGrid.tsx
import BaseCard from "./BaseCard";

export type Card = { id: string; base: "A" | "T" | "C" | "G"; usedAt?: string | null };

export default function DeckGrid({ cards }: { cards: Card[] }) {
  if (!cards?.length) {
    return <div className="hint">No cards yet. Click <b>Generate cards</b>.</div>;
  }
  return (
    <div className="grid" aria-live="polite">
      {cards.map((c, i) => (
        <BaseCard key={c.id} index={i} id={c.id} base={c.base} usedAt={c.usedAt} />
      ))}
    </div>
  );
}
