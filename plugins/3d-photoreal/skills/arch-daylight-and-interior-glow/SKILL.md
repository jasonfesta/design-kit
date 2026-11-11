---
name: arch-daylight-and-interior-glow
description: >-
  Calibrate overcast diffuse skies, solar cast-shadow azimuth/elevation,
  scoped PMREM environment maps (preventing interior grazing Fresnel leaks),
  analytic planar glass reflections, and Neutral vs. AgX tone mapping in
  Three.js.
metadata:
  icon: ✨
---

# Architectural Daylight, Sky Radiance & Interior Glow (`architecture-threejs`)

Architectural photography is governed by the balance between **sky/soffit irradiance**, **calibrated solar shadow geometry**, **role-split environment reflections**, and **true 3D interior/reflected depth**.

## [LOCKED] First-Principles Axioms

1. **Cinema Optical Pipeline (`createHyperrealPipeline` in `arch_hyperreal_optics.js`):** Accumulate frame-invariant `4× RGSS` (`±3/8, ±1/8 px`) in `THREE.HalfFloatType` (`RGBA16F`) linear HDR, evaluate dual-scale (`0.14 m` + `0.90 m`) shift-lens `HBAO` via exact `uInvProj`, and resolve through soft `threshold = 1.08` bloom, highlight crosstalk roll-off (`ChromaClip <= 0.10%`), `pbrNeutralToneMapping`, and static `±0.003` triangular sensor dither.
2. **Three.js `r155+` `1/PI` Lambertian & `PBR Neutral` Shoulder Law:** `MeshStandardMaterial` divides `map * color` by `Math.PI` (`sun ~ 3.4-5.0, hemi ~ 1.0-1.4`). Keep sunlit white diffuse peaks within `0.76-0.85` linear so `pbrNeutralToneMapping`'s shoulder (`x >= 0.76`) never crushes stone/plaster micro-contrast; keep shadowed masonry `emissive <= 0x030404` modulated by `texMod`; and invert `pbrNeutral` (`lin = srgbToLinear(c) + 0.04` for `minRGB >= 0.04`) on custom linear `ShaderMaterial`s.
3. **`PMREMGenerator` Cube-Target & Scissor Reset Invariant (`r187+`):** Three.js `r187+` replaced the packed `CubeUV` atlas with cube render targets and **removed `THREE.CubeUVReflectionMapping`** (never reference `CubeUVReflectionMapping` or `textureCubeUV`). Immediately after `pmrem.fromScene(...)`, always call `renderer.setRenderTarget(null); renderer.setViewport(0, 0, width, height); renderer.setScissor(0, 0, width, height); renderer.setScissorTest(false);` (defensive guard against pre-`r187` `768 px` scissor mutation).
4. **Right-Handed (`det = +1`) Off-Axis Planar Mirror Projection:** Never call `mirrorCam.projectionMatrix.copy(cam.projectionMatrix)` (which clobbers oblique `near` back to `0.15`). Set `mirrorCam.near = Math.max(0.2, distToGlass + 0.08); mirrorCam.clearViewOffset(); mirrorCam.updateProjectionMatrix();` **first**, then copy only `elements[8] = -cam.projectionMatrix.elements[8]` and `elements[9] = cam.projectionMatrix.elements[9]`, rendering linear tone-mapped sky domes + real behind-camera (`Z > Z_cam`) 3D context.

## [REGIME PLAYBOOK] Conditional Rules

- **WHEN `enclosure_regime == "open_exterior"` (Overcast vs. Direct Sun):** Under overcast decks, drive `80%+` of irradiance via `HemisphereLight` + `PMREM` (`DirectionalLight 0.15-0.35`) with sky calibrated to `open_sky_p85_srgb`. Under direct sun, solve solar `(azimuth, elevation)` from cast window/pergola shadow slopes (`tan(phi) = du / dv`) with white-card neutral `0xfffaf1` sun, and project all 8 corners of off-frustum shadow casters (`colorWrite: false, depthWrite: false, castShadow: true`) along `-sunDir / sunDir.y`.
- **WHEN `enclosure_regime` is `"enclosed_interior"` or `"semi_outdoor_loggia"` (Role-Split IBL):** Keep `scene.environment = null` and zero atmospheric fog so single-scatter Schlick Fresnel never washes shaded timber/plaster walls blue (`+80..+120` sRGB at `70°-82°`). Bind `material.envMap = pmremTex` selectively only to glass, water, vehicles, and metals (`metalness > 0.15`).
- **WHEN modeling daytime apertures vs. dusk lit interiors:** Build real 3D recessed jambs (`ShapeGeometry` with `Path` holes, pulling exact wall thickness and reveal depth from the reference photos) and **complete 3D interior rooms** (full partitions, ceilings, flooring, cabinetry, seating, tables, shelving, rugs, vitrines, and luminaires as shown across `VIEW 1..N`—never `< 8 sRGB` cutouts or bare structural proxy blocks). Add `2700K` interior glow when `warm_emissive_aperture_count > 0`, confining exterior soffit `PointLight`s (`distance <= 9.0m, decay = 2.0`).
- **WHEN shading low cantilevers (`< 1.5 m`), warm timber soffits, or backlit slender mullions:** Analytically attenuate under-cantilever `HemisphereLight` (`underBoxAO`), add upward sunlit-paving bounce (`0.30-0.42`) onto warm timber soffits, and lift slender dark mullions in front of bright backlit glass (`L > 210 sRGB`) to `sRGB 55-90` for camera PSF veiling glare.
- **WHEN saturated colored laminated glass or planar floor/water mirrors render under pbrNeutral and camera.setViewOffset:** Keep non-zero linear minor-channel Beer-Lambert transmittance (G >= 0.025*R, B >= 0.030*R) to maintain 0% chroma_clip_pct, and on planar mirrors call mirrorCam.clearViewOffset() before negating projectionMatrix.elements[8] so lens-shifted frusta align without clipping.
- **WHEN reconciling Hero (`VIEW 1`) daylight with multi-angle interior/twilight views (`VIEW 2..N`):** **NEVER** place floating 2D emissive sky-portal cards or backdrop flats outside windows (they float visibly in exterior/aerial views); admit daylight through true 3D glazed apertures from the 360° sky/site. Lock global sun/sky/weather to `VIEW 1`, and use camera-local `exposureBias` (EV stops) or `interiorLuminaireGain` (`window.__ARCH_INTERIOR_LIGHTS__`) in `window.__ARCH_CAMERAS__` for indoor or dusk secondary views without penalizing `VIEW 2..N` on raw pixel/shadow-time differences.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
