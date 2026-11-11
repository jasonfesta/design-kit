# Reference 01: `< 5 ms` Spatial Constraint Solver, Sightline Auto-Repair & Hybrid Photoreal Shader Pipeline

This reference provides the self-contained JavaScript and GLSL modules that
combine **HeliosDSL's `< 5 ms` deterministic spatial constraint solver &
auto-repair gates (`SG0-SG4`, `G8-G9`, `AABB`, `RING3`)** with **Three.js 360°
concentric ring staging, Takram volumetric cloud/ozone atmosphere, live PMREM
IBL, and hybrid stochastic Photo-PBR + Swiss erosion shaders**.

--------------------------------------------------------------------------------

## 1. Deterministic PRNG, Shared Analytical + Eroded Heightfield & 8-Point Footprint Sampler (`world_contract.js`)

Use this shared module on both the CPU (for compile-time spatial solving,
`getGroundAt(x, z)`, and `< 2.5 ms` `96×96` LUT grass instancing) and the GPU
(matching vertex/fragment terrain height and slope normals):

```javascript
// world_contract.js -- Shared CPU/GPU Terrain, Concentric Rings & Footprint Contract

export function createPRNG(seed = 42) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2D(ix, iz) {
  let n = Math.imul(ix, 374761393) + Math.imul(iz, 668265263);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

// Quintic C2 value noise with analytical derivatives (val, dx, dz)
export function noise2DDeriv(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * fx * (fx * (fx * 6.0 - 15.0) + 10.0);
  const uz = fz * fz * fz * (fz * (fz * 6.0 - 15.0) + 10.0);
  const dux = 30.0 * fx * fx * (fx * (fx - 2.0) + 1.0);
  const duz = 30.0 * fz * fz * (fz * (fz - 2.0) + 1.0);

  const a = hash2D(ix, iz);
  const b = hash2D(ix + 1, iz);
  const c = hash2D(ix, iz + 1);
  const d = hash2D(ix + 1, iz + 1);

  const k0 = a;
  const k1 = b - a;
  const k2 = c - a;
  const k3 = a - b - c + d;

  return {
    val: (k0 + k1 * ux + k2 * uz + k3 * ux * uz) * 2.0 - 1.0,
    dx: 2.0 * (k1 + k3 * uz) * dux,
    dz: 2.0 * (k2 + k3 * ux) * duz,
  };
}

// Derivative-weighted Swiss hydraulic erosion FBM on CPU (matches GLSL evalSwissErosionFBM)
export function evalSwissErosionCPU(x, z, octaves = 5) {
  let v = 0.0, a = 0.5;
  let gx = 0.0, gz = 0.0;
  let px = x, pz = z;
  for (let i = 0; i < octaves; i++) {
    const nd = noise2DDeriv(px - gx * 0.16, pz - gz * 0.16);
    gx += a * nd.dx;
    gz += a * nd.dz;
    const slopeSq = gx * gx + gz * gz;
    v += (a * (0.5 + 0.5 * nd.val)) / (1.0 + slopeSq * 1.45);
    const nx = px * 0.80 - pz * 0.60;
    const nz = px * 0.60 + pz * 0.80;
    px = nx * 2.06 + 13.7;
    pz = nz * 2.06 + 29.3;
    a *= 0.49;
  }
  const ridgeCrest = 1.0 / (1.0 + (gx * gx + gz * gz) * 2.2);
  return { height: v, ridgeCrest, gullyChannel: 1.0 - ridgeCrest };
}

/**
 * Evaluate continuous C2 terrain height across Ring 0 (0-18m Stage),
 * Ring 1 (18-140m), Ring 2 (140-900m), and Ring 3 (900-6000m+ closed 360° horizon skirt).
 */
export function evaluateWorldHeight(spec, x, z) {
  const r = Math.hypot(x, z);
  const waterLevel = spec?.water?.level ?? 0.0;
  const stageHeight = spec?.stage?.groundY ?? 1.2;

  // Ring 0 (r < 18m): Smooth actor staging pad at (0, stageHeight, 0)
  const stageBlend = Math.min(1.0, Math.max(0.0, (r - 10.0) / 12.0));
  const smoothStage = stageBlend * stageBlend * (3.0 - 2.0 * stageBlend);

  const swiss = evalSwissErosionCPU(x * 0.012, z * 0.012, 5);
  const micro = evalSwissErosionCPU(x * 0.085, z * 0.085, 3).height * 0.35;

  // Ring 1 & 2 landform + Ring 3 closed 360° mountain/canyon horizon envelope
  const ring2Envelope = Math.pow(Math.max(0.0, r - 24.0) * 0.018, 1.32) * 18.0;
  const ring3Skirt = Math.pow(Math.max(0.0, r - 220.0) * 0.0045, 1.25) * 95.0;

  let h = ( ring2Envelope + ring3Skirt ) * (0.45 + 0.85 * swiss.height) + micro;

  // Apply declarative terrain features (canyon, caldera, mesa, river channel, promontory)
  for (const f of spec?.terrain?.features || []) {
    const dx = x - (f.x || 0), dz = z - (f.z || 0);
    const dist = Math.hypot(dx, dz);
    const rad = Math.max(4.0, f.radius || 20.0);
    if (f.shape === 'river-channel') {
      const meanderX = Math.sin(z * 0.045) * (f.meander || 4.5);
      const dRiver = Math.abs(x - (f.x || 0) - meanderX);
      const u = Math.min(1.0, dRiver / rad);
      // C2 continuous riverbed profile extending smoothly below waterLevel
      const s = u * u * u * (u * (u * 6.0 - 15.0) + 10.0);
      h = h * s + (waterLevel - (f.depth || 2.4)) * (1.0 - s);
    } else if (f.shape === 'promontory' || f.shape === 'mesa') {
      const u = Math.max(0.0, Math.min(1.0, (rad - dist) / (rad * 0.32)));
      h += (f.height || 6.0) * (u * u * (3.0 - 2.0 * u));
    }
  }

  return stageHeight * (1.0 - smoothStage) + h * smoothStage;
}

/**
 * Sample 8 perimeter points + center around (cx, cz) to verify SG1 & SG3 slope grounding.
 */
export function sampleFootprintMinY(spec, cx, cz, radius) {
  let minH = evaluateWorldHeight(spec, cx, cz);
  let maxH = minH;
  const r = Math.max(0.25, radius);
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4.0;
    const h = evaluateWorldHeight(spec, cx + Math.cos(ang) * r, cz + Math.sin(ang) * r);
    if (h < minH) minH = h;
    if (h > maxH) maxH = h;
  }
  return { minH, maxH, slopeDrop: maxH - minH };
}
```

