/**
 * car_materials_and_optics.js — Physically Grounded OEM Paint (with 3D Shutlines), Pure Dielectric Glazing,
 * Cross-Drilled Brake Rotors, Perforated Grilles, Vulcanized Tires & YZ-Axle Anisotropic Alloy Shaders
 *
 * Zero-external-texture material factories for Three.js (`r155+` / `0.172+`) automotive reconstructions:
 *   1. `createOEMCarPaintMaterial(opts)` — 2-lobe metallic basecoat flop + `fwidth` LEADR micro-flakes
 *      + `IOR 1.50` clearcoat + analytical 3D stamped panel shutlines (`3.2 mm` cavity + twin rolled lip bevels).
 *   2. `createAutomotiveGlassMaterial(opts)` — Zero-diffuse dielectric glazing (`color = 0x000000`, zero
 *      chalky Lambertian haze), exact s/p Fresnel, smoky soda-lime transmission, ceramic frit + dot-matrix
 *      perimeter band, and optional copper rear-defroster heater lines.
 *   3. `createVulcanizedTireMaterial(opts)` — Satin-matte carbon-black elastomer (`specularIntensity: 0.18`)
 *      with circumferential rain grooves, angled shoulder tread blocks, and sidewall rib micro-relief.
 *   4. `createAnisotropicAlloyMaterial(opts)` — YZ-plane (`X`-axle) tangential lathe brushing (`0, -z, y`)
 *      with LEADR `fwidth` roughness variance.
 *   5. `createBrakeRotorMaterial(opts)` — Tangential swept iron/ceramic disc with spiral cross-drilled holes.
 *   6. `createPerforatedGrilleMaterial(opts)` — `fwidth`-filtered honeycomb/slat radiator intake mesh.
 */

import * as THREE from 'three';

const MAX_SHUTLINES = 12;
const MAX_APERTURES = 8;

/**
 * Packs up to 12 declarative 3D shutline descriptors into two `vec4[12]` uniform arrays:
 *   - `{ type: 'zPlane', z, yMin, yMax, xMin, xMax, width }`    -> code 1 (vertical door / fender seam)
 *   - `{ type: 'xBox', xHalf, zMin, zMax, yMin, yMax, r, width }` -> code 2 (rounded hood / decklid plan loop)
 *   - `{ type: 'yPlane', y, zMin, zMax, xMin, xMax, width }`    -> code 3 (horizontal bumper / waistline seam)
 *   - `{ type: 'fuelCap', center: [x,y,z], radius, width }`     -> code 4 (circular fuel-filler flap)
 *   - `{ type: 'xPairBox', xCenter, xHalf, zMin, zMax, yMin, yMax, r }` -> code 5 (symmetric pop-up doors)
 */
function packShutlines(shutlines = []) {
  const arrA = [];
  const arrB = [];
  for (let i = 0; i < MAX_SHUTLINES; i++) {
    const s = shutlines[i];
    if (!s) {
      arrA.push(new THREE.Vector4(0, 0, 0, 0));
      arrB.push(new THREE.Vector4(0, 0, 0, 0));
      continue;
    }
    if (s.type === 'zPlane') {
      arrA.push(new THREE.Vector4(1.0, s.z ?? 0.0, s.yMin ?? -10.0, s.yMax ?? 10.0));
      arrB.push(new THREE.Vector4(s.xMin ?? -10.0, s.xMax ?? 10.0, s.width ?? 0.0, 0.0));
    } else if (s.type === 'xBox') {
      arrA.push(new THREE.Vector4(2.0, s.xHalf ?? 0.52, s.zMin ?? 0.7, s.zMax ?? 2.1));
      arrB.push(new THREE.Vector4(s.yMin ?? 0.25, s.yMax ?? 1.25, s.r ?? 0.09, s.width ?? 0.0));
    } else if (s.type === 'yPlane') {
      arrA.push(new THREE.Vector4(3.0, s.y ?? 0.45, s.zMin ?? -10.0, s.zMax ?? 10.0));
      arrB.push(new THREE.Vector4(s.xMin ?? -10.0, s.xMax ?? 10.0, s.width ?? 0.0, 0.0));
    } else if (s.type === 'fuelCap') {
      const c = s.center || [-0.80, 0.76, 0.88];
      arrA.push(new THREE.Vector4(4.0, c[0], c[1], c[2]));
      arrB.push(new THREE.Vector4(s.radius ?? 0.076, s.width ?? 0.0, 0.0, 0.0));
    } else if (s.type === 'xPairBox') {
      arrA.push(new THREE.Vector4(5.0, s.xCenter ?? 0.60, s.zMin ?? 1.38, s.zMax ?? 1.69));
      arrB.push(new THREE.Vector4(s.yMin ?? 0.40, s.yMax ?? 0.80, s.r ?? 0.015, s.xHalf ?? 0.15));
    } else {
      arrA.push(new THREE.Vector4(0, 0, 0, 0));
      arrB.push(new THREE.Vector4(0, 0, 0, 0));
    }
  }
  return { arrA, arrB, count: Math.min(MAX_SHUTLINES, shutlines.length) };
}

