import { useEffect, useRef, useState } from "react";
import { JigColor, JigFold, JigText } from "@/components/jig/JigControls";
import type { ExtraSectionProps } from "@/three/scenes/types";
import type { CardItem, CuboidChainParams } from "./params";

/**
 * Card Content editor: per-card category, title, description, pills and
 * accent. Lives outside the schema because it edits an array. Follows the
 * focused card when one is focused.
 */
export function CardEditor({ values, setScene, sceneState, openRequest }: ExtraSectionProps<CuboidChainParams>) {
  const cards = values.scene.cards;
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const focused = typeof sceneState.focusedIndex === "number" ? sceneState.focusedIndex : null;
  const idx = cards.length === 0 ? 0 : (focused ?? selected) % cards.length;
  const card = cards[idx];

  useEffect(() => {
    if (openRequest > 0) {
      setOpen(true);
      requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  }, [openRequest]);

  const patch = (p: Partial<CardItem>) =>
    setScene((prev) => ({
      ...prev,
      cards: prev.cards.map((c, i) => (i === idx ? { ...c, ...p } : c)),
    }));

  return (
    <div ref={ref}>
      <JigFold title="Card Content" open={open} onOpenChange={setOpen} badge={`#${idx + 1}`}>
        {focused === null && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-400">Card</span>
            <select
              aria-label="Select card to edit"
              value={idx}
              onChange={(e) => setSelected(Number(e.target.value))}
              className="max-w-[175px] w-full text-[11px] bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-md px-2 py-1 outline-none focus:border-emerald-500/70 cursor-pointer truncate"
            >
              {cards.map((c, i) => (
                <option key={c.id} value={i} className="bg-zinc-900">
                  #{i + 1} · {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {card && (
          <div className="space-y-2">
            <JigText label="Category" value={card.category} onChange={(category) => patch({ category })} />
            <JigText label="Title" value={card.title} onChange={(title) => patch({ title })} />
            <JigText
              label="Description"
              multiline
              value={card.description ?? ""}
              onChange={(description) => patch({ description })}
            />
            <JigText
              label="Pills (comma-separated)"
              value={card.pills.join(", ")}
              onChange={(v) =>
                patch({
                  pills: v
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
            <JigColor label="Accent Color" value={card.accentColor} onChange={(accentColor) => patch({ accentColor })} />
          </div>
        )}
      </JigFold>
    </div>
  );
}
