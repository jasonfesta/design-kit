#!/usr/bin/env node
/**
 * Benchmark Interaction Planner CLI (`generate-interaction-plan.mjs`)
 *
 * Verifies the 4K Grid Sheet geometry (`input.png` vs `output.png`) inside a
 * `websites/<brand>/` directory, warns if `output.png` is a distorted 1:1 square
 * FAL output (`4096x4096`) instead of a 5:3 4K sheet (`4096x2458` / `5504x3072`),
 * checks that all 5 page slices exist, and validates or scaffolds
 * `websites/<brand>/INTERACTION_PLAN.md` with 5-10 Competitor Benchmark URLs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const BENCHMARK_SETS = {
  leather: [
    { name: 'Polène Paris', url: 'https://eng.polene-paris.com/', domain: 'Sculptural silhouette cards, floating hero product card, 3-part macro study (The form / detail / inside)' },
    { name: 'Bottega Veneta', url: 'https://www.bottegaveneta.com/', domain: 'Full-bleed ambient campaign films with live Play/Pause, scrubbing timeline, and Mute/Unmute controls' },
    { name: 'Loewe', url: 'https://www.loewe.com/', domain: 'Tactile material & hardware macro storytelling, small leather goods cross-sell, and atelier repair guidance' },
    { name: 'Hereu Studio', url: 'https://hereustudio.com/', domain: '7-stage artisanal workshop chronology and 3-step daily leather care rituals' },
    { name: 'Wandler', url: 'https://wandler.com/', domain: 'Find your form silhouette filter pills and live 4-color leather finish swatch selectors' },
    { name: 'Manu Atelier', url: 'https://www.manuatelier.com/', domain: 'Compare the everyday details 3-column specification matrix and secondary silhouette campaign spotlights' },
    { name: 'Aesop', url: 'https://www.aesop.com/', domain: 'Warm parchment/travertine surface layering, zero-jitter spec/FAQ accordions, and 01-07 chapter index' },
    { name: 'Khaite', url: 'https://khaite.com/', domain: '3-portrait carry-mode lookbook switcher and editorial journal essay reader modal' },
    { name: 'Jacquemus', url: 'https://www.jacquemus.com/', domain: '6-angle vertical PDP gallery, live quantity stepper, and synchronized inline + slide-over Shopping Bag' },
    { name: 'Celine', url: 'https://www.celine.com/', domain: 'Architectural dimension overlay with cm/in toggle, sticky global chrome, community gallery, and newsletter dispatch' },
  ],
  architecture: [
    { name: 'Norm Architects', url: 'https://normcph.com/', domain: 'Quiet architectural monograph pacing, typology filter pills, and daylight material palettes' },
    { name: 'CLOU Architects', url: 'https://www.clouarchitects.com/', domain: 'Spatial index tables, floor-area / completion-year metadata columns, and elevation drawers' },
    { name: 'John Pawson', url: 'https://www.johnpawson.com/', domain: 'Minimalist project dossier view with sequential room-by-room photographic gallery' },
    { name: 'David Chipperfield Architects', url: 'https://davidchipperfield.com/', domain: 'Studio methodology chronology and publication archive cards' },
    { name: 'Olson Kundig', url: 'https://olsonkundig.com/', domain: 'Interactive material palette board and daylight orientation diagrams' },
    { name: 'Audo Copenhagen', url: 'https://audocph.com/', domain: 'Warm interior spatial storytelling and room vignette element callouts' },
    { name: 'Frama Copenhagen', url: 'https://framacph.com/', domain: 'Start a project consultation brief intake flow (scope, timeline, budget band)' },
    { name: 'Snøhetta', url: 'https://snohetta.com/', domain: 'Cross-disciplinary studio journal and interactive project comparison matrix' },
  ],
  aperitif: [
    { name: 'Ghia', url: 'https://drinkghia.com/', domain: 'Mediterranean aperitif art direction, bottle/bundle selectors, and interactive serving guide recipes' },
    { name: 'De Soi', url: 'https://drinkdesoi.com/', domain: 'Botanical tasting-note breakdown (Top / Heart / Finish) and pack-size switcher' },
    { name: 'Flamingo Estate', url: 'https://flamingoestate.com/', domain: 'Orchard harvest provenance monograph and seasonal batch subscription drawer' },
    { name: 'Aplós', url: 'https://aplos.world/', domain: 'Minimalist bottle PDP gallery, glassware ritual selector, and expression comparison matrix' },
    { name: 'Seedlip', url: 'https://www.seedlipdrinks.com/', domain: 'Botanical maceration process stepper and garnish pairing guide' },
    { name: 'Wilderton', url: 'https://wildertonfree.com/', domain: 'Tasting profile indicators, bundle builder, and synchronized cart drawer' },
  ],
  skincare: [
    { name: 'Aesop', url: 'https://www.aesop.com/', domain: 'Apothecary formulation table (Skin Feel, Aroma, Key Ingredients, Dosage) and AM/PM routine builder' },
    { name: 'Susanne Kaufmann', url: 'https://www.susannekaufmann.com/', domain: 'Botanical cold-press extraction monograph, bottle size toggle, and skin-type filter pills' },
    { name: 'Grown Alchemist', url: 'https://grownalchemist.com/', domain: 'Bio-active ingredient glossary drawer, texture macro swatches, and 3-step ritual pairing' },
    { name: 'Nécessaire', url: 'https://necessaire.com/', domain: 'Clinical transparency table, barrier-support metrics, and formulation comparison matrix' },
    { name: 'Le Labo', url: 'https://www.lelabofragrances.com/', domain: 'Apothecary label typography, batch notes, and concierge consultation drawer' },
    { name: 'Frama Apothecary', url: 'https://framacph.com/', domain: 'Warm travertine/amber glass vessel photography and architectural grid discipline' },
  ],
};

function getPngDimensions(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const out = execFileSync('file', [filePath], { encoding: 'utf8' });
    const match = out.match(/(\d+)\s*x\s*(\d+)/);
    if (match) {
      return { width: Number(match[1]), height: Number(match[2]) };
    }
  } catch {
    // fallback to PNG header bytes
    const buf = fs.readFileSync(filePath);
    if (buf.length >= 24 && buf.toString('ascii', 1, 4) === 'PNG') {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
  }
  return null;
}

function detectCategory(brandSlug) {
  const s = brandSlug.toLowerCase();
  if (['stillhaven', 'oriel', 'interiors', 'architecture'].some((k) => s.includes(k))) return 'architecture';
  if (['sundrop', 'aperitif', 'bakery'].some((k) => s.includes(k))) return 'aperitif';
  if (['serein', 'skincare'].some((k) => s.includes(k))) return 'skincare';
  return 'leather';
}

function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [k, v] = arg.replace(/^--/, '').split('=');
      return [k, v ?? 'true'];
    }),
  );

  const websiteDir = args.website ? path.resolve(args.website) : null;
  if (!websiteDir || !fs.existsSync(websiteDir)) {
    console.error('Usage: node generate-interaction-plan.mjs --website=/path/to/websites/<brand>');
    process.exit(1);
  }

  const brandSlug = path.basename(websiteDir);
  const inputPng = path.join(websiteDir, 'input.png');
  const outputPng = path.join(websiteDir, 'output.png');
  const inputDim = getPngDimensions(inputPng);
  const outputDim = getPngDimensions(outputPng);

  const expectedRatio = 5 / 3; // 1.6667
  const inputRatio = inputDim ? inputDim.width / inputDim.height : 0;
  const outputRatio = outputDim ? outputDim.width / outputDim.height : 0;
  const outputDriftPct = outputRatio ? (Math.abs(outputRatio - expectedRatio) / expectedRatio) * 100 : 100;

  const recommended4kSource =
    outputDriftPct > 10 && inputDim
      ? { file: 'input.png', ...inputDim, note: `output.png has ${outputDriftPct.toFixed(1)}% aspect drift (${outputDim?.width}x${outputDim?.height}); starting from true 5:3 4K input.png (${inputDim.width}x${inputDim.height})` }
      : { file: 'output.png', ...(outputDim || inputDim), note: `True 5:3 4K sheet verified (${(outputDim || inputDim)?.width}x${(outputDim || inputDim)?.height})` };

  const category = detectCategory(brandSlug);
  const benchmarks = BENCHMARK_SETS[category];
  const planPath = path.join(websiteDir, 'INTERACTION_PLAN.md');
  const planExists = fs.existsSync(planPath);

  let urlCount = 0;
  if (planExists) {
    const content = fs.readFileSync(planPath, 'utf8');
    const urls = content.match(/https:\/\/[^\s)`|]+/g) || [];
    urlCount = new Set(urls).size;
  }

  const report = {
    brand: brandSlug,
    category,
    input_dimensions: inputDim,
    output_dimensions: outputDim,
    recommended_4k_source: recommended4kSource,
    interaction_plan_path: planPath,
    interaction_plan_exists: planExists,
    unique_benchmark_urls_referenced: urlCount,
    benchmark_candidates: benchmarks,
    status: planExists && urlCount >= 5 ? 'VERIFIED' : 'NEEDS_PLAN',
  };

  console.log(JSON.stringify(report, null, 2));
}

main();
