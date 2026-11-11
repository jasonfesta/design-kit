#!/usr/bin/env node
/**
 * scaffold-golden-from-image.mjs
 *
 * Scaffolds a clean Google Golden Template React 19 + Vite 7 + Tailwind v4 project
 * from `/usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating`, optionally
 * injects semantic CSS custom properties from a `layout_metrics.json` or `nano_banana_spec.json`
 * file into `src/index.css`, updates `<title>` in `index.html`, and symlinks offline
 * `node_modules` (GOLDEN_NODE_MODULES env, bundled assets/dating/node_modules, or
 * ~/moodboards/warm-landing-page/node_modules) for instant zero-network builds.
 *
 * Usage:
 *   node scaffold-golden-from-image.mjs \
 *     --project=/path/to/moodboard/projects/01-website-avela \
 *     --title="Avela Softform Leather Goods" \
 *     [--spec=/path/to/nano_banana_spec.json]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_ROOT = path.resolve(__dirname, '..', '..');
const DATING_TEMPLATE_DIR = path.join(SKILLS_ROOT, 'golden-template', 'assets', 'dating');
// Offline node_modules candidates (first existing wins) so scaffolds build with zero network.
const SHARED_NODE_MODULES_CANDIDATES = [
  process.env.GOLDEN_NODE_MODULES,
  path.join(SKILLS_ROOT, 'golden-template', 'assets', 'dating', 'node_modules'),
  path.join(path.dirname(SKILLS_ROOT), 'moodboards', 'warm-landing-page', 'node_modules'),
].filter(Boolean);
const SHARED_NODE_MODULES = SHARED_NODE_MODULES_CANDIDATES.find((p) => fs.existsSync(p)) || null;

const CATEGORY_LABELS = {
  website: 'Website Landing Page',
  ui: 'UI Component',
  'mobile-app': 'Mobile App UI',
  'chat-ui': 'Chat UI',
};

function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq > 0) {
        args[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        args[arg.slice(2)] = 'true';
      }
    }
  }
  return args;
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const args = parseArgs(process.argv);
if (!args.project) {
  console.error('Usage: scaffold-golden-from-image.mjs --project=<target-dir> [--title="<Title>"] [--spec=<spec.json>]');
  process.exit(1);
}

const projectDir = path.resolve(args.project);
if (!fs.existsSync(DATING_TEMPLATE_DIR)) {
  console.error(`[scaffold-golden-from-image] Golden Template not found at ${DATING_TEMPLATE_DIR}`);
  process.exit(1);
}
const slug = path.basename(projectDir);
const slugMatch = slug.match(/^\d{2}-(website|ui|mobile-app|chat-ui)-([a-z0-9-]+)$/);
const categoryKey = slugMatch ? slugMatch[1] : 'website';
const categoryPrefix = CATEGORY_LABELS[categoryKey] || 'Website Landing Page';
const rawTitle = args.title || (slugMatch ? slugMatch[2].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : slug);
const normalizedTitle = rawTitle.startsWith(categoryPrefix) ? rawTitle : `${categoryPrefix} — ${rawTitle}`;

copyDirRecursive(DATING_TEMPLATE_DIR, projectDir);

// Clear domain-specific files from dating template so agent authors fresh domain modules
for (const sub of ['src/components', 'src/data']) {
  const targetSub = path.join(projectDir, sub);
  if (fs.existsSync(targetSub)) {
    for (const f of fs.readdirSync(targetSub)) {
      fs.rmSync(path.join(targetSub, f), { recursive: true, force: true });
    }
  }
}

// Update <title> in index.html
const indexHtmlPath = path.join(projectDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${normalizedTitle}</title>`);
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
}

// Optionally inject semantic palette tokens from spec JSON
if (args.spec && fs.existsSync(path.resolve(args.spec))) {
  try {
    const spec = JSON.parse(fs.readFileSync(path.resolve(args.spec), 'utf8'));
    const palette = spec.semantic_palette || spec.palette || null;
    const cssPath = path.join(projectDir, 'src', 'index.css');
    if (palette && fs.existsSync(cssPath)) {
      const tokenLines = Object.entries(palette)
        .map(([k, v]) => `  ${k.startsWith('--') ? k : `--${k}`}: ${v};`)
        .join('\n');
      const existingCss = fs.readFileSync(cssPath, 'utf8');
      const injected = `${existingCss}\n\n:root {\n${tokenLines}\n}\n`;
      fs.writeFileSync(cssPath, injected, 'utf8');
    }
  } catch (err) {
    console.warn(`[scaffold-golden-from-image] Warning: could not parse spec ${args.spec}: ${err.message}`);
  }
}

// Symlink shared offline node_modules if available
const targetNodeModules = path.join(projectDir, 'node_modules');
if (!fs.existsSync(targetNodeModules) && SHARED_NODE_MODULES) {
  fs.symlinkSync(SHARED_NODE_MODULES, targetNodeModules, 'dir');
} else if (!fs.existsSync(targetNodeModules)) {
  console.warn('[scaffold-golden-from-image] Warning: no offline node_modules found; run `npm install` in the project (or set GOLDEN_NODE_MODULES).');
}

console.log(`[scaffold-golden-from-image] Scaffolded ${projectDir} (${normalizedTitle})`);
