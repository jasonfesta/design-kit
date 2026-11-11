/**
 * car_surface_kernel.js — Class-A Parametric Automotive CAD, Greenhouse, Cabin & Wheel Hardware Kernel
 *
 * Reusable procedural solid & surface kernel for Three.js automotive reconstructions:
 *   1. `createMonotoneCubicSpline(xs, ys)` — Fritsch–Carlson C1 monotone piecewise cubic Hermite spline
 *      (guaranteed 0% Catmull-Rom overshoot adjacent to flat roofs, hoods, and rocker sills).
 *   2. `cosineCluster(count, minVal, maxVal)` & `buildArchClusteredZStations(spec)` — Knot-exact
 *      longitudinal station generator clustering vertices around wheel-arch tangencies, nose, and tail.
 *   3. `computeCreasedVertexNormals(geometry, smoothDeg, hardDeg)` — Dihedral-angle normal blending.
 *   4. `bakeRestPoseAttributes(target)` — Locks `aRestPos` & `aRestNormal` in assembled world meters.
 *   5. `buildArchAlignedPontoonBody(spec)` — Watertight Class-A lower body shell with independent
 *      pontoon fender crests vs. central hood/deck relief, exact circular/superelliptical wheel arches,
 *      rolled fender-lip flares + 24 mm inward return flanges, and closed front/rear bumper fascias.
 *   6. `buildFlushGreenhouseAssembly(spec)` — Distinct 3D A/B/C pillars, crowned roof panel, satin
 *      weatherstrip moldings, and flush curved windshield / side DLO / rear backlight glass panes.
 *   7. `buildDetailedCabinInterior(spec)` — Sculpted bolstered sport bucket seats, dashboard & gauge
 *      binnacle, 3-spoke steering wheel, center console, door cards, and rear-view mirror.
 *   8. `buildPrecisionWheelAssembly(spec)` — Stepped forged rim barrel, multi-spoke styles (`'split5'`,
 *      `'star5'`, `'fuchs5'`, `'mesh'`), lug bolts / center-lock, loaded pneumatic tire, and non-spinning
 *      cross-drilled brake rotor + 6-piston caliper.
 *   9. `buildFlushHeadlampAssembly`, `buildFlushTaillampAssembly`, `buildAeroMirrorPair`,
 *      `buildWiperPair`, and `buildExhaustTips` — Exterior optical & mechanical jewelry.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function safeMergeGeometries(geos) {
  const list = geos.filter(Boolean).map((g) => {
    const nonIdx = g.index ? g.toNonIndexed() : g.clone();
    // Keep only position, normal, uv so attribute sets match across Box/Cylinder/Lathe/Extrude
    if (!nonIdx.getAttribute('normal')) nonIdx.computeVertexNormals();
    if (!nonIdx.getAttribute('uv')) {
      const count = nonIdx.getAttribute('position').count;
      nonIdx.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
    }
    for (const key of Object.keys(nonIdx.attributes)) {
      if (key !== 'position' && key !== 'normal' && key !== 'uv') {
        nonIdx.deleteAttribute(key);
      }
    }
    return nonIdx;
  });
  return mergeGeometries(list, false);
}

export function createMonotoneCubicSpline(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) {
    const v0 = ys[0] ?? 0;
    const fn0 = () => v0;
    fn0.eval = () => v0;
    fn0.deriv = () => 0;
    fn0.secondDeriv = () => 0;
    return fn0;
  }

  const dx = new Float64Array(n - 1);
  const sec = new Float64Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    dx[i] = Math.max(1e-9, xs[i + 1] - xs[i]);
    sec[i] = (ys[i + 1] - ys[i]) / dx[i];
  }

  const m = new Float64Array(n);
  m[0] = sec[0];
  m[n - 1] = sec[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (sec[i - 1] * sec[i] <= 0.0) {
      m[i] = 0.0;
    } else {
      const w1 = 2.0 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2.0 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / sec[i - 1] + w2 / sec[i]);
    }
  }

  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(sec[i]) < 1e-12) {
      m[i] = 0.0;
      m[i + 1] = 0.0;
    } else {
      const a = m[i] / sec[i];
      const b = m[i + 1] / sec[i];
      const r2 = a * a + b * b;
      if (r2 > 9.0) {
        const tau = 3.0 / Math.sqrt(r2);
        m[i] = tau * a * sec[i];
        m[i + 1] = tau * b * sec[i];
      }
    }
  }

  function locate(x) {
    if (x <= xs[0]) return 0;
    if (x >= xs[n - 1]) return n - 2;
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= x) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  function evalAt(x) {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    const i = locate(x);
    const h = dx[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2.0 * t3 - 3.0 * t2 + 1.0;
    const h10 = t3 - 2.0 * t2 + t;
    const h01 = -2.0 * t3 + 3.0 * t2;
    const h11 = t3 - t2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  }

  function derivAt(x) {
    const i = locate(x);
    const h = dx[i];
    const t = Math.max(0.0, Math.min(1.0, (x - xs[i]) / h));
    const t2 = t * t;
    const dh00 = 6.0 * t2 - 6.0 * t;
    const dh10 = 3.0 * t2 - 4.0 * t + 1.0;
    const dh01 = -6.0 * t2 + 6.0 * t;
    const dh11 = 3.0 * t2 - 2.0 * t;
    return (dh00 * ys[i] + dh01 * ys[i + 1]) / h + dh10 * m[i] + dh11 * m[i + 1];
  }

  function secondDerivAt(x) {
    const i = locate(x);
    const h = dx[i];
    const t = Math.max(0.0, Math.min(1.0, (x - xs[i]) / h));
    const d2h00 = 12.0 * t - 6.0;
    const d2h10 = 6.0 * t - 4.0;
    const d2h01 = -12.0 * t + 6.0;
    const d2h11 = 6.0 * t - 2.0;
    return (d2h00 * ys[i] + d2h01 * ys[i + 1]) / (h * h) + (d2h10 * m[i] + d2h11 * m[i + 1]) / h;
  }

  const fn = (x) => evalAt(x);
  fn.eval = evalAt;
  fn.deriv = derivAt;
  fn.secondDeriv = secondDerivAt;
  return fn;
}

export function cosineCluster(count, minVal = 0.0, maxVal = 1.0) {
  const n = Math.max(2, count | 0);
  const out = new Float64Array(n);
  const span = maxVal - minVal;
  for (let i = 0; i < n; i++) {
    out[i] = minVal + span * 0.5 * (1.0 - Math.cos((Math.PI * i) / (n - 1)));
  }
  return out;
}

export function minJerk(t) {
  const u = Math.max(0.0, Math.min(1.0, t));
  return u * u * u * (10.0 + u * (-15.0 + 6.0 * u));
}

function smoothstep(e0, e1, x) {
  const t = Math.max(0.0, Math.min(1.0, (x - e0) / Math.max(1e-9, e1 - e0)));
  return t * t * (3.0 - 2.0 * t);
}

export function solveAckermannSteering(steerAngleRadOrDeg, wheelbase = 2.65, frontTrack = 1.56) {
  const steerRad =
    Math.abs(steerAngleRadOrDeg) > 1.2
      ? (steerAngleRadOrDeg * Math.PI) / 180.0
      : steerAngleRadOrDeg;
  if (Math.abs(steerRad) < 1e-6) return { left: 0.0, right: 0.0, leftRad: 0.0, rightRad: 0.0 };
  const sign = steerRad >= 0 ? 1.0 : -1.0;
  const absDelta = Math.min(0.68, Math.abs(steerRad));
  const rTurn = wheelbase / Math.tan(absDelta);
  const inner = Math.atan2(wheelbase, Math.max(0.25, rTurn - 0.5 * frontTrack));
  const outer = Math.atan2(wheelbase, rTurn + 0.5 * frontTrack);
  const left = sign > 0 ? inner : -outer;
  const right = sign > 0 ? outer : -inner;
  return { left, right, leftRad: left, rightRad: right };
}

export function computeCreasedVertexNormals(geometry, smoothDeg = 4.0, hardDeg = undefined) {
  const resolvedHard = hardDeg === undefined ? Math.max(18.0, smoothDeg) : Math.max(smoothDeg + 0.5, hardDeg);
  const resolvedSmooth = hardDeg === undefined && smoothDeg > 10.0 ? smoothDeg * 0.35 : smoothDeg;
  const nonIdx = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const pos = nonIdx.getAttribute('position');
  const vertCount = pos.count;
  const triCount = Math.floor(vertCount / 3);

  const faceNormals = new Float32Array(triCount * 3);
  const faceAreas = new Float32Array(triCount);
  const ax = new THREE.Vector3();
  const bx = new THREE.Vector3();
  const cx = new THREE.Vector3();
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  const fn = new THREE.Vector3();

  const buckets = new Map();
  const quant = 20000.0;

  for (let t = 0; t < triCount; t++) {
    const i0 = t * 3;
    ax.fromBufferAttribute(pos, i0);
    bx.fromBufferAttribute(pos, i0 + 1);
    cx.fromBufferAttribute(pos, i0 + 2);
    e1.subVectors(bx, ax);
    e2.subVectors(cx, ax);
    fn.crossVectors(e1, e2);
    const len = fn.length();
    faceAreas[t] = Math.max(len * 0.5, 1e-10);
    if (len > 1e-11) fn.multiplyScalar(1.0 / len);
    else fn.set(0, 1, 0);

    faceNormals[t * 3] = fn.x;
    faceNormals[t * 3 + 1] = fn.y;
    faceNormals[t * 3 + 2] = fn.z;

    for (let k = 0; k < 3; k++) {
      const vi = i0 + k;
      const key = `${Math.round(pos.getX(vi) * quant)},${Math.round(pos.getY(vi) * quant)},${Math.round(pos.getZ(vi) * quant)}`;
      let list = buckets.get(key);
      if (!list) {
        list = [];
        buckets.set(key, list);
      }
      list.push(vi);
    }
  }

  const cosSmooth = Math.cos((resolvedSmooth * Math.PI) / 180.0);
  const cosHard = Math.cos((resolvedHard * Math.PI) / 180.0);
  const denom = Math.max(1e-6, cosSmooth - cosHard);
  const outNormals = new Float32Array(vertCount * 3);

  for (const list of buckets.values()) {
    const m = list.length;
    for (let a = 0; a < m; a++) {
      const va = list[a];
      const ta = Math.floor(va / 3);
      const nax = faceNormals[ta * 3];
      const nay = faceNormals[ta * 3 + 1];
      const naz = faceNormals[ta * 3 + 2];

      let sx = nax * faceAreas[ta];
      let sy = nay * faceAreas[ta];
      let sz = naz * faceAreas[ta];

      for (let b = 0; b < m; b++) {
        if (a === b) continue;
        const vb = list[b];
        const tb = Math.floor(vb / 3);
        const nbx = faceNormals[tb * 3];
        const nby = faceNormals[tb * 3 + 1];
        const nbz = faceNormals[tb * 3 + 2];
        const dot = nax * nbx + nay * nby + naz * nbz;
        if (dot <= cosHard) continue;
        const u = Math.min(1.0, Math.max(0.0, (dot - cosHard) / denom));
        const w = u * u * (3.0 - 2.0 * u) * faceAreas[tb];
        sx += nbx * w;
        sy += nby * w;
        sz += nbz * w;
      }

      const sl = Math.hypot(sx, sy, sz) || 1.0;
      outNormals[va * 3] = sx / sl;
      outNormals[va * 3 + 1] = sy / sl;
      outNormals[va * 3 + 2] = sz / sl;
    }
  }

  nonIdx.setAttribute('normal', new THREE.BufferAttribute(outNormals, 3));
  return nonIdx;
}

export function bakeRestPoseAttributes(rootOrGeometry) {
  if (rootOrGeometry && rootOrGeometry.isBufferGeometry) {
    const geo = rootOrGeometry;
    const pos = geo.getAttribute('position');
    if (pos && !geo.getAttribute('aRestPos')) {
      geo.setAttribute('aRestPos', pos.clone());
    }
    if (!geo.getAttribute('normal')) geo.computeVertexNormals();
    const norm = geo.getAttribute('normal');
    if (norm && !geo.getAttribute('aRestNormal')) {
      geo.setAttribute('aRestNormal', norm.clone());
    }
    return rootOrGeometry;
  }

  if (rootOrGeometry && rootOrGeometry.traverse) {
    rootOrGeometry.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    const nMat = new THREE.Matrix3();
    rootOrGeometry.traverse((obj) => {
      if (!obj.isMesh || !obj.geometry) return;
      const geo = obj.geometry;
      const pos = geo.getAttribute('position');
      if (!pos) return;
      if (!geo.getAttribute('normal')) geo.computeVertexNormals();
      const norm = geo.getAttribute('normal');
      const restPos = new Float32Array(pos.count * 3);
      const restNorm = new Float32Array(pos.count * 3);
      nMat.getNormalMatrix(obj.matrixWorld);
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
        restPos[i * 3] = v.x;
        restPos[i * 3 + 1] = v.y;
        restPos[i * 3 + 2] = v.z;
        if (norm) {
          v.fromBufferAttribute(norm, i).applyMatrix3(nMat).normalize();
          restNorm[i * 3] = v.x;
          restNorm[i * 3 + 1] = v.y;
          restNorm[i * 3 + 2] = v.z;
        }
      }
      geo.setAttribute('aRestPos', new THREE.BufferAttribute(restPos, 3));
      geo.setAttribute('aRestNormal', new THREE.BufferAttribute(restNorm, 3));
    });
  }
  return rootOrGeometry;
}

/**
 * Generates knot-exact longitudinal Z stations from `zRear` to `zFront` with cosine clustering
 * at nose/tail bumper wraps and exact knots at all 4 wheel-arch tangency boundaries so wheel
 * arches never exhibit sawtooth quad cuts.
 */
export function buildArchClusteredZStations({
  zRear = -2.26,
  zFront = 2.26,
  zRearAxle = -1.225,
  zFrontAxle = 1.225,
  rArchRear = 0.375,
  rArchFront = 0.365,
} = {}) {
  const rR = rArchRear * 1.05;
  const rF = rArchFront * 1.05;
  const knots = [
    [zRear, Math.max(zRear + 0.08, zRearAxle - rR), 22],
    [zRearAxle - rR, zRearAxle + rR, 40],
    [zRearAxle + rR, zFrontAxle - rF, 28],
    [zFrontAxle - rF, zFrontAxle + rF, 40],
    [zFrontAxle + rF, Math.max(zFrontAxle + rF + 0.08, zFront), 24],
  ];
  const zs = [];
  for (let seg = 0; seg < knots.length; seg++) {
    const [a, b, count] = knots[seg];
    const sub = cosineCluster(count, a, b);
    for (let i = seg === 0 ? 0 : 1; i < sub.length; i++) {
      zs.push(sub[i]);
    }
  }
  return new Float64Array(zs);
}

/**
 * Builds a watertight, Class-A symmetrical lower pontoon body shell (both +X and -X halves,
 * full-width bullnose front nose & rear bumper wraps, rolled 24 mm wheel-arch return
 * flanges, recessed cockpit well, stamped 3D headlamp sockets, and watertight underbody floorpan).
 *
 * Accepts spline control arrays `[z, val]` or callback functions for total styling freedom
 * across sports coupes (911), mid-engine wedges (F40), sedans (M3), or GT fastbacks.
 */
