import * as THREE from "three";
import {
  capNormalSofteningHook,
  ditherHook,
  patchStandardMaterial,
  type ShaderHook,
} from "@/three/rig/shaderHooks";

/**
 * Cuboid card material: MeshStandardMaterial + shared rig hooks
 * (cap-normal softening, dither) + a scene-specific `map_fragment` that
 * composites the content and hover CanvasTextures on the +Z cap only.
 */

export const CARD_MAP_FRAGMENT_GLSL = `vec3 _cardBase = mix(uBaseColor, uAccentColor, clamp(uHover, 0.0, 1.0));
diffuseColor.rgb = _cardBase;
#ifdef USE_MAP
  vec4 _contentSample = texture2D( map, vMapUv );
  vec4 _hoverSample = texture2D( uHoverMap, vMapUv );
  vec3 _contentRgb = pow(max(_contentSample.rgb, vec3(0.0)), vec3(2.2));
  vec3 _hoverRgb = pow(max(_hoverSample.rgb, vec3(0.0)), vec3(2.2));

  float _isSubtitle = step(0.88, vMapUv.y);
  float _isPill = 1.0 - step(0.20, vMapUv.y);
  float _contentMask = 1.0 - clamp(uHover, 0.0, 1.0) * max(_isSubtitle, _isPill);

  float _hoverWeight = clamp(uHover, 0.0, 1.0) * (
    _isSubtitle * uSubtitleOpacity +
    _isPill * mix(uPillBgOpacity, 1.0, step(0.5, _hoverSample.r)) +
    (1.0 - max(_isSubtitle, _isPill))
  );

  vec3 _blendedCard = mix(_cardBase, _contentRgb, _contentSample.a * _contentMask * vFrontBlend);
  _blendedCard = mix(_blendedCard, _hoverRgb, _hoverSample.a * _hoverWeight * vFrontBlend);
  diffuseColor.rgb = _blendedCard;
#endif`;

export interface CuboidUniforms {
  uHalfDepth: { value: number };
  uCapBand: { value: number };
  uBaseColor: { value: THREE.Color };
  uAccentColor: { value: THREE.Color };
  uHover: { value: number };
  uHoverMap: { value: THREE.Texture };
  uSubtitleOpacity: { value: number };
  uPillBgOpacity: { value: number };
  uDither: { value: number };
}

export interface CuboidMaterialHandle {
  material: THREE.MeshStandardMaterial;
  uniforms: CuboidUniforms;
}

function cardCompositeHook(params: {
  hoverTexture: THREE.Texture;
  baseColor: string;
  accentColor: string;
  subtitleOpacity: number;
  pillBgOpacity: number;
}): ShaderHook {
  return {
    id: "card-composite",
    uniforms: {
      uBaseColor: { value: new THREE.Color(params.baseColor) },
      uAccentColor: { value: new THREE.Color(params.accentColor) },
      uHover: { value: 0 },
      uHoverMap: { value: params.hoverTexture },
      uSubtitleOpacity: { value: params.subtitleOpacity },
      uPillBgOpacity: { value: params.pillBgOpacity },
    },
    patches: [
      {
        stage: "fragment",
        anchor: "#include <common>",
        code: `uniform vec3 uBaseColor;
uniform vec3 uAccentColor;
uniform float uHover;
uniform sampler2D uHoverMap;
uniform float uSubtitleOpacity;
uniform float uPillBgOpacity;`,
      },
      { stage: "fragment", anchor: "#include <map_fragment>", code: CARD_MAP_FRAGMENT_GLSL, mode: "replace" },
    ],
  };
}

export function createCuboidMaterial(params: {
  contentTexture: THREE.Texture;
  hoverTexture: THREE.Texture;
  baseColor: string;
  accentColor: string;
  roughness: number;
  metalness: number;
  halfDepth: number;
  capBand: number;
  subtitleOpacity: number;
  pillBgOpacity: number;
  dither: number;
}): CuboidMaterialHandle {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: params.contentTexture,
    roughness: params.roughness,
    metalness: params.metalness,
    envMapIntensity: 0,
    dithering: true,
    transparent: true,
    opacity: 1,
  });

  const uniforms = patchStandardMaterial(
    material,
    [
      capNormalSofteningHook(params.halfDepth, params.capBand),
      cardCompositeHook(params),
      ditherHook(params.dither),
    ],
    "cuboid-card-standard-v1",
  ) as unknown as CuboidUniforms;

  return { material, uniforms };
}
