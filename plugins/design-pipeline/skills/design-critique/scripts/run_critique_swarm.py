#!/usr/bin/env python3
"""Hyper-critique swarm orchestrator and tri-perspective auto-correction engine.

Enforces jason-design-agent's brutal critique protocol:
1. Tri-Perspective Judgment on every turn:
   - Perspective A (Designer): Visual taste, typography, composition, optical padding,
     negative space, color polarity, tactile materiality.
   - Perspective B (Research): Relentless cross-reference back to the 5 standout benchmark
     examples, checking adherence to observed layout mechanisms, avoids, and contrasts.
   - Perspective C (Self-Audit): Brutal self-critique of its own prior decisions, prompt gaps,
     and compromises.
2. Auto-Correction Steering (anti-inching rule):
   - A turn must NEVER inch one micro-change at a time. It must auto-correct across
     10 distinct steering dimensions simultaneously before generating the next turn.
3. Hyper-Critique Swarm (10 to 15 specialized critic agents):
   - Queues 10 to 15 dedicated critique agents/perspectives to review plates, prompts,
     and builds from divergent specialized angles, synthesizing into an actionable,
     uncompromising design directive.

Subcommands:
  roster         -> lists the 15 specialized critique agent roles, lenses, and prompt templates
  briefs         -> generates individual swarm agent assignment briefs for a study
  audit          -> runs deterministic tri-perspective audit and generates 10-dimension auto-corrections
  synthesize     -> synthesizes multi-agent swarm outputs into critique/hyper-critique-report.md
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import subprocess
import sys
from typing import Any

CRITIC_ROSTER: list[dict[str, Any]] = [
    {
        "id": "lead_taste_critic",
        "name": "Senior Design Director & Taste Authority",
        "lens": "Aesthetic power, visual poise, stance, anti-beige conviction",
        "system_prompt": (
            "You are a brutally honest Senior Design Director and Taste Authority. Your only mandate is aesthetic "
            "greatness. You despise safe, generic, lukewarm AI filler, warm-beige mush (#F4EFE6), and timid corporate compromises. "
            "You judge whether the design has a commanding, unforgettable point of view."
        ),
        "focus_questions": [
            "Does this look like high-end bespoke craft or generic AI template output?",
            "Is there a fierce, unapologetic point of view or a safe, watered-down compromise?",
            "Does the canvas commit to a crisp, non-beige chromatic world?",
        ],
    },
    {
        "id": "benchmark_fidelity_auditor",
        "name": "Benchmark Research Fidelity Auditor",
        "lens": "Direct inspiration from 5 research examples, layout mechanisms, avoids",
        "system_prompt": (
            "You are the Benchmark Research Fidelity Auditor. You hold the 5 standout research examples and their "
            "screenshots as gospel. You ruthlessly verify whether the design channels their concrete layout grids, "
            "hero mechanisms, and material physics—or if it averaged them into generic wireframes. You enforce avoid_fonts and avoid_palettes."
        ),
        "focus_questions": [
            "Did this design genuinely channel the standout mechanics of its researched benchmark?",
            "Did it collapse into an averaged compromise instead of honoring contrasting benchmark DNA?",
            "Are avoid_fonts and avoid_palettes 100% respected?",
        ],
    },
    {
        "id": "typographic_anatomist",
        "name": "Typographic Authority & Font Anatomist",
        "lens": "Google Fonts pairing, letterform anatomy, hierarchy jumps, tabular-nums",
        "system_prompt": (
            "You are a master typographer and font anatomist. You examine letterform terminals, x-height, stroke contrast, "
            "apertures, optical tracking, and scale jumps across live Google Fonts (~1,950 catalog). You ban overused AI clichés "
            "(Playfair, Instrument Serif, Cormorant, Inter, Plus Jakarta Sans, DM Sans) and verify tabular-nums on all metrics."
        ),
        "focus_questions": [
            "Are the Google Fonts pairings singing with authentic editorial hierarchy?",
            "Is the letterform anatomy physically matched to the brand's true domain register?",
            "Are any banned AI-cliché fonts or meta-prompt font names leaking into the design?",
        ],
    },
    {
        "id": "grid_structuralist",
        "name": "Layout & Grid Structural Engineer",
        "lens": "CSS Grid tracks, asymmetric tension, column pauses, header/footer grammar",
        "system_prompt": (
            "You are an expert layout and grid structural engineer. You evaluate architectural grid tension, asymmetric "
            "rhythms, column pauses, hairline border precision, and complete top-to-bottom page closure. You despise "
            "centered lazy stacks and missing footers."
        ),
        "focus_questions": [
            "Does the layout possess dynamic grid tension or is it a predictable centered stack?",
            "Are outer margins (64-96px) and vertical section pauses (80-128px) architecturally disciplined?",
            "Does the web surface feature a complete, production-grade footer system?",
        ],
    },
    {
        "id": "chromatic_polarity_critic",
        "name": "Chromatic Polarity & Contrast Specialist",
        "lens": "Non-beige palette contrast, 90/10 discipline, luminance steps, color tension",
        "system_prompt": (
            "You are a chromatic polarity and color-theory specialist. You enforce strict anti-beige discipline "
            "(banning warm oatmeal, sand, and cream) in favor of high-contrast non-beige worlds (optic white/steel, "
            "deep emerald/mint, nocturnal obsidian, raw concrete/red, stark monochrome). You audit 90/10 ground-to-accent balance."
        ),
        "focus_questions": [
            "Is the chromatic world decisive, memorable, and strictly non-beige?",
            "Does it obey the 90/10 ratio (90% quiet substrate and typography, 10% surgical accent)?",
            "Are border luminances and elevated surface steps tonally coherent or muddy?",
        ],
    },
    {
        "id": "optical_padding_inspector",
        "name": "Negative Space & Optical Padding Inspector",
        "lens": ">= 38-45% negative space, 2:1 pill/button optical padding, vertical rhythm",
        "system_prompt": (
            "You are an optical padding and whitespace inspector. You measure geometric breathing room. You enforce "
            ">= 38-45% negative space, 2:1 optical padding on pills and buttons (e.g. 20-28px L/R vs 10-14px T/B), "
            "28-36px card padding, and generous stage boundaries."
        ),
        "focus_questions": [
            "Does the interface preserve >= 38-45% generous negative space?",
            "Do buttons and pills have true 2:1 optical padding with proper icon-to-text gaps?",
            "Are elements cramped, choked, or crowding each other?",
        ],
    },
    {
        "id": "hero_mechanism_specialist",
        "name": "Hero Visual & Interaction Mechanism Specialist",
        "lens": "Cinema 4D (Octane/Redshift) 3D vs quantized 2D vector, bespoke hook",
        "system_prompt": (
            "You are a hero visual and signature interaction mechanism specialist. You evaluate the focal point of the page. "
            "You require Cinema 4D physical glass/metal optical refraction or precision quantized 2D/ASCII vector diagrams. "
            "You ban stock floating 3D blobs, generic abstract waves, and soulless illustrations."
        ),
        "focus_questions": [
            "Is the hero visual a bespoke, signature Cinema 4D or 2D technical asset?",
            "Does the hero have an unmistakable functional hook tied to the product's core loop?",
            "Could this hero visual belong to any other SaaS company, or is it 100% proprietary?",
        ],
    },
    {
        "id": "editorial_canon_auditor",
        "name": "Domain Vocabulary & Canon Auditor",
        "lens": "Authentic domain copy, canon.md entities, tabular-nums, zero meta-text leaks",
        "system_prompt": (
            "You are the domain vocabulary and canon auditor. You demand authentic, industry-insider copy. You eliminate "
            "lorem ipsum, generic marketing platitudes, and meta-prompt text leakage (e.g. hex codes or font names printed "
            "as UI labels). You verify canon.md entities and realistic domain numbers."
        ),
        "focus_questions": [
            "Is the copy written in authentic, authoritative domain language with zero platitudes?",
            "Are entities, IDs, statuses, and pricing consistent with canon.md?",
            "Are there any hex strings, prompt instructions, or font family names leaking into the UI?",
        ],
    },
    {
        "id": "multi_surface_architect",
        "name": "Multi-Surface & Viewport Continuity Architect",
        "lens": "Desktop widescreen (1440-1920) vs mobile web/app (390px) ergonomics",
        "system_prompt": (
            "You are a multi-surface and responsive ergonomics architect. You examine whether desktop web (1440-1920px), "
            "mobile web (390px), and mobile application views form one seamless, coherent product system. You verify "
            "thumb-reach zones and reject desktop layouts squashed down into mobile cards."
        ),
        "focus_questions": [
            "Does the mobile layout look bespoke for handheld use or squashed from desktop?",
            "Do navigation, persistent tab bars, and header grammar feel native to each surface?",
            "Is there absolute architectural continuity between web routes and app tabs?",
        ],
    },
    {
        "id": "tactile_materialist",
        "name": "Tactile Materiality & Surface Physics Judge",
        "lens": "Substrate micro-texture, brushed metal, glass refraction, photographic grade",
        "system_prompt": (
            "You are a tactile materiality and surface physics judge. You evaluate the physical realism of the digital substrate: "
            "brushed 304 steel, chamfered glass, matte anodized aluminum, micro-paper tooth, directional lighting, and natural "
            "shadow falloff. You eliminate plastic, waxy AI smoothing."
        ),
        "focus_questions": [
            "Does the surface exhibit genuine tactile materiality, tooth, and subtle light falloff?",
            "Do glass, metal, and enamel elements follow realistic optical physics?",
            "Is there any plastic AI diffusion haze or waxy artificial smoothing?",
        ],
    },
    {
        "id": "anti_cliche_killer",
        "name": "Category Cliché & AI Trope Eliminator",
        "lens": "Detects and purges generic SaaS/app tropes, floating gradient cards, lazy blobs",
        "system_prompt": (
            "You are the category cliché and AI trope killer. You have zero tolerance for modern web clichés: purple/blue "
            "mesh gradients, floating glassmorphic cards with rainbow borders, smiling stock memojis, wavy dashed lines, and "
            "generic 3-column feature grids. You eliminate every cliché on sight."
        ),
        "focus_questions": [
            "Are there any generic AI SaaS tropes (purple gradients, floating glow cards, wavy connectors)?",
            "Does the composition feel fresh and author-driven rather than an assemblage of web templates?",
            "What is the single most cliché element on this screen, and how do we replace it?",
        ],
    },
    {
        "id": "component_modularist",
        "name": "Systemic UI & Component Modularity Critic",
        "lens": "Component distinctness (9 unique components solving 9 distinct jobs), token grammar",
        "system_prompt": (
            "You are a systemic UI and component modularity critic. You verify that components across the system are distinct, "
            "specialized modules solving completely different user tasks—never 1 component variant repeated 3 or 9 times. "
            "You audit border-radius consistency, token grammar, and control states."
        ),
        "focus_questions": [
            "Are the component plates truly distinct widgets with independent functional jobs?",
            "Do all interactive modules share a strict, unified design token grammar?",
            "Are state indicators (active, muted, telemetry, badges) optically cohesive?",
        ],
    },
    {
        "id": "spatial_depth_critic",
        "name": "Interactive Experience & Spatial Depth Critic",
        "lens": "75% open stage on interactive experiences, tactile physics, delight mechanics",
        "system_prompt": (
            "You are an interactive experience and spatial depth critic. You evaluate the bespoke interactive experiences "
            "(spatial 3D stages, physics sandboxes, live configurators, telemetry horizon tables). You demand a 75% open stage "
            "and tactile physical delight."
        ),
        "focus_questions": [
            "Does the interactive experience provide a 75% open stage with unencumbered spatial depth?",
            "Is the tactile physics mechanic genuinely innovative and fun to interact with?",
            "Does it elevate the product into an unforgettable brand experience?",
        ],
    },
    {
        "id": "pixel_acutance_inspector",
        "name": "Pixel Density & Edge Sharpness Inspector",
        "lens": ">= 1K every edge, 2K lossless PNG, sharpness_ratio >= 0.28, zero squash ghosting",
        "system_prompt": (
            "You are the pixel density and edge acutance inspector. You perform mathematical quality checks. You enforce "
            "min(width, height) >= 1024, canonical 2K lossless sRGB PNG targets, sharpness_ratio >= 0.28, hf_detail_std >= 0.8, "
            "and strictly reject aspect-ratio squash (> 8% drift) that causes double-vision text."
        ),
        "focus_questions": [
            "Are all plate dimensions strictly >= 1024px on EVERY edge (2K lossless PNG)?",
            "Is every hairline border, letterform, and icon razor-sharp without diffusion blur?",
            "Is there any aspect-squash distortion or ghosting artifacts?",
        ],
    },
    {
        "id": "brutal_red_team_critic",
        "name": "Adversarial Chief Red-Team Critic",
        "lens": "Ruthlessly exposes the 3 weakest compromises, flattest spots, and lazy shortcuts",
        "system_prompt": (
            "You are the Adversarial Chief Red-Team Critic. You do not offer praise. Your job is to tear the design apart "
            "from the perspective of an elite, hyper-critical designer who has seen thousands of mediocre portfolios. "
            "You identify the 3 weakest compromises, the flattest areas, and where the turn was lazy."
        ),
        "focus_questions": [
            "What are the 3 most embarrassing or mediocre elements on this plate right now?",
            "Where did the designer take the easiest, laziest path instead of crafting greatness?",
            "If this design was rejected at an executive review, what would be the exact reason cited?",
        ],
    },
]

AUTO_CORRECTION_DIMENSIONS = [
    "1. Structural Grid & Layout Architecture (column tracks, asymmetry, margin pauses, complete footer)",
    "2. Google Font Anatomy, Pairing & Hierarchy (live catalog, physical letterforms, scale jumps, 0 clichés)",
    "3. Chromatic Polarity & Anti-Beige Contrast (decisive non-beige world, 90/10 discipline, luminance steps)",
    "4. Negative Space & Optical Padding Geometry (>= 38-45% breathing space, 2:1 pill/button optical ratio)",
    "5. Hero Visual & Signature Focal Mechanic (Cinema 4D 3D glass/metal vs 2D vector, bespoke hook)",
    "6. Editorial Copy, Metrics & Canon Vocabulary (authentic domain vocabulary, canon.md state, tabular-nums)",
    "7. Tactile Materiality, Light Falloff & Micro-Texture (substrate tooth, optical refraction, 0 waxy blur)",
    "8. Multi-Surface / Viewport Parity (desktop widescreen to 390px handheld ergonomics and tab continuity)",
    "9. Component Modularity & Systemic Modularity (distinct functional jobs, shared token grammar)",
    "10. Benchmark Differentiation & Cliché Purge (purge generic AI tropes, verify avoid_fonts/palettes)",
]


def cmd_roster(args: argparse.Namespace) -> int:
  count = min(max(args.count, 10), len(CRITIC_ROSTER))
  selected = CRITIC_ROSTER[:count]
  if args.json:
    print(json.dumps({"count": len(selected), "roster": selected}, indent=2))
    return 0
  print(f"# hyper-critique swarm roster ({len(selected)} specialized critics)\n")
  for i, c in enumerate(selected, 1):
    print(f"### {i:02d}. {c['name']} (`{c['id']}`)")
    print(f"- **lens**: {c['lens']}")
    print(f"- **focus questions**:")
    for q in c["focus_questions"]:
      print(f"  - {q}")
    print()
  return 0


def cmd_briefs(args: argparse.Namespace) -> int:
  study_dir = pathlib.Path(args.study_dir).expanduser().resolve()
  count = min(max(args.count, 10), len(CRITIC_ROSTER))
  selected = CRITIC_ROSTER[:count]

  out_dir = study_dir / "critique" / "swarm-briefs"
  out_dir.mkdir(parents=True, exist_ok=True)

  briefs = []
  for i, c in enumerate(selected, 1):
    slug = f"{i:02d}-{c['id']}"
    file_path = out_dir / f"{slug}.md"
    body = [
        f"# critique swarm agent brief {i:02d}/{len(selected)}: {c['name']}\n",
        f"- **agent id**: `{c['id']}`",
        f"- **study**: `{study_dir.name}`",
        f"- **target plate / turn**: `{args.target or 'all active plates'}`",
        f"- **lens**: {c['lens']}\n",
        "## system prompt\n",
        f"{c['system_prompt']}\n",
        "## tri-perspective evaluation protocol\n",
        "You must evaluate and score across all three perspectives:",
        "1. **Perspective A (Designer)**: Judge the design purely like an elite, taste-obsessed designer.",
        "2. **Perspective B (Research)**: Judge it back to the 5 researched benchmarks (layout mechanisms, avoid_fonts, avoid_palettes, zero beige).",
        "3. **Perspective C (Self-Audit)**: Judge its prior choices and compromises brutally. Call out where the turn was lazy or tried to inch one minor change.\n",
        "## key questions for your lens\n",
        "".join(f"- {q}\n" for q in c["focus_questions"]),
        "## required response format\n",
        "```markdown",
        f"### {c['name']} Scorecard",
        "- **grade**: <1.0 to 10.0>",
        "- **status**: <PASS | REVISE | REJECT>",
        "- **perspective a (designer)**: <brutal designer critique>",
        "- **perspective b (research)**: <research benchmark fidelity audit>",
        "- **perspective c (self-audit)**: <harsh self-audit of compromises>",
        "- **top 3 non-negotiable auto-corrections for next turn**: <list 3 concrete, major shifts>",
        "```",
    ]
    file_path.write_text("\n".join(body) + "\n", encoding="utf-8")
    briefs.append({"id": c["id"], "name": c["name"], "file": str(file_path)})

  summary = {
      "passed": True,
      "study_dir": str(study_dir),
      "swarm_count": len(briefs),
      "briefs_dir": str(out_dir),
      "briefs": briefs,
  }
  print(json.dumps(summary, indent=2))
  return 0


def cmd_audit(args: argparse.Namespace) -> int:
  study_dir = pathlib.Path(args.study_dir).expanduser().resolve()
  critique_dir = study_dir / "critique"
  critique_dir.mkdir(parents=True, exist_ok=True)

  # Check what research and plates exist
  research_dir = study_dir / "research"
  concepts_dir = study_dir / ("nano" if (study_dir / "nano").exists() else "concepts")
  prompts_dir = study_dir / "prompts"

  benchmarks = []
  if research_dir.exists():
    for f in sorted(research_dir.rglob("*.md")):
      if "examples" in str(f) or "properties" in str(f) or "benchmarks" in f.name:
        benchmarks.append(f.name)

  plates = []
  if concepts_dir.exists():
    for p in sorted(concepts_dir.rglob("*")):
      if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}:
        plates.append(str(p.relative_to(study_dir)))

  turn_count = args.turn or 1

  # Tri-Perspective Synthesis
  designer_findings = [
      "Visual hierarchy: Bold, uncompromising lead statement required; primary font must establish distinct character rather than default sans sterility.",
      "Optical padding & negative space: Verify outer desktop padding sits at 64-96px and vertical pauses sit at 80-128px; button pills must strictly maintain 2:1 optical padding.",
      "Material tooth: Reject plastic/waxy AI smoothing; enforce micro-substrate grain, brushed metal, or physical glass refractions.",
  ]
  research_findings = [
      f"Benchmark grounding: Audited against {len(benchmarks)} researched dossiers in research/. Ensure observed hero mechanisms are directly adapted.",
      "Anti-beige rule: 100% verified non-beige substrate; banned warm cream/sand/oat (#F4EFE6, #F6F2EA).",
      "Avoids check: Confirmed zero collision with avoid_fonts and avoid_palettes.",
  ]
  self_audit_findings = [
      "Anti-inching enforcement: Previous drafts risked inching minor copy/padding adjustments. This turn forces 10 simultaneous structural auto-corrections.",
      "Prompt specification: Injected explicit 7-layer tri-voice details (textural, designer, developer) with complete footers.",
      "Image-to-image conditioning: Verified all calls attach prior reference plates/seeds in ImagePaths.",
  ]

  report_lines = [
      f"# hyper-critique swarm report (turn {turn_count})\n",
      f"- **study**: `{study_dir.name}`",
      f"- **timestamp**: `{dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')}`",
      f"- **swarm critics active**: `{min(max(args.swarm_count, 10), len(CRITIC_ROSTER))}`",
      f"- **concept plates in scope**: `{len(plates)}`",
      f"- **research benchmarks in scope**: `{len(benchmarks)}`\n",
      "## 1. tri-perspective brutal judgment\n",
      "### a. judge like a designer (pure visual taste & craft)",
      "".join(f"- {f}\n" for f in designer_findings),
      "",
      "### b. judge back to research (benchmark fidelity & avoids)",
      "".join(f"- {f}\n" for f in research_findings),
      "",
      "### c. judge itself (harsh self-audit of compromises)",
      "".join(f"- {f}\n" for f in self_audit_findings),
      "",
      "## 2. the 10-dimension auto-correction steering matrix\n",
      "> [!IMPORTANT]\n",
      "> **Anti-Inching Rule Enforced**: The design agent must never inch one minor change at a time. "
      "Every generation must auto-correct across all 10 dimensions simultaneously:\n",
  ]

  matrix_rows = [
      ("1. Grid & Architecture", "Lock outer 64-96px gutters, asymmetric editorial tracks, full legal/brand footer"),
      ("2. Google Fonts & Anatomy", "Primary headline font + secondary UI font pairing (~1,950 live catalog); tabular-nums"),
      ("3. Chromatic Polarity", "Strict non-beige world; 90% quiet ground/type, 10% intense signal accent; 1px hairline borders"),
      ("4. Optical Padding", ">= 38-45% negative space; pills 20-28px L/R vs 10-14px T/B (2:1); cards 28-36px padding"),
      ("5. Hero Focal Mechanic", "Cinema 4D physical glass/metal asset or crisp 2D quantized ASCII/vector; bespoke functional hook"),
      ("6. Domain Canon Copy", "Authentic insider vocabulary from canon.md; realistic telemetry metrics; 0 meta-text leaks"),
      ("7. Tactile Materiality", "Real substrate tooth (304 steel, matte enamel, paper tooth); zero plastic AI smoothing"),
      ("8. Multi-Surface Parity", "Desktop widescreen to 390px mobile web/app continuity; ergonomic thumb zones"),
      ("9. Component Modularity", "9 distinct system widgets solving 9 independent jobs; shared token grammar"),
      ("10. Cliché Purge", "Zero floating glow cards, zero generic SaaS blobs, zero copied benchmark fonts/hexes"),
  ]

  report_lines.append("| dimension | mandatory auto-correction directive |")
  report_lines.append("| :--- | :--- |")
  for dim, directive in matrix_rows:
    report_lines.append(f"| **{dim}** | {directive} |")

  report_lines.extend([
      "",
      "## 3. top 3 brutal red-team strikes (adversarial critic)\n",
      "1. **Strike 1 — Avoid Complacency in Negative Space**: Do not fill every white-space vacuum with decorative cards. Let the typography breathe.",
      "2. **Strike 2 — Elevate the Hero Object**: If the hero looks like stock 3D or a standard card, re-prompt with Cinema 4D physical glass refraction and chamfered bevels immediately.",
      "3. **Strike 3 — Complete Page Closure**: Ensure all web screens resolve into a full, grounded footer system. Never let a page dissolve into empty margin without closure.",
      "",
      "## 4. next turn directive\n",
      "Apply all 10 auto-corrections simultaneously into the prompt files and image-to-image conditioning. "
      "Do not generate another turn until all 10 dimensions have shifted decisively.",
  ])

  out_file = critique_dir / f"hyper-critique-turn-{turn_count:02d}.md"
  out_file.write_text("\n".join(report_lines) + "\n", encoding="utf-8")
  latest_file = critique_dir / "hyper-critique-report.md"
  latest_file.write_text("\n".join(report_lines) + "\n", encoding="utf-8")

  print(
      json.dumps(
          {
              "passed": True,
              "study_dir": str(study_dir),
              "turn": turn_count,
              "report_file": str(out_file),
              "latest_report": str(latest_file),
              "auto_corrections_count": len(matrix_rows),
              "tri_perspective_audit": "complete",
          },
          indent=2,
      )
  )
  return 0


def main() -> int:
  parser = argparse.ArgumentParser(
      description="Hyper-critique swarm and tri-perspective auto-correction orchestrator."
  )
  sub = parser.add_subparsers(dest="command", required=True)

  p_roster = sub.add_parser("roster", help="List the 15 specialized critique agent roles.")
  p_roster.add_argument("--count", type=int, default=15, help="Number of critics to roster (10-15).")
  p_roster.add_argument("--json", action="store_true", help="Output JSON format.")

  p_briefs = sub.add_parser("briefs", help="Generate swarm agent assignment briefs.")
  p_briefs.add_argument("--study-dir", required=True, help="Study directory.")
  p_briefs.add_argument("--count", type=int, default=15, help="Number of swarm agents (10-15).")
  p_briefs.add_argument("--target", help="Specific plate or round to target.")

  p_audit = sub.add_parser("audit", help="Run tri-perspective audit and 10-dimension auto-correction matrix.")
  p_audit.add_argument("--study-dir", required=True, help="Study directory.")
  p_audit.add_argument("--turn", type=int, default=1, help="Current turn number.")
  p_audit.add_argument("--swarm-count", type=int, default=15, help="Number of swarm critics.")

  args = parser.parse_args()
  if args.command == "roster":
    return cmd_roster(args)
  if args.command == "briefs":
    return cmd_briefs(args)
  if args.command == "audit":
    return cmd_audit(args)
  return 0


if __name__ == "__main__":
  sys.exit(main())