export function buildArchAlignedPontoonBody({
  zRear = -2.26,
  zFront = 2.26,
  wheelbase = 2.45,
  zRearAxle = -wheelbase * 0.5,
  zFrontAxle = wheelbase * 0.5,
  yRearHub = 0.345,
  yFrontHub = 0.335,
  rArchRearZ = 0.382,
  rArchRearY = 0.382,
  rArchFrontZ = 0.368,
  rArchFrontY = 0.368,
  archSuperellipse = 2.08, // 2.0 = exact circle, 2.25 = slightly squared trapezoidal arch
  flareRearOut = 0.036,
  flareFrontOut = 0.026,
  flareRadialWidth = 0.135,
  flangeDepth = 0.026,
  // Profile curves: array of [z, value] pairs (monotone cubic spline) or function(z)
  centerTopCurve = null,   // Hood -> cabin-belt-tub -> rear deck centerline Y(z)
  fenderPeakCurve = null,  // Outer fender crest / beltline shoulder Y(z)
  halfWidthCurve = null,   // Maximum lower-body half-width X(z) (before arch flare)
  shoulderWidthCurve = null, // Shoulder / fender-crest half-width X(z)
  sillHeightCurve = null,  // Rocker sill / front splitter / rear diffuser lower edge Y(z)
  hoodSeamRatio = 0.58,    // Fraction of shoulderWidth where hood/deck crease sits
  hoodCrown = 0.014,       // Positive barrel crown across central hood panel (m)
  sideBellyOut = 0.032,    // Outward tumble/belly crown on vertical door/quarter skin
  rockerTuck = 0.030,      // Lower flank roll-under tuck between axles (m)
  bumperLowerTuck = 0.022, // Lower corner roll-under tuck on front/rear bumpers (m)
  rearOverhangLowerTuck = 0.0, // Extra lower-corner inward taper behind rear wheel arch (exposes wide rear tires!)
  frontOverhangLowerTuck = 0.0, // Extra lower-corner inward taper ahead of front wheel arch
  frontNoseRound = 0.038,  // Longitudinal upper-nose bullnose rounding depth (m) — eliminates vertical brick nose!
  frontLowerUndercut = 0.018, // Longitudinal lower-chin intake tuck above splitter (m)
  rearValenceUndercut = 0.058, // Longitudinal forward roll-under of lower rear bumper valence (m) — eliminates boxy cliff!
  sideScoopFn = null,      // Optional fn(z, tSide) -> inward aero scoop / NACA channel depth (m)
  surfaceDepressionFn = null, // Optional fn(absX, y, z) -> downward recessed lamp/NACA pocket depth (m)
  frontPlanSweep = 0.28,   // Superellipse plan-wrap length at front bumper (m) — smooth wraparound corners!
  rearPlanSweep = 0.20,    // Superellipse plan-wrap length at rear bumper (m)
  zCabinRear = -1.06,      // Rear bulkhead of recessed cockpit well (prevents painted deck slicing cabin!)
  zCabinFront = 0.68,      // Front firewall of recessed cockpit well
  cockpitDrop = 0.38,      // Depth of recessed cockpit well inside cabin footprint (m)
  headlampSockets = [],    // Optional [{ x, z, rx, rz, depth }] stamped 3D fender headlamp pockets!
  nosePlanPower = 2.25,    // Plan-view superellipse exponent at nose (~2.15 oval 911, ~3.4 wide wedge F40)
  tailPlanPower = 2.35,    // Plan-view superellipse exponent at tail (~2.25 rounded 911, ~4.5 flat Kamm F40)
  smoothDeg = 6.0,
  hardDeg = 34.0,
} = {}) {
  const toEval = (spec, fallbackPts) => {
    if (typeof spec === 'function') return spec;
    const pts = Array.isArray(spec) && spec.length >= 2 ? spec : fallbackPts;
    const sorted = [...pts].sort((a, b) => a[0] - b[0]);
    return createMonotoneCubicSpline(
      sorted.map((p) => p[0]),
      sorted.map((p) => p[1]),
    );
  };

  const L = zFront - zRear;
  const evalCenterY = toEval(centerTopCurve, [
    [zRear, 0.72],
    [zRear + 0.14, 0.84],
    [zRearAxle, 0.89],
    [-0.25, 0.90],
    [0.65, 0.84],
    [zFrontAxle, 0.72],
    [zFront - 0.25, 0.54],
    [zFront, 0.40],
  ]);

  const evalFenderY = toEval(fenderPeakCurve, [
    [zRear, 0.73],
    [zRear + 0.16, 0.86],
    [zRearAxle, 0.93],
    [0.0, 0.87],
    [0.68, 0.85],
    [zFrontAxle, 0.79],
    [zFront - 0.26, 0.60],
    [zFront, 0.42],
  ]);

  const evalHalfW = toEval(halfWidthCurve, [
    [zRear, 0.76],
    [zRear + 0.22, 0.91],
    [zRearAxle, 0.945],
    [0.0, 0.895],
    [zFrontAxle, 0.915],
    [zFront - 0.24, 0.84],
    [zFront, 0.68],
  ]);

  const evalShoulderW = toEval(shoulderWidthCurve, [
    [zRear, 0.68],
    [zRear + 0.22, 0.81],
    [zRearAxle, 0.855],
    [0.0, 0.835],
    [zFrontAxle, 0.835],
    [zFront - 0.24, 0.75],
    [zFront, 0.58],
  ]);

  const evalSillY = toEval(sillHeightCurve, [
    [zRear, 0.22],
    [zRear + 0.22, 0.17],
    [zRearAxle - rArchRearZ, 0.135],
    [0.0, 0.125],
    [zFrontAxle + rArchFrontZ, 0.135],
    [zFront - 0.18, 0.145],
    [zFront, 0.165],
  ]);

  // Clamp front & rear superellipsoid bumper plan-wrap zones strictly outside the wheel arches!
  const maxFrontWrap = Math.max(0.06, (zFront - (zFrontAxle + rArchFrontZ * 1.06)) * 0.92);
  const maxRearWrap = Math.max(0.05, (zRearAxle - rArchRearZ * 1.06 - zRear) * 0.92);
  const frontWrapLen = Math.min(Math.max(0.045, frontPlanSweep), maxFrontWrap);
  const rearWrapLen = Math.min(Math.max(0.040, rearPlanSweep), maxRearWrap);
  const zRearWrapStart = zRear + rearWrapLen;
  const zFrontWrapStart = zFront - frontWrapLen;

  const zCore = buildArchClusteredZStations({
    zRear: zRearWrapStart,
    zFront: zFrontWrapStart,
    zRearAxle,
    zFrontAxle,
    rArchRear: rArchRearZ,
    rArchFront: rArchFrontZ,
  });

  // Superellipsoid Plan-Wrap + 14th-Power Vertical Bullnose Bumper Closure:
  //   - Horizontal width scales by `sX(u) = (1 - u^pPlan)^(1/pPlan)` over `wrapLen`, tracing a silky C2
  //     wraparound bumper corner in plan view (ZERO 90-degree Cybertruck brick corners!).
  //   - Vertical height scales by `sY(u) = (1 - u^14)^0.16`, staying >=97% full square-shouldered height across
  //     90% of the bumper width (ZERO canoe-hull lower corner pinch!) and rounding smoothly over the final ~25 mm
  //     into a pure vertical nose/tail center tangent `(nz = +-1, ny = 0)`!
  const WRAP_STEPS = 18;
  const zStations = [];
  const wrapScaleX = [];
  const wrapScaleY = [];

  // Rear wrap stations: `i = WRAP_STEPS` (`z = zRear`, `u = 1`) -> `i = 1` (near `zRearWrapStart`)
  for (let i = WRAP_STEPS; i >= 1; i--) {
    const t = i / WRAP_STEPS;
    const u = Math.sin(t * Math.PI * 0.5);
    const z = zRearWrapStart - rearWrapLen * u;
    const sX = u >= 0.99999 ? 0.0 : Math.pow(Math.max(0.0, 1.0 - Math.pow(u, tailPlanPower)), 1.0 / tailPlanPower);
    const uTip = Math.max(0.0, (u - 0.74) / 0.26);
    const sY = u >= 0.99999 ? 0.0 : Math.pow(Math.max(0.0, 1.0 - Math.pow(uTip, 3.0)), 0.36);
    zStations.push(z);
    wrapScaleX.push(sX);
    wrapScaleY.push(sY);
  }
  // Core body + wheel-arch stations (`sX = 1, sY = 1`)
  for (let i = 0; i < zCore.length; i++) {
    zStations.push(zCore[i]);
    wrapScaleX.push(1.0);
    wrapScaleY.push(1.0);
  }
  // Front wrap stations: `i = 1` (near `zFrontWrapStart`) -> `i = WRAP_STEPS` (`z = zFront`, `u = 1`)
  for (let i = 1; i <= WRAP_STEPS; i++) {
    const t = i / WRAP_STEPS;
    const u = Math.sin(t * Math.PI * 0.5);
    const z = zFrontWrapStart + frontWrapLen * u;
    const sX = u >= 0.99999 ? 0.0 : Math.pow(Math.max(0.0, 1.0 - Math.pow(u, nosePlanPower)), 1.0 / nosePlanPower);
    const uTip = Math.max(0.0, (u - 0.72) / 0.28);
    const sY = u >= 0.99999 ? 0.0 : Math.pow(Math.max(0.0, 1.0 - Math.pow(uTip, 3.0)), 0.38);
    zStations.push(z);
    wrapScaleX.push(sX);
    wrapScaleY.push(sY);
  }

  // Cross-section vertex count from top centerline (x=0), across +X outer skin, rolled lip, to bottom centerline (x=0)
  // Mirrored seamlessly onto -X so normals at x=0 are 100% C2 symmetric!
  const TOP_STEPS = 12;   // Centerline -> hood seam -> fender crest
  const SIDE_STEPS = 16;  // Fender crest -> max belly -> lower sill/arch lip
  const LIP_STEPS = 12;   // Rolled inward flange -> subdivided underbody / inner arch seal (matches plan-curve chord to <0.2 mm!)
  const HALF_COLS = TOP_STEPS + SIDE_STEPS + LIP_STEPS; // 40 (even!) indices 0 .. HALF_COLS on +X
  void (HALF_COLS >> 1);

  // Smooth C1 wheel-arch profile: exact circle/superellipse over upper 150° of tire, transitioning
  // steeply & continuously down to `ySill` over `[0.95*rZ, 1.04*rZ]` with ZERO step cliff!
  function archOpeningY(z, zW, yHub, rZ, rY, ySill) {
    const dz = Math.abs(z - zW);
    const zOuter = rZ * 1.045;
    if (dz >= zOuter) return -1.0;
    const uSplit = 0.945;
    const zSplit = rZ * uSplit;
    if (dz <= zSplit) {
      const u = dz / rZ;
      const inside = Math.max(0.0, 1.0 - Math.pow(u, archSuperellipse));
      return yHub + rY * Math.pow(inside, 1.0 / archSuperellipse);
    }
    const insideSplit = Math.max(0.0, 1.0 - Math.pow(uSplit, archSuperellipse));
    const ySplit = yHub + rY * Math.pow(insideSplit, 1.0 / archSuperellipse);
    const t = Math.min(1.0, Math.max(0.0, (dz - zSplit) / Math.max(1e-5, zOuter - zSplit)));
    const s = t * t * (3.0 - 2.0 * t);
    return ySplit * (1.0 - s) + ySill * s;
  }

  function archBlisterOut(z, y, zW, yHub, rZ, rY, amp) {
    const nz = (z - zW) / Math.max(1e-4, rZ);
    const ny = (y - yHub) / Math.max(1e-4, rY);
    if (ny < -0.68) return 0.0;
    // CRITICAL C-INFINITY ARCH BLISTER LAW: use `Math.abs(ny)` (never `Math.max(0, ny)`) so there is ZERO
    // horizontal derivative kink at hub height (`y = yHub`, `ny = 0`) ahead of and behind the tires!
    const rNorm = Math.pow(
      Math.pow(Math.abs(nz), archSuperellipse) + Math.pow(Math.abs(ny), archSuperellipse),
      1.0 / archSuperellipse,
    );
    const dr = (rNorm - 1.0) * 0.5 * (rZ + rY);
    if (dr < -0.025 || dr > flareRadialWidth * 2.3) return 0.0;
    const rise = smoothstep(-0.020, 0.026, dr);
    const decay = Math.exp(-Math.pow(Math.max(0.0, dr - 0.022) / flareRadialWidth, 1.80));
    const upperMask = smoothstep(-0.62, -0.06, ny);
    return amp * rise * decay * upperMask;
  }

  function polySmoothMin(a, b, k = 0.045) {
    const h = Math.max(k - Math.abs(a - b), 0.0) / k;
    return Math.min(a, b) - h * h * k * 0.25;
  }

  const rows = zStations.length;
  // Build full closed loop around cross-section:
  // Top-center (0) -> +X side (1 .. HALF_COLS-1) -> Bottom-center (HALF_COLS) -> -X side (HALF_COLS+1 .. 2*HALF_COLS-1) -> back to Top-center (2*HALF_COLS)
  const ringCols = HALF_COLS * 2 + 1;
  const positions = new Float32Array(rows * ringCols * 3);
  const uvs = new Float32Array(rows * ringCols * 2);

  for (let r = 0; r < rows; r++) {
    const z = zStations[r];
    const sX = wrapScaleX[r];
    const sY = wrapScaleY[r];
    // Hold reference cross-section width constant inside the bumper wrap zone so `sX` traces an exact superellipse,
    // while blending outer pontoon crest `yFender` smoothly into `yCenter` by `sX^2` around the nose/tail wrap so
    // raised cannon-barrel fenders NEVER pinch into a horizontal step crease ahead of the headlamps!
    const zWidthRef = Math.min(zFrontWrapStart, Math.max(zRearWrapStart, z));
    const yCenter = evalCenterY(z);
    const pontoonFade = sX * sX;
    const yFender = yCenter + (evalFenderY(z) - yCenter) * pontoonFade;
    const xShoulder = evalShoulderW(zWidthRef);
    const xMaxBase = evalHalfW(zWidthRef);
    const ySillBase = evalSillY(z);

    const yArchR = archOpeningY(z, zRearAxle, yRearHub, rArchRearZ, rArchRearY, ySillBase);
    const yArchF = archOpeningY(z, zFrontAxle, yFrontHub, rArchFrontZ, rArchFrontY, ySillBase);
    const yArch = Math.max(yArchR, yArchF);
    const inArch = yArch > ySillBase + 0.002;
    const yLower = inArch ? yArch : ySillBase;

    const halfPts = new Array(HALF_COLS + 1); // [x, y] from top center (0) to bottom center (HALF_COLS)

    // 1. Top deck / hood + pontoon fender crest (0 .. TOP_STEPS), with recessed cockpit tub inside cabin!
    const xSeam = xShoulder * hoodSeamRatio;
    const cabinWellZ =
      cockpitDrop > 0.001
        ? smoothstep(zCabinRear - 0.06, zCabinRear + 0.14, z) *
          (1.0 - smoothstep(zCabinFront - 0.14, zCabinFront + 0.04, z))
        : 0.0;
    for (let j = 0; j <= TOP_STEPS; j++) {
      const t = j / TOP_STEPS; // 0 at x=0, 1 at x=xShoulder
      const x = xShoulder * t;
      let y;
      if (x <= xSeam || xShoulder < 1e-5) {
        const uHood = xSeam > 1e-5 ? x / xSeam : 0.0;
        y = yCenter + hoodCrown * (1.0 - uHood * uHood);
      } else {
        const uFend = (x - xSeam) / Math.max(1e-5, xShoulder - xSeam);
        const s = uFend * uFend * (3.0 - 2.0 * uFend);
        const shoulderRoll = Math.sin(uFend * Math.PI) * 0.008;
        y = yCenter * (1.0 - s) + yFender * s + shoulderRoll;
      }
      // Depress inner deck into dark cockpit tub inside cabin footprint so seats are never bisected!
      if (cabinWellZ > 0.001) {
        const tubMaskX = 1.0 - smoothstep(0.62, 0.86, t);
        y -= cockpitDrop * cabinWellZ * tubMaskX;
      }
      const fBlister =
        (archBlisterOut(z, y, zRearAxle, yRearHub, rArchRearZ, rArchRearY, flareRearOut) +
          archBlisterOut(z, y, zFrontAxle, yFrontHub, rArchFrontZ, rArchFrontY, flareFrontOut)) *
        smoothstep(0.45, 0.95, t);
      halfPts[j] = [x + fBlister * 0.45, y + fBlister * 0.32];
    }

    // 2. Side skin from fender shoulder down to sill / wheel-arch opening (TOP_STEPS+1 .. TOP_STEPS+SIDE_STEPS)
    // CRITICAL CLASS-A WHEEL-ARCH BOSS & BUMPER WIDTH LAW:
    //   - Over open doors/bumpers (`spanY ~ 0.55..0.75 m`), side width swells smoothly from `xShoulder` to `xMaxBase`
    //     over the upper 14 cm (`dyShoulder = 0.14 m`) and holds ~97% full width right down to the valence.
    //   - Over wheel arches (`spanY ~ 0.05..0.22 m`), `dyShoulder = Math.min(0.14, spanY * 0.92)` guarantees that
    //     at `k = SIDE_STEPS` (`y = yArch`), `riseToMax = 1.0` EVERYWHERE around the 180-degree wheel arch!
    //     Result: ZERO concave bites in `ORTHO TOP` and a crisp constant-X vertical fender boss lip over all 4 tires!
    const [xTopEnd, yTopEnd] = halfPts[TOP_STEPS];
    const spanY = Math.max(0.030, yTopEnd - yLower);
    const fullSpanY = Math.max(0.14, yTopEnd - ySillBase);
    const dyShoulder = Math.max(0.024, polySmoothMin(0.14, spanY * 0.90, 0.048));
    const betweenAxles =
      smoothstep(zRearAxle + rArchRearZ * 0.85, zRearAxle + rArchRearZ * 1.25, z) *
      (1.0 - smoothstep(zFrontAxle - rArchFrontZ * 1.25, zFrontAxle - rArchFrontZ * 0.85, z));
    const behindRearWheel = 1.0 - smoothstep(zRearAxle - rArchRearZ * 1.18, zRearAxle - rArchRearZ * 0.88, z);
    const aheadFrontWheel = smoothstep(zFrontAxle + rArchFrontZ * 0.88, zFrontAxle + rArchFrontZ * 1.18, z);
    for (let k = 1; k <= SIDE_STEPS; k++) {
      const tSide = k / SIDE_STEPS; // 0 at shoulder -> 1 at lower edge / arch lip
      const vFrac = 0.5 * (1.0 - Math.cos(Math.PI * tSide));
      const y = yTopEnd - spanY * vFrac;
      const uBodyY = Math.min(1.0, Math.max(0.0, (yTopEnd - y) / fullSpanY));
      const uRise = Math.min(1.0, Math.max(0.0, (yTopEnd - y) / Math.max(0.022, dyShoulder)));

      const riseToMax = Math.sin(uRise * Math.PI * 0.5);
      const extraOverhangTuck =
        smoothstep(0.42, 1.0, uBodyY) *
        (rearOverhangLowerTuck * behindRearWheel + frontOverhangLowerTuck * aheadFrontWheel);
      const lowerTuck = smoothstep(0.58, 1.0, uBodyY) * (bumperLowerTuck + rockerTuck * betweenAxles) + extraOverhangTuck;
      let x = xTopEnd + (xMaxBase - xShoulder + sideBellyOut) * riseToMax - lowerTuck;

      if (sideScoopFn && sX > 0.85) {
        x -= sideScoopFn(z, uBodyY) * smoothstep(0.85, 0.99, sX);
      }

      const fBlister =
        archBlisterOut(z, y, zRearAxle, yRearHub, rArchRearZ, rArchRearY, flareRearOut) +
        archBlisterOut(z, y, zFrontAxle, yFrontHub, rArchFrontZ, rArchFrontY, flareFrontOut);
      x += fBlister;
      halfPts[TOP_STEPS + k] = [Math.max(0.0, x), y];
    }

    // 3. Rolled 24 mm sheet-metal return flange + subdivided underbody closure (TOP_STEPS+SIDE_STEPS+1 .. HALF_COLS)
    // CRITICAL OVERHANG DEPARTURE/APPROACH LAW: never clamp `yUnderCenter` down to `0.125 m` when `ySillBase` sweeps
    // upward under front splitters or rear diffusers (`0.18..0.34 m`), or a hanging boat keel ruins side/rear 3/4 views!
    const [xLip, yLip] = halfPts[TOP_STEPS + SIDE_STEPS];
    const xFlangeIn = Math.max(0.0, xLip - flangeDepth);
    const yUnderCenter = Math.max(0.08, ySillBase - 0.005);
    // Step 1: 4 mm vertical lip bead
    halfPts[TOP_STEPS + SIDE_STEPS + 1] = [Math.max(0.0, xLip - 0.005), yLip + (inArch ? 0.002 : -0.004)];
    // Step 2: Horizontal inward return flange (seals wheel arch thickness!)
    const yFlange = yLip + (inArch ? 0.008 : -0.006);
    halfPts[TOP_STEPS + SIDE_STEPS + 2] = [xFlangeIn, yFlange];
    // Steps 3 .. LIP_STEPS: Subdivided inward span to centerline underbody spine (x = 0)
    const xInnerTarget = inArch ? Math.max(0.0, xFlangeIn - 0.22) : 0.0;
    const yInnerTarget = inArch ? yLip + 0.016 : yUnderCenter;
    for (let m = 3; m < LIP_STEPS; m++) {
      const uLip = (m - 2) / (LIP_STEPS - 2);
      halfPts[TOP_STEPS + SIDE_STEPS + m] = [
        xFlangeIn * (1.0 - uLip) + xInnerTarget * uLip,
        yFlange * (1.0 - uLip) + yInnerTarget * uLip,
      ];
    }
    halfPts[HALF_COLS] = [0.0, yUnderCenter];

    // Apply Superellipsoid Plan-Wrap (`sX`) + Vertical Bullnose (`sY`) around front & rear bumpers!
    // Apex sits at bumper-beam height (`~0.54` rear, `~0.38` front) so longitudinal valence roll-under closes watertightly!
    const isRearHalf = z < 0.0;
    const yApexFrac = isRearHalf ? 0.68 : 0.42;
    const yApexStation = yApexFrac * halfPts[0][1] + (1.0 - yApexFrac) * halfPts[HALF_COLS][1];
    if (sX < 0.99999 || sY < 0.99999) {
      for (let c = 0; c <= HALF_COLS; c++) {
        halfPts[c] = [
          halfPts[c][0] * sX,
          yApexStation + (halfPts[c][1] - yApexStation) * sY,
        ];
      }
    }

    // Write +X half (0 .. HALF_COLS) and mirrored -X half (HALF_COLS+1 .. 2*HALF_COLS)
    const uCoord = (z - zRear) / Math.max(1e-5, L);
    const rearZone = rearValenceUndercut > 0.0005 ? 1.0 - smoothstep(zRear + 0.04, zRear + Math.max(0.28, rearWrapLen * 1.35), z) : 0.0;
    const frontZone = (frontNoseRound > 0.0005 || frontLowerUndercut > 0.0005)
      ? smoothstep(zFront - Math.max(0.30, frontWrapLen * 1.25), zFront - 0.03, z)
      : 0.0;

    for (let c = 0; c < ringCols; c++) {
      let px;
      let py;
      const baseIdx = c <= HALF_COLS ? c : c < ringCols - 1 ? HALF_COLS * 2 - c : 0;
      if (c <= HALF_COLS) {
        [px, py] = halfPts[c];
      } else if (c < ringCols - 1) {
        [px, py] = halfPts[baseIdx];
        px = -px;
      } else {
        [px, py] = halfPts[0];
      }

      // Optional stamped 3D fender headlamp pockets
      if (headlampSockets && headlampSockets.length > 0 && baseIdx <= TOP_STEPS + 4 && sX > 0.85) {
        for (let hs = 0; hs < headlampSockets.length; hs++) {
          const sock = headlampSockets[hs];
          const dx = (Math.abs(px) - sock.x) / Math.max(0.02, sock.rx || 0.13);
          const dz = (z - sock.z) / Math.max(0.02, sock.rz || 0.20);
          const r2 = dx * dx + dz * dz;
          if (r2 < 0.92) {
            const bowl = 1.0 - smoothstep(0.58, 0.92, Math.sqrt(r2));
            const depth = sock.depth ?? 0.052;
            const cup = bowl * (0.45 + 0.55 * Math.max(0.0, 1.0 - r2));
            py -= depth * cup;
            px -= Math.sign(px) * depth * 0.22 * cup;
          }
        }
      }

      // Optional precision NACA / rectangular clear-cover lamp pocket depressions on top/fender skin
      if (surfaceDepressionFn && baseIdx <= TOP_STEPS + 4 && sX > 0.82) {
        const dyDep = surfaceDepressionFn(Math.abs(px), py, z);
        if (dyDep > 0.0) {
          py -= dyDep * smoothstep(0.82, 0.96, sX);
        }
      }

      // Orthogonal Longitudinal `(Y, Z)` Bumper Profile Sculpting:
      // Preserves 100% square-shouldered `(X, Y)` `ORTHO FRONT`/`ORTHO REAR` silhouette while curving nose & lower rear valence in 3D!
      let pz = z;
      if (rearZone > 0.001 && py < yApexStation) {
        const uLow = Math.min(1.0, (yApexStation - py) / Math.max(0.14, yApexStation - yUnderCenter));
        pz += rearValenceUndercut * rearZone * uLow * uLow;
      }
      if (frontZone > 0.001) {
        if (py > yApexStation) {
          const uHigh = Math.min(1.0, (py - yApexStation) / Math.max(0.10, halfPts[0][1] - yApexStation + 0.06));
          pz -= frontNoseRound * frontZone * uHigh * uHigh;
        } else if (py < yApexStation) {
          const uChin = Math.min(1.0, (yApexStation - py) / Math.max(0.08, yApexStation - yUnderCenter));
          pz -= frontLowerUndercut * frontZone * uChin * uChin;
        }
      }

      const idx = r * ringCols + c;
      positions[idx * 3] = px;
      positions[idx * 3 + 1] = py;
      positions[idx * 3 + 2] = pz;
      uvs[idx * 2] = uCoord;
      uvs[idx * 2 + 1] = c / (ringCols - 1);
    }
  }

  const indices = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < ringCols - 1; c++) {
      const a = r * ringCols + c;
      const b = a + 1;
      const d = (r + 1) * ringCols + c;
      const e = d + 1;
      // Shortest-diagonal Delaunay quad triangulation eliminates sheared accordion creases around curved wheel arches!
      const dxAE = positions[a * 3] - positions[e * 3];
      const dyAE = positions[a * 3 + 1] - positions[e * 3 + 1];
      const dzAE = positions[a * 3 + 2] - positions[e * 3 + 2];
      const dxBD = positions[b * 3] - positions[d * 3];
      const dyBD = positions[b * 3 + 1] - positions[d * 3 + 1];
      const dzBD = positions[b * 3 + 2] - positions[d * 3 + 2];
      const len2AE = dxAE * dxAE + dyAE * dyAE + dzAE * dzAE;
      const len2BD = dxBD * dxBD + dyBD * dyBD + dzBD * dzBD;
      if (len2AE < len2BD * 0.98) {
        indices.push(a, d, e);
        indices.push(a, e, b);
      } else {
        indices.push(a, d, b);
        indices.push(b, d, e);
      }
    }
  }

  const rawGeo = new THREE.BufferGeometry();
  rawGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  rawGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  rawGeo.setIndex(indices);

  return computeCreasedVertexNormals(rawGeo, smoothDeg, hardDeg);
}

