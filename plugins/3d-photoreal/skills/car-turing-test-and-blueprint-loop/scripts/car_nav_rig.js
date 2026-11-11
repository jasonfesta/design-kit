/**
 * car_nav_rig.js — Complete-3D Automotive Turntable, Multi-View, Zebra & Orthographic Audit Rig
 *
 * Preserves 100.000% bit-identical Frame-0 projection for Hero Turing evaluation while providing:
 *   - IG6 Car-Centroid OrbitControls with ground (`y >= 0.14 m`) & stage radius confinement
 *   - Event-driven `rAF` coalescing (zero SwiftShader idle CPU burn, zero synchronous update recursion)
 *   - Keyboard presets: `[1]` Hero Frame-0, `[2..9]` `window.__CAR_CAMERAS__`, `[Z]` Class-A Zebra, `[M]` Mechanisms
 *   - Deterministic `window.__CAR_RIG__` API for headless 360° turntable, Zebra, Secondary SxS, and
 *     4-View Orthographic (`side`, `front`, `rear`, `top`) Blueprint Silhouette verification.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const rigState = {
  renderer: null,
  optics: null,
  composer: null,
  scene: null,
  camera: null,
  installed: false,
  renderingInternal: false,
  sceneOrbitControls: [],
};

if (typeof window !== 'undefined') {
  window.__BUILD_META__ = Object.assign(
    { threeRevision: THREE.REVISION, domain: 'automotive-threejs' },
    window.__BUILD_META__ || {},
  );
}

const origOrbitUpdate = OrbitControls.prototype.update;
OrbitControls.prototype.update = function patchedOrbitUpdate(...args) {
  if (this && !rigState.sceneOrbitControls.includes(this)) {
    rigState.sceneOrbitControls.push(this);
  }
  return origOrbitUpdate.apply(this, args);
};

const origComposerRender = EffectComposer.prototype.render;
EffectComposer.prototype.render = function patchedComposerRender(...args) {
  if (!rigState.renderingInternal && this && Array.isArray(this.passes)) {
    for (let i = 0; i < this.passes.length; i++) {
      const p = this.passes[i];
      if (p && p.scene && p.camera && p.camera.isPerspectiveCamera) {
        rigState.renderer = this.renderer;
        rigState.composer = this;
        rigState.scene = p.scene;
        rigState.camera = p.camera;
        break;
      }
    }
  }
  return origComposerRender.apply(this, args);
};

const origSceneAfterRender = THREE.Scene.prototype.onAfterRender;
THREE.Scene.prototype.onAfterRender = function patchedSceneAfterRender(renderer, scene, camera, ...rest) {
  if (
    !rigState.renderingInternal &&
    !rigState.composer &&
    renderer &&
    renderer.getRenderTarget &&
    renderer.getRenderTarget() === null &&
    scene &&
    scene.isScene &&
    camera &&
    camera.isPerspectiveCamera
  ) {
    rigState.renderer = renderer;
    rigState.scene = scene;
    rigState.camera = camera;
  }
  return origSceneAfterRender.call(this, renderer, scene, camera, ...rest);
};

function computeCarTightWorldBox(carRoot, sceneFallback) {
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  let meshCount = 0;
  const root = carRoot || sceneFallback;
  if (!root) return { box, meshCount };

  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh || !o.visible || !o.geometry) return;
    if (o.name === 'StudioCycloramaCove') return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    if (mats.some((m) => m && m.userData && m.userData.carRole === 'cyclorama_floor')) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const sc = Math.max(Math.abs(o.scale.x), Math.abs(o.scale.y), Math.abs(o.scale.z));
    const rad = o.geometry.boundingSphere ? o.geometry.boundingSphere.radius * sc : 0;
    const isSky = mats.some((m) => m && m.side === THREE.BackSide && rad > 8.0);
    if (isSky || rad > 6.5 || rad < 0.002) return;
    tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    if (Number.isFinite(tmp.min.x) && Number.isFinite(tmp.max.x)) {
      box.union(tmp);
      meshCount++;
    }
  });
  return { box, meshCount };
}

function installCarNavigationRig() {
  if (rigState.installed) return;
  if (typeof window !== 'undefined' && window.__CAR_OPTICS__) {
    const opt = window.__CAR_OPTICS__;
    rigState.renderer = opt.renderer;
    rigState.optics = opt;
    rigState.composer = opt;
    rigState.scene = opt.scene;
    rigState.camera = opt.camera;
  }
  const { renderer, optics, composer, scene, camera } = rigState;
  if (!renderer || !scene || !camera) return;
  rigState.installed = true;

  for (const oc of rigState.sceneOrbitControls) {
    try {
      if (oc && typeof oc.dispose === 'function') oc.dispose();
    } catch {
      // ignore
    }
  }

  const getCarRoot = () =>
    (typeof window !== 'undefined' && window.__CAR_GROUP__) ||
    scene.getObjectByName('CarGroup') ||
    null;

  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'grab';
  canvas.style.outline = 'none';
  canvas.tabIndex = 0;

  camera.updateMatrixWorld(true);
  const HOME = {
    position: camera.position.clone(),
    quaternion: camera.quaternion.clone(),
    up: camera.up.clone(),
    fov: camera.fov,
    aspect: camera.aspect,
    near: camera.near,
    far: camera.far,
    zoom: camera.zoom,
    view: camera.view ? { ...camera.view } : null,
    proj: camera.projectionMatrix.clone(),
    projInv: camera.projectionMatrixInverse.clone(),
    exposure: renderer.toneMappingExposure ?? 1.0,
  };

  function renderFrame(converged = true) {
    rigState.renderingInternal = true;
    try {
      if (optics) {
        if (converged && optics.renderConverged) optics.renderConverged();
        else if (!converged && optics.renderInteractive) optics.renderInteractive();
        else optics.render();
      } else if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    } finally {
      rigState.renderingInternal = false;
    }
  }

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.screenSpacePanning = true;
  controls.minDistance = 1.65;
  controls.maxDistance = 15.5;
  controls.maxPolarAngle = Math.PI * 0.492;

  // Restore exact Frame-0 camera immediately after OrbitControls constructor
  function restoreHeroCamera(doRender = true) {
    if (optics && optics.setZebraMode) optics.setZebraMode(false);
    renderer.toneMappingExposure = HOME.exposure;
    camera.position.copy(HOME.position);
    camera.up.copy(HOME.up);
    camera.quaternion.copy(HOME.quaternion);
    camera.fov = HOME.fov;
    camera.aspect = HOME.aspect;
    camera.near = HOME.near;
    camera.far = HOME.far;
    camera.zoom = HOME.zoom;
    if (HOME.view && HOME.view.enabled) {
      camera.setViewOffset(
        HOME.view.fullWidth,
        HOME.view.fullHeight,
        HOME.view.offsetX,
        HOME.view.offsetY,
        HOME.view.width,
        HOME.view.height,
      );
    } else {
      camera.clearViewOffset();
    }
    camera.projectionMatrix.copy(HOME.proj);
    camera.projectionMatrixInverse.copy(HOME.projInv);
    camera.updateMatrixWorld(true);
    if (doRender) renderFrame(true);
  }

  restoreHeroCamera(false);

  // IG6: Re-center OrbitControls target onto 3D vehicle centroid on first user drag/wheel
  let userOrbitInitialized = false;
  let settleTimer = null;
  let rafPending = false;

  function ensureCentroidPivot() {
    if (userOrbitInitialized) return;
    userOrbitInitialized = true;
    camera.clearViewOffset();
    camera.up.set(0, 1, 0);
    camera.updateProjectionMatrix();
    const { box } = computeCarTightWorldBox(getCarRoot(), scene);
    const center = box.isEmpty() ? new THREE.Vector3(0, 0.62, 0) : box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
  }

  canvas.addEventListener('pointerdown', () => {
    ensureCentroidPivot();
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointerup', () => {
    canvas.style.cursor = 'grab';
  });
  canvas.addEventListener('wheel', () => {
    ensureCentroidPivot();
  }, { passive: true });

  controls.addEventListener('change', () => {
    if (!userOrbitInitialized) return;
    // Clamp camera above studio floor (y >= 0.14 m) & inside cyclorama radius
    if (camera.position.y < 0.14) camera.position.y = 0.14;
    const rHoriz = Math.hypot(camera.position.x, camera.position.z);
    if (rHoriz > 15.8) {
      const s = 15.8 / rHoriz;
      camera.position.x *= s;
      camera.position.z *= s;
    }
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        renderFrame(false);
      });
    }
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(() => renderFrame(true), 130);
  });

  function renderSecondaryCamera(idx) {
    const cams = (typeof window !== 'undefined' && window.__CAR_CAMERAS__) || [];
    const spec = cams[idx];
    if (!spec) return false;
    if (optics && optics.setZebraMode) optics.setZebraMode(false);

    const W = renderer.domElement.width || 1200;
    const H = renderer.domElement.height || 800;
    const rollRad = ((spec.rollDeg || 0) * Math.PI) / 180.0;
    camera.clearViewOffset();
    camera.fov = spec.fov || 20;
    camera.aspect = W / H;
    camera.up.set(Math.sin(rollRad), Math.cos(rollRad), 0);
    camera.position.set(spec.position[0], spec.position[1], spec.position[2]);
    camera.lookAt(spec.target[0], spec.target[1], spec.target[2]);
    if (Array.isArray(spec.principalPoint)) {
      const [uP, vP] = spec.principalPoint;
      camera.setViewOffset(W, H, (0.5 - uP) * W, (0.5 - vP) * H, W, H);
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const biasEv = spec.exposureBias || 0.0;
    renderer.toneMappingExposure = HOME.exposure * Math.pow(2.0, biasEv);
    renderFrame(true);
    return true;
  }

  function renderTurntableAzimuth(azimDeg = 35, elevDeg = 14, distScale = 1.0, zebra = false) {
    const carRoot = getCarRoot();
    const { box } = computeCarTightWorldBox(carRoot, scene);
    const center = box.isEmpty() ? new THREE.Vector3(0, 0.62, 0) : box.getCenter(new THREE.Vector3());
    const size = box.isEmpty() ? new THREE.Vector3(1.88, 1.32, 4.52) : box.getSize(new THREE.Vector3());
    const maxSpan = Math.max(size.x, size.y, size.z, 3.2);

    const W = renderer.domElement.width || 1200;
    const H = renderer.domElement.height || 800;
    const aspect = W / Math.max(1, H);
    const fovDeg = 20.0; // Studio 100mm telephoto turntable lens (stays well inside 18m cyclorama)
    const vFovRad = (fovDeg * Math.PI) / 180.0;
    const hTan = Math.tan(vFovRad * 0.5) * aspect;
    const fitDist = Math.max(
      (maxSpan * 0.60) / Math.max(0.14, hTan),
      (size.y * 0.85) / Math.max(0.10, Math.tan(vFovRad * 0.5)),
    );
    const dist = Math.min(15.2, fitDist * distScale);

    const az = (azimDeg * Math.PI) / 180.0;
    const el = (elevDeg * Math.PI) / 180.0;
    const cx = center.x + dist * Math.cos(el) * Math.sin(az);
    const cy = Math.max(0.18, center.y + dist * Math.sin(el));
    const cz = center.z + dist * Math.cos(el) * Math.cos(az);

    if (optics && optics.setZebraMode) optics.setZebraMode(zebra, carRoot);
    renderer.toneMappingExposure = HOME.exposure;

    camera.clearViewOffset();
    camera.fov = fovDeg;
    camera.aspect = W / H;
    camera.up.set(0, 1, 0);
    camera.position.set(cx, cy, cz);
    camera.lookAt(center.x, center.y * 0.94, center.z);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    renderFrame(true);
    if (zebra && optics && optics.setZebraMode) optics.setZebraMode(false, carRoot);
  }

  const orthoClayMat = new THREE.ShaderMaterial({
    toneMapped: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec3 vWorldNormal;
      void main() {
        vec4 wp = vec4(position, 1.0);
        vec3 wn = normal;
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
          wn = mat3(instanceMatrix) * wn;
        #endif
        wp = modelMatrix * wp;
        vWorldNormal = normalize(mat3(modelMatrix) * wn);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorldNormal;
      void main() {
        vec3 N = normalize(vWorldNormal);
        float hemi = 0.5 + 0.5 * N.y;
        float key = max(0.0, dot(N, normalize(vec3(0.45, 0.78, 0.43))));
        float shade = 0.16 + 0.18 * hemi + 0.16 * key;
        gl_FragColor = vec4(vec3(shade * 0.94, shade * 0.97, shade * 1.04), 1.0);
      }
    `,
  });

  function setViewportSize(w, h) {
    const nw = Math.max(2, Math.floor(w));
    const nh = Math.max(2, Math.floor(h));
    renderer.setPixelRatio(1);
    renderer.setSize(nw, nh, false);
    if (optics && typeof optics.setSize === 'function') {
      optics.setSize(nw, nh);
    }
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
  }

  /**
   * Renders an exact metric Orthographic view (`side`, `front`, `rear`, `top`) of ONLY `carRoot`
   * using an opaque engineering clay shader over `#f8fafc` so white paint and clear glass windshields
   * never drop out of blueprint silhouette IoU masks.
   */
  function renderOrthographicView(viewName = 'side') {
    const carRoot = getCarRoot();
    const { box } = computeCarTightWorldBox(carRoot, scene);
    if (box.isEmpty()) return null;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const W = renderer.domElement.width || 1200;
    const H = renderer.domElement.height || 800;
    const aspect = W / H;

    // Hide non-car environment meshes temporarily
    const hiddenList = [];
    if (carRoot) {
      scene.children.forEach((ch) => {
        if (ch !== carRoot && !ch.isLight && ch.visible) {
          hiddenList.push(ch);
          ch.visible = false;
        }
      });
    }

    const savedMats = new Map();
    const rootTarget = carRoot || scene;
    rootTarget.traverse((o) => {
      if (!o.isMesh || !o.visible || !o.material) return;
      if (o.name === 'StudioCycloramaCove') return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      if (mats.some((m) => m && m.userData && m.userData.carRole === 'cyclorama_floor')) return;
      savedMats.set(o, o.material);
      o.material = orthoClayMat;
    });

    let spanW;
    let spanH;
    const pos = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    if (viewName === 'side') {
      // Left profile (+X looking toward origin: nose +Z points right!)
      spanW = size.z;
      spanH = size.y;
      pos.set(center.x + 15.0, center.y, center.z);
    } else if (viewName === 'front') {
      spanW = size.x;
      spanH = size.y;
      pos.set(center.x, center.y, center.z + 15.0);
    } else if (viewName === 'rear') {
      spanW = size.x;
      spanH = size.y;
      pos.set(center.x, center.y, center.z - 15.0);
    } else {
      // 'top': +Y looking down, nose +Z pointing right (+X screen) so aspect matches horizontal side view!
      spanW = size.z;
      spanH = size.x;
      pos.set(center.x, center.y + 15.0, center.z);
      up.set(1, 0, 0);
    }

    const pad = 1.14;
    const frustumH = Math.max(spanH * pad, (spanW * pad) / aspect);
    const frustumW = frustumH * aspect;

    const ortho = new THREE.OrthographicCamera(
      -frustumW * 0.5,
      frustumW * 0.5,
      frustumH * 0.5,
      -frustumH * 0.5,
      0.1,
      40.0,
    );
    ortho.up.copy(up);
    ortho.position.copy(pos);
    ortho.lookAt(center);
    ortho.updateProjectionMatrix();
    ortho.updateMatrixWorld(true);

    const savedBg = scene.background;
    const savedClear = new THREE.Color();
    renderer.getClearColor(savedClear);
    const savedAlpha = renderer.getClearAlpha ? renderer.getClearAlpha() : 1.0;

    rigState.renderingInternal = true;
    try {
      scene.background = new THREE.Color(0xf8fafc);
      renderer.setRenderTarget(null);
      renderer.setClearColor(0xf8fafc, 1.0);
      renderer.clear(true, true, false);
      renderer.render(scene, ortho);
    } finally {
      scene.background = savedBg;
      renderer.setClearColor(savedClear, savedAlpha);
      for (const [o, orig] of savedMats.entries()) o.material = orig;
      for (const ch of hiddenList) ch.visible = true;
      rigState.renderingInternal = false;
    }

    return {
      view: viewName,
      spanMeters: [+(spanW).toFixed(4), +(spanH).toFixed(4)],
      frustumMeters: [+(frustumW).toFixed(4), +(frustumH).toFixed(4)],
    };
  }

  function getVehicleMetrics() {
    const carRoot = getCarRoot();
    const { box, meshCount } = computeCarTightWorldBox(carRoot, scene);
    if (box.isEmpty()) {
      return { valid: false, meshCount: 0 };
    }
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const lengthZ = Math.max(size.z, size.x);
    const widthX = Math.min(size.z, size.x);
    const heightY = size.y;

    // Material & Cabin Anatomy Audit
    const rootTarget = carRoot || scene;
    rootTarget.updateMatrixWorld(true);
    const carMeshes = [];
    let glassMeshCount = 0;
    let chalkyGlassCount = 0;
    let cabinMeshCount = 0;

    rootTarget.traverse((o) => {
      if (!o.isMesh || !o.visible || !o.geometry) return;
      if (o.name === 'StudioCycloramaCove') return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      if (mats.some((m) => m && m.userData && m.userData.carRole === 'cyclorama_floor')) return;
      carMeshes.push(o);
      for (const m of mats) {
        if (!m) continue;
        const role = m.userData && m.userData.carRole;
        if (role === 'glass') {
          glassMeshCount++;
          if (m.color && (m.color.r + m.color.g + m.color.b) > 0.12 && !m.transmission) {
            chalkyGlassCount++;
          }
        }
        if (role === 'matte_interior' || (o.parent && /CabinInterior/i.test(o.parent.name))) {
          cabinMeshCount++;
        }
      }
    });

    // 3D Raycast Closure & Side DLO Transparency Audit
    const raycaster = new THREE.Raycaster();
    let frontClosureHits = 0;
    let rearClosureHits = 0;
    const closureCols = [-0.36, -0.18, 0.0, 0.18, 0.36];
    const closureRows = [0.24, 0.36, 0.48];
    const totalClosureRays = closureCols.length * closureRows.length;

    for (const xf of closureCols) {
      for (const yf of closureRows) {
        const rx = center.x + xf * widthX;
        const ry = box.min.y + yf * heightY;
        // Front (+Z -> -Z)
        raycaster.set(new THREE.Vector3(rx, ry, box.max.z + 1.0), new THREE.Vector3(0, 0, -1));
        const fHits = raycaster.intersectObjects(carMeshes, false);
        if (fHits.length > 0 && (box.max.z - fHits[0].point.z) < lengthZ * 0.28) {
          frontClosureHits++;
        }
        // Rear (-Z -> +Z)
        raycaster.set(new THREE.Vector3(rx, ry, box.min.z - 1.0), new THREE.Vector3(0, 0, 1));
        const rHits = raycaster.intersectObjects(carMeshes, false);
        if (rHits.length > 0 && (rHits[0].point.z - box.min.z) < lengthZ * 0.28) {
          rearClosureHits++;
        }
      }
    }

    let sideDloGlassHits = 0;
    for (const side of [1, -1]) {
      for (const zf of [-0.08, 0.0, 0.08]) {
        const yDlo = box.min.y + heightY * 0.77;
        const zDlo = center.z + zf * lengthZ;
        raycaster.set(
          new THREE.Vector3(center.x + side * (widthX + 1.0), yDlo, zDlo),
          new THREE.Vector3(-side, 0, 0),
        );
        const sHits = raycaster.intersectObjects(carMeshes, false);
        // Check first outer-envelope hit (within 6 cm of first hit to allow thin perimeter trim tube)
        if (sHits.length > 0) {
          const d0 = sHits[0].distance;
          const hitGlass = sHits.some((h) => {
            if (h.distance - d0 > 0.065) return false;
            const mats = Array.isArray(h.object.material) ? h.object.material : [h.object.material];
            return mats.some((m) => m && m.userData && m.userData.carRole === 'glass');
          });
          if (hitGlass) sideDloGlassHits++;
        }
      }
    }

    return {
      valid: true,
      hasExplicitCarGroup: Boolean(carRoot),
      meshCount,
      glassMeshCount,
      chalkyGlassCount,
      cabinMeshCount,
      frontClosureRatio: +(frontClosureHits / totalClosureRays).toFixed(3),
      rearClosureRatio: +(rearClosureHits / totalClosureRays).toFixed(3),
      sideDloGlassHits,
      drawCalls: renderer.info && renderer.info.render ? renderer.info.render.calls : 0,
      boundsMin: [+box.min.x.toFixed(4), +box.min.y.toFixed(4), +box.min.z.toFixed(4)],
      boundsMax: [+box.max.x.toFixed(4), +box.max.y.toFixed(4), +box.max.z.toFixed(4)],
      lengthMeters: +lengthZ.toFixed(4),
      widthMeters: +widthX.toFixed(4),
      heightMeters: +heightY.toFixed(4),
      groundContactMinY: +box.min.y.toFixed(4),
      widthToLength: +(widthX / Math.max(1e-4, lengthZ)).toFixed(4),
      heightToLength: +(heightY / Math.max(1e-4, lengthZ)).toFixed(4),
      widthToHeight: +(widthX / Math.max(1e-4, heightY)).toFixed(4),
    };
  }

  let mechToggle = 0;
  window.addEventListener('keydown', (ev) => {
    if (ev.key === '1') {
      userOrbitInitialized = false;
      restoreHeroCamera(true);
    } else if (ev.key >= '2' && ev.key <= '9') {
      userOrbitInitialized = false;
      renderSecondaryCamera(parseInt(ev.key, 10) - 2);
    } else if (ev.key === 'z' || ev.key === 'Z') {
      if (optics && optics.setZebraMode) {
        optics.setZebraMode(!optics.isZebraMode(), getCarRoot());
        renderFrame(true);
      }
    } else if (ev.key === 'm' || ev.key === 'M') {
      mechToggle = 1 - mechToggle;
      const mech = typeof window !== 'undefined' && window.__CAR_MECHANISMS__;
      if (mech && typeof mech.setAll === 'function') {
        mech.setAll(mechToggle);
        renderFrame(true);
      }
    }
  });

  if (typeof window !== 'undefined') {
    window.__CAR_RIG__ = {
      restoreHeroCamera,
      renderSecondaryCamera,
      renderTurntableAzimuth,
      renderOrthographicView,
      getVehicleMetrics,
      setViewportSize,
      setZebraMode: (flag) => {
        if (optics && optics.setZebraMode) {
          optics.setZebraMode(flag, getCarRoot());
          renderFrame(true);
        }
      },
    };
  }
}

if (typeof window !== 'undefined') {
  const poll = setInterval(() => {
    if (window.__RENDER_READY__ === true || window.__CAR_OPTICS__ || rigState.renderer) {
      installCarNavigationRig();
      if (rigState.installed) clearInterval(poll);
    }
  }, 60);
}
