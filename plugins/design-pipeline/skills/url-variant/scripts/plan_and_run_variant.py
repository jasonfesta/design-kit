#!/usr/bin/env python3
"""Upfront Variation Prompt Architect, Pre-Flight Auditor, and 2-Pass Nano Banana 2.1 Runner.

Core Architectural Principle:
  Because Nano Banana 2.1 generates the variant *while* receiving the captured screenshot as an
  image-to-image input, 100% of the variation prompt architecture MUST be built, mapped, and
  verified AHEAD OF TIME (`plan` + `audit-prompts`) before any image generation call runs.

  After Pass 1 (Desktop) and Pass 2 (Mobile) complete, `eval_url_variant.py` computes the
  diagnostic Uniqueness, Quality, and Regression scores and hands the outputs directly to the
  Designer for review (zero blind auto-retry loops).
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import pathlib
import subprocess
import sys
from typing import Any

GEMPIX = "/google/bin/releases/gempix/gempix-1/gempix"
MAGICK = "/usr/bin/magick" if pathlib.Path("/usr/bin/magick").exists() else "magick"
FONT_SCALE_SCRIPT = pathlib.Path(
    "/usr/local/google/home/jfesta/design-kit/skills/jason-design-agent/scripts/font_scale_and_pairing.py"
)

STANCE_DIAL_TIERS: list[tuple[float, float, str, str]] = [
    (
        0.10,
        0.34,
        "subtle-sibling",
        "Subtle Sibling Stance (Dial 0.15-0.30): Preserve the original light/dark polarity and general material temperature, "
        "shift the brand/accent palette to fresh hex tokens (Delta E 16-28), pair new non-copied Google Fonts, rewrite 100% of "
        "copy and brand identity, and upgrade all Flutter/canvas/DOM artifacts to razor-sharp vector UI.",
    ),
    (
        0.35,
        0.62,
        "central-idea-reinterpretation",
        "Central-Idea Reinterpretation Stance (Dial 0.40-0.60 — Mode: central-idea-reinterpretation): Develop a distinct "
        "visual interpretation of the reference's central idea. Preserve what the image communicates and the qualities that "
        "make it appealing while independently redesigning how the idea is expressed. Feel connected to the same creative "
        "brief in its own composition, visual identity, and execution (Delta E 25-45), retaining the central concept, "
        "intended function, subject category, broad emotional tone, and level of finish.",
    ),
    (
        0.63,
        0.84,
        "theme-polarity-reinterpretation",
        "Theme & Polarity Reinterpretation Stance (Dial 0.65-0.80 — Mode: central-idea-reinterpretation): Develop a distinct "
        "visual and chromatic interpretation of the reference's central idea with a full theme/polarity shift (Delta E 38-75). "
        "Preserve what the interface communicates, its intended function, and its level of finish while independently "
        "redesigning the composition, surface lighting, typography, and visual identity so it feels born from the same "
        "creative brief with zero copied branding or artifacts.",
    ),
    (
        0.85,
        1.00,
        "total-reinvention",
        "Total Structural & Identity Reinvention Stance (Dial 0.85-1.00 — Mode: total-reinvention): Use the attached reference "
        "image ONLY to gauge the level of visual complexity, stylization, and production quality. Everything is available for "
        "reinvention. Independently design the composition (silhouettes, proportion, structural arrangement, color palette, "
        "typography, materials, lighting, and supporting details) so the result is immediately distinguishable from the "
        "reference at thumbnail size (Delta E >= 45) while matching or exceeding its sophistication up close.",
    ),
]

REINVENTION_MODES: dict[str, dict[str, str]] = {
    "central-idea-reinterpretation": {
        "id": "central-idea-reinterpretation",
        "label": "Distinct Visual Interpretation of the Reference's Central Idea (Same Creative Brief, Independent Execution)",
        "core_directive": (
            "Develop a distinct visual interpretation of the reference's central idea. Preserve what the image communicates "
            "and the qualities that make it appealing while independently redesigning how the idea is expressed. The result "
            "must feel connected to the same creative brief in its own composition, visual identity, and execution. Retain the "
            "central concept and the image's intended function. Preserve explicit requirements supplied with this request, and "
            "beyond those requirements, preserve only the subject category, broad emotional tone, and level of finish. "
            "Independently redesign the layout hierarchy, container geometry, color palette, typography, and bespoke graphics "
            "so no literal branding, copy, or framework artifacts from the reference survive."
        ),
    },
    "total-reinvention": {
        "id": "total-reinvention",
        "label": "Complete Structural & Compositional Reinvention (Gauge Complexity Only, Thumbnail-Distinguishable)",
        "core_directive": (
            "Create one completely new image. Use the attached reference image ('attach_image_only') ONLY to gauge the level of "
            "visual complexity, stylization, information density, and production quality. Everything is available for reinvention. "
            "Develop a new concept and subject, then independently design the composition (silhouettes, proportion, structural "
            "arrangement, color palette, typography, materials, textures, lighting, perspective, background, and supporting UI "
            "details). No element from the reference is required to survive. Choose one cohesive 'comp_and_art_direction' and "
            "make every decision to support it. Aim for comparable sophistication and intentionally produce a clearly different "
            "visual identity. Make substantial structural changes as well as changes to the surface appearance. The result must "
            "be immediately distinguishable from the reference at thumbnail size and show relevant independent design details up "
            "close. A re-color, minor layout tweak, subjective object swap, or style filter is insignificant—if recognizable "
            "arrangements, dominant shapes, or distinct motifs remain, redesign them further. Develop a cohesive, polished, "
            "standalone image with its own visual logic. Output: finished_image."
        ),
    },
    "subtle-sibling": {
        "id": "subtle-sibling",
        "label": "Controlled Sibling Refresh (Preserve Spatial Cadence, New Palette, Fonts & Copy, Purge Artifacts)",
        "core_directive": (
            "Create a clean, high-craft sibling variation of the reference interface. Preserve the core spatial cadence, "
            "intended function, and level of finish while introducing a fresh 8-token color palette, new Google Fonts, "
            "100% rewritten brand and UI copy, and upgraded vector components that eliminate all original framework, canvas, "
            "or Flutter artifacts."
        ),
    },
}

STYLE_STANCES: dict[str, dict[str, Any]] = {
    "swiss-telemetry-grid": {
        "id": "swiss-telemetry-grid",
        "label": "Crisp Mineral Alabaster, Exposed 1px Swiss Grid & International Klein Cobalt",
        "polarity": "light",
        "bg_primary": "#F4F6FA",
        "bg_elevated": "#FFFFFF",
        "text_primary": "#0B1220",
        "text_secondary": "#3E4C63",
        "accent_primary": "#0047FF",
        "accent_on_primary": "#FFFFFF",
        "accent_secondary": "#00A88F",
        "border_hairline": "#D5DFEE",
        "preferred_primary_font": "Space Grotesk",
        "preferred_secondary_font": "Instrument Sans",
        "preferred_mono_font": "JetBrains Mono",
        "voice_textural": (
            "Matte architectural mineral paper plane (#F4F6FA) meeting pure optic white (#FFFFFF) instrument cells, "
            "anodized International Klein Cobalt (#0047FF) active states, zero muddy drop-shadow haze, and razor-sharp "
            "vector schematic diagrams."
        ),
        "voice_designer": (
            "Exposed 1px solid #D5DFEE Swiss structural grid dividing header, hero, and multi-column bento callouts; "
            "42% calm negative space; technical coordinate index rails; right-aligned tabular-nums telemetry readouts."
        ),
        "voice_developer": (
            "12-column CSS Grid with continuous top-to-bottom 1px exposed seams, crisp 6px card corners, 44px tall "
            "buttons/pills with 2:1 L/R optical padding (24px horizontal padding), and complete multi-column footer."
        ),
    },
    "nocturnal-obsidian-precision": {
        "id": "nocturnal-obsidian-precision",
        "label": "Nocturnal Obsidian Carbon, Machined Graphite & Signal Emerald Telemetry",
        "polarity": "dark",
        "bg_primary": "#090D12",
        "bg_elevated": "#111821",
        "text_primary": "#F3F7FA",
        "text_secondary": "#8A99AD",
        "accent_primary": "#10E88A",
        "accent_on_primary": "#062014",
        "accent_secondary": "#38BDF8",
        "border_hairline": "#1E2938",
        "preferred_primary_font": "Syne",
        "preferred_secondary_font": "Manrope",
        "preferred_mono_font": "JetBrains Mono",
        "voice_textural": (
            "Matte PVD-coated black carbon (#090D12) and machined graphite containers (#111821) with smoked optical glass "
            "surfaces, top-edge 1px specular rim highlights, and luminous phosphor emerald (#10E88A) and cyan (#38BDF8) telemetry traces."
        ),
        "voice_designer": (
            "High-contrast nocturnal studio instrumentation with 90% deep obsidian surfaces and 10% concentrated emerald/cyan "
            "focal accents; tight -0.03em display headlines paired with crisp monospace status pills and dark syntax-highlighted sandboxes."
        ),
        "voice_developer": (
            "12px card border-radius with 1px solid #1E2938 hairlines, 44px emerald primary CTAs (#10E88A fill with #062014 bold ink), "
            "tabular-nums KPI counters, and zero washed-out gray backgrounds."
        ),
    },
    "anodized-industrial-atelier": {
        "id": "anodized-industrial-atelier",
        "label": "Brushed 6061 Aluminum Chassis, Bead-Blasted Keycap White & Signal Vermilion",
        "polarity": "light",
        "bg_primary": "#E6E9EF",
        "bg_elevated": "#F7F9FC",
        "text_primary": "#12151A",
        "text_secondary": "#47505E",
        "accent_primary": "#E63926",
        "accent_on_primary": "#FFFFFF",
        "accent_secondary": "#1D3557",
        "border_hairline": "#C5CCD8",
        "preferred_primary_font": "Bricolage Grotesque",
        "preferred_secondary_font": "Archivo",
        "preferred_mono_font": "IBM Plex Mono",
        "voice_textural": (
            "Tactile industrial hardware finish inspired by precision audio/optical instruments: fine brushed 6061 aluminum "
            "ground (#E6E9EF), bead-blasted elevated module wells (#F7F9FC), crisp 1px machined shutlines (#C5CCD8), and "
            "anodized signal vermilion (#E63926) physical action triggers."
        ),
        "voice_designer": (
            "Hardware faceplate modularity with recessed control wells, tactile segmented switches, studio macro 3D product/diagram "
            "renders, and bold technical grotesk typography."
        ),
        "voice_developer": (
            "8px outer card radius with 4px inner module radius, 1px solid #C5CCD8 recessed borders, 44px tactile keycap/pill "
            "buttons with 24px L/R padding, and tabular-nums technical specification tables."
        ),
    },
    "editorial-monumental-serif": {
        "id": "editorial-monumental-serif",
        "label": "Cool Gallery Vellum, Deep Aubergine Ink & Sculpted Display Serif Authority",
        "polarity": "light",
        "bg_primary": "#FAF9FD",
        "bg_elevated": "#FFFFFF",
        "text_primary": "#110F18",
        "text_secondary": "#4E4A5E",
        "accent_primary": "#4F26E8",
        "accent_on_primary": "#FFFFFF",
        "accent_secondary": "#D9385E",
        "border_hairline": "#DFDCEB",
        "preferred_primary_font": "Fraunces",
        "preferred_secondary_font": "Instrument Sans",
        "preferred_mono_font": "Space Mono",
        "voice_textural": (
            "Uncoated museum monograph vellum (#FAF9FD, strictly cool non-beige) with pure #FFFFFF exhibition cards, "
            "deep obsidian-aubergine ink (#110F18), ultramarine editorial accents (#4F26E8), and crisp 1px column hairlines."
        ),
        "voice_designer": (
            "High-contrast sculpted display serif headlines paired with a razor-sharp neo-grotesk UI companion; "
            "asymmetric editorial column tension, numbered index rails, and >= 42% open gallery breathing room."
        ),
        "voice_developer": (
            "Exposed 1px solid #DFDCEB horizontal and vertical editorial dividers, sharp 4px card corners, "
            "44px pill CTAs with 2:1 optical padding, and complete editorial colophon footer."
        ),
    },
    "kinetic-chromatic-colorblock": {
        "id": "kinetic-chromatic-colorblock",
        "label": "Crisp Ice White, Pitch Carbon Framing & Electric Ultramarine / Chartreuse Color-Blocks",
        "polarity": "light",
        "bg_primary": "#F5F7FF",
        "bg_elevated": "#FFFFFF",
        "text_primary": "#0B0C10",
        "text_secondary": "#383E4C",
        "accent_primary": "#2B3BFF",
        "accent_on_primary": "#FFFFFF",
        "accent_secondary": "#B8FF29",
        "border_hairline": "#0B0C10",
        "preferred_primary_font": "Syne",
        "preferred_secondary_font": "Space Grotesk",
        "preferred_mono_font": "Fira Code",
        "voice_textural": (
            "Bold flat-coat architectural enamel color blocks (#2B3BFF ultramarine, #B8FF29 kinetic chartreuse, #FFFFFF pure white) "
            "framed by crisp 1.5px solid #0B0C10 carbon ink borders with zero muddy gradients."
        ),
        "voice_designer": (
            "High-energy architectural color-blocking across hero and bento cards, oversized expressive geometric headlines, "
            "and high-contrast metric callout badges."
        ),
        "voice_developer": (
            "1.5px solid #0B0C10 structural card borders, 12px border-radius, 46px tall pill buttons with 26px L/R padding, "
            "and crisp multi-column grid alignment."
        ),
    },
    "indigo-ultraviolet-studio": {
        "id": "indigo-ultraviolet-studio",
        "label": "Midnight Indigo Void, Elevated Violet-Slate & Electric Ultraviolet Chroma",
        "polarity": "dark",
        "bg_primary": "#0B0917",
        "bg_elevated": "#151229",
        "text_primary": "#F6F5FF",
        "text_secondary": "#9E99C4",
        "accent_primary": "#7C4DFF",
        "accent_on_primary": "#FFFFFF",
        "accent_secondary": "#FF4D8D",
        "border_hairline": "#28234A",
        "preferred_primary_font": "Bricolage Grotesque",
        "preferred_secondary_font": "Manrope",
        "preferred_mono_font": "JetBrains Mono",
        "voice_textural": (
            "Deep midnight indigo studio void (#0B0917) with elevated violet-slate glass containers (#151229), "
            "refractive 3D crystal/metal focal artifacts, and electric ultraviolet (#7C4DFF) and laser rose (#FF4D8D) rim lighting."
        ),
        "voice_designer": (
            "90/10 nocturnal chroma discipline: 90% deep midnight indigo surfaces with 10% high-energy ultraviolet focal highlights "
            "on primary CTAs, active tabs, and live telemetry charts."
        ),
        "voice_developer": (
            "14px card border-radius, 1px solid #28234A crisp borders, 44px pill buttons, and tabular-nums data matrices."
        ),
    },
    "forest-titanium-precision": {
        "id": "forest-titanium-precision",
        "label": "Deep Alpine Nocturnal Pine, Brushed Titanium & Acid Lime Telemetry",
        "polarity": "dark",
        "bg_primary": "#081612",
        "bg_elevated": "#10261F",
        "text_primary": "#ECFDF5",
        "text_secondary": "#86B3A0",
        "accent_primary": "#B8FF3B",
        "accent_on_primary": "#081612",
        "accent_secondary": "#2DD4BF",
        "border_hairline": "#1E4035",
        "preferred_primary_font": "Space Grotesk",
        "preferred_secondary_font": "Instrument Sans",
        "preferred_mono_font": "IBM Plex Mono",
        "voice_textural": (
            "Deep alpine botanical carbon (#081612) paired with satin titanium data modules (#10261F) and high-visibility "
            "acid lime (#B8FF3B) and biometric teal (#2DD4BF) precision indicators."
        ),
        "voice_designer": (
            "Architectural climate/fintech/systems precision with generous 32px internal card padding, crisp geometric headlines, "
            "and high-contrast telemetry charts."
        ),
        "voice_developer": (
            "12px card radius, 1px solid #1E4035 borders, #B8FF3B primary buttons with #081612 bold ink (13.8:1 WCAG AAA contrast)."
        ),
    },
    "high-craft-light-laboratory": {
        "id": "high-craft-light-laboratory",
        "label": "Pure Optic #FFFFFF Gallery Plane, Cool #F1F5F9 Brushed Steel & Optical Cerulean",
        "polarity": "light",
        "bg_primary": "#FFFFFF",
        "bg_elevated": "#F1F5F9",
        "text_primary": "#0F172A",
        "text_secondary": "#475569",
        "accent_primary": "#0284C7",
        "accent_on_primary": "#FFFFFF",
        "accent_secondary": "#6366F1",
        "border_hairline": "#E2E8F0",
        "preferred_primary_font": "Outfit",
        "preferred_secondary_font": "Instrument Sans",
        "preferred_mono_font": "JetBrains Mono",
        "voice_textural": (
            "Pure #FFFFFF optic gallery wall meeting cool #F1F5F9 brushed stainless steel containers, crisp overhead "
            "daylight, zero warm-beige drift, and razor-sharp scientific/engineering schematic visuals."
        ),
        "voice_designer": (
            "Clean laboratory restraint with >= 42% pure white negative space, crisp 1px #E2E8F0 seams, and optical cerulean "
            "(#0284C7) active indicators."
        ),
        "voice_developer": (
            "10px card radius, 1px solid #E2E8F0 borders, 44px pill CTAs, and clean multi-column footer closure."
        ),
    },
}

DEFAULT_BRAND_PERSONAS: list[dict[str, Any]] = [
    {
        "brand_name": "KINETIX LABS",
        "tagline": "Autonomous Spatial Telemetry & Precision Compute Mesh",
        "nav_items": ["Architecture", "Telemetry", "Benchmarks", "Enterprise", "Start Trial"],
        "hero_eyebrow": "DETERMINISTIC SPATIAL RUNTIME v4.2",
        "hero_h1": "Orchestrate Zero-Latency Compute Across Global Nodes",
        "hero_sub": "Unified deterministic execution, hardware-accelerated synthesis, and sub-millisecond telemetry engineered for mission-critical systems.",
        "primary_cta": "Deploy Cluster",
        "secondary_cta": "Read Architecture Docs",
        "metrics": [
            {"value": "0.14ms", "label": "P99 Frame Dispatch"},
            {"value": "99.998%", "label": "Deterministic Lockstep"},
            {"value": "4.8M/s", "label": "Telemetry Events Indexed"},
            {"value": "128-Bit", "label": "Zero-Trust Hardware Enclave"},
        ],
        "section_blueprints": [
            {
                "h2": "Deterministic Pipeline Verification Across Every Region",
                "sub": "Inspect live state transitions, replay seeded simulation frames, and isolate latency spikes before they reach production.",
                "cards": [
                    "Sub-Millisecond State Snapshots With Zero Memory Copy",
                    "Automated Regression Ratchets Across 64 Parallel Regions",
                    "Hardware-Pinned Execution Graphs With Live Flamegraphs",
                ],
            },
            {
                "h2": "Live Hardware-Accelerated Throughput & Acoustic Telemetry",
                "sub": "Real-time multi-channel observability combining kernel trace streams, GPU memory pressure, and network fabric topology.",
                "cards": [
                    "Interactive Kernel Trace & Packet Timing Inspector",
                    "Zero-Jitter Stream Multiplexing Over QUIC & WebTransport",
                    "Cryptographic Audit Ledger With Instant Rollback",
                ],
            },
            {
                "h2": "Modular Primitives Built for High-Reliability Engineering",
                "sub": "Drop-in SDKs, declarative constraint solvers, and automated canary gates that integrate directly into your workflow.",
                "cards": [
                    "Declarative Topology Solver in 14 Lines of Code",
                    "Multi-Cluster Failover Verified Under Chaos Injection",
                    "Dedicated Enterprise SLA & 24/7 Systems Engineering",
                ],
            },
            {
                "h2": "Ready to Accelerate Your Production Infrastructure?",
                "sub": "Deploy a dedicated Kinetix cluster in under 90 seconds or schedule a technical architecture review.",
                "cards": [
                    "Instant Cloud & Bare-Metal Provisioning",
                    "SOC2 Type II & ISO 27001 Certified Enclaves",
                    "Complete API Reference, SDKs & System Status: Operational",
                ],
            },
        ],
    },
    {
        "brand_name": "VELOEX ATELIER",
        "tagline": "Tactile Acoustic Synthesis & CNC Anodized Hardware System",
        "nav_items": ["Instruments", "Waveguides", "Materials", "Field Notes", "Reserve Unit"],
        "hero_eyebrow": "FIRST EDITION BILLET SERIES 01",
        "hero_h1": "Sculpted Anodized Precision for Modern Sound Architects",
        "hero_sub": "CNC-milled 6061 aluminum enclosures, zero-jitter hybrid analog synthesis, and optical rotary encoders calibrated to reference studio standards.",
        "primary_cta": "Configure Instrument",
        "secondary_cta": "Explore Acoustic Specs",
        "metrics": [
            {"value": "124 dB", "label": "Dynamic Range Floor"},
            {"value": "0.0008%", "label": "Total Harmonic Distortion"},
            {"value": "384 kHz", "label": "Master Clock Resolution"},
            {"value": "6061-T6", "label": "Monoblock Milled Chassis"},
        ],
        "section_blueprints": [
            {
                "h2": "Milled From Solid Billet Aerospace Aluminum",
                "sub": "Every enclosure is machined across 5 axes, bead-blasted, and hard-anodized for electromagnetic shielding and lifetime tactile durability.",
                "cards": [
                    "Optical Detent Rotary Encoders Rated to 5 Million Cycles",
                    "Custom OLED High-Contrast Waveform & Spectrum Display",
                    "Isolated Dual-Toroidal Power Supply With Zero Hum",
                ],
            },
            {
                "h2": "Harmonic Waveguide Engine With Zero Phase Drift",
                "sub": "Combine discrete analog ladder filters with physical modeling resonators and sample-accurate parameter locks.",
                "cards": [
                    "8-Voice Polyphonic Physical Modeling & Spectral Morphing",
                    "Per-Step Micro-Timing, Probability & Voltage Modulation",
                    "Class-Compliant USB-C Multi-Track 32-Bit Float Audio",
                ],
            },
            {
                "h2": "Seamless Studio Integration & Modular CV/Gate Matrix",
                "sub": "Bridge hardware Eurorack rigs, DAW automation lanes, and standalone live performance setups without latency.",
                "cards": [
                    "16 Assignable DC-Coupled CV/Gate & Clock Outputs",
                    "Open-Source Firmware SDK & Patch Librarian",
                    "Individually Measured & Signed in Our Zurich Workshop",
                ],
            },
            {
                "h2": "Reserve Your Numbered Production Instrument",
                "sub": "Ships worldwide with custom flight case, braided Gold-plated interconnects, and a 5-year hardware warranty.",
                "cards": [
                    "Direct Atelier Dispatch & Serialized Calibration Certificate",
                    "30-Day Studio Audition Guarantee",
                    "Support, Schematics, Firmware Releases & Press Kit",
                ],
            },
        ],
    },
]


def hex_to_rgb(h: str) -> tuple[int, int, int] | None:
  s = (h or "").strip().lstrip("#")
  if len(s) == 3:
    s = "".join(c * 2 for c in s)
  if len(s) != 6:
    return None
  try:
    return int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)
  except ValueError:
    return None


def rel_luminance(rgb: tuple[int, int, int]) -> float:
  def lin(c: int) -> float:
    v = c / 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

  r, g, b = lin(rgb[0]), lin(rgb[1]), lin(rgb[2])
  return 0.2126 * r + 0.7152 * g + 0.0722 * b


def wcag_contrast(hex_a: str, hex_b: str) -> float:
  ra, rb = hex_to_rgb(hex_a), hex_to_rgb(hex_b)
  if not ra or not rb:
    return 1.0
  la, lb = rel_luminance(ra), rel_luminance(rb)
  hi, lo = max(la, lb), min(la, lb)
  return round((hi + 0.05) / (lo + 0.05), 2)


def rgb_to_lab(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
  def lin(c: int) -> float:
    v = c / 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

  r, g, b = lin(rgb[0]), lin(rgb[1]), lin(rgb[2])
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  def f(t: float) -> float:
    return t ** (1 / 3) if t > 0.008856 else (7.787 * t) + (16 / 116)

  fx, fy, fz = f(x), f(y), f(z)
  return (116 * fy - 16), 500 * (fx - fy), 200 * (fy - fz)


def delta_e_lab(hex_a: str, hex_b: str) -> float:
  ra, rb = hex_to_rgb(hex_a), hex_to_rgb(hex_b)
  if not ra or not rb:
    return 99.0
  la, aa, ba = rgb_to_lab(ra)
  lb, ab, bb = rgb_to_lab(rb)
  return math.sqrt((la - lb) ** 2 + (aa - ab) ** 2 + (ba - bb) ** 2)


def resolve_stance_dial(dial: float) -> tuple[float, str, str]:
  d = max(0.10, min(1.00, float(dial)))
  for lo, hi, tier, desc in STANCE_DIAL_TIERS:
    if lo <= d <= hi:
      return d, tier, desc
  return d, STANCE_DIAL_TIERS[2][2], STANCE_DIAL_TIERS[2][3]


def infer_original_polarity(avoid_bg: list[str]) -> str:
  for h in avoid_bg[:3]:
    rgb = hex_to_rgb(h)
    if rgb:
      lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
      return "dark" if lum < 110 else "light"
  return "light"


def select_style_stance(
    avoid_bg: list[str],
    avoid_fg: list[str],
    stance_dial: float,
    requested_stance: str | None = None,
) -> dict[str, Any]:
  orig_pol = infer_original_polarity(avoid_bg)
  orig_hexes = [h for h in (avoid_bg[:5] + avoid_fg[:4]) if hex_to_rgb(h)]

  if requested_stance and requested_stance in STYLE_STANCES:
    st = dict(STYLE_STANCES[requested_stance])
    cand_hexes = [st["bg_primary"], st["bg_elevated"], st["accent_primary"], st["accent_secondary"]]
    mean_min_de = (
        sum(min(delta_e_lab(ch, oh) for oh in orig_hexes) for ch in cand_hexes) / len(cand_hexes)
        if orig_hexes
        else 40.0
    )
    return {**st, "estimated_min_delta_e": round(mean_min_de, 2), "original_polarity": orig_pol}

  want_inversion = stance_dial >= 0.63
  best_stance = dict(STYLE_STANCES["swiss-telemetry-grid"])
  best_score = -1.0

  for st in STYLE_STANCES.values():
    cand_hexes = [st["bg_primary"], st["bg_elevated"], st["accent_primary"], st["accent_secondary"]]
    if orig_hexes:
      mean_min_de = sum(min(delta_e_lab(ch, oh) for oh in orig_hexes) for ch in cand_hexes) / len(cand_hexes)
    else:
      mean_min_de = 40.0

    pol_bonus = 18.0 if (want_inversion and st["polarity"] != orig_pol) else (12.0 if (not want_inversion and st["polarity"] == orig_pol) else 0.0)
    score = mean_min_de + pol_bonus
    if score > best_score:
      best_score = score
      best_stance = {**st, "estimated_min_delta_e": round(mean_min_de, 2), "original_polarity": orig_pol}

  return best_stance


def resolve_live_fonts_and_scale(stance: dict[str, Any], avoid_fonts: list[str]) -> dict[str, Any]:
  avoid_set = {f.lower() for f in avoid_fonts}
  primary = stance["preferred_primary_font"]
  secondary = stance["preferred_secondary_font"]
  mono = stance["preferred_mono_font"]

  fallback_primaries = ["Space Grotesk", "Syne", "Bricolage Grotesque", "Fraunces", "Outfit", "Sora"]
  fallback_secondaries = ["Instrument Sans", "Manrope", "Archivo", "Public Sans", "Work Sans"]
  if primary.lower() in avoid_set:
    primary = next((f for f in fallback_primaries if f.lower() not in avoid_set), "Space Grotesk")
  if secondary.lower() in avoid_set or secondary.lower() == primary.lower():
    secondary = next((f for f in fallback_secondaries if f.lower() not in avoid_set and f.lower() != primary.lower()), "Instrument Sans")

  desktop_scale_block = (
      f"Simulated Viewport -> 2K Canvas: 1440x810 CSS px @ 1.91x = 2752x1536. "
      f"Primary Headline ({primary}): H1 48-60px (6.0%-7.4% canvas H, <= 9 words, 2-3 lines max); "
      f"H2 32-40px (4.0%-4.9% H); H3 20-24px (2.5%-3.0% H). "
      f"Companion Body & UI ({secondary}): Body 16-18px (2.0%-2.2% H, 55-70 chars/line, 1.55 line-height); "
      f"Buttons/Nav 14-16px weight 500 inside 42-48px tall controls (20-28px L/R optical padding); "
      f"Hard Floor 12-13px (1.5%-1.6% H, NEVER < 12px)."
  )
  mobile_scale_block = (
      f"Simulated Viewport -> 2K Canvas: 390x844 CSS pt @ 3.94x = 1536x2752. "
      f"Primary Headline ({primary}): H1 28-34pt (3.3%-4.0% canvas H, <= 7 words, 2 lines max); "
      f"H2 20-22pt card/section titles (2.4%-2.6% H); H3 17-18pt row titles. "
      f"Companion Body & UI ({secondary}): Body 16pt minimum (1.9%-2.1% H, 4.1% canvas W, 34-42 chars/line across full mobile card width, NEVER desktop micro-text); "
      f"Touch Controls 15-16pt weight 500 inside >= 44-52pt tall targets (5.2%-6.2% H); "
      f"Hard Floor 12-13pt (1.45%-1.55% H, NEVER < 12pt)."
  )

  if FONT_SCALE_SCRIPT.exists():
    for surf, attr in (("desktop-web", "desktop"), ("mobile", "mobile")):
      try:
        out = subprocess.check_output(
            [
                sys.executable,
                str(FONT_SCALE_SCRIPT),
                "prompt-block",
                f"--surface={surf}",
                f"--primary={primary}",
                f"--secondary={secondary}",
            ],
            text=True,
            stderr=subprocess.DEVNULL,
            timeout=10,
        ).strip()
        if out and len(out) > 40:
          if attr == "desktop":
            desktop_scale_block = " ".join(line.strip() for line in out.splitlines() if line.strip())
          else:
            mobile_scale_block = " ".join(line.strip() for line in out.splitlines() if line.strip())
      except Exception:
        pass

  return {
      "primary": primary,
      "secondary": secondary,
      "mono": mono,
      "desktop_scale_block": desktop_scale_block,
      "mobile_scale_block": mobile_scale_block,
  }


def slice_band_dom_context(
    surf_info: dict[str, Any],
    scroll_y_css: int,
    viewport_h_css: int,
) -> dict[str, Any]:
  y0 = scroll_y_css - 80
  y1 = scroll_y_css + viewport_h_css + 80
  overlapping_secs = []
  totals = {"tabs": 0, "inputs": 0, "canvases": 0, "svgs": 0, "tables": 0, "images": 0, "cards": 0, "code_blocks": 0}

  for s in surf_info.get("sections", []):
    sy = int(s.get("y", 0))
    sh = int(s.get("height", 200))
    if sy + sh >= y0 and sy <= y1:
      overlapping_secs.append(s)
      sig = s.get("interactiveSignals", {})
      for k in ("tabs", "inputs", "canvases", "svgs", "tables", "images", "cards"):
        totals[k] += int(sig.get(k, 0))
      totals["code_blocks"] += len(s.get("codeSamples", []))

  complexity_reqs: list[str] = []
  if totals["cards"] > 0:
    complexity_reqs.append(f"{min(totals['cards'], 8)} structured bento/feature cards with internal iconography, data badges, and crisp 1px borders")
  if totals["tabs"] > 0:
    complexity_reqs.append(f"interactive segmented tab bar ({max(totals['tabs'], 3)} tabs with 1 active highlighted state)")
  if totals["code_blocks"] > 0:
    complexity_reqs.append("syntax-highlighted code/telemetry terminal block with line numbers and copy pill")
  if totals["tables"] > 0:
    complexity_reqs.append("structured multi-column comparison/telemetry table with tabular-nums alignment and status pills")
  if totals["canvases"] > 0 or totals["svgs"] >= 3:
    complexity_reqs.append("high-craft bespoke vector schematic / 3D architectural diagram / live telemetry chart matching the source visual density")
  if totals["inputs"] > 0:
    complexity_reqs.append("interactive input field / control cluster with 44px height and crisp focus ring")
  if not complexity_reqs:
    complexity_reqs.append("rich multi-layered UI callout modules, bespoke vector/3D visual graphics, and structured metric readouts matching the exact visual density of the reference")

  return {
      "overlapping_sections_count": len(overlapping_secs),
      "widget_totals": totals,
      "complexity_mandate": "; ".join(complexity_reqs),
  }


def resolve_reinvention_mode(dial: float, requested_mode: str = "auto") -> dict[str, str]:
  if requested_mode and requested_mode in REINVENTION_MODES:
    return REINVENTION_MODES[requested_mode]
  if dial >= 0.85:
    return REINVENTION_MODES["total-reinvention"]
  if dial >= 0.35:
    return REINVENTION_MODES["central-idea-reinterpretation"]
  return REINVENTION_MODES["subtle-sibling"]


def build_deep_10_section_prompt(
    surface: str,
    band_index: int,
    total_bands: int,
    stance_dial: float,
    stance_tier: str,
    stance_desc: str,
    reinvention_mode: dict[str, str],
    stance: dict[str, Any],
    fonts: dict[str, Any],
    persona: dict[str, Any],
    band_dom_ctx: dict[str, Any],
    has_flutter: bool,
    avoid_fonts: list[str],
    forbidden_phrases: list[str],
    visual_notes: str = "",
) -> str:
  is_desktop = surface == "desktop"
  is_hero = band_index == 1
  is_footer = band_index == total_bands and total_bands > 1
  rmode_id = reinvention_mode["id"]
  core_directive = reinvention_mode["core_directive"]

  surface_spec = (
      "Desktop Web Widescreen Band (1440x900 CSS @2x -> 2880x1800 / 2752x1536 2K)"
      if is_desktop
      else "Mobile Web Portrait Band (390x844 CSS pt @3x -> 1170x2532 / 1536x2752 2K)"
  )
  scale_block = fonts["desktop_scale_block"] if is_desktop else fonts["mobile_scale_block"]

  if is_desktop and is_hero:
    if rmode_id == "total-reinvention":
      cond_role = (
          f"PASS 1 (DESKTOP ANCHOR — MODE: {rmode_id.upper()}): {core_directive} "
          f"Chosen 'comp_and_art_direction': {stance['id']} ({stance['label']})."
      )
    elif rmode_id == "central-idea-reinterpretation":
      cond_role = (
          f"PASS 1 (DESKTOP ANCHOR — MODE: {rmode_id.upper()}): {core_directive} "
          f"Express this reinterpretation through the '{stance['id']}' ({stance['label']}) design stance, "
          "preserving the interface's central idea, communicative appeal, and interactive complexity while independently "
          "redesigning its composition, visual identity, palette, and typography."
      )
    else:
      cond_role = (
          f"PASS 1 (DESKTOP ANCHOR — MODE: {rmode_id.upper()}): {core_directive} "
          f"Apply the '{stance['id']}' ({stance['label']}) design stance while preserving the core spatial cadence."
      )
  elif is_desktop:
    cond_role = (
        f"PASS 1 (DESKTOP BAND {band_index:02d}/{total_bands:02d} — MODE: {rmode_id.upper()}): "
        "Input Image 1 is the captured Desktop mid/lower band screenshot; Input Image 2 (where multi-image is attached) is "
        f"Desktop Variant Band 01 (Anchor). {core_directive} Lock 100% of the visual identity, color palette, surface "
        "physics, border geometry, and typography to Desktop Variant Band 01 so the full stitched page forms one seamless, "
        "unified design system. Do NOT repeat the top navbar here."
    )
  else:
    cond_role = (
        f"PASS 2 (MOBILE CROSS-CONDITIONED TRANSFER — BAND {band_index:02d}/{total_bands:02d} — MODE: {rmode_id.upper()}): "
        "You are given BOTH the captured Mobile viewport screenshot (to gauge 390pt single-column vertical stacking, "
        "44-52pt touch target ergonomics, and mobile functional density) AND the rendered Desktop Variant design system "
        f"reference. {core_directive} Lock 100% of the visual identity, 'comp_and_art_direction' ({stance['id']}), color "
        f'palette, material lighting, typography anatomy, and brand wordmark ("{persona["brand_name"]}") to the rendered '
        "Desktop Variant so the Mobile Variant and Desktop Variant unmistakably belong to the exact same newly designed product."
    )

  if is_hero:
    metrics_str = " | ".join(f'{m["value"]} {m["label"]}' for m in persona["metrics"][:4])
    copy_block = (
        f'Region A (Top Header & Navigation): Render brand wordmark "{persona["brand_name"]}" top-left; navigation links '
        f'{", ".join(f"{x!r}" for x in persona["nav_items"][:4])} with clean 28px CSS spacing (zero middle dots); '
        f'right-aligned primary CTA pill "{persona["primary_cta"]}". '
        f'Region B (Hero Focal Stage): Eyebrow badge "{persona["hero_eyebrow"]}"; Primary H1 headline "{persona["hero_h1"]}"; '
        f'Supporting lead paragraph "{persona["hero_sub"]}"; Primary button "{persona["primary_cta"]}" and secondary button '
        f'"{persona["secondary_cta"]}" with balanced 2:1 optical padding. '
        f'Region C (Hero Telemetry & Proof Strip): Render crisp tabular-nums metric readouts: {metrics_str}.'
    )
  else:
    bp_idx = min(band_index - 2, len(persona["section_blueprints"]) - 1)
    bp = persona["section_blueprints"][max(0, bp_idx)]
    cards_str = "; ".join(f'Card {i+1}: "{c}"' for i, c in enumerate(bp["cards"]))
    footer_tail = (
        f' Region C (Complete Multi-Column Footer Closure): Close the bottom of this band with a complete, well-aligned '
        f'multi-column footer for "{persona["brand_name"]}" ({persona["tagline"]}), navigation columns '
        f'({", ".join(persona["nav_items"])}), and operational status indicator.'
        if is_footer
        else " Region C: Maintain clean section bottom margin and continuous 1px structural grid seams."
    )
    copy_block = (
        f'Region A (Section Header): Section H2 headline "{bp["h2"]}" with supporting deck "{bp["sub"]}". '
        f'Region B (Interactive Callout & Bento Grid Modules): {cards_str} — accompanied by live tabular-nums metrics '
        f'({persona["metrics"][band_index % len(persona["metrics"])]["value"]} {persona["metrics"][band_index % len(persona["metrics"])]["label"]}).'
        + footer_tail
    )

  forbidden_sample = ", ".join(f'"{p[:34]}"' for p in forbidden_phrases[:12] if len(p) > 2)
  avoid_font_str = ", ".join(avoid_fonts[:8]) if avoid_fonts else "original site fonts"

  flutter_block = (
      "FLUTTER & ARTIFACT PURGE (MANDATORY): The source URL used Flutter Web / canvas rendering (`flt-glass-pane`). "
      "Eliminate all canvas-blurred raster text, custom scrollbar artifacts, yellow/blue debug underlines, corner DEBUG "
      "ribbons, and glass-pane overlays, replacing them with razor-sharp native vector UI typography and crisp 1px borders."
      if has_flutter
      else "DOM ARTIFACT PURGE (MANDATORY): Strip all original brand logos, watermarks, cookie banners, floating chat bubbles, "
      "and compression artifacts, replacing them with crisp, studio-grade vector UI components and bespoke graphics."
  )

  notes_clause = f" Additional Visual Inspection Notes from Source Band: {visual_notes.strip()}." if visual_notes.strip() else ""

  sections = [
      f"[1. USE CASE, STANCE DIAL & ORTHOGRAPHIC FRAMING] Use case: ui-mockup. Generate a crystal-clear 2K lossless UI design variant for {surface_spec}. "
      f"Stance Dial: {stance_dial:.2f} ({stance_tier}) — {stance_desc} "
      f"Target Style Stance: {stance['id']} ({stance['label']}). Flat full-bleed orthographic screen capture with zero device bezel, zero browser window chrome, and zero 3D desk perspective.",
      f"[2. IMAGE-TO-IMAGE CONDITIONING ROLES] {cond_role}",
      f"[3. TEXTURAL & MATERIAL WORLD (VOICE 1)] {stance['voice_textural']}",
      f"[4. LIVE GOOGLE FONTS & 4-SURFACE CSS-TO-2K SCALE LOCK (VOICE 2)] {stance['voice_designer']} {scale_block} Strictly exclude original fonts ({avoid_font_str}). Never print font family names or pixel numbers as visible UI text.",
      f"[5. 8-TOKEN WCAG-VERIFIED CHROMATIC SYSTEM] Primary background {stance['bg_primary']}, elevated card/module surface {stance['bg_elevated']}, primary ink {stance['text_primary']}, secondary muted ink {stance['text_secondary']}, primary accent {stance['accent_primary']} (with {stance['accent_on_primary']} label ink), secondary accent {stance['accent_secondary']}, and 1px hairline border {stance['border_hairline']}. Never print hex strings on screen.",
      f"[6. FRONTEND DEVELOPER GRID & OPTICAL PADDING (VOICE 3)] {stance['voice_developer']}",
      f"[7. ANTI-REGRESSION COMPLEXITY & INTERACTIVE WIDGET LOCK] Preserve 100% of the visual richness and information density of the reference image ({band_dom_ctx['overlapping_sections_count']} DOM sections overlapped). Explicitly render in the new style stance: {band_dom_ctx['complexity_mandate']}.{notes_clause} NEVER simplify rich charts, code blocks, tables, or 3D graphics into empty placeholder boxes.",
      f"[8. ORDERED REGION-BY-REGION VERBATIM NEW COPY] {copy_block}",
      f"[9. FLUTTER & ARTIFACT REMEDIATION] {flutter_block}",
      f"[10. HARD ANTI-CLONE & ANTI-LEAKAGE EXCLUSIONS] Reproduce 0% of the original text, brand names, or logos (strictly forbidden phrases: {forbidden_sample}). Zero middle dots between links, zero FIG 0.1 labels, zero gibberish pseudo-Latin.",
  ]
  return " ".join(sections)


def audit_pre_generation_prompts(plan: dict[str, Any]) -> dict[str, Any]:
  """Verifies that the upfront prompt architecture is 100% tight BEFORE calling Nano Banana 2.1."""
  pal = plan["variant_constitution"]["palette"]
  fonts = plan["variant_constitution"]["fonts"]
  avoid_fonts_lower = {f.lower() for f in plan["original_avoid"].get("fonts", [])}

  body_contrast = wcag_contrast(pal["text_primary"], pal["bg_primary"])
  muted_contrast = wcag_contrast(pal["text_secondary"], pal["bg_primary"])
  card_contrast = wcag_contrast(pal["text_primary"], pal["bg_elevated"])
  cta_contrast = wcag_contrast(pal["accent_on_primary"], pal["accent_primary"])

  issues: list[str] = []
  if body_contrast < 4.5:
    issues.append(f"text_primary vs bg_primary contrast {body_contrast}:1 < 4.5:1")
  if muted_contrast < 4.5:
    issues.append(f"text_secondary vs bg_primary contrast {muted_contrast}:1 < 4.5:1")
  if card_contrast < 4.5:
    issues.append(f"text_primary vs bg_elevated contrast {card_contrast}:1 < 4.5:1")
  if cta_contrast < 4.5:
    issues.append(f"accent_on_primary vs accent_primary contrast {cta_contrast}:1 < 4.5:1")

  if fonts["primary"].lower() in avoid_fonts_lower:
    issues.append(f"Primary font {fonts['primary']} collides with original avoid_fonts")
  if fonts["secondary"].lower() in avoid_fonts_lower:
    issues.append(f"Secondary font {fonts['secondary']} collides with original avoid_fonts")

  required_tags = [
      "[1. USE CASE, STANCE DIAL & ORTHOGRAPHIC FRAMING]",
      "[2. IMAGE-TO-IMAGE CONDITIONING ROLES]",
      "[3. TEXTURAL & MATERIAL WORLD (VOICE 1)]",
      "[4. LIVE GOOGLE FONTS & 4-SURFACE CSS-TO-2K SCALE LOCK (VOICE 2)]",
      "[5. 8-TOKEN WCAG-VERIFIED CHROMATIC SYSTEM]",
      "[6. FRONTEND DEVELOPER GRID & OPTICAL PADDING (VOICE 3)]",
      "[7. ANTI-REGRESSION COMPLEXITY & INTERACTIVE WIDGET LOCK]",
      "[8. ORDERED REGION-BY-REGION VERBATIM NEW COPY]",
      "[9. FLUTTER & ARTIFACT REMEDIATION]",
      "[10. HARD ANTI-CLONE & ANTI-LEAKAGE EXCLUSIONS]",
  ]
  for j in plan["jobs"]:
    ptxt = j.get("prompt", "")
    missing = [t for t in required_tags if t not in ptxt]
    if missing:
      issues.append(f"{j['slug']} missing prompt sections: {missing}")

  return {
      "passed": len(issues) == 0,
      "wcag_contrast": {
          "body_on_bg": body_contrast,
          "muted_on_bg": muted_contrast,
          "body_on_card": card_contrast,
          "label_on_accent_cta": cta_contrast,
      },
      "estimated_palette_delta_e": pal.get("estimated_min_delta_e", 0.0),
      "font_collision_free": fonts["primary"].lower() not in avoid_fonts_lower and fonts["secondary"].lower() not in avoid_fonts_lower,
      "all_10_sections_present": len(issues) == 0,
      "issues": issues,
  }


def write_variation_blueprint_md(study: pathlib.Path, plan: dict[str, Any], preflight: dict[str, Any]) -> pathlib.Path:
  bp_path = study / "variants" / "variation-blueprint.md"
  pal = plan["variant_constitution"]["palette"]
  fonts = plan["variant_constitution"]["fonts"]
  persona = plan["variant_constitution"]["brand_persona"]
  orig = plan["original_avoid"]
  wcag = preflight["wcag_contrast"]

  lines = [
      f"# Pre-Generation Variation Blueprint (`{persona['brand_name']}`)",
      "",
      "> Built and locked **ahead of time** before calling Nano Banana 2.1 so the image-to-image transfer has a complete, non-regressing specification while conditioning on the captured screenshots.",
      "",
      "## 1. Stance Dial, Reinvention Mode & Style Stance Lock",
      f"- **Source URL**: `{plan.get('source_url')}`",
      f"- **Variation Stance Dial**: `{plan['stance_dial']:.2f}` (`{plan['stance_tier']}`)",
      f"- **Reinvention Mode**: `{plan.get('reinvention_mode')}` — *{plan.get('reinvention_mode_label')}*",
      f"- **Target Design Style Stance (`comp_and_art_direction`)**: `{pal['id']}` — *{pal['label']}*",
      f"- **Original -> Variant Polarity**: `{pal.get('original_polarity', 'unknown')}` -> `{pal['polarity']}`",
      f"- **Estimated Palette Shift ($\\Delta E^*_{{ab}}$)**: `{pal.get('estimated_min_delta_e', 0.0)}`",
      f"- **Flutter / Artifact Remediation Active**: `{plan.get('has_flutter')}`",
      "",
      "### Core Creative & Reinvention Directive",
      f"> {plan.get('reinvention_core_directive')}",
      "",
      "## 2. Original vs. Variant Token & Typography Matrix",
      "",
      "| Dimension | Original Site (Forbidden / Avoid) | Pre-Architected Variant Specification | Pre-Flight Gate |",
      "| :--- | :--- | :--- | :--- |",
      f"| **Brand & Copy** | `{orig.get('forbidden_copy_count', 0)}` extracted DOM phrases | **{persona['brand_name']}** — *{persona['hero_h1']}* | `0% overlap` |",
      f"| **Primary Headline Font** | `{', '.join(orig.get('fonts', [])[:4]) or 'system'}` | **{fonts['primary']}** (live Google Fonts + 4-surface scale) | `Disjoint` |",
      f"| **Companion UI/Body Font** | `{', '.join(orig.get('fonts', [])[4:8]) or 'system'}` | **{fonts['secondary']}** + **{fonts['mono']}** (`tabular-nums`) | `Disjoint` |",
      f"| **Primary Background** | `{', '.join(orig.get('bg_colors', [])[:3]) or 'n/a'}` | `{pal['bg_primary']}` (Elevated card: `{pal['bg_elevated']}`) | `WCAG {wcag['body_on_bg']}:1` |",
      f"| **Primary & Muted Ink** | `{', '.join(orig.get('text_colors', [])[:3]) or 'n/a'}` | `{pal['text_primary']}` / `{pal['text_secondary']}` | `WCAG {wcag['muted_on_bg']}:1` |",
      f"| **Primary & Secondary Accent** | Original brand accents | `{pal['accent_primary']}` (CTA ink `{pal['accent_on_primary']}`) + `{pal['accent_secondary']}` | `WCAG {wcag['label_on_accent_cta']}:1` |",
      "",
      "## 3. Per-Band Screenshot Conditioning & Anti-Regression Plan",
      "",
      "| Pass | Band Slug | Reference Image(s) Attached | Observed Band Complexity Mandate | Prompt File |",
      "| :---: | :--- | :--- | :--- | :--- |",
  ]
  for j in plan["jobs"]:
    refs = ", ".join(f"`{r}`" for r in j["reference_images"])
    comp = j["dom_complexity"]["complexity_mandate"]
    lines.append(f"| Pass {j['pass']} | `{j['slug']}` | {refs} | {comp} | [`{j['prompt_md']}`](../{j['prompt_md']}) |")

  lines.append("")
  bp_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
  return bp_path


def magick_identify(path: pathlib.Path) -> tuple[int, int, str]:
  out = subprocess.run(
      [MAGICK, "identify", "-format", "%w %h %m", str(path) + "[0]"],
      capture_output=True,
      text=True,
      check=True,
  ).stdout.split()
  return int(out[0]), int(out[1]), out[2].upper()


def build_mobile_cross_conditioning_plate(
    mob_src: pathlib.Path,
    desk_var_anchor: pathlib.Path,
    cond_out: pathlib.Path,
) -> bool:
  if not mob_src.exists() or not desk_var_anchor.exists():
    return False
  mw, mh, _ = magick_identify(mob_src)
  strip_h = max(160, round(mh * 0.12))
  cond_out.parent.mkdir(parents=True, exist_ok=True)
  r = subprocess.run(
      [
          MAGICK,
          "(",
          str(desk_var_anchor),
          "-colorspace",
          "sRGB",
          "-filter",
          "Lanczos",
          "-resize",
          f"{mw}x{strip_h}^",
          "-gravity",
          "North",
          "-extent",
          f"{mw}x{strip_h}",
          ")",
          "(",
          str(mob_src),
          "-colorspace",
          "sRGB",
          "-filter",
          "Lanczos",
          "-resize",
          f"{mw}x{mh - strip_h}!",
          ")",
          "-append",
          str(cond_out),
      ],
      capture_output=True,
      text=True,
  )
  return r.returncode == 0


def cmd_plan(args: argparse.Namespace) -> int:
  study = pathlib.Path(args.study_dir).expanduser().resolve()
  audit_path = study / "dom" / "dom-audit.json"
  if not audit_path.exists():
    print(json.dumps({"passed": False, "error": f"Missing {audit_path}; run capture_url_devtools_and_dom.mjs first."}, indent=2))
    return 1

  audit = json.loads(audit_path.read_text(encoding="utf-8"))
  stance_dial, stance_tier, stance_desc = resolve_stance_dial(args.stance_dial)
  reinvention_mode = resolve_reinvention_mode(stance_dial, args.reinvention_mode)
  stance = select_style_stance(
      audit.get("avoid_bg_colors", []),
      audit.get("avoid_text_colors", []),
      stance_dial,
      args.style_stance if args.style_stance and args.style_stance != "auto" else None,
  )
  fonts = resolve_live_fonts_and_scale(stance, audit.get("avoid_fonts", []))

  persona = dict(DEFAULT_BRAND_PERSONAS[0 if not args.persona_index else int(args.persona_index) % len(DEFAULT_BRAND_PERSONAS)])
  if args.persona_json and pathlib.Path(args.persona_json).exists():
    # Agent-authored persona (preferred): new brand + copy that stays in the source's subject category
    persona = {**persona, **json.loads(pathlib.Path(args.persona_json).read_text(encoding="utf-8"))}
  if args.brand_name:
    persona["brand_name"] = args.brand_name.strip()
  if args.hero_h1:
    persona["hero_h1"] = args.hero_h1.strip()

  visual_notes_map: dict[str, str] = {}
  if args.visual_notes_json and pathlib.Path(args.visual_notes_json).exists():
    try:
      visual_notes_map = json.loads(pathlib.Path(args.visual_notes_json).read_text(encoding="utf-8"))
    except Exception:
      pass

  variants_dir = study / "variants"
  tiles_out_dir = variants_dir / "tiles"
  prompts_dir = variants_dir / "prompts"
  variants_dir.mkdir(parents=True, exist_ok=True)
  tiles_out_dir.mkdir(parents=True, exist_ok=True)
  prompts_dir.mkdir(parents=True, exist_ok=True)

  jobs: list[dict[str, Any]] = []
  desktop_anchor_out_rel = (
      "variants/desktop-variant-2k.png"
      if int(args.max_bands_per_surface) == 1
      else "variants/tiles/desktop-variant-band-01.png"
  )

  for surface in ("desktop", "mobile"):
    surf_info = audit.get(surface, {})
    raw_bands = surf_info.get("bands", [])
    if int(args.max_bands_per_surface) == 1:
      # Single-variant mode: 1 Desktop variant (16:9 hero 2K) + 1 Mobile variant (9:16 hero 2K).
      # Nano Banana's tallest supported aspect is 9:16, so a 1:6 full-length page cannot be a single plate;
      # the full-length capture is attached as a secondary complexity reference instead.
      hero_2k_rel = surf_info.get("hero_2k_png", f"captures/{surface}-base-hero-2k.png")
      full_rel = surf_info.get("fullpage_png", f"captures/{surface}-fullpage.png")
      src_for_single = hero_2k_rel if (study / hero_2k_rel).exists() else full_rel
      tw, th = (2752, 1536) if surface == "desktop" else (1536, 2752)
      bands = [
          {
              "index": 1,
              "file": src_for_single,
              "fullpage_ref": full_rel,
              "scroll_y_css": 0,
              "phys_w": tw,
              "phys_h": th,
              "crop_top_phys_for_stitch": 0,
              "effective_phys_h_for_stitch": th,
          }
      ]
    else:
      bands = raw_bands[: int(args.max_bands_per_surface)] if int(args.max_bands_per_surface) > 0 else raw_bands

    total_bands = len(bands)
    vp_h_css = 900 if surface == "desktop" else 844

    for b in bands:
      idx = int(b["index"])
      slug = f"{surface}-variant-band-{idx:02d}"
      src_rel = b["file"]
      out_rel = f"variants/tiles/{slug}.png"
      raw_rel = f"variants/tiles/{slug}.raw.png"
      prompt_rel = f"variants/prompts/{slug}.md"

      band_dom_ctx = slice_band_dom_context(surf_info, int(b.get("scroll_y_css", (idx - 1) * vp_h_css)), vp_h_css)
      v_note = visual_notes_map.get(slug, args.visual_notes or "")

      prompt_txt = build_deep_10_section_prompt(
          surface=surface,
          band_index=idx,
          total_bands=total_bands,
          stance_dial=stance_dial,
          stance_tier=stance_tier,
          stance_desc=stance_desc,
          reinvention_mode=reinvention_mode,
          stance=stance,
          fonts=fonts,
          persona=persona,
          band_dom_ctx=band_dom_ctx,
          has_flutter=bool(audit.get("has_flutter")),
          avoid_fonts=audit.get("avoid_fonts", []),
          forbidden_phrases=audit.get("forbidden_copy_phrases", []),
          visual_notes=v_note,
      )

      ew, eh = int(b["phys_w"]), int(b["phys_h"])
      if surface == "desktop" and idx == 1:
        ref_imgs = [src_rel]
        pass_num = 1
      elif surface == "desktop":
        ref_imgs = [src_rel, desktop_anchor_out_rel]
        pass_num = 1
      else:
        ref_imgs = [src_rel, "variants/tiles/desktop-variant-band-01.png"]
        pass_num = 2

      job = {
          "slug": slug,
          "pass": pass_num,
          "surface": surface,
          "band_index": idx,
          "total_bands": total_bands,
          "source": src_rel,
          "reference_images": ref_imgs,
          "output": out_rel,
          "raw_output": raw_rel,
          "prompt_md": prompt_rel,
          "expected_px": f"{ew}x{eh}",
          "crop_top_phys_for_stitch": int(b.get("crop_top_phys_for_stitch", 0)),
          "effective_phys_h_for_stitch": int(b.get("effective_phys_h_for_stitch", eh)),
          "dom_complexity": band_dom_ctx,
          "image_size": "2k",
          "prompt": prompt_txt,
          "gempix_cmd": f'{GEMPIX} --input_image="{study / src_rel}" --output_image="{study / raw_rel}" --image_size=2k --prompt="{prompt_txt}"',
          "status": "planned",
      }
      (study / prompt_rel).write_text(
          f"# {slug} — Pass {pass_num} Nano Banana 2.1 Deep Transfer Prompt\n\n"
          f"- **Pass**: `Pass {pass_num} ({'Desktop Anchor/Bands' if pass_num == 1 else 'Mobile Cross-Conditioned on Mobile Capture + Desktop Variant'})`\n"
          f"- **Surface**: `{surface}` (band {idx} of {total_bands})\n"
          f"- **Stance Dial**: `{stance_dial:.2f}` (`{stance_tier}`)\n"
          f"- **Reinvention Mode**: `{reinvention_mode['id']}` ({reinvention_mode['label']})\n"
          f"- **Style Stance (`comp_and_art_direction`)**: `{stance['id']}` ({stance['label']})\n"
          f"- **Reference Image(s)**: {', '.join(f'`{r}`' for r in ref_imgs)}\n"
          f"- **Target Output**: `{out_rel}` (`{ew}x{eh}`)\n"
          f"- **Variant Brand**: `{persona['brand_name']}`\n"
          f"- **Live Google Fonts**: `{fonts['primary']}` (Headline) + `{fonts['secondary']}` (Companion Body/UI) + `{fonts['mono']}` (Telemetry)\n"
          f"- **Observed Band Complexity Lock**: `{band_dom_ctx['complexity_mandate']}`\n\n"
          f"## 10-Section Deep Transfer Prompt\n\n```text\n{prompt_txt}\n```\n",
          encoding="utf-8",
      )
      jobs.append(job)

  plan = {
      "created_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
      "study_dir": str(study),
      "source_url": audit.get("url"),
      "has_flutter": bool(audit.get("has_flutter")),
      "artifacts_detected": audit.get("artifacts_detected", []),
      "stance_dial": stance_dial,
      "stance_tier": stance_tier,
      "stance_description": stance_desc,
      "reinvention_mode": reinvention_mode["id"],
      "reinvention_mode_label": reinvention_mode["label"],
      "reinvention_core_directive": reinvention_mode["core_directive"],
      "style_stance": stance["id"],
      "original_avoid": {
          "fonts": audit.get("avoid_fonts", []),
          "bg_colors": audit.get("avoid_bg_colors", []),
          "text_colors": audit.get("avoid_text_colors", []),
          "forbidden_copy_count": len(audit.get("forbidden_copy_phrases", [])),
      },
      "variant_constitution": {
          "brand_persona": persona,
          "palette": stance,
          "fonts": fonts,
      },
      "outputs": {
          "variation_blueprint_md": "variants/variation-blueprint.md",
          "desktop_variant_fullpage": "variants/desktop-variant-fullpage.png",
          "mobile_variant_fullpage": "variants/mobile-variant-fullpage.png",
          "desktop_variant_2k": "variants/desktop-variant-2k.png",
          "mobile_variant_2k": "variants/mobile-variant-2k.png",
          "comparison_contact_sheet": "variants/comparison-contact-sheet.jpg",
      },
      "calls": len(jobs),
      "pass_1_desktop_calls": sum(1 for j in jobs if j["pass"] == 1),
      "pass_2_mobile_calls": sum(1 for j in jobs if j["pass"] == 2),
      "jobs": jobs,
  }

  preflight = audit_pre_generation_prompts(plan)
  plan["preflight_prompt_audit"] = preflight
  bp_path = write_variation_blueprint_md(study, plan, preflight)

  plan_file = variants_dir / "variant-plan.json"
  plan_file.write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8")
  print(
      json.dumps(
          {
              "passed": preflight["passed"],
              "plan_file": str(plan_file),
              "variation_blueprint_md": str(bp_path),
              "preflight_prompt_audit": preflight,
              "stance_dial": stance_dial,
              "stance_tier": stance_tier,
              "reinvention_mode": reinvention_mode["id"],
              "style_stance": stance["id"],
              "style_stance_label": stance["label"],
              "estimated_palette_delta_e": stance.get("estimated_min_delta_e"),
              "brand_name": persona["brand_name"],
              "fonts": f"{fonts['primary']} + {fonts['secondary']} ({fonts['mono']})",
              "calls_total": len(jobs),
              "pass_1_desktop_calls": plan["pass_1_desktop_calls"],
              "pass_2_mobile_calls": plan["pass_2_mobile_calls"],
          },
          indent=2,
      )
  )
  return 0 if preflight["passed"] else 1


def cmd_audit_prompts(args: argparse.Namespace) -> int:
  study = pathlib.Path(args.study_dir).expanduser().resolve()
  plan_file = study / "variants" / "variant-plan.json"
  if not plan_file.exists():
    print(json.dumps({"passed": False, "error": "Run `plan` first."}, indent=2))
    return 1
  plan = json.loads(plan_file.read_text(encoding="utf-8"))
  preflight = audit_pre_generation_prompts(plan)
  print(json.dumps(preflight, indent=2))
  return 0 if preflight["passed"] else 1


def lock_band(study: pathlib.Path, job: dict[str, Any]) -> bool:
  raw = study / job["raw_output"]
  out = study / job["output"]
  src = raw if raw.exists() else out
  if not src.exists():
    return False
  ew, eh = job["expected_px"].split("x")
  r = subprocess.run(
      [
          MAGICK,
          str(src),
          "-colorspace",
          "sRGB",
          "-strip",
          "-filter",
          "Lanczos",
          "-resize",
          f"{ew}x{eh}!",
          "-unsharp",
          "0x0.55+0.45+0.008",
          str(out),
      ],
      capture_output=True,
      text=True,
  )
  if r.returncode == 0 and raw.exists() and raw != out:
    raw.unlink(missing_ok=True)
  return r.returncode == 0


def stitch_surface_variants(study: pathlib.Path, plan: dict[str, Any]) -> dict[str, Any]:
  summary: dict[str, Any] = {}
  for surface, target_2k in (("desktop", (2752, 1536)), ("mobile", (1536, 2752))):
    s_jobs = [j for j in plan["jobs"] if j["surface"] == surface]
    s_jobs.sort(key=lambda x: int(x["band_index"]))
    if not s_jobs:
      continue
    if not all((study / j["output"]).exists() for j in s_jobs):
      continue
    stitch_inputs: list[str] = []
    temp_trims: list[pathlib.Path] = []
    for j in s_jobs:
      band_out = study / j["output"]
      crop_top = int(j.get("crop_top_phys_for_stitch", 0))
      eff_h = int(j.get("effective_phys_h_for_stitch", 0))
      ew = int(j["expected_px"].split("x")[0])
      if crop_top > 0 and eff_h > 0:
        trim_p = band_out.with_name(f"__stitch_trim_{j['slug']}.png")
        subprocess.run(
            [MAGICK, str(band_out), "-crop", f"{ew}x{eff_h}+0+{crop_top}", "+repage", str(trim_p)],
            check=True,
        )
        stitch_inputs.append(str(trim_p))
        temp_trims.append(trim_p)
      else:
        stitch_inputs.append(str(band_out))

    full_out = study / plan["outputs"][f"{surface}_variant_fullpage"]
    full_out.parent.mkdir(parents=True, exist_ok=True)
    if len(stitch_inputs) == 1:
      subprocess.run([MAGICK, stitch_inputs[0], "-colorspace", "sRGB", str(full_out)], check=True)
    else:
      subprocess.run([MAGICK, *stitch_inputs, "-colorspace", "sRGB", "-append", str(full_out)], check=True)

    for tp in temp_trims:
      tp.unlink(missing_ok=True)

    hero_band = study / s_jobs[0]["output"]
    hero_2k = study / plan["outputs"][f"{surface}_variant_2k"]
    tw, th = target_2k
    subprocess.run(
        [
            MAGICK,
            str(hero_band),
            "-colorspace",
            "sRGB",
            "-strip",
            "-filter",
            "Lanczos",
            "-resize",
            f"{tw}x{th}!",
            str(hero_2k),
        ],
        check=True,
    )
    fw, fh, _ = magick_identify(full_out)
    summary[surface] = {
        "fullpage_variant": str(full_out.relative_to(study)),
        "fullpage_px": f"{fw}x{fh}",
        "hero_2k_variant": str(hero_2k.relative_to(study)),
        "hero_2k_px": f"{tw}x{th}",
        "bands_stitched": len(s_jobs),
    }

  comp_jpg = study / plan["outputs"]["comparison_contact_sheet"]
  desk_orig = study / "captures" / "desktop-fullpage.png"
  desk_var = study / plan["outputs"]["desktop_variant_fullpage"]
  mob_orig = study / "captures" / "mobile-fullpage.png"
  mob_var = study / plan["outputs"]["mobile_variant_fullpage"]
  if desk_orig.exists() and desk_var.exists() and mob_orig.exists() and mob_var.exists():
    subprocess.run(
        [
            MAGICK,
            "(",
            str(desk_orig),
            "-resize",
            "1200x>",
            "-bordercolor",
            "#18181b",
            "-border",
            "8x8",
            ")",
            "(",
            str(desk_var),
            "-resize",
            "1200x>",
            "-bordercolor",
            "#10b981",
            "-border",
            "8x8",
            ")",
            "(",
            str(mob_orig),
            "-resize",
            "600x>",
            "-bordercolor",
            "#18181b",
            "-border",
            "8x8",
            ")",
            "(",
            str(mob_var),
            "-resize",
            "600x>",
            "-bordercolor",
            "#10b981",
            "-border",
            "8x8",
            ")",
            "-background",
            "#0c0c0b",
            "+append",
            "-quality",
            "92",
            str(comp_jpg),
        ],
        check=True,
    )
    summary["comparison_contact_sheet"] = str(comp_jpg.relative_to(study))

  return {"passed": "desktop" in summary and "mobile" in summary, **summary}


def cmd_run(args: argparse.Namespace) -> int:
  study = pathlib.Path(args.study_dir).expanduser().resolve()
  plan_file = study / "variants" / "variant-plan.json"
  if not plan_file.exists():
    print(json.dumps({"passed": False, "error": "Run `plan` first."}, indent=2))
    return 1
  plan = json.loads(plan_file.read_text(encoding="utf-8"))
  route = args.route.lower()
  which_pass = args.run_pass.lower()

  results = []
  desk_anchor = study / "variants" / "tiles" / "desktop-variant-band-01.png"

  for job in plan["jobs"]:
    if which_pass == "desktop" and job["surface"] != "desktop":
      continue
    if which_pass == "mobile" and job["surface"] != "mobile":
      continue
    if args.only_slug and args.only_slug not in job["slug"]:
      continue

    src = study / job["source"]
    raw = study / job["raw_output"]
    out = study / job["output"]
    entry = {"slug": job["slug"], "pass": job.get("pass"), "surface": job["surface"], "output": job["output"]}

    input_for_gempix = src
    cond_tmp: pathlib.Path | None = None
    if job["surface"] == "mobile" and desk_anchor.exists():
      cond_tmp = study / "variants" / "tiles" / f"__cond_{job['slug']}.png"
      if build_mobile_cross_conditioning_plate(src, desk_anchor, cond_tmp):
        input_for_gempix = cond_tmp
        entry["conditioned_with_desktop_variant"] = str(desk_anchor.relative_to(study))

    if route == "gempix":
      if not pathlib.Path(GEMPIX).exists():
        entry["error"] = f"{GEMPIX} binary not found; generate {job['output']} via image-generator subagent (passing reference_images={job['reference_images']}) and run --route=manual"
        results.append(entry)
        continue
      r = subprocess.run(
          [
              GEMPIX,
              f"--input_image={input_for_gempix}",
              f"--output_image={raw}",
              f"--image_size={job['image_size']}",
              f"--prompt={job['prompt']}",
          ],
          capture_output=True,
          text=True,
      )
      if cond_tmp and cond_tmp.exists():
        cond_tmp.unlink(missing_ok=True)
      if r.returncode != 0:
        entry["error"] = (r.stderr or r.stdout)[-400:]
        results.append(entry)
        continue
      entry["locked"] = lock_band(study, job)
    else:
      if cond_tmp and cond_tmp.exists():
        cond_tmp.unlink(missing_ok=True)
      if raw.exists() or out.exists():
        entry["locked"] = lock_band(study, job)
      else:
        entry["error"] = f"Missing {job['output']} (or {job['raw_output']}); render it first."
    job["status"] = "locked" if entry.get("locked") else "failed"
    results.append(entry)

  plan_file.write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8")
  stitch_res = stitch_surface_variants(study, plan)
  ok = all(r.get("locked") for r in results) and len(results) > 0
  print(json.dumps({"passed": ok, "route": route, "pass": which_pass, "jobs": results, "stitch": stitch_res}, indent=2))
  return 0 if ok else 1


def cmd_stitch(args: argparse.Namespace) -> int:
  study = pathlib.Path(args.study_dir).expanduser().resolve()
  plan_file = study / "variants" / "variant-plan.json"
  if not plan_file.exists():
    print(json.dumps({"passed": False, "error": "Run `plan` first."}, indent=2))
    return 1
  plan = json.loads(plan_file.read_text(encoding="utf-8"))
  for job in plan["jobs"]:
    if lock_band(study, job):
      job["status"] = "locked"
  plan_file.write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8")
  res = stitch_surface_variants(study, plan)
  print(json.dumps(res, indent=2))
  return 0 if res.get("passed") else 1


def main() -> int:
  ap = argparse.ArgumentParser(description="Upfront Variation Prompt Architect, Pre-Flight Auditor, and 2-Pass Runner.")
  sub = ap.add_subparsers(dest="cmd", required=True)

  p_plan = sub.add_parser("plan")
  p_plan.add_argument("--study-dir", required=True)
  p_plan.add_argument("--stance-dial", type=float, default=0.65, help="Variation stance dial 0.10..1.00 (default 0.65)")
  p_plan.add_argument(
      "--reinvention-mode",
      default="auto",
      choices=["auto"] + sorted(REINVENTION_MODES.keys()),
      help="Creative reinvention philosophy: 'central-idea-reinterpretation', 'total-reinvention', 'subtle-sibling', or 'auto' (selected from --stance-dial)",
  )
  p_plan.add_argument(
      "--style-stance",
      default="auto",
      choices=["auto"] + sorted(STYLE_STANCES.keys()),
      help="Named Design Style Stance (or 'auto' to pick highest contrast vs original)",
  )
  p_plan.add_argument(
      "--max-bands-per-surface",
      type=int,
      default=1,
      help="Maximum variant plates per surface (default 1 = exactly 1 Desktop variant + 1 Mobile variant; set 0 for all bands)",
  )
  p_plan.add_argument("--brand-name", default="")
  p_plan.add_argument("--hero-h1", default="")
  p_plan.add_argument("--persona-index", type=int, default=0)
  p_plan.add_argument(
      "--persona-json",
      default="",
      help="Agent-authored persona JSON (brand_name, tagline, nav_items, hero_eyebrow, hero_h1, hero_sub, primary_cta, secondary_cta, metrics, section_blueprints)",
  )
  p_plan.add_argument("--visual-notes", default="", help="Detailed visual inspection notes from read_file on source captures")
  p_plan.add_argument("--visual-notes-json", default="", help="Optional JSON mapping band slug -> detailed visual notes")

  p_audit = sub.add_parser("audit-prompts")
  p_audit.add_argument("--study-dir", required=True)

  p_run = sub.add_parser("run")
  p_run.add_argument("--study-dir", required=True)
  p_run.add_argument("--route", choices=["gempix", "manual"], default="gempix")
  p_run.add_argument("--pass", dest="run_pass", choices=["all", "desktop", "mobile"], default="all")
  p_run.add_argument("--only-slug", default="")

  p_stitch = sub.add_parser("stitch")
  p_stitch.add_argument("--study-dir", required=True)

  args = ap.parse_args()
  if args.cmd == "plan":
    return cmd_plan(args)
  if args.cmd == "audit-prompts":
    return cmd_audit_prompts(args)
  if args.cmd == "run":
    return cmd_run(args)
  if args.cmd == "stitch":
    return cmd_stitch(args)
  return 1


if __name__ == "__main__":
  sys.exit(main())
