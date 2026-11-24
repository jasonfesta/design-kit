import type { DeepPartial, JigValues } from "@/components/jig/schema";
import type { RigConfig } from "@/three/rig/rigTypes";
import type { CuboidChainParams } from "./params";

/**
 * "Version 1" rig = the live site's defaults: a deliberately dark stage
 * (neutral carbon #0c0c0e, no blue cast). Dark is a stated choice here: the
 * cards are dark matte cuboids lit like product shots. "Paper Daylight" is
 * the light alternative.
 */
export const CUBOID_CHAIN_RIG: DeepPartial<RigConfig> = {
  backdrop: {
    color: "#0c0c0e",
    metalness: 0.39,
    envPreset: "city",
  },
};

export const CUBOID_CHAIN_PRESETS: Record<string, DeepPartial<JigValues<CuboidChainParams>>> = {
  "Paper Daylight": {
    // Dark ink cuboids on warm paper: card text stays white-on-dark.
    scene: { cuboid: { color: "#1c1b19", roughness: 0.55, metalness: 0.2 } },
    rig: {
      lights: {
        ambient: 0.8,
        ambientColor: "#ffffff",
        top: { color: "#ffffff", intensity: 2.6, x: 14, y: 12, z: 6 },
        bottom: { color: "#ffe4cc", intensity: 1.2, x: 0, y: -8, z: 3 },
        key: { color: "#fff4e6", intensity: 3.6, x: 10, y: 10, z: 8 },
      },
      backdrop: { color: "#e9e6df", metalness: 0, roughness: 0.85, envPreset: "studio", envIntensity: 0.5 },
    },
  },
  "Studio Warm": {
    scene: { cuboid: { roughness: 0.48, metalness: 0.32, color: "#272420" } },
    rig: {
      lights: {
        ambient: 0.45,
        ambientColor: "#fff7ed",
        top: { color: "#fffbeb", intensity: 3.4, x: 16, y: 11, z: 5 },
        bottom: { color: "#fdba74", intensity: 2.4, x: -4, y: -8, z: 4 },
        key: { color: "#fed7aa", intensity: 5.4, x: 10, y: 9.5, z: 8 },
      },
      backdrop: { color: "#14110f", envPreset: "sunset", envIntensity: 0.45 },
    },
  },
  "Emerald Neon": {
    scene: { cuboid: { roughness: 0.38, metalness: 0.65, color: "#141a17" } },
    rig: {
      lights: {
        ambient: 0.3,
        ambientColor: "#ecfdf5",
        top: { color: "#a7f3d0", intensity: 3.2, x: 18, y: 10, z: 4 },
        bottom: { color: "#059669", intensity: 2.8, x: 0, y: -9, z: 3 },
        key: { color: "#d1fae5", intensity: 5.2, x: 12, y: 9.2, z: 7 },
      },
      backdrop: { color: "#080d0b", envPreset: "night", envIntensity: 0.4 },
    },
  },
  Monolith: {
    scene: {
      cuboid: { roughness: 0.82, metalness: 0.15, color: "#18181b", bevelSize: 0.018, bevelThickness: 0.024 },
    },
    rig: {
      lights: {
        ambient: 0.25,
        ambientColor: "#fafafa",
        top: { color: "#ffffff", intensity: 2.8, x: 14, y: 12, z: 4 },
        bottom: { color: "#d4d4d8", intensity: 1.4, x: 0, y: -8, z: 2 },
        key: { color: "#f4f4f5", intensity: 5.8, x: 14, y: 10, z: 8 },
      },
      backdrop: { color: "#09090b", envPreset: "studio", envIntensity: 0.22 },
    },
  },
};
