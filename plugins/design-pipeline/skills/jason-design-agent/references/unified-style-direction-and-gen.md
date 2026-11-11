# Simplified & Unified `style-direction` and `image-gen` Pipeline Specification

This document codifies the updated workflow for **Style Range**, **Comprehensive Style Prompts**, **Font Selection**, and **Multi-Range 1K Generation** (`nanofy` vs `research` paths):

---

## 1. Style Range & Comprehensive Style Prompts (`style-direction`)

Whether starting from a **research path** (URLs/benchmarks) or a **nanofy path** (external plate intake), `style-direction` synthesizes the inputs into distinct **Style Ranges**:
- **Source Mapping**: 
  - *Research path*: Each shared URL or benchmark becomes the foundational seed for a distinct style range.
  - *Nanofy path*: Each incoming designer plate represents a foundational style range.
- **Comprehensive Style Prompt**: For each style range, Jetski writes a deeply detailed, comprehensive master art-direction prompt. This long-form prompt exhausts every facet of the aesthetic: exact physical surface metaphors, lighting quality/direction, photographic grain, material depth, chromatic temperature, layout rhythm, and spatial cadence.
- **Font Selection**: At this exact moment, live `google-font-selection` is executed for each range, locking a **Primary headline font**, a **Secondary body/UI font**, and an optional **Tertiary font** (or clean weight variation) tuned specifically to that range's emotional register.

---

## 2. Initial 1K Image Generation (`image-gen` — Multi-Range 1K)

- **One Per Range**: Instead of generating a single default direction, `image-gen` renders an initial **1K desktop view** and **1K mobile view** for **each style range**.
- **Nanofy Path Rule**: When running `nanofy`, the Nano Banana re-outputs are generated with strict mathematical invariants: **90% existing structure/layout preserved** and **10% unique stylistic mutation** driven directly by the new comprehensive style prompt.
- **Research Path Rule**: When running from research URLs, each shared URL generates its corresponding desktop and mobile 1K concept plate for that range.

---

## 3. Designer Review & Downstream Expansion

- **Approval Gate**: The designer reviews the side-by-side 1K desktop and mobile examples across all style ranges.
- **Polish & Tout Steering**: Once a specific range is selected and approved, `polish` fine-tunes individual touts (hero, cards, features, footers) using targeted competitor solutions.
- **Full Suite Expansion**: Upon final approval of the core 1K pages, generation expands to the full application screens, components, and interactive experiences for the approved direction, followed by publishing the `#0c0c0b` lowercase moodboard for `jason-dev-agent`.
