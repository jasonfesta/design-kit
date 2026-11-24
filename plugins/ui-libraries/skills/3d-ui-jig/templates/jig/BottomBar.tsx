import { useEffect, useRef, useState } from "react";
import {
  Box,
  Camera,
  Check,
  ChevronUp,
  ClipboardCopy,
  Layers,
  Pause,
  Pencil,
  Play,
  SlidersHorizontal,
  Sparkles,
  Sun,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { SceneModule } from "@/three/scenes/types";
import { PROMPT_KINDS, buildPrompt, type PromptKind } from "./promptExport";
import { getPath, type JigSection, type JigValues } from "./schema";
import "./jig.css";

/**
 * Schema-driven bottom dock: renders `module.dock` items (segmented pills,
 * play/pause, preset cycle, reset view), an optional "Edit" button that opens
 * the module's ExtraSection, and the Copy Prompt menu.
 */

export interface BottomBarProps<P> {
  module: SceneModule<P>;
  sections: JigSection[];
  values: JigValues<P>;
  onChange: (path: string, value: unknown) => void;
  presetName: string;
  onCyclePreset: () => void;
  onResetView: () => void;
  onEditExtra?: () => void;
  /** Label override for reset-view, e.g. "Exit Focus" while focused. */
  resetLabel?: string;
}

const KIND_ICON: Record<PromptKind, typeof Box> = {
  "3d": Box,
  shader: Sparkles,
  jig: SlidersHorizontal,
  combined: Layers,
};

const pill =
  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-colors cursor-pointer active:scale-[0.97] whitespace-nowrap";

export function BottomBar<P>({
  module,
  sections,
  values,
  onChange,
  presetName,
  onCyclePreset,
  onResetView,
  onEditExtra,
  resetLabel,
}: BottomBarProps<P>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState<PromptKind | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const down = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
    };
  }, [menuOpen]);

  const copy = async (kind: PromptKind) => {
    try {
      await navigator.clipboard.writeText(buildPrompt(kind, module, sections, values, presetName));
      setCopied(kind);
      window.setTimeout(() => setCopied((c) => (c === kind ? null : c)), 1600);
    } catch {
      setCopied(null);
    }
  };

  const dock = module.dock ?? [{ kind: "preset" as const }, { kind: "reset-view" as const }];

  return (
    <div ref={ref} className="jig-root fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-24px)]">
      {menuOpen && (
        <div
          role="menu"
          aria-label="Copy Prompt options"
          className="absolute bottom-full right-0 mb-2 w-72 rounded-xl border border-zinc-800/90 bg-[#101012]/95 backdrop-blur-xl p-1.5 shadow-2xl text-zinc-100"
        >
          <div className="px-2.5 py-1.5 border-b border-zinc-800/80 mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-zinc-300">Copy Live Prompt</span>
            <span className="jig-mono text-[10px] text-zinc-500 truncate">
              {module.id} · {presetName}
            </span>
          </div>
          {PROMPT_KINDS.map(({ kind, label, desc }) => {
            const Icon = KIND_ICON[kind];
            const done = copied === kind;
            return (
              <button
                key={kind}
                type="button"
                role="menuitem"
                onClick={() => copy(kind)}
                className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-zinc-800/80 transition-colors cursor-pointer group"
              >
                <span className="mt-0.5 p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-colors shrink-0">
                  {done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Icon className="w-3.5 h-3.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium">{label}</span>
                    {done && <span className="jig-mono text-[10px] text-emerald-400">Copied</span>}
                  </span>
                  <span className="block text-[10px] text-zinc-400 truncate mt-0.5">{desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <nav
        aria-label="Studio dock"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border border-zinc-800/90 bg-[#101012]/90 backdrop-blur-xl text-zinc-100 shadow-2xl overflow-x-auto"
      >
        {dock.map((item, i) => {
          switch (item.kind) {
            case "segmented": {
              const current = String(getPath(values, item.path));
              return (
                <div
                  key={i}
                  role="group"
                  aria-label={item.label}
                  className="flex items-center gap-1 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800/70"
                >
                  {item.options.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={current === o.value}
                      onClick={() => onChange(item.path, o.value)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer active:scale-[0.97] whitespace-nowrap",
                        current === o.value
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70",
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              );
            }
            case "play-pause": {
              const paused = Boolean(getPath(values, item.path));
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={paused}
                  title={paused ? `Resume ${item.label}` : `Pause ${item.label}`}
                  onClick={() => onChange(item.path, !paused)}
                  className={cn(
                    pill,
                    "border",
                    paused
                      ? "bg-[#fe552e]/15 text-[#fe552e] border-[#fe552e]/40"
                      : "text-zinc-300 hover:text-white hover:bg-zinc-800/80 border-transparent",
                  )}
                >
                  {paused ? <Play className="w-3.5 h-3.5 shrink-0" /> : <Pause className="w-3.5 h-3.5 shrink-0" />}
                  <span>{paused ? "Play" : "Pause"}</span>
                </button>
              );
            }
            case "preset":
              return (
                <button
                  key={i}
                  type="button"
                  onClick={onCyclePreset}
                  title="Cycle preset"
                  className={cn(pill, "text-zinc-300 hover:text-white hover:bg-zinc-800/80")}
                >
                  <Sun className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="jig-mono text-[11px]">{presetName}</span>
                </button>
              );
            case "reset-view":
              return (
                <button
                  key={i}
                  type="button"
                  onClick={onResetView}
                  className={cn(pill, "text-zinc-300 hover:text-white hover:bg-zinc-800/80")}
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>{resetLabel ?? item.label ?? "Reset View"}</span>
                </button>
              );
          }
        })}

        {onEditExtra && module.ExtraSection && (
          <button
            type="button"
            onClick={onEditExtra}
            className={cn(pill, "bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/70")}
          >
            <Pencil className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{module.extraSectionLabel ?? "Edit"}</span>
          </button>
        )}

        <div className="w-px h-5 bg-zinc-800 mx-0.5 shrink-0" />

        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          title="Copy self-contained prompts: 3D Elements, Shader, Jig, or Combined"
          className={cn(
            pill,
            "border",
            menuOpen
              ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/50"
              : "bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80",
          )}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <ClipboardCopy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          <span>{copied ? "Copied!" : "Copy Prompt"}</span>
          <ChevronUp className={cn("w-3 h-3 text-zinc-400 transition-transform shrink-0", menuOpen && "rotate-180")} />
        </button>
      </nav>
    </div>
  );
}
