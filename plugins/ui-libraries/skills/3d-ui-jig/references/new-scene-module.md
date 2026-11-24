# Adding a new scene module

A scene module is one folder in `src/three/scenes/<id>/` that exports a `SceneModule<P>` (see `src/three/scenes/types.ts`). The rig, jig, dock, presets, Copy JSON, `?nojig=1` and Copy Prompt all come for free.

## 1. Start from `blank`

```bash
cp -r src/three/scenes/blank src/three/scenes/tactile-tiles
# or from the skill: ~/design-kit/skills/3d-ui-jig/templates/scenes/blank
```

Point `src/data/jigData.ts` at it:

```ts
import { tactileTilesScene } from "@/three/scenes/tactile-tiles";
export const APP_TITLE = "Tactile Tiles";
export const activeScene = tactileTilesScene;
```

## 2. Type the params and defaults

```ts
export interface TilesParams {
  tile: { size: number; depth: number; radius: number; color: string; dither: number };
  grid: { cols: number; gap: number };
  press: { depth: number; speed: number };
}
export const TILES_DEFAULTS: TilesParams = { /* … */ };
```

Keep everything the jig should tune in `P`. Values the jig can't express (such as arrays of card content) also live in `P`. List them in `persistPaths` so presets don't wipe them, and edit them through an `ExtraSection`.

## 3. Describe the controls as a schema

Paths are dot paths into `{ rig, scene }`. Scene paths start with `scene.`.

```ts
schema: [
  {
    id: "tile", title: "Tile", defaultOpen: true,
    controls: [
      { type: "slider", label: "Size", path: "scene.tile.size", min: 0.3, max: 3, step: 0.01 },
      { type: "color", label: "Color", path: "scene.tile.color" },
      { type: "toggle", label: "Paused", path: "scene.press.paused" },
      { type: "select", label: "Mode", path: "scene.grid.mode", options: [{ value: "grid", label: "Grid" }] },
      { type: "text", label: "Label", path: "scene.tile.label" },
      { type: "group", label: "Press", controls: [ /* nested controls */ ] },
    ],
  },
],
```

To catch typos, call `validateSchema(module.schema, buildDefaults(module))` from `components/jig/schema.ts` in dev. It lists every path that doesn't resolve.

Add dock items for the two or three controls people reach for most:

```ts
dock: [
  { kind: "segmented", label: "Mode", path: "scene.grid.mode", options: [/* … */] },
  { kind: "play-pause", label: "motion", path: "scene.press.paused" },
  { kind: "preset" },
  { kind: "reset-view" },
],
```

## 4. Write the runtime

```ts
create(ctx, initial) {
  // Build meshes. Use rig hooks for materials:
  //   patchStandardMaterial(mat, [capNormalSofteningHook(h, band), ditherHook(0)], "tiles-v1")
  //   createDitheredStandardMaterial({ color, roughness, metalness })
  return {
    preFrame(p, frame) {
      // Hover raycast with frame.raycaster (already set from the pointer).
      // Return camera / shadow directives:
      return { cameraZ: frame.rig.camera.z, cursor: "default" };
    },
    update(p, frame) { /* animate with frame.dt, frame.time, frame.pointer */ },
    onParamsChange(next, prev) { /* rebuild geometry / textures when keys change */ },
    onClick(raycaster) { /* select, focus; ctx.emit("focusedIndex", i) */ },
    onReset() { /* exit focus, rewind */ },
    dispose() { /* remove + dispose everything you created */ },
  };
}
```

Rules of thumb:
- **The rig owns** lights, shadows, backdrop, env and camera, so don't create your own. Steer them through `FrameDirectives`: `cameraZ`, `cameraOffsetY`, `tiltScale`, `shadowHalfWidth`, `shadowHalfHeight`, `cursor`.
- **Read live values from the `p` passed into `preFrame` / `update`.** Use `onParamsChange` only for expensive rebuilds, and gate them on a string key of the fields that matter (see `geomKey` in `cuboid-chain/runtime.ts`).
- **CanvasTexture UI**: set `SRGBColorSpace`, anisotropy ≤ `ctx.maxAnisotropy`, and mipmaps. Redraw after `document.fonts.ready`, and cache textures by a content signature.
- **Card art on one face only**: center the geometry on Z, give the caps [0..1] UVs, add `capNormalSofteningHook`, and multiply your map blend by `vFrontBlend`.
- Set `customProgramCacheKey` (`patchStandardMaterial` does this) whenever two materials have different patches.

## 5. Presets and prompts

```ts
defaultPresetName: "Version 1",
rigDefaults: { backdrop: { color: "#f5f4f0", envPreset: "studio" } },  // light by default
presets: {
  "Night Desk": { rig: { backdrop: { color: "#0c0c0e" } }, scene: { tile: { color: "#1c1b19" } } },
},
prompt: {
  elements: ({ values: { scene } }) => `- Tiles: ${scene.grid.cols} columns, size=${scene.tile.size} …`,
  shader: ({ values: { scene } }) => `- Tile material: … dither=${scene.tile.dither}`,
},
shaderSnippets: [{ name: "Press glow (after #include <emissivemap_fragment>)", glsl: PRESS_GLSL }],
```

To save a tuned look, use the jig's **Copy JSON** and paste the result as a preset. The Right-Hand Jig prompt is generated from the schema, so you don't write it by hand.

## 6. Checklist
- [ ] `npx tsc --noEmit` and `npx vite build` pass.
- [ ] `python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py <project>` reports no errors.
- [ ] No purple (OKLCH hue 270–330) in the defaults, presets or card accents. No Material fonts. A light default, or a stated reason for dark.
- [ ] `?nojig=1` gives a clean frame.
- [ ] `dispose()` frees every geometry, material and texture (StrictMode mounts the stage twice in dev).
