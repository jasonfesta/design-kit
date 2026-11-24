import * as THREE from "three";
import type { SceneContext, SceneFrame, SceneRuntime } from "@/three/scenes/types";
import { createCardTextures, disposeCardTextures, type CardTexturePair } from "./cardTexture";
import { buildCuboidGeometry, type CuboidGeometryResult } from "./cuboidGeometry";
import { createCuboidMaterial, type CuboidMaterialHandle } from "./cuboidShader";
import type { CardItem, CuboidChainParams } from "./params";
import { computeCuboidPose, isTiledShape } from "./shapeLayouts";

/**
 * Cuboid Chain runtime: infinite tiled row (or helix / ring / wave / arch) of
 * beveled card cuboids. Hover raycast → face camera + accent hover state.
 * Click → focus mode (selected card flies to featuredZ, others fly out).
 */

interface Slot {
  key: string;
  tileIndex: number;
  itemIndex: number;
  mesh: THREE.Mesh;
  mat: CuboidMaterialHandle;
  hover: number;
  opacity: number;
  angle: number;
}

const cardSig = (c: CardItem) =>
  `${c.category}::${c.title}::${c.description ?? ""}::${c.pills.join("|")}::${c.accentColor}`;

const geomKey = (p: CuboidChainParams) => {
  const c = p.cuboid;
  return `${c.width}|${c.height}|${c.depth}|${c.cornerRadius}|${c.bevelSize}|${c.bevelThickness}|${c.smoothness}`;
};

const layoutKey = (p: CuboidChainParams) => `${p.layout.count}|${p.layout.gap}|${p.shape.type}`;