/**
 * Exact closed-form Z coordinate and yaw tangent angle on the superellipsoid bumper skin:
 *   `dirSign = +1` for front bumper (`zTip = zFront`), `dirSign = -1` for rear bumper (`zTip = zRear`).
 */
export function evalSuperellipseBumperZ(x, halfW, zTip, wrapLen, pPlan = 2.25, dirSign = 1) {
  const uLat = Math.min(0.996, Math.abs(x) / Math.max(0.10, halfW));
  const inside = Math.max(0.0, 1.0 - Math.pow(uLat, pPlan));
  const zFrac = Math.pow(inside, 1.0 / pPlan);
  return zTip - dirSign * wrapLen + dirSign * wrapLen * zFrac;
}

/**
 * Builds a complete, flush-glazed automotive Greenhouse Assembly:
 *   - Crowned roof panel (body paint OR panoramic gloss-black glass),
 *   - 3D structural A-pillars, roof cantrails, B-pillars, and sculpted C-pillar sail panels,
 *   - Flush curved Front Windshield, Left/Right Side DLO Glass, and Rear Backlight Glass
 *     (all with normalized `[0, 1]^2` UVs so ceramic-frit borders frame each pane cleanly!),
 *   - Satin-black 3D perimeter weatherstrip moldings around the side DLO openings.
 */
