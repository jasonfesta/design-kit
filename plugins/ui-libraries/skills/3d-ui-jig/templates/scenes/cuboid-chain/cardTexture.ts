import * as THREE from "three";
import type { CardItem } from "./params";

export const CARD_TEX_WIDTH = 540;
export const CARD_TEX_HEIGHT = 756;

const PAD_X = 45;
const MAX_TEXT_WIDTH = 450;
const PILL_Y = 661;
const PILL_H = 50;
const PILL_R = 25;
const PILL_GAP = 12;

export interface CardTexturePair {
  contentTexture: THREE.CanvasTexture;
  hoverTexture: THREE.CanvasTexture;
}

function lerpHexToWhite(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return "#ffffff";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr}, ${lg}, ${lb})`;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines) {
        return lines;
      }
    }
  }
  if (lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function configureTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.max(1, anisotropy);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

export function createCardTextures(
  card: CardItem,
  anisotropy = 8
): CardTexturePair {
  const tintedAccent = lerpHexToWhite(card.accentColor, 0.55);

  // 1. Content Texture
  const contentCanvas = document.createElement("canvas");
  contentCanvas.width = CARD_TEX_WIDTH;
  contentCanvas.height = CARD_TEX_HEIGHT;
  const ctx = contentCanvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, CARD_TEX_WIDTH, CARD_TEX_HEIGHT);
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    // Category
    ctx.font = '400 25px "Instrument Sans Variable", "Instrument Sans", sans-serif';
    ctx.fillStyle = tintedAccent;
    ctx.fillText(card.category, PAD_X, 53, MAX_TEXT_WIDTH);

    // Title
    ctx.font = '500 38px "Instrument Sans Variable", "Instrument Sans", sans-serif';
    ctx.fillStyle = "#ffffff";
    const titleLines = wrapLines(ctx, card.title, MAX_TEXT_WIDTH, 5);
    let cursorY = 104;
    const titleLineHeight = 47;
    for (const line of titleLines) {
      ctx.fillText(line, PAD_X, cursorY, MAX_TEXT_WIDTH);
      cursorY += titleLineHeight;
    }

    // Optional Description
    if (card.description && card.description.trim().length > 0) {
      cursorY += 16;
      ctx.font = '400 21px "Instrument Sans Variable", "Instrument Sans", sans-serif';
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      const descLines = wrapLines(ctx, card.description, MAX_TEXT_WIDTH, 4);
      for (const line of descLines) {
        if (cursorY + 30 > PILL_Y - 24) break;
        ctx.fillText(line, PAD_X, cursorY, MAX_TEXT_WIDTH);
        cursorY += 30;
      }
    }

    // Bottom Pills (stroked)
    ctx.font = '500 18px "JetBrains Mono Variable", "JetBrains Mono", monospace';
    let pillX = PAD_X;
    for (const pill of card.pills.slice(0, 3)) {
      const label = pill.trim();
      if (!label) continue;
      const textWidth = ctx.measureText(label).width;
      const pillW = Math.min(MAX_TEXT_WIDTH - (pillX - PAD_X), textWidth + 36);
      if (pillW < 48) break;

      drawRoundedRectPath(ctx, pillX, PILL_Y, pillW, PILL_H, PILL_R);
      ctx.strokeStyle = tintedAccent;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = tintedAccent;
      ctx.textBaseline = "middle";
      ctx.fillText(label, pillX + 18, PILL_Y + PILL_H / 2 + 0.5, pillW - 36);
      ctx.textBaseline = "top";

      pillX += pillW + PILL_GAP;
    }
  }

  // 2. Hover Texture
  const hoverCanvas = document.createElement("canvas");
  hoverCanvas.width = CARD_TEX_WIDTH;
  hoverCanvas.height = CARD_TEX_HEIGHT;
  const hctx = hoverCanvas.getContext("2d");

  if (hctx) {
    hctx.clearRect(0, 0, CARD_TEX_WIDTH, CARD_TEX_HEIGHT);
    hctx.textBaseline = "top";
    hctx.textAlign = "left";

    // Category in #000000
    hctx.font = '400 25px "Instrument Sans Variable", "Instrument Sans", sans-serif';
    hctx.fillStyle = "#000000";
    hctx.fillText(card.category, PAD_X, 53, MAX_TEXT_WIDTH);

    // Solid #000000 filled pills with #ffffff text
    hctx.font = '500 18px "JetBrains Mono Variable", "JetBrains Mono", monospace';
    let pillX = PAD_X;
    for (const pill of card.pills.slice(0, 3)) {
      const label = pill.trim();
      if (!label) continue;
      const textWidth = hctx.measureText(label).width;
      const pillW = Math.min(MAX_TEXT_WIDTH - (pillX - PAD_X), textWidth + 36);
      if (pillW < 48) break;

      drawRoundedRectPath(hctx, pillX, PILL_Y, pillW, PILL_H, PILL_R);
      hctx.fillStyle = "#000000";
      hctx.fill();

      hctx.fillStyle = "#ffffff";
      hctx.textBaseline = "middle";
      hctx.fillText(label, pillX + 18, PILL_Y + PILL_H / 2 + 0.5, pillW - 36);
      hctx.textBaseline = "top";

      pillX += pillW + PILL_GAP;
    }
  }

  return {
    contentTexture: configureTexture(contentCanvas, anisotropy),
    hoverTexture: configureTexture(hoverCanvas, anisotropy),
  };
}

export function disposeCardTextures(pair: CardTexturePair | undefined): void {
  if (!pair) return;
  pair.contentTexture.dispose();
  pair.hoverTexture.dispose();
}
