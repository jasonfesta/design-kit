---
name: 3d-gaussian-splatting-webgl
description: >-
  Render and integrate Inria-grade 3D Gaussian Splatting (3DGS) photorealistic
  scenes in WebGL2, WebGPU, and Three.js using Spark (@sparkjsdev/spark),
  Three.js r186+ native GaussianSplat (TSL), PlayCanvas/SuperSplat, or
  InfiniSplat (v1/v2/v3 SplatAnything) surface-aligned pipelines, with
  compressed .sog / .spz / .isplat.bin pipelines, hybrid mesh compositing,
  mobile VRAM guardrails, and generative 3DGS workflows (InfiniSplat, World
  Labs Marble, Apple SHARP, Microsoft TRELLIS).
metadata:
  icon: ✨
---

# 3D Gaussian Splatting (3DGS) for WebGL2, WebGPU & Three.js

Use this skill whenever a project needs **photorealistic real-world or AI-generated environments** in the browser (interiors, gardens, foliage, streetscapes, scanned products, or world-model backdrops) where procedural Three.js meshes and PBR materials would look CG or hit a detail ceiling.

---

## 1. Decision Gate: 3DGS vs. Procedural Three.js vs. Hybrid

| Subject / Requirement | Pick | Why |
| :--- | :--- | :--- |
| Cluttered real-world environments, foliage, grass, rooms, scans, world-model scenes | **3DGS (WebGL2 / WebGPU)** | Millions of anisotropic view-dependent ellipsoids bake micro-geometry and multi-bounce GI directly |
| Dynamic relighting, articulated mechanisms, configurators, custom PBR material swaps | **Procedural / Mesh Three.js** (`arch-*`, `car-*`, `chair-studio-threejs`) | Standard 3DGS has baked lighting and limited deformation |
| Interactive 3D hero object or UI inside a photoreal environment | **Hybrid (Spark or Three.js r186+)** | 3DGS backdrop + standard Three.js meshes sharing the depth buffer |

---

## 2. Core Inria 3DGS Representation (Reference Model)

From Kerbl et al., *3D Gaussian Splatting for Real-Time Radiance Field Rendering* (SIGGRAPH 2023, Inria FUNGRAPH):

- **Explicit 3D Gaussians:** Each primitive stores position $\mathbf{x} \in \mathbb{R}^3$, opacity $\alpha$, anisotropic 3D covariance $\Sigma = R S S^T R^T$ (quaternion $R$ + 3D scale $S$), and Spherical Harmonics (SH0–SH3, up to 48 floats) for view-dependent specular color.
- **2D Projection:** Projected to screen-space 2D covariance via viewing matrix $W$ and perspective Jacobian $J$: $\Sigma' = J W \Sigma W^T J^T$.
- **Compositing:** Depth-sorted back-to-front (or front-to-back with early termination) alpha blending: $C = \sum_{i} c_i \alpha_i \prod_{j < i} (1 - \alpha_j)$.

---

## 3. WebGL2 vs. WebGPU Architecture & Mobile Guardrails

WebGL2 (~98%+ browser reach) has **no compute shaders**. Production WebGL2 splat renderers store quantized Gaussian attributes in floating-point/integer textures, project splats via instanced screen-space quads in the vertex shader, and offload depth sorting to an async **Web Worker + WASM radix sort**. WebGPU (`WebGPURenderer` / TSL) runs projection and counting/radix sorting natively in GPU compute shaders.

### Mandatory WebGL2 & Mobile Rules
1. **Never ship raw `.ply` files to the web.** Raw `.ply` (~236 bytes/splat) easily exceeds 200 MB–1 GB and crashes mobile Safari/Chrome. Always transcode to **`.sog`** (~15–20× smaller, Morton-ordered WebP tiles) or **`.spz`** (~10–15× smaller, quantized + entropy coded).
2. **Force `precision highp float;`** in any custom splat fragment/vertex shader. Mobile `mediump` breaks covariance matrix inversion and causes splat popping/tearing.
3. **Budget SH & splat counts for mobile:**
   - Desktop WebGL2: comfortable up to ~1–2M splats (SH1–SH3).
   - Mobile WebGL2: target ≤300k–600k splats, truncate to **SH0 (DC)** or **SH1**, and clamp `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`.
   - For multi-million splat worlds, use **LOD streaming** (`.sog` / `.rad` in Spark or PlayCanvas).
4. **Hybrid mesh occlusion:** Render opaque polygon meshes first (depth write ON), then render sorted splats with `depthTest: true` and `depthWrite: false`.
5. **Respect `design-donts`:** On load, the 3D canvas must own ≥70% of the viewport (no crowded sidebars/inspectors open by default), avoid unprompted pitch-black `#000` UI chrome, and screenshot-verify at 1280px and 390px before shipping.

---

## 4. Library Selection Matrix

