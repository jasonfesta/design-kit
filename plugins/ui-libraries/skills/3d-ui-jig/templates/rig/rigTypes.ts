/**
 * Universal 3D rig config — shared by every scene module.
 * Lights (ambient + Top / Bottom / Key), shadows, dithered backdrop with a
 * procedural PMREM env preset, and the camera rig.
 */

export type EnvPreset =
  | "studio"
  | "city"
  | "apartment"
  | "warehouse"
  | "dawn"
  | "forest"
  | "lobby"
  | "night"
  | "park"
  | "sunset";

export const ENV_PRESETS: readonly EnvPreset[] = [
  "studio",
  "city",
  "apartment",
  "warehouse",
  "dawn",
  "forest",
  "lobby",
  "night",
  "park",
  "sunset",
] as const;

export interface DirectionalLightConfig {
  color: string;
  intensity: number;
  x: number;
  y: number;
  z: number;
}

export interface LightsConfig {
  ambient: number;
  ambientColor: string;
  top: DirectionalLightConfig;
  bottom: DirectionalLightConfig;
  /** The only shadow-casting light. */
  key: DirectionalLightConfig;
}

export interface ShadowsConfig {
  radius: number;
  mapSize: number;
}

export interface BackdropConfig {
  show: boolean;
  color: string;
  z: number;
  receiveShadows: boolean;
  roughness: number;
  metalness: number;
  envIntensity: number;
  dither: number;
  envPreset: EnvPreset;
}

export interface CameraConfig {
  fov: number;
  x: number;
  y: number;
  z: number;
  followCursor: boolean;
  tiltDeg: number;
}

export interface RigConfig {
  lights: LightsConfig;
  shadows: ShadowsConfig;
  backdrop: BackdropConfig;
  camera: CameraConfig;
}

/**
 * Light-by-default rig (warm paper backdrop, studio env). Scene modules
 * override any part of it through `SceneModule.rigDefaults`.
 */
export const DEFAULT_RIG: RigConfig = {
  lights: {
    ambient: 0.35,
    ambientColor: "#ffffff",
    top: { color: "#ffffff", intensity: 3.1, x: 20, y: 9, z: 3 },
    bottom: { color: "#ffcaad", intensity: 2.15, x: 0, y: -8, z: 3 },
    key: { color: "#ffe9d6", intensity: 5, x: 12, y: 9.2, z: 7 },
  },
  shadows: {
    radius: 44.5,
    mapSize: 2048,
  },
  backdrop: {
    show: true,
    color: "#f5f4f0",
    z: -2.4,
    receiveShadows: true,
    roughness: 0.72,
    metalness: 0,
    envIntensity: 0.3,
    dither: 0,
    envPreset: "studio",
  },
  camera: {
    fov: 65,
    x: 0,
    y: 1.1,
    z: 6.2,
    followCursor: true,
    tiltDeg: 15,
  },
};
