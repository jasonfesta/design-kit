# Packaging `.skill` Archives, HTML Portals & `x20` Deployment

## 1. Dual Packaging Format (`.skill` and `.zip`)

Every wrapped skill in `/usr/local/google/home/jfesta/skills/<skill-id>/` is packaged into two identical, deterministic ZIP archives at the workspace root:

-   `/usr/local/google/home/jfesta/skills/<skill-id>.skill`
-   `/usr/local/google/home/jfesta/skills/<skill-id>.zip`

Each archive contains `<skill-id>/SKILL.md`, `BUILD`, `EVAL.txtpb`, `TEST.md`, `skill.json`, `index.html`, `evals/`, `references/`, `scripts/`, `examples/`, and `assets/` (excluding `__pycache__`, `.pyc`, and `.DS_Store`).

## 2. Standalone & Root HTML Portals (`x20` Opaque-Origin Safe)

Because `x20` serves static pages under an opaque origin (`null` origin in sandboxed contexts), every generated `index.html` page (both the root catalog `/usr/local/google/home/jfesta/skills/index.html` and per-skill `<skill-id>/index.html`) obeys strict `x20` safety rules:

1.  **Zero `fetch()` or `XMLHttpRequest` Required for Initial Render**:
    -   All skill metadata, `SKILL.md` documentation, file manifests, CLI commands, and evaluation gates are pre-rendered directly into the HTML document at build time by `validate_and_wrap.py` and `build_catalog.py`.
2.  **`try / catch` Around `localStorage`**:
    -   Theme toggle scripts wrap `localStorage.getItem` and `localStorage.setItem` in `try { ... } catch (e) {}` so opaque-origin sandboxes never throw a `SecurityError`.
3.  **Relative Links Only**:
    -   All navigation links (`./<skill-id>/index.html`, `./<skill-id>/SKILL.md`, `./<skill-id>.skill`, `./<skill-id>.zip`) use relative paths so the folder works identically at `file:///`, `http://localhost:<port>/`, and `https://x20web.corp.google.com/users/jf/jfesta/www/skills/`.

## 3. Publishing to `x20`

To publish or update the skills catalog folder on `x20` (`/google/data/rw/users/jf/jfesta/www/skills/`):

```bash
python3 /usr/local/google/home/jfesta/skills/skill-maker/scripts/build_catalog.py \
  --skills-root=/usr/local/google/home/jfesta/skills \
  --x20-dir=/google/data/rw/users/jf/jfesta/www/skills
```
