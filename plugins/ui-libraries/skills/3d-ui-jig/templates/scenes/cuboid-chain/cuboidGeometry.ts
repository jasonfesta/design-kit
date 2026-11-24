import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { CuboidConfig } from "./params";

export interface CuboidGeometryResult {
  geometry: THREE.BufferGeometry;
  halfDepth: number;
  capBand: number;
}

function createRoundedRectShape(
  width: number,
  height: number,
  radius: number
): THREE.Shape {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(radius, hw - 0.001, hh - 0.001));

  const shape = new THREE.Shape();
  if (r <= 0.0001) {
    shape.moveTo(-hw, -hh);
    shape.lineTo(hw, -hh);
    shape.lineTo(hw, hh);
    shape.lineTo(-hw, hh);
    shape.closePath();
    return shape;
  }

  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  shape.closePath();

  return shape;
}

export function buildCuboidGeometry(config: CuboidConfig): CuboidGeometryResult {
  const width = Math.max(0.1, config.width);
  const height = Math.max(0.1, config.height);
  const depth = Math.max(0.02, config.depth);

  const bevelSize = Math.max(
    0,
    Math.min(config.bevelSize, width / 2 - 0.01, height / 2 - 0.01)
  );
  const bevelThickness = Math.max(
    0,
    Math.min(config.bevelThickness, depth / 2 - 0.002)
  );

  const innerW = Math.max(0.02, width - 2 * bevelSize);
  const innerH = Math.max(0.02, height - 2 * bevelSize);
  const innerD = Math.max(0.002, depth - 2 * bevelThickness);

  const clampedCorner = Math.max(
    0,
    Math.min(config.cornerRadius, innerW / 2 - 0.001, innerH / 2 - 0.001)
  );

  const shape = createRoundedRectShape(innerW, innerH, clampedCorner);
  const smoothness = Math.max(1, Math.round(config.smoothness));
  const curveSegments = Math.max(16, smoothness);
  const bevelSegments = Math.max(16, Math.round(2 * smoothness));

  const uvGenerator = {
    generateTopUV(
      _geometry: THREE.ExtrudeGeometry,
      vertices: number[],
      indexA: number,
      indexB: number,
      indexC: number
    ): THREE.Vector2[] {
      const ax = vertices[indexA * 3];
      const ay = vertices[indexA * 3 + 1];
      const bx = vertices[indexB * 3];
      const by = vertices[indexB * 3 + 1];
      const cx = vertices[indexC * 3];
      const cy = vertices[indexC * 3 + 1];

      return [
        new THREE.Vector2((ax + width / 2) / width, (ay + height / 2) / height),
        new THREE.Vector2((bx + width / 2) / width, (by + height / 2) / height),
        new THREE.Vector2((cx + width / 2) / width, (cy + height / 2) / height),
      ];
    },
    generateSideWallUV(): THREE.Vector2[] {
      return [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 0),
      ];
    },
  };

  let geometry: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: innerD,
    bevelEnabled: bevelSize > 0.0001 || bevelThickness > 0.0001,
    bevelSize,
    bevelThickness,
    bevelSegments,
    curveSegments,
    UVGenerator: uvGenerator,
  });

  geometry.center();

  if (bevelSize > 0.0001 || bevelThickness > 0.0001) {
    const merged = mergeVertices(geometry, 1e-4);
    geometry.dispose();
    geometry = merged;
    geometry.computeVertexNormals();
  }

  const halfDepth = depth / 2;
  const capBand = Math.max(
    Math.min(
      2.2 * Math.max(bevelThickness, bevelSize) + 0.001,
      depth / 2 - 0.002
    ),
    0.001
  );

  return { geometry, halfDepth, capBand };
}