export function buildFlushGreenhouseAssembly({
  zWindshieldBase = 0.76,
  zRoofFront = 0.14,
  zRoofRear = -0.56,
  zBacklightBase = -1.56,
  zBPillar = -0.18,
  zDloRearTip = -1.08,
  yBeltFn = null,       // fn(z) -> beltline Y where greenhouse meets lower body
  xBeltFn = null,       // fn(z) -> beltline half-width X
  yRoofProfile = null,  // [[z, y], ...] along outer cantrail from zBacklightBase to zWindshieldBase
  xRoofProfile = null,  // [[z, x], ...] half-width of roof cantrail
  roofCrown = 0.018,
  aPillarWidth = 0.058,
  cantrailWidth = 0.046,
  cPillarSailWidth = 0.14,
  cantrailArchTopFrac = 0.745,
  cPillarCrown = 0.0,
  glassInset = 0.004,
  panoramicRoof = false,
  windshieldHeaderFrac = null,
  rearLouvers = 0,      // > 0 builds slotted supercar Lexan rear engine cover louvers (e.g. F40!)
  paintMaterial,
  glassMaterial,
  trimMaterial,
} = {}) {
  const group = new THREE.Group();
  group.name = 'GreenhouseGroup';
  const wsHeaderFrac = windshieldHeaderFrac ?? (panoramicRoof ? 0.085 : 0.135);

  const evalBeltY =
    typeof yBeltFn === 'function'
      ? yBeltFn
      : createMonotoneCubicSpline(
          [zBacklightBase, -0.8, 0.0, zWindshieldBase],
          [0.88, 0.90, 0.87, 0.84],
        );
  const evalBeltX =
    typeof xBeltFn === 'function'
      ? xBeltFn
      : createMonotoneCubicSpline(
          [zBacklightBase, -0.8, 0.0, zWindshieldBase],
          [0.64, 0.78, 0.81, 0.74],
        );

  const defaultRoofY = [
    [zBacklightBase, evalBeltY(zBacklightBase) + 0.005],
    [0.5 * (zBacklightBase + zRoofRear), 0.5 * (evalBeltY(zBacklightBase) + 1.24) + 0.04],
    [zRoofRear, 1.255],
    [0.5 * (zRoofRear + zRoofFront), 1.285],
    [zRoofFront, 1.265],
    [0.5 * (zRoofFront + zWindshieldBase), 0.5 * (1.265 + evalBeltY(zWindshieldBase)) + 0.025],
    [zWindshieldBase, evalBeltY(zWindshieldBase) + 0.004],
  ];
  const defaultRoofX = [
    [zBacklightBase, evalBeltX(zBacklightBase) * 0.82],
    [zRoofRear, 0.585],
    [0.0, 0.605],
    [zRoofFront, 0.595],
    [zWindshieldBase, evalBeltX(zWindshieldBase) * 0.92],
  ];

  const roofYPts = (yRoofProfile || defaultRoofY).slice().sort((a, b) => a[0] - b[0]);
  const roofXPts = (xRoofProfile || defaultRoofX).slice().sort((a, b) => a[0] - b[0]);
  const evalRoofY = createMonotoneCubicSpline(roofYPts.map((p) => p[0]), roofYPts.map((p) => p[1]));
  const evalRoofX = createMonotoneCubicSpline(roofXPts.map((p) => p[0]), roofXPts.map((p) => p[1]));

  const matTrim =
    trimMaterial ||
    new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.42,
      metalness: 0.15,
    });
  matTrim.userData.carRole = matTrim.userData.carRole || 'trim';

  // Helper to build a parametric quad patch (rows x cols) with exact [0,1]^2 UVs and guaranteed outward winding!
  function buildRawPatch(rows, cols, evalPt, outwardDir = [0, 1, 0]) {
    const pos = new Float32Array((rows + 1) * (cols + 1) * 3);
    const uv = new Float32Array((rows + 1) * (cols + 1) * 2);
    for (let r = 0; r <= rows; r++) {
      const v = r / rows;
      for (let c = 0; c <= cols; c++) {
        const u = c / cols;
        const p = evalPt(u, v);
        const idx = r * (cols + 1) + c;
        pos[idx * 3] = p[0];
        pos[idx * 3 + 1] = p[1];
        pos[idx * 3 + 2] = p[2];
        uv[idx * 2] = u;
        uv[idx * 2 + 1] = v;
      }
    }
    const mr = Math.min(rows - 1, Math.floor(rows * 0.5));
    const mc = Math.min(cols - 1, Math.floor(cols * 0.5));
    const ia = (mr * (cols + 1) + mc) * 3;
    const ib = (mr * (cols + 1) + mc + 1) * 3;
    const id = ((mr + 1) * (cols + 1) + mc) * 3;
    const ux = pos[ib] - pos[ia];
    const uy = pos[ib + 1] - pos[ia + 1];
    const uz = pos[ib + 2] - pos[ia + 2];
    const vx = pos[id] - pos[ia];
    const vy = pos[id + 1] - pos[ia + 1];
    const vz = pos[id + 2] - pos[ia + 2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const flipWinding = nx * outwardDir[0] + ny * outwardDir[1] + nz * outwardDir[2] < 0.0;

    const ind = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = r * (cols + 1) + c;
        const b = a + 1;
        const d = (r + 1) * (cols + 1) + c;
        const e = d + 1;
        if (!flipWinding) {
          ind.push(a, b, d, b, e, d);
        } else {
          ind.push(a, d, b, b, d, e);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(ind);
    g.computeVertexNormals();
    return g;
  }

  function buildPatch(rows, cols, evalPt, outwardDir = [0, 1, 0], smoothAngle = 14.0) {
    return computeCreasedVertexNormals(buildRawPatch(rows, cols, evalPt, outwardDir), smoothAngle, 42.0);
  }

  // Shared top-deck half-span helper so roof, windshield, backlight, and side A/C pillars meet with 0 mm seam!
  function evalTopDeckSpanX(z) {
    if (z >= zRoofFront) {
      const v = clamp01((z - zRoofFront) / Math.max(1e-4, zWindshieldBase - zRoofFront));
      return evalRoofX(z) - aPillarWidth * (0.68 + 0.14 * v);
    }
    if (z <= zRoofRear) {
      const v = clamp01((z - zBacklightBase) / Math.max(1e-4, zRoofRear - zBacklightBase));
      const sailTaper = cPillarSailWidth * (1.0 - 0.62 * v);
      return Math.max(0.24, evalRoofX(z) - sailTaper * 0.65);
    }
    return evalRoofX(z) - cantrailWidth * 0.65;
  }

  function evalTopDeckZBow(z, sym) {
    const archFactor = 1.0 - sym * sym;
    if (z >= zRoofFront) {
      const v = clamp01((z - zRoofFront) / Math.max(1e-4, zWindshieldBase - zRoofFront));
      return 0.048 * archFactor * Math.sin(v * Math.PI);
    }
    if (z <= zRoofRear) {
      const v = clamp01((z - zBacklightBase) / Math.max(1e-4, zRoofRear - zBacklightBase));
      return -0.028 * archFactor * Math.sin(v * Math.PI);
    }
    return 0.0;
  }

  // 1. Crowned Roof Panel:
  //    - Solid roof (`panoramicRoof = false`): full body-painted roof skin.
  //    - Panoramic glass roof (`panoramicRoof = true`, e.g. Porsche 992): deep liquid-obsidian center glass panel
  //      framed by body-colored outer roof cantrail rails (`|sym| >= 0.78`) AND a body-colored rear transverse
  //      roof header bridge (`zRoofRear .. zRoofRear + 0.095`) separating the sunroof from the rear backlight!
  if (panoramicRoof) {
    const matPanoRoof = new THREE.MeshPhysicalMaterial({
      color: 0x020305,
      metalness: 0.0,
      roughness: 0.010,
      specularIntensity: 0.58,
      clearcoat: 1.0,
      clearcoatRoughness: 0.006,
    });
    matPanoRoof.userData.carRole = 'paint';

    const zBridgeEnd = zRoofRear + Math.min(0.105, (zRoofFront - zRoofRear) * 0.18);
    const zFrontBridgeStart = zRoofFront - Math.min(0.075, (zRoofFront - zRoofRear) * 0.14);
    const panoGlassGeo = buildPatch(18, 20, (u, v) => {
      const z = zBridgeEnd - 0.004 + (zFrontBridgeStart + 0.004 - (zBridgeEnd - 0.004)) * v;
      const sym = (u - 0.5) * 2.0 * 0.78;
      const xr = evalTopDeckSpanX(z) + 0.004;
      const yr = evalRoofY(z) + roofCrown * (1.0 - sym * sym);
      return [sym * xr, yr, z];
    }, [0, 1, 0]);
    const panoMesh = new THREE.Mesh(panoGlassGeo, matPanoRoof);
    panoMesh.name = 'RoofCrownPanel';
    panoMesh.castShadow = true;
    panoMesh.receiveShadow = true;
    group.add(panoMesh);

    const roofFrameRaw = [];
    // Rear transverse painted roof bridge between panoramic sunroof and rear backlight!
    roofFrameRaw.push(
      buildRawPatch(8, 22, (u, v) => {
        const z = zRoofRear - 0.012 + (zBridgeEnd - (zRoofRear - 0.012)) * v;
        const sym = (u - 0.5) * 2.0;
        const xr = evalTopDeckSpanX(z) + 0.004;
        const yr = evalRoofY(z) + roofCrown * (1.0 - sym * sym) + 0.0006;
        return [sym * xr, yr, z];
      }, [0, 1, 0]),
    );
    // Front transverse painted roof & upper windshield header bridge (`zFrontBridgeStart -> wsHeaderFrac` down windshield!)
    const zWsHeaderEnd = zRoofFront + (zWindshieldBase - zRoofFront) * wsHeaderFrac;
    roofFrameRaw.push(
      buildRawPatch(10, 24, (u, v) => {
        const z = zFrontBridgeStart + (zWsHeaderEnd - zFrontBridgeStart) * v;
        const sym = (u - 0.5) * 2.0;
        const xr = evalTopDeckSpanX(z) + 0.004;
        const vWs = Math.max(0.0, (z - zRoofFront) / Math.max(1e-4, zWindshieldBase - zRoofFront));
        const barrel = (roofCrown + 0.014 * Math.sin(vWs * Math.PI)) * (1.0 - sym * sym);
        return [sym * xr, evalRoofY(z) + barrel + 0.0006, z + evalTopDeckZBow(z, sym)];
      }, [0, 1, 0.25]),
    );
    // Left & right painted outer roof cantrail strips flanking the panoramic glass!
    for (const rSide of [-1, 1]) {
      roofFrameRaw.push(
        buildRawPatch(16, 6, (u, v) => {
          const z = zBridgeEnd - 0.006 + (zFrontBridgeStart + 0.006 - (zBridgeEnd - 0.006)) * v;
          const sym = rSide * (0.775 + 0.225 * u);
          const xr = evalTopDeckSpanX(z) + 0.004;
          const yr = evalRoofY(z) + roofCrown * (1.0 - sym * sym) + 0.0006;
          return [sym * xr, yr, z];
        }, [0, 1, 0]),
      );
    }
    const roofFrameMesh = new THREE.Mesh(
      computeCreasedVertexNormals(safeMergeGeometries(roofFrameRaw), 18.0, 44.0),
      paintMaterial,
    );
    roofFrameMesh.castShadow = true;
    roofFrameMesh.receiveShadow = true;
    group.add(roofFrameMesh);
  } else {
    // Solid body-colored roof panel continuing smoothly over `zRoofFront -> zWsHeaderEnd` so steep supercar windshields
    // (e.g., Ferrari F40) ALWAYS exhibit a proud painted front windshield header crown instead of looking like a glass Targa!
    const zWsHeaderEnd = zRoofFront + (zWindshieldBase - zRoofFront) * wsHeaderFrac;
    const roofGeo = buildPatch(28, 28, (u, v) => {
      const zA = zRoofRear - 0.012;
      const zB = zWsHeaderEnd + 0.004;
      const z = zA + (zB - zA) * v;
      const sym = (u - 0.5) * 2.0;
      const xr = evalTopDeckSpanX(z) + 0.004;
      const vWs = Math.max(0.0, (z - zRoofFront) / Math.max(1e-4, zWindshieldBase - zRoofFront));
      const barrel = (roofCrown + 0.014 * Math.sin(vWs * Math.PI)) * (1.0 - sym * sym);
      return [sym * xr, evalRoofY(z) + barrel, z + evalTopDeckZBow(z, sym)];
    }, [0, 1, 0.15]);
    const roofMesh = new THREE.Mesh(roofGeo, paintMaterial);
    roofMesh.name = 'RoofCrownPanel';
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    group.add(roofMesh);
  }

  // Dark headliner underside extending under the front windshield header so upward/front cabin views never see sky!
  const zHeadlinerFront = zRoofFront + (zWindshieldBase - zRoofFront) * wsHeaderFrac;
  const headlinerGeo = buildPatch(14, 14, (u, v) => {
    const z = zRoofRear + (zHeadlinerFront - zRoofRear) * v;
    const sym = (u - 0.5) * 2.0;
    const xr = evalTopDeckSpanX(z) * 0.96;
    const yr = evalRoofY(z) + roofCrown * (1.0 - sym * sym) - 0.016;
    return [sym * xr, yr, z + evalTopDeckZBow(z, sym)];
  }, [0, -1, 0]);
  const matInteriorDark = new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.90, metalness: 0.0 });
  matInteriorDark.userData.carRole = 'matte_interior';
  group.add(new THREE.Mesh(headlinerGeo, matInteriorDark));

  // Upper windshield weatherstrip seal (`14 mm` dark rubber molding right below the painted front roof header!)
  {
    const zSeal0 = zRoofFront + (zWindshieldBase - zRoofFront) * Math.max(0.0, wsHeaderFrac - 0.006);
    const zSeal1 = zRoofFront + (zWindshieldBase - zRoofFront) * Math.min(1.0, wsHeaderFrac + 0.016);
    const wsSealGeo = buildPatch(4, 24, (u, v) => {
      const z = zSeal0 + (zSeal1 - zSeal0) * v;
      const sym = (u - 0.5) * 2.0;
      const xr = evalTopDeckSpanX(z) + 0.0035;
      const vWs = (z - zRoofFront) / Math.max(1e-4, zWindshieldBase - zRoofFront);
      const barrel = (roofCrown * 1.04 + 0.014 * Math.sin(vWs * Math.PI)) * (1.0 - sym * sym);
      return [sym * xr, evalRoofY(z) - glassInset * 0.35 + barrel, z + evalTopDeckZBow(z, sym)];
    }, [0, 1, 0.45]);
    group.add(new THREE.Mesh(wsSealGeo, matTrim));
  }

  // 2. Curved Front Windshield (`wsHeaderFrac -> 1.0` down to `zWindshieldBase`)
  const wsGeo = buildPatch(22, 28, (u, v) => {
    const vFull = wsHeaderFrac + (1.0 - wsHeaderFrac) * v;
    const z = zRoofFront + (zWindshieldBase - zRoofFront) * vFull;
    const sym = (u - 0.5) * 2.0;
    const halfSpan = evalTopDeckSpanX(z) + 0.003;
    const x = sym * halfSpan;
    const yBase = evalRoofY(z) - glassInset;
    const barrel = (roofCrown * 1.05 + 0.014 * Math.sin(vFull * Math.PI)) * (1.0 - sym * sym);
    return [x, yBase + barrel, z + evalTopDeckZBow(z, sym)];
  }, [0, 1, 0.45]);
  const wsMesh = new THREE.Mesh(wsGeo, glassMaterial);
  wsMesh.name = 'FrontWindshieldGlass';
  wsMesh.renderOrder = 4;
  group.add(wsMesh);

  // 3. Curved Rear Backlight Glass (zBacklightBase -> zRoofRear)
  const blGeo = buildPatch(22, 26, (u, v) => {
    const z = zBacklightBase + (zRoofRear - zBacklightBase) * v;
    const sym = (u - 0.5) * 2.0;
    const halfSpan = evalTopDeckSpanX(z) + 0.003;
    const x = sym * halfSpan;
    const yBase = evalRoofY(z) - glassInset;
    const barrel = roofCrown * 0.9 * (1.0 - sym * sym);
    return [x, yBase + barrel, z + evalTopDeckZBow(z, sym)];
  }, [0, 1, -0.45]);
  const blMesh = new THREE.Mesh(blGeo, glassMaterial);
  blMesh.name = 'RearBacklightGlass';
  blMesh.renderOrder = 4;
  group.add(blMesh);

  // Optional Supercar Slotted Rear Engine Louvers (e.g., Ferrari F40 Lexan cover)
  if (rearLouvers > 0) {
    const louverGeos = [];
    for (let i = 0; i < rearLouvers; i++) {
      const f = (i + 1) / (rearLouvers + 1);
      const zL = zBacklightBase + (zRoofRear - zBacklightBase) * (0.12 + 0.76 * f);
      const yL = evalRoofY(zL) + roofCrown * 0.55 - 0.004;
      const wL = Math.max(0.22, evalTopDeckSpanX(zL) * 0.76);
      for (const side of [-1, 1]) {
        const slat = new THREE.BoxGeometry(wL * 0.39, 0.004, 0.026);
        slat.rotateX(-0.18);
        slat.translate(side * (wL * 0.49), yL, zL);
        louverGeos.push(slat);
      }
    }
    if (louverGeos.length) {
      const mLouvers = new THREE.Mesh(safeMergeGeometries(louverGeos), matTrim);
      mLouvers.name = 'RearWindowLouvers';
      group.add(mLouvers);
    }
  }

  // 4. Unified Welded Coachbuilt Side Greenhouse (C-Pillar Sail + Cantrail Arch + Sculpted A-Pillar + Flush Curved DLO)
  const dloZFront = zWindshieldBase - Math.max(0.135, aPillarWidth * 2.4);
  const dloZRear = zDloRearTip;

  function evalDloBounds(z) {
    const u = clamp01((z - dloZRear) / Math.max(1e-4, dloZFront - dloZRear));
    const hTopArch = cantrailArchTopFrac;
    const rearT = clamp01((z - dloZRear) / 0.42);
    const frontT = clamp01((dloZFront - z) / 0.12);
    const hBot = 0.044 + 0.135 * Math.pow(1.0 - rearT, 1.85);
    const pinch = Math.pow(Math.sin(rearT * Math.PI * 0.5), 0.68) * Math.pow(Math.sin(frontT * Math.PI * 0.5), 0.42);
    const hTop = hBot + Math.max(0.0, hTopArch - hBot) * pinch;
    return [hBot, hTop, u];
  }

  function evalSidePoint(sideSign, z, hFrac, inset = 0.0) {
    const yBot = evalBeltY(z) - 0.012;
    const yTop = evalRoofY(z);
    const xBot = evalBeltX(z) + 0.004;
    const xTop = evalTopDeckSpanX(z);
    // Taut blueprint-accurate automotive tumblehome (`9 mm` barrel camber + optional convex fastback C-pillar crown!)
    const wSail = cPillarCrown > 0.0 ? clamp01((dloZRear + 0.18 - z) / Math.max(0.20, dloZRear + 0.18 - zBacklightBase)) : 0.0;
    const sailCrown = cPillarCrown * wSail * Math.sin(hFrac * Math.PI);
    const bow = Math.sin(hFrac * Math.PI) * 0.009 + sailCrown;
    const topFillet = Math.pow(hFrac, 5.0) * 0.010;
    const x = (xBot * (1.0 - hFrac) + xTop * hFrac + bow - topFillet - inset) * sideSign;
    const y = yBot * (1.0 - hFrac) + yTop * hFrac + Math.sin(hFrac * Math.PI) * 0.006 + sailCrown * 0.55;
    return [x, y, z];
  }

  const BOT_ROWS = 8;
  const TOP_ROWS = 12;
  const TOTAL_SIDE_ROWS = BOT_ROWS + TOP_ROWS;
  const [hSplitRear] = evalDloBounds(dloZRear);
  const [hSplitFront] = evalDloBounds(dloZFront);
  function splitPiecewiseH(v, hSplit) {
    const row = v * TOTAL_SIDE_ROWS;
    if (row <= BOT_ROWS) return hSplit * (row / BOT_ROWS);
    return hSplit + (1.0 - hSplit) * ((row - BOT_ROWS) / TOP_ROWS);
  }

  for (const sideSign of [1, -1]) {
    const sideOut = [sideSign, 0.55, 0.0];
    const sideRawParts = [];

    // 4a-1. Sweeping Painted C-Pillar Quarter Sail (`zBacklightBase .. dloZRear`, 0.0 mm T-junction-free vertex weld at `z = dloZRear`!)
    sideRawParts.push(
      buildRawPatch(TOTAL_SIDE_ROWS, 26, (u, v) => {
        const z = zBacklightBase + (dloZRear - zBacklightBase) * u;
        const hFrac = (1.0 - u) * v + u * splitPiecewiseH(v, hSplitRear);
        return evalSidePoint(sideSign, z, hFrac, 0.0);
      }, sideOut),
    );

    // 4a-2. Continuous Painted Roof Cantrail Arch (`dloZRear .. dloZFront`, `hFrac in [hTop, 1]`)
    sideRawParts.push(
      buildRawPatch(TOP_ROWS, 48, (u, v) => {
        const z = dloZRear + (dloZFront - dloZRear) * u;
        const [, hTop] = evalDloBounds(z);
        const hFrac = hTop + (1.0 - hTop) * v;
        const crownOut = -0.0035 * Math.sin(v * Math.PI) * Math.sin(u * Math.PI);
        return evalSidePoint(sideSign, z, hFrac, crownOut);
      }, sideOut),
    );

    // 4a-3. Sculpted Painted A-Pillar Post (`dloZFront .. zWindshieldBase`, 0.0 mm T-junction-free vertex weld at `z = dloZFront`!)
    sideRawParts.push(
      buildRawPatch(TOTAL_SIDE_ROWS, 18, (u, v) => {
        const z = dloZFront + (zWindshieldBase - dloZFront) * u;
        const hFrac = (1.0 - u) * splitPiecewiseH(v, hSplitFront) + u * v;
        const crownOut = -0.0035 * Math.sin(u * Math.PI);
        return evalSidePoint(sideSign, z, hFrac, crownOut);
      }, sideOut),
    );

    // 4a-4. Body-Colored Beltline Sill Skirt beneath DLO window (`hFrac in [0, hBot]`)
    sideRawParts.push(
      buildRawPatch(BOT_ROWS, 48, (u, v) => {
        const z = dloZRear + (dloZFront - dloZRear) * u;
        const [hBot] = evalDloBounds(z);
        const hFrac = hBot * v;
        return evalSidePoint(sideSign, z, hFrac, 0.0);
      }, sideOut),
    );

    const sideFrameGeo = computeCreasedVertexNormals(safeMergeGeometries(sideRawParts), 24.0, 52.0);
    const sideFrameMesh = new THREE.Mesh(sideFrameGeo, paintMaterial);
    sideFrameMesh.castShadow = true;
    sideFrameMesh.receiveShadow = true;
    group.add(sideFrameMesh);

    // 4b. Flush Curved Tumblehome Side DLO Glass Pane (catches overhead showroom ceiling spots naturally!)
    const dloGeo = buildPatch(18, 40, (u, v) => {
      const z = dloZRear + (dloZFront - dloZRear) * u;
      const [hBot, hTop] = evalDloBounds(z);
      const hFrac = hBot + (hTop - hBot) * v;
      const domeInset = glassInset - 0.009 * Math.sin(v * Math.PI) * Math.sin(u * Math.PI);
      return evalSidePoint(sideSign, z, hFrac, domeInset);
    }, sideOut);
    const dloMesh = new THREE.Mesh(dloGeo, glassMaterial);
    dloMesh.name = sideSign > 0 ? 'SideDloGlassL' : 'SideDloGlassR';
    dloMesh.renderOrder = 4;
    group.add(dloMesh);

    // 4c. Recessed Gloss/Satin-Black B-Pillar Post inside DLO
    if (zBPillar > dloZRear + 0.15 && zBPillar < dloZFront - 0.15) {
      const bGeo = buildPatch(8, 4, (u, v) => {
        const z = zBPillar + (u - 0.5) * 0.056;
        const [hBot, hTop] = evalDloBounds(z);
        const hFrac = hBot + (hTop - hBot) * v;
        return evalSidePoint(sideSign, z, hFrac, glassInset + 0.004);
      }, sideOut);
      group.add(new THREE.Mesh(bGeo, matTrim));
    }

    // 4d. Crisp 3D Perimeter Weatherstrip / Beltline Molding Tube around DLO
    const loopPts = [];
    const N_MOLD = 38;
    for (let i = 0; i <= N_MOLD; i++) {
      const u = i / N_MOLD;
      const z = dloZRear + (dloZFront - dloZRear) * u;
      const [hBot] = evalDloBounds(z);
      const p = evalSidePoint(sideSign, z, hBot, 0.001);
      loopPts.push(new THREE.Vector3(p[0], p[1], p[2]));
    }
    for (let i = N_MOLD; i >= 0; i--) {
      const u = i / N_MOLD;
      const z = dloZRear + (dloZFront - dloZRear) * u;
      const [, hTop] = evalDloBounds(z);
      const p = evalSidePoint(sideSign, z, hTop, 0.001);
      loopPts.push(new THREE.Vector3(p[0], p[1], p[2]));
    }
    const curve = new THREE.CatmullRomCurve3(loopPts, true);
    const tubeGeo = new THREE.TubeGeometry(curve, 92, 0.0065, 8, true);
    group.add(new THREE.Mesh(tubeGeo, matTrim));
  }

  return group;
}

