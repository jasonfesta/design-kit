import * as THREE from "three";
import type { EnvPreset, RigConfig } from "./rigTypes";
import { generateProceduralEnvMap } from "./envMaps";
import { createDitheredStandardMaterial } from "./shaderHooks";

/**
 * Universal light / shadow / backdrop / environment rig.
 *
 * - AmbientLight + Top, Bottom (fill, no shadow) and Key (castShadow)
 *   DirectionalLights, all live-tunable.
 * - Key shadow uses an orthographic frustum that is re-fitted every frame to
 *   the visible width (plus padding) so shadows stay sharp at any camera Z.
 *   Bias, normal bias and blur radius scale with map size.
 * - 80×50 backdrop plane with screen-space dither, receiving shadows.
 * - Offline procedural PMREM environment (no HDRI fetch) per env preset.
 */

export interface RigFrameInput {
  /** Half the visible width at the scene origin (world units). */
  viewHalf: number;
  /** Optional: scene-specific shadow frustum half extents. */
  shadowHalfWidth?: number;
  shadowHalfHeight?: number;
  /** Hide the backdrop (transparent overlay capture). */
  transparent?: boolean;
}

export interface RigHandle {
  ambient: THREE.AmbientLight;
  top: THREE.DirectionalLight;
  bottom: THREE.DirectionalLight;
  key: THREE.DirectionalLight;
  backdrop: THREE.Mesh;
  update(cfg: RigConfig, frame: RigFrameInput): void;
  dispose(): void;
}

export function createRig(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  initial: RigConfig,
): RigHandle {
  const ambient = new THREE.AmbientLight(initial.lights.ambientColor, initial.lights.ambient);
  const top = new THREE.DirectionalLight();
  const bottom = new THREE.DirectionalLight();
  const key = new THREE.DirectionalLight();
  key.castShadow = true;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 80;
  key.shadow.mapSize.set(initial.shadows.mapSize, initial.shadows.mapSize);
  scene.add(ambient, top, bottom, key);

  let envPreset: EnvPreset = initial.backdrop.envPreset;
  let envMap: THREE.Texture | null = generateProceduralEnvMap(renderer, envPreset);
  scene.environment = envMap;

  const backdropGeo = new THREE.PlaneGeometry(80, 50);
  const backdropHandle = createDitheredStandardMaterial({
    color: initial.backdrop.color,
    roughness: initial.backdrop.roughness,
    metalness: initial.backdrop.metalness,
    envIntensity: initial.backdrop.envIntensity,
    dither: initial.backdrop.dither,
    cacheKey: "3d-ui-jig-backdrop-dither-v1",
  });
  const backdrop = new THREE.Mesh(backdropGeo, backdropHandle.material);
  scene.add(backdrop);

  const applyLight = (
    light: THREE.DirectionalLight,
    c: RigConfig["lights"]["top"],
  ) => {
    light.color.set(c.color);
    light.intensity = c.intensity;
    light.position.set(c.x, c.y, c.z);
  };

  const update = (cfg: RigConfig, frame: RigFrameInput) => {
    ambient.color.set(cfg.lights.ambientColor);
    ambient.intensity = cfg.lights.ambient;
    applyLight(top, cfg.lights.top);
    applyLight(bottom, cfg.lights.bottom);
    applyLight(key, cfg.lights.key);

    // Shadow map size (reallocate only on change)
    const size = Math.max(256, Math.min(4096, Math.round(cfg.shadows.mapSize)));
    if (key.shadow.mapSize.x !== size) {
      key.shadow.mapSize.set(size, size);
      key.shadow.map?.dispose();
      key.shadow.map = null;
    }

    // Dynamic frustum fitted to the visible area
    const mapScale = Math.max(0.25, size / 2048);
    const halfW = frame.shadowHalfWidth ?? frame.viewHalf + 4;
    const halfH = frame.shadowHalfHeight ?? Math.max(8, frame.viewHalf * 0.75);
    const cam = key.shadow.camera;
    cam.left = -halfW;
    cam.right = halfW;
    cam.top = halfH;
    cam.bottom = -halfH;
    cam.updateProjectionMatrix();
    key.shadow.bias = -3e-4 / mapScale;
    key.shadow.normalBias = 0.02 / mapScale;
    key.shadow.radius = cfg.shadows.radius * mapScale;

    // Environment preset (regenerate only on change)
    if (cfg.backdrop.envPreset !== envPreset) {
      envPreset = cfg.backdrop.envPreset;
      const next = generateProceduralEnvMap(renderer, envPreset);
      scene.environment = next;
      envMap?.dispose();
      envMap = next;
    }

    // Backdrop
    backdrop.visible = frame.transparent ? false : cfg.backdrop.show;
    backdrop.position.set(0, 0, cfg.backdrop.z);
    backdrop.receiveShadow = cfg.backdrop.receiveShadows;
    backdropHandle.material.color.set(cfg.backdrop.color);
    backdropHandle.material.roughness = cfg.backdrop.roughness;
    backdropHandle.material.metalness = cfg.backdrop.metalness;
    backdropHandle.material.envMapIntensity = cfg.backdrop.envIntensity;
    backdropHandle.uniforms.uDither.value = cfg.backdrop.dither;
  };

  update(initial, { viewHalf: 8 });

  return {
    ambient,
    top,
    bottom,
    key,
    backdrop,
    update,
    dispose() {
      scene.remove(ambient, top, bottom, key, backdrop);
      backdropGeo.dispose();
      backdropHandle.material.dispose();
      key.shadow.map?.dispose();
      envMap?.dispose();
      envMap = null;
    },
  };
}
