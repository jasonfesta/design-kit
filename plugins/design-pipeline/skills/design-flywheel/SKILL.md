---
name: design-flywheel
description: >-
  Iterative self-improving design flywheel skill for jason-design-agent. Runs
  an automated multi-turn loop (up to 5 iterations) targeting typography,
  color, and individual touts using targeted Nano Banana 1K re-renders and
  micro-research before presenting at the designer checkpoint.
metadata:
  icon: ✨
---

# design-flywheel

```text
jason-design-agent / design-flywheel (iterative 1k self-improvement loop)
───────────────────────────────────────────────────────────────────────
input         initial 1k desktop + mobile concept plates (per style range)
loop (1..5)   1. inspect full page (header -> touts -> footer)
              2. identify weak typography, color, or tout structure
              3. retrieve targeted competitor visual references (micro-research)
              4. steer Nano Banana prompt and re-render at 1K
              5. re-eval -> if improved, continue; if stalled, repeat or halt at max 5
output        fully optimized 1k concept plates presented at Designer Checkpoint
```

## core instructions

1. **Scope**: Target every aspect of the full-page layout—from the top sticky header and navigation down to individual **touts** (hero, card grids, features, tables, complete footers) across both desktop and mobile viewports.
2. **The 5-Turn Flywheel**:
   - Run up to **5 iterations** of self-critique and Nano Banana 1K re-rendering.
   - After each 1K render, audit typography, color harmony, negative space, and individual tout mechanics.
3. **Targeted Micro-Research Injection & Iterative Image-to-Image Conditioning**:
   - Every single round of the flywheel **must use the output image from the immediately preceding round as its direct image input (`ref-base` / `--input_image`)**. 
   - Never generate blind text-to-image calls during the flywheel. Each turn applies precise prompt steering and targeted micro-research corrections directly on top of the prior plate, ensuring cumulative, progressive design improvement.
4. **Automatic Checkpoint Handoff**: Once the 5-turn maximum is reached (or visual sign-off is achieved earlier), automatically halt the loop and present the polished 1K desktop and mobile plates to the designer at the **Pre-Moodboard Designer Image Checkpoint**.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
