/**
 * Declarative jig schema. A scene module describes its params as
 * `JigSection[]`; RightJig, BottomBar and the prompt exporter all render from
 * the same schema, so adding a control is one object literal.
 *
 * Paths are dot paths into `JigValues` (`rig.lights.key.intensity`,
 * `scene.cuboid.width`).
 */

import type { RigConfig } from "@/three/rig/rigTypes";

export interface JigValues<P> {
  rig: RigConfig;
  scene: P;
}

export interface JigOption {
  value: string;
  label: string;
}

interface BaseControl {
  label: string;
  /** Optional one-liner, shown as a tooltip and quoted in prompt export. */
  hint?: string;
}

export interface SliderControl extends BaseControl {
  type: "slider";
  path: string;
  min: number;
  max: number;
  step: number;
}

export interface ColorControl extends BaseControl {
  type: "color";
  path: string;
}

export interface ToggleControl extends BaseControl {
  type: "toggle";
  path: string;
}

export interface SelectControl extends BaseControl {
  type: "select";
  path: string;
  options: JigOption[];
}

export interface TextControl extends BaseControl {
  type: "text";
  path: string;
  multiline?: boolean;
}

export interface GroupControl extends BaseControl {
  type: "group";
  controls: JigControl[];
  defaultOpen?: boolean;
}

export type JigControl =
  | SliderControl
  | ColorControl
  | ToggleControl
  | SelectControl
  | TextControl
  | GroupControl;

export interface JigSection {
  id: string;
  title: string;
  controls: JigControl[];
  defaultOpen?: boolean;
}

/** Bottom-bar quick controls, also schema-driven. */
export type DockItem =
  | { kind: "segmented"; path: string; label: string; options: JigOption[] }
  | { kind: "play-pause"; path: string; label: string }
  | { kind: "preset" }
  | { kind: "reset-view"; label?: string };

// ---------------------------------------------------------------- helpers

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function deepMerge<T>(base: T, patch?: DeepPartial<T> | null): T {
  if (!patch) return structuredClone(base);
  const out = structuredClone(base) as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (v === undefined) continue;
    const cur = out[k];
    out[k] = isPlainObject(cur) && isPlainObject(v) ? deepMerge(cur, v) : structuredClone(v);
  }
  return out as T;
}

export function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const key of path.split(".")) {
    if (!isPlainObject(cur) && !Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

/** Immutable set: returns a new object with structural sharing. */
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const src = (isPlainObject(obj) ? obj : {}) as Record<string, unknown>;
  return {
    ...src,
    [head]: rest.length === 0 ? value : setPath(src[head], rest.join("."), value),
  } as T;
}

/** Every leaf control in a section list (groups flattened). */
export function flattenControls(sections: JigSection[]): Exclude<JigControl, GroupControl>[] {
  const out: Exclude<JigControl, GroupControl>[] = [];
  const walk = (controls: JigControl[]) => {
    for (const c of controls) {
      if (c.type === "group") walk(c.controls);
      else out.push(c);
    }
  };
  for (const s of sections) walk(s.controls);
  return out;
}

/** Dev check: every schema path must resolve against the defaults. */
export function validateSchema<P>(sections: JigSection[], values: JigValues<P>): string[] {
  return flattenControls(sections)
    .filter((c) => getPath(values, c.path) === undefined)
    .map((c) => `${c.label} → ${c.path}`);
}
