#!/usr/bin/env node
/**
 * install-skill-everywhere.mjs
 *
 * Installs/symlinks `local-build-preview` (and all companion Golden Template skills
 * in `./skills/`) into:
 *   1. `~/.gemini/config/skills/` (Global Machine-Local Discovery across ALL workspaces)
 *   2. Any workspace directory passed via `--workspace=/path/to/workspace` (updates `_agents/skills.json`)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const MOODBOARDS_SKILLS_DIR = './skills';
const GLOBAL_SKILLS_DIR = path.join(os.homedir(), '.gemini', 'config', 'skills');

function parseArgs(argv) {
  const workspaces = [];
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--workspace=')) {
      workspaces.push(path.resolve(arg.slice('--workspace='.length)));
    }
  }
  return { workspaces };
}

function ensureGlobalSkillSymlinks() {
  fs.mkdirSync(GLOBAL_SKILLS_DIR, { recursive: true });
  const entries = fs.readdirSync(MOODBOARDS_SKILLS_DIR, { withFileTypes: true });
  const installed = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillPath = path.resolve(MOODBOARDS_SKILLS_DIR, entry.name);
    const skillMd = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillMd)) continue;

    const targetPath = path.join(GLOBAL_SKILLS_DIR, entry.name);
    if (fs.existsSync(targetPath)) {
      const stat = fs.lstatSync(targetPath);
      if (stat.isSymbolicLink()) {
        fs.unlinkSync(targetPath);
        fs.symlinkSync(skillPath, targetPath, 'dir');
        installed.push({ skill: entry.name, target: targetPath, mode: 'updated-symlink' });
      } else {
        // Sync SKILL.md into existing directory so global copy stays up to date
        fs.copyFileSync(skillMd, path.join(targetPath, 'SKILL.md'));
        installed.push({ skill: entry.name, target: targetPath, mode: 'synced-skill-md' });
      }
    } else {
      fs.symlinkSync(skillPath, targetPath, 'dir');
      installed.push({ skill: entry.name, target: targetPath, mode: 'created-symlink' });
    }
  }
  return installed;
}

function registerInWorkspaceSkillsJson(workspaceDir) {
  const agentsDir = path.join(workspaceDir, '_agents');
  const skillsJsonPath = path.join(agentsDir, 'skills.json');
  fs.mkdirSync(agentsDir, { recursive: true });

  let config = { entries: [] };
  if (fs.existsSync(skillsJsonPath)) {
    try {
      config = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));
      if (!Array.isArray(config.entries)) config.entries = [];
    } catch {
      config = { entries: [] };
    }
  }

  const alreadyRegistered = config.entries.some(
    (e) => e && e.path === MOODBOARDS_SKILLS_DIR,
  );
  if (!alreadyRegistered) {
    config.entries.push({ path: MOODBOARDS_SKILLS_DIR });
    fs.writeFileSync(skillsJsonPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  }
  return skillsJsonPath;
}

const { workspaces } = parseArgs(process.argv);

// Global discovery now comes from ~/.gemini/config/plugins.json -> ~/design-kit/plugins.
// Writing ~/.gemini/config/skills/ symlinks would load every skill twice, so it is opt-in.
if (process.argv.includes('--legacy-global-symlinks')) {
  const globalResults = ensureGlobalSkillSymlinks();
  console.log('[install-skill-everywhere] Global skills synced to ~/.gemini/config/skills/:');
  for (const item of globalResults) {
    console.log(`  - ${item.skill}: ${item.target} (${item.mode})`);
  }
} else {
  console.log('[install-skill-everywhere] Global discovery is via ~/.gemini/config/plugins.json -> ~/design-kit/plugins (no global symlinks written).');
}

for (const ws of workspaces) {
  const updatedJson = registerInWorkspaceSkillsJson(ws);
  console.log(`[install-skill-everywhere] Registered skills directory in ${updatedJson}`);
}
