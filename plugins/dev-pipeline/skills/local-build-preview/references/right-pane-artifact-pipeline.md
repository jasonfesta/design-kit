# Right-Hand Artifact Pane Pipeline for Compiled Single-File React Builds

## 1. Why the 3-Call Artifact Snapshot Pattern Works

When building a **Google Golden Template** (`React 19` + `Vite 7` + `Tailwind v4` + `vite-plugin-singlefile`) project locally:

1. `vite build` bundles all React 19 runtime code, Lucide icons, Tailwind v4 utility CSS, and component state into a single self-contained `<project-dir>/dist/index.html` file (typically `230 KB` to `2 MB`).
2. Jetski's right-hand **Artifact Pane** only renders files inside `<appDataDir>/brain/<conversation-id>/` that have been registered or updated via a file tool call (`write_file` or `edit_file`) with `ArtifactMetadata: { UserFacing: true }`.
3. Simply running `cp dist/index.html <artifactDir>/app.html` in bash writes the bytes to disk, **but does not emit an artifact snapshot event to the Jetski UI**.
4. Conversely, passing `240+ KB` of minified JavaScript directly inside a `write_file` tool call's `Content` parameter wastes model output tokens and takes dozens of seconds to stream.

### The Optimal 3-Call Pattern (Zero Token Waste, Instant Right-Pane Render)

1. **`write_file` (Stub Registration)**:
   Create `<artifactDir>/<slug>-react-build.html` with a 10-line HTML stub and `ArtifactMetadata: { UserFacing: true, RequestFeedback: false, Summary: "..." }`.
2. **`run_command` (`build-local-artifact.mjs`)**:
   Compile `<project-dir>/dist/index.html` with Vite, inject `<meta name="x-local-build-stamp" content="READY_FOR_SNAPSHOT" />`, and copy the compiled file over `<artifactDir>/<slug>-react-build.html`.
3. **`edit_file` (1-Line Snapshot Trigger)**:
   Call `edit_file` on `<artifactDir>/<slug>-react-build.html` replacing `READY_FOR_SNAPSHOT` with `LOCAL_SINGLEFILE_ACTIVE` and providing `ArtifactMetadata: { UserFacing: true, RequestFeedback: false, Summary: "..." }`.
   - `edit_file` reads the full `240+ KB` file from disk, applies the 1-line edit, and records the complete compiled single-file React bundle into Jetski's artifact store so it renders immediately in the right-hand Artifact Pane.

---

## 2. Local Build vs. `x20` Decision Matrix

| Scenario | User Prompt Example | Required Agent Action |
| :--- | :--- | :--- |
| **Default Local Build** | *"Make a build"*, *"Build and run in my browser"*, *"Compile this Golden Template"* | Build locally (`No x20`) and render in the **right-hand Artifact Pane** + `localhost` HTTP server. |
| **Ambiguous Target** | *"Can we publish/share a build of this?"* | Ask the user whether they want a **Local Build (Right-Hand Artifact Pane + `localhost`, Recommended Default)** or an **`x20` Deployment**. |
| **Explicit `x20` Request** | *"Deploy this build to x20"* | Build locally first, verify `dist/index.html`, and then deploy to `x20`. |
