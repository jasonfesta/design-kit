# Cuboid Chain: reverse-engineered spec

The source is <https://experiments.thisiswhitespace.com/cuboid-chain> (whitespace experiments). It was reverse-engineered from the live DialKit panel and the bundle, then rebuilt in `~/wda/cuboid-chain` (React 19 + Vite 7 + Tailwind v4 + three r185). The `templates/scenes/cuboid-chain` module is the generalized version of that rebuild.

> [!NOTE]
> The live site uses the card accents `#4f6ef0` (indigo), `#c026d3` (magenta) and `#6d4adb` (violet). The template remaps them to `#0d9488`, `#e11d48` and `#ca8a04` under the design-kit taste rule. The live backdrop `#0b0d13` has a blue cast, so the template uses the neutral `#0c0c0e`.

## 1. Chrome on the live page
- **Top bar (excluded)**: a 40px `header[data-capture="chrome"]` with "← All experiments / Cuboid Chain" on the left, and "How it's made" plus a light/dark toggle on the right.
- **Bottom-left widget (replaced)**: a "NEED SOMETHING [FUN?]" contact pill (`#161616`, `#fe8040` hover). The rebuild replaces it with the schema-driven bottom dock.
- **Right-hand jig**: a DialKit panel (`position: "top-right"`) titled **Chain**, with a preset select (`Version 1`) and a copy-params button.

## 2. Jig controls (defaults · min..max · step)

**Cuboid**: Width 1.7 · 0.3..5 · 0.01 · Height 2.4 · 0.3..6 · 0.01 · Depth 2 · 0.02..2 · 0.01 · Corner Radius 0.105 · 0..0.6 · 0.005 · Bevel Size 0.03 · 0..0.3 · 0.001 · Bevel Thickness 0.04 · 0..0.3 · 0.001 · Smoothness 32 · 1..32 · 1 · Roughness 0.6 · 0..1 · 0.01 · Metalness 0.4 · 0..1 · 0.01 · Color `#242424` · Dither 0 · 0..1 · 0.01

**Layout**: Count 8 · 1..12 · 1 · Gap 0.01 · 0..1.5 · 0.005 · Scroll Speed 0.6 · 0..3 · 0.01

**Rotation**: Speed 0.57 · -4..4 · 0.01 · Stagger 0.37 · -3..3 · 0.01 · Axis `x` (x: barrel roll, y: turntable, z: pinwheel) · Paused false · Face Speed 20 · 1..20 · 0.5

**Lights**: Ambient 0.35 · 0..4 · 0.01 · Ambient Color `#ffffff`
- Top (no shadow): `#ffffff`, intensity 3.1 (0..12 · 0.05), position (20, 9, 3) (each -20..20 · 0.1)
- Bottom (no shadow): `#ffcaad`, intensity 2.15, position (0, -8, 3)
- Key (castShadow): `#ffe9d6`, intensity 5, position (12, 9.2, 7)

**Shadows**: Radius 44.5 · 0..50 · 0.5 · Map Size 2048 · 512..4096 · 256

**Backdrop**: Show true · Color `#0b0d13` (template: `#0c0c0e`) · Z -2.4 · -15..0 · 0.1 · Receive Shadows true · Roughness 0.72 · Metalness 0.39 · Env Intensity 0.3 · 0..4 · 0.05 · Dither 0 · Env Preset `city` (studio, city, apartment, warehouse, dawn, forest, lobby, night, park, sunset)

**Camera**: Fov 65 · 10..90 · 0.5 · X 0 · Y 1.1 (each -20..20 · 0.05) · Z 6.2 · 2..50 · 0.1 · Follow Cursor true · Tilt Deg 15 · 0..15 · 0.1

**Hover**: Subtitle Opacity 1 · Pill Bg Opacity 0.42 · Other Opacity 1 (each 0..1 · 0.01)

**Focus**: Speed 5 · 1..12 · 0.1 · Featured Z -1.05 · -2..5 · 0.05 · Camera Z 4 · 2..20 · 0.1 · Cuboid Tilt Deg 33.5 · 0..40 · 0.5 · Fly Out Extra 8 · 0..12 · 0.1

**Rebuild additions**: a **Shape** section (Type chain | helix | ring | wave | arch, Radius 4.5 · 1.5..12 · 0.1, Amplitude 1.4 · 0..5 · 0.05), a **Card Content** editor, and the presets Studio Warm, Emerald Neon, Monolith and Paper Daylight.

## 3. Scene architecture

- **Renderer**: `dpr [1, 2]`, shadows on, antialias, ACESFilmic tone mapping, sRGB output, PCFSoftShadowMap (deprecated in r18x; the template uses PCFShadowMap + `shadow.radius`).
- **Chain layout and infinite scroll**:
  - `stride = width + gap`, `G = count · stride`, `centerOffset = (count - 1) · stride / 2`.
  - `viewHalf` is computed at `camera.z` from the aspect ratio and fov. The tile count is `W = max(3, ceil(viewHalf / G) + 2)`.
  - Tiles `n = -W..W` and items `o = 0..count-1` sit at `x = n·G + o·stride - centerOffset`, with `y = z = 0`.
  - `scrollOffset += scrollSpeed · dt` unless the chain is hovered or a card is in focus. Then `group.position.x = -(scrollOffset mod G)`.
  - An invisible hit plane at `z = -2·depth`, sized `((2W+1)·G + 2·width) × 1.15·height`, sets `chainHovered`.