export function createCuboidChainRuntime(
  ctx: SceneContext,
  initial: CuboidChainParams,
): SceneRuntime<CuboidChainParams> {
  const { scene, camera, maxAnisotropy } = ctx;
  let params = initial;

  const group = new THREE.Group();
  scene.add(group);

  const hitGeo = new THREE.PlaneGeometry(1, 1);
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const hitPlane = new THREE.Mesh(hitGeo, hitMat);
  scene.add(hitPlane);

  let geom: CuboidGeometryResult = buildCuboidGeometry(params.cuboid);
  const texCache = new Map<string, { sig: string; pair: CardTexturePair }>();
  const texFor = (card: CardItem) => {
    const sig = cardSig(card);
    const hit = texCache.get(card.id);
    if (hit && hit.sig === sig) return hit.pair;
    if (hit) disposeCardTextures(hit.pair);
    const pair = createCardTextures(card, maxAnisotropy);
    texCache.set(card.id, { sig, pair });
    return pair;
  };

  let slots: Slot[] = [];
  let tileHalfSpan = 3;
  let focusedKey: string | null = null;
  let hoveredKey: string | null = null;
  let chainHovered = false;
  let focusProgress = 0;
  let scrollOffset = 0;
  let phase = 0;
  let viewHalf = 8;
  let lastFocused: number | null = null;

  const emitFocus = () => {
    const idx = focusedKey ? (slots.find((s) => s.key === focusedKey)?.itemIndex ?? null) : null;
    if (idx !== lastFocused) {
      lastFocused = idx;
      ctx.emit("focusedIndex", idx);
    }
  };

  const clearSlots = () => {
    for (const s of slots) {
      group.remove(s.mesh);
      s.mat.material.dispose();
    }
    slots = [];
  };

  const rebuild = () => {
    clearSlots();
    const cards = params.cards;
    if (cards.length === 0) return;
    const count = Math.max(1, Math.round(params.layout.count));
    const groupWidth = count * (params.cuboid.width + params.layout.gap);
    const vh = Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) * camera.position.z * Math.max(0.25, camera.aspect);
    tileHalfSpan = isTiledShape(params.shape.type)
      ? Math.max(3, Math.ceil(Math.max(vh, viewHalf) / Math.max(groupWidth, 0.01)) + 2)
      : 0;

    for (let n = -tileHalfSpan; n <= tileHalfSpan; n++) {
      for (let o = 0; o < count; o++) {
        const card = cards[o % cards.length];
        const pair = texFor(card);
        const mat = createCuboidMaterial({
          contentTexture: pair.contentTexture,
          hoverTexture: pair.hoverTexture,
          baseColor: params.cuboid.color,
          accentColor: card.accentColor,
          roughness: params.cuboid.roughness,
          metalness: params.cuboid.metalness,
          halfDepth: geom.halfDepth,
          capBand: geom.capBand,
          subtitleOpacity: params.hover.subtitleOpacity,
          pillBgOpacity: params.hover.pillBgOpacity,
          dither: params.cuboid.dither,
        });
        const mesh = new THREE.Mesh(geom.geometry, mat.material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const key = `${n}:${o}`;
        mesh.userData.slotKey = key;
        group.add(mesh);
        slots.push({ key, tileIndex: n, itemIndex: o, mesh, mat, hover: 0, opacity: 1, angle: 0 });
      }
    }
    if (focusedKey && !slots.some((s) => s.key === focusedKey)) focusedKey = null;
    emitFocus();
  };

  const syncTextures = () => {
    const cards = params.cards;
    if (cards.length === 0) return;
    const live = new Set(cards.map((c) => c.id));
    for (const [id, entry] of texCache) {
      if (!live.has(id)) {
        disposeCardTextures(entry.pair);
        texCache.delete(id);
      }
    }
    for (const s of slots) {
      const card = cards[s.itemIndex % cards.length];
      const pair = texFor(card);
      if (s.mat.material.map !== pair.contentTexture) {
        s.mat.material.map = pair.contentTexture;
        s.mat.material.needsUpdate = true;
      }
      s.mat.uniforms.uHoverMap.value = pair.hoverTexture;
    }
  };

  const syncGeometry = () => {
    const old = geom.geometry;
    geom = buildCuboidGeometry(params.cuboid);
    for (const s of slots) {
      s.mesh.geometry = geom.geometry;
      s.mat.uniforms.uHalfDepth.value = geom.halfDepth;
      s.mat.uniforms.uCapBand.value = geom.capBand;
    }
    old.dispose();
  };

  // Redraw card canvases once web fonts are ready (first paint may use fallbacks).
  let disposed = false;
  if (typeof document !== "undefined" && document.fonts) {
    document.fonts.ready.then(() => {
      if (disposed) return;
      for (const entry of texCache.values()) disposeCardTextures(entry.pair);
      texCache.clear();
      syncTextures();
    });
  }

  rebuild();

  const pick = (raycaster: THREE.Raycaster): Slot | null => {
    const hits = raycaster.intersectObjects(slots.map((s) => s.mesh), false);
    if (hits.length === 0) return null;
    const key = hits[0].object.userData.slotKey as string;
    return slots.find((s) => s.key === key) ?? null;
  };

  const preFrame = (p: CuboidChainParams, frame: SceneFrame) => {
    const focused = focusedKey !== null;
    focusProgress = THREE.MathUtils.lerp(focusProgress, focused ? 1 : 0, 1 - Math.exp(-p.focus.speed * frame.dt));

    let cursor: "default" | "pointer" = "default";
    if (frame.pointer.inside && !focused && slots.length > 0) {
      const hit = pick(frame.raycaster);
      hoveredKey = hit?.key ?? null;
      chainHovered = hit ? true : frame.raycaster.intersectObject(hitPlane, false).length > 0;
      cursor = hit ? "pointer" : "default";
    } else if (focused) {
      hoveredKey = null;
      chainHovered = false;
      cursor = "pointer";
    }

    const camZ = THREE.MathUtils.lerp(frame.rig.camera.z, p.focus.cameraZ, focusProgress);
    viewHalf = frame.viewHalfAt(camZ);
    return {
      cameraZ: camZ,
      tiltScale: focused ? 0 : 1 - focusProgress,
      shadowHalfWidth: viewHalf + 4,
      shadowHalfHeight: Math.max(p.cuboid.height * 2.5, 8),
      cursor,
    };
  };

  const tmp = new THREE.Vector3();

  const update = (p: CuboidChainParams, frame: SceneFrame) => {
    const { dt, rig, pointer } = frame;
    const cards = p.cards;
    const focused = focusedKey !== null;
    const camZ = camera.position.z;

    const count = Math.max(1, Math.round(p.layout.count));
    const strideX = p.cuboid.width + p.layout.gap;
    const groupWidth = Math.max(0.01, count * strideX);
    const centerOffset = ((count - 1) * strideX) / 2;

    if (!chainHovered && focusProgress < 0.05) scrollOffset += p.layout.scrollSpeed * dt;
    if (!p.rotation.paused) phase += p.rotation.speed * dt;

    const tiled = isTiledShape(p.shape.type);
    const groupOffsetX = tiled ? -(((scrollOffset % groupWidth) + groupWidth) % groupWidth) : 0;
    group.position.x = groupOffsetX;

    hitPlane.scale.set(
      tiled ? (2 * tileHalfSpan + 1) * groupWidth + 2 * p.cuboid.width : viewHalf * 2.5,
      p.shape.type === "chain" ? 1.15 * p.cuboid.height : 1.15 * p.cuboid.height + p.shape.amplitude * 2.2,
      1,
    );
    hitPlane.position.set(0, 0, -2 * p.cuboid.depth);

    const poseOf = (s: Slot) =>
      computeCuboidPose({
        shapeType: p.shape.type,
        radius: p.shape.radius,
        amplitude: p.shape.amplitude,
        tileIndex: s.tileIndex,
        itemIndex: s.itemIndex,
        count,
        strideX,
        groupWidth,
        centerOffset,
        scrollOffset,
        groupOffsetX,
      });

    const sel = focusedKey ? slots.find((s) => s.key === focusedKey) : undefined;
    const selectedBaseX = sel ? poseOf(sel).x : 0;

    const tFeatured = (camZ - p.focus.featuredZ) / Math.max(0.1, camZ);
    const featuredX = rig.camera.x * (1 - tFeatured);
    const featuredY = rig.camera.y * (1 - tFeatured);
    const focusScale = Math.max(0.5, rig.camera.z / Math.max(0.5, camZ - p.focus.featuredZ));

    const anyHovered = hoveredKey !== null && !focused;
    const hoverAlpha = 1 - Math.exp(-12 * dt);
    const faceAlpha = 1 - Math.exp(-p.rotation.faceSpeed * dt);
    const twoPi = Math.PI * 2;

    for (const s of slots) {
      const isHovered = hoveredKey === s.key;
      const isFocused = focusedKey === s.key;
      const card = cards[s.itemIndex % Math.max(1, cards.length)];

      const u = s.mat.uniforms;
      u.uBaseColor.value.set(p.cuboid.color);
      if (card) u.uAccentColor.value.set(card.accentColor);
      s.mat.material.roughness = p.cuboid.roughness;
      s.mat.material.metalness = p.cuboid.metalness;
      u.uSubtitleOpacity.value = p.hover.subtitleOpacity;
      u.uPillBgOpacity.value = p.hover.pillBgOpacity;
      u.uDither.value = p.cuboid.dither;

      s.hover = THREE.MathUtils.lerp(s.hover, isHovered ? 1 : 0, hoverAlpha);
      u.uHover.value = s.hover;

      let targetOpacity = 1;
      if (focused) targetOpacity = isFocused ? 1 : Math.max(0, 1 - focusProgress);
      else if (anyHovered && !isHovered) targetOpacity = p.hover.otherOpacity;
      s.opacity = THREE.MathUtils.lerp(s.opacity, targetOpacity, hoverAlpha);
      s.mat.material.opacity = s.opacity;
      s.mesh.visible = s.opacity > 0.01;

      const pose = poseOf(s);
      if (isFocused && focusProgress > 0.001) {
        s.mesh.position.set(
          THREE.MathUtils.lerp(pose.x, featuredX - groupOffsetX, focusProgress),
          THREE.MathUtils.lerp(pose.y, featuredY, focusProgress),
          THREE.MathUtils.lerp(pose.z, p.focus.featuredZ, focusProgress),
        );
        s.mesh.scale.setScalar(THREE.MathUtils.lerp(1, focusScale, focusProgress));
      } else {
        const dir = pose.x >= selectedBaseX ? 1 : -1;
        s.mesh.position.set(pose.x + dir * (viewHalf + p.focus.flyOutExtra) * focusProgress, pose.y, pose.z);
        s.mesh.scale.setScalar(1);
      }

      let target = phase + s.itemIndex * p.rotation.stagger;
      if (isHovered && p.rotation.axis === "x") {
        s.mesh.getWorldPosition(tmp);
        const face = Math.atan2(-(camera.position.y - tmp.y), camera.position.z - tmp.z);
        const delta = ((((face - s.angle) % twoPi) + Math.PI * 3) % twoPi) - Math.PI;
        target = s.angle + delta;
      }
      s.angle = THREE.MathUtils.lerp(s.angle, target, isHovered ? faceAlpha : 1);

      let rx = p.rotation.axis === "x" ? s.angle : 0;
      let ry = pose.rotY + (p.rotation.axis === "y" ? s.angle : 0);
      let rz = pose.rotZ + (p.rotation.axis === "z" ? s.angle : 0);
      if (isFocused && focusProgress > 0.001) {
        const tilt = THREE.MathUtils.degToRad(p.focus.cuboidTiltDeg);
        rx = THREE.MathUtils.lerp(rx, -pointer.y * tilt * 0.65, focusProgress);
        ry = THREE.MathUtils.lerp(ry, pointer.x * tilt, focusProgress);
        rz = THREE.MathUtils.lerp(rz, 0, focusProgress);
      }
      s.mesh.rotation.set(rx, ry, rz);
    }
  };

  return {
    preFrame,
    update,
    onParamsChange(next, prev) {
      params = next;
      if (geomKey(next) !== geomKey(prev)) {
        syncGeometry();
        rebuild();
      } else if (layoutKey(next) !== layoutKey(prev)) {
        rebuild();
      }
      if (next.cards !== prev.cards) syncTextures();
    },
    onClick(raycaster) {
      const hit = pick(raycaster);
      focusedKey = hit ? (focusedKey === hit.key ? null : hit.key) : null;
      emitFocus();
    },
    onPointerLeave() {
      hoveredKey = null;
      chainHovered = false;
    },
    onReset() {
      focusedKey = null;
      scrollOffset = 0;
      phase = 0;
      emitFocus();
    },
    dispose() {
      disposed = true;
      clearSlots();
      scene.remove(group, hitPlane);
      geom.geometry.dispose();
      hitGeo.dispose();
      hitMat.dispose();
      for (const entry of texCache.values()) disposeCardTextures(entry.pair);
      texCache.clear();
    },
  };
}
