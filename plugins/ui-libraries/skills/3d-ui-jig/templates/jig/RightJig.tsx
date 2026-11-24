import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, Copy, RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  JigColor,
  JigFold,
  JigSelect,
  JigSlider,
  JigSubGroup,
  JigText,
  JigToggle,
} from "./JigControls";
import { getPath, type JigControl, type JigSection } from "./schema";
import "./jig.css";

/**
 * Schema-driven right-hand jig (DialKit style): fixed top-right, 308px,
 * neutral obsidian glass. Header = title, preset select, Copy JSON, Reset,
 * Collapse. Body = one collapsible fold per JigSection, then `extra`.
 */

export interface RightJigProps {
  title: string;
  sections: JigSection[];
  values: unknown;
  onChange: (path: string, value: unknown) => void;
  presetNames: string[];
  activePreset: string;
  onPresetSelect: (name: string) => void;
  onReset: () => void;
  /** Free-form sections appended after the schema (e.g. card editor). */
  extra?: ReactNode;
  /** Bump to force-expand the panel (e.g. dock "Edit" button). */
  expandRequest?: number;
}

function ControlView({
  control,
  values,
  onChange,
}: {
  control: JigControl;
  values: unknown;
  onChange: (path: string, value: unknown) => void;
}) {
  switch (control.type) {
    case "group":
      return (
        <JigSubGroup title={control.label} defaultOpen={control.defaultOpen}>
          {control.controls.map((c, i) => (
            <ControlView key={`${c.label}-${i}`} control={c} values={values} onChange={onChange} />
          ))}
        </JigSubGroup>
      );
    case "slider":
      return (
        <JigSlider
          label={control.label}
          value={Number(getPath(values, control.path) ?? control.min)}
          min={control.min}
          max={control.max}
          step={control.step}
          onChange={(v) => onChange(control.path, v)}
        />
      );
    case "color":
      return (
        <JigColor
          label={control.label}
          value={String(getPath(values, control.path) ?? "#000000")}
          onChange={(v) => onChange(control.path, v)}
        />
      );
    case "toggle":
      return (
        <JigToggle
          label={control.label}
          checked={Boolean(getPath(values, control.path))}
          onChange={(v) => onChange(control.path, v)}
        />
      );
    case "select":
      return (
        <JigSelect
          label={control.label}
          value={String(getPath(values, control.path) ?? "")}
          options={control.options}
          onChange={(v) => onChange(control.path, v)}
        />
      );
    case "text":
      return (
        <JigText
          label={control.label}
          multiline={control.multiline}
          value={String(getPath(values, control.path) ?? "")}
          onChange={(v) => onChange(control.path, v)}
        />
      );
  }
}

export function RightJig({
  title,
  sections,
  values,
  onChange,
  presetNames,
  activePreset,
  onPresetSelect,
  onReset,
  extra,
  expandRequest = 0,
}: RightJigProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (expandRequest > 0) setCollapsed(false);
  }, [expandRequest]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(values, null, 2));
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const iconBtn =
    "p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 active:scale-[0.96] transition cursor-pointer";

  return (
    <aside
      aria-label={`${title} controls`}
      className={cn(
        "jig-root fixed top-4 right-4 z-30 w-[308px] max-w-[calc(100vw-32px)] rounded-xl border border-zinc-800/90 bg-[#101012]/90 backdrop-blur-xl text-zinc-100 shadow-2xl flex flex-col overflow-hidden transition-all duration-200",
        collapsed ? "max-h-[46px]" : "max-h-[calc(100vh-32px)]",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <h1 className="text-[13px] font-semibold tracking-tight truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <select
            aria-label="Preset"
            value={activePreset}
            onChange={(e) => onPresetSelect(e.target.value)}
            className="max-w-[96px] text-[11px] bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-md px-2 py-1 outline-none focus:border-emerald-500/70 cursor-pointer"
          >
            {presetNames.map((n) => (
              <option key={n} value={n} className="bg-zinc-900">
                {n}
              </option>
            ))}
          </select>
          <button type="button" onClick={copyJson} title="Copy JSON" aria-label="Copy params JSON" className={iconBtn}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button type="button" onClick={onReset} title="Reset" aria-label="Reset parameters" className={iconBtn}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand" : "Collapse"}
            aria-label={collapsed ? "Expand panel" : "Collapse panel"}
            className={iconBtn}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="jig-scroll overflow-y-auto flex-1">
          {sections.map((section) => (
            <JigFold key={section.id} title={section.title} defaultOpen={section.defaultOpen}>
              {section.controls.map((c, i) => (
                <ControlView key={`${section.id}-${i}`} control={c} values={values} onChange={onChange} />
              ))}
            </JigFold>
          ))}
          {extra}
        </div>
      )}
    </aside>
  );
}
