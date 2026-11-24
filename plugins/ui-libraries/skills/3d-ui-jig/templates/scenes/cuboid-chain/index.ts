import type { SceneModule } from "@/three/scenes/types";
import { CardEditor } from "./CardEditor";
import { CARD_MAP_FRAGMENT_GLSL } from "./cuboidShader";
import { CUBOID_CHAIN_DEFAULTS, type CuboidChainParams } from "./params";
import { CUBOID_CHAIN_PRESETS, CUBOID_CHAIN_RIG } from "./presets";
import { createCuboidChainRuntime } from "./runtime";
import { CUBOID_CHAIN_DOCK, CUBOID_CHAIN_SCHEMA } from "./schema";

export const cuboidChainScene: SceneModule<CuboidChainParams> = {
  id: "cuboid-chain",
  title: "Cuboid Chain",
  summary: "an infinite row of beveled cuboids whose front caps carry CanvasTexture UI cards.",
  defaults: CUBOID_CHAIN_DEFAULTS,
  rigDefaults: CUBOID_CHAIN_RIG,
  defaultPresetName: "Version 1",
  schema: CUBOID_CHAIN_SCHEMA,
  presets: CUBOID_CHAIN_PRESETS,
  dock: CUBOID_CHAIN_DOCK,
  persistPaths: ["scene.cards"],
  ExtraSection: CardEditor,
  extraSectionLabel: "Edit Card",
  shaderSnippets: [{ name: "Card composite (replaces #include <map_fragment>)", glsl: CARD_MAP_FRAGMENT_GLSL }],
  prompt: {
    elements: ({ values: { scene: s } }) => {
      const { shape, cuboid: c, layout, rotation: r, hover, focus } = s;
      return `- Geometry: ExtrudeGeometry of a rounded rectangle (width=${c.width}, height=${c.height}, depth=${c.depth}, cornerRadius=${c.cornerRadius}, bevelSize=${c.bevelSize}, bevelThickness=${c.bevelThickness}, curveSegments=max(16, ${c.smoothness}), bevelSegments=max(16, 2·${c.smoothness})), geometry.center(). Custom UVGenerator: generateTopUV maps caps linearly to [0..1] over width×height; generateSideWallUV returns (0,0) so walls never sample card art. mergeVertices(geom, 1e-4) + computeVertexNormals() when beveled. halfDepth=depth/2, capBand=clamp(2.2·max(bevelThickness, bevelSize)+0.001, 0.001, depth/2-0.002).
- Material: color ${c.color}, roughness=${c.roughness}, metalness=${c.metalness}, envMapIntensity=0, dithering, transparent, dither=${c.dither}.
- Card faces: 540×756 CanvasTexture (SRGBColorSpace, anisotropy 8, mipmaps). Content pass: transparent bg, category 25px/400 at y=53 tinted lerp(accent, #fff, 0.55), title 38px/500 #fff wrapped at 450px with 47px leading, optional description 21px/400 rgba(255,255,255,.88), stroked pills (h50, r25, 1.4px) at y=661. Hover pass: black category + solid black pills with white mono labels. Redraw once document.fonts.ready resolves.
- Cards (${s.cards.length}): ${s.cards.map((k) => `"${k.title}" (${k.category}, ${k.accentColor})`).join("; ")}.
- Layout: shape="${shape.type}" (radius=${shape.radius}, amplitude=${shape.amplitude}); chain/helix/wave tile infinitely: stride=width+gap (gap=${layout.gap}), count=${layout.count}, groupWidth=count·stride, tiles n=-W..W with W=max(3, ceil(viewHalf/groupWidth)+2), x=n·G+o·stride-centerOffset, group.position.x=-(scroll mod G), scrollSpeed=${layout.scrollSpeed}, paused while the chain (or an invisible hit plane behind it) is hovered. ring/arch are finite.
- Rotation: phase += speed(${r.speed})·dt unless paused (${r.paused}); angle = phase + index·stagger(${r.stagger}) around axis "${r.axis}". Hovered card (axis x) eases to face the camera at faceSpeed=${r.faceSpeed}; others fade to otherOpacity=${hover.otherOpacity}.
- Focus: click a card → focusProgress eases at speed=${focus.speed}; the card moves to featuredZ=${focus.featuredZ} on the camera ray, scales by camera.z/(camZ-featuredZ), rotates flat with pointer tilt up to ${focus.cuboidTiltDeg}°; camera Z lerps to ${focus.cameraZ}; other cards fly out by ±(viewHalf+${focus.flyOutExtra}) and fade. Click again or the background to exit.
- Card Content editor in the jig: live-edit category, title, description, pills and accent of the selected or focused card.`;
    },
    shader: ({ values: { scene: s } }) =>
      `- Cuboid: rig cap-normal softening hook (uHalfDepth, uCapBand → vFrontBlend) + card composite replacing <map_fragment>: linearize map with pow(rgb, 2.2), mix uBaseColor (${s.cuboid.color}) → per-card uAccentColor by uHover, mask subtitle (vMapUv.y ≥ 0.88) and pills (vMapUv.y < 0.20) out on hover and blend uHoverMap using uSubtitleOpacity=${s.hover.subtitleOpacity} and uPillBgOpacity=${s.hover.pillBgOpacity}, all gated by vFrontBlend. Then the rig dither hook (uDither=${s.cuboid.dither}).
- Backdrop: rig dithered MeshStandardMaterial.`,
  },
  create: createCuboidChainRuntime,
};

export default cuboidChainScene;
