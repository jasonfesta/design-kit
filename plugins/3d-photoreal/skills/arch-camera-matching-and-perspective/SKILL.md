---
name: arch-camera-matching-and-perspective
description: >-
  Match exact architectural photography perspective, tilt-shift lens shift
  (camera.setViewOffset) vs. pitched 3-point elevation, OrbitControls target
  order, sloped site grades, and return-wall geometry when reconstructing a
  real architectural photograph in Three.js.
metadata:
  icon: ✨
---

# Architectural Camera Matching & Perspective Calibration (`architecture-threejs`)

If camera focal length, vertical convergence, horizon height, or viewport aspect ratio disagree with the reference plate by even `3-5%`, no shader detail can pass a side-by-side Turing test.

## [LOCKED] First-Principles Axioms

1. **Exact Native Aspect Probe First:** Always inspect `<ref.jpg>` via `read_file` and run `python3 ~/.gemini/config/skills/arch-camera-matching-and-perspective/scripts/probe_reference_plate.py <ref.jpg>`. Lock WebGL canvas dimensions strictly to `recommended_canvas_size` (`W × H`), never a forced `4:3` or `16:9` crop.
2. **OrbitControls Target Order Invariant:** `new OrbitControls(camera, domElement)` invokes `controls.update()` toward `(0, 0, 0)`, pitching elevated shift cameras downward by `3°-6°`. Always set `controls.target.set(camX, camY, camZ - 10)` and call `controls.update()` **before** `camera.lookAt(...)` + `camera.setViewOffset(...)` + `camera.updateProjectionMatrix()`.
3. **Orthogonal Horizon VP & Projective Cross-Ratio Law:** Given orthogonal horizon vanishing points `u1 < uPrincipal < u2`, horizontal focal scale is `f_u = Math.sqrt((uPrincipal - u1) * (u2 - uPrincipal))`. On receding walls with positive endpoint depths `d0 != d1`, convert horizontal screen fraction `t = (u - u0) / (u1 - u0)` to metric wall fraction via `s(t) = (t * d0) / (t * d0 + (1 - t) * d1)` with right-handed wall basis `det([T_right, UP, N_out]) === +1`.
4. **Monotonic Ray-Grade Bisection & Camera Homothety:** Intersect view rays with sloped terrain `siteHeight(x, z)` via 32-step monotonic `[d_min, d_max]` bisection (never fixed-point depth iteration, which oscillates when `dh/dd > 0`). Re-order depth layers strictly along camera-origin rays `P' = C + k * (P - C)` so 2D screen silhouettes stay `0.0 px` invariant.
5. **Ground-Contact Depth Lock, Soffit Sign & Exact `vTrueScreenUV`:** Lock every stepped wall's depth `z_wall` strictly from its ground-contact ray `v(y_base, z_wall)` (cut roof/lightwell openings for shadows rather than shifting walls in `Z`). Above eye level (`Y > Y_cam`), lowering a soffit `Y` **increases** screen `v`. Compute fragment screen UVs exclusively from clip space (`vTrueScreenUV = vec2(gl_Position.x / gl_Position.w * 0.5 + 0.5, 0.5 - gl_Position.y / gl_Position.w * 0.5)`).

## [REGIME PLAYBOOK] Conditional Rules

- **WHEN `perspective_regime_hint == "2-point_shift_plumb"`:** Keep verticals strictly plumb (`0°` pitch). Intersect `>= 6` receding edges (eaves, sills, beams, floorboards) by least squares to solve `(uPrincipal, vHorizon)` and apply `camera.setViewOffset(W, H, (0.5 - uPrincipal) * W, (0.5 - vHorizon) * H, W, H)`.
- **WHEN `perspective_regime_hint == "3-point_pitched"`:** Verticals converge (`downward_aerial` or `upward_worms_eye`). Solve full 3D `(yaw, pitch, roll)` and `fov` from the three vanishing points rather than forcing `0°` shift.
- **WHEN `canopy_occlusion_fraction > 0.15` or sunlit towers occupy the upper frame:** Calibrate sky radiance from `open_sky_p85_srgb` sampled on unobstructed sky patches, never `upper_band_srgb`.
- **WHEN framing a receding courtyard wing at lateral offset `X`:** Lock eave/sill height `Y` directly from screen slope `m = -((Y - Y_cam) / X) * (W / H) * (tanHalfY / tanHalfX)`, and project recessed glazing at its true plane `X_glass = X + dX`.
- **WHEN placing off-axis foreground piers (`|u0 - uPrincipal| > 0.35`) or rotated masses:** Anchor foreground piers by their **far inner corner** `x(u_inner, d + dd)` so side-return width `du_return = -(u0 - uPrincipal) * (dd / (d + dd))` never intrudes into the aperture; pivot rotated masses about front corners rather than box centroids.
- **WHEN modeling sloped retaining walls (`25°-38°`), pergolas, or wide-angle paving:** Keep sloped wall top caps visible above `vHorizon` (`v < vHorizon`), frame pergola rafters flush into girders (`dy <= 0.13 m`), extend flanking walls/paving behind the camera (`Z = +6m .. +10m`), and lock primary ridges to `< 0.5 px` via 2-render empirical secant `du_px / d_param`.
- **WHEN recessed interior room backings, rooftop chimneys, or multi-tier atrium coves sit behind a primary z=0 facade plane:** Solve lateral world coordinates xAt(u, z_true) and vertical heights yAt(v, z_true) at each element's true world depth rather than copying z=0 facade spans, preventing parallax bleed outside window jambs and perspective drift.
- **WHEN calibrating multi-view cameras (`window.__ARCH_CAMERAS__` for `VIEW 2..N`) & empirical thicknesses with optional plans:** Use floor plans/sections only when available; otherwise triangulate shared 3D landmarks (ridge corners, column grids, stair landings, window bays) across `VIEW 1..N`. Pull all wall thicknesses, slab edges, and window/door reveal depths directly from jamb/sill returns visible in the photos (never use stock default thicknesses). Register every secondary camera (`{ name, refPhoto, position, target, fov, principalPoint, rollDeg, exposureBias, interiorLuminaireGain }`) solved from >= 4 shared 3D points—supplying `principalPoint: [uPrincipal, vHorizon]` whenever `VIEW k` has plumb 2-point verticals, and verifying unobstructed sightlines in `iter_0<k>_multiview_sxs.jpg`.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