/**
 * Packs up to 8 analytic fragment-cut 3D body apertures (`discard` inside `sd < 0` + stamped sheet-metal lip bevel)
 * so headlamps, NACA ducts, and vents cut razor-smooth sub-pixel openings in Class-A paint with ZERO mesh sawtooth!
 *   - `{ type: 'rectPair', xCenter, xHalf, zCenter, zHalf, r, yMin }` -> code 1 (symmetric rounded-rect nose lamps)
 *   - `{ type: 'nacaPair', xCenter, zTip, zBase, halfWidthBase, yMin }` -> code 2 (symmetric triangular NACA ducts)
 *   - `{ type: 'ellipsePair', xCenter, zCenter, rx, rz, yMin }` -> code 3 (symmetric oval fender headlamp openings)
 */
function packApertures(apertures = []) {
  const arrA = [];
  const arrB = [];
  for (let i = 0; i < MAX_APERTURES; i++) {
    const a = apertures[i];
    if (!a) {
      arrA.push(new THREE.Vector4(0, 0, 0, 0));
      arrB.push(new THREE.Vector4(0, 0, 0, 0));
      continue;
    }
    if (a.type === 'rectPair') {
      arrA.push(new THREE.Vector4(1.0, a.xCenter ?? 0.605, a.zCenter ?? 1.88, a.xHalf ?? 0.142));
      arrB.push(new THREE.Vector4(a.zHalf ?? 0.142, a.r ?? 0.018, a.yMin ?? 0.25, 0.0));
    } else if (a.type === 'nacaPair') {
      arrA.push(new THREE.Vector4(2.0, a.xCenter ?? 0.255, a.zTip ?? 1.46, a.zBase ?? 1.18));
      arrB.push(new THREE.Vector4(a.halfWidthBase ?? 0.048, a.yMin ?? 0.35, 0.0, 0.0));
    } else if (a.type === 'ellipsePair') {
      arrA.push(new THREE.Vector4(3.0, a.xCenter ?? 0.64, a.zCenter ?? 1.815, a.rx ?? 0.138));
      arrB.push(new THREE.Vector4(a.rz ?? 0.205, a.yMin ?? 0.35, 0.0, 0.0));
    } else {
      arrA.push(new THREE.Vector4(0, 0, 0, 0));
      arrB.push(new THREE.Vector4(0, 0, 0, 0));
    }
  }
  return { arrA, arrB, count: Math.min(MAX_APERTURES, apertures.length) };
}

