---
name: arch-materials-and-weathering
description: >-
  Author hyperrealistic architectural materials in Three.js with zero external
  textures: profiled courses, Nyquist-filtered standing seams, perforated
  Corten steel, glazed roof tiles, non-double-multiplied linear sRGB albedos,
  and fast CPU hashes.
metadata:
  icon: ✨
---

# Architectural Materials, Tectonics & Weathering (`architecture-threejs`)

Every architectural surface must communicate **tectonic unit scale, joint shadow depth, accurate linear colorimetry, and Nyquist-clean micro-relief** without external textures.

## [LOCKED] First-Principles Axioms

1. **Single-Tint Linear Colorimetry & Color-Space Contract:** When a procedural `CanvasTexture` (`SRGBColorSpace`) already encodes pigment, keep `material.color.setHex(0xffffff)` so linear multiplication never squares darkness. Custom `ShaderMaterial`s **with** `#include <colorspace_fragment>` must output linear RGB (`NoColorSpace` on pre-linearized `DataTexture`s); shaders **without** it output sRGB `[0..1]` directly.
2. **`InstancedMesh` World-Space Derivative Invariant:** In `onBeforeCompile`, `modelMatrix * vec4(transformed, 1.0)` omits `instanceMatrix`, breaking `fwidth(vWorldPos)` across scaled/rotated instances. Always pre-apply `#ifdef USE_INSTANCING\n  mgwp = instanceMatrix * mgwp;\n#endif` before `modelMatrix * mgwp`.
3. **Concave Tone-Mapping Contrast Compensation:** Because `sRGB + PBR Neutral` is strictly concave (`f''(L) < 0`), adding linear bounce fill `L_old -> L_new` compresses sRGB Sobel contrast by `~(L_old / L_new)^1.15`; simultaneously scale multiplicative albedo micro-contrast by `(L_new / L_old)^1.1`, and soften harsh grating/soffit sun stripes via energy-conserving sky-bounce split (`diffuseColor *= (1 - k*w); totalEmissiveRadiance += baseAlbedo * c * w;`).
4. **Geometry, Bevel & WebGL2 Shader Hygiene:** Build asymmetric punched walls via `ExtrudeGeometry` (never `rotation.y = Math.PI` mirrored back-shells); evaluate box chamfers across only the **two axes tangential to `vNormal`**; avoid GLSL ES 3.00 reserved identifiers (`patch`, `sample`, `centroid`, `smooth`, `flat`, `active`, `filter`); and generate CPU textures exclusively via `Uint8Array` / `createImageData` + `Math.imul` hashes (`< 5 ms`).

## [REGIME PLAYBOOK] Conditional Rules

- **WHEN tectonic unit projected width `>= 3.0 px`:** Model true 3D beveled/cylindrical courses (logs, clapboards, louvers, brick piers, cornices), assign dark matte expansion-joint returns (`albedo ~ 0.02-0.04, roughness: 0.95`), and hash-jitter per-unit lightness (`±6-12%`) and roughness (`±0.08`).
- **WHEN standing-seam or rib pitch drops `< 2.5 px`:** Pre-integrate ribs into smooth analytical normal/AO strips on a single coplanar mesh instead of sharp `90°` `BoxGeometry` fins (eliminating `±90` sRGB sawtooth Moiré).
- **WHEN shading wide anisotropic facades (`3.5:1+`) or grazing (`< 20°`) floors, carpets, and roads:** Prevent hardware mipmap collapse (`LOD = log2(max(|duv/dx|, |duv/dy|))`) by setting `generateMipmaps = false, minFilter = THREE.LinearFilter` on screen-matched atlases or evaluating 3D world/building tectonics (`vBldPos`) with Nyquist rolloff `1.0 / (1.0 + pow(fw / nyquistM, 2.0))` and a `~2.2-2.9 px` micro-grain window under `RGSS-4`. Project `2-4 mm` 3D aggregate micro-facets on grazing asphalt/concrete (`0.28×` pore depth under road paint) and march `3-4` parallax steps (`V.xz / max(V.y, 0.14)`) through `+Y` carpet/turf tufts.
- **WHEN modeling perforated Corten steel, hit-and-miss screens, or slatted pergolas:** Place `alphaTest: 0.5, DoubleSide` (`shadowSide: DoubleSide`) perforated panels in front of true recessed dark structural framing; keep timber/bamboo pergola slats at physical `~5-7 cm` gaps and tune soffit brightness via albedo/irradiance rather than over-packing slats.
- **WHEN calibrating UV-weathered timber, dark roofs, vehicles, or curtain walls:** Give sun-bleached outdoor wood sky-Fresnel blue balance (`B ≈ 0.58-0.72 × R`), give glazed clay/slate roofs and car clearcoats real sky reflection (`roughness: 0.30-0.38, envMapIntensity: 1.4`), and apply `±0.35°-0.5°` per-pane bow across curtain-wall bays.
- **WHEN reusable onBeforeCompile material factories branch on JavaScript closure parameters:** Assign a deterministic mat.customProgramCacheKey = () => ... encoding every closure branch parameter (or pass shader uniforms), because Three.js WebGLPrograms hashes onBeforeCompile.toString() and otherwise aliases distinct materials onto the first compiled shader.
- **WHEN detailing multi-elevation buildings and full interior rooms across `VIEW 1..N`:** Pull exact wall thicknesses, window/door reveal depths, slab edges, and mullion profiles directly from visual cues in the photographs rather than prescribing generic dimensions. Author consistent tectonic materials, fenestration, roof geometry, and room furnishings/millwork across every facade and interior space evidenced in `VIEW 1..N`, batching repeated mullions, louvers, courses, and props via `InstancedMesh` or `mergeGeometries` so all camera angles retain full micro-detail (`90-110%` Weber sharpness) within `< 250` draw calls.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
