#!/usr/bin/env node
/**
 * Golden Template & Nomenclature Linter (`golden-template/template` Validator)
 *
 * Verifies that every standalone project in `projects/<slug>/`:
 * 1. Matches the canonical `golden-template/template` folder & file blueprint.
 * 2. Uses byte-for-byte identical config & bootstrap files (`package.json`, `tsconfig.json`,
 *    `vite.config.ts`, `src/main.tsx`, `src/utils/cn.ts`).
 * 3. Follows strict, normalized nomenclature rules:
 *    - Folder slug matches `^\d{2}-(website|ui|mobile-app|chat-ui)-[a-z0-9-]+$`
 *      (no standalone 3D object packages, no internal brand/model names in slugs).
 *    - `<title>` in `index.html` starts with the canonical category label:
 *      `Website Landing Page — `, `UI Component — `, `Mobile App UI — `, or `Chat UI — `.
 *    - Zero forbidden internal/product/versioned tokens (`Jetski`, `ChatGPT`, `Argon`,
 *      `gemini-4-argon`, `REF-0xx`, `index-7.html`) in `index.html` or `src/` files.
 * 4. Passes `tsc --noEmit` with strict compiler flags (`strict`, `noUnusedLocals`,
 *    `noUnusedParameters`, `noFallthroughCasesInSwitch`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOODBOARDS_ROOT = path.resolve(__dirname, '..', '..', '..');
const CANONICAL_TEMPLATE_DIR = fs.existsSync(path.join(__dirname, '..', 'assets', 'dating'))
  ? path.join(__dirname, '..', 'assets', 'dating')
  : fs.existsSync(path.join(__dirname, '..', 'dating'))
    ? path.join(__dirname, '..', 'dating')
    : fs.existsSync(path.join(MOODBOARDS_ROOT, 'golden-template', 'dating'))
      ? path.join(MOODBOARDS_ROOT, 'golden-template', 'dating')
      : path.join(MOODBOARDS_ROOT, 'golden-template', 'template');

const dirArg = process.argv.find((a) => a.startsWith('--dir='))?.slice('--dir='.length);
const ROOT_DIR = dirArg
  ? path.resolve(dirArg)
  : fs.existsSync(path.join(path.resolve(__dirname, '..'), 'projects'))
    ? path.resolve(__dirname, '..')
    : path.join(MOODBOARDS_ROOT, 'warm-landing-page');

const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');
const NODE_BIN = process.execPath;

const CANONICAL_PACKAGE_JSON = fs.readFileSync(path.join(CANONICAL_TEMPLATE_DIR, 'package.json'), 'utf8').trim();
const CANONICAL_TSCONFIG_JSON = fs.readFileSync(path.join(CANONICAL_TEMPLATE_DIR, 'tsconfig.json'), 'utf8').trim();
const CANONICAL_VITE_CONFIG = fs.readFileSync(path.join(CANONICAL_TEMPLATE_DIR, 'vite.config.ts'), 'utf8').trim();
const CANONICAL_MAIN_TSX = fs.readFileSync(path.join(CANONICAL_TEMPLATE_DIR, 'src/main.tsx'), 'utf8').trim();
const CANONICAL_CN_TS = fs.readFileSync(path.join(CANONICAL_TEMPLATE_DIR, 'src/utils/cn.ts'), 'utf8').trim();

const CATEGORY_PREFIX_TO_LABEL = {
  website: 'Website Landing Page',
  ui: 'UI Component',
  'mobile-app': 'Mobile App UI',
  'chat-ui': 'Chat UI',
};

const SLUG_REGEX = /^\d{2}-(website|ui|mobile-app|chat-ui)-[a-z0-9-]+$/;

const FORBIDDEN_PATTERNS = [
  { regex: /\bJetski\s+Argon\b/g, replacement: 'Assistant Default', label: 'Jetski Argon' },
  { regex: /\bJetski\s+Pro\b/g, replacement: 'Assistant Pro', label: 'Jetski Pro' },
  { regex: /\bJetski\s+Flash\b/g, replacement: 'Assistant Fast', label: 'Jetski Flash' },
  { regex: /\bJetski\b/gi, replacement: 'Chat UI', label: 'Jetski' },
  { regex: /\bChatGPT\b/gi, replacement: 'Chat UI', label: 'ChatGPT' },
  { regex: /\bgemini-4-argon\b/gi, replacement: 'warm-moodboard', label: 'gemini-4-argon' },
  { regex: /\bArgon\b/g, replacement: 'Studio', label: 'Argon' },
  { regex: /\bindex-\d+\.html\b/gi, replacement: 'index.html', label: 'versioned index-N.html' },
];

const fixMode = process.argv.includes('--fix');
const targetFilter = process.argv.find((arg) => arg.startsWith('--project='))?.split('=')[1];

function walkFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function lintProject(slug) {
  const projectDir = path.join(PROJECTS_DIR, slug);
  const errors = [];
  const fixes = [];

  // 0. Enforce normalized project folder slug nomenclature
  const slugMatch = slug.match(SLUG_REGEX);
  const categoryKey = slugMatch ? slugMatch[1] : null;
  const categoryLabel = categoryKey ? CATEGORY_PREFIX_TO_LABEL[categoryKey] : 'UI Component';

  if (!slugMatch) {
    errors.push(
      `Invalid project folder slug "${slug}": must match ^\\d{2}-(website|ui|mobile-app|chat-ui)-[a-z0-9-]+$ (only Website Landing Pages, UI Components, Mobile App UI, and Chat UI are allowed)`
    );
  }

  // 1. Required root files
  const requiredRootFiles = ['index.html', 'package.json', 'tsconfig.json', 'vite.config.ts'];
  for (const file of requiredRootFiles) {
    const filePath = path.join(projectDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required root file: ${file}`);
    }
  }

  // 2. Enforce verbatim canonical config & entry files
  const verbatimFiles = [
    ['package.json', CANONICAL_PACKAGE_JSON],
    ['tsconfig.json', CANONICAL_TSCONFIG_JSON],
    ['vite.config.ts', CANONICAL_VITE_CONFIG],
    ['src/main.tsx', CANONICAL_MAIN_TSX],
    ['src/utils/cn.ts', CANONICAL_CN_TS],
  ];

  for (const [relPath, canonicalContent] of verbatimFiles) {
    const absPath = path.join(projectDir, relPath);
    if (fs.existsSync(absPath)) {
      const current = fs.readFileSync(absPath, 'utf8').trim();
      if (current !== canonicalContent) {
        if (fixMode) {
          fs.mkdirSync(path.dirname(absPath), { recursive: true });
          fs.writeFileSync(absPath, canonicalContent + '\n', 'utf8');
          fixes.push(`Normalized ${relPath} to canonical Golden Template file`);
        } else {
          errors.push(`${relPath} does not match canonical Golden Template file verbatim`);
        }
      }
    } else if (fixMode) {
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, canonicalContent + '\n', 'utf8');
      fixes.push(`Created missing canonical ${relPath}`);
    }
  }

  // 3. Verify index.html structure & normalized <title> category prefix
  const indexHtmlPath = path.join(projectDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    if (!html.includes('<!doctype html>')) errors.push('index.html must start with <!doctype html>');
    if (!html.includes('<meta name="description"')) errors.push('index.html must include <meta name="description" ... />');
    if (!html.includes('<div id="root"></div>')) errors.push('index.html must include <div id="root"></div>');
    if (!html.includes('<script type="module" src="/src/main.tsx"></script>')) {
      errors.push('index.html must include <script type="module" src="/src/main.tsx"></script>');
    }
    if (!html.includes('fonts.googleapis.com')) {
      errors.push('index.html must include Google Fonts links');
    }

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    const expectedPrefix = `${categoryLabel} — `;
    if (!titleMatch || !titleMatch[1].trim().startsWith(expectedPrefix)) {
      if (fixMode && titleMatch) {
        const rawTitle = titleMatch[1].trim().replace(/^[^—]+—\s*/, '');
        const newTitle = `${expectedPrefix}${rawTitle}`;
        html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${newTitle}</title>`);
        fs.writeFileSync(indexHtmlPath, html, 'utf8');
        fixes.push(`Normalized <title> in index.html to "${newTitle}"`);
      } else {
        errors.push(`index.html <title> must start with "${expectedPrefix}"`);
      }
    }
  }

  // 4. Verify src/ folder structure
  const srcDir = path.join(projectDir, 'src');
  if (!fs.existsSync(srcDir)) {
    errors.push('Missing src/ directory');
    return { slug, errors, fixes };
  }

  const allowedSrcEntries = new Set(['App.tsx', 'index.css', 'main.tsx', 'components', 'data', 'utils']);
  for (const entry of fs.readdirSync(srcDir)) {
    if (!allowedSrcEntries.has(entry)) {
      errors.push(`Unexpected entry in src/: ${entry} (must match Golden Template src/ layout)`);
    }
  }

  const requiredSubdirs = ['components', 'data', 'utils'];
  for (const sub of requiredSubdirs) {
    if (!fs.existsSync(path.join(srcDir, sub))) {
      errors.push(`Missing src/${sub}/ directory`);
    }
  }

  // 5. Verify src/index.css notations
  const indexCssPath = path.join(srcDir, 'index.css');
  if (fs.existsSync(indexCssPath)) {
    const css = fs.readFileSync(indexCssPath, 'utf8');
    if (!css.includes('@import "tailwindcss";')) {
      errors.push('src/index.css must start with @import "tailwindcss";');
    }
    if (!css.includes('@layer base')) {
      errors.push('src/index.css must include @layer base');
    }
    for (const cls of ['.font-serif-display', '.font-grotesk', '.font-mono-tech']) {
      if (!css.includes(cls)) {
        errors.push(`src/index.css must define ${cls} matching Golden Template src/index.css`);
      }
    }
  } else {
    errors.push('Missing src/index.css');
  }

  // 6. Verify src/App.tsx notations
  const appTsxPath = path.join(srcDir, 'App.tsx');
  if (fs.existsSync(appTsxPath)) {
    const appCode = fs.readFileSync(appTsxPath, 'utf8');
    if (!/export\s+function\s+App\s*\(/.test(appCode)) {
      errors.push('src/App.tsx must use named declaration `export function App()`');
    }
    if (!/from\s+['"]lucide-react['"]/.test(appCode)) {
      errors.push('src/App.tsx must import icons from lucide-react');
    }
    if (!/from\s+['"]\.\/data\//.test(appCode)) {
      errors.push('src/App.tsx must import domain data from ./data/*Data');
    }
    if (!/from\s+['"]\.\/components\//.test(appCode)) {
      errors.push('src/App.tsx must import modular sub-components from ./components/*');
    }
  } else {
    errors.push('Missing src/App.tsx');
  }

  // 7. Verify src/data/*Data.ts notations
  const dataDir = path.join(srcDir, 'data');
  if (fs.existsSync(dataDir)) {
    const dataFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('Data.ts'));
    if (dataFiles.length === 0) {
      errors.push('src/data/ must contain at least one <domain>Data.ts file');
    }
    for (const df of dataFiles) {
      const code = fs.readFileSync(path.join(dataDir, df), 'utf8');
      if (!/export\s+interface\s+\w+/.test(code)) {
        errors.push(`src/data/${df} must export TypeScript interfaces (export interface ...)`);
      }
      if (!/export\s+const\s+[A-Z0-9_]+\s*[:=]/.test(code)) {
        errors.push(`src/data/${df} must export UPPER_SNAKE_CASE seed constants`);
      }
      if (!/\/\*\*[\s\S]*?\*\//.test(code)) {
        errors.push(`src/data/${df} must include /** ... */ JSDoc notations`);
      }
    }
  }

  // 8. Verify src/components/*.tsx notations
  const compDir = path.join(srcDir, 'components');
  if (fs.existsSync(compDir)) {
    const compFiles = fs.readdirSync(compDir).filter((f) => f.endsWith('.tsx'));
    if (compFiles.length < 3) {
      errors.push(`src/components/ must have at least 3 modular .tsx components (found ${compFiles.length})`);
    }
    const hasBrandLogo = compFiles.some((f) => f.endsWith('BrandLogo.tsx'));
    if (!hasBrandLogo) {
      errors.push('src/components/ must include a <Brand>BrandLogo.tsx SVG component');
    }
    for (const cf of compFiles) {
      if (/Jetski|ChatGPT|Argon/i.test(cf)) {
        errors.push(`Component filename src/components/${cf} contains forbidden internal nomenclature`);
      }
      const code = fs.readFileSync(path.join(compDir, cf), 'utf8');
      const baseName = cf.replace(/\.tsx$/, '');
      if (!new RegExp(`interface\\s+${baseName}Props`).test(code)) {
        errors.push(`src/components/${cf} must declare \`interface ${baseName}Props\``);
      }
      if (!new RegExp(`export\\s+const\\s+${baseName}\\s*:\\s*React\\.FC<${baseName}Props>`).test(code)) {
        errors.push(`src/components/${cf} must export \`export const ${baseName}: React.FC<${baseName}Props>\``);
      }
      if (cf.endsWith('BrandLogo.tsx')) {
        if (!code.includes('<svg') || !code.includes('aria-hidden="true"')) {
          errors.push(`src/components/${cf} must render an <svg> with aria-hidden="true"`);
        }
        if (!/\/\*\*[\s\S]*?\*\//.test(code)) {
          errors.push(`src/components/${cf} must include a /** ... */ JSDoc header comment`);
        }
      }
    }
  }

  // 9. Enforce Normalized Nomenclature across index.html and src/**/*.{ts,tsx,css}
  const sourceFiles = [
    ...(fs.existsSync(indexHtmlPath) ? [indexHtmlPath] : []),
    ...walkFiles(srcDir, ['.ts', '.tsx', '.css']),
  ];

  for (const filePath of sourceFiles) {
    const relFile = path.relative(projectDir, filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.regex.test(content)) {
        if (fixMode) {
          content = content.replace(rule.regex, rule.replacement);
          modified = true;
          fixes.push(`Normalized forbidden token (${rule.label}) in ${relFile}`);
        } else {
          errors.push(`${relFile} contains forbidden nomenclature token: ${rule.label}`);
        }
      }
      rule.regex.lastIndex = 0;
    }

    const refRegex = /\bREF-\d+\b/g;
    if (refRegex.test(content)) {
      if (fixMode) {
        content = content.replace(refRegex, categoryLabel);
        modified = true;
        fixes.push(`Replaced internal REF-xxx identifier with "${categoryLabel}" in ${relFile}`);
      } else {
        errors.push(`${relFile} contains internal REF-xxx identifier`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  // 10. Run TypeScript compiler (`tsc --noEmit`) with strict flags
  const nmPath = path.join(projectDir, 'node_modules');
  const rootNmPath = path.join(ROOT_DIR, 'node_modules');
  let createdSymlink = false;
  try {
    if (!fs.existsSync(nmPath) && fs.existsSync(rootNmPath)) {
      fs.symlinkSync(rootNmPath, nmPath, 'dir');
      createdSymlink = true;
    }
    // Prefer the project's own (or symlinked) node_modules, then the workspace root.
    const tscCandidates = [
      path.join(nmPath, 'typescript/bin/tsc'),
      path.join(rootNmPath, 'typescript/bin/tsc'),
    ];
    const tscBin = tscCandidates.find((p) => fs.existsSync(p));
    if (!tscBin) {
      throw new Error(`typescript not found in ${nmPath} or ${rootNmPath} — run \`npm install\` or symlink offline node_modules into the project.`);
    }
    execSync(`"${NODE_BIN}" "${tscBin}" --noEmit -p "${path.join(projectDir, 'tsconfig.json')}"`, {
      stdio: 'pipe',
      cwd: projectDir,
    });
  } catch (err) {
    const out = (err.stdout?.toString() || '') + (err.stderr?.toString() || '') || err.message;
    errors.push(`TypeScript strict lint failed:\n${out.trim()}`);
  } finally {
    if (createdSymlink && fs.existsSync(nmPath)) {
      fs.unlinkSync(nmPath);
    }
  }

  return { slug, errors, fixes };
}

if (!fs.existsSync(PROJECTS_DIR)) {
  console.log('No projects/ directory yet.');
  process.exit(0);
}

const slugs = fs
  .readdirSync(PROJECTS_DIR)
  .filter((name) => fs.statSync(path.join(PROJECTS_DIR, name)).isDirectory())
  .filter((name) => !targetFilter || name.includes(targetFilter))
  .sort();

let totalErrors = 0;
for (const slug of slugs) {
  const { errors, fixes } = lintProject(slug);
  if (fixes.length > 0) {
    console.log(`🔧 [${slug}] Applied ${fixes.length} fix(es):`);
    for (const f of fixes) console.log(`   - ${f}`);
  }
  if (errors.length === 0) {
    console.log(`✅ [${slug}] Passed all Golden Template, Nomenclature & strict tsc checks`);
  } else {
    totalErrors += errors.length;
    console.error(`❌ [${slug}] ${errors.length} error(s):`);
    for (const e of errors) console.error(`   - ${e}`);
  }
}

if (totalErrors > 0) {
  console.error(`\nFailed with ${totalErrors} Golden Template lint error(s) across ${slugs.length} project(s).`);
  process.exit(1);
} else {
  const hasResearch = fs.existsSync(path.join(ROOT_DIR, 'references', 'research')) || fs.existsSync(path.join(ROOT_DIR, 'briefs'));
  const hasScreenshots = fs.existsSync(path.join(ROOT_DIR, 'screenshots'));
  const hasProjectsJson = fs.existsSync(path.join(ROOT_DIR, 'src', 'golden-projects.json'));
  console.log(`\n🎉 All ${slugs.length} project(s) passed Golden Template (judged by ${CANONICAL_TEMPLATE_DIR}) & Nomenclature linting!`);
  console.log(`🔗 Cross-folder link status: research/briefs=${hasResearch ? 'LINKED' : 'N/A'}, screenshots=${hasScreenshots ? 'LINKED' : 'N/A'}, golden-projects.json=${hasProjectsJson ? 'LINKED' : 'N/A'}`);
}
