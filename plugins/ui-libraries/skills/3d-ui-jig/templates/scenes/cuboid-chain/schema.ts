import type { DockItem, JigSection } from "@/components/jig/schema";
import { AXIS_OPTIONS, SHAPE_OPTIONS } from "./params";

/** Scene sections, paths rooted at `scene.` (ranges from the live DialKit panel). */
export const CUBOID_CHAIN_SCHEMA: JigSection[] = [
  {
    id: "shape",
    title: "Shape",
    defaultOpen: true,
    controls: [
      { type: "select", label: "Type", path: "scene.shape.type", options: SHAPE_OPTIONS },
      { type: "slider", label: "Radius", path: "scene.shape.radius", min: 1.5, max: 12, step: 0.1 },
      { type: "slider", label: "Amplitude", path: "scene.shape.amplitude", min: 0, max: 5, step: 0.05 },
    ],
  },
  {
    id: "cuboid",
    title: "Cuboid",
    controls: [
      { type: "slider", label: "Width", path: "scene.cuboid.width", min: 0.3, max: 5, step: 0.01 },
      { type: "slider", label: "Height", path: "scene.cuboid.height", min: 0.3, max: 6, step: 0.01 },
      { type: "slider", label: "Depth", path: "scene.cuboid.depth", min: 0.02, max: 2, step: 0.01 },
      { type: "slider", label: "Corner Radius", path: "scene.cuboid.cornerRadius", min: 0, max: 0.6, step: 0.005 },
      { type: "slider", label: "Bevel Size", path: "scene.cuboid.bevelSize", min: 0, max: 0.3, step: 0.001 },
      { type: "slider", label: "Bevel Thickness", path: "scene.cuboid.bevelThickness", min: 0, max: 0.3, step: 0.001 },
      { type: "slider", label: "Smoothness", path: "scene.cuboid.smoothness", min: 1, max: 32, step: 1 },
      { type: "slider", label: "Roughness", path: "scene.cuboid.roughness", min: 0, max: 1, step: 0.01 },
      { type: "slider", label: "Metalness", path: "scene.cuboid.metalness", min: 0, max: 1, step: 0.01 },
      { type: "color", label: "Color", path: "scene.cuboid.color" },
      { type: "slider", label: "Dither", path: "scene.cuboid.dither", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "layout",
    title: "Layout",
    controls: [
      { type: "slider", label: "Count", path: "scene.layout.count", min: 1, max: 12, step: 1 },
      { type: "slider", label: "Gap", path: "scene.layout.gap", min: 0, max: 1.5, step: 0.005 },
      { type: "slider", label: "Scroll Speed", path: "scene.layout.scrollSpeed", min: 0, max: 3, step: 0.01 },
    ],
  },
  {
    id: "rotation",
    title: "Rotation",
    controls: [
      { type: "slider", label: "Speed", path: "scene.rotation.speed", min: -4, max: 4, step: 0.01 },
      { type: "slider", label: "Stagger", path: "scene.rotation.stagger", min: -3, max: 3, step: 0.01 },
      { type: "select", label: "Axis", path: "scene.rotation.axis", options: AXIS_OPTIONS },
      { type: "toggle", label: "Paused", path: "scene.rotation.paused" },
      { type: "slider", label: "Face Speed", path: "scene.rotation.faceSpeed", min: 1, max: 20, step: 0.5 },
    ],
  },
  {
    id: "hover",
    title: "Hover",
    controls: [
      { type: "slider", label: "Subtitle Opacity", path: "scene.hover.subtitleOpacity", min: 0, max: 1, step: 0.01 },
      { type: "slider", label: "Pill Bg Opacity", path: "scene.hover.pillBgOpacity", min: 0, max: 1, step: 0.01 },
      { type: "slider", label: "Other Opacity", path: "scene.hover.otherOpacity", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "focus",
    title: "Focus",
    controls: [
      { type: "slider", label: "Speed", path: "scene.focus.speed", min: 1, max: 12, step: 0.1 },
      { type: "slider", label: "Featured Z", path: "scene.focus.featuredZ", min: -2, max: 5, step: 0.05 },
      { type: "slider", label: "Camera Z", path: "scene.focus.cameraZ", min: 2, max: 20, step: 0.1 },
      { type: "slider", label: "Cuboid Tilt Deg", path: "scene.focus.cuboidTiltDeg", min: 0, max: 40, step: 0.5 },
      { type: "slider", label: "Fly Out Extra", path: "scene.focus.flyOutExtra", min: 0, max: 12, step: 0.1 },
    ],
  },
];

export const CUBOID_CHAIN_DOCK: DockItem[] = [
  { kind: "segmented", label: "3D Shape", path: "scene.shape.type", options: SHAPE_OPTIONS },
  { kind: "play-pause", label: "rotation", path: "scene.rotation.paused" },
  { kind: "preset" },
  { kind: "reset-view" },
];