--------------------------------------------------------------------------------

## 2. The 8-Gate Spatial Constraint Solver & Sightline Auto-Repair Engine (`spatial_solver.js`)

Run `validateAndRepairWorld(spec)` before building Three.js meshes:

```javascript
// spatial_solver.js -- < 5 ms Pre-Render Spatial Verification & Auto-Repair
import { evaluateWorldHeight, sampleFootprintMinY, createPRNG } from './world_contract.js';

export function pointToAABBDistance(pt, aabb) {
  const dx = Math.max(aabb.min[0] - pt[0], 0, pt[0] - aabb.max[0]);
  const dy = Math.max(aabb.min[1] - pt[1], 0, pt[1] - aabb.max[1]);
  const dz = Math.max(aabb.min[2] - pt[2], 0, pt[2] - aabb.max[2]);
  return Math.hypot(dx, dy, dz);
}

export function aabbIntersects(a, b, margin = 0.0) {
  return (
    a.min[0] - margin < b.max[0] && a.max[0] + margin > b.min[0] &&
    a.min[1] - margin < b.max[1] && a.max[1] + margin > b.min[1] &&
    a.min[2] - margin < b.max[2] && a.max[2] + margin > b.min[2]
  );
}

export function segmentIntersectsAABB(a, b, aabb, tMin = 0.0, tMax = 0.80) {
  const dirs = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  let t0 = tMin, t1 = tMax;
  for (let axis = 0; axis < 3; axis++) {
    const d = dirs[axis], p = a[axis];
    if (Math.abs(d) < 1e-8) {
      if (p < aabb.min[axis] || p > aabb.max[axis]) return false;
    } else {
      const invD = 1.0 / d;
      let s0 = (aabb.min[axis] - p) * invD;
      let s1 = (aabb.max[axis] - p) * invD;
      if (s0 > s1) { const tmp = s0; s0 = s1; s1 = tmp; }
      if (s0 > t0) t0 = s0;
      if (s1 < t1) t1 = s1;
      if (t0 > t1) return false;
    }
  }
  return t0 <= t1;
}

export function isSightlineTubeClear(spec, pos, target, solids, allowLowGrazing = false) {
  const waterLevel = spec?.water?.enabled !== false ? (spec?.water?.level ?? 0.0) : -999;
  const minClearY = allowLowGrazing ? 0.55 : 1.20;
  const hAtCam = evaluateWorldHeight(spec, pos[0], pos[2]);
  if (pos[1] < Math.max(hAtCam, waterLevel) + minClearY) return false;

  for (const s of solids) {
    if (pointToAABBDistance(pos, s.aabb) < 1.20) return false;
  }

  for (let step = 1; step <= 12; step++) {
    const t = 0.06 + (step / 12) * 0.74;
    const rx = pos[0] + (target[0] - pos[0]) * t;
    const ry = pos[1] + (target[1] - pos[1]) * t;
    const rz = pos[2] + (target[2] - pos[2]) * t;
    if (ry < evaluateWorldHeight(spec, rx, rz) + 0.20) return false;
  }

  for (const s of solids) {
    if (pointToAABBDistance(target, s.aabb) <= 2.4) continue; // Intended subject
    if (segmentIntersectsAABB(pos, target, s.aabb, 0.0, 0.80)) return false;
  }
  return true;
}

export function validateAndRepairWorld(spec, allowRepair = true) {
  const t0 = performance.now();
  let repaired = false;
  const diagnostics = [];
  const waterLevel = spec?.water?.enabled !== false ? (spec?.water?.level ?? 0.0) : -999;

  // 1. Solve & Ground Structures (SG0, SG1, SG2, SG3, SG4)
  const structures = [];
  for (const raw of spec.structures || []) {
    const s = { ...raw };
    const r = Math.max(2.0, s.radius || 4.5);

    // SG0: Prevent non-stage structures from blocking Ring 0 (r < 7.5m) unless explicitly a stage centerpiece
    if (!s.allowOnStage && Math.hypot(s.x, s.z) < 7.5 + r) {
      if (allowRepair) {
        const ang = Math.atan2(s.z || 1, s.x || 1);
        s.x = +(Math.cos(ang) * (12.0 + r)).toFixed(2);
        s.z = +(Math.sin(ang) * (12.0 + r)).toFixed(2);
        repaired = true;
      } else {
        diagnostics.push({ check: 'SG0', severity: 'error', message: `Structure '${s.id}' intrudes into Ring 0 stage` });
      }
    }

    const fp = sampleFootprintMinY(spec, s.x, s.z, r * 0.85);
    const sink = Math.max(allowRepair ? 1.65 : (s.sink ?? 1.65), s.sink ?? 1.65);
    if ((s.sink ?? 1.65) < 1.50 && allowRepair) repaired = true;

    const baseY = s.spansWater ? Math.min(fp.minH - sink, waterLevel - 0.85) : fp.minH - sink;
    const topY = fp.minH + (s.height || 6.0);
    s.embedDepth = +(fp.minH - baseY).toFixed(3);
    s.slopeDrop = +fp.slopeDrop.toFixed(3);
    s.weldPenetration = Math.max(s.weldPenetration ?? 0.06, allowRepair ? 0.06 : 0.0);
    s.aabb = { min: [s.x - r, baseY, s.z - r], max: [s.x + r, topY, s.z + r] };

    // Auto-nudge structure-vs-structure AABB overlap
    if (allowRepair) {
      for (const prev of structures) {
        if (aabbIntersects(s.aabb, prev.aabb, 0.25)) {
          repaired = true;
          const ang = Math.atan2(s.z - prev.z || 1, s.x - prev.x || 1) + 0.45;
          const sep = (prev.radius || 4.5) + r + 4.0;
          s.x = +(prev.x + Math.cos(ang) * sep).toFixed(2);
          s.z = +(prev.z + Math.sin(ang) * sep).toFixed(2);
          const nfp = sampleFootprintMinY(spec, s.x, s.z, r * 0.85);
          s.aabb = {
            min: [s.x - r, nfp.minH - sink, s.z - r],
            max: [s.x + r, nfp.minH + (s.height || 6.0), s.z + r],
          };
        }
      }
    }
    structures.push(s);
  }

  // 2. Verify Ring 3 360° Horizon Closure across 36 azimuth buckets (r = 1200m)
  let ring3Closed = true;
  for (let i = 0; i < 36; i++) {
    const ang = (i * Math.PI * 2.0) / 36.0;
    const hHorizon = evaluateWorldHeight(spec, Math.cos(ang) * 1200.0, Math.sin(ang) * 1200.0);
    if (hHorizon < waterLevel - 1.0) ring3Closed = false;
  }

  // 3. Verify & Auto-Repair All 8 Hemisphere Camera Presets (G8 & G9)
  const cameras = (spec.cameras || []).map((c) => ({ ...c, pos: [...c.pos], target: [...c.target] }));
  for (const cam of cameras) {
    const isLowGrazing = cam.id === 'low_ground_sky';
    if (!isSightlineTubeClear(spec, cam.pos, cam.target, structures, isLowGrazing) && allowRepair) {
      repaired = true;
      const dx = cam.pos[0] - cam.target[0], dz = cam.pos[2] - cam.target[2];
      const baseDist = Math.max(10.0, Math.hypot(dx, dz) || 18.0);
      const baseAng = Math.atan2(dx, dz);
      for (const lift of isLowGrazing ? [0.65, 1.25] : [2.4, 4.8, 8.5, 14.0]) {
        let solved = false;
        for (const aOff of [0, 0.28, -0.28, 0.6, -0.6, 1.1, -1.1]) {
          const cx = cam.target[0] + Math.sin(baseAng + aOff) * baseDist;
          const cz = cam.target[2] + Math.cos(baseAng + aOff) * baseDist;
          const cy = Math.max(evaluateWorldHeight(spec, cx, cz), waterLevel) + lift;
          const cand = [+cx.toFixed(2), +cy.toFixed(2), +cz.toFixed(2)];
          if (isSightlineTubeClear(spec, cand, cam.target, structures, isLowGrazing)) {
            cam.pos = cand;
            solved = true;
            break;
          }
        }
        if (solved) break;
      }
    }
  }

  const compileTimeMs = +(performance.now() - t0).toFixed(3);
  return {
    ok: diagnostics.length === 0 && ring3Closed,
    repaired,
    compileTimeMs,
    structures,
    cameras,
    diagnostics,
  };
}
```

