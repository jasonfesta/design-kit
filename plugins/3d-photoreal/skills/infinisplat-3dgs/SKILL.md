---
name: infinisplat-3dgs
description: >-
  Feed-forward surface-aligned 3D Gaussian Splatting (InfiniSplat v1, v2, and
  v3 / SplatAnything from zju3dv/InfiniSplat) plus browser-native WebGL2
  surface-aligned EWA 3DGS baking and spatial website choreography. Covers
  surface-aligned sparse supports, InfiniDepth continuous querying, RDNorm
  multi-view and 24-view panorama fusion, Gaussian Spacing Normalization
  (GSNorm), multi-layer disocclusion baking for realistic portraits in scenes,
  and interactive camera-navigated websites built around a live 3DGS subject.
metadata:
  icon: 🫧
---

# InfiniSplat (v1 / v2 / v3 SplatAnything) — Surface-Aligned 3DGS for Web & Interactive Scenes

Adopted from **[zju3dv/InfiniSplat](https://github.com/zju3dv/InfiniSplat)** (Zhejiang University 3DV: InfiniSplat v1 `arXiv:2608.02437`, InfiniSplat v2 `arXiv:2610.20341`, and SplatAnything / InfiniSplat v3 `arXiv:2611.08264`).

Use this skill whenever you want to:
1. Run or integrate the **InfiniSplat v1 / v2 / v3** feed-forward 3DGS pipelines (single photo, multi-view photos, or 360° equirectangular panoramas → `.ply` / `.sog` / `.spz` / standalone HTML).
2. Reconstruct a **realistic human portrait or subject inside a real-world setting** (e.g., a face in a park, courtyard, or studio) as **surface-aligned 3D Gaussian Splats** without pixel-grid stretching or silhouette tearing.
3. Build an **interactive WebGL2 website navigated spatially around a 3DGS subject** (pointer parallax, drag-orbit, scroll/chapter camera flights around the face/scene, and live splat-scale inspection).

---

## 1. Why InfiniSplat Beats Naive Pixel-Aligned 2.5D / 3DGS

Traditional single-image or feed-forward 3DGS places one isotropic Gaussian per pixel on an image grid. When a website user orbits ±15–30° around a person's face or scene, pixel-aligned splats break down in three ways:
- **Oblique-surface tearing:** Sloped cheeks, jawline, neck, and shoulders stretch apart into visible cracks or needle-like ribbons.
- **Scale ambiguity across scenes:** Global radial-distance normalization makes close-up portraits and wide parks produce incompatible splat sizes (holes on close subjects, mushy over-smoothing in backgrounds).
- **Silhouette stretching & disocclusion holes:** Depth-jump pixels between foreground hair/ears/shoulders and distant trees stretch across empty space as rubbery webs, and rotating reveals empty black voids behind the subject.

The **InfiniSplat** lineage solves each problem structurally:

| Iteration | Paper / Lineage | Core Innovation | Best Use Case |
| :--- | :--- | :--- | :--- |
| **InfiniSplat v1** | `arXiv:2608.02437` | **Surface-aligned sparse supports** (`make_sparse_surface_samples`): builds a depth-induced 3D mesh (`DepthPro` / `InfiniDepth`), selects anchor + detail-ranked vertices plus stratified triangle-interior barycentric samples, and initializes Gaussian tangent scale from **represented metric surface area** ($\sqrt{A}$) rather than raw pixel footprint. | Single-photo reconstruction (portraits, parks, architecture) with clean large-baseline novel views. |
| **InfiniSplat v2** | `arXiv:2610.20341` | **Multi-view & 24-view 360° panorama fusion**: freezes geometry foundation backbone (`DA3`) while decoding 11-channel Gaussian attributes (`quat`, `scale ≤ 0.3`, `opacity`, `SH0 residual`), aligns views in first-camera-relative **RDNorm** space, merges via uniform-mean voxel fusion (`voxel_width = 1.4 × median_scale`), and prunes low-opacity floaters (`α < 0.01`). | Multi-photo scenes, pose-free captures, and full 360° equirectangular panoramas. |
| **InfiniSplat v3 (SplatAnything)** | `arXiv:2611.08264` | **Gaussian Spacing Normalization (GSNorm)**: rescales scene geometry, depth, and camera baseline by the robust **median per-pixel Gaussian spacing** ($s_{\text{med}} = \text{median}(z / f)$) rather than global radial distance, canonicalizing spacing to 1 so a single parameterization generalizes cleanly from close-up human portraits to parks, streets, and aerials. | Arbitrary-scale scenes, mixed close-foreground + far-background portraits, multi-camera rigs. |

---

## 2. Upstream CLI & Export Reference (`zju3dv/InfiniSplat`)

> **License note:** InfiniSplat v1 & v2 use the Project Registration License (PRL) v1.0 (free for academic research, education, evaluation, and personal use; organizational projects require prior registration). Third-party components (`DINOv3`, `DepthPro`, `DA3`, `gsplat`, `@playcanvas/splat-transform`) keep their own licenses.

### InfiniSplat v1 (Single Image → Surface-Aligned PLY / SOG / HTML)
```bash
# Single RGB image or directory
python -m src.demo.infer_batch_images --input path/to/portrait.png

# RGB + LiDAR depth
python -m src.demo.infer_batch_images --mode lidar --input path/to/rgbd_dir

# Interactive Gradio viewer (staged PLY + standalone HTML download)
python demo.py
```

### InfiniSplat v2 (Multi-View & 360° Panorama → Merged PLY + Standalone SH0 HTML)
```bash
# Multi-view (2+ images) using DA3 predicted camera prior (default)
infinisplat --model weights/da3 --images-dir ./images --output ./result

# Pose-free mode (skip camera prepass) or supplied cameras / COLMAP
infinisplat --model weights/da3 --images-dir ./images --pose-mode pose-free --output ./result
infinisplat --model weights/da3 --images-dir ./images --cameras cameras.npz --output ./result

# 360° equirectangular panorama → 24 calibrated perspective views → single merged 3DGS
infinisplat-panorama --model weights/da3 --input ./park_pano.jpg --output ./pano_result
```

### Web Compression & Viewer Conversion (`splat-transform`)
InfiniSplat exports native `.ply` (`means`, `SH0`, `opacity logits`, `log scales`, `quaternions`) and converts to browser-ready `.sog` or standalone SH0 HTML via PlayCanvas's `@playcanvas/splat-transform`:
```bash
splat-transform -w scene.ply -H 0 scene.sog
```
Load `.sog` / `.spz` in Three.js via `@sparkjsdev/spark` (`SplatMesh`) or Three.js `r186+` native `GaussianSplat` (`SPZLoader`).

---

## 3. Browser-Native InfiniSplat Method (Realistic Single-Photo Portrait + Scene)

When building a **self-contained interactive personal website** from a single photograph (e.g., a person's face in a park) without requiring a remote PyTorch server at runtime, apply the **3-Layer Surface-Aligned InfiniSplat Web Pipeline** using the bundled baker script `scripts/infinisplat_bake.py`:

### Step 1: Prepare 3 Co-Registered Inputs
1. **Hero Photograph (`portrait.png`):** Natural, photographic lighting and real skin/hair/environment detail (avoid studio flat backgrounds—choose a scene with true foreground, midground, and background depth layers, such as a sunlit park with trees, bench, and dappled bokeh).
2. **Clean De-Populated Background Plate (`bg_clean.png`):** Same exact camera framing, horizon, lighting, and foliage with the person cleanly removed. This solves disocclusion physically—when the user orbits around the person's head and shoulders, the real park behind them appears seamlessly with zero holes.
3. **Co-Registered Continuous Metric Depth Map (`depth.png`):** Linear grayscale depth aligned pixel-for-pixel to `portrait.png` (`white = closest` nose/brow/collar, `mid-gray = cheeks/ears/hair`, `dark = midground trees/bench`, `near-black = far canopy`).

### Step 2: Bake Surface-Aligned Anisotropic Splats (`scripts/infinisplat_bake.py`)
```bash
PYTHONPATH=~/design-kit/tools/python/site python3 \
  ~/design-kit/plugins/3d-photoreal/skills/infinisplat-3dgs/scripts/infinisplat_bake.py \
  --photo ./portrait.png \
  --depth ./depth.png \
  --bg ./bg_clean.png \
  --out ./public/scene.isplat.bin \
  --subject-splats 52000 \
  --bg-splats 34000
```

What `infinisplat_bake.py` computes (directly mirroring InfiniSplat v1 + v2 + v3):
1. **RGB-Guided Joint-Bilateral Depth Locking:** Filters `depth.png` against `portrait.png` luminance/color edges so depth boundaries snap tightly to hair, jawline, ears, and jacket collar with zero stair-stepping or bleed.
2. **Dual-Cue Foreground Matte & Silhouette Cutting (InfiniSplat v2 Opacity Suppression):** Combines depth-layer separation with `|portrait - bg_clean|` color evidence to isolate the foreground subject and **suppress opacity (`α = 0`) on depth-discontinuity bridge gradients (`|∇z| > τ`)**, eliminating stretched rubber ribbons completely.
3. **Surface-Aligned Sparse + Triangle-Interior Sampling (InfiniSplat v1):**
   - Ranks pixels by facial/detail gradient energy (eyes, eyelashes, lips, nose bridge, hair strands, fabric weave) + anchor scaffold so high-frequency facial realism stays razor-sharp.
   - Computes local 3D surface tangent basis $(\mathbf{t}_u, \mathbf{t}_v, \mathbf{n})$ from finite-difference world coordinates on the depth-induced surface mesh.
   - Adds **stratified oblique-surface fill splats** on high-slope regions (cheeks, jaw, temples, neck, shoulders) weighted by represented 3D triangle surface area so orbiting ±25° reveals solid, continuous curved anatomy with zero cracks.
4. **Gaussian Spacing Normalization — GSNorm (InfiniSplat v3 / SplatAnything):**
   - Computes median per-pixel Gaussian spacing $s_{\text{med}} = \text{median}(z / f)$ across valid scene pixels and normalizes world coordinates and splat scales relative to $s_{\text{med}}$.
   - Sets each splat's anisotropic tangent axes $(\mathbf{u}, \mathbf{v})$ from its local represented metric surface area ($\sqrt{A} \cdot k_{\text{overlap}}$) aligned flush to the 3D surface tangent plane, with a slim normal-axis thickness floor so grazing angles remain solid.
5. **Disoccluded Background Layer + Atmospheric Depth Layer:**
   - Samples the entire `bg_clean.png` (including directly behind the person's head/shoulders!) with GSNorm-scaled broader bokeh splats in the distant canopy.
   - Adds subtle translucent near-camera sunlit bokeh/pollen Gaussians for unmistakable parallax depth.
6. **Compact Binary Packing (`.isplat.bin`, 22 bytes/splat):**
   - Header (`magic "ISPL"`, `version`, `count`, `fovDeg`, `aspect`, `gsNormScale`, `subjectCenter[3]`) followed by quantized `pos` (`int16 × 3`), `uAxis` (`int8 × 3` + log scale), `vAxis` (`int8 × 3` + log scale), `rgb` (`uint8 × 3`), `alpha` (`uint8`), and `layerId/shHint` (`uint8`). Typical 86k-splat photoreal portrait+park scene packs to ~1.8 MB raw (~900 KB gzip / base64-embeddable for single-file local builds).

---

## 4. Real-Time WebGL2 EWA Elliptical Splat Renderer (`#version 300 es`)

Never fake 3DGS with flat circular `gl_PointSize` dots—circles break on oblique faces and look pixelated. Implement true **Zwicker EWA / Inria 3DGS anisotropic ellipse projection** in WebGL2:

1. **Mandatory `precision highp float;`** in both vertex and fragment shaders (prevents mobile covariance tearing).
2. **Surface-Aligned 3D Covariance:** Reconstruct $\Sigma = \mathbf{u}\mathbf{u}^T + \mathbf{v}\mathbf{v}^T + \epsilon^2 \mathbf{n}\mathbf{n}^T$ directly from the splat's world-space tangent axes `(aAxisU, aAxisV)` (zero quaternion-to-matrix overhead per vertex!).
3. **Perspective Jacobian Projection:** Transform $\mathbf{u}, \mathbf{v}$ into camera space, apply the perspective Jacobian $J = \frac{1}{z_c}\begin{bmatrix} f_x & 0 & -f_x x_c/z_c \\ 0 & f_y & -f_y y_c/z_c \end{bmatrix}$ to obtain 2D screen-space tangent vectors $\mathbf{u}_{2D}, \mathbf{v}_{2D}$, then form the 2×2 screen covariance:
   $$\Sigma'_{2D} = \mathbf{u}_{2D}\mathbf{u}_{2D}^T + \mathbf{v}_{2D}\mathbf{v}_{2D}^T + \sigma_{\text{aa}}^2 I$$
   (the $\sigma_{\text{aa}}^2 \approx 0.28\text{ px}^2$ EWA low-pass filter eliminates sub-pixel aliasing and shimmer!).
4. **Closed-Form 2×2 Eigendecomposition:** Extract major/minor ellipse axes $(\mathbf{e}_1, \mathbf{e}_2)$ and radii $r_{1,2} = \min(r_{\max}, 2.75\sqrt{\lambda_{1,2}})$ to expand a 4-vertex instanced quad (`drawArraysInstanced`).
5. **Fragment Evaluation & Premultiplied Blending:** Evaluate `w = exp(-0.5 * dot(vLocal, vLocal))`, discard if `dot(vLocal, vLocal) > 7.5`, output premultiplied `vec4(color * a, a)` with `gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)` and `depthWrite = false`.
6. **Fast Typed-Array Depth Sort:** Run a 12-bit (4096-bucket) counting sort on view-space `z` whenever camera direction shifts by `> 0.35°` (`< 2 ms` for 85k splats in JS with zero GC allocations), updating a single `Uint32Array` instanced index buffer or texture lookup.
7. **Live Interactive `uSplatScale` & `uFocusDepth`:**
   - At `uSplatScale = 1.0`, overlapping surface-aligned Gaussians reconstruct a **continuous photographic image** at full sharpness.
   - Morphing `uSplatScale → 0.40` reveals the individual oriented elliptical 3D surfels across the face and park foliage—proving true 3DGS geometry interactively.
   - Adjusting `uFocusDepth` smoothly widens covariance on out-of-focus background splats for authentic optical rack-focus when navigating website chapters.

---

## 5. Spatial Website Choreography Around a 3DGS Face

When building a **personal website navigated around a 3DGS portrait**, obey both `design-donts` and photographic composition rules:

1. **Unobstructed Hero (`Home`):** On load at `1280px`, the 3DGS scene owns **100% of the viewport** (`≥ 70%` clean negative space). Never box the portrait inside a small card or open sidebars/inspectors on load.
2. **Orbit-to-Frame Chapter Navigation:** Each top-level nav destination smoothly springs the 3D camera to a curated viewpoint around the face—shifting the portrait in true 3D perspective to clear clean reading space for the content without covering the person's eyes:
   - **Home:** Neutral centered portrait (`yaw 0°, pitch 0°`), gentle pointer parallax + free drag-orbit.
   - **About:** Orbit right (`yaw +18°..+22°`, slight dolly-in), framing the face in the left third looking toward the bio column on the right.
   - **Work:** Orbit left (`yaw -18°..-22°`, slight pull-back revealing park depth), framing the face on the right while selected projects unfold on the left.
   - **Journal / Notes:** Gentle elevated close-up (`yaw +11°, pitch +6°`, shallow optical DOF on background canopy) beside long-form writing.
   - **Contact:** Intimate slightly off-axis eye-level framing (`yaw -9°`) beside a direct message form.
3. **Respect Safe Orbit Arc:** Clamp manual drag-orbit to the physically supported front hemisphere (`yaw ∈ [-26°, +26°]`, `pitch ∈ [-13°, +15°]`, `zoom ∈ [0.82, 1.32]`) with soft rubber-band resistance at the boundary so the portrait always stays photorealistic and grounded.
4. **Light-First Editorial Chrome:** Default to warm sunlit paper surfaces (`#faf8f3`), botanical/earth accents, non-Material editorial typography (`Fraunces` + `Instrument Sans` or `Newsreader` + `Schibsted Grotesk`), optically centered `<button>` alignment (`-2px` down), zero purple, zero eyebrow descriptor kickers, and zero developer/debug chrome.
5. **QA Gates Before Shipping:**
   - `python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py <project>` → `0 error(s), 0 warning(s)`.
   - Headless Playwright screenshots at `1280×800` (Home, orbited left/right chapters, Surfel/Gaussians mode) and `390×844` mobile—visually inspect every render for haloing, depth tears, WebGL errors (`0`), and framing balance.

---

## 6. 360° Panorama Surround, Articulated Mid-Trick Rig & Optical 8mm Fisheye EWA Shader

When building a **full 360° rotatable action or hero scene inside a real-world location** (e.g., an articulated hand or object frozen mid-trick in a New York City park, shot on a skate fisheye lens):

1. **InfiniSplat v2 Panorama Surround:** Sample a high-res real-world location panorama (mirror-wrapped horizontally for zero seam) onto a depth-stratified cylindrical/hemispherical surround (`ground slope → midground trees/benches/buildings → overhead sky dome`) with GSNorm-scaled tangent radii so 360° rotation always frames authentic photography.
2. **Per-Part Articulation (`partId` Uniform Rigid Transforms):** Tag each splat with a compact `partId` (`0..9` — environment, ground/ledge, dynamic shadow, palm/wrist, individual fingers, hero prop/board). Pass `uPartMat[10]` + `uPartOff[10]` into the vertex shader and apply the matching center offset in the JS 12-bit bucket sort so users can **scrub or play the action timeline (`Pop → Flip → Catch → Stomp`) and freeze at any millisecond to orbit 360° around it** with exact depth sorting.
3. **True Curvilinear 8mm Fisheye Projection + Analytical Jacobian (`uFisheye ∈ [0, 1]`):**
   Instead of standard pinhole NDC (`p.xy / z`), compute spherical angle $\theta = \arccos(\text{clamp}(-p_z / r, -1, 1))$ and radial length $\rho = \sqrt{p_x^2 + p_y^2}$:
   - Blend smoothly between rectilinear projection ($r_{\text{pin}} = \tan\theta$) and equidistant/stereographic skate fisheye ($r_{\text{fish}} = 2 \tan(\theta / 2)$ or $\theta$) via `uFisheye`.
   - Compute the **2×3 Jacobian** analytically (or via finite-difference tangent projection of `pCam + uCam` and `pCam + vCam`) so every 3D Gaussian ellipse warps and curves accurately along fisheye horizon lines with zero stretching at 150°+ field of view!

