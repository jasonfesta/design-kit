# Google Skill Specification & `validate_skill.py` Rules

Every skill wrapped by `skill-maker` is checked against the exact rules enforced by `//learning/gemini/agents/skills/skill_creator/scripts:validate_skill`.

## 1. Required Files in Every Wrapped Skill Folder

| File | Purpose | Required by `validate_skill` / `skill_creator` |
| :--- | :--- | :--- |
| `SKILL.md` | YAML frontmatter (`name`, `description`, optional `metadata`) + imperative workflow instructions | **Mandatory** |
| `BUILD` | Blaze `agent_skill`, `validate_skill_test(check_locked_links = True)`, `eval_suite`, and `exports_files` | **Mandatory for Google3** |
| `EVAL.txtpb` | `EvalSuite` textproto (`learning/gemini/agents/evaluation/evalin/proto/eval_suite.proto`) with 3+ task cases | **Mandatory for Evalin** |
| `TEST.md` | End-to-end human and automated smoke test plan | **Mandatory** |
| `references/contributing.md` | Core invariants, editing principles, and verification commands (linked from `## Contributions` in `SKILL.md`) | **Mandatory when `## Contributions` present** |
| `scripts/BUILD` | `pytype_strict_binary` rules for `.py` scripts and `exports_files` for `.mjs` scripts | **Mandatory when `scripts/` present in experimental/team skills** |
| `skill.json` | Structured metadata (`id`, `title`, `domain`, `summary`, `inputs`, `outputs`, `references`, `commands`) | **Mandatory for Skills Portal & `x20`** |
| `evals/smoke.json` | Deterministic smoke verification case | **Mandatory for Skills Portal** |
| `index.html` | Self-contained dark/light HTML documentation & preview page (`x20` opaque-origin safe) | **Mandatory for `x20` folder browsing** |

## 2. Hard `validate_skill.py` Invariants

1.  **Frontmatter Keys**:
    -   Only allowed keys: `name`, `description`, `license`, `allowed-tools`, `metadata`, `compatibility`, `support_tier`, `version`, `tags`, `category`, `disable-model-invocation`, `disable-slash-command`, `type`, `title`, `resource`, `timestamp`, `okf_version`.
2.  **`name` Field**:
    -   Must match `^[a-z0-9-]+$`, length `<= 64`, no leading/trailing hyphen, no `--`.
3.  **`description` Field**:
    -   Must use `>-` block scalar.
    -   Length `<= 1024` characters.
    -   **No `<` or `>` characters anywhere in `description`** (for example, write `at least 0.93` instead of `>= 0.93`, and `{slug}` instead of `<slug>`).
    -   No `[TODO:` placeholders.
4.  **Line & Byte Limits**:
    -   Soft warning threshold: `500` lines / `35,000` bytes.
    -   Hard failure ceiling: `800` lines / `46,080` bytes (`view_file` truncation limit).
    -   Minimum cardinality: `>= 50` lines (unless backed by `references/*.md`).
5.  **Outbound Links in `SKILL.md`**:
    -   Forbidden prefixes: `file:///`, `/google3/`, `/google/src/`.
    -   Every relative link (`references/...`, `scripts/...`, `examples/...`, `assets/...`) must exist on disk inside the skill directory.
6.  **Contributions Link**:
    -   If `## Contributions` appears in `SKILL.md`, the body must contain the exact substring `](references/contributing.md` followed by `)` and `references/contributing.md` must exist.
7.  **No Em Dashes in Code Spans (`SNIPPET_EM_DASH`)**:
    -   Never include `U+2014` (`—`) or `U+2013` (`–`) inside fenced code blocks or inline code backticks.