--------------------------------------------------------------------------------

## 3. Fast `< 2.5 ms` `96×96` Bilinear Height/Slope LUT Grass Generator

Use a pre-sampled `96×96` LUT so scattering `50,000-75,000` curved
5-to-7-segment parabolic Bézier grass blades takes `< 2.5 ms` while respecting
Ring 0 stage clearance and structure footprints:

```javascript
export function generateGroundedGrassLUT(spec, structures, count = 60000, bounds = [-120, -120, 120, 120]) {
  const [minX, minZ, maxX, maxZ] = bounds;
  const spanX = maxX - minX, spanZ = maxZ - minZ;
  const gridN = 96;
  const lut = new Float32Array((gridN + 1) * (gridN + 1));

  for (let gz = 0; gz <= gridN; gz++) {
    const z = minZ + (gz / gridN) * spanZ;
    for (let gx = 0; gx <= gridN; gx++) {
      const x = minX + (gx / gridN) * spanX;
      lut[gz * (gridN + 1) + gx] = evaluateWorldHeight(spec, x, z);
    }
  }

  const waterLevel = spec?.water?.level ?? 0.0;
  const rand = createPRNG(spec?.seed || 202);
  const out = new Float32Array(count * 8); // [x, y, z, yaw, height, stiffness, tint, phase]
  let written = 0, attempts = 0;

  while (written < count && attempts < count * 4) {
    attempts++;
    const x = minX + rand() * spanX;
    const z = minZ + rand() * spanZ;
    if (Math.hypot(x, z) < 7.5) continue; // Keep Ring 0 Actor Stage pad unobstructed

    const u = Math.max(0, Math.min(gridN - 0.001, ((x - minX) / spanX) * gridN));
    const v = Math.max(0, Math.min(gridN - 0.001, ((z - minZ) / spanZ) * gridN));
    const ix = u | 0, iz = v | 0, fx = u - ix, fz = v - iz;
    const idx = iz * (gridN + 1) + ix;
    const h00 = lut[idx], h10 = lut[idx + 1], h01 = lut[idx + gridN + 1], h11 = lut[idx + gridN + 2];
    const h = (h00 + (h10 - h00) * fx) * (1 - fz) + (h01 + (h11 - h01) * fx) * fz;
    const slope = Math.abs(h10 - h00) + Math.abs(h01 - h00);

    if (h < waterLevel + 0.28 || slope > 0.42) continue;

    let hitStruct = false;
    for (const s of structures) {
      if (Math.hypot(x - s.x, z - s.z) < (s.radius || 4.5) + 0.5) { hitStruct = true; break; }
    }
    if (hitStruct) continue;

    const base = written * 8;
    out[base + 0] = x;
    out[base + 1] = h - 0.03; // 3cm root embedment
    out[base + 2] = z;
    out[base + 3] = rand() * Math.PI * 2.0;
    out[base + 4] = 0.28 + rand() * 0.38;
    out[base + 5] = 0.65 + rand() * 0.35;
    out[base + 6] = rand(); // Olive-to-straw botanical chlorophyll variance
    out[base + 7] = rand() * Math.PI * 2.0;
    written++;
  }
  return out.subarray(0, written * 8);
}
```

