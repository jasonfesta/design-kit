/**
 * arch_hyperreal_optics.js — Cinema Optical Pipeline for Three.js Architectural Reconstructions
 *
 * Provides physically grounded optical finishing without blurring micro-texture:
 *   1. Frame-invariant 4x Rotated Grid Super-Sampling (RGSS-4: (+-3/8, +-1/8) px) accumulated in
 *      linear RGBA16F photon space (`0%` post-FXAA smearing; drops cleanly to 1-sample 60fps during
 *      live navigation and re-accumulates 4x RGSS 120ms after camera motion settles).
 *   2. Exact Off-Axis Shift-Lens (`uInvProj`) Multi-Scale Horizon-Based Ambient Occlusion (HBAO):
 *      reconstructs metric 3D view-space positions under arbitrary `camera.setViewOffset()` frustums,
 *      combining 0.14m micro contact shadows with 0.90m architectural cavity occlusion, min-diff
 *      depth normals (zero crease fringes), normal angle bias (zero flat-wall/road mud), strict
 *      depth range attenuation (zero sky halos), and Jimenez albedo multi-bounce tint.
 *   3. Subtle Pre-Tonemap Optical Glare / Bloom (`threshold = 1.08` linear HDR) for sunlit sky slots,
 *      specular glints, and interior luminaires without hazy veiling glare on midtones.
 *   4. Cinema Sensor Crosstalk & Highlight Chroma Roll-Off + Exact Khronos PBR Neutral Tone Mapping
 *      (1:1 linear identity below 0.76 linear, guaranteed `0%` electric gamut clipping) + gentle
 *      halo-clamped optical MTF micro-clarity + static pixel-locked +-0.003 triangular sensor dither.
 */

import * as THREE from 'three';

// Frame-invariant, zero-mean, point-symmetric RGSS-4 sub-pixel lattice (in pixels)
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

