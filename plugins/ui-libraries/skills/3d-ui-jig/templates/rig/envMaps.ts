import * as THREE from "three";
import type { EnvPreset } from "./rigTypes";

interface PresetPalette {
  skyTop: string;
  skyHorizon: string;
  ground: string;
  keyPanel: string;
  keyIntensity: number;
  fillPanel: string;
  fillIntensity: number;
  rimPanel: string;
  rimIntensity: number;
}

const PRESET_PALETTES: Record<EnvPreset, PresetPalette> = {
  studio: {
    skyTop: "#e4e4e7",
    skyHorizon: "#a1a1aa",
    ground: "#18181b",
    keyPanel: "#ffffff",
    keyIntensity: 4.0,
    fillPanel: "#f4f4f5",
    fillIntensity: 2.0,
    rimPanel: "#fff7ed",
    rimIntensity: 2.5,
  },
  city: {
    skyTop: "#71717a",
    skyHorizon: "#d4d4d8",
    ground: "#141417",
    keyPanel: "#fef3c7",
    keyIntensity: 3.4,
    fillPanel: "#e4e4e7",
    fillIntensity: 1.8,
    rimPanel: "#fed7aa",
    rimIntensity: 2.6,
  },
  apartment: {
    skyTop: "#d6d3d1",
    skyHorizon: "#fef3c7",
    ground: "#292524",
    keyPanel: "#fffbeb",
    keyIntensity: 3.2,
    fillPanel: "#fde68a",
    fillIntensity: 1.7,
    rimPanel: "#ffffff",
    rimIntensity: 2.0,
  },
  warehouse: {
    skyTop: "#3f3f46",
    skyHorizon: "#71717a",
    ground: "#09090b",
    keyPanel: "#fafafa",
    keyIntensity: 4.5,
    fillPanel: "#d4d4d8",
    fillIntensity: 1.4,
    rimPanel: "#fef08a",
    rimIntensity: 2.2,
  },
  dawn: {
    skyTop: "#78716c",
    skyHorizon: "#fdba74",
    ground: "#1c1917",
    keyPanel: "#fed7aa",
    keyIntensity: 3.6,
    fillPanel: "#fca5a5",
    fillIntensity: 1.8,
    rimPanel: "#fef3c7",
    rimIntensity: 2.4,
  },
  forest: {
    skyTop: "#a7f3d0",
    skyHorizon: "#d9f99d",
    ground: "#14532d",
    keyPanel: "#ecfdf5",
    keyIntensity: 3.0,
    fillPanel: "#bef264",
    fillIntensity: 1.6,
    rimPanel: "#fef9c3",
    rimIntensity: 2.0,
  },
  lobby: {
    skyTop: "#e7e5e4",
    skyHorizon: "#fde68a",
    ground: "#27272a",
    keyPanel: "#fff7ed",
    keyIntensity: 3.5,
    fillPanel: "#fed7aa",
    fillIntensity: 2.1,
    rimPanel: "#ffffff",
    rimIntensity: 2.3,
  },
  night: {
    skyTop: "#18181b",
    skyHorizon: "#27272a",
    ground: "#09090b",
    keyPanel: "#99f6e4",
    keyIntensity: 2.8,
    fillPanel: "#fde68a",
    fillIntensity: 1.3,
    rimPanel: "#fb923c",
    rimIntensity: 2.1,
  },
  park: {
    skyTop: "#d9f99d",
    skyHorizon: "#fef3c7",
    ground: "#365314",
    keyPanel: "#fffbeb",
    keyIntensity: 3.4,
    fillPanel: "#bbf7d0",
    fillIntensity: 1.9,
    rimPanel: "#ffffff",
    rimIntensity: 2.0,
  },
  sunset: {
    skyTop: "#7c2d12",
    skyHorizon: "#fb923c",
    ground: "#1c1917",
    keyPanel: "#fdba74",
    keyIntensity: 4.0,
    fillPanel: "#fca5a5",
    fillIntensity: 2.0,
    rimPanel: "#fef08a",
    rimIntensity: 2.8,
  },
};

function makeColorWithIntensity(hex: string, intensity: number): THREE.Color {
  const c = new THREE.Color(hex);
  c.multiplyScalar(intensity);
  return c;
}

export function generateProceduralEnvMap(
  renderer: THREE.WebGLRenderer,
  preset: EnvPreset
): THREE.Texture {
  const palette = PRESET_PALETTES[preset] ?? PRESET_PALETTES.city;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  const disposables: Array<{ dispose: () => void }> = [];

  // Gradient dome via vertex-colored sphere
  const domeGeo = new THREE.SphereGeometry(20, 24, 16);
  const pos = domeGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const topColor = new THREE.Color(palette.skyTop);
  const horizonColor = new THREE.Color(palette.skyHorizon);
  const groundColor = new THREE.Color(palette.ground);
  const tmpColor = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 20;
    if (y >= 0) {
      tmpColor.copy(horizonColor).lerp(topColor, Math.pow(y, 0.7));
    } else {
      tmpColor.copy(horizonColor).lerp(groundColor, Math.pow(-y, 0.5));
    }
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }
  domeGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const domeMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide,
  });
  envScene.add(new THREE.Mesh(domeGeo, domeMat));
  disposables.push(domeGeo, domeMat);

  // Softbox light panels
  const panelGeo = new THREE.PlaneGeometry(8, 5);
  disposables.push(panelGeo);

  const addPanel = (
    hex: string,
    intensity: number,
    position: [number, number, number],
    lookAt: [number, number, number],
    scale: [number, number, number] = [1, 1, 1]
  ) => {
    const mat = new THREE.MeshBasicMaterial({
      color: makeColorWithIntensity(hex, intensity),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(panelGeo, mat);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.lookAt(...lookAt);
    envScene.add(mesh);
    disposables.push(mat);
  };

  addPanel(palette.keyPanel, palette.keyIntensity, [10, 8, 8], [0, 0, 0], [1.2, 1.0, 1]);
  addPanel(palette.fillPanel, palette.fillIntensity, [-11, 3, 6], [0, 0, 0], [1.4, 1.1, 1]);
  addPanel(palette.rimPanel, palette.rimIntensity, [0, 10, -9], [0, 0, 0], [1.8, 0.8, 1]);
  addPanel(palette.ground, 0.8, [0, -10, 0], [0, 0, 0], [2.5, 2.5, 1]);

  const target = pmrem.fromScene(envScene, 0.04);

  for (const d of disposables) {
    d.dispose();
  }
  pmrem.dispose();

  return target.texture;
}