function clamp01(x) {
  return Math.max(0.0, Math.min(1.0, x));
}

/**
 * Builds a complete, recognizable 3D Cabin Interior so views through the windshield,
 * side DLO glass, and rear window reveal authentic seats, bolsters, harnesses, dashboard,
 * gauge binnacle, 3-spoke steering wheel, center console, and interior rear-view mirror.
 */
export function buildDetailedCabinInterior({
  seatColor = 0x1a1c20,
  seatAccentColor = null, // e.g. 0xb01818 for Ferrari F40 red cloth seats!
  harnessColor = null,    // e.g. 0xe0b818 for yellow racing harnesses
  dashColor = 0x121418,
  zSeat = -0.18,
  zDash = 0.52,
  yFloor = 0.24,
  yBelt = 0.85,
  cabinHalfWidth = 0.68,
  roofMirrorPos = [0.0, 1.18, 0.24],
} = {}) {
  const cabin = new THREE.Group();
  cabin.name = 'CabinInteriorGroup';

  const matCarpet = new THREE.MeshStandardMaterial({ color: 0x0b0c0f, roughness: 0.94, metalness: 0.0 });
  matCarpet.userData.carRole = 'matte_interior';

  const matDash = new THREE.MeshStandardMaterial({ color: dashColor, roughness: 0.62, metalness: 0.05 });
  matDash.userData.carRole = 'matte_interior';

  const matSeat = new THREE.MeshStandardMaterial({
    color: seatAccentColor ?? seatColor,
    roughness: seatAccentColor ? 0.78 : 0.52,
    metalness: 0.02,
  });
  matSeat.userData.carRole = 'matte_interior';

  const matAlum = new THREE.MeshStandardMaterial({ color: 0xb8c0c8, roughness: 0.28, metalness: 0.85 });
  matAlum.userData.carRole = 'alloy';

  // 1. Cabin Tub Floor, Firewall, Rear Bulkhead & Door Inner Cards (prevents any light leak!)
  const tubParts = [];
  const floorPan = new THREE.BoxGeometry(cabinHalfWidth * 1.98, 0.04, 1.85);
  floorPan.translate(0, yFloor, zSeat + 0.15);
  tubParts.push(floorPan);

  const rearShelf = new THREE.BoxGeometry(cabinHalfWidth * 1.92, 0.42, 0.68);
  rearShelf.translate(0, yFloor + 0.36, zSeat - 0.68);
  tubParts.push(rearShelf);

  // Sculpted 2+2 fastback rear parcel shelf extending to `zSeat - 1.44` so coupe backlights never expose bare body metal!
  const parcelDeck = new THREE.BoxGeometry(cabinHalfWidth * 1.78, 0.28, 0.64);
  parcelDeck.rotateX(-0.24);
  parcelDeck.translate(0, yBelt - 0.10, zSeat - 1.14);
  tubParts.push(parcelDeck);

  const firewall = new THREE.BoxGeometry(cabinHalfWidth * 1.94, yBelt - yFloor + 0.04, 0.12);
  firewall.translate(0, 0.5 * (yFloor + yBelt), zDash + 0.24);
  tubParts.push(firewall);

  for (const s of [-1, 1]) {
    const doorCard = new THREE.BoxGeometry(0.06, yBelt - yFloor - 0.02, 1.38);
    doorCard.translate(s * (cabinHalfWidth - 0.02), 0.5 * (yFloor + yBelt) - 0.02, zSeat + 0.16);
    tubParts.push(doorCard);
  }
  cabin.add(new THREE.Mesh(safeMergeGeometries(tubParts), matCarpet));

  // 2. Sculpted Dashboard, Driver Gauge Binnacle, Infotainment & Center Console Tunnel
  const dashParts = [];
  const dashTop = new THREE.CylinderGeometry(0.16, 0.18, cabinHalfWidth * 1.90, 16, 1, false, 0, Math.PI);
  dashTop.rotateZ(Math.PI * 0.5);
  dashTop.scale(1.0, 0.72, 1.35);
  dashTop.translate(0, yBelt - 0.07, zDash);
  dashParts.push(dashTop);

  // Driver instrument hood binnacle (+X = LHD left side)
  const xDriver = cabinHalfWidth * 0.50;
  const binnacle = new THREE.CylinderGeometry(0.115, 0.125, 0.24, 18, 1, false, 0, Math.PI);
  binnacle.rotateX(Math.PI * 0.5 - 0.18);
  binnacle.translate(xDriver, yBelt - 0.02, zDash - 0.06);
  dashParts.push(binnacle);

  // Center console tunnel
  const consoleBox = new THREE.BoxGeometry(0.21, 0.24, 1.18);
  consoleBox.translate(0, yFloor + 0.14, zSeat + 0.20);
  dashParts.push(consoleBox);

  cabin.add(new THREE.Mesh(safeMergeGeometries(dashParts), matDash));

  // 3. Tilted 3-Spoke Sport Steering Wheel + Column + Shifter
  const steerGroup = new THREE.Group();
  steerGroup.position.set(xDriver, yBelt - 0.055, zDash - 0.22);
  steerGroup.rotation.x = -0.36;

  const rimGeo = new THREE.TorusGeometry(0.168, 0.017, 12, 36);
  const bossGeo = new THREE.CylinderGeometry(0.052, 0.058, 0.045, 18);
  bossGeo.rotateX(Math.PI * 0.5);
  const colGeo = new THREE.CylinderGeometry(0.036, 0.042, 0.24, 14);
  colGeo.rotateX(Math.PI * 0.5);
  colGeo.translate(0, 0, 0.12);
  steerGroup.add(new THREE.Mesh(safeMergeGeometries([rimGeo, bossGeo, colGeo]), matDash));

  const spokeParts = [];
  for (const ang of [0, (2.0 * Math.PI) / 3.0, (4.0 * Math.PI) / 3.0]) {
    const sp = new THREE.BoxGeometry(0.022, 0.145, 0.012);
    sp.translate(0, -0.075, 0);
    sp.rotateZ(ang);
    spokeParts.push(sp);
  }
  const shiftStalk = new THREE.CylinderGeometry(0.008, 0.010, 0.14, 10);
  shiftStalk.translate(-xDriver, -0.22, -0.04);
  spokeParts.push(shiftStalk);
  steerGroup.add(new THREE.Mesh(safeMergeGeometries(spokeParts), matAlum));
  cabin.add(steerGroup);

  // 4. Two Sculpted Bolstered Sport Bucket Seats (+X and -X)
  const seatParts = [];
  const harnessParts = [];
  for (const s of [-1, 1]) {
    const sx = s * cabinHalfWidth * 0.50;
    // Seat cushion + thigh bolsters
    const cushion = new THREE.BoxGeometry(0.42, 0.09, 0.46);
    cushion.rotateX(-0.08);
    cushion.translate(sx, yFloor + 0.12, zSeat + 0.10);
    seatParts.push(cushion);

    for (const bs of [-1, 1]) {
      const thighBolster = new THREE.CylinderGeometry(0.045, 0.048, 0.44, 10);
      thighBolster.rotateX(Math.PI * 0.5 - 0.08);
      thighBolster.translate(sx + bs * 0.20, yFloor + 0.16, zSeat + 0.10);
      seatParts.push(thighBolster);

      const sideBolster = new THREE.CylinderGeometry(0.042, 0.055, 0.56, 10);
      sideBolster.rotateX(-0.30);
      sideBolster.translate(sx + bs * 0.195, yFloor + 0.42, zSeat - 0.12);
      seatParts.push(sideBolster);
    }

    // Reclined backrest + integrated headrest shell
    const backrest = new THREE.BoxGeometry(0.36, 0.56, 0.085);
    backrest.rotateX(-0.30);
    backrest.translate(sx, yFloor + 0.43, zSeat - 0.13);
    seatParts.push(backrest);

    const headrest = new THREE.CylinderGeometry(0.095, 0.125, 0.24, 14);
    headrest.scale(1.05, 1.0, 0.52);
    headrest.rotateX(-0.22);
    headrest.translate(sx, yFloor + 0.76, zSeat - 0.23);
    seatParts.push(headrest);

    if (harnessColor !== null) {
      // Authentic motorsport shoulder pass-through grommet slots near upper backrest (`zero full-height zebra stripes!`)
      for (const hs of [-1, 1]) {
        const grommet = new THREE.BoxGeometry(0.052, 0.036, 0.092);
        grommet.rotateX(-0.30);
        grommet.translate(sx + hs * 0.072, yFloor + 0.62, zSeat - 0.19);
        harnessParts.push(grommet);
      }
    }
  }
  cabin.add(new THREE.Mesh(safeMergeGeometries(seatParts), matSeat));

  if (harnessParts.length) {
    const matHarness = new THREE.MeshStandardMaterial({ color: harnessColor, roughness: 0.65, metalness: 0.0 });
    matHarness.userData.carRole = 'matte_interior';
    cabin.add(new THREE.Mesh(safeMergeGeometries(harnessParts), matHarness));
  }

  // 5. Interior Rear-View Mirror on Upper Windshield
  if (roofMirrorPos) {
    const mirStalk = new THREE.CylinderGeometry(0.007, 0.007, 0.065, 8);
    mirStalk.rotateX(0.45);
    mirStalk.translate(roofMirrorPos[0], roofMirrorPos[1] + 0.025, roofMirrorPos[2] + 0.015);
    const mirBody = new THREE.BoxGeometry(0.18, 0.048, 0.024);
    mirBody.translate(roofMirrorPos[0], roofMirrorPos[1], roofMirrorPos[2]);
    cabin.add(new THREE.Mesh(safeMergeGeometries([mirStalk, mirBody]), matDash));
  }

  return cabin;
}