- **Geometry**: ExtrudeGeometry of a rounded-rectangle Shape.
  - The inner size is `width - 2·bevelSize` by `height - 2·bevelSize`. The corner radius is clamped, `curveSegments = max(16, smoothness)` and `bevelSegments = max(16, 2·smoothness)`. Then `geometry.center()`.
  - UVGenerator: `generateTopUV` maps (x, y) linearly to [0..1] across width × height. `generateSideWallUV` returns (0, 0).
  - When beveled, `mergeVertices(geom, 1e-4)` and then `computeVertexNormals()`.
  - `halfDepth = depth / 2` and `capBand = clamp(2.2·max(bevelThickness, bevelSize) + 0.001, 0.001, depth/2 - 0.002)`.
- **Card textures**: 540 × 756 CanvasTexture, SRGBColorSpace, anisotropy 8, mipmaps.
  - **Content pass**: transparent background.
    - Category: 25px/400 at (45, 53) in `lerp(accent, #fff, 0.55)`.
    - Title: 38px/500 `#fff`, wrapped at 450px with 47px line height, starting at y=104.
    - Optional description: 21px/400 `rgba(255,255,255,.88)`.
    - Pills at y=661: stroked rounded rects (h50, r25, 1.4px stroke) with 18px mono labels.
  - **Hover pass**: the category in `#000`, plus solid `#000` pills with `#fff` labels.
- **Cuboid material**: MeshStandardMaterial with `envMapIntensity 0`, `dithering`, `transparent`, and `onBeforeCompile`:
  - Vertex: `smoothstep(uHalfDepth - uCapBand, uHalfDepth, ±position.z)` bends the cap normals to ±Z. `vFrontBlend = frontT · smoothstep(0.08, 0.5, capN.z)`.
  - Fragment (replaces `<map_fragment>`): linearize the map with `pow(rgb, 2.2)` and mix `uBaseColor → uAccentColor` by `uHover`. The subtitle mask is `step(0.88, uv.y)` and the pill mask is `1 - step(0.20, uv.y)`. Content fades in those bands on hover, and `uHoverMap` blends in weighted by `uSubtitleOpacity` / `uPillBgOpacity`. Everything is multiplied by `vFrontBlend`.
  - Fragment (after `<colorspace_fragment>`): `(fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) · 43758.5453) - 0.5) · uDither`.
- **Rotation, hover and focus**:
  - `phase += dt · speed`. Each card's target angle is `phase + index · stagger`.
  - A hovered card (axis x) eases to `atan2(-toCam.y, toCam.z)` at `faceSpeed`, taking the shortest arc. The other cards fade to `otherOpacity`.
  - **Click to focus**: `focusProgress` eases toward 1 at `focus.speed`. The selected card moves to the camera ray at `featuredZ`, scales by `camera.z / (camZ - featuredZ)`, and rotates flat, then picks up a pointer tilt of `cuboidTiltDeg` (×0.65 on X). The other cards fly out by `±(viewHalf + flyOutExtra)` and fade by `1 - focusProgress`. Clicking the card again, or the background, exits focus.
- **Backdrop**: an 80 × 50 plane with MeshStandardMaterial, the env preset, `receiveShadow`, and the same dither.
- **Key shadow frustum (per frame)**: half width `viewHalf + 4` and half height `max(2.5·height, 8)`. `bias = -3e-4 / (mapSize/2048)`, `normalBias = 0.02 / (mapSize/2048)`, `radius = shadows.radius · (mapSize/2048)`, `near 0.1`, `far 80`.
- **Camera**: Z lerps from `camera.z` to `focus.cameraZ` by `focusProgress`, then `lookAt(0, 0, 0)`. The exponential cursor-follow `rotateX` / `rotateY` reaches up to `tiltDeg` and is turned off during focus.

## 4. Where each part lives in the template

| Spec part | Template file |
| :--- | :--- |
| Lights, shadow frustum, backdrop, env | `rig/createRig.ts`, `rig/envMaps.ts` |
| Camera and cursor tilt | `rig/cameraRig.ts` |
| Dither and cap-normal GLSL | `rig/shaderHooks.ts` |
| Geometry and UVs | `scenes/cuboid-chain/cuboidGeometry.ts` |
| Card canvases | `scenes/cuboid-chain/cardTexture.ts` |
| Card composite shader | `scenes/cuboid-chain/cuboidShader.ts` |
| Chain, helix, ring, wave and arch poses | `scenes/cuboid-chain/shapeLayouts.ts` |
| Scroll, hover, focus loop | `scenes/cuboid-chain/runtime.ts` |
| Jig ranges | `scenes/cuboid-chain/schema.ts` + `rig/rigSchema.ts` |
