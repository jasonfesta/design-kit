---
name: local-build-preview
description: Compile Google Golden Template React 19 + Vite 7 + Tailwind v4 single-file builds (vite-plugin-singlefile) locally and render them directly in Jetski's right-hand Artifact Pane and local browser (localhost) without x20 deployment. Enforces a Local-First build policy (defaulting to local builds unless x20 is explicitly requested, or prompting Local vs. x20 when ambiguous) and provides scripts to sync this skill across all user workspaces.
---

# Local Build & Right-Hand Artifact Preview (`local-build-preview`)

This skill compiles **Google Golden Template** (`React 19` + `Vite 7` + `Tailwind v4` + `vite-plugin-singlefile`) applications into self-contained single-file bundles (`dist/index.html`) and renders them **directly inside Jetski's right-hand Artifact Pane** (plus a local `127.0.0.1` browser server) **without deploying to `x20`**.

---

## 1. Local-First Build Policy (Local Default vs. `x20`)

Whenever the user asks to **"make a build"**, **"build this"**, **"run it in my browser"**, or **"preview this page/app"**:

1. **Default Mode is Local (`No x20`)**:
   - Most builds are local. **Never deploy to `x20` unless the user explicitly asks for `x20`.**
   - Always compile locally with Vite (`vite-plugin-singlefile`) and render the compiled single-file bundle directly in the **right-hand Artifact Pane** + local `http://localhost:<port>/` server.
2. **Checking Local vs. `x20` When Requested or Ambiguous**:
   - If the user asks to configure a build target or if the deployment target is ambiguous between a local preview and a shared `x20` link, use `ask_question` (or ask directly) with **(Recommended) Local build in right-hand Artifact Pane & localhost (No x20)** listed first, and **Deploy to x20** second.
   - If the user simply says *"make a build"* or *"make a local build"*, execute the **Local Right-Hand Artifact Pane Build** immediately without touching `x20`.

---

## 2. Exact 4-Step Pipeline: Compiled React 19 + Vite 7 + Tailwind v4 in the Right-Hand Artifact Pane

To render a full compiled Golden Template React 19 + Vite 7 + Tailwind v4 single-file bundle (`dist/index.html`, typically `230 KB`–`5 MB`) directly in Jetski's **right-hand Artifact Pane** without pasting hundreds of kilobytes into a tool argument:

### Step 1: Scaffold or Verify the Golden Template Project
Ensure the project directory (`<project-dir>/`) matches the canonical [`golden-template/dating`](./golden-template/dating) blueprint:
- `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts` (`plugins: [react(), tailwindcss(), viteSingleFile()]`, `base: './'`)
- `src/main.tsx`, `src/index.css` (`@import "tailwindcss";`), `src/App.tsx`, `src/components/`, `src/data/`, `src/utils/cn.ts`

### Step 2: Register the HTML Artifact Stub (`write_file` with `ArtifactMetadata`)
First, call `write_file` to create `<artifactDir>/<slug>-react-build.html` with a small HTML stub and **`ArtifactMetadata: { UserFacing: true, RequestFeedback: false, Summary: "..." }`**:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Build Stub</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### Step 3: Compile Locally & Copy `dist/index.html` Over the Artifact File
Run the helper script [`scripts/build-local-artifact.mjs`](./scripts/build-local-artifact.mjs) (or run `vite build` + `cp`) inside the sandbox (`BypassSandbox: false`):

```bash
node ./skills/local-build-preview/scripts/build-local-artifact.mjs \
  --project="<project-dir>" \
  --artifact="<artifactDir>/<slug>-react-build.html"
```

What this script does automatically:
1. Symlinks offline `node_modules` from `./warm-landing-page/node_modules` if `<project-dir>/node_modules` does not exist (zero network / `npm install` needed).
2. Runs `vite build` with `vite-plugin-singlefile` to produce `<project-dir>/dist/index.html`.
3. Copies `<project-dir>/dist/index.html` onto `<artifactDir>/<slug>-react-build.html` and injects a deterministic `<meta name="x-local-build-stamp" content="READY_FOR_SNAPSHOT" />` marker in `<head>` so Step 4 has an exact 1-line `edit_file` target.

### Step 4: Trigger the Right-Hand Artifact Pane Snapshot (`edit_file` with `ArtifactMetadata`)
Because copying a file via `cp` in bash does not notify Jetski's UI artifact store, perform a 1-line `edit_file` on `<artifactDir>/<slug>-react-build.html` **with `ArtifactMetadata: { UserFacing: true, RequestFeedback: false, Summary: "..." }`**:

- **Target**:
  `<meta name="x-local-build-stamp" content="READY_FOR_SNAPSHOT" />`
- **Replacement**:
  `<meta name="x-local-build-stamp" content="LOCAL_SINGLEFILE_ACTIVE" />`

This 1-line edit forces Jetski to snapshot the entire compiled `240+ KB` single-file React 19 + Vite 7 + Tailwind v4 bundle into the **right-hand Artifact Pane** immediately!

### Step 5 (Optional): Start Localhost Server & URL Card
If the user also wants to open the build in a full browser tab on `localhost`:
1. Start a background HTTP server (`IsDaemon: true`, `BypassSandbox: false`):
   ```bash
   python3 -m http.server 4173 --bind 127.0.0.1 --directory "<project-dir>/dist"
   ```
2. Create a `<Title> Local Build.url.json` artifact in `<artifactDir>/` with `ArtifactMetadata: { UserFacing: true }` pointing to `http://localhost:4173/`.

---

## 3. Installing This Skill Across All Workspaces

To make `local-build-preview` available across **every workspace** on your machine:

```bash
node ./skills/local-build-preview/scripts/install-skill-everywhere.mjs
```

This script:
1. Installs/symlinks `local-build-preview` (and all companion Golden Template skills from `./skills/`) into `~/.gemini/config/skills/` (Global Machine-Local Discovery, which Jetski loads in every workspace).
2. Optionally registers `./skills` in any specific workspace's `_agents/skills.json` when `--workspace=/path/to/workspace` is passed.

---

## 4. Bundled Resources

- **[`scripts/build-local-artifact.mjs`](./scripts/build-local-artifact.mjs)** — Offline-capable Golden Template React 19 + Vite 7 + Tailwind v4 single-file compiler and right-pane artifact stager.
- **[`scripts/install-skill-everywhere.mjs`](./scripts/install-skill-everywhere.mjs)** — Cross-workspace skill installer (`~/.gemini/config/skills/` + workspace `_agents/skills.json`).
- **[`references/right-pane-artifact-pipeline.md`](./references/right-pane-artifact-pipeline.md)** — Deep-dive into how Jetski's right-hand Artifact Viewer, `ArtifactMetadata` snapshotting, `<agent-embed>`, and UI Plugin Sidecars (`AuxPane`) work without `x20`.
- **[`examples/hello-world-local-build-walkthrough.md`](./examples/hello-world-local-build-walkthrough.md)** — Complete walkthrough of scaffolding, compiling, and rendering a Golden Template React 19 + Vite 7 + Tailwind v4 build in the right-hand Artifact Pane.