/**
 * Builds a pneumatic tire carcass centered at `(0, 0, 0)` with axis along `X`,
 * including rounded tread shoulders, rim-protector bead lip, sidewall bulge, and
 * weighted flat contact-patch compression at `y = -(tireRadius - contactDeflect)`.
 */
export function buildLoadedTireGeometry({
  tireRadius,
  outerRadius,
  rimRadius = 0.245,
  sectionWidth = 0.265,
  contactDeflect,
  contactDeflection,
  radialSegments = 80,
  profileSegments = 28,
} = {}) {
  const rOuter = tireRadius ?? outerRadius ?? 0.340;
  const cDeflect = contactDeflect ?? contactDeflection ?? 0.006;
  const halfW = sectionWidth * 0.5;
  const sidewallH = Math.max(0.035, rOuter - rimRadius);
  const prof = [];

  for (let j = 0; j <= profileSegments; j++) {
    const u = j / profileSegments;
    const sym = (u - 0.5) * 2.0; // -1 .. +1
    const absS = Math.abs(sym);

    let xOff;
    let r;
    if (absS > 0.64) {
      const tSide = (absS - 0.64) / 0.36; // 0 at tread shoulder -> 1 at rim bead
      const bulge = Math.sin(tSide * Math.PI) * 0.012 + (tSide > 0.82 ? 0.004 * Math.sin(((tSide - 0.82) / 0.18) * Math.PI) : 0.0);
      xOff = Math.sign(sym) * (halfW * (0.93 - 0.09 * tSide) + bulge);
      const shoulderDrop = 1.0 - Math.pow(tSide, 1.62);
      r = rimRadius + sidewallH * (0.968 * shoulderDrop);
    } else {
      const tTread = absS / 0.64;
      xOff = sym * (halfW * 0.93 / 0.64);
      r = rOuter - sidewallH * 0.032 * Math.pow(tTread, 2.5);
    }
    prof.push([xOff, r]);
  }

  const cols = profileSegments + 1;
  const rows = radialSegments + 1;
  const positions = new Float32Array(rows * cols * 3);
  const uvs = new Float32Array(rows * cols * 2);
  const indices = [];

  const yFloorLocal = -(rOuter - cDeflect);

  for (let i = 0; i < rows; i++) {
    const v = i / radialSegments;
    const theta = v * Math.PI * 2.0;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);

    for (let j = 0; j < cols; j++) {
      const [px, pr] = prof[j];
      let y = -ct * pr;
      let z = st * pr;

      if (y < yFloorLocal) {
        const squash = yFloorLocal - y;
        y = yFloorLocal;
        const bulgeFactor = 1.0 + Math.min(0.038, squash * 0.55);
        z *= bulgeFactor;
      }

      const idx = i * cols + j;
      positions[idx * 3] = px;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;
      uvs[idx * 2] = j / profileSegments;
      uvs[idx * 2 + 1] = v;
    }
  }

  for (let i = 0; i < radialSegments; i++) {
    for (let j = 0; j < profileSegments; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const c = (i + 1) * cols + j;
      const d = c + 1;
      // Outward CCW winding across -X sidewall, tread crown, and +X sidewall!
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a complete, jewelry-grade Wheel + Tire + Non-Spinning Brake Caliper & Rotor Assembly
 * centered at `(0, 0, 0)` with axle along `X` (`sideSign = +1` for Left `+X` wheel, `-1` for Right `-X` wheel).
 *
 * Styles:
 *   - `'split5'`: Modern twin-5 (10-spoke) forged alloy (Porsche 992 Carrera S / GT3 style)
 *   - `'star5'` : Deep-dish 3-piece modular 5-star with perimeter bolts (Ferrari F40 Speedline style)
 *   - `'fuchs5'`: Classic 5-paddle sculpted cloverleaf with deep anodized outer lip (Porsche 930 style)
 *   - `'mesh'`  : Cross-laced 16-Y-spoke touring/motorsport basketweave (BMW M3 E30 BBS style)
 */
export function buildPrecisionWheelAssembly({
  sideSign = 1, // +1 = Left (+X outward), -1 = Right (-X outward)
  style = 'split5',
  tireRadius = 0.340,
  rimRadius = 0.245,
  sectionWidth = 0.265,
  contactDeflect = 0.006,
  dishDepth = 0.036,
  caliperAngle = 0.15, // radians on inboard side (0 = horizontal rear/front depending on sign)
  caliperColor = 0xcc1418,
  centerLock = false,
  tireMaterial,
  alloyMaterial,
  lipMaterial = null,
  spokeCenterMaterial = null,
  rotorMaterial = null,
  caliperMaterial = null,
} = {}) {
  const knuckleGroup = new THREE.Group();
  knuckleGroup.name = sideSign > 0 ? 'WheelKnuckleL' : 'WheelKnuckleR';

  const spinGroup = new THREE.Group();
  spinGroup.name = 'WheelSpinHub';
  knuckleGroup.add(spinGroup);

  const matAlloy =
    alloyMaterial ||
    new THREE.MeshPhysicalMaterial({ color: 0xd2d7de, metalness: 0.90, roughness: 0.18, clearcoat: 0.4 });
  matAlloy.userData.carRole = matAlloy.userData.carRole || 'alloy';

  const matLip = lipMaterial || matAlloy;
  const matSpoke = spokeCenterMaterial || matAlloy;

  const matDarkHub = new THREE.MeshStandardMaterial({ color: 0x06070a, roughness: 0.88, metalness: 0.12 });
  matDarkHub.userData.carRole = 'liner';

  const matChrome = new THREE.MeshPhysicalMaterial({ color: 0xebeff5, metalness: 0.96, roughness: 0.08 });
  matChrome.userData.carRole = 'chrome';

  // 1. Loaded Pneumatic Tire
  const tireGeo = buildLoadedTireGeometry({
    tireRadius,
    rimRadius,
    sectionWidth,
    contactDeflect,
  });
  const tireMesh = new THREE.Mesh(tireGeo, tireMaterial);
  tireMesh.castShadow = true;
  tireMesh.receiveShadow = true;
  spinGroup.add(tireMesh);

  const rimAssembly = new THREE.Group();
  const halfW = sectionWidth * 0.5;
  const xOuterFace = halfW * 0.85;
  const isDeepLipModular = style === 'star5' || style === 'fuchs5';

  const matBarrelDark = new THREE.MeshStandardMaterial({
    color: isDeepLipModular ? 0x2c313a : 0x8d95a4,
    roughness: isDeepLipModular ? 0.42 : 0.28,
    metalness: 0.78,
  });
  matBarrelDark.userData.carRole = isDeepLipModular ? 'trim' : 'alloy';

  // 2. Stepped Rim Barrel:
  //    - Modern forged wheels ('split5', 'mesh'): satin gunmetal-alloy inner barrel + bright machined outer rim flange!
  //    - Modular 3-piece wheels ('star5', 'fuchs5'): deep mirror-polished outer step-lip + dark inner drum!
  if (isDeepLipModular) {
    // True 3-piece motorsport stepped cylindrical barrel lip (e.g. Ferrari F40 Speedline 58-94 mm deep mirror lip!)
    const stepMid = dishDepth * 0.52;
    const outerLipPts = [
      new THREE.Vector2(rimRadius * 0.875, xOuterFace - dishDepth - 0.010),
      new THREE.Vector2(rimRadius * 0.905, xOuterFace - dishDepth),
      new THREE.Vector2(rimRadius * 0.912, xOuterFace - stepMid - 0.004),
      new THREE.Vector2(rimRadius * 0.952, xOuterFace - stepMid + 0.004),
      new THREE.Vector2(rimRadius * 0.964, xOuterFace - 0.006),
      new THREE.Vector2(rimRadius * 1.012, xOuterFace + 0.002),
      new THREE.Vector2(rimRadius * 1.012, xOuterFace + 0.008),
      new THREE.Vector2(rimRadius * 0.966, xOuterFace + 0.007),
      new THREE.Vector2(rimRadius * 0.954, xOuterFace - stepMid),
      new THREE.Vector2(rimRadius * 0.908, xOuterFace - dishDepth * 0.96),
      new THREE.Vector2(rimRadius * 0.872, xOuterFace - dishDepth - 0.012),
    ];
    const outerLipGeo = new THREE.LatheGeometry(outerLipPts, 72);
    outerLipGeo.rotateZ(-Math.PI * 0.5);
    rimAssembly.add(new THREE.Mesh(outerLipGeo, matLip));

    const innerBarrelPts = [
      new THREE.Vector2(rimRadius * 0.82, -halfW * 0.72),
      new THREE.Vector2(rimRadius * 0.878, xOuterFace - dishDepth - 0.010),
    ];
    const innerBarrelGeo = new THREE.LatheGeometry(innerBarrelPts, 48);
    innerBarrelGeo.rotateZ(-Math.PI * 0.5);
    rimAssembly.add(new THREE.Mesh(innerBarrelGeo, matBarrelDark));
  } else {
    // Crisp 18 mm machined silver outer rim flange ring
    const flangePts = [
      new THREE.Vector2(rimRadius * 0.932, xOuterFace - 0.018),
      new THREE.Vector2(rimRadius * 0.988, xOuterFace - 0.003),
      new THREE.Vector2(rimRadius * 1.012, xOuterFace + 0.004),
      new THREE.Vector2(rimRadius * 0.968, xOuterFace + 0.006),
      new THREE.Vector2(rimRadius * 0.928, xOuterFace - 0.016),
    ];
    const flangeGeo = new THREE.LatheGeometry(flangePts, 64);
    flangeGeo.rotateZ(-Math.PI * 0.5);
    rimAssembly.add(new THREE.Mesh(flangeGeo, matLip));

    // Satin gunmetal-alloy inner barrel behind the concave spokes
    const innerBarrelPts = [
      new THREE.Vector2(rimRadius * 0.83, -halfW * 0.72),
      new THREE.Vector2(rimRadius * 0.895, -halfW * 0.08),
      new THREE.Vector2(rimRadius * 0.935, xOuterFace - 0.016),
    ];
    const innerBarrelGeo = new THREE.LatheGeometry(innerBarrelPts, 56);
    innerBarrelGeo.rotateZ(-Math.PI * 0.5);
    rimAssembly.add(new THREE.Mesh(innerBarrelGeo, matBarrelDark));
  }

  // Inner dark shadow backing drum deep behind brake rotor so sky never peeks through wheel spokes
  const innerDrum = new THREE.CylinderGeometry(rimRadius * 0.82, rimRadius * 0.82, 0.018, 40);
  innerDrum.rotateZ(Math.PI * 0.5);
  innerDrum.translate(-halfW * 0.68, 0, 0);
  rimAssembly.add(new THREE.Mesh(innerDrum, matDarkHub));

  // 3. Sculpted 3D Spokes + Concave Recessed Hub Bowl
  const spokeGeos = [];
  const boltGeos = [];
  const xHubFace = xOuterFace - dishDepth * 0.88;
  const rHub = rimRadius * 0.235;
  const rInnerRim = isDeepLipModular ? rimRadius * 0.938 : rimRadius * 0.968;

  const hubBowl = new THREE.CylinderGeometry(rHub, rHub * 1.15, 0.032, 32);
  hubBowl.rotateZ(Math.PI * 0.5);
  hubBowl.translate(xHubFace - 0.012, 0, 0);
  spokeGeos.push(hubBowl);

  if (style === 'star5' || style === 'fuchs5') {
    const nSpokes = 5;
    if (style === 'star5') {
      // Forged central pentagonal Speedline star web connecting the 5 wide arms seamlessly around the center-lock hub!
      const webDisc = new THREE.CylinderGeometry(rHub * 1.46, rHub * 1.54, 0.019, 5);
      webDisc.rotateZ(Math.PI * 0.5);
      webDisc.rotateX(Math.PI * 0.1);
      webDisc.translate(xHubFace + 0.001, 0, 0);
      spokeGeos.push(webDisc);
    }
    for (let i = 0; i < nSpokes; i++) {
      const ang = (i * Math.PI * 2.0) / nSpokes;
      const wRoot = style === 'fuchs5' ? rimRadius * 0.22 : rimRadius * 0.35;
      const wTip = style === 'fuchs5' ? rimRadius * 0.29 : rimRadius * 0.168;

      const shape = new THREE.Shape();
      shape.moveTo(-wRoot * 0.5, rHub * 0.72);
      shape.lineTo(wRoot * 0.5, rHub * 0.72);
      shape.lineTo(wTip * 0.5, rInnerRim);
      shape.lineTo(-wTip * 0.5, rInnerRim);
      shape.closePath();

      const extrude = new THREE.ExtrudeGeometry(shape, {
        depth: 0.018,
        bevelEnabled: true,
        bevelThickness: 0.0035,
        bevelSize: 0.0035,
        bevelSegments: 2,
      });
      extrude.rotateY(Math.PI * 0.5);
      extrude.translate(xHubFace - 0.008, 0, 0);
      extrude.rotateX(ang);
      spokeGeos.push(extrude);
    }
    if (style === 'star5') {
      // Recessed central Speedline spoke flutes + 20 perimeter modular flange bolts!
      for (let i = 0; i < nSpokes; i++) {
        const ang = (i * Math.PI * 2.0) / nSpokes;
        const flute = new THREE.BoxGeometry(0.005, (rInnerRim - rHub) * 0.58, 0.014);
        flute.translate(xHubFace + 0.011, rHub * 0.95 + (rInnerRim - rHub) * 0.29, 0);
        flute.rotateX(ang);
        boltGeos.push(flute);
      }
      for (let b = 0; b < 20; b++) {
        const bAng = (b * Math.PI * 2.0) / 20.0;
        const bolt = new THREE.CylinderGeometry(0.0038, 0.0038, 0.008, 8);
        bolt.rotateZ(Math.PI * 0.5);
        bolt.translate(xHubFace + 0.010, Math.cos(bAng) * (rInnerRim * 0.935), Math.sin(bAng) * (rInnerRim * 0.935));
        boltGeos.push(bolt);
      }
    }
  } else if (style === 'mesh') {
    const nPairs = 10;
    const len = rInnerRim - rHub * 0.80;
    const sweepTilt = Math.atan2(dishDepth * 0.82, len);
    for (let i = 0; i < nPairs; i++) {
      const baseAng = (i * Math.PI * 2.0) / nPairs;
      for (const splay of [-1, 1]) {
        const bar = new THREE.BoxGeometry(0.014, len, 0.0095);
        bar.rotateZ(-sweepTilt);
        bar.rotateX(splay * 0.22);
        bar.translate(0.5 * (xHubFace + xOuterFace) - 0.004, rHub * 0.82 + len * 0.5, splay * 0.016);
        bar.rotateX(baseAng);
        spokeGeos.push(bar);
      }
    }
  } else {
    // Default 'split5' (Porsche 992 Carrera S open 10-spoke slim concave forged V-spokes revealing brake rotor & red caliper!)
    const nPairs = 5;
    const rStart = rHub * 0.80;
    const len = rInnerRim - rStart;
    const sweepTilt = Math.atan2(dishDepth * 0.86, len);
    for (let i = 0; i < nPairs; i++) {
      const baseAng = (i * Math.PI * 2.0) / nPairs;
      for (const splay of [-1, 1]) {
        // Sculpted forged Carrera S V-spoke (15.6 mm root -> 10.4 mm rim tip, clean V-splay revealing silver barrel & rotor!)
        const spokeShape = new THREE.Shape();
        spokeShape.moveTo(-0.0078, 0.0);
        spokeShape.lineTo(0.0078, 0.0);
        spokeShape.lineTo(0.0052, len);
        spokeShape.lineTo(-0.0052, len);
        spokeShape.closePath();
        const bar = new THREE.ExtrudeGeometry(spokeShape, {
          depth: 0.016,
          bevelEnabled: true,
          bevelThickness: 0.0020,
          bevelSize: 0.0018,
          bevelSegments: 1,
        });
        bar.rotateY(Math.PI * 0.5);
        bar.rotateZ(-sweepTilt);
        bar.rotateX(splay * 0.165);
        bar.translate(xHubFace - 0.006, rStart, splay * 0.024);
        bar.rotateX(baseAng);
        spokeGeos.push(bar);
      }
    }
  }

  rimAssembly.add(new THREE.Mesh(safeMergeGeometries(spokeGeos), matSpoke));

  // 4. Center Cap + Crest Emblem + 5 Recessed Lug Bolts (or Motorsport Center-Lock Nut)
  const capGeo = new THREE.CylinderGeometry(rHub * 0.42, rHub * 0.46, 0.014, 24);
  capGeo.rotateZ(Math.PI * 0.5);
  capGeo.translate(xHubFace + 0.003, 0, 0);
  rimAssembly.add(new THREE.Mesh(capGeo, matSpoke));

  const crestDot = new THREE.CylinderGeometry(rHub * 0.16, rHub * 0.16, 0.016, 16);
  crestDot.rotateZ(Math.PI * 0.5);
  crestDot.translate(xHubFace + 0.004, 0, 0);
  const matGoldCrest = new THREE.MeshPhysicalMaterial({ color: 0xc89d32, metalness: 0.85, roughness: 0.25 });
  matGoldCrest.userData.carRole = 'chrome';
  rimAssembly.add(new THREE.Mesh(crestDot, matGoldCrest));

  if (centerLock) {
    const hexLock = new THREE.CylinderGeometry(rHub * 0.34, rHub * 0.38, 0.022, 6);
    hexLock.rotateZ(Math.PI * 0.5);
    hexLock.translate(xHubFace + 0.009, 0, 0);
    boltGeos.push(hexLock);
  } else {
    for (let i = 0; i < 5; i++) {
      const lAng = (i * Math.PI * 2.0) / 5.0;
      const lugWell = new THREE.CylinderGeometry(0.010, 0.010, 0.016, 12);
      lugWell.rotateZ(Math.PI * 0.5);
      lugWell.translate(xHubFace - 0.001, Math.cos(lAng) * (rHub * 0.68), Math.sin(lAng) * (rHub * 0.68));
      rimAssembly.add(new THREE.Mesh(lugWell, matDarkHub));

      const lug = new THREE.CylinderGeometry(0.0068, 0.0068, 0.016, 6);
      lug.rotateZ(Math.PI * 0.5);
      lug.translate(xHubFace + 0.001, Math.cos(lAng) * (rHub * 0.68), Math.sin(lAng) * (rHub * 0.68));
      boltGeos.push(lug);
    }
  }
  const valve = new THREE.CylinderGeometry(0.0035, 0.0045, 0.018, 8);
  valve.translate(xOuterFace - 0.010, -rInnerRim + 0.012, 0);
  boltGeos.push(valve);

  if (boltGeos.length) {
    rimAssembly.add(new THREE.Mesh(safeMergeGeometries(boltGeos), matChrome));
  }

  // 5. Cross-Drilled Brake Rotor Disc + Rotor Hat (mounted on spinGroup)
  const rRotor = isDeepLipModular ? rimRadius * 0.72 : rimRadius * 0.77;
  const xRotor = xHubFace - (isDeepLipModular ? 0.046 : 0.052);
  const matRotor =
    rotorMaterial ||
    new THREE.MeshPhysicalMaterial({ color: 0x9aa1aa, metalness: 0.86, roughness: 0.28 });
  matRotor.userData.carRole = matRotor.userData.carRole || 'alloy';

  const rotorDisc = new THREE.CylinderGeometry(rRotor, rRotor, 0.024, 48);
  rotorDisc.rotateZ(Math.PI * 0.5);
  rotorDisc.translate(xRotor, 0, 0);
  rimAssembly.add(new THREE.Mesh(rotorDisc, matRotor));

  const rotorHat = new THREE.CylinderGeometry(rRotor * 0.40, rRotor * 0.44, 0.044, 32);
  rotorHat.rotateZ(Math.PI * 0.5);
  rotorHat.translate(xRotor + 0.014, 0, 0);
  rimAssembly.add(new THREE.Mesh(rotorHat, matDarkHub));

  if (sideSign < 0) {
    rimAssembly.rotation.y = Math.PI;
  }
  spinGroup.add(rimAssembly);

  // 6. Fixed 6-Piston Brembo Brake Caliper (mounted on NON-SPINNING knuckleGroup!)
  // Convention: `caliperAngle` is measured in the world YZ wheel plane (`0` = +Z forward, `PI` = -Z aft, `+PI/2` = +Y top)!
  // Independent of `sideSign`, so `caliperAngle = Math.PI - 0.22` places BOTH left & right front calipers cleanly aft/up!
  const matCal =
    caliperMaterial ||
    new THREE.MeshPhysicalMaterial({
      color: caliperColor,
      metalness: 0.16,
      roughness: 0.24,
      specularIntensity: 0.22,
      clearcoat: 0.92,
      clearcoatRoughness: 0.05,
    });
  matCal.userData.carRole = matCal.userData.carRole || 'paint';

  const calSpan = 0.82;
  const calShape = new THREE.Shape();
  const rIn = rRotor * 0.58;
  const rOut = rRotor * 1.06;
  const ARC_N = 14;
  for (let i = 0; i <= ARC_N; i++) {
    const a = -calSpan * 0.5 + (calSpan * i) / ARC_N;
    const zc = Math.cos(a) * rOut;
    const yc = Math.sin(a) * rOut;
    if (i === 0) calShape.moveTo(zc, yc);
    else calShape.lineTo(zc, yc);
  }
  for (let i = ARC_N; i >= 0; i--) {
    const a = -calSpan * 0.5 + (calSpan * i) / ARC_N;
    calShape.lineTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
  }
  calShape.closePath();

  const calGeo = new THREE.ExtrudeGeometry(calShape, {
    depth: 0.050,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  // Center extrusion thickness symmetrically around Z=0 BEFORE rotating so caliper straddles `sideSign * xRotor`
  // strictly INBOARD behind the wheel spokes on BOTH +X and -X wheels!
  calGeo.translate(0, 0, -0.025);
  calGeo.rotateY(-Math.PI * 0.5); // maps Shape +X -> +Z, Shape +Y -> +Y, centered Z -> centered X
  calGeo.translate(sideSign * (xRotor - 0.004), 0, 0);
  calGeo.rotateX(-caliperAngle); // rotate around X so +caliperAngle lifts from +Z toward +Y -> -Z!
  const calMesh = new THREE.Mesh(calGeo, matCal);
  calMesh.name = 'FixedBrakeCaliper';
  knuckleGroup.add(calMesh);

  knuckleGroup.userData.spinGroup = spinGroup;
  return knuckleGroup;
}

/**
 * Builds a 3-Depth Fender-Tangent Flush Headlamp Pair (`+X` and `-X`):
 *   - Aligns the outer oval cover lens & slim 3.5 mm rubber gasket directly to `surfaceNormal` on the
 *     sloping fender so there is **0 mm frog-eye protrusion** above the fender silhouette!
 *   - Inside the recessed dark matte bucket, aims the stepped chrome bezel, Bi-LED projector eyeball,
 *     and 4-point DRL pods horizontally forward (`+Z`) just like real OEM Porsche / GT headlamps!
 */
export function buildFlushHeadlampAssembly({
  center = [0.66, 0.64, 1.84], // [+x, y, z] on Left fender
  radii = [0.132, 0.195, 0.065], // [rx (transverse), ry (along sloping fender), depth]
  surfaceNormal = [0.28, 0.86, 0.42], // Outward fender normal on +X side (mostly +Y up + forward + outward!)
  pitchRad = null,
  yawRad = null,
  rollRad = null,
  signature = 'four_point', // 'four_point' | 'ring' | 'dual_rect'
  lensMaterial = null,
} = {}) {
  const pair = new THREE.Group();
  pair.name = 'HeadlampPair';

  const matTub = new THREE.MeshStandardMaterial({ color: 0x0a0d13, roughness: 0.34, metalness: 0.28 });
  matTub.userData.carRole = 'liner';

  const matDarkChrome = new THREE.MeshPhysicalMaterial({ color: 0xa4aebe, metalness: 0.93, roughness: 0.13 });
  matDarkChrome.userData.carRole = 'chrome';

  const matBrightChrome = new THREE.MeshPhysicalMaterial({ color: 0xe6edf7, metalness: 0.97, roughness: 0.07 });
  matBrightChrome.userData.carRole = 'chrome';

  const matProjector = new THREE.MeshPhysicalMaterial({
    color: 0x0a1220,
    metalness: 0.08,
    roughness: 0.02,
    ior: 1.64,
    clearcoat: 0.0,
  });
  matProjector.userData.carRole = 'lamp_lens';

  const matDrl = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xf2f7ff),
    emissiveIntensity: 3.2,
    roughness: 0.10,
  });
  matDrl.userData.carRole = 'emitter';

  // Un-premultiplied exact dielectric polycarbonate cover lens (`IOR 1.586`) with ceramic perimeter border
  // so studio spotlight reflections gleam at 100% intensity while revealing the 3D Matrix optics inside!
  let matCover = lensMaterial;
  if (!matCover) {
    matCover = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0.0,
      roughness: 0.008,
      ior: 1.586,
      clearcoat: 0.0,
      envMapIntensity: 1.25,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    });
    matCover.customProgramCacheKey = () => 'car_headlamp_polycarb_v2';
    matCover.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vLampLocalXY;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLampLocalXY = position.xy;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vLampLocalXY;')
        .replace(
          '#include <opaque_fragment>',
          `{
            vec3 vD = normalize(vViewPosition);
            float cosI = clamp(abs(dot(normal, vD)), 0.0, 1.0);
            float r0 = 0.051;
            float fres = r0 + (1.0 - r0) * pow(1.0 - cosI, 5.0);
            float rNorm = length(vLampLocalXY);
            float borderFrit = smoothstep(0.89, 0.96, rNorm);
            float sLum = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722));
            vec3 cleanSpec = outgoingLight / (1.0 + sLum * 0.12);
            float cLum = dot(cleanSpec, vec3(0.2126, 0.7152, 0.0722));
            float aGlass = clamp(0.08 + fres * 0.68 + clamp(cLum * 0.38, 0.0, 0.52), 0.08, 0.94);
            vec3 cGlass = (vec3(0.004, 0.005, 0.007) * 0.08 + cleanSpec) / max(aGlass, 0.08);
            vec3 cFrit = vec3(0.010, 0.012, 0.016) + cleanSpec * 0.40;
            gl_FragColor = vec4(mix(cGlass, cFrit, borderFrit), mix(aGlass, 0.98, borderFrit));
          }`,
        );
    };
  }
  matCover.userData.carRole = 'lamp_lens';

  const matSatinSilver = new THREE.MeshPhysicalMaterial({
    color: 0x242933,
    metalness: 0.82,
    roughness: 0.24,
    clearcoat: 0.55,
  });
  matSatinSilver.userData.carRole = 'alloy';

  const rx = radii[0];
  const ry = radii[1] > radii[2] ? radii[1] : radii[2];

  for (const s of [1, -1]) {
    const unit = new THREE.Group();
    unit.position.set(s * center[0], center[1], center[2]);

    // Build orthonormal frame with +Z_local along fender outward normal, +Y_local pointing rearward/up along fender!
    let nVec;
    if (Array.isArray(surfaceNormal) && surfaceNormal.length === 3) {
      nVec = new THREE.Vector3(s * surfaceNormal[0], surfaceNormal[1], surfaceNormal[2]).normalize();
    } else {
      const p = pitchRad ?? 1.12;
      const yw = yawRad ?? 0.24;
      nVec = new THREE.Vector3(s * Math.sin(yw) * Math.cos(p), Math.sin(p), Math.cos(yw) * Math.cos(p)).normalize();
    }
    const refUp = new THREE.Vector3(-s * 0.08, 0.42, -0.90).normalize();
    const xAxis = new THREE.Vector3().crossVectors(refUp, nVec).normalize();
    const yAxis = new THREE.Vector3().crossVectors(nVec, xAxis).normalize();
    const basisMat = new THREE.Matrix4().makeBasis(xAxis, yAxis, nVec);
    unit.quaternion.setFromRotationMatrix(basisMat);
    if (typeof rollRad === 'number' && !surfaceNormal) {
      unit.rotateZ(s * rollRad);
    }

    unit.position.addScaledVector(nVec, 0.0012);

    // 1. Open-Top Tapered Recessed Optical Bucket (`openEnded = true` + rear floor cap at `-0.080 m` so ZERO opaque top lid blocks inner optics!)
    matTub.side = THREE.DoubleSide;
    const baseTubGeo = new THREE.CylinderGeometry(0.95, 0.62, 0.080, 48, 1, true);
    baseTubGeo.rotateX(Math.PI * 0.5);
    baseTubGeo.scale(rx, ry, 1.0);
    baseTubGeo.translate(0, 0, -0.041);
    unit.add(new THREE.Mesh(baseTubGeo, matTub));

    const tubFloorGeo = new THREE.CircleGeometry(0.64, 40);
    tubFloorGeo.scale(rx, ry, 1.0);
    tubFloorGeo.translate(0, 0, -0.080);
    unit.add(new THREE.Mesh(tubFloorGeo, matTub));

    // Sculpted Matte-Obsidian Stepped Reflector Bowl & Finned Inner Collar (stays 100% beneath outer polycarbonate dome!)
    const matReflectorBowl = new THREE.MeshStandardMaterial({
      color: 0x101318,
      metalness: 0.35,
      roughness: 0.48,
      side: THREE.DoubleSide,
    });
    matReflectorBowl.userData.carRole = 'trim';

    const outerSilverRing = new THREE.CylinderGeometry(0.92, 0.56, 0.056, 48, 1, true);
    outerSilverRing.rotateX(Math.PI * 0.5);
    outerSilverRing.scale(rx, ry, 1.0);
    outerSilverRing.translate(0, 0, -0.031);
    unit.add(new THREE.Mesh(outerSilverRing, matReflectorBowl));

    const innerCollarRing = new THREE.CylinderGeometry(0.68, 0.42, 0.032, 44, 1, true);
    innerCollarRing.rotateX(Math.PI * 0.5);
    innerCollarRing.scale(rx, ry, 1.0);
    innerCollarRing.translate(0, -ry * 0.04, -0.038);
    matDarkChrome.side = THREE.DoubleSide;
    unit.add(new THREE.Mesh(innerCollarRing, matDarkChrome));

    const innerRingGeo = new THREE.TorusGeometry(0.91, 0.022, 14, 48);
    innerRingGeo.scale(rx, ry, 0.14);
    innerRingGeo.translate(0, 0, -0.004);
    unit.add(new THREE.Mesh(innerRingGeo, matDarkChrome));

    const gasketGeo = new THREE.TorusGeometry(0.975, 0.020, 12, 48);
    gasketGeo.scale(rx, ry, 0.16);
    gasketGeo.translate(0, 0, 0.0005);
    unit.add(new THREE.Mesh(gasketGeo, matTub));

    // 2. Stepped-Terrace Forward-Aimed (`+Z_world`) Central Bi-LED Projector + 4-Point Matrix LEDs!
    //    Placing each pod center on the sloped `unit` XY terrace (`z_unit = -0.026..-0.036`) while aiming its axis
    //    horizontally (`+Z_world`) keeps 100% of optics at uniform sub-dome depth with ZERO grazing shroud rings!
    const invBasis = basisMat.clone().invert();
    const localForward = new THREE.Vector3(0, -0.04, 1.0).normalize().applyMatrix4(invBasis).normalize();
    const localUp = new THREE.Vector3(0, 1.0, 0).applyMatrix4(invBasis).normalize();
    const podX = new THREE.Vector3().crossVectors(localUp, localForward).normalize();
    const podY = new THREE.Vector3().crossVectors(localForward, podX).normalize();
    const podQuat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(podX, podY, localForward));

    const internalPod = new THREE.Group();
    internalPod.quaternion.copy(podQuat);
    internalPod.position.set(0, -ry * 0.04, -0.036);

    const rProj = rx * 0.30;
    const shroudGeo = new THREE.CylinderGeometry(rProj * 0.96, rProj * 1.24, 0.022, 36);
    shroudGeo.rotateX(Math.PI * 0.5);
    internalPod.add(new THREE.Mesh(shroudGeo, matDarkChrome));

    const projRimGeo = new THREE.TorusGeometry(rProj * 0.92, rx * 0.032, 12, 36);
    projRimGeo.translate(0, 0, 0.009);
    internalPod.add(new THREE.Mesh(projRimGeo, matBrightChrome));

    const lensBall = new THREE.SphereGeometry(rProj * 0.86, 24, 18);
    lensBall.scale(1.0, 1.0, 0.44);
    lensBall.translate(0, 0, 0.008);
    internalPod.add(new THREE.Mesh(lensBall, matProjector));

    if (signature === 'four_point') {
      // Authentic Porsche PDLS+ 4-point stepped terrace: each jewel pod sits at uniform depth beneath the sloped oval dome!
      for (const dx of [-1, 1]) {
        for (const dy of [-1, 1]) {
          const drlUnit = new THREE.Group();
          drlUnit.quaternion.copy(podQuat);
          drlUnit.position.set(dx * rx * 0.44, dy * ry * 0.31, -0.025);

          const pod = new THREE.BoxGeometry(rx * 0.28, rx * 0.088, 0.016);
          drlUnit.add(new THREE.Mesh(pod, matBrightChrome));

          const pill = new THREE.BoxGeometry(rx * 0.22, rx * 0.052, 0.008);
          pill.translate(0, 0, 0.006);
          drlUnit.add(new THREE.Mesh(pill, matDrl));

          unit.add(drlUnit);
        }
      }
    } else if (signature === 'dual_rect') {
      const bar = new THREE.BoxGeometry(rx * 1.15, rx * 0.08, 0.009);
      bar.translate(0, -rx * 0.40, 0.010);
      internalPod.add(new THREE.Mesh(bar, matDrl));
    } else {
      const halo = new THREE.TorusGeometry(rProj * 1.12, rx * 0.038, 10, 32);
      halo.translate(0, 0, 0.009);
      internalPod.add(new THREE.Mesh(halo, matDrl));
    }
    unit.add(internalPod);

    // 3. Flush Aerodynamic Clear Polycarbonate Outer Dome Lens (`14 mm` crown, normalized XY in [-1, 1] before scale? Wait: keep position.xy in unit circle!)
    const domeH = Math.min(0.018, Math.max(0.010, radii[2] || 0.014));
    const coverGeo = new THREE.SphereGeometry(1.0, 44, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    coverGeo.rotateX(Math.PI * 0.5);
    const coverMesh = new THREE.Mesh(coverGeo, matCover);
    coverMesh.scale.set(rx * 0.985, ry * 0.985, domeH);
    coverMesh.renderOrder = 5;
    unit.add(coverMesh);

    pair.add(unit);
  }

  return pair;
}