export function createOEMCarPaintMaterial({
  baseColor,
  faceColorHex,
  flopColor = null,
  flopColorHex = null,
  flopPower = 2.6,
  flopStrength = 0.52,
  metalness = 0.76,
  roughness = 0.27,
  flakeScale,
  flakeDensity,
  flakeStrength = 0.38,
  clearcoat = 1.0,
  clearcoatRoughness = 0.014,
  orangePeelScale = 210.0,
  orangePeelSlope,
  peelStrength,
  shutlines = [],
  apertures = [],
  shutlineWidth = 0.0013, // 2.6 mm crisp OEM panel gap width
  shutlineBevel = 0.0038, // 3.8 mm stamped edge roll
  directSpecScale = null, // Decouples point-source DirectionalLight GGX hotspots from PMREM area softbox reflections
  envMap = null,
  envMapIntensity = 1.05,
  useRestPosAttr = false,
} = {}) {
  const resolvedBase = baseColor ?? faceColorHex ?? 0x9e121b;
  const resolvedFlop = flopColor ?? flopColorHex ?? null;
  const resolvedFlakeScale = flakeScale ?? flakeDensity ?? 420.0;
  const resolvedPeelSlope = orangePeelSlope ?? peelStrength ?? 0.0026;
  const resolvedDirectSpec = directSpecScale ?? (metalness < 0.25 ? 0.025 : 0.15);
  const cBase = new THREE.Color(resolvedBase);
  const cFlop = resolvedFlop
    ? new THREE.Color(resolvedFlop)
    : cBase.clone().multiplyScalar(0.32);

  const packed = packShutlines(shutlines);
  const packedAp = packApertures(apertures);

  // SOLID ENAMEL vs METALLIC SPECULAR LAW:
  // On non-metallic solid paints (`metalness < 0.25`, e.g., Ferrari Rosso Corsa), suppress the wide `roughness = 0.22`
  // dielectric basecoat specular lobe (`specularIntensity = 0.14`) so it never washes deep pigment into milky pink
  // underneath the razor-sharp `clearcoat = 1.0` (`IOR 1.50`) mirror reflection!
  const mat = new THREE.MeshPhysicalMaterial({
    color: cBase,
    metalness,
    roughness,
    specularIntensity: metalness < 0.25 ? 0.14 : 0.65,
    clearcoat,
    clearcoatRoughness,
    ior: 1.5,
    reflectivity: 0.55,
    envMap,
    envMapIntensity,
  });

  mat.userData.carRole = 'paint';
  if (useRestPosAttr) {
    mat.defines = { ...(mat.defines || {}), USE_CAR_REST_POS: '' };
  }

  const cacheSig = [
    'oem_paint_v4',
    useRestPosAttr ? 'rest1' : 'rest0',
    flakeStrength > 0.001 ? 'flk1' : 'flk0',
    resolvedPeelSlope > 0.0001 ? 'op1' : 'op0',
    packed.count > 0 ? `sh${packed.count}` : 'sh0',
    packedAp.count > 0 ? `ap${packedAp.count}` : 'ap0',
  ].join('_');
  mat.customProgramCacheKey = () => cacheSig;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFlopColor = { value: cFlop };
    shader.uniforms.uFlopPower = { value: flopPower };
    shader.uniforms.uFlopStrength = { value: flopStrength };
    shader.uniforms.uFlakeScale = { value: resolvedFlakeScale };
    shader.uniforms.uFlakeStrength = { value: flakeStrength };
    shader.uniforms.uPeelScale = { value: orangePeelScale };
    shader.uniforms.uPeelSlope = { value: resolvedPeelSlope };
    shader.uniforms.uDirectSpecScale = { value: resolvedDirectSpec };
    shader.uniforms.uShutCount = { value: packed.count };
    shader.uniforms.uShutA = { value: packed.arrA };
    shader.uniforms.uShutB = { value: packed.arrB };
    shader.uniforms.uShutWidth = { value: shutlineWidth };
    shader.uniforms.uShutBevel = { value: shutlineBevel };
    shader.uniforms.uApCount = { value: packedAp.count };
    shader.uniforms.uApA = { value: packedAp.arrA };
    shader.uniforms.uApB = { value: packedAp.arrB };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        #ifdef USE_CAR_REST_POS
          attribute vec3 aRestPos;
        #endif
        varying vec3 vPaintCoord;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_CAR_REST_POS
          vPaintCoord = aRestPos;
        #else
          vec4 _carWp = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            _carWp = instanceMatrix * _carWp;
          #endif
          vPaintCoord = _carWp.xyz;
        #endif`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uFlopColor;
        uniform float uFlopPower;
        uniform float uFlopStrength;
        uniform float uFlakeScale;
        uniform float uFlakeStrength;
        uniform float uPeelScale;
        uniform float uPeelSlope;
        uniform float uDirectSpecScale;
        uniform int uShutCount;
        uniform vec4 uShutA[${MAX_SHUTLINES}];
        uniform vec4 uShutB[${MAX_SHUTLINES}];
        uniform float uShutWidth;
        uniform float uShutBevel;
        uniform int uApCount;
        uniform vec4 uApA[${MAX_APERTURES}];
        uniform vec4 uApB[${MAX_APERTURES}];
        varying vec3 vPaintCoord;

        vec3 carHash33(vec3 p3) {
          p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
          p3 += dot(p3, p3.yxz + 33.33);
          return fract((p3.xxy + p3.yxx) * p3.zyx);
        }

        float carSmoothNoise3(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          vec3 u = f * f * (3.0 - 2.0 * f);
          float n000 = carHash33(i + vec3(0.0, 0.0, 0.0)).x;
          float n100 = carHash33(i + vec3(1.0, 0.0, 0.0)).x;
          float n010 = carHash33(i + vec3(0.0, 1.0, 0.0)).x;
          float n110 = carHash33(i + vec3(1.0, 1.0, 0.0)).x;
          float n001 = carHash33(i + vec3(0.0, 0.0, 1.0)).x;
          float n101 = carHash33(i + vec3(1.0, 0.0, 1.0)).x;
          float n011 = carHash33(i + vec3(0.0, 1.0, 1.0)).x;
          float n111 = carHash33(i + vec3(1.0, 1.0, 1.0)).x;
          float nx00 = mix(n000, n100, u.x);
          float nx10 = mix(n010, n110, u.x);
          float nx01 = mix(n001, n101, u.x);
          float nx11 = mix(n011, n111, u.x);
          return mix(mix(nx00, nx10, u.y), mix(nx01, nx11, u.y), u.z);
        }

        vec2 evalShutlineDistAndWidth(vec3 p) {
          float minD = 10.0;
          float bestW = uShutWidth;
          for (int i = 0; i < ${MAX_SHUTLINES}; i++) {
            if (i >= uShutCount) break;
            vec4 a = uShutA[i];
            vec4 b = uShutB[i];
            int kind = int(a.x + 0.5);
            float d = 10.0;
            float w = uShutWidth;
            if (kind == 1) {
              if (p.y >= a.z && p.y <= a.w && p.x >= b.x && p.x <= b.y) {
                d = abs(p.z - a.y);
                if (b.z > 0.0001) w = b.z;
              }
            } else if (kind == 2) {
              if (p.y >= b.x && p.y <= b.y) {
                float zMid = 0.5 * (a.z + a.w);
                float zHalf = 0.5 * (a.w - a.z);
                float r = b.z;
                vec2 q = abs(vec2(p.x, p.z - zMid)) - vec2(a.y - r, zHalf - r);
                d = abs(length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r);
                if (b.w > 0.0001) w = b.w;
              }
            } else if (kind == 3) {
              if (p.z >= a.z && p.z <= a.w && p.x >= b.x && p.x <= b.y) {
                d = abs(p.y - a.y);
                if (b.z > 0.0001) w = b.z;
              }
            } else if (kind == 4) {
              d = abs(length(p - a.yzw) - b.x);
              if (b.y > 0.0001) w = b.y;
            } else if (kind == 5) {
              if (p.y >= b.x && p.y <= b.y) {
                float zMid = 0.5 * (a.z + a.w);
                float zHalf = 0.5 * (a.w - a.z);
                float r = b.z;
                float xHalf = b.w;
                vec2 q = abs(vec2(abs(p.x) - a.y, p.z - zMid)) - vec2(xHalf - r, zHalf - r);
                d = abs(length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r);
              }
            }
            if (d < minD) {
              minD = d;
              bestW = w;
            }
          }
          return vec2(minD, bestW);
        }

        float evalApertureSignedDist(vec3 p) {
          float minSd = 10.0;
          for (int i = 0; i < ${MAX_APERTURES}; i++) {
            if (i >= uApCount) break;
            vec4 a = uApA[i];
            vec4 b = uApB[i];
            int kind = int(a.x + 0.5);
            if (kind == 1) {
              // Symmetric rounded-rectangle nose/fender openings
              if (p.y >= b.z) {
                float r = b.y;
                vec2 q = abs(vec2(abs(p.x) - a.y, p.z - a.z)) - vec2(a.w - r, b.x - r);
                float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
                minSd = min(minSd, sd);
              }
            } else if (kind == 2) {
              // Symmetric triangular NACA duct openings (apex at z = a.z, wide throat at z = a.w)
              if (p.y >= b.y) {
                float zLo = min(a.z, a.w);
                float zHi = max(a.z, a.w);
                float uRamp = clamp((a.z - p.z) / (a.z - a.w), 0.0, 1.0);
                float hw = 0.004 + b.x * pow(uRamp, 0.85);
                float dz = max(zLo - p.z, p.z - zHi);
                float dx = abs(abs(p.x) - a.y) - hw;
                vec2 q = vec2(dx + 0.004, dz + 0.004);
                float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.004;
                minSd = min(minSd, sd);
              }
            } else if (kind == 3) {
              // Symmetric elliptical fender headlamp openings
              if (p.y >= b.y) {
                vec2 q = vec2((abs(p.x) - a.y) / max(a.w, 1e-4), (p.z - a.z) / max(b.x, 1e-4));
                float sd = (length(q) - 1.0) * min(a.w, b.x);
                minSd = min(minSd, sd);
              }
            }
          }
          return minSd;
        }`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        float _apSd = (uApCount > 0) ? evalApertureSignedDist(vPaintCoord) : 10.0;
        if (_apSd < 0.0) discard;
        vec3 _flkCoord = vPaintCoord * uFlakeScale;
        vec3 _flkFw = fwidth(_flkCoord);
        float _flkFootprint = max(max(_flkFw.x, _flkFw.y), _flkFw.z);
        float _flkVis = 1.0 / (1.0 + _flkFootprint * _flkFootprint * 1.85);
        vec3 _flkRnd = carHash33(floor(_flkCoord)) - 0.5;
        vec2 _shutRes = evalShutlineDistAndWidth(vPaintCoord);
        float _shutD = _shutRes.x;
        float _localShutW = _shutRes.y;
        float _shutFw = max(fwidth(_shutD), 0.0005);
        float _shutCavity = (uShutCount > 0) ? (1.0 - smoothstep(_localShutW - _shutFw * 0.65, _localShutW + _shutFw * 0.65, _shutD)) : 0.0;
        float _apRimDark = (uApCount > 0) ? (1.0 - smoothstep(0.0, 0.0014, _apSd)) * 0.65 : 0.0;
        roughnessFactor = clamp(
          mix(
            roughnessFactor + uFlakeStrength * 0.05 * (1.0 - _flkVis) + _flkRnd.z * 0.03 * _flkVis,
            0.88,
            max(_shutCavity, _apRimDark)
          ),
          0.06,
          0.95
        );`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        vec3 _shutBevelTilt = vec3(0.0);
        {
          vec3 viewDirV = normalize(vViewPosition);
          float ndv = clamp(dot(normal, viewDirV), 0.0, 1.0);
          float flopMix = pow(1.0 - ndv, uFlopPower) * uFlopStrength;
          diffuseColor.rgb = mix(diffuseColor.rgb, uFlopColor, clamp(flopMix, 0.0, 0.86));
          diffuseColor.rgb *= (1.0 - 0.90 * _shutCavity) * (1.0 - 0.72 * _apRimDark);

          if (uFlakeStrength > 0.001) {
            vec3 flakeTilt = _flkRnd * (0.036 * uFlakeStrength * _flkVis * (1.0 - _shutCavity));
            normal = normalize(normal + flakeTilt);
          }

          if (uShutCount > 0 && _shutD < _localShutW + uShutBevel) {
            float eps = 0.0010;
            vec3 gObj = vec3(
              evalShutlineDistAndWidth(vPaintCoord + vec3(eps, 0.0, 0.0)).x - _shutD,
              evalShutlineDistAndWidth(vPaintCoord + vec3(0.0, eps, 0.0)).x - _shutD,
              evalShutlineDistAndWidth(vPaintCoord + vec3(0.0, 0.0, eps)).x - _shutD
            );
            float gLen = length(gObj);
            if (gLen > 1e-6) {
              vec3 gView = normalize(mat3(viewMatrix) * (gObj / gLen));
              float bevelProfile = sin(clamp((_shutD - _localShutW * 0.5) / uShutBevel, 0.0, 1.0) * 3.14159265);
              _shutBevelTilt = -gView * (0.19 * bevelProfile);
              normal = normalize(normal + _shutBevelTilt);
            }
          }

          if (uApCount > 0 && _apSd < 0.0048) {
            float epsA = 0.0010;
            vec3 gAp = vec3(
              evalApertureSignedDist(vPaintCoord + vec3(epsA, 0.0, 0.0)) - _apSd,
              evalApertureSignedDist(vPaintCoord + vec3(0.0, epsA, 0.0)) - _apSd,
              evalApertureSignedDist(vPaintCoord + vec3(0.0, 0.0, epsA)) - _apSd
            );
            float gApL = length(gAp);
            if (gApL > 1e-6) {
              vec3 gApV = normalize(mat3(viewMatrix) * (gAp / gApL));
              float apRoll = sin(clamp(_apSd / 0.0048, 0.0, 1.0) * 3.14159265);
              vec3 apTilt = -gApV * (0.065 * apRoll);
              _shutBevelTilt += apTilt;
              normal = normalize(normal + apTilt);
            }
          }
        }`,
      )
      .replace(
        '#include <lights_physical_fragment>',
        `#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoat *= (1.0 - 0.94 * max(_shutCavity, _apRimDark));
        #endif`,
      )
      .replace(
        '#include <clearcoat_normal_fragment_maps>',
        `#include <clearcoat_normal_fragment_maps>
        #ifdef USE_CLEARCOAT
          clearcoatNormal = normalize(clearcoatNormal + _shutBevelTilt);
          if (uPeelSlope > 0.0001) {
            vec3 pc = vPaintCoord * uPeelScale;
            vec3 pfw = fwidth(pc);
            float peelAtten = 1.0 / (1.0 + dot(pfw, pfw) * 0.95);
            float e = 0.08;
            float h0 = carSmoothNoise3(pc);
            vec3 gradPeel = vec3(
              carSmoothNoise3(pc + vec3(e, 0.0, 0.0)) - h0,
              carSmoothNoise3(pc + vec3(0.0, e, 0.0)) - h0,
              carSmoothNoise3(pc + vec3(0.0, 0.0, e)) - h0
            ) / e;
            clearcoatNormal = normalize(clearcoatNormal + gradPeel * (uPeelSlope * peelAtten * (1.0 - _shutCavity)));
          }
        #endif`,
      )
      .replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>
        reflectedLight.directSpecular *= uDirectSpecScale;
        #ifdef USE_CLEARCOAT
          clearcoatSpecularDirect *= uDirectSpecScale;
        #endif`,
      );
    mat.userData.shader = shader;
  };

  return mat;
}

