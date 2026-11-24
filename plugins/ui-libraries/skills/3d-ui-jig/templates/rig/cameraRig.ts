import * as THREE from "three";
import type { CameraConfig } from "./rigTypes";

/**
 * Camera rig: fov, position, look-at origin, smooth cursor-follow tilt and an
 * optional focus override (scene modules lerp `cameraZ` toward a focus Z and
 * fade the tilt out with `tiltScale`).
 */

export interface CameraRigState {
  tiltX: number;
  tiltY: number;
}

export interface CameraRigInput {
  dt: number;
  /** Pointer in NDC (-1..1). */
  pointerX: number;
  pointerY: number;
  /** Override for the camera Z (focus mode). Defaults to cfg.z. */
  cameraZ?: number;
  /** Extra Y offset (scroll-driven overlays). */
  offsetY?: number;
  /** 0 disables cursor tilt, 1 = full tilt. */
  tiltScale?: number;
  lookAt?: { x: number; y: number; z: number };
}

export function createCameraRigState(): CameraRigState {
  return { tiltX: 0, tiltY: 0 };
}

export function updateCameraRig(
  camera: THREE.PerspectiveCamera,
  cfg: CameraConfig,
  state: CameraRigState,
  input: CameraRigInput,
): void {
  if (camera.fov !== cfg.fov) {
    camera.fov = cfg.fov;
    camera.updateProjectionMatrix();
  }
  const z = input.cameraZ ?? cfg.z;
  camera.position.set(cfg.x, cfg.y + (input.offsetY ?? 0), z);
  const t = input.lookAt ?? { x: 0, y: 0, z: 0 };
  camera.lookAt(t.x, t.y, t.z);

  const scale = cfg.followCursor ? (input.tiltScale ?? 1) : 0;
  const maxTilt = THREE.MathUtils.degToRad(cfg.tiltDeg) * scale;
  const alpha = 1 - Math.exp(-8 * input.dt);
  state.tiltX = THREE.MathUtils.lerp(state.tiltX, input.pointerY * maxTilt, alpha);
  state.tiltY = THREE.MathUtils.lerp(state.tiltY, -input.pointerX * maxTilt, alpha);
  camera.rotateX(state.tiltX);
  camera.rotateY(state.tiltY);
}

/** Half the visible width at distance `distance` from the camera. */
export function viewHalfWidth(camera: THREE.PerspectiveCamera, distance: number, fovDeg = camera.fov): number {
  const aspect = Math.max(0.25, camera.aspect);
  return Math.tan(THREE.MathUtils.degToRad(fovDeg) * 0.5) * distance * aspect;
}