/**
 * Builds sculpted Aerodynamic Stalk-Mounted Wing Mirrors (`+X` and `-X`) with painted housing,
 * satin-black inner bezel, and reflective mirror glass facing rearward (`-Z`).
 */
export function buildAeroMirrorPair({
  mountPos = [0.80, 0.86, 0.46],
  paintMaterial,
  trimMaterial = null,
} = {}) {
  const group = new THREE.Group();
  group.name = 'AeroMirrorPair';

  const matTrim =
    trimMaterial ||
    new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.45, metalness: 0.15 });
  matTrim.userData.carRole = 'trim';

  const matMirrorGlass = new THREE.MeshPhysicalMaterial({
    color: 0xe6edf5,
    metalness: 0.98,
    roughness: 0.02,
  });
  matMirrorGlass.userData.carRole = 'chrome';

  for (const s of [1, -1]) {
    const mGroup = new THREE.Group();
    mGroup.position.set(s * mountPos[0], mountPos[1], mountPos[2]);

    // Swept aerodynamic stalk
    const stalk = new THREE.BoxGeometry(0.085, 0.022, 0.055);
    stalk.rotateZ(s * 0.35);
    stalk.rotateY(-s * 0.28);
    stalk.translate(s * 0.035, 0.018, -0.015);
    mGroup.add(new THREE.Mesh(stalk, matTrim));

    // Teardrop painted shell
    const capGeo = new THREE.SphereGeometry(0.082, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58);
    capGeo.rotateX(Math.PI * 0.5); // dome points +Z (forward aerodynamic nose), flat open back at -Z!
    capGeo.scale(1.18, 0.68, 1.32);
    capGeo.rotateY(-s * 0.14);
    capGeo.translate(s * 0.095, 0.042, -0.035);
    const capMesh = new THREE.Mesh(capGeo, paintMaterial);
    capMesh.castShadow = true;
    mGroup.add(capMesh);

    // Rear-facing bezel + mirror glass
    const bezelGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.012, 24);
    bezelGeo.rotateX(Math.PI * 0.5);
    bezelGeo.scale(1.16, 0.66, 1.0);
    bezelGeo.rotateY(-s * 0.14);
    bezelGeo.translate(s * 0.095, 0.042, -0.042);
    mGroup.add(new THREE.Mesh(bezelGeo, matTrim));

    const glassGeo = new THREE.CircleGeometry(0.070, 24);
    glassGeo.rotateY(Math.PI - s * 0.14);
    glassGeo.scale(1.14, 0.62, 1.0);
    glassGeo.translate(s * 0.095, 0.042, -0.049);
    mGroup.add(new THREE.Mesh(glassGeo, matMirrorGlass));

    group.add(mGroup);
  }
  return group;
}

