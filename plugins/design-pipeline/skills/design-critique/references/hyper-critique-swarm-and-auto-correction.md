# hyper-critique swarm, tri-perspective judgment & auto-correction protocol (`design-critique`)

## 1. the tri-perspective judgment model

Every critique turn in `jason-design-agent`—whether evaluating initial prompts, Round 1 plates, Round 2 challengers, or dev-agent builds—must evaluate and score across **three distinct perspectives** before issuing directives:

```text
                     ┌────────────────────────────────────────┐
                     │         TRI-PERSPECTIVE CRITIQUE       │
                     └───────────────────┬────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌──────────────────┐           ┌──────────────────┐            ┌──────────────────┐
│   PERSPECTIVE A  │           │   PERSPECTIVE B  │            │   PERSPECTIVE C  │
│  JUDGE LIKE A    │           │  JUDGE BACK TO   │            │   JUDGE ITSELF   │
│    DESIGNER      │           │    RESEARCH      │            │   (SELF-AUDIT)   │
└────────┬─────────┘           └────────┬─────────┘            └────────┬─────────┘
         │                              │                               │
         ▼                              ▼                               ▼
• Pure visual taste            • 5 standout benchmarks        • Brutal retrospective
• Optical padding & space      • Layout mechanisms & hooks    • Anti-inching rule
• Font letterform anatomy      • avoid_fonts / palettes       • Where did it compromise?
• 90/10 chromatic polarity     • Zero beige averaging         • What was under-specified?
```

1. **Perspective A — Judge like a Designer**:
   - Evaluates pure visual taste, typographic hierarchy, optical padding, negative space, and material depth.
   - Asks: *Is this commanding and high-end, or does it look like a generic AI template? Is the typography expressive and properly kerned? Are buttons and pills optically balanced at 2:1?*
2. **Perspective B — Judge back to Research**:
   - Compares the work directly against the 5 standout researched benchmarks and their screenshots.
   - Asks: *Did we actually channel the concrete layout grid, focal hook, and surface physics of the benchmark—or did we dilute it into safe mush? Are avoid_fonts and avoid_palettes 100% clean?*
3. **Perspective C — Judge Itself (Self-Audit)**:
   - Performs a brutal self-critique of the agent's prior decisions, prompts, and compromises.
   - Asks: *Where did I get lazy? Did I try to inch one minor change instead of taking a real stance? What did I overlook or compromise on?*

---

## 2. the 10-to-15 critic swarm roster

When a design turn reaches evaluation, `jason-design-agent` can queue a swarm of **10 to 15 specialized critique agents** using `scripts/run_critique_swarm.py briefs` to audit the design from divergent, unyielding angles:

| # | agent id | role / persona | core evaluation mandate |
| :-- | :-- | :-- | :-- |
| **01** | `lead_taste_critic` | Senior Design Director | Overall visual power, commanding point of view, anti-beige conviction. |
| **02** | `benchmark_fidelity_auditor` | Benchmark Research Inspector | Relentless fidelity to the 5 standout research examples; enforces avoids. |
| **03** | `typographic_anatomist` | Typographic Authority | Live Google Fonts selection, letterform terminals/x-height, tabular-nums, zero cliché fonts. |
| **04** | `grid_structuralist` | Grid Structural Engineer | CSS Grid tracks, asymmetric tension, column pauses, complete production footer. |
| **05** | `chromatic_polarity_critic` | Color & Contrast Specialist | Decisive non-beige chromatic world, 90/10 rule, border luminance steps. |
| **06** | `optical_padding_inspector` | Optical Padding Inspector | `>= 38-45%` negative space, `2:1` pill/button optical ratio, vertical rhythm. |
| **07** | `hero_mechanism_specialist` | Hero Visual Specialist | Cinema 4D (Octane/Redshift) 3D glass/metal vs. quantized 2D vector; bespoke functional hook. |
| **08** | `editorial_canon_auditor` | Copy & Canon Auditor | Authentic domain vocabulary from `canon.md`, realistic metrics, zero meta-text leaks. |
| **09** | `multi_surface_architect` | Multi-Surface Architect | Desktop widescreen to 390px mobile web/app continuity; ergonomic thumb zones. |
| **10** | `tactile_materialist` | Surface Physics Judge | Micro-substrate grain (304 steel, matte enamel, paper tooth); zero plastic AI smoothing. |
| **11** | `anti_cliche_killer` | AI Trope Eliminator | Purges generic modern web clichés (floating gradient glow cards, stock blobs). |
| **12** | `component_modularist` | Systemic UI Critic | Component distinctness (9 unique widgets solving 9 independent jobs), token grammar. |
| **13** | `spatial_depth_critic` | Interactive Experience Critic | 75% open stage on interactive experiences, tactile physics, spatial immersion. |
| **14** | `pixel_acutance_inspector` | Edge Sharpness Inspector | Native `min(w, h) >= 1024`, 2K lossless PNG, `sharpness_ratio >= 0.28`, zero squash ghosting. |
| **15** | `brutal_red_team_critic` | Adversarial Red-Team Critic | Ruthlessly exposes the 3 weakest compromises, flattest spots, and lazy shortcuts. |

---

## 3. the anti-inching rule: 10-dimension auto-correction

> [!IMPORTANT]
> **Anti-Inching Law**: A turn can never inch one minor change at a time (e.g. tweaking a single button's padding or changing one word of copy).
> When steering by auto-correction, the turn must change across **all 10 dimensions simultaneously** before generating the next round:

```text
Turn N Output ────► [Hyper-Critique Swarm (10-15 Agents)] ────► 10-Dimension Auto-Correction Matrix
                                                                       │
┌──────────────────────────────────────────────────────────────────────┴────────────────────────┐
│ 1. Structural Grid & Layout Architecture   6. Editorial Copy, Metrics & Canon Vocabulary      │
│ 2. Google Font Anatomy & Scale Hierarchy   7. Tactile Materiality & Micro-Surface Physics     │
│ 3. Chromatic Polarity & 90/10 Balance      8. Viewport Continuum & Mobile Parity              │
│ 4. Negative Space & Optical Padding        9. Component Modularity & Systemic Modularity      │
│ 5. Hero Visual & Signature Focal Mechanic 10. Benchmark Differentiation & Cliché Purge       │
└──────────────────────────────────────────────────────────────────────┬────────────────────────┘
                                                                       │
                                      Turn N+1 Decisive Leap ◄─────────┘
```

Even when starting with just one screengrab and transferring to the next, each iteration aggressively auto-corrects based on research, font selection, and prompt requirements rather than repeating prior compromises.

---

## 4. command usage

```bash
# 1. Inspect the 15-critic swarm roster
python3 /usr/local/google/home/jfesta/design-kit/skills/design-critique/scripts/run_critique_swarm.py roster

# 2. Generate assignment briefs for the swarm in a study
python3 /usr/local/google/home/jfesta/design-kit/skills/design-critique/scripts/run_critique_swarm.py briefs --study-dir=<study-dir> --count=15

# 3. Run tri-perspective audit and emit the 10-dimension auto-correction matrix
python3 /usr/local/google/home/jfesta/design-kit/skills/design-critique/scripts/run_critique_swarm.py audit --study-dir=<study-dir> --turn=1 --swarm-count=15
```
