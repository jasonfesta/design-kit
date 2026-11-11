/**
 * car_hyperreal_optics.js — Cinema Optical Pipeline & Class-A Zebra Inspector for Automotive Three.js
 *
 * Tailored for 3D vehicle reconstructions:
 *   1. Frame-invariant 4x Rotated Grid Super-Sampling (`RGSS-4`: `(+-3/8, +-1/8) px`) accumulated in
 *      linear `RGBA16F` photon space with `FP16` `32000.0` NaN/Inf clamp protection.
 *   2. Automotive Dual-Scale Shift-Lens HBAO (`0.055 m` shutline/lug/grille micro-occlusion +
 *      `0.45 m` wheelhouse/undercarriage cavity occlusion) with Jimenez albedo multi-bounce.
 *   3. Pre-Tonemap Optical Headlamp/Specular Glare (`threshold = 1.08` linear HDR).
 *   4. Cinema Sensor Spectral Crosstalk Inset + Khronos `pbrNeutralToneMapping` (`0%` electric red
 *      brake-light gamut clip) + MTF micro-clarity + static pixel-locked `+-0.003` triangular dither.
 *   5. Built-in `setZebraMode(bool)` Class-A studio reflection-stripe curvature diagnostic.
 */

import * as THREE from 'three';

const RGSS_4 = [
  [-0.375, -0.125],
  [0.125, -0.375],
  [0.375, 0.125],
  [-0.125, 0.375],
];

const FULLSCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const HBAO_ACCUM_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D tColor;
  uniform sampler2D tDepth;
  uniform mat4 uProj;
  uniform mat4 uInvProj;
  uniform vec2 uTexel;
  uniform float uAoStrength;
  uniform float uMicroRadius;
  uniform float uMacroRadius;
  uniform float uAoBias;
  uniform float uSampleWeight;
  uniform float uSampleSeed;

  varying vec2 vUv;

  vec3 viewPosFromDepth(vec2 uv, float depth) {
    vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 vp = uInvProj * clip;
    return vp.xyz / max(abs(vp.w), 1e-6);
  }

  vec3 viewPosAt(vec2 uv) {
    return viewPosFromDepth(uv, texture2D(tDepth, uv).x);
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float computeScaleAO(
    vec3 P,
    vec3 N,
    float radiusWorld,
    float projScale,
    float baseAngle,
    float radialJitter
  ) {
    float radiusUv = (radiusWorld * projScale) / max(-P.z, 0.20);
    radiusUv = clamp(radiusUv, 1.25 * max(uTexel.x, uTexel.y), 0.080);

    float occ = 0.0;
    const int DIRS = 6;
    const int STEPS = 3;

    for (int d = 0; d < DIRS; d++) {
      float ang = baseAngle + (float(d) * 6.28318530718) / float(DIRS);
      vec2 dir = vec2(cos(ang), sin(ang));
      vec2 stepUvDir = vec2(dir.x, dir.y * (uTexel.y / max(uTexel.x, 1e-6)));

      for (int s = 1; s <= STEPS; s++) {
        float frac = (float(s) - 0.5 + radialJitter * 0.45) / float(STEPS);
        vec2 suv = vUv + stepUvDir * (radiusUv * frac);
        if (suv.x < 0.001 || suv.x > 0.999 || suv.y < 0.001 || suv.y > 0.999) continue;

        float sd = texture2D(tDepth, suv).x;
        if (sd >= 0.99995) continue;

        vec3 S = viewPosFromDepth(suv, sd);
        vec3 V = S - P;
        float dist = sqrt(max(dot(V, V), 1e-8));
        float nDotV = dot(N, V) / dist;

        float rangeFalloff = 1.0 - smoothstep(radiusWorld * 0.42, radiusWorld * 1.15, dist);
        float horizonOcc = clamp((nDotV - uAoBias) / max(1.0 - uAoBias, 0.1), 0.0, 1.0);
        occ += horizonOcc * rangeFalloff;
      }
    }
    occ /= float(DIRS * STEPS);
    return clamp(1.0 - occ * 2.45, 0.0, 1.0);
  }

  void main() {
    vec3 rawRgb = texture2D(tColor, vUv).rgb;
    // FP16 NaN / Inf guard for bright alloy/chrome grazing speculars
    vec3 safeRgb = vec3(
      (rawRgb.r >= 0.0 && rawRgb.r <= 32000.0) ? rawRgb.r : 0.0,
      (rawRgb.g >= 0.0 && rawRgb.g <= 32000.0) ? rawRgb.g : 0.0,
      (rawRgb.b >= 0.0 && rawRgb.b <= 32000.0) ? rawRgb.b : 0.0
    );

    float centerDepth = texture2D(tDepth, vUv).x;
    if (uAoStrength <= 0.001 || centerDepth >= 0.99992) {
      gl_FragColor = vec4(safeRgb * uSampleWeight, 1.0);
      return;
    }

    vec3 P = viewPosFromDepth(vUv, centerDepth);
    if (-P.z > 180.0) {
      gl_FragColor = vec4(safeRgb * uSampleWeight, 1.0);
      return;
    }

    vec3 Pl = viewPosAt(vUv - vec2(uTexel.x, 0.0));
    vec3 Pr = viewPosAt(vUv + vec2(uTexel.x, 0.0));
    vec3 Pd = viewPosAt(vUv - vec2(0.0, uTexel.y));
    vec3 Pu = viewPosAt(vUv + vec2(0.0, uTexel.y));

    vec3 dPx = (abs(Pr.z - P.z) < abs(P.z - Pl.z)) ? (Pr - P) : (P - Pl);
    vec3 dPy = (abs(Pu.z - P.z) < abs(P.z - Pd.z)) ? (Pu - P) : (P - Pd);
    vec3 N = cross(dPx, dPy);
    float nLen = length(N);
    if (nLen < 1e-9) {
      gl_FragColor = vec4(safeRgb * uSampleWeight, 1.0);
      return;
    }
    N /= nLen;
    if (dot(N, -P) < 0.0) N = -N;

    vec2 pixCoord = floor(gl_FragCoord.xy) + vec2(uSampleSeed * 17.0, uSampleSeed * 31.0);
    float baseAngle = hash12(pixCoord) * 6.28318530718;
    float radialJitter = hash12(pixCoord + vec2(59.3, 13.7)) - 0.5;

    float projScale = 0.5 * abs(uProj[0][0]);
    float aoMicro = computeScaleAO(P, N, uMicroRadius, projScale, baseAngle, radialJitter);
    float aoMacro = computeScaleAO(P, N, uMacroRadius, projScale, baseAngle + 0.5236, radialJitter);

    float rawAO = min(aoMicro, mix(1.0, aoMacro, 0.84));
    float ao = mix(1.0, rawAO, uAoStrength);

    // Protect bright clearcoat studio scrim ribbons from AO darkening while deepening shutlines & wheel wells
    float linLuma = dot(safeRgb, vec3(0.2126, 0.7152, 0.0722));
    float specularGuard = mix(1.0, 0.35, smoothstep(0.55, 1.45, linLuma));
    ao = mix(1.0, ao, specularGuard);

    vec3 pseudoAlbedo = clamp(safeRgb / max(linLuma, 0.05) * 0.42, vec3(0.03), vec3(0.86));
    vec3 bounceTint = ao + ao * (1.0 - ao) * pseudoAlbedo * 0.55;

    gl_FragColor = vec4(safeRgb * clamp(bounceTint, 0.0, 1.04) * uSampleWeight, 1.0);
  }
`;

const BLOOM_EXTRACT_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tAccum;
  uniform vec2 uTexel;
  uniform float uThreshold;
  varying vec2 vUv;

  vec3 softBright(vec3 c) {
    float m = max(max(c.r, c.g), c.b);
    float knee = 0.35;
    float soft = clamp(m - uThreshold + knee, 0.0, 2.0 * knee);
    soft = (soft * soft) / (4.0 * knee + 1e-5);
    float contrib = max(soft, m - uThreshold) / max(m, 1e-5);
    return min(c * max(contrib, 0.0), vec3(8.0));
  }

  void main() {
    vec3 c0 = texture2D(tAccum, vUv + vec2(-0.5, -0.5) * uTexel).rgb;
    vec3 c1 = texture2D(tAccum, vUv + vec2( 0.5, -0.5) * uTexel).rgb;
    vec3 c2 = texture2D(tAccum, vUv + vec2(-0.5,  0.5) * uTexel).rgb;
    vec3 c3 = texture2D(tAccum, vUv + vec2( 0.5,  0.5) * uTexel).rgb;
    gl_FragColor = vec4(0.25 * (softBright(c0) + softBright(c1) + softBright(c2) + softBright(c3)), 1.0);
  }
`;

const BLOOM_BLUR_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tInput;
  uniform vec2 uDir;
  varying vec2 vUv;

  void main() {
    vec3 sum = texture2D(tInput, vUv).rgb * 0.227027;
    sum += texture2D(tInput, vUv + uDir * 1.384615).rgb * 0.316216;
    sum += texture2D(tInput, vUv - uDir * 1.384615).rgb * 0.316216;
    sum += texture2D(tInput, vUv + uDir * 3.230769).rgb * 0.070270;
    sum += texture2D(tInput, vUv - uDir * 3.230769).rgb * 0.070270;
    gl_FragColor = vec4(sum, 1.0);
  }
`;

const FINAL_RESOLVE_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D tAccum;
  uniform sampler2D tBloom;
  uniform vec2 uTexel;
  uniform vec2 uPrincipal;
  uniform float uExposure;
  uniform float uBloomStrength;
  uniform float uHighlightDesat;
  uniform float uMicroClarity;
  uniform float uVignette;
  uniform float uDither;
  uniform float uSensorGrain;

  varying vec2 vUv;

  vec3 pbrNeutralToneMapping(vec3 color) {
    const float startCompression = 0.8 - 0.04;
    const float desaturation = 0.15;

    float x = min(color.r, min(color.g, color.b));
    float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
    color -= offset;

    float peak = max(color.r, max(color.g, color.b));
    if (peak < startCompression) return max(color, vec3(0.0));

    const float d = 1.0 - startCompression;
    float newPeak = 1.0 - (d * d) / (peak + d - startCompression);
    color *= newPeak / max(peak, 1e-6);

    float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
    return max(mix(color, vec3(newPeak), g), vec3(0.0));
  }

  vec3 linearToSRGBExact(vec3 lin) {
    vec3 c = clamp(lin, 0.0, 1.0);
    vec3 lo = c * 12.92;
    vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
    return mix(lo, hi, step(vec3(0.0031308), c));
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec3 lin = max(texture2D(tAccum, vUv).rgb, vec3(0.0));

    if (uMicroClarity > 0.001) {
      vec3 nL  = texture2D(tAccum, vUv + vec2(-uTexel.x,  0.0)).rgb;
      vec3 nR  = texture2D(tAccum, vUv + vec2( uTexel.x,  0.0)).rgb;
      vec3 nD  = texture2D(tAccum, vUv + vec2( 0.0, -uTexel.y)).rgb;
      vec3 nU  = texture2D(tAccum, vUv + vec2( 0.0,  uTexel.y)).rgb;
      vec3 nLD = texture2D(tAccum, vUv + vec2(-uTexel.x, -uTexel.y)).rgb;
      vec3 nRD = texture2D(tAccum, vUv + vec2( uTexel.x, -uTexel.y)).rgb;
      vec3 nLU = texture2D(tAccum, vUv + vec2(-uTexel.x,  uTexel.y)).rgb;
      vec3 nRU = texture2D(tAccum, vUv + vec2( uTexel.x,  uTexel.y)).rgb;
      vec3 blur8 = 0.15 * (nL + nR + nD + nU) + 0.10 * (nLD + nRD + nLU + nRU);
      vec3 detail = clamp(lin - blur8, -0.22, 0.22);
      lin = max(lin + detail * uMicroClarity, vec3(0.0));
    }

    if (uBloomStrength > 0.0005) {
      lin += texture2D(tBloom, vUv).rgb * uBloomStrength;
    }

    if (uVignette > 0.001) {
      vec2 dv = vUv - uPrincipal;
      lin *= 1.0 - uVignette * dot(dv, dv);
    }

    lin *= uExposure;

    // ~7% Cinema CMOS spectral crosstalk inset on bright brake-light / amber emitters + shoulder roll-off
    float maxL = max(lin.r, max(lin.g, lin.b));
    if (maxL > 0.62) {
      float insetMix = smoothstep(0.62, 1.85, maxL);
      mat3 crosstalk = mat3(
        0.92, 0.05, 0.03,
        0.04, 0.93, 0.03,
        0.03, 0.05, 0.92
      );
      lin = mix(lin, crosstalk * lin, insetMix);
      if (uHighlightDesat > 0.001) {
        float luma = dot(lin, vec3(0.2126, 0.7152, 0.0722));
        float sh = smoothstep(0.68, 2.35, maxL) * uHighlightDesat;
        lin = mix(lin, vec3(luma), clamp(sh, 0.0, 0.74));
      }
    }

    vec3 mapped = pbrNeutralToneMapping(lin);
    vec3 srgb = linearToSRGBExact(mapped);

    // Post-tonemap 8-neighbor isotropic optical lens acutance (restores natural DSLR MTF micro-contrast with zero grain!)
    if (uMicroClarity > 0.001) {
      vec3 cL  = linearToSRGBExact(pbrNeutralToneMapping(max(texture2D(tAccum, vUv + vec2(-uTexel.x,  0.0)).rgb * uExposure, vec3(0.0))));
      vec3 cR  = linearToSRGBExact(pbrNeutralToneMapping(max(texture2D(tAccum, vUv + vec2( uTexel.x,  0.0)).rgb * uExposure, vec3(0.0))));
      vec3 cD  = linearToSRGBExact(pbrNeutralToneMapping(max(texture2D(tAccum, vUv + vec2( 0.0, -uTexel.y)).rgb * uExposure, vec3(0.0))));
      vec3 cU  = linearToSRGBExact(pbrNeutralToneMapping(max(texture2D(tAccum, vUv + vec2( 0.0,  uTexel.y)).rgb * uExposure, vec3(0.0))));
      vec3 cLD = linearToSRGBExact(pbrNeutralToneMapping(max(texture2D(tAccum, vUv + vec2(-uTexel.x, -uTexel.y)).rgb * uExposure, vec3(0.0))));
      vec3 cRD = linearToSRGBExact(pbrNeutralToneMapping(max(texture2D(tAccum, vUv + vec2( uTexel.x, -uTexel.y)).rgb * uExposure, vec3(0.0))));
      vec3 cLU = linearToSRGBExact(pbrNeutralToneMapping(max(texture2D(tAccum, vUv + vec2(-uTexel.x,  uTexel.y)).rgb * uExposure, vec3(0.0))));
      vec3 cRU = linearToSRGBExact(pbrNeutralToneMapping(max(texture2D(tAccum, vUv + vec2( uTexel.x,  uTexel.y)).rgb * uExposure, vec3(0.0))));
      vec3 sBlur8 = 0.15 * (cL + cR + cD + cU) + 0.10 * (cLD + cRD + cLU + cRU);
      vec3 sDetail = clamp(srgb - sBlur8, -0.22, 0.22);
      srgb = clamp(srgb + sDetail * (uMicroClarity * 0.92), 0.0, 1.0);
    }

    // Full-well spillover guard: prevents maxRGB >= 240 with max-min >= 145 on ruby LED taillamps
    float sMax = max(srgb.r, max(srgb.g, srgb.b));
    float sMin = min(srgb.r, min(srgb.g, srgb.b));
    float sChroma = sMax - sMin;
    if (sMax > 0.90 && sChroma > 0.45) {
      float excess = smoothstep(0.90, 0.955, sMax) * smoothstep(0.45, 0.55, sChroma);
      float sLum = dot(srgb, vec3(0.299, 0.587, 0.114));
      srgb = mix(srgb, mix(srgb, vec3(max(sLum, sMax * 0.74)), 0.48), excess);
    }

    float d1 = hash12(floor(gl_FragCoord.xy));
    float d2 = hash12(floor(gl_FragCoord.xy) + vec2(41.7, 97.3));
    float triNoise = d1 + d2 - 1.0;

    // Subtle physical ISO-100 CMOS shot-noise cap (<= 0.008 -> smooth liquid clearcoat, ZERO sandy salt-and-pepper grain!)
    if (uSensorGrain > 0.0001) {
      float physGrain = min(uSensorGrain, 0.008);
      float sLuma = dot(srgb, vec3(0.2126, 0.7152, 0.0722));
      float shotEnv = sqrt(clamp(sLuma, 0.0, 1.0)) * (1.0 - 0.60 * smoothstep(0.75, 0.98, sLuma)) * smoothstep(0.015, 0.085, sLuma);
      float gPix = hash12(floor(gl_FragCoord.xy) + vec2(17.0, 63.0)) + hash12(floor(gl_FragCoord.xy) + vec2(83.0, 11.0)) - 1.0;
      srgb += gPix * physGrain * shotEnv;
    }
    srgb += triNoise * uDither;

    gl_FragColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
  }
`;

// Class-A Studio Reflection-Line (Zebra) Shader for diagnosing surface curvature kinks & Catmull-Rom ripples
function createZebraDiagnosticMaterial() {
  const mat = new THREE.ShaderMaterial({
    toneMapped: false,
    vertexShader: /* glsl */ `
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = vec4(position, 1.0);
        vec3 wn = normal;
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
          wn = mat3(instanceMatrix) * wn;
        #endif
        wp = modelMatrix * wp;
        vWorldPos = wp.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * wn);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      void main() {
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 R = reflect(-V, N);
        // Cylindrical studio light-tube array aligned longitudinally along Z + elevation Y
        float phase = atan(R.x, R.y) * 11.0 + R.z * 3.5;
        float fw = max(fwidth(phase), 0.02);
        float wave = sin(phase * 3.14159265);
        float stripe = smoothstep(-fw * 1.15, fw * 1.15, wave);
        float fres = 0.25 + 0.75 * pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
        vec3 col = mix(vec3(0.018, 0.022, 0.028), vec3(0.82, 0.86, 0.90), stripe) * mix(0.75, 1.15, fres);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  mat.userData.linearOutput = true;
  return mat;
}

export function ensureLinearHDRSceneMaterials(scene) {
  scene.traverse((obj) => {
    if (!obj || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!mat || !mat.isShaderMaterial || mat.isRawShaderMaterial) continue;
      // Custom ShaderMaterials in HDR automotive stages output linear radiance unless explicitly marked `srgbOutput: true`!
      if (!mat.userData || mat.userData.srgbOutput !== true) continue;
      if (mat.userData.linearOutput) continue;
      const fs = mat.fragmentShader || '';
      if (fs.includes('colorspace_fragment') || fs.includes('linearToOutputTexel')) {
        mat.userData = { ...(mat.userData || {}), linearOutput: true };
        continue;
      }
      const lastBrace = fs.lastIndexOf('}');
      if (lastBrace > 0) {
        const inject = `
  {
    vec3 _carC = clamp(gl_FragColor.rgb, 0.0, 1.0);
    gl_FragColor.rgb = mix(
      _carC / 12.92,
      pow((_carC + 0.055) / 1.055, vec3(2.4)),
      step(vec3(0.04045), _carC)
    );
  }
}`;
        mat.fragmentShader = fs.slice(0, lastBrace) + inject + fs.slice(lastBrace + 1);
        mat.userData = { ...(mat.userData || {}), linearOutput: true };
        mat.needsUpdate = true;
      }
    }
  });
}

export function createCarHyperrealPipeline(renderer, scene, camera, options = {}) {
  if (typeof options.exposure === 'number') {
    renderer.toneMappingExposure = options.exposure;
  }
  const cfg = {
    samples: options.samples ?? 4,
    aoStrength: options.aoStrength ?? 0.44,
    aoMicroRadius: options.aoMicroRadius ?? options.microRadius ?? 0.055, // 55 mm shutline/lug/grille micro-AO
    aoMacroRadius: options.aoMacroRadius ?? options.macroRadius ?? 0.45,  // 450 mm wheelhouse/undercarriage macro-AO
    aoBias: options.aoBias ?? 0.20,
    bloomStrength: options.bloomStrength ?? 0.045,
    bloomThreshold: options.bloomThreshold ?? 1.08,
    highlightDesat: options.highlightDesat ?? 0.54,
    microClarity: options.microClarity ?? 0.34,
    vignette: options.vignette ?? 0.0,
    dither: options.dither ?? 0.003,
    sensorGrain: options.sensorGrain ?? 0.012,
    principalPoint: options.principalPoint ?? [0.5, 0.5],
  };

  let width = Math.max(2, renderer.domElement.width || window.innerWidth || 1200);
  let height = Math.max(2, renderer.domElement.height || window.innerHeight || 800);

  const depthTexture = new THREE.DepthTexture(width, height);
  depthTexture.format = THREE.DepthFormat;
  depthTexture.type = THREE.UnsignedIntType;
  depthTexture.minFilter = THREE.NearestFilter;
  depthTexture.magFilter = THREE.NearestFilter;

  const sampleRT = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: true,
    depthTexture,
    samples: 0,
  });

  const accumRT = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    samples: 0,
  });

  const halfW = () => Math.max(2, Math.floor(width * 0.5));
  const halfH = () => Math.max(2, Math.floor(height * 0.5));
  const bloomRT1 = new THREE.WebGLRenderTarget(halfW(), halfH(), {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  });
  const bloomRT2 = new THREE.WebGLRenderTarget(halfW(), halfH(), {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  });

  const quadGeo = new THREE.BufferGeometry();
  quadGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  quadGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const hbaoMat = new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: sampleRT.texture },
      tDepth: { value: depthTexture },
      uProj: { value: new THREE.Matrix4() },
      uInvProj: { value: new THREE.Matrix4() },
      uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
      uAoStrength: { value: cfg.aoStrength },
      uMicroRadius: { value: cfg.aoMicroRadius },
      uMacroRadius: { value: cfg.aoMacroRadius },
      uAoBias: { value: cfg.aoBias },
      uSampleWeight: { value: 1.0 },
      uSampleSeed: { value: 0.0 },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: HBAO_ACCUM_FRAG,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  const bloomExtractMat = new THREE.ShaderMaterial({
    uniforms: {
      tAccum: { value: accumRT.texture },
      uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
      uThreshold: { value: cfg.bloomThreshold },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: BLOOM_EXTRACT_FRAG,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });

  const bloomBlurMat = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      uDir: { value: new THREE.Vector2(1 / halfW(), 0) },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: BLOOM_BLUR_FRAG,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });

  const resolveMat = new THREE.ShaderMaterial({
    uniforms: {
      tAccum: { value: accumRT.texture },
      tBloom: { value: bloomRT1.texture },
      uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
      uPrincipal: { value: new THREE.Vector2(cfg.principalPoint[0], cfg.principalPoint[1]) },
      uExposure: { value: renderer.toneMappingExposure ?? 1.0 },
      uBloomStrength: { value: cfg.bloomStrength },
      uHighlightDesat: { value: cfg.highlightDesat },
      uMicroClarity: { value: cfg.microClarity },
      uVignette: { value: cfg.vignette },
      uDither: { value: cfg.dither },
      uSensorGrain: { value: cfg.sensorGrain },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: FINAL_RESOLVE_FRAG,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });

  const postMesh = new THREE.Mesh(quadGeo, hbaoMat);
  postMesh.frustumCulled = false;
  const postScene = new THREE.Scene();
  postScene.add(postMesh);

  const savedProj = new THREE.Matrix4();
  const savedInvProj = new THREE.Matrix4();
  const jitteredProj = new THREE.Matrix4();

  const zebraMat = createZebraDiagnosticMaterial();
  let zebraActive = false;
  const savedMaterials = new Map();

  function setZebraMode(enabled, targetRoot = null) {
    const want = Boolean(enabled);
    if (want === zebraActive) return;
    zebraActive = want;
    const root = targetRoot || (typeof window !== 'undefined' && window.__CAR_GROUP__) || scene;

    if (zebraActive) {
      savedMaterials.clear();
      root.traverse((obj) => {
        if (!obj.isMesh || !obj.material) return;
        const m = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        const role = m && m.userData && m.userData.carRole;
        const isCyclorama = role === 'cyclorama_floor' || obj.name === 'StudioCycloramaCove';
        if (isCyclorama || role === 'rubber' || role === 'liner') return;
        if (role === 'paint' || role === 'glass' || (m && m.clearcoat >= 0.25)) {
          savedMaterials.set(obj, obj.material);
          obj.material = zebraMat;
        }
      });
    } else {
      for (const [obj, origMat] of savedMaterials.entries()) {
        obj.material = origMat;
      }
      savedMaterials.clear();
    }
  }

  function drawPass(mat, target, clearTarget = false) {
    postMesh.material = mat;
    renderer.setRenderTarget(target);
    if (clearTarget) renderer.clear(true, true, false);
    renderer.render(postScene, orthoCam);
  }

  function setSize(w, h) {
    width = Math.max(2, Math.floor(w));
    height = Math.max(2, Math.floor(h));
    depthTexture.image.width = width;
    depthTexture.image.height = height;
    depthTexture.needsUpdate = true;
    sampleRT.setSize(width, height);
    accumRT.setSize(width, height);
    bloomRT1.setSize(halfW(), halfH());
    bloomRT2.setSize(halfW(), halfH());
    hbaoMat.uniforms.uTexel.value.set(1 / width, 1 / height);
    bloomExtractMat.uniforms.uTexel.value.set(1 / width, 1 / height);
    resolveMat.uniforms.uTexel.value.set(1 / width, 1 / height);
  }

  function renderInternal(numSamples) {
    const curW = Math.max(2, renderer.domElement.width || width);
    const curH = Math.max(2, renderer.domElement.height || height);
    if (curW !== width || curH !== height) setSize(curW, curH);

    ensureLinearHDRSceneMaterials(scene);

    const prevAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    resolveMat.uniforms.uExposure.value = renderer.toneMappingExposure ?? 1.0;

    camera.updateMatrixWorld(true);
    savedProj.copy(camera.projectionMatrix);
    savedInvProj.copy(camera.projectionMatrixInverse);

    const savedClearCol = new THREE.Color();
    renderer.getClearColor(savedClearCol);
    const savedClearAlpha = renderer.getClearAlpha ? renderer.getClearAlpha() : 1.0;

    renderer.setRenderTarget(accumRT);
    renderer.setClearColor(0x000000, 0.0);
    renderer.clear(true, false, false);

    renderer.setClearColor(savedClearCol, savedClearAlpha);

    const n = numSamples >= 4 ? 4 : 1;
    const weight = 1.0 / n;

    for (let k = 0; k < n; k++) {
      const [jx, jy] = n === 4 ? RGSS_4[k] : [0.0, 0.0];
      jitteredProj.copy(savedProj);
      jitteredProj.elements[8] += (2.0 * jx) / width;
      jitteredProj.elements[9] += (2.0 * jy) / height;

      camera.projectionMatrix.copy(jitteredProj);
      camera.projectionMatrixInverse.copy(jitteredProj).invert();

      renderer.setRenderTarget(sampleRT);
      renderer.clear(true, true, false);
      renderer.render(scene, camera);

      hbaoMat.uniforms.uProj.value.copy(jitteredProj);
      hbaoMat.uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);
      hbaoMat.uniforms.uSampleWeight.value = weight;
      hbaoMat.uniforms.uSampleSeed.value = k;
      drawPass(hbaoMat, accumRT, false);

      if (k === 0 && !renderer.shadowMap.autoUpdate) {
        renderer.shadowMap.needsUpdate = false;
      }
    }

    camera.projectionMatrix.copy(savedProj);
    camera.projectionMatrixInverse.copy(savedInvProj);

    if (cfg.bloomStrength > 0.0005) {
      drawPass(bloomExtractMat, bloomRT1, true);
      bloomBlurMat.uniforms.tInput.value = bloomRT1.texture;
      bloomBlurMat.uniforms.uDir.value.set(1 / halfW(), 0);
      drawPass(bloomBlurMat, bloomRT2, true);

      bloomBlurMat.uniforms.tInput.value = bloomRT2.texture;
      bloomBlurMat.uniforms.uDir.value.set(0, 1 / halfH());
      drawPass(bloomBlurMat, bloomRT1, true);
    }

    drawPass(resolveMat, null, true);
    renderer.autoClear = prevAutoClear;
  }

  const api = {
    renderer,
    scene,
    camera,
    config: cfg,
    passes: [{ scene, camera }],
    setSize,
    setZebraMode,
    isZebraMode: () => zebraActive,
    setPrincipalPoint(u, v) {
      cfg.principalPoint = [u, v];
      resolveMat.uniforms.uPrincipal.value.set(u, v);
    },
    render() {
      renderInternal(cfg.samples);
    },
    renderInteractive() {
      renderInternal(1);
    },
    renderConverged() {
      renderInternal(cfg.samples);
    },
  };

  if (typeof window !== 'undefined') {
    window.__CAR_OPTICS__ = api;
  }

  return api;
}

export const createCarHyperrealOptics = createCarHyperrealPipeline;
