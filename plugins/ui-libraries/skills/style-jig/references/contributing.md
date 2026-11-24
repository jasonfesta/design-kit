# Contributing to `style-jig` (Design Kit Jig)

## Core Invariants

1. **Zero Material Fonts**: Never introduce `Roboto`, `Google Sans`, `Product Sans`, or `Noto Sans` anywhere in `examples/jig-harness/`, `templates/`, or `references/`. Use `Instrument Sans` (`13.5px` lowercase) for Jig chrome and `JetBrains Mono` for trace/code readouts.
2. **Zero Purple / Violet Hues**: Keep all Jig and donor tokens outside OKLCH `270-330 deg`. Reserve Signal Crimson (`#EF4444`) exclusively for the strokeless Red Record dot and Signal Emerald (`#10B981`) for the `.ap-cursor` playback cursor and completion badge.
3. **Optical Vertical Button Centering (`-2px` Down)**: Keep `padding-top > padding-bottom` on every Jig button and action label.
4. **Tailwind v4 `@layer base` Reset Safety**: Keep document resets inside `@layer base`; never add unlayered `* { margin: 0; padding: 0; border: none; }`.
5. **Portability**: Every script in `scripts/` and every link in `SKILL.md` must work standalone when unpacked from `style-jig.skill` / `style-jig.zip` with no hardcoded user-home links.
6. **Bidirectional Write-Back**: Whenever Jig shell upgrades are proven in a project, sync them back via `python3 scripts/init_style_jig.py --save-back-from <project-dir>` without domain-specific app imports.

## Validation Commands

```bash
# 1. Lint design-donts on the working harness (must be 0 errors)
python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py examples/jig-harness

# 2. Typecheck and build the working harness
cd examples/jig-harness && npx tsc --noEmit && npx vite build

# 3. Validate Google Skill spec compliance and rebuild .skill / .zip bundles
python3 ~/design-kit/skills/skill-maker/scripts/validate_and_wrap.py \
  --skill-dir=/usr/local/google/home/jfesta/design-kit/plugins/ui-libraries/skills/style-jig --fix
```