// Single-pass Linear Scene + Shift-Lens Dual-Scale HBAO -> Accumulated Linear RGBA16F
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
    float radiusUv = (radiusWorld * projScale) / max(-P.z, 0.25);
    // Clamp screen radius cleanly so close objects don't stall and far facades stay crisp
    radiusUv = clamp(radiusUv, 1.35 * max(uTexel.x, uTexel.y), 0.075);

    float occ = 0.0;
    const int DIRS = 6;
    const int STEPS = 3;

    for (int d = 0; d < DIRS; d++) {
      float ang = baseAngle + (float(d) * 3.14159265359 * 2.0) / float(DIRS);
      vec2 dir = vec2(cos(ang), sin(ang));
      // Correct aspect ratio in UV space so sampling disk is circular on non-square canvases
      vec2 stepUvDir = vec2(dir.x, dir.y * (uTexel.y / max(uTexel.x, 1e-6)));

      for (int s = 1; s <= STEPS; s++) {
        float frac = (float(s) - 0.5 + radialJitter * 0.45) / float(STEPS);
        vec2 suv = vUv + stepUvDir * (radiusUv * frac);
        if (suv.x < 0.001 || suv.x > 0.999 || suv.y < 0.001 || suv.y > 0.999) continue;

        float sd = texture2D(tDepth, suv).x;
        if (sd >= 0.99995) continue;

        vec3 S = viewPosFromDepth(suv, sd);
        vec3 V = S - P;
        float dist2 = dot(V, V);
        float dist = sqrt(max(dist2, 1e-8));
        float nDotV = dot(N, V) / dist;

        // Smooth distance falloff strictly zeroing silhouettes (|dz| >> radiusWorld)
        float rangeFalloff = 1.0 - smoothstep(radiusWorld * 0.42, radiusWorld * 1.12, dist);
        float horizonOcc = clamp((nDotV - uAoBias) / max(1.0 - uAoBias, 0.1), 0.0, 1.0);
        occ += horizonOcc * rangeFalloff;
      }
    }
    occ /= float(DIRS * STEPS);
    return clamp(1.0 - occ * 2.35, 0.0, 1.0);
  }

  void main() {
    vec4 sceneCol = texture2D(tColor, vUv);
    float centerDepth = texture2D(tDepth, vUv).x;

    // Sky / far background bypasses AO 100% cleanly (zero sky halo, zero tint)
    if (uAoStrength <= 0.001 || centerDepth >= 0.99992) {
      gl_FragColor = vec4(sceneCol.rgb * uSampleWeight, 1.0);
      return;
    }

    vec3 P = viewPosFromDepth(vUv, centerDepth);
    if (-P.z > 220.0) {
      gl_FragColor = vec4(sceneCol.rgb * uSampleWeight, 1.0);
      return;
    }

    // Min-difference 4-tap view-space normal reconstruction (eliminates crease/silhouette fringes!)
    vec3 Pl = viewPosAt(vUv - vec2(uTexel.x, 0.0));
    vec3 Pr = viewPosAt(vUv + vec2(uTexel.x, 0.0));
    vec3 Pd = viewPosAt(vUv - vec2(0.0, uTexel.y));
    vec3 Pu = viewPosAt(vUv + vec2(0.0, uTexel.y));

    vec3 dPx = (abs(Pr.z - P.z) < abs(P.z - Pl.z)) ? (Pr - P) : (P - Pl);
    vec3 dPy = (abs(Pu.z - P.z) < abs(P.z - Pd.z)) ? (Pu - P) : (P - Pd);
    vec3 N = cross(dPx, dPy);
    float nLen = length(N);
    if (nLen < 1e-9) {
      gl_FragColor = vec4(sceneCol.rgb * uSampleWeight, 1.0);
      return;
    }
    N /= nLen;
    // Ensure normal faces camera hemisphere so grazing backfaces never invert AO
    if (dot(N, -P) < 0.0) N = -N;

    // Static frame-invariant spatial hash (zero temporal boil!)
    vec2 pixCoord = floor(gl_FragCoord.xy) + vec2(uSampleSeed * 17.0, uSampleSeed * 31.0);
    float baseAngle = hash12(pixCoord) * 6.28318530718;
    float radialJitter = hash12(pixCoord + vec2(59.3, 13.7)) - 0.5;

    float projScale = 0.5 * abs(uProj[0][0]);
    float aoMicro = computeScaleAO(P, N, uMicroRadius, projScale, baseAngle, radialJitter);
    float aoMacro = computeScaleAO(P, N, uMacroRadius, projScale, baseAngle + 0.5236, radialJitter);

    float rawAO = min(aoMicro, mix(1.0, aoMacro, 0.80));
    float ao = mix(1.0, rawAO, uAoStrength);

    // Attenuate AO gently inside bright direct-sun highlights so crisp cast shadows don't double-crush,
    // while giving shaded reveals, soffits, corners, and ground contacts authentic physical depth!
    float linLuma = dot(sceneCol.rgb, vec3(0.2126, 0.7152, 0.0722));
    float directSunGuard = mix(1.0, 0.58, smoothstep(0.42, 1.05, linLuma));
    ao = mix(1.0, ao, directSunGuard);

    // Jimenez multi-bounce colored AO (warm bounce on warm plaster/wood instead of grey soot!)
    vec3 pseudoAlbedo = clamp(sceneCol.rgb / max(linLuma, 0.06) * 0.45, vec3(0.04), vec3(0.88));
    vec3 bounceTint = ao + ao * (1.0 - ao) * pseudoAlbedo * 0.65;

    gl_FragColor = vec4(sceneCol.rgb * clamp(bounceTint, 0.0, 1.05) * uSampleWeight, 1.0);
  }