/**
 * Pure Dielectric Automotive Laminated Glazing Material:
 *   - `color: 0x000000` eliminates diffuse Lambertian chalk (no opaque baby-blue windshields!),
 *   - Pure sharp specular clearcoat/env reflection modulated by exact unpolarized s/p Fresnel,
 *   - Smoky soda-lime green-charcoal interior absorption (`baseOpacity`),
 *   - Silk-screened black ceramic frit perimeter + halftone dot-matrix band,
 *   - Optional `defrosterLines` (> 0) for copper rear-window heater filaments.
 */
export function createAutomotiveGlassMaterial({
  smokeColor = 0x050807,
  ior = 1.52,
  baseOpacity = 0.20,
  fritWidthUv,
  fritBandUv,
  dotBandUv = 0.026,
  dotFreq = 135.0,
  defrosterLines = 0,
  envMap = null,
  envMapIntensity = 0.92,
} = {}) {
  const resolvedFrit = fritWidthUv ?? fritBandUv ?? 0.038;
  // SINGLE-INTERFACE DIELECTRIC GLAZING LAW:
  // `clearcoat: 0.0` prevents doubling the air-glass Fresnel lobe (`0.042 + 0.040`), keeping windshields
  // and Lexan engine covers crystal-transparent into the 3D cabin/V8 while retaining razor-sharp `roughness: 0.01` glints!
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x000000), // CRITICAL: 0.0 diffuse reflectance on clear dielectric glass!
    metalness: 0.0,
    roughness: 0.010,
    ior,
    clearcoat: 0.0,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    envMap,
    envMapIntensity,
    side: THREE.DoubleSide,
  });

  mat.userData.carRole = 'glass';
  const cacheSig = `car_glass_v2_${resolvedFrit > 0 ? 1 : 0}_def${defrosterLines > 0 ? 1 : 0}`;
  mat.customProgramCacheKey = () => cacheSig;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSmokeCol = { value: new THREE.Color(smokeColor) };
    shader.uniforms.uBaseGlassOpacity = { value: baseOpacity };
    shader.uniforms.uFritWidth = { value: resolvedFrit };
    shader.uniforms.uDotBand = { value: dotBandUv };
    shader.uniforms.uDotFreq = { value: dotFreq };
    shader.uniforms.uGlassIOR = { value: ior };
    shader.uniforms.uDefrosterCount = { value: defrosterLines };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec2 vGlassUv;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_UV
          vGlassUv = uv;
        #else
          vGlassUv = vec2(0.5);
        #endif`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uSmokeCol;
        uniform float uBaseGlassOpacity;
        uniform float uFritWidth;
        uniform float uDotBand;
        uniform float uDotFreq;
        uniform float uGlassIOR;
        uniform float uDefrosterCount;
        varying vec2 vGlassUv;

        float exactDielectricFresnel(float cosThetaI, float eta) {
          float c = clamp(abs(cosThetaI), 0.0, 1.0);
          float sin2T = (1.0 - c * c) / (eta * eta);
          if (sin2T >= 1.0) return 1.0;
          float cosT = sqrt(max(0.0, 1.0 - sin2T));
          float rs = (c - eta * cosT) / max(1e-5, c + eta * cosT);
          float rp = (eta * c - cosT) / max(1e-5, eta * c + cosT);
          return 0.5 * (rs * rs + rp * rp);
        }`,
      )
      .replace(
        '#include <opaque_fragment>',
        `{
          vec3 vDir = normalize(vViewPosition);
          float cosI = clamp(abs(dot(normal, vDir)), 0.0, 1.0);
          float fres = exactDielectricFresnel(cosI, uGlassIOR);

          // Soda-lime subtle green-teal grazing tint on specular reflection
          vec3 specTint = mix(vec3(0.96, 1.0, 0.98), vec3(0.84, 0.96, 0.92), 1.0 - cosI);
          vec3 specLight = outgoingLight * specTint;
          float specLum = dot(specLight, vec3(0.2126, 0.7152, 0.0722));

          // Perimeter ceramic frit band + halftone dot-matrix transition
          float edgeDist = min(min(vGlassUv.x, 1.0 - vGlassUv.x), min(vGlassUv.y, 1.0 - vGlassUv.y));
          float fritMask = 0.0;
          if (uFritWidth > 0.0005) {
            float solidBand = 1.0 - smoothstep(uFritWidth * 0.80, uFritWidth, edgeDist);
            float dotT = clamp((edgeDist - uFritWidth) / max(uDotBand, 1e-4), 0.0, 1.0);
            vec2 cell = fract(vGlassUv * uDotFreq) - 0.5;
            float dotRad = 0.40 * (1.0 - dotT);
            float fw = max(fwidth(vGlassUv.x), fwidth(vGlassUv.y)) * uDotFreq * 0.85;
            float dots = (dotT < 1.0) ? (1.0 - smoothstep(max(0.0, dotRad - fw), dotRad + fw, length(cell))) : 0.0;
            fritMask = clamp(max(solidBand, dots), 0.0, 1.0);
          }

          // Optional thin copper rear-window defroster lines
          float defrostMask = 0.0;
          if (uDefrosterCount > 0.5 && fritMask < 0.5) {
            float lineCoord = vGlassUv.y * uDefrosterCount;
            float distLine = abs(fract(lineCoord) - 0.5);
            float fwL = max(fwidth(lineCoord), 0.025);
            defrostMask = (1.0 - smoothstep(0.035, 0.035 + fwL, distLine)) * 0.55;
          }

          // Un-premultiply single-interface dielectric specular cleanly into standard SRC_ALPHA blending
          // so cabin seats, steering wheel, and mid-engine V8 stay clearly legible underneath crisp spot reflections!
          vec3 cleanSpec = specLight / (1.0 + specLum * 0.14);
          float cleanLum = dot(cleanSpec, vec3(0.2126, 0.7152, 0.0722));
          float glassAlpha = clamp(uBaseGlassOpacity + fres * 0.62 + clamp(cleanLum * 0.34, 0.0, 0.46), 0.08, 0.92);
          vec3 glassCol = (uSmokeCol * uBaseGlassOpacity + cleanSpec) / max(glassAlpha, 0.08);
          glassCol = mix(glassCol, vec3(0.48, 0.18, 0.04) + cleanSpec * 0.45, defrostMask);

          vec3 fritCol = vec3(0.006, 0.007, 0.009) + cleanSpec * 0.32;
          vec3 finalCol = mix(glassCol, fritCol, fritMask);
          float finalAlpha = mix(glassAlpha, 0.995, fritMask);
          gl_FragColor = vec4(finalCol, finalAlpha);
        }`,
      );
  };

  return mat;
}

export function createVulcanizedTireMaterial({
  baseColor = 0x21242b,
  roughness = 0.60,
  treadRibCount = 4.0,
  lugPitch = 68.0,
} = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(baseColor),
    metalness: 0.0,
    roughness,
    specularIntensity: 0.46,
    clearcoat: 0.08,
    clearcoatRoughness: 0.48,
    envMapIntensity: 0.54,
  });

  mat.userData.carRole = 'rubber';
  mat.customProgramCacheKey = () => 'car_vulcanized_tire_v3';

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTreadRibs = { value: treadRibCount };
    shader.uniforms.uLugPitch = { value: lugPitch };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vTireUv;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n#ifdef USE_UV\nvTireUv = uv;\n#else\nvTireUv = vec2(0.5);\n#endif',
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTreadRibs;
        uniform float uLugPitch;
        varying vec2 vTireUv;`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        float _tireSwRelief = 0.0;
        {
          float sym = abs(vTireUv.x - 0.5) * 2.0;
          float treadMask = 1.0 - smoothstep(0.56, 0.70, sym);
          float fwR = max(fwidth(vTireUv.x * uTreadRibs), 0.03);
          float rib = smoothstep(0.14 - fwR, 0.14 + fwR, abs(fract(vTireUv.x * uTreadRibs) - 0.5));
          // Angled V-sipes on tread shoulders
          float lugPhase = vTireUv.y * uLugPitch + sym * 2.4;
          float fwL = max(fwidth(lugPhase), 0.04);
          float shoulderMask = smoothstep(0.28, 0.52, sym) * treadMask;
          float lug = smoothstep(0.16 - fwL, 0.16 + fwL, abs(fract(lugPhase) - 0.5));
          float groove = mix(1.0, rib, treadMask * 0.90) * mix(1.0, lug, shoulderMask * 0.75);

          // Sidewall concentric molding rings & subtle spec lettering band (sym in [0.70, 0.95])
          float swMask = smoothstep(0.68, 0.74, sym) * (1.0 - smoothstep(0.92, 0.97, sym));
          float swRing = sin(sym * 190.0) * 0.5 + 0.5;
          float swLetter = sin(vTireUv.y * 160.0) * sin(sym * 95.0);
          float swFw = max(fwidth(sym * 190.0), 0.1);
          float swVis = 1.0 / (1.0 + swFw * swFw * 0.6);
          float swRelief = mix(0.5, swRing * 0.65 + (swLetter * 0.5 + 0.5) * 0.35, swVis);
          _tireSwRelief = (swRelief - 0.5) * swMask;

          diffuseColor.rgb *= mix(0.32, 1.0, groove) * (1.0 + _tireSwRelief * 0.28);
          roughnessFactor = clamp(roughnessFactor + (1.0 - groove) * 0.20 - swMask * 0.08, 0.44, 0.92);
        }`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        if (abs(_tireSwRelief) > 0.001) {
          normal = normalize(normal + vec3(0.0, _tireSwRelief * 0.22, _tireSwRelief * 0.14));
        }`,
      );
  };

  return mat;
}

