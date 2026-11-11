---
name: chair-studio-threejs
description: >-
  Harvests one high-resolution single-chair photograph on a solid white
  background from up to 5 curated design RSS feeds within a strict 5-call
  budget over the last 24 hours, reconstructs it 1-to-1 in pure procedural
  photorealistic Three.js against a seamless white cyclorama with a soft floor
  shadow bottom using tilt-shift camera matching and 4x RGSS cinema optics,
  and synthesizes a brand-new original chair side-by-side from cumulative
  daily memory and designer notes. Use when running the daily chair design
  agent, reconstructing a studio furniture photograph 1-to-1 in Three.js, or
  generating memory-informed procedural chair designs side-by-side. Don't use
  for multi-building landscape scenes (use arch-turing-test-loop) or static 2D
  HTML marketing pages (use jason-dev-agent).
metadata:
  icon: ✨
---

# Daily Studio Chair Reconstruction & Memory Synthesis (`chair-studio-threejs`)

Every daily run executes a disciplined 4-stage industrial-design loop:
1. **Stage 0 -- 5-Site 24-Hour RSS Studio Chair Harvest** ([scripts/harvest_rss_chair.py](scripts/harvest_rss_chair.py) + [scripts/probe_white_studio_chair.py](scripts/probe_white_studio_chair.py)): Scans up to 5 curated furniture/industrial-design RSS feeds (`Dezeen`, `Yanko Design`, `Designboom`, `Core77`, `Wallpaper*`) within a hard cap of at most 5 websites and minimal image fetches, filtering the last 24 hours for one unseen, high-resolution photograph of a **single chair against a solid white background**.
2. **Stage 1 -- Optical Camera Matching & White Cyclorama Lock** ([references/white-cyclorama-and-camera-lock.md](references/white-cyclorama-and-camera-lock.md)): Digests `arch-camera-matching-and-perspective` and `arch-daylight-and-interior-glow` for studio product photography -- locking native canvas aspect (`W x H`), solving `2-point_shift_plumb` (`camera.setViewOffset`) vs. `3-point_pitched` portrait perspective, enforcing `OrbitControls` target-before-projection order, locking all chair glides/legs to `y = 0.0`, and calibrating a pure white seamless cyclorama + dual-scale soft floor shadow bottom under `PBR Neutral` tone mapping.
3. **Stage 2 -- 1-to-1 Pure Procedural Three.js Twin (`Chair A`)** ([references/procedural-chair-tectonics.md](references/procedural-chair-tectonics.md)): Reconstructs the reference chair 1-to-1 with zero projected reference photos -- combining centripetal Catmull-Rom shell lofts, parallel-transport tubular steel/bentwood splines, Hermite cushion lofts with welded normals, and linear-sRGB procedural timber/boucle/leather/metal shaders, verified via [scripts/render_and_compare_chair.mjs](scripts/render_and_compare_chair.mjs).
4. **Stage 3 -- Cumulative Memory -> Today's Original Chair (`Chair B`) Side-by-Side** ([references/memory-and-original-synthesis.md](references/memory-and-original-synthesis.md)): Distills today's tectonic DNA into the persistent memory ledger alongside all prior days and user-supplied notes, synthesizes a genuinely new procedural Three.js chair on the identical white cyclorama + soft shadow rig, and compiles the local Golden Template Side-by-Side Studio viewer.

## Workflow Checklist

Copy this checklist on each daily or on-demand run:

