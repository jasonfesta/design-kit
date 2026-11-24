/**
 * Cuboid Chain scene params — the first 3d-ui-jig scene module.
 * Rebuild of experiments.thisiswhitespace.com/cuboid-chain: a row of beveled
 * cuboids whose front caps carry CanvasTexture cards; hover faces a card to
 * the camera and swaps in an accent hover state; click flies it into focus.
 */

export type ShapeType = "chain" | "helix" | "ring" | "wave" | "arch";
export type RotationAxis = "x" | "y" | "z";

export interface ShapeConfig {
  type: ShapeType;
  radius: number;
  amplitude: number;
}

export interface CuboidConfig {
  width: number;
  height: number;
  depth: number;
  cornerRadius: number;
  bevelSize: number;
  bevelThickness: number;
  smoothness: number;
  roughness: number;
  metalness: number;
  color: string;
  dither: number;
}

export interface LayoutConfig {
  count: number;
  gap: number;
  scrollSpeed: number;
}

export interface RotationConfig {
  speed: number;
  stagger: number;
  axis: RotationAxis;
  paused: boolean;
  faceSpeed: number;
}

export interface HoverConfig {
  subtitleOpacity: number;
  pillBgOpacity: number;
  otherOpacity: number;
}

export interface FocusConfig {
  speed: number;
  featuredZ: number;
  cameraZ: number;
  cuboidTiltDeg: number;
  flyOutExtra: number;
}

export interface CardItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  pills: string[];
  accentColor: string;
}

export interface CuboidChainParams {
  shape: ShapeConfig;
  cuboid: CuboidConfig;
  layout: LayoutConfig;
  rotation: RotationConfig;
  hover: HoverConfig;
  focus: FocusConfig;
  cards: CardItem[];
}

export const SHAPE_OPTIONS: { value: ShapeType; label: string }[] = [
  { value: "chain", label: "Chain" },
  { value: "helix", label: "Helix" },
  { value: "ring", label: "Ring" },
  { value: "wave", label: "Wave" },
  { value: "arch", label: "Arch" },
];

export const AXIS_OPTIONS: { value: RotationAxis; label: string }[] = [
  { value: "x", label: "X — horizontal (barrel roll)" },
  { value: "y", label: "Y — vertical (turntable)" },
  { value: "z", label: "Z — depth (pinwheel)" },
];

/** The live site's indigo, magenta and violet accents are remapped to teal, rose and ochre (design-kit taste rule). */
export const DEFAULT_CARDS: CardItem[] = [
  { id: "card-01", category: "Kinetic Shader", title: "Extruded Bevel Normal Blending", description: "Softens cap edges into side walls with zero UV bleed.", pills: ["GLSL", "Three.js"], accentColor: "#fe552e" },
  { id: "card-02", category: "Spatial Layout", title: "Infinite Seamless Modulo Chain", description: "Tiled viewport wrapping with cursor-aware pause.", pills: ["Loop", "60fps"], accentColor: "#d98a1f" },
  { id: "card-03", category: "Surface Craft", title: "Procedural PMREM Light Probes", description: "Offline studio environments without external HDRI fetches.", pills: ["PMREM", "PBR"], accentColor: "#0d9488" },
  { id: "card-04", category: "Shadow Rig", title: "Dynamic Frustum Key Lighting", description: "Per-frame orthographic bounds fitted to visible chain.", pills: ["PCF", "2048px"], accentColor: "#1f9d57" },
  { id: "card-05", category: "Focus Mode", title: "Perspective Scale Projection", description: "Selected cuboid flies forward with pointer-driven tilt.", pills: ["Spring", "Focus"], accentColor: "#e11d48" },
  { id: "card-06", category: "Canvas Atlas", title: "Crisp Dual-Pass Card Texture", description: "Base and hover states composited inside fragment shader.", pills: ["540x756", "sRGB"], accentColor: "#059669" },
  { id: "card-07", category: "Form Factor", title: "Multi-Shape 3D Formations", description: "Switch between Chain, Helix, Ring, Wave, and Arch.", pills: ["Helix", "Arch"], accentColor: "#e23d3d" },
  { id: "card-08", category: "Post Tone", title: "Screen-Space Hash Dithering", description: "Eliminates dark gradient banding on matte backdrops.", pills: ["Dither", "ACES"], accentColor: "#ca8a04" },
  { id: "card-09", category: "Interaction", title: "Camera-Facing Hover Snap", description: "Hovered cuboid rotates smoothly toward the viewer.", pills: ["Raycast", "Lerp"], accentColor: "#b45309" },
  { id: "card-10", category: "Optics", title: "Anisotropic Texture Filtering", description: "Preserves typographic sharpness at oblique angles.", pills: ["8x Aniso", "Type"], accentColor: "#0f766e" },
  { id: "card-11", category: "Geometry", title: "Merged Rounded Extrusion", description: "Custom top and side UV generator with welded vertices.", pills: ["Extrude", "Welded"], accentColor: "#be123c" },
  { id: "card-12", category: "Rigging", title: "Staggered Axis Kinematics", description: "Independent X, Y, or Z rotation with phase offset.", pills: ["Axis", "Stagger"], accentColor: "#65a30d" },
];

export const CUBOID_CHAIN_DEFAULTS: CuboidChainParams = {
  shape: { type: "chain", radius: 4.5, amplitude: 1.4 },
  cuboid: {
    width: 1.7,
    height: 2.4,
    depth: 2,
    cornerRadius: 0.105,
    bevelSize: 0.03,
    bevelThickness: 0.04,
    smoothness: 32,
    roughness: 0.6,
    metalness: 0.4,
    color: "#242424",
    dither: 0,
  },
  layout: { count: 8, gap: 0.01, scrollSpeed: 0.6 },
  rotation: { speed: 0.57, stagger: 0.37, axis: "x", paused: false, faceSpeed: 20 },
  hover: { subtitleOpacity: 1, pillBgOpacity: 0.42, otherOpacity: 1 },
  focus: { speed: 5, featuredZ: -1.05, cameraZ: 4, cuboidTiltDeg: 33.5, flyOutExtra: 8 },
  cards: DEFAULT_CARDS,
};
