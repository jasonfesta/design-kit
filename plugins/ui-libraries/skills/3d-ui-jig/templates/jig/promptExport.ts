import { RIG_SHADER_SNIPPETS } from "@/three/rig/shaderHooks";
import type { SceneModule } from "@/three/scenes/types";
import { getPath, type DockItem, type JigControl, type JigSection, type JigValues } from "./schema";

/**
 * Copy Prompt exporter. Turns schema + live values + shader snippets into four
 * self-contained build prompts:
 *
 *   3d       → 3D Elements (scene geometry/textures/motion + universal rig)
 *   shader   → Shader (onBeforeCompile hooks, scene GLSL, lights, shadows)
 *   jig      → Right-Hand Jig (generated from the schema, with live values)
 *   combined → 3D + Jig (all three)
 *
 * Each prompt ends with the design-kit enrichment block (type, color, avoid).
 */

export type PromptKind = "3d" | "shader" | "jig" | "combined";

export const PROMPT_KINDS: { kind: PromptKind; label: string; desc: string }[] = [
  { kind: "3d", label: "3D Elements", desc: "Geometry, CanvasTexture UI, motion & rig" },
  { kind: "shader", label: "Shader", desc: "onBeforeCompile hooks, GLSL & lights" },
  { kind: "jig", label: "Right-Hand Jig", desc: "Schema, ranges & live values" },
  { kind: "combined", label: "3D + Jig", desc: "Scene, shader & jig in one prompt" },
];

export interface PromptOptions {
  /** Typography line for the enrichment block. */
  typography?: string;
  /** Extra "Avoid:" items. */
  avoid?: string[];
}

const fmt = (v: unknown): string => {
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(4)));
  if (typeof v === "string") return /^#[0-9a-f]{6}$/i.test(v) ? v : `"${v}"`;
  return String(v);
};

function describeControl(c: JigControl, values: unknown, indent: string): string {
  if (c.type === "group") {
    const inner = c.controls.map((x) => describeControl(x, values, `${indent}  `)).join("\n");
    return `${indent}- ${c.label} (collapsible sub-group${c.hint ? `, ${c.hint}` : ""}):\n${inner}`;
  }
  const v = fmt(getPath(values, c.path));
  switch (c.type) {
    case "slider":
      return `${indent}- ${c.label}: slider ${c.min}..${c.max} step ${c.step}, now ${v}`;
    case "color":
      return `${indent}- ${c.label}: color (swatch + hex), now ${v}`;
    case "toggle":
      return `${indent}- ${c.label}: toggle, now ${v}`;
    case "select":
      return `${indent}- ${c.label}: select [${c.options.map((o) => o.value).join(" | ")}], now ${v}`;
    case "text":
      return `${indent}- ${c.label}: ${c.multiline ? "textarea" : "text"}, now ${v}`;
  }
}

export function describeSections(sections: JigSection[], values: unknown): string {
  return sections
    .map((s, i) => `  ${i + 1}. ${s.title}\n${s.controls.map((c) => describeControl(c, values, "     ")).join("\n")}`)
    .join("\n");
}

function describeDock(dock: DockItem[] | undefined, values: unknown): string {
  if (!dock || dock.length === 0) return "Preset cycle, Reset View and Copy Prompt.";
  const parts = dock.map((d) => {
    switch (d.kind) {
      case "segmented":
        return `${d.label} segmented pills [${d.options.map((o) => o.label).join(" | ")}] (now ${fmt(getPath(values, d.path))})`;
      case "play-pause":
        return `${d.label} play/pause toggle (paused=${fmt(getPath(values, d.path))})`;
      case "preset":
        return "preset cycle button";
      case "reset-view":
        return `${d.label ?? "Reset View"} button`;
    }
  });
  return `${parts.join(", ")}, plus a Copy Prompt menu.`;
}