/**
 * Tangential lathe-brushed forged alloy material aligned to the car wheel's `X` axle (`YZ` wheel plane!).
 */
export function createAnisotropicAlloyMaterial({
  color = 0xd6dce4,
  metalness = 0.91,
  roughness = 0.17,
  anisotropy = 0.68,
  clearcoat = 0.55,
  clearcoatRoughness = 0.05,
  axleAxis = 'x', // 'x' for standard car wheels (YZ disc), 'z' for XY disc
  envMap = null,
  envMapIntensity = 0.95,
} = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
    anisotropy,
    clearcoat,
    clearcoatRoughness,
    envMap,
    envMapIntensity,
  });

  mat.userData.carRole = 'alloy';
  mat.customProgramCacheKey = () => `car_aniso_alloy_v2_${axleAxis}`;

  const tangVertExpr =
    axleAxis === 'z'
      ? 'vec3(-position.y, position.x, 0.0)'
      : 'vec3(0.0, -position.z, position.y)';

  const radExpr = axleAxis === 'z' ? 'length(vWheelLocal.xy)' : 'length(vWheelLocal.yz)';

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWheelLocal;\nvarying vec3 vWheelViewTang;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vWheelLocal = position;
        {
          vec3 _tObj = ${tangVertExpr};
          float _tL = length(_tObj);
          vec3 _tDir = _tL > 1e-4 ? (_tObj / _tL) : vec3(0.0, 0.0, 1.0);
          vWheelViewTang = normalize((modelViewMatrix * vec4(_tDir, 0.0)).xyz);
        }`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWheelLocal;\nvarying vec3 vWheelViewTang;')
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        {
          float r = ${radExpr} * 240.0;
          float fw = fwidth(r);
          float vis = 1.0 / (1.0 + fw * fw * 1.6);
          float groove = sin(r * 6.2831853) * 0.5;
          roughnessFactor = clamp(roughnessFactor + 0.04 * (1.0 - vis) + groove * 0.022 * vis, 0.06, 0.65);
        }`,
      )
      .replace(
        '#include <lights_physical_fragment>',
        `#include <lights_physical_fragment>
        #ifdef USE_ANISOTROPY
          {
            vec3 _tProj = vWheelViewTang - normal * dot(normal, vWheelViewTang);
            float _tpL = length(_tProj);
            if (_tpL > 1e-4) {
              material.anisotropyT = _tProj / _tpL;
              material.anisotropyB = normalize(cross(normal, material.anisotropyT));
            }
          }
        #endif`,
      );
  };

  return mat;
}

