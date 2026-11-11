---
name: skill-maker
description: >-
  Audits, deduplicates, documents, validates, and wraps agent skills into
  deployment-ready Google Skills packages with BUILD targets, Evalin
  EVAL.txtpb suites, TEST.md test plans, skill.json manifests, standalone dark
  and light HTML documentation pages, and distributable .skill and .zip
  archives ready for workspace discovery and x20 hosting. Use when creating a
  new skill, cleaning up or consolidating existing skills across workspaces,
  wrapping skills for Google3 or x20 deployment, or verifying compliance with
  Google skill_creator and validate_skill rules. Don't use for executing
  domain-specific UI or font workflows directly (use google-font-selection,
  golden-template, image-to-react, or warmup).
metadata:
  icon: 🛠️
---

# Skill Maker: Google Skill Wrapper, Validator & x20 Publisher

Skill Maker (`skill-maker`) turns raw or workspace-local agent skills into clean, non-redundant, deployment-ready **Google Skills packages** that pass `validate_skill.py` presubmit checks and publish cleanly to both a unified local skills workspace (`~/design-kit/skills/`) and an interactive `x20` catalog (`/google/data/rw/users/{user}/www/skills/`).

## Workflow Checklist

Copy this checklist when wrapping or cleaning up one or more skills:

- [ ] **Step 1**: Audit candidate skills for independence, clean identifiers, and zero duplicate scripts ([deduplication and naming guide](references/deduplication-and-naming.md))
- [ ] **Step 2**: Normalize `SKILL.md` frontmatter, links, and progressive disclosure structure ([Google skill specification](references/google-skill-spec.md))
- [ ] **Step 3**: Run `scripts/validate_and_wrap.py` to generate `BUILD`, `scripts/BUILD`, `EVAL.txtpb`, `TEST.md`, `references/contributing.md`, `skill.json`, `evals/smoke.json`, `index.html`, and `.skill` / `.zip` bundles
- [ ] **Step 4**: Run `scripts/build_catalog.py` to generate the unified workspace `README.md`, `_agents/skills.json`, `catalog.json`, root `index.html` portal, and sync to `~/design-kit/skills/` and `x20` ([x20 and bundle packaging guide](references/x20-and-bundle-packaging.md))

--------------------------------------------------------------------------------

## Step 1: Audit for Independence, Clean Identifiers & Zero Redundancy

Before wrapping skills, eliminate overlap across the skill set:

1.  **Enforce Clean Identifiers**:
    -   Use concise, self-explanatory lowercase `kebab-case` identifiers in YAML frontmatter (`name: skill-maker`, `name: google-font-selection`, `name: golden-template`, `name: image-to-react`, `name: replicate-mock`, `name: nano-banana`, `name: responsiveness`, `name: interaction`, `name: feel`, `name: design-critique`, `name: warmup`).
    -   For Google3 Blaze targets (`BUILD`), map `kebab-case` names to `snake_case` target and package names (`name.replace('-', '_')`) to satisfy `CheckFileOperation:NoHyphensInPackageName`.
2.  **Eliminate Redundant Skills & Duplicate Scripts**:
    -   Run the 4 Independence Tests (Outcome Equivalence, Trigger Overlap, Knowledge Delta, Reference-First Feasibility) in the [deduplication and naming guide](references/deduplication-and-naming.md).
    -   If two skills share identical scripts or target the same deliverable (for example, `golden-template` and `golden-template`), consolidate them into one canonical skill (`golden-template`) and merge their unique `references/*.md` guides.
    -   Each helper script must have a single canonical owner skill rather than being copied across multiple skill directories.

## Step 2: Normalize `SKILL.md` for `validate_skill.py` Compliance

Every `SKILL.md` must satisfy Google's `validate_skill.py` checks before packaging (see the [Google skill specification](references/google-skill-spec.md)):

-   **YAML Frontmatter (`name` and `description`)**:
    -   Use `description: >-` (never bare `>`).
    -   Keep `description` under `1024` characters and **never include `<` or `>` angle brackets** in the frontmatter description (`validate_skill.py` rejects any description containing `<` or `>`).
    -   Begin with a third-person capability statement, followed by `Use when...` triggers and `Don't use for...` boundaries.
-   **Sizing & Progressive Disclosure**:
    -   Keep `SKILL.md` between `50` and `500` lines (hard ceiling: `800` lines and `46,080` bytes). Offload deep tables, schemas, and rubrics into `references/*.md`.
-   **Portable Relative Links Only**:
    -   Never use `file:///`, `/google3/`, `/google/src/`, or machine-local `/usr/local/google/home/...` markdown link targets inside `SKILL.md`.
    -   Every relative link (``label`` or ``script``) must resolve to an existing file inside the skill directory.
-   **Code Block Hygiene (`SNIPPET_EM_DASH`)**:
    -   Never place Unicode em dashes (`U+2014`) or en dashes (`U+2013`) inside fenced code blocks or inline code spans; use ASCII `--` or `-`.
-   **Mandatory `## Contributions` Section**:
    -   End `SKILL.md` with a `## Contributions` section linking to `[contribution guidelines](references/contributing.md)`.