function rigElements<P>(values: JigValues<P>): string {
  const { camera, backdrop } = values.rig;
  return `- Camera: PerspectiveCamera(fov=${camera.fov}) at [${camera.x}, ${camera.y}, ${camera.z}] looking at the origin; cursor-follow tilt=${camera.followCursor} up to ${camera.tiltDeg}° with exponential smoothing (1 - exp(-8·dt)).
- Backdrop: 80×50 plane at z=${backdrop.z} (show=${backdrop.show}, color=${backdrop.color}, receiveShadow=${backdrop.receiveShadows}, roughness=${backdrop.roughness}, metalness=${backdrop.metalness}, envMapIntensity=${backdrop.envIntensity}, dither=${backdrop.dither}).
- Environment: offline procedural PMREM env (gradient dome + 3 softbox panels, no HDRI fetch), preset="${backdrop.envPreset}".
- Renderer: antialias, dpr ≤ 2, shadowMap PCFShadowMap with shadow.radius blur (PCFSoftShadowMap is deprecated in r18x), ACESFilmicToneMapping, SRGBColorSpace.`;
}

function rigLights<P>(values: JigValues<P>): string {
  const { lights, shadows } = values.rig;
  const dl = (name: string, l: typeof lights.top, extra = "") =>
    `${name} DirectionalLight(${extra}color=${l.color}, intensity=${l.intensity}, pos=[${l.x}, ${l.y}, ${l.z}])`;
  return `- Lights: AmbientLight(color=${lights.ambientColor}, intensity=${lights.ambient}); ${dl("Top", lights.top)}; ${dl("Bottom", lights.bottom)}; ${dl("Key", lights.key, "castShadow=true, ")}.
- Shadows: key light ortho shadow camera re-fitted every frame to the visible width + padding (near 0.1, far 80), mapSize=${shadows.mapSize}, radius=${shadows.radius}·(mapSize/2048), bias=-3e-4/(mapSize/2048), normalBias=0.02/(mapSize/2048).`;
}

function footer<P>(module: SceneModule<P>, values: JigValues<P>, opts: PromptOptions): string {
  const avoid = ["purple/violet", "Material fonts (Roboto, Google Sans)", "blue-tinted dark surfaces", ...(opts.avoid ?? [])];
  return `Typography: ${opts.typography ?? "Instrument Sans (UI + card text) + JetBrains Mono (numbers, tabular-nums)"}
Color: backdrop ${values.rig.backdrop.color}, jig chrome #101012 / #27272a / #fafafa, accent emerald #059669
Avoid: ${avoid.join("; ")}
Scene module: ${module.id}`;
}

export function buildPrompt<P>(
  kind: PromptKind,
  module: SceneModule<P>,
  sections: JigSection[],
  values: JigValues<P>,
  presetName: string,
  opts: PromptOptions = {},
): string {
  const ctx = { values, presetName };

  const p3d = `Build a full-viewport Three.js (r185+) 3D UI scene: ${module.title} — ${module.summary}
${module.prompt.elements(ctx)}
${rigElements(values)}`;

  const snippets = [...RIG_SHADER_SNIPPETS, ...(module.shaderSnippets ?? [])]
    .map((s) => `/* ${s.name} */\n${s.glsl}`)
    .join("\n\n");
  const pShader = `Implement the shaders (MeshStandardMaterial + onBeforeCompile string patches, customProgramCacheKey per variant) and lighting for ${module.title}:
${module.prompt.shader?.(ctx) ?? ""}
${rigLights(values)}
GLSL to inject:
\`\`\`glsl
${snippets}
\`\`\``;

  const pJig = `Build a schema-driven right-hand tuning jig (DialKit style): fixed top-right, 308px wide, neutral obsidian glass #101012 at 90% with backdrop blur, Instrument Sans UI + JetBrains Mono tabular-nums values, emerald #059669 accents, zero purple.
- Header: title "${module.title}", preset select (now "${presetName}"), Copy JSON, Reset, Collapse.
- Sliders are scrubbable tracks with click-to-type values and arrow-key steps (Shift = ×10). Colors are swatch + hex input. Sub-groups collapse.
- \`?nojig=1\` hides all jig chrome for clean captures.
- Bottom dock (centered, bottom 16px): ${describeDock(module.dock, values)}
- Sections (render from a JigSection[] schema; dot paths into { rig, scene }):
${describeSections(sections, values)}${
    module.ExtraSection
      ? `\n  ${sections.length + 1}. ${module.extraSectionLabel ?? "Extra"}: free-form fold after the schema sections (opened by the dock's ${module.extraSectionLabel ?? "Edit"} button).`
      : ""
  }`;

  const body =
    kind === "3d" ? p3d : kind === "shader" ? pShader : kind === "jig" ? pJig : `${p3d}\n\n${pShader}\n\n${pJig}`;
  return `${body.trim()}\n\n${footer(module, values, opts)}`;
}