/**
 * Cross-drilled cast-iron or carbon-ceramic Brake Rotor Material (`YZ` plane around `X` axle).
 */
export function createBrakeRotorMaterial({
  carbonCeramic = false,
  envMap = null,
  envMapIntensity = 0.68,
} = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(carbonCeramic ? 0x35383e : 0x7e8692),
    metalness: carbonCeramic ? 0.62 : 0.86,
    roughness: carbonCeramic ? 0.36 : 0.27,
    anisotropy: 0.75,
    envMap,
    envMapIntensity,
  });

  mat.userData.carRole = 'alloy';
  mat.customProgramCacheKey = () => `car_brake_rotor_v3_${carbonCeramic ? 'cc' : 'fe'}`;

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRotorPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRotorPos = position;');

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRotorPos;')
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        {
          float rad = length(vRotorPos.yz);
          float ang = atan(vRotorPos.z, vRotorPos.y);
          // 36 spiral arms x fine 3.8 mm OEM cross-drilled cooling pinholes (never cartoon polka dots!)
          float spiral = ang * (36.0 / 6.2831853) - rad * 22.0;
          vec2 cell = vec2(fract(spiral) - 0.5, fract(rad * 46.0) - 0.5);
          float dHole = length(cell * vec2(1.0, 0.88));
          float fwH = max(fwidth(dHole), 0.032);
          float inBand = step(0.088, rad) * (1.0 - step(0.215, rad));
          float holeMask = (1.0 - smoothstep(0.095 - fwH, 0.095 + fwH, dHole)) * inBand;

          // Tangential brake-pad wear tracks + natural rim-barrel outer radial shadow occlusion!
          float groove = sin(rad * 1150.0) * 0.5;
          float fwG = fwidth(rad * 1150.0);
          float visG = 1.0 / (1.0 + fwG * fwG);
          float barrelShade = mix(1.0, 0.56, smoothstep(0.145, 0.225, rad));

          diffuseColor.rgb *= mix((1.0 + groove * 0.06 * visG) * barrelShade, 0.03, holeMask);
          roughnessFactor = clamp(mix(roughnessFactor, 0.94, holeMask), 0.12, 0.95);
        }`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
        {
          float _radM = length(vRotorPos.yz);
          float _angM = atan(vRotorPos.z, vRotorPos.y);
          float _spM = _angM * (36.0 / 6.2831853) - _radM * 22.0;
          vec2 _cM = vec2(fract(_spM) - 0.5, fract(_radM * 46.0) - 0.5);
          float _dM = length(_cM * vec2(1.0, 0.88));
          float _fwM = max(fwidth(_dM), 0.032);
          float _inM = step(0.088, _radM) * (1.0 - step(0.215, _radM));
          float _hM = (1.0 - smoothstep(0.095 - _fwM, 0.095 + _fwM, _dM)) * _inM;
          metalnessFactor *= (1.0 - _hM);
        }`,
      );
  };

  return mat;
}