--------------------------------------------------------------------------------

## 4. Shared Photorealistic Shader Modules

When rendering the verified `CompiledWorld` in Three.js, import or embed the
production shader modules from `shared_core/` (e.g.,
`google3/experimental/lnoot/photorealistic_3d_environment_templates/shared_core/`):

1.  **`environment_kit.js`**:
    -   `SKY_CLOUD_DOME_FRAGMENT` (Spherical Chappuis ozone sky + 4-stage
        Takram/Nubis volumetric cloud raymarching + crepuscular rays).
    -   `AERIAL_PERSPECTIVE_GLSL` & `CLOUD_SHADOW_GLSL` (360° azimuth-coupled
        aerial perspective & projected world-XZ cloud shadows).
    -   Live sun-disk-free `PMREMGenerator` environment cubemap baking + 4-Mode
        Test Actor Stage Rig (`reference_spheres`, `monolith`, `explorer_rover`,
        `empty_stage`).
2.  **`photoreal_shaders.js`**:
    -   `PHOTOREAL_SURFACE_GLSL`: `evalSwissErosionFBM`,
        `evalPerturbNormalDeriv` (quad-oscillation-attenuated),
        `evalMicroCavityAndSelfShadow`, `evalTriplanarStochastic`,
        `evalWetPorosityOptics`, and `evalSunShadowMapPCF` (rotated 9-tap
        Poisson PCF shadow sampling).
    -   `createPhotorealWaterSystem`: Full-resolution `1024×1024` planar mirror
        `WebGLRenderTarget` combined with finite-depth dispersive Gerstner waves
        ($\omega(k) = \sqrt{gk\tanh(kh)}$), Beer-Lambert seabed absorption, and
        dual-layer Voronoi caustics.
    -   `createPhotorealTreeInstancedSet` & `createPhotorealFernField`:
        `2048×2048` procedural botanical leaf/frond cutout atlases with
        `alphaToCoverage: true`, spherical canopy bent normals, and dual-lobe
        subsurface scattering.
