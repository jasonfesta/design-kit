# Walkthrough: Compiling a Golden Template React 19 + Vite 7 + Tailwind v4 Build into the Right-Hand Artifact Pane

## 1. Canonical Project Layout

```text
<project-dir>/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── index.css
    ├── App.tsx
    ├── components/
    │   ├── HelloBrandLogo.tsx
    │   └── GreetingCard.tsx
    ├── data/
    │   └── helloData.ts
    └── utils/
        └── cn.ts
```

## 2. Compile & Stage into the Right-Hand Artifact Pane

### Step A — Create the Artifact Stub (`write_file`)
Write `<artifactDir>/hello-world-react-build.html` with `ArtifactMetadata: { UserFacing: true, RequestFeedback: false, Summary: "Compiled Golden Template React 19 + Vite 7 + Tailwind v4 single-file build rendered in the right-hand Artifact Pane without x20." }`.

### Step B — Run `build-local-artifact.mjs` (`run_command`)
```bash
node ./skills/local-build-preview/scripts/build-local-artifact.mjs \
  --project="<project-dir>" \
  --artifact="<artifactDir>/hello-world-react-build.html"
```

### Step C — Snapshot the Compiled Bundle (`edit_file`)
Call `edit_file` on `<artifactDir>/hello-world-react-build.html` with `ArtifactMetadata: { UserFacing: true, ... }`:
- `Target`: `<meta name="x-local-build-stamp" content="READY_FOR_SNAPSHOT" />`
- `Replacement`: `<meta name="x-local-build-stamp" content="LOCAL_SINGLEFILE_ACTIVE" />`