| Library | Backend | Hybrid Meshes | Formats | Install / Pick When |
| :--- | :--- | :--- | :--- | :--- |
| **Spark (`@sparkjsdev/spark`)** *(World Labs, MIT)* | **WebGL2** (+ WASM sort) | Best (`SplatMesh` extends `THREE.Object3D`) | `.spz`, `.sog`, `.rad`, `.ply`, `.splat`, `.ksplat` | **Default for Three.js WebGL2**: `npm i @sparkjsdev/spark` |
| **Three.js Native (`r186+`)** (`GaussianSplat` + TSL) | **WebGPU** (+ WebGL2 fallback) | Native (`GaussianSplat` extends `THREE.Mesh`, raycasting) | `.spz`, `.ply`, `.splat`, `.ksplat`, `glTF` (`KHR_gaussian_splatting`) | **Default for WebGPURenderer**: built into `three@^0.186.0` |
| **PlayCanvas + SuperSplat** *(MIT)* | WebGL2 & WebGPU | Full engine + WebXR | `.sog`, `.ply`, `.spz` | Browser editing/cleanup (SuperSplat) & massive LOD-streamed `.sog` worlds |
| **`@mkkellogg/gaussian-splats-3d`** *(MIT)* | WebGL2 (Three.js) | Yes | `.ply`, `.splat`, `.ksplat` | Legacy Three.js WebGL2 projects |

---

## 5. Asset Pipeline: Capture, Generate, Clean, Compress

### A. Generative 3DGS & Full 360° Interactive Scene Decomposition (Single Photo → Interactive 3D)
Single-photo 2.5D projection or monocular depth always hits a hard physical wall past ~15–25° orbit (missing backfaces & disocclusions). For **true 360° turnaround, object picking, physics, and dynamic relighting** from a single reference photograph, use the 4-stage generative decomposition pipeline:

1. **Stage 1 — 3D Scene Decomposition & Pose (`Meta SAM 3D` / `Hunyuan3D Part`):** Segment the photo into discrete semantic objects and predict each object's metric 3D bounding pose (`position`, `rotation`, `scale`) in world coordinates.
2. **Stage 2 — Macro 360° World Expansion (`World Labs Marble` / `HunyuanWorld`):** Feed the de-populated background environment to a multimodal world model to hallucinate the unseen 360° space, exporting both a **3DGS backdrop (`.spz`/`.sog`)** and a **collider mesh (`.glb`)**.
3. **Stage 3 — Object-Level 360° PBR Turnaround Assets (`Microsoft TRELLIS.2` / `Hunyuan3D v3.0`):** Pass cropped foreground hero objects through a 4B flow-matching 3D generator (**TRELLIS.2 O-Voxels** up to $1536^3$) to obtain watertight 360° `.glb` triangle meshes with full de-lit PBR maps (`albedo`, `normal`, `roughness`, `metallic`, `alpha`).
4. **Stage 4 — Surface-Aligned Relighting, Physics & Unified Web Runtime (`2DGS / SuGaR / GOF` + `Three.js r186+` / `Spark` + `Rapier`):**
   - Composite the `.spz`/`.sog` world backdrop with the `.glb` hero props at SAM 3D's exact poses inside `Three.js r186+` (`GaussianSplat` + native raycasting) or `@sparkjsdev/spark`.
   - Wire Marble's collider mesh + prop convex hulls into **Rapier WASM (`@dimforge/rapier3d-compat`)** for gravity, collisions, and object manipulation.
   - Where full-scene dynamic relighting is required over raw baked 3DGS, extract surface-aligned geometry and normals via **2DGS (2D Gaussian Splatting)**, **SuGaR**, or **GOF (Gaussian Opacity Fields)**.

*(Fast local single-photo & multi-view feed-forward alternatives: **InfiniSplat v1 / v2 / v3 SplatAnything** (`zju3dv/InfiniSplat`, see the dedicated `infinisplat-3dgs` skill for surface-aligned sparse supports, 24-view panorama fusion, GSNorm scale canonicalization, and browser-native multi-layer portrait/scene baking via `infinisplat_bake.py`); or **Apple SHARP** — `<1s` metric `.ply`, research license.)*

### B. Cleanup & Web Compression
1. Import raw `.ply` into **PlayCanvas SuperSplat** (browser) to crop floaters, align ground plane, and color-grade.
2. Export as **`.sog`** (15–20× smaller, Morton-ordered GPU-ready WebP tiles via `@playcanvas/splat-transform`) or **`.spz`** (10–15× smaller, universal across Spark & Three.js `SPZLoader`).

---

## 6. Integration Recipes

### WebGL2 + Three.js (`@sparkjsdev/spark`)
```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.01, 1000);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const spark = new SparkRenderer({ renderer });
scene.add(spark);

const splat = new SplatMesh({ url: '/assets/scene.spz' });
scene.add(splat);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
```

### Three.js `r186+` Native `GaussianSplat` (`WebGPURenderer`)
```ts
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { SPZLoader } from 'three/addons/loaders/SPZLoader.js';
import { GaussianSplat } from 'three/addons/objects/GaussianSplat.js';

const renderer = new WebGPURenderer({ antialias: true });
await renderer.init();

const geometry = await new SPZLoader().loadAsync('/assets/scene.spz');
const splats = new GaussianSplat(geometry, { autoSort: true });
scene.add(splats);
```
