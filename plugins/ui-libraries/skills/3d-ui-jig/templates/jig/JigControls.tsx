import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

function roundToStep(value: number, step: number): number {
  if (step <= 0) return value;
  const decimals = (step.toString().split(".")[1] || "").length;
  const snapped = Math.round(value / step) * step;
  return Number(snapped.toFixed(Math.min(decimals + 2, 6)));
}

function formatNumber(value: number, step: number): string {
  const decimals = (step.toString().split(".")[1] || "").length;
  return value.toFixed(decimals);
}

interface JigFoldProps {
  title: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  badge?: string;
  children: ReactNode;
}

export function JigFold({
  title,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  badge,
  children,
}: JigFoldProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const toggle = () => {
    const next = !isOpen;
    if (controlledOpen === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <div className="border-b border-zinc-800/80 last:border-b-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-zinc-800/40 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          )}
          <span className="text-[12px] font-medium tracking-wide text-zinc-100">
            {title}
          </span>
        </div>
        {badge && (
          <span className="text-[10px] jig-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {badge}
          </span>
        )}
      </button>
      {isOpen && <div className="px-3.5 pb-3 pt-1 space-y-2.5">{children}</div>}
    </div>
  );
}

interface JigSubGroupProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function JigSubGroup({
  title,
  defaultOpen = false,
  children,
}: JigSubGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-zinc-800/90 bg-zinc-950/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-zinc-800/40 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-1.5">
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
          )}
          <span className="text-[11px] font-medium text-zinc-300">{title}</span>
        </div>
      </button>
      {isOpen && (
        <div className="px-2.5 pb-2.5 pt-1.5 space-y-2 border-t border-zinc-800/60">
          {children}
        </div>
      )}
    </div>
  );
}

interface JigSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function JigSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: JigSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const clamped = Math.min(max, Math.max(min, value));
  const percent = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const next = Math.min(max, Math.max(min, roundToStep(raw, step)));
      onChange(next);
    },
    [min, max, step, onChange],
  );

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      updateFromClientX(e.clientX);
    };
    const handleUp = () => {
      setDragging(false);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragging, updateFromClientX]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    updateFromClientX(e.clientX);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta = e.shiftKey ? step * 10 : step;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, roundToStep(clamped + delta, step)));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(min, roundToStep(clamped - delta, step)));
    }
  };

  const commitDraft = () => {
    const parsed = Number.parseFloat(draft);
    if (Number.isFinite(parsed)) {
      const next = Math.min(max, Math.max(min, roundToStep(parsed, step)));
      onChange(next);
    }
    setEditing(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-400 truncate select-none">
          {label}
        </span>
        {editing ? (
          <input
            type="text"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitDraft();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-16 text-right text-[11px] jig-mono bg-zinc-900 text-zinc-100 border border-emerald-500/70 rounded px-1 py-0.5 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(formatNumber(clamped, step));
              setEditing(true);
            }}
            title="Click to enter exact value"
            className="text-[11px] jig-mono text-zinc-200 hover:text-emerald-400 transition-colors cursor-text px-1 rounded hover:bg-zinc-800/70"
          >
            {formatNumber(clamped, step)}
          </button>
        )}
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative h-5 rounded-md bg-zinc-900 border border-zinc-800 overflow-hidden cursor-ew-resize select-none touch-none outline-none focus-visible:ring-1 focus-visible:ring-emerald-500",
          dragging && "border-emerald-500/60",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-[background-color]",
            dragging ? "bg-emerald-500/35" : "bg-emerald-600/25",
          )}
          style={{ width: `${percent}%` }}
        />
        <div
          className={cn(
            "absolute top-0 bottom-0 w-0.5 transition-colors",
            dragging ? "bg-emerald-400" : "bg-emerald-500/80",
          )}
          style={{ left: `calc(${percent}% - 1px)` }}
        />
      </div>
    </div>
  );
}

interface JigColorProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export function JigColor({ label, value, onChange }: JigColorProps) {
  const [hexDraft, setHexDraft] = useState(value);

  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  const handleHexChange = (raw: string) => {
    setHexDraft(raw);
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      onChange(raw.toLowerCase());
    }
  };

  const commitHex = () => {
    const normalized = hexDraft.startsWith("#") ? hexDraft : `#${hexDraft}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      onChange(normalized.toLowerCase());
    } else {
      setHexDraft(value);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-zinc-400 truncate select-none">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <label className="relative w-6 h-5 rounded border border-zinc-700 overflow-hidden cursor-pointer shrink-0">
          <span
            className="block w-full h-full"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            aria-label={`${label} color picker`}
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
        <input
          type="text"
          aria-label={`${label} hex`}
          value={hexDraft}
          onChange={(e) => handleHexChange(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitHex();
          }}
          className="w-[72px] text-[11px] jig-mono bg-zinc-900 text-zinc-200 border border-zinc-800 rounded px-1.5 py-0.5 outline-none focus:border-emerald-500/70"
        />
      </div>
    </div>
  );
}

interface JigToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function JigToggle({ label, checked, onChange }: JigToggleProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[11px] text-zinc-400 truncate select-none">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-emerald-500",
          checked
            ? "bg-emerald-600 border-emerald-500"
            : "bg-zinc-800 border-zinc-700",
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[2px]",
          )}
        />
      </button>
    </div>
  );
}

export interface JigSelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface JigSelectProps<T extends string = string> {
  label: string;
  value: T;
  options: JigSelectOption<T>[];
  onChange: (value: T) => void;
}

export function JigSelect<T extends string = string>({
  label,
  value,
  options,
  onChange,
}: JigSelectProps<T>) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-zinc-400 truncate select-none shrink-0">
        {label}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="max-w-[165px] w-full text-[11px] bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-md px-2 py-1 outline-none focus:border-emerald-500/70 cursor-pointer truncate"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface JigTextProps {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}

export function JigText({ label, value, multiline, onChange }: JigTextProps) {
  const cls =
    "w-full text-[11px] bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-md px-2 py-1 outline-none focus:border-emerald-500/70";
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-zinc-400 select-none">{label}</label>
      {multiline ? (
        <textarea
          rows={2}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className={cn(cls, "resize-none")}
        />
      ) : (
        <input
          type="text"
          value={value}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}
