import type { JigOption, JigSection } from "@/components/jig/schema";
import { ENV_PRESETS } from "./rigTypes";

/**
 * Jig sections for the universal rig. Paths are rooted at `rig.`.
 * Appended after the scene module's own sections in RightJig.
 */

const ENV_OPTIONS: JigOption[] = ENV_PRESETS.map((p) => ({
  value: p,
  label: p.charAt(0).toUpperCase() + p.slice(1),
}));

const lightGroup = (key: "top" | "bottom" | "key", label: string) => ({
  type: "group" as const,
  label,
  controls: [
    { type: "color" as const, label: "Color", path: `rig.lights.${key}.color` },
    { type: "slider" as const, label: "Intensity", path: `rig.lights.${key}.intensity`, min: 0, max: 12, step: 0.05 },
    { type: "slider" as const, label: "X", path: `rig.lights.${key}.x`, min: -20, max: 20, step: 0.1 },
    { type: "slider" as const, label: "Y", path: `rig.lights.${key}.y`, min: -20, max: 20, step: 0.1 },
    { type: "slider" as const, label: "Z", path: `rig.lights.${key}.z`, min: -20, max: 20, step: 0.1 },
  ],
});

export const RIG_SECTIONS: JigSection[] = [
  {
    id: "lights",
    title: "Lights",
    controls: [
      { type: "slider", label: "Ambient", path: "rig.lights.ambient", min: 0, max: 4, step: 0.01 },
      { type: "color", label: "Ambient Color", path: "rig.lights.ambientColor" },
      lightGroup("top", "Top"),
      lightGroup("bottom", "Bottom"),
      { ...lightGroup("key", "Key"), hint: "castShadow: true" },
    ],
  },
  {
    id: "shadows",
    title: "Shadows",
    controls: [
      { type: "slider", label: "Radius", path: "rig.shadows.radius", min: 0, max: 50, step: 0.5 },
      { type: "slider", label: "Map Size", path: "rig.shadows.mapSize", min: 512, max: 4096, step: 256 },
    ],
  },
  {
    id: "backdrop",
    title: "Backdrop",
    controls: [
      { type: "toggle", label: "Show", path: "rig.backdrop.show" },
      { type: "color", label: "Color", path: "rig.backdrop.color" },
      { type: "slider", label: "Z", path: "rig.backdrop.z", min: -15, max: 0, step: 0.1 },
      { type: "toggle", label: "Receive Shadows", path: "rig.backdrop.receiveShadows" },
      { type: "slider", label: "Roughness", path: "rig.backdrop.roughness", min: 0, max: 1, step: 0.01 },
      { type: "slider", label: "Metalness", path: "rig.backdrop.metalness", min: 0, max: 1, step: 0.01 },
      { type: "slider", label: "Env Intensity", path: "rig.backdrop.envIntensity", min: 0, max: 4, step: 0.05 },
      { type: "slider", label: "Dither", path: "rig.backdrop.dither", min: 0, max: 1, step: 0.01 },
      { type: "select", label: "Env Preset", path: "rig.backdrop.envPreset", options: ENV_OPTIONS },
    ],
  },
  {
    id: "camera",
    title: "Camera",
    controls: [
      { type: "slider", label: "Fov", path: "rig.camera.fov", min: 10, max: 90, step: 0.5 },
      { type: "slider", label: "X", path: "rig.camera.x", min: -20, max: 20, step: 0.05 },
      { type: "slider", label: "Y", path: "rig.camera.y", min: -20, max: 20, step: 0.05 },
      { type: "slider", label: "Z", path: "rig.camera.z", min: 2, max: 50, step: 0.1 },
      { type: "toggle", label: "Follow Cursor", path: "rig.camera.followCursor" },
      { type: "slider", label: "Tilt Deg", path: "rig.camera.tiltDeg", min: 0, max: 15, step: 0.1 },
    ],
  },
];