## Step 3: Validate & Wrap Each Skill (`scripts/validate_and_wrap.py`)

Run [validate_and_wrap.py](scripts/validate_and_wrap.py) on a single skill directory or across all skills in a workspace:

```bash
# Validate, sanitize, generate Google3 wrappers, build HTML docs, and pack .skill/.zip archives:
python3 {skill_dir}/scripts/validate_and_wrap.py \
  --skills-root=/usr/local/google/home/jfesta/design-kit/skills \
  --fix
```

For every skill directory `{skills_root}/{skill_id}/`, `validate_and_wrap.py`:

1.  **Sanitizes & Validates `SKILL.md`**: Strips forbidden `file:///` prefixes in markdown links, removes angle brackets from frontmatter `description`, replaces em dashes inside code spans, appends `## Contributions` if missing, and runs the full `validate_skill.py` rule suite.
2.  **Generates Missing Google3 Deployment Files**:
    -   `BUILD`: Declares `exports_files`, `eval_suite`, `validate_skill_test(check_locked_links = True)`, and `agent_skill` with all `SKILL.md`, `references/*.md`, and `scripts` targets.
    -   `scripts/BUILD`: Declares `pytype_strict_binary` targets for `.py` scripts and `exports_files` for `.mjs` scripts.
    -   `EVAL.txtpb`: Generates a structured `EvalSuite` textproto with 3 task-based evaluation cases and concrete expectations when not already present.
    -   `TEST.md`: Generates an end-to-end human and automated smoke verification plan.
    -   `references/contributing.md`: Generates skill-specific invariants and validation commands.
    -   `skill.json` & `evals/smoke.json`: Generates structured skill metadata and smoke test definitions.
3.  **Builds Standalone HTML Documentation & Dist Archives**:
    -   Generates `{skill_id}/index.html` (responsive dark/light documentation viewer with embedded `SKILL.md`, file manifest, evaluation gates, and download links).
    -   Packages `{skills_root}/{skill_id}.skill` and `{skills_root}/{skill_id}.zip` (plus `{skills_root}/_google3_packages/{snake_name}/` for zero-hyphen Blaze presubmit compatibility).

## Step 4: Build the Unified Catalog & Publish to `x20` (`scripts/build_catalog.py`)

Run [build_catalog.py](scripts/build_catalog.py) to assemble the root skills workspace and optionally mirror the static catalog and downloadable `.skill` / `.zip` bundles to `x20`:

```bash
# Build root README.md, catalog.json, _agents/skills.json, and root index.html portal:
python3 {skill_dir}/scripts/build_catalog.py \
  --skills-root=/usr/local/google/home/jfesta/design-kit/skills \
  --x20-dir=/google/data/rw/users/jf/jfesta/www/skills
```

### Input -> Output Example

**Input**:
```text
Directory: /usr/local/google/home/jfesta/design-kit/skills/golden-template/
Contains: SKILL.md, scripts/lint-golden-template.mjs, references/nomenclature-and-polish-rules.md, assets/dating/
```

**Output after `validate_and_wrap.py` + `build_catalog.py`**:
```text
/usr/local/google/home/jfesta/design-kit/skills/
├── index.html                           # Interactive dark/light Skills Catalog Portal (x20 ready)
├── README.md                            # Complete table & architecture documentation of all skills
├── catalog.json                         # Machine-readable registry of all wrapped skills
├── _agents/skills.json                  # Workspace auto-discovery manifest
├── golden-template.skill                # Distributable Google Skill bundle
├── golden-template.zip                  # Distributable ZIP archive
└── golden-template/
    ├── BUILD                            # agent_skill + validate_skill_test + eval_suite
    ├── SKILL.md                         # Validated (<500 lines, 0 broken links, 0 angle brackets in desc)
    ├── EVAL.txtpb                       # 3 Evalin task test cases
    ├── TEST.md                          # End-to-end verification test plan
    ├── skill.json                       # Structured metadata manifest
    ├── index.html                       # Standalone skill documentation viewer
    ├── evals/smoke.json                 # Automated smoke verification payload
    ├── assets/dating/                   # Canonical dating Golden Template reference folder
    ├── references/
    │   ├── contributing.md              # Invariants & validation commands
    │   └── ...
    └── scripts/
        ├── BUILD                        # Blaze exports & binary rules
        └── ...
```

--------------------------------------------------------------------------------

## References

-   [Google skill specification and validate_skill rules](references/google-skill-spec.md)
-   [Skill deduplication, independence tests, and naming conventions](references/deduplication-and-naming.md)
-   [Packaging .skill archives, HTML portals, and x20 deployment](references/x20-and-bundle-packaging.md)

## Credits & Lineage

Built by Jason Festa (`jfesta`), implementing Google's official `validate_skill` and `agent_config` / `agent_skill` specifications maintained by **Romain Beaumont (`romainbeaumont`)** and **`mountanos`** (`//depot/google3/learning/gemini/agents/skills/skill_creator/`, `//depot/google3/learning/gemini/agents/customization_rules/`) and static `x20` opaque-origin packaging patterns from **`fofr`** (`go/fofr-agent-skills`).

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