- [ ] **Step 1**: Run [harvest_rss_chair.py](scripts/harvest_rss_chair.py) (`--max-site-calls 5 --lookback-hours 24`) to select and download one high-res white-background chair reference and emit `probe.json` via [probe_white_studio_chair.py](scripts/probe_white_studio_chair.py)
- [ ] **Step 2**: Read `MEMORY.md`, `user_notes.md`, and `chair_ledger.json` in the project `memory/` folder to load prior days' structural vocabulary, material recipes, and designer seeds
- [ ] **Step 3**: Author `Chair A` (1-to-1 procedural Three.js reconstruction) locked to `probe.json` camera optics, `y = 0.0` glide contact, white cyclorama, and soft bottom shadow; iterate with [render_and_compare_chair.mjs](scripts/render_and_compare_chair.mjs) until silhouette, proportion, material, and floor shadow match the reference plate
- [ ] **Step 4**: Author `Chair B` (Today's Original Chair) on the identical camera/cyclorama/shadow stage, recombining tectonic lessons from today's study, prior days' memory, and `user_notes.md`
- [ ] **Step 5**: Update `memory/chair_ledger.json` + `memory/MEMORY.md`, compile the local Golden Template Side-by-Side viewer (`viewer/dist/index.html`), and stage the right-hand Artifact Pane preview (`No x20` unless requested)

--------------------------------------------------------------------------------

## 1. Hard Guardrails & Digested First-Principles Axioms

1. **Strict 5-Website / Low-Call RSS Budget:**
   - Never make more than `5` RSS feed calls across `5` distinct websites (`dezeen.com`, `yankodesign.com`, `designboom.com`, `feeds.feedburner.com/core77`, `wallpaper.com`).
   - Never crawl or spider HTML article pages; parse `<item>` / `<entry>` titles, `<pubDate>`, `<category>`, `<media:content>`, `<enclosure>`, and `<content:encoded>` image URLs directly from the RSS XML payload, and download only the top candidate high-res image (`--max-image-downloads 2`, stopping immediately when `studio_white_passed === true`).
2. **Pure-3D Anti-Cheat (`0%` Photo Projection):**
   - Never load, project, draw, or sample `<reference.jpg>` onto any Three.js mesh, canvas texture, or environment map (`Chair A` and `Chair B` must be 100% procedural 3D geometry and procedural shaders that hold up from every 360-degree orbit angle).
3. **Exact Camera & `OrbitControls` Target-Order Invariant (Digested from `arch-camera-matching-and-perspective`):**
   - Lock render dimensions strictly to `probe.json`'s `recommended_canvas_size` (`[1200, H]`).
   - Because `new OrbitControls(camera, domElement)` calls `controls.update()` toward `(0, 0, 0)` and pitches elevated shift cameras by `3-6 deg`, **always** set `controls.target.set(...)` and call `controls.update()` **before** applying `camera.lookAt(...)`, `camera.setViewOffset(...)`, and `camera.updateProjectionMatrix()`.
   - When `perspective_regime_hint == "2-point_shift_plumb"`, keep verticals plumb (`0 deg` pitch) and frame via `camera.setViewOffset(...)`. When `"3-point_pitched"`, solve portrait telephoto FOV (`24-38 deg` typical for studio furniture) and camera elevation/azimuth from the seat-plane and leg-foot vanishing geometry.
4. **Seamless White Cyclorama + Soft Shadow Bottom under `PBR Neutral`:**
   - Under Khronos `pbrNeutralToneMapping` (`1:1` linear identity below `0.76`, soft shoulder above `0.76`), keep studio backdrop radiance calibrated so the background resolves to exact reference white (`sRGB 248-255`, matching `border_mean_srgb`) while chair highlights (`pale ash`, `white boucle`, `chrome`) stay cleanly differentiated (`0.72-0.84` linear diffuse peak) with crisp edge definition.
   - Lock all chair feet/glides/sleds strictly to `y = 0.0` (`minWorldVertexY === 0.0 m` within `+-0.5 mm`). Render a **two-layer soft bottom shadow** at `y = 0.0005 m`:
     1. *Tight Foot-Pad Contact Umbra* (`sigma = 10-24 mm` around each leg glide / sled runner) so the chair never floats.
     2. *Broad Under-Seat Ambient Penumbra* (`sigma = 160-380 mm` elliptical soft shadow pool beneath the seat pan, weighted by seat height `h_seat` and key-light azimuth/elevation).
5. **Single-Tint Linear Colorimetry & Welded Smooth Loft Normals:**
   - Keep `material.color.setHex(0xffffff)` whenever a procedural `DataTexture` or `CanvasTexture` (`SRGBColorSpace`) already encodes wood/textile pigment so linear multiplication never darkens midtones.
   - Build curved shells, cushions, and bentwood/tubular frames with centripetal Catmull-Rom lofts, cubic Hermite profiles, parallel-transport spline tubes, and spatial-hashed normal welding (`weldSmoothNormals`) so grazing studio softbox highlights roll smoothly without polygon facets or UV-seam creases.

--------------------------------------------------------------------------------

## 2. Command Reference

```bash
# 1. Harvest 1 unseen high-res chair on solid white from the last 24h (<= 5 site calls):
python3 scripts/harvest_rss_chair.py \
  --project-dir /usr/local/google/home/jfesta/chairs \
  --max-site-calls 5 \
  --max-image-downloads 2 \
  --lookback-hours 24

# 2. Probe any studio chair image directly for white-cyclorama purity & camera optics:
python3 scripts/probe_white_studio_chair.py <reference.jpg>

# 3. Headless WebGL2 render + 1:1 parity & triptych comparison (zero npm deps via Chrome CDP):
node scripts/render_and_compare_chair.mjs \
  --viewer-dir /usr/local/google/home/jfesta/chairs/viewer \
  --day-dir /usr/local/google/home/jfesta/chairs/days/<YYYY-MM-DD-slug> \
  --day-id <YYYY-MM-DD-slug> \
  --iter 1
```

--------------------------------------------------------------------------------

## 3. Companion Skills Linked (Zero Script Duplication)

- **Camera & Vanishing-Point Calibration**: `arch-camera-matching-and-perspective` (`probe_reference_plate.py` invoked directly by [probe_white_studio_chair.py](scripts/probe_white_studio_chair.py))
- **Cinema 4x RGSS, Shift-Lens HBAO & Parity Metrics**: `arch-turing-test-loop` (`arch_hyperreal_optics.js` and `compare_arch_core.mjs` linked directly by [render_and_compare_chair.mjs](scripts/render_and_compare_chair.mjs))
- **PBR Neutral Shoulder & Role-Split Studio IBL**: `arch-daylight-and-interior-glow` and `arch-materials-and-weathering`
- **Catmull-Rom Lofts, Hermite Profiles & Normal Welding**: `image-to-working-model`
- **Golden Template React 19 + Vite 7 + Tailwind v4 Viewer**: `golden-template`

## References

- [Studio white cyclorama, soft shadow bottom, and camera perspective lock](references/white-cyclorama-and-camera-lock.md)
- [Pure procedural Three.js chair geometry and material tectonics](references/procedural-chair-tectonics.md)
- [Cumulative memory ledger and original daily chair synthesis](references/memory-and-original-synthesis.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
