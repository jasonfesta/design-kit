import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { JigValues } from "@/components/jig/schema";
import { createCameraRigState, updateCameraRig, viewHalfWidth } from "@/three/rig/cameraRig";
import { createRig } from "@/three/rig/createRig";
import type { PointerState, SceneModule, SceneRuntime } from "@/three/scenes/types";

/**
 * Full-viewport WebGL stage. Owns the renderer, scene, camera, universal rig
 * and the RAF loop; delegates everything scene-specific to the module runtime.
 *
 * Renderer: antialias, dpr ≤ 2, PCFShadowMap (+ shadow.radius blur), ACESFilmic, sRGB output.
 */

export interface ThreeStageProps<P> {
  module: SceneModule<P>;
  values: JigValues<P>;
  resetSignal?: number;
  onSceneEvent?: (key: string, value: unknown) => void;
  /** Transparent canvas, no backdrop (for overlay capture). */
  transparent?: boolean;
  className?: string;
}

export function ThreeStage<P>({
  module,
  values,
  resetSignal = 0,
  onSceneEvent,
  transparent = false,
  className,
}: ThreeStageProps<P>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const valuesRef = useRef(values);
  const eventRef = useRef(onSceneEvent);
  const runtimeRef = useRef<SceneRuntime<P> | null>(null);
  const prevSceneRef = useRef<P>(values.scene);

  valuesRef.current = values;
  eventRef.current = onSceneEvent;

  // Param diffing → runtime.onParamsChange
  useEffect(() => {
    const prev = prevSceneRef.current;
    if (prev !== values.scene) {
      runtimeRef.current?.onParamsChange?.(values.scene, prev);
      prevSceneRef.current = values.scene;
    }
  }, [values.scene]);

  useEffect(() => {
    if (resetSignal > 0) runtimeRef.current?.onReset?.();
  }, [resetSignal]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: transparent,
      powerPreference: "high-performance",
    });
    if (transparent) renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // r18x: PCFSoft is deprecated; PCF + shadow.radius gives the soft blur
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const initial = valuesRef.current;
    const camera = new THREE.PerspectiveCamera(
      initial.rig.camera.fov,
      (container.clientWidth || 1) / (container.clientHeight || 1),
      0.1,
      150,
    );
    const rig = createRig(renderer, scene, initial.rig);
    const camState = createCameraRigState();
    const raycaster = new THREE.Raycaster();
    const pointer: PointerState = { x: 0, y: 0, inside: false };
    const ndc = new THREE.Vector2();

    const runtime = module.create(
      {
        renderer,
        scene,
        camera,
        rig,
        maxAnisotropy: Math.min(8, renderer.capabilities.getMaxAnisotropy()),
        domElement: renderer.domElement,
        emit: (k, v) => eventRef.current?.(k, v),
      },
      initial.scene,
    );
    runtimeRef.current = runtime;
    prevSceneRef.current = initial.scene;

    const toNdc = (e: PointerEvent | MouseEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      return true;
    };
    const onMove = (e: PointerEvent) => {
      if (toNdc(e)) pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
      runtime.onPointerLeave?.();
      renderer.domElement.style.cursor = "default";
    };
    const onClick = (e: MouseEvent) => {
      if (!toNdc(e)) return;
      raycaster.setFromCamera(ndc.set(pointer.x, pointer.y), camera);
      runtime.onClick?.(raycaster);
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);
    renderer.domElement.addEventListener("click", onClick);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    ro.observe(container);

    let raf = 0;
    let prev = performance.now();
    const start = prev;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(Math.max((now - prev) / 1000, 0.0001), 0.05);
      prev = now;
      const v = valuesRef.current;
      raycaster.setFromCamera(ndc.set(pointer.x, pointer.y), camera);
      const frame = {
        dt,
        time: (now - start) / 1000,
        pointer,
        raycaster,
        rig: v.rig,
        viewHalfAt: (d: number) => viewHalfWidth(camera, d, v.rig.camera.fov),
        transparent,
      };

      const dir = runtime.preFrame?.(v.scene, frame) ?? {};
      if (dir.cursor) renderer.domElement.style.cursor = dir.cursor;
      const camZ = dir.cameraZ ?? v.rig.camera.z;
      updateCameraRig(camera, v.rig.camera, camState, {
        dt,
        pointerX: pointer.x,
        pointerY: pointer.y,
        cameraZ: camZ,
        offsetY: dir.cameraOffsetY,
        tiltScale: dir.tiltScale,
      });
      rig.update(v.rig, {
        viewHalf: viewHalfWidth(camera, camZ, v.rig.camera.fov),
        shadowHalfWidth: dir.shadowHalfWidth,
        shadowHalfHeight: dir.shadowHalfHeight,
        transparent,
      });
      runtime.update(v.scene, frame);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("click", onClick);
      runtime.dispose();
      runtimeRef.current = null;
      rig.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
    // The stage is rebuilt only when the module or transparency changes; live
    // values flow through valuesRef.
  }, [module, transparent]);

  return (
    <div
      ref={containerRef}
      className={className ?? "relative h-full w-full select-none overflow-hidden"}
      aria-label={`${module.title} 3D viewport`}
    />
  );
}
