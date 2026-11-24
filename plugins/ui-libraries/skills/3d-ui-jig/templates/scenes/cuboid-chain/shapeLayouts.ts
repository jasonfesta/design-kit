import type { ShapeType } from "./params";

export interface CuboidPose {
  x: number;
  y: number;
  z: number;
  rotY: number;
  rotZ: number;
}

export function isTiledShape(type: ShapeType): boolean {
  return type === "chain" || type === "wave" || type === "helix";
}

export function computeCuboidPose(params: {
  shapeType: ShapeType;
  radius: number;
  amplitude: number;
  tileIndex: number;
  itemIndex: number;
  count: number;
  strideX: number;
  groupWidth: number;
  centerOffset: number;
  scrollOffset: number;
  groupOffsetX: number;
}): CuboidPose {
  const {
    shapeType,
    radius,
    amplitude,
    tileIndex,
    itemIndex,
    count,
    strideX,
    groupWidth,
    centerOffset,
    scrollOffset,
    groupOffsetX,
  } = params;

  const localX = tileIndex * groupWidth + itemIndex * strideX - centerOffset;
  const worldX = localX + groupOffsetX;

  switch (shapeType) {
    case "chain": {
      return {
        x: localX,
        y: 0,
        z: 0,
        rotY: 0,
        rotZ: 0,
      };
    }

    case "wave": {
      const freq = 0.55;
      return {
        x: localX,
        y: Math.sin(worldX * freq) * amplitude,
        z: Math.cos(worldX * freq) * amplitude * 0.35,
        rotY: 0,
        rotZ: Math.cos(worldX * freq) * Math.min(0.25, amplitude * 0.08),
      };
    }

    case "helix": {
      const freq = (Math.PI * 2) / Math.max(groupWidth, 4);
      const angle = worldX * freq + scrollOffset * 0.25;
      return {
        x: localX,
        y: Math.sin(angle) * amplitude,
        z: Math.cos(angle) * (radius * 0.4),
        rotY: 0,
        rotZ: 0,
      };
    }

    case "ring": {
      const safeCount = Math.max(1, count);
      const angle = (itemIndex / safeCount) * Math.PI * 2 + scrollOffset * 0.28;
      const r = Math.max(1.5, radius);
      return {
        x: Math.sin(angle) * r,
        y: Math.sin(angle * 2) * amplitude * 0.15,
        z: Math.cos(angle) * r - r * 0.45,
        rotY: angle,
        rotZ: 0,
      };
    }

    case "arch": {
      const safeCount = Math.max(1, count);
      const t = safeCount > 1 ? (itemIndex / (safeCount - 1)) * 2 - 1 : 0;
      const span = Math.max(radius * 2, safeCount * strideX * 0.85);
      const sway = Math.sin(scrollOffset * 0.35 + itemIndex * 0.35) * amplitude * 0.08;
      return {
        x: t * (span * 0.5),
        y: (1 - t * t) * amplitude * 1.35 - amplitude * 0.45 + sway,
        z: -Math.abs(t) * (radius * 0.28),
        rotY: -t * 0.18,
        rotZ: -t * 0.24,
      };
    }
  }
}
