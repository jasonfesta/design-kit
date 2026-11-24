import * as THREE from "three";
import { createDitheredStandardMaterial } from "@/three/rig/shaderHooks";
import type { SceneModule } from "@/three/scenes/types";

/**
 * Blank scene module: the universal rig + jig with one placeholder mesh and
 * an empty schema. Copy this folder to start a new 3D UI scene (see
 * references/new-scene-module.md in the 3d-ui-jig skill).
 *
 * 1. Add fields to BlankParams + BLANK_DEFAULTS.
 * 2. Add controls to `schema` with paths rooted at `scene.`.
 * 3. Read them in `update()`.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BlankParams {}

export const BLANK_DEFAULTS: BlankParams = {};

export const blankScene: SceneModule<BlankParams> = {
  id: "blank",
  title: "Blank Scene",
  summary: "the universal 3D UI rig with a placeholder slab, ready for a new scene module.",
  defaults: BLANK_DEFAULTS,
  // Light by default: warm paper backdrop from DEFAULT_RIG.
  rigDefaults: {},
  schema: [
    // Example:
    // {
    //   id: "slab",
    //   title: "Slab",
    //   defaultOpen: true,
    //   controls: [
    //     { type: "slider", label: "Width", path: "scene.slab.width", min: 0.5, max: 6, step: 0.01 },
    //     { type: "color", label: "Color", path: "scene.slab.color" },
    //   ],
    // },
  ],
  dock: [{ kind: "preset" }, { kind: "reset-view" }],
  prompt: {
    elements: () =>
      "- Placeholder: a 2.4 × 1.6 × 0.24 slab (BoxGeometry) with a dithered MeshStandardMaterial in pine green #1f6f50, idling on a slow Y sway and lifting toward the camera on hover.",
  },
  create(ctx) {
    const geometry = new THREE.BoxGeometry(2.4, 1.6, 0.24, 1, 1, 1);
    const handle = createDitheredStandardMaterial({
      color: "#1f6f50",
      roughness: 0.45,
      metalness: 0.1,
      envIntensity: 0.6,
      dither: 0.02,
      cacheKey: "blank-placeholder-v1",
    });
    const mesh = new THREE.Mesh(geometry, handle.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    ctx.scene.add(mesh);

    let hover = 0;
    let hovered = false;

    return {
      preFrame(_params, frame) {
        hovered = frame.pointer.inside && frame.raycaster.intersectObject(mesh, false).length > 0;
        return { cursor: hovered ? "pointer" : "default" };
      },
      update(_params, frame) {
        hover = THREE.MathUtils.lerp(hover, hovered ? 1 : 0, 1 - Math.exp(-10 * frame.dt));
        mesh.rotation.y = Math.sin(frame.time * 0.6) * 0.35;
        mesh.rotation.x = -0.08 + hover * 0.08;
        mesh.position.z = hover * 0.6;
      },
      onPointerLeave() {
        hovered = false;
      },
      dispose() {
        ctx.scene.remove(mesh);
        geometry.dispose();
        handle.material.dispose();
      },
    };
  },
};

export default blankScene;
