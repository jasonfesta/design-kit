# Pure Procedural Three.js Chair Geometry & Material Tectonics

Every chair (`Chair A` 1-to-1 reconstruction and `Chair B` original synthesis) must be built with **real furniture joinery, tactile thickness, welded smooth normals, and procedural micro-materials** -- zero raw `BoxGeometry` slabs and zero projected reference images.

---

## 1. Five Canonical Procedural Chair Geometry Builders

1. **Molded Plywood / Bent Fiberglass / Polypropylene Shells (`catmullRomLoft`)**:
   - Sample `18 - 28` cross-section stations from front waterfall seat lip -> lumbar curve -> upper backrest crest.
   - Give every shell **true physical wall thickness** (`7 - 13 mm` for molded birch/walnut plywood; `5 - 8 mm` for fiberglass/injection polymer) with exposed multi-ply edge laminations on plywood rims and a `3 - 5 mm` filleted lip radius (`0` paper-thin single-sided planes).
   - Run spatial-hashed `weldSmoothNormals(geo, 68)` so specular highlights glide continuously across compound saddle curvature.
2. **Tubular Steel Cantilevers & Steam-Bent Wood Frames (`splineTube` with Parallel Transport)**:
   - Construct continuous cantilevered frames (`Ø 20 - 25 mm` chrome/powder-coated steel) and steam-bent beech/oak loops (`Ø 26 - 34 mm` tapered rails) along `CatmullRomCurve3` paths using **Bishop / parallel-transport frames** (never Frenet frames, which twist `180 deg` at inflection points!).
   - Model real bend radii (`R_bend = 45 - 85 mm`), tube end-caps / Delrin floor glides (`h = 4 - 8 mm`), and saddle-clamp or welded gusset brackets under the seat pan.
3. **Sculpted Hardwood Joinery (`Mortise, Tenon, Bridle & Finger Joints`)**:
   - Taper turned or elliptical solid-wood legs along `y` (e.g., `r_top = 21 mm -> r_mid = 24 mm -> r_ankle = 13 mm`, classic Danish/Nordic entasis) rather than uniform cylinders.
   - Articulate real aprons, stretchers, steam-bentwishbone/spindle backs, and saddle-carved solid seats with `1.5 - 3 mm` beveled arrises (`chamfer` along tangential axes) and subtle dark joinery shadow lines where tenons meet stiles.
4. **Upholstered Cushions, Piping Welts & Tufting (`evalHermite1D` + `smoothLoftNormals`)**:
   - Build seat and back cushions as crowned superellipsoid / Hermite-lofted volumes (`crown = 14 - 32 mm`, subtle side-bolster belly, corner radius `24 - 60 mm`) rather than chamfered boxes.
   - Add `Ø 3.5 - 5 mm` perimeter welt/piping tubes or recessed `2.5 mm` French-seam channels (`dark seam AO`), plus subtle tension creases radiating from button tufts or strap attachments.
5. **Cast Aluminum Swivel / Architectural Hardware**:
   - Model 4-star or 5-star die-cast aluminum bases with tapered web ribs, central gas-lift column collars, under-seat tilt mechanism housings, and dual-wheel castors or leveling glides touching `y = 0.0`.

---

## 2. Procedural Studio Material Recipes (`Linear sRGB` Safe)

All procedural textures must generate in `< 8 ms` on CPU (`Uint8Array` + `Math.imul` integer hash) or cleanly in GLSL `onBeforeCompile` with deterministic `customProgramCacheKey`:

| Material Family | Albedo / Roughness / Normal Recipe | Studio Specular Notes |
| :--- | :--- | :--- |
| **Quarter-Sawn Oak / Ash / Walnut / Beech** | Concentric growth-ring field `r = hypot(x - cx, z * 0.6 - cz) + fbm3(p)` producing realistic cathedral grain on flats and straight grain on edges; open vessel pores (`roughness +0.12`, normal pit) aligned to grain vector; `material.color = 0xffffff`. | `roughness: 0.38 - 0.56`, `clearcoat: 0.18 - 0.35` (`clearcoatRoughness: 0.42`) for oiled/soap/matte-lacquer finish. |
| **Woven Boucle / Kvadrat Wool Twill** | Dual-frequency orthogonal warp/weft yarn grid + looped slub clusters (`2.5 - 4.5 mm` pitch) with Nyquist `fwidth()` fade; grazing sheen uplift (`sheen: 0.65`, `sheenRoughness: 0.72`). | `roughness: 0.84 - 0.94`, `metalness: 0.0`, `envMapIntensity: 0.28` so fabric stays plush and chalk-free. |
| **Full-Grain Saddle / Aniline Leather** | Voronoi micro-pebble cell network (`0.8 - 1.4 mm`) + subtle low-frequency hide tension waves near seams; warm subsurface undertone. | `roughness: 0.42 - 0.58`, `clearcoat: 0.12`, `envMapIntensity: 0.65`. |
| **Mirror Chrome / Brushed Stainless / Anodized Aluminum** | Anisotropic longitudinal brush micro-grooves (`roughness: 0.16 - 0.28` brushed; `0.04 - 0.08` mirror chrome) reflecting the 3-softbox + studio-horizon PMREM cleanly. | `metalness: 0.96 - 1.0`, `envMapIntensity: 1.15`, dark studio-horizon reflection band prevents white-on-white disappearance. |
| **Matte Powder-Coated Steel / Bio-Resin / Translucent Acrylic** | Fine micro-orange-peel normal (`0.015` amplitude) for powder coat (`roughness: 0.46`); `transmission: 0.88, ior: 1.49, thickness: 0.018` with Beer-Lambert tint for smoked/colored polycarbonate. | Keep minor RGB channels `>= 0.03 * major` to avoid `PBR Neutral` gamut clipping. |
