#!/usr/bin/env node
/**
 * build-local-artifact.mjs
 *
 * Compiles a Golden Template React 19 + Vite 7 + Tailwind v4 project into a
 * self-contained single-file bundle (`dist/index.html`) without network or x20,
 * and stages it onto a target HTML artifact path with a deterministic
 * `<meta name="x-local-build-stamp" content="READY_FOR_SNAPSHOT" />` tag so a
 * 1-line `edit_file` tool call with `ArtifactMetadata: { UserFacing: true }`
 * snapshots the full compiled React bundle into Jetski's right-hand Artifact Pane.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        args[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        args[arg.slice(2)] = true;
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const projectDir = args.project ? path.resolve(args.project) : null;
const artifactPath = args.artifact ? path.resolve(args.artifact) : null;
const sharedNodeModules = args['node-modules']
  ? path.resolve(args['node-modules'])
  : './warm-landing-page/node_modules';

if (!projectDir) {
  console.error(
    'Usage: node build-local-artifact.mjs --project=<project-dir> [--artifact=<artifact-html-path>] [--node-modules=<path>]',
  );
  process.exit(1);
}

if (!fs.existsSync(projectDir)) {
  console.error(`Error: Project directory does not exist: ${projectDir}`);
  process.exit(1);
}

// 1. Ensure node_modules is linked for offline sandboxed builds
const projectNodeModules = path.join(projectDir, 'node_modules');
if (!fs.existsSync(projectNodeModules)) {
  if (!fs.existsSync(sharedNodeModules)) {
    console.error(`Error: Shared node_modules not found at ${sharedNodeModules}`);
    process.exit(1);
  }
  fs.symlinkSync(sharedNodeModules, projectNodeModules, 'dir');
  console.log(`[local-build-preview] Linked node_modules -> ${sharedNodeModules}`);
}

// 2. Locate Vite CLI binary and run `vite build`
const viteBin = path.join(projectNodeModules, 'vite', 'bin', 'vite.js');
const viteConfig = path.join(projectDir, 'vite.config.ts');

console.log(`[local-build-preview] Compiling single-file bundle in ${projectDir}...`);
execFileSync(
  process.execPath,
  [viteBin, 'build', projectDir, '--config', viteConfig],
  { stdio: 'inherit', cwd: projectDir },
);

const distHtmlPath = path.join(projectDir, 'dist', 'index.html');
if (!fs.existsSync(distHtmlPath)) {
  console.error(`Error: Expected compiled bundle at ${distHtmlPath}`);
  process.exit(1);
}

let html = fs.readFileSync(distHtmlPath, 'utf8');
const stampMeta = '  <meta name="x-local-build-stamp" content="READY_FOR_SNAPSHOT" />';

if (!html.includes('name="x-local-build-stamp"')) {
  html = html.replace('<head>', `<head>\n${stampMeta}`);
  fs.writeFileSync(distHtmlPath, html, 'utf8');
}

const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(2);
console.log(`[local-build-preview] Built dist/index.html (${sizeKb} KB)`);

// 3. Stage onto the target artifact HTML path if provided
if (artifactPath) {
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  fs.writeFileSync(artifactPath, html, 'utf8');
  console.log(`[local-build-preview] Staged compiled bundle to artifact: ${artifactPath}`);
  console.log(
    '[local-build-preview] Next step: call edit_file on the artifact changing READY_FOR_SNAPSHOT -> LOCAL_SINGLEFILE_ACTIVE with ArtifactMetadata: { UserFacing: true }',
  );
}
