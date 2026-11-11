# Contributing & Engineering Quality Standards
## Development, Verification & Packaging for `jason-dev-agent`

- **Author**: Principal Software Engineer, Google AI & Frontend Systems
- **Target**: `jason-dev-agent`
- **Scope**: Skill authoring, testing, validation, and catalog synchronization

---

## 1. Skill Workspace Organization

`jason-dev-agent` lives in `/usr/local/google/home/jfesta/skills/jason-dev-agent/`:

```text
jason-dev-agent/
├── agent.md                        # Coordinator agent prompt & tool bindings
├── BUILD                           # Google3 Bazel targets (agent_skill, evalin, agent_config)
├── EVAL.txtpb                      # Evalin test specification
├── TEST.md                         # Unit test plan & verification matrix
├── index.html                      # Standalone dark/light documentation portal
├── package.json / tsconfig.json    # (Inside managed project deliverables)
├── skill.json                      # Machine-readable skill package manifest
├── SKILL.md                        # Master skill documentation & checklist
├── evals/
│   └── smoke.json                  # Smoke eval inputs & assertion expectations
├── references/
│   ├── google-engineering-architecture.md  # System architecture & TDD
│   ├── five-turn-checkback-loop.md         # 5-turn source check-back specification
│   ├── dev-eval-receipts-and-loop-a.md     # 8-step receipt runner & Loop A spec
│   ├── definition-of-done-and-handback.md  # DoD & Designer Checkpoint protocol
│   ├── designer-talkbacks-and-loop-b.md    # Developer voice & talk-back templates
│   └── contributing.md                     # Engineering workflows & standards
└── scripts/
    ├── run_dev_loop.py             # Master 8-step developer receipt runner
    ├── run_checkback_loop.py       # Automated 5-turn source check-back loop
    └── verify_html_bundle.mjs      # Headless DOM mount & JS syntax verifier
```

---

## 2. Engineering Verification Workflows

Before committing or exporting any changes, run the following verification pipeline:

### 2.1 Skill Schema & Wrapper Validation
```bash
python3 /usr/local/google/home/jfesta/skills/skill-maker/scripts/validate_and_wrap.py \
  --skills-root=/usr/local/google/home/jfesta/skills --fix
```
Ensures 100% compliance across all skills in the workspace (`25/25 [PASS]`).

### 2.2 Rebuild Catalog & Registry
```bash
python3 /usr/local/google/home/jfesta/skills/skill-maker/scripts/build_catalog.py \
  --skills-root=/usr/local/google/home/jfesta/skills
```
Rebuilds `catalog.json`, `index.html`, and `README.md`.

### 2.3 End-to-End Static Audit
```bash
python3 /usr/local/google/home/jfesta/skills/taxonomy/scripts/e2e_static_audit.py
```
Validates zero broken cross-references, zero stale terms, and strict manifest parity.

### 2.4 Test Receipt Runner
```bash
python3 /usr/local/google/home/jfesta/skills/jason-dev-agent/scripts/run_dev_loop.py \
  --project=/path/to/project \
  --reference=/path/to/reference.png
```
Runs the full 8-step verification plus the 5-turn source check-back loop.