/**
 * Builds dual low-profile Windshield Wiper Arms + Blades resting along the cowl.
 */
export function buildWiperPair({
  zCowl = 0.74,
  yCowl = 0.855,
  halfSpan = 0.52,
} = {}) {
  const matWiper = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.40, metalness: 0.35 });
  matWiper.userData.carRole = 'trim';

  const parts = [];
  for (const [xPivot, len] of [
    [halfSpan * 0.68, 0.52],
    [-halfSpan * 0.18, 0.54],
  ]) {
    const arm = new THREE.BoxGeometry(len, 0.009, 0.014);
    arm.translate(-len * 0.5, 0.008, 0);
    arm.rotateY(0.10);
    arm.rotateZ(-0.05);
    arm.translate(xPivot, yCowl, zCowl);
    parts.push(arm);

    const blade = new THREE.BoxGeometry(len * 0.82, 0.012, 0.010);
    blade.translate(-len * 0.62, 0.005, -0.012);
    blade.rotateY(0.08);
    blade.translate(xPivot, yCowl, zCowl);
    parts.push(blade);
  }
  const mesh = new THREE.Mesh(safeMergeGeometries(parts), matWiper);
  mesh.name = 'WindshieldWipers';
  return mesh;
}

/**
 * Builds double-walled brushed stainless/titanium Exhaust Tailpipes with pitch-black inner soot core.
 */
export function buildExhaustTips({
  positions = [
    [-0.52, 0.24, -2.22],
    [-0.41, 0.24, -2.21],
    [0.41, 0.24, -2.21],
    [0.52, 0.24, -2.22],
  ],
  radiusX = 0.046,
  radiusY = 0.038,
  length = 0.11,
} = {}) {
  const group = new THREE.Group();
  group.name = 'ExhaustTipsGroup';

  const matTip = new THREE.MeshPhysicalMaterial({ color: 0xd0d5dc, metalness: 0.92, roughness: 0.20 });
  matTip.userData.carRole = 'chrome';

  const matSoot = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.95, metalness: 0.0 });
  matSoot.userData.carRole = 'liner';

  const outerGeos = [];
  const sootGeos = [];

  for (const [px, py, pz] of positions) {
    // Rolled outer stainless tube
    const pts = [
      new THREE.Vector2(0.84, 0.0),
      new THREE.Vector2(1.0, 0.0),
      new THREE.Vector2(1.0, length),
      new THREE.Vector2(0.86, length),
    ];
    const pipe = new THREE.LatheGeometry(pts, 28);
    pipe.rotateX(-Math.PI * 0.5); // opens toward -Z!
    pipe.scale(radiusX, radiusY, 1.0);
    pipe.translate(px, py, pz + length * 0.65);
    outerGeos.push(pipe);

    const core = new THREE.CylinderGeometry(0.85, 0.85, 0.02, 24);
    core.rotateX(Math.PI * 0.5);
    core.scale(radiusX, radiusY, 1.0);
    core.translate(px, py, pz + 0.02);
    sootGeos.push(core);
  }

  group.add(new THREE.Mesh(safeMergeGeometries(outerGeos), matTip));
  group.add(new THREE.Mesh(safeMergeGeometries(sootGeos), matSoot));
  return group;
}

/**
 * Builds an opaque matte-charcoal undertray + 4 enclosed wheelhouse tubs so low 3/4 camera angles
 * never leak bright studio/sky background behind the wheels or under the chassis.
 */
export function buildWheelhouseAndUndertrayGroup({
  wheelbase = 2.45,
  frontTrack,
  trackFront,
  rearTrack,
  trackRear,
  tireRadius = 0.340,
  frontTireRadius,
  rearTireRadius,
  archClearance = 0.012,
  tireWidth = 0.265,
  groundClearance = 0.120,
  frontOverhang = 0.88,
  rearOverhang = 0.96,
  bodyHalfWidth = 0.86,
} = {}) {
  const fTrack = frontTrack ?? trackFront ?? 1.58;
  const rTrack = rearTrack ?? trackRear ?? 1.60;
  const rF = (frontTireRadius ?? tireRadius) + archClearance;
  const rR = (rearTireRadius ?? tireRadius) + archClearance;

  const group = new THREE.Group();
  group.name = 'ChassisUndertrayAndWheelhouses';

  const linerMat = new THREE.MeshStandardMaterial({
    color: 0x0a0b0e,
    roughness: 0.94,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  linerMat.userData.carRole = 'liner';

  const zF = wheelbase * 0.5;
  const zR = -wheelbase * 0.5;
  const totalLen = wheelbase + frontOverhang + rearOverhang;
  const zCenter = 0.5 * (frontOverhang - rearOverhang);

  // Span flat chassis belly pan strictly between the axles (`wheelbase + 0.16`) so rising front splitters & rear diffusers never get undercut!
  const trayGeo = new THREE.BoxGeometry(bodyHalfWidth * 1.54, 0.036, wheelbase + 0.16);
  const tray = new THREE.Mesh(trayGeo, linerMat);
  tray.position.set(0.0, groundClearance + 0.022, 0.0);
  tray.castShadow = true;
  tray.receiveShadow = true;
  group.add(tray);

  // Tuck wheelhouse tubs inboard behind tire center (`tubDepth = tireWidth * 0.88`, vertical crown `0.86 * rTub`)
  // so dark liners block background sky/floor leaks behind spokes WITHOUT ever poking through low wedge hoods!
  const tubDepth = tireWidth * 0.88;
  const wheelSpecs = [
    [fTrack * 0.5, frontTireRadius ?? tireRadius, zF, rF, 1],
    [-fTrack * 0.5, frontTireRadius ?? tireRadius, zF, rF, -1],
    [rTrack * 0.5, rearTireRadius ?? tireRadius, zR, rR, 1],
    [-rTrack * 0.5, rearTireRadius ?? tireRadius, zR, rR, -1],
  ];

  for (const [wx, wy, wz, rTub, sign] of wheelSpecs) {
    const tubGeo = new THREE.CylinderGeometry(rTub, rTub, tubDepth, 36, 1, true, -0.06, Math.PI + 0.12);
    tubGeo.rotateZ(Math.PI * 0.5);
    tubGeo.scale(1.0, 0.86, 0.96);
    const tub = new THREE.Mesh(tubGeo, linerMat);
    tub.position.set(wx - sign * (tireWidth * 0.34), wy, wz);
    group.add(tub);

    const capGeo = new THREE.CircleGeometry(rTub, 36, -0.06, Math.PI + 0.12);
    capGeo.rotateY(sign > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
    capGeo.scale(1.0, 0.86, 0.96);
    const cap = new THREE.Mesh(capGeo, linerMat);
    cap.position.set(wx - sign * (tireWidth * 0.78), wy, wz);
    group.add(cap);
  }

  return group;
}