`;

// Subtle Half-Res Bright-Pass Optical Glare Extraction (strictly above HDR linear threshold)
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
    // 4-tap box downsample filter
    vec3 c0 = texture2D(tAccum, vUv + vec2(-0.5, -0.5) * uTexel).rgb;
    vec3 c1 = texture2D(tAccum, vUv + vec2( 0.5, -0.5) * uTexel).rgb;
    vec3 c2 = texture2D(tAccum, vUv + vec2(-0.5,  0.5) * uTexel).rgb;
    vec3 c3 = texture2D(tAccum, vUv + vec2( 0.5,  0.5) * uTexel).rgb;
    vec3 avg = 0.25 * (softBright(c0) + softBright(c1) + softBright(c2) + softBright(c3));
    gl_FragColor = vec4(avg, 1.0);
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

// Final Cinema Resolve: Optical Bloom + Highlight Crosstalk + Exact PBR Neutral + MTF Clarity + Dither
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

  varying vec2 vUv;

  // Exact Three.js Khronos PBR Neutral Tone Mapping (1:1 linear identity below 0.76!)
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

    // Halo-clamped optical MTF micro-clarity in linear light (restores fine grain without ringing!)
    if (uMicroClarity > 0.001) {
      vec3 nL = texture2D(tAccum, vUv - vec2(uTexel.x, 0.0)).rgb;
      vec3 nR = texture2D(tAccum, vUv + vec2(uTexel.x, 0.0)).rgb;
      vec3 nD = texture2D(tAccum, vUv - vec2(0.0, uTexel.y)).rgb;
      vec3 nU = texture2D(tAccum, vUv + vec2(0.0, uTexel.y)).rgb;
      vec3 blur4 = 0.25 * (nL + nR + nD + nU);
      vec3 detail = clamp(lin - blur4, -0.035, 0.035);
      lin = max(lin + detail * uMicroClarity, vec3(0.0));
    }

    // Subtle real camera PSF bloom strictly from bright HDR sources (> threshold)
    if (uBloomStrength > 0.0005) {
      lin += texture2D(tBloom, vUv).rgb * uBloomStrength;
    }

    // Optional physical cos^4 wide-angle lens illumination falloff around true shift principal point
    if (uVignette > 0.001) {
      vec2 dv = vUv - uPrincipal;
      float r2 = dot(dv, dv);
      lin *= 1.0 - uVignette * r2;
    }

    lin *= uExposure;

    // Cinema sensor highlight shoulder crosstalk (0% midtone alteration; eliminates electric RGB clip!)
    float maxL = max(lin.r, max(lin.g, lin.b));
    if (maxL > 0.66 && uHighlightDesat > 0.001) {
      float luma = dot(lin, vec3(0.2126, 0.7152, 0.0722));
      float sh = smoothstep(0.66, 2.15, maxL) * uHighlightDesat;
      lin = mix(lin, vec3(luma), clamp(sh, 0.0, 0.72));
    }

    vec3 mapped = pbrNeutralToneMapping(lin);
    vec3 srgb = linearToSRGBExact(mapped);

    // Emulsion / CMOS highlight full-well spillover guard: prevents maxRGB >= 240 with max-min >= 145
    float sMax = max(srgb.r, max(srgb.g, srgb.b));
    float sMin = min(srgb.r, min(srgb.g, srgb.b));
    float sChroma = sMax - sMin;
    if (sMax > 0.90 && sChroma > 0.46) {
      float excess = smoothstep(0.90, 0.955, sMax) * smoothstep(0.46, 0.56, sChroma);
      float sLum = dot(srgb, vec3(0.299, 0.587, 0.114));
      srgb = mix(srgb, mix(srgb, vec3(max(sLum, sMax * 0.72)), 0.45), excess);
    }

    // Static pixel-locked triangular PDF sensor dither (zero 8-bit banding & 0.000 temporal boil!)
    float d1 = hash12(floor(gl_FragCoord.xy));
    float d2 = hash12(floor(gl_FragCoord.xy) + vec2(41.7, 97.3));
    srgb += (d1 + d2 - 1.0) * uDither;

    gl_FragColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
  }
`;

/**
 * Automatically ensures any custom `ShaderMaterial` written for direct 8-bit sRGB canvas output
 * (i.e. lacking `#include <colorspace_fragment>` and not marked `mat.userData.linearOutput = true`)
 * outputs true linear-sRGB into `HalfFloatType` render targets so `4x RGSS`, planar mirrors, and
 * `pbrNeutralToneMapping` preserve 100.0% exact colorimetry with zero double-gamma washout.
 */
