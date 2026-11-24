import * as THREE from "three";

/**
 * Shared `onBeforeCompile` shader hooks for the 3D UI rig.
 *
 * Every hook is a small, composable patch over a stock three.js
 * MeshStandardMaterial program. Compose them with `patchStandardMaterial`
 * so a scene module only writes the GLSL that is specific to it.
 *
 *   - Screen-space dither: hash noise added after `colorspace_fragment`
 *     to kill banding on dark matte gradients.
 *   - Bevel cap-normal softening: bends front/back cap normals near the
 *     bevel edge toward ±Z and exports `vFrontBlend` (1 on the +Z cap,
 *     fading to 0 across the bevel) so CanvasTexture UI only shows on the
 *     front face.
 */

export type ShaderUniforms = Record<string, THREE.IUniform>;

/** A string patch applied to one `#include <chunk>` anchor. */
export interface ShaderPatch {
  stage: "vertex" | "fragment";
  /** e.g. "#include <common>" */
  anchor: string;
  code: string;
  /** after (default) keeps the anchor and appends `code`; replace drops it. */
  mode?: "after" | "before" | "replace";
}

export interface ShaderHook {
  id: string;
  uniforms: ShaderUniforms;
  patches: ShaderPatch[];
}

type CompiledShader = Parameters<THREE.Material["onBeforeCompile"]>[0];

export function applyPatches(shader: CompiledShader, patches: ShaderPatch[]): void {
  for (const p of patches) {
    const key = p.stage === "vertex" ? "vertexShader" : "fragmentShader";
    const src = shader[key];
    if (!src.includes(p.anchor)) {
      console.warn(`[3d-ui-jig] shader anchor not found: ${p.anchor}`);
      continue;
    }
    const mode = p.mode ?? "after";
    const replacement =
      mode === "replace"
        ? p.code
        : mode === "before"
          ? `${p.code}\n${p.anchor}`
          : `${p.anchor}\n${p.code}`;
    shader[key] = src.replace(p.anchor, replacement);
  }
}

/**
 * Install a list of hooks on a material. All hook uniforms are merged into
 * the program and returned so callers can drive them per frame.
 */
export function patchStandardMaterial<M extends THREE.Material>(
  material: M,
  hooks: ShaderHook[],
  cacheKey: string,
): ShaderUniforms {
  const uniforms: ShaderUniforms = {};
  for (const h of hooks) Object.assign(uniforms, h.uniforms);
  material.customProgramCacheKey = () => cacheKey;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    for (const h of hooks) applyPatches(shader, h.patches);
  };
  return uniforms;
}

// ---------------------------------------------------------------- dither

export const DITHER_GLSL = `float _ditherNoise = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * uDither;
gl_FragColor.rgb += _ditherNoise;`;

export function ditherHook(initial = 0): ShaderHook {
  return {
    id: "dither",
    uniforms: { uDither: { value: initial } },
    patches: [
      { stage: "fragment", anchor: "#include <common>", code: "uniform float uDither;" },
      { stage: "fragment", anchor: "#include <colorspace_fragment>", code: DITHER_GLSL },
    ],
  };
}

// ---------------------------------------------------------------- bevel cap

export const CAP_SOFTEN_GLSL = `float _frontT = smoothstep(uHalfDepth - uCapBand, uHalfDepth, position.z);
float _backT = smoothstep(uHalfDepth - uCapBand, uHalfDepth, -position.z);
vec3 _capN = normalize(mix(objectNormal, vec3(0.0, 0.0, 1.0), _frontT));
_capN = normalize(mix(_capN, vec3(0.0, 0.0, -1.0), _backT));
objectNormal = _capN;
vFrontBlend = _frontT * smoothstep(0.08, 0.5, _capN.z);`;

/**
 * Needs a geometry centred on Z (extruded, `geometry.center()`), with
 * `halfDepth = depth / 2` and `capBand ≈ 2.2 * max(bevelThickness, bevelSize)`.
 * Declares `varying float vFrontBlend` in both stages.
 */
export function capNormalSofteningHook(halfDepth: number, capBand: number): ShaderHook {
  return {
    id: "cap-soften",
    uniforms: {
      uHalfDepth: { value: halfDepth },
      uCapBand: { value: capBand },
    },
    patches: [
      {
        stage: "vertex",
        anchor: "#include <common>",
        code: "uniform float uHalfDepth;\nuniform float uCapBand;\nvarying float vFrontBlend;",
      },
      { stage: "vertex", anchor: "#include <beginnormal_vertex>", code: CAP_SOFTEN_GLSL },
      { stage: "fragment", anchor: "#include <common>", code: "varying float vFrontBlend;" },
    ],
  };
}

// ---------------------------------------------------------------- helpers

export interface DitheredStandardHandle {
  material: THREE.MeshStandardMaterial;
  uniforms: { uDither: { value: number } };
}

/** MeshStandardMaterial + screen-space dither. Used by the backdrop and placeholder meshes. */
export function createDitheredStandardMaterial(params: {
  color: string;
  roughness: number;
  metalness: number;
  envIntensity?: number;
  dither?: number;
  cacheKey?: string;
}): DitheredStandardHandle {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(params.color),
    roughness: params.roughness,
    metalness: params.metalness,
    envMapIntensity: params.envIntensity ?? 1,
    dithering: true,
  });
  const uniforms = patchStandardMaterial(
    material,
    [ditherHook(params.dither ?? 0)],
    params.cacheKey ?? "3d-ui-jig-dithered-standard-v1",
  ) as { uDither: { value: number } };
  return { material, uniforms };
}

/** GLSL snippets the prompt exporter quotes verbatim. */
export const RIG_SHADER_SNIPPETS: { name: string; glsl: string }[] = [
  { name: "Screen-space dither (after #include <colorspace_fragment>)", glsl: DITHER_GLSL },
  { name: "Bevel cap-normal softening (after #include <beginnormal_vertex>)", glsl: CAP_SOFTEN_GLSL },
];
