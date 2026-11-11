---
name: arch-site-foliage-and-atmosphere
description: >-
  Reconstruct hyperrealistic botanical context and site grounding in Three.js
  across any biome—pinhole-lit broadleaf/pine canopies (zero dielectric
  Fresnel haze), clumped millimeter turf, sculpted streetscape vehicles, and
  clean plinth grounding.
metadata:
  icon: ✨
---

# Architectural Site Context, Botanical Realism & Grounding (`architecture-threejs`)

Botanical context, terrain grade, water, vehicles, and scale figures must match the physical optics and biome of the reference photograph without low-poly CG giveaways.

## [LOCKED] First-Principles Axioms

1. **Zero Dielectric Fresnel Haze on Alpha Botany:** Lock alpha-tested leaf, frond, and grass cards to diffuse/subsurface response (`roughness: 0.88-0.95, metalness: 0.0, envMapIntensity: 0.0, castShadow: true, receiveShadow: false`) so grazing cards (`N·V < 0.35`) never flood canopies with Schlick Fresnel sky haze or shadow-map self-acne.
2. **Upward-Normal (`+Y`) Winding & `InstancedMesh` Color Invariants:** Built-in `normal_fragment_begin` flips custom `(0, 1, 0)` normals underground `(0, -1, 0)` on back-facing `DoubleSide` triangles (`N·L = 0`). Always emit counter-wound front+back index pairs (`[0,1,2, 0,2,1]`) with `side: THREE.FrontSide`. Keep `vertexColors: false` when tinting `InstancedMesh` via `setColorAt(i, color)` unless `geometry.attributes.color` exists.
3. **Topographic Grounding (`siteHeight(x, z)`):** Every tree, street sign, boulder, curb, vehicle wheel, and scale figure must query `y0 = siteHeight(x, z)`. Any tree canopy visible below `vHorizon` (`v_bot > v_horizon`) must physically extend below camera height (`y_bot < y_cam`), and soil/meadow slabs must sit `1 mm` below spatially disjoint pool copings/curbs.

## [REGIME PLAYBOOK] Conditional Rules

- **WHEN matching site biome, surroundings & foliage presence across `VIEW 1..N`:** Reconstruct **only** the exact surroundings, hardscape, neighboring architecture, terrain, water, and vegetation evidenced across the reference photographs (`VIEW 1..N`). **NEVER force foliage, trees, or hedges where none exist** (preserve pure stone cloisters, urban plazas/streets, industrial yards, or arid gravel with `0%` added greenery), and never place unphotographed trees across secondary camera sightlines.
- **WHEN building multi-ring terrain, civil infrastructure & 360° site surroundings (distilled from `large-scale-cdlod-terrain-and-procedural-infrastructure`, strictly reference-locked):**
  1. **Concentric Multi-Ring Graded Terrain & True Horizon Closure (`R < 40 m` lot, `40-180 m` context, `180 m-1.5 km` horizon):** Extend continuous `siteHeight(x, z)` across all 360° quadrants out to the horizon without dropping off into flat discs, smooth `Math.sin` hills, or untextured grey proxy cubes. **NEVER** map elevation or rock color through a 1D coordinate or step ramp (eliminates parallel "corduroy" contour stripes in orbit/secondary views); domain-warp slopes in full 2D `(x, z)` and articulate neighboring buildings/terraces with authentic regional roofs, recessed masonry/plaster bays, retaining walls, or hillside parcels evidenced in `VIEW 1..N` (never inventing fantasy mountains or unphotographed forests).
  2. **Plane- & Spline-Fitted Civil Works with Cut/Fill Shoulders (`zero floating slabs`):** Fit courtyards, plazas, piers, riverside walls, and building plinths to explicit planes (`H_pad`) and blend surrounding `siteHeight(x, z)` across a physical shoulder width (`W_shoulder = 1.5-6 m`) via smoothstep cut/fill embankments, stone retaining walls, or street curbs. Extrude roads, gravel drives, paths, and sidewalks along parametric splines querying `siteHeight` laterally with subtle crown and longitudinal wheel-track/foot-traffic wear bands.
  3. **Meter-Space `fwidth()` Ground Shading & `sdFootprint`-Excluded Biophysical Scatter:** Evaluate soil, turf, stone, gravel, and asphalt shaders in continuous world meters (`posWorld.xz`) clamped by analytical `fwidth()` filter widths so micro-aggregate stays crisp at `2 m` and Moiré-free at `800 m`. Modulate reference-verified vegetation/rock scatter across all 4 quadrants by slope (`1 - normal.y`), moisture/aspect, and a hard signed-distance exclusion mask (`sdBuildingAndRoads(x, z) > margin`) so site elements never pierce floors, walls, pools, or paths.
- **WHEN rendering in-focus canopies (`d >= 0.18 * d_focus`) vs. near-lens bokeh (`d < 0.18 * d_focus`):** Render in-focus leaves and grass panicles with crisp `transparent: false, alphaTest: 0.44, depthWrite: true` and `LinearFilter` (`generateMipmaps: false`), interleaving dark inner understory (`lit = 0.25-0.45`) with sunlit obovate outer rosettes (`lit = 0.60-1.50`, zero smooth sphere cores) and using decoupled proxy shadow casters for soft courtyard dapple. Reserve `transparent: true, depthWrite: false, opacity: 0.48` strictly for out-of-focus foreground blades (`d < 0.18 * d_focus`).
- **WHEN modeling pinnate palms, glaucous conifers, or dense foreground sprays:** Overlap V-keeled palm pinnae continuously across the inner `~62%` of frond width and feather discrete pinnae only on the outer `~38%` (eliminating `2 px` comb Moiré); bind neutral grayscale conifer sprites (`R≈G≈B`) so `setColorAt` controls true sage/glaucous hue; and if foreground sprays match luma yet read `OVER`-textured, scale leaflet width `~1.4×` (`2×` area) at half spray count while clamping grass plumes below bright fascia soffits.
- **WHEN shading grazing swimming pools (`N·V ≈ 0.16-0.24`), vehicles, signage, or figures:** Partition `(1 - F) ≈ 0.58-0.65` of pool radiance into underwater mosaic/plaster basin upwelling + caustics alongside `uMirrorTex`; sculpt vehicle greenhouse tumblehome (`~0.74 × bodyWidth`) with body-colored pillars and clearcoat glass; pin-mount 3D channel letters without spurious backing bars; and pose `1.70-1.76 m` figures in natural asymmetric walking strides or seated drapes.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