/**
 * `fwidth`-filtered Perforated Hexagonal Honeycomb / Slat Grille Material for front bumper intakes
 * and rear mid-engine cooling meshes (e.g., Ferrari F40 rear mesh, Porsche 992 radiator bays).
 */
export function createPerforatedGrilleMaterial({
  baseColor = 0x121418,
  cellScale = 85.0,
} = {}) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(baseColor),
    roughness: 0.48,
    metalness: 0.35,
  });
  mat.userData.carRole = 'trim';
  mat.customProgramCacheKey = () => 'car_hex_grille_v1';

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uGridScale = { value: cellScale };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGrillePos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGrillePos = position;');

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGridScale;\nvarying vec3 vGrillePos;')
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        {
          vec2 p = (vGrillePos.xy + vec2(vGrillePos.z * 0.35, 0.0)) * uGridScale;
          vec2 rowOff = vec2(mod(floor(p.y), 2.0) * 0.5, 0.0);
          vec2 c = fract(p + rowOff) - 0.5;
          float d = length(c);
          float fw = max(max(fwidth(p.x), fwidth(p.y)), 0.05);
          float hole = 1.0 - smoothstep(0.34 - fw * 0.5, 0.34 + fw * 0.5, d);
          float nyq = 1.0 / (1.0 + fw * fw * 1.5);
          hole *= nyq;
          diffuseColor.rgb *= mix(1.0, 0.05, hole);
          roughnessFactor = mix(roughnessFactor, 0.95, hole);
        }`,
      );
  };

  return mat;
}
