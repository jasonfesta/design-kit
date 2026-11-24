import type { ComponentType } from "react";
import type * as THREE from "three";
import type { RigHandle } from "@/three/rig/createRig";
import type { RigConfig } from "@/three/rig/rigTypes";
import type {
  DeepPartial,
  DockItem,
  JigSection,
  JigValues,
} from "@/components/jig/schema";

/**
 * A scene module = one kind of 3D UI (a chain of cards, a carousel, a single
 * tactile button…). It plugs into the universal rig + jig:
 *
 *   defaults + schema  → RightJig / BottomBar render the controls
 *   presets            → header preset menu + dock cycle button
 *   create()           → imperative three.js runtime driven every frame
 *   prompt / snippets  → Copy Prompt exporter
 */

export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  rig: RigHandle;
  maxAnisotropy: number;
  domElement: HTMLCanvasElement;
  /** Report scene state to React (e.g. which card is focused). */
  emit: (key: string, value: unknown) => void;
}

export interface PointerState {
  /** NDC, -1..1, +Y up. */
  x: number;
  y: number;
  inside: boolean;
}

export interface SceneFrame {
  dt: number;
  time: number;
  pointer: PointerState;
  raycaster: THREE.Raycaster;
  rig: RigConfig;
  /** Half visible width at a given camera distance. */
  viewHalfAt: (distance: number) => number;
  transparent: boolean;
}

/** Returned from `preFrame` to steer the camera + shadow rig this frame. */
export interface FrameDirectives {
  cameraZ?: number;
  cameraOffsetY?: number;
  tiltScale?: number;
  shadowHalfWidth?: number;
  shadowHalfHeight?: number;
  cursor?: "default" | "pointer";
}

export interface SceneRuntime<P> {
  /** Before the camera update: hover raycasts, focus progress, camera overrides. */
  preFrame?(params: P, frame: SceneFrame): FrameDirectives | void;
  /** After the camera + rig update: animate meshes, set uniforms. */
  update(params: P, frame: SceneFrame): void;
  /** Called when params change by reference (rebuild geometry / textures here). */
  onParamsChange?(next: P, prev: P): void;
  /** Click on the canvas; raycaster is already set from the click point. */
  onClick?(raycaster: THREE.Raycaster): void;
  onPointerLeave?(): void;
  /** Bottom bar "Reset view": exit focus, rewind scroll, etc. */
  onReset?(): void;
  dispose(): void;
}

export interface ExtraSectionProps<P> {
  values: JigValues<P>;
  setScene: (updater: (prev: P) => P) => void;
  sceneState: Record<string, unknown>;
  openRequest: number;
}

export interface ScenePromptContext<P> {
  values: JigValues<P>;
  presetName: string;
}

export interface SceneModule<P> {
  id: string;
  title: string;
  /** One line, used in the jig header and the prompt exporter. */
  summary: string;
  defaults: P;
  rigDefaults?: DeepPartial<RigConfig>;
  /** Scene-specific jig sections, paths rooted at `scene.`. */
  schema: JigSection[];
  /** Name of the defaults preset in the menu (default "Default"). */
  defaultPresetName?: string;
  /** Named presets, deep-merged over the defaults. The defaults preset is added automatically. */
  presets?: Record<string, DeepPartial<JigValues<P>>>;
  dock?: DockItem[];
  /** Paths kept across preset switches and Reset (e.g. "scene.cards"). */
  persistPaths?: string[];
  /** Optional free-form jig section (e.g. per-card content editor). */
  ExtraSection?: ComponentType<ExtraSectionProps<P>>;
  /** Label for the dock button that opens ExtraSection. */
  extraSectionLabel?: string;
  /** Scene-specific GLSL quoted verbatim by the Shader prompt. */
  shaderSnippets?: { name: string; glsl: string }[];
  prompt: {
    /** Prose for the "3D Elements" prompt, with live values interpolated. */
    elements: (ctx: ScenePromptContext<P>) => string;
    /** Extra prose for the "Shader" prompt. */
    shader?: (ctx: ScenePromptContext<P>) => string;
  };
  create(ctx: SceneContext, params: P): SceneRuntime<P>;
}