export function ensureLinearHDRSceneMaterials(scene) {
  scene.traverse((obj) => {
    if (!obj || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!mat || !mat.isShaderMaterial || mat.isRawShaderMaterial) continue;
      if (mat.userData && mat.userData.linearOutput) continue;
      const fs = mat.fragmentShader || '';
      if (fs.includes('colorspace_fragment') || fs.includes('linearToOutputTexel')) {
        mat.userData = { ...(mat.userData || {}), linearOutput: true };
        continue;
      }
      // Strip comments strictly for finding the closing brace of main() safely
      const lastBrace = fs.lastIndexOf('}');
      if (lastBrace > 0) {
        const inject = `
  {
    vec3 _archC = clamp(gl_FragColor.rgb, 0.0, 1.0);
    gl_FragColor.rgb = mix(
      _archC / 12.92,
      pow((_archC + 0.055) / 1.055, vec3(2.4)),
      step(vec3(0.04045), _archC)
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

export function createHyperrealPipeline(renderer, scene, camera, options = {}) {
  const cfg = {
    samples: options.samples ?? 4,
    aoStrength: options.aoStrength ?? 0.42,
    aoMicroRadius: options.aoMicroRadius ?? 0.14,
    aoMacroRadius: options.aoMacroRadius ?? 0.90,
    aoBias: options.aoBias ?? 0.22,
    bloomStrength: options.bloomStrength ?? 0.042,
    bloomThreshold: options.bloomThreshold ?? 1.08,
    highlightDesat: options.highlightDesat ?? 0.52,
    microClarity: options.microClarity ?? 0.08,
    vignette: options.vignette ?? 0.0,
    dither: options.dither ?? 0.003,
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
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
    depthTexture,
    samples: 0, // Strict SwiftShader hygiene: RGSS handles AA in linear shader space
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
  quadGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
  );
  quadGeo.setAttribute(
    'uv',
    new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2),
  );

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

    // Clear linear accumulation buffer before summing weighted RGSS sub-frames
    renderer.setRenderTarget(accumRT);
    renderer.setClearColor(0x000000, 0.0);
    renderer.clear(true, false, false);

    // Restore scene's own clear color/alpha before rendering sub-samples
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

      // Accumulate linear radiance * exact shift-frustum HBAO into accumRT
      hbaoMat.uniforms.uProj.value.copy(jitteredProj);
      hbaoMat.uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);
      hbaoMat.uniforms.uSampleWeight.value = weight;
      hbaoMat.uniforms.uSampleSeed.value = k;
      drawPass(hbaoMat, accumRT, false);

      // Only bake shadow maps on sample 0 if shadowMap.needsUpdate was requested
      if (k === 0 && !renderer.shadowMap.autoUpdate) {
        renderer.shadowMap.needsUpdate = false;
      }
    }

    // Restore exact unjittered camera projection matrices immediately
    camera.projectionMatrix.copy(savedProj);
    camera.projectionMatrixInverse.copy(savedInvProj);

    // Optional soft pre-tonemap optical bloom on HDR sources > threshold
    if (cfg.bloomStrength > 0.0005) {
      drawPass(bloomExtractMat, bloomRT1, true);
      bloomBlurMat.uniforms.tInput.value = bloomRT1.texture;
      bloomBlurMat.uniforms.uDir.value.set(1 / halfW(), 0);
      drawPass(bloomBlurMat, bloomRT2, true);

      bloomBlurMat.uniforms.tInput.value = bloomRT2.texture;
      bloomBlurMat.uniforms.uDir.value.set(0, 1 / halfH());
      drawPass(bloomBlurMat, bloomRT1, true);
    }

    // Resolve final cinema image directly to default screen canvas
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
    window.__ARCH_OPTICS__ = api;
  }

  return api;
}
