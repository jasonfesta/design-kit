# uilabs — Mariana Castilho (uilabs.dev)

> **URL:** https://uilabs.dev · **Author:** Mariana Castilho (@mrncst, Product Designer at poolside) · **Captured:** 2026-11-11

## What
"Small laboratory of fine UI" — **56 components** (cards, toolbars, widgets) plus templates, built with **React + Tailwind + Framer Motion** (one with Radix). Each entry has a short design rationale, often including why she *wouldn't* ship it.

## Catalog (homepage highlights)
| Component | Idea | Stack |
| :--- | :--- | :--- |
| Two-Step Popover | Popover that transitions into a second step in place | react, tailwind, motion |
| Action Toolbar | Toolbar that changes state to notify (e.g. commit failed) and offer actions | react, tailwind, motion |
| Dynamic Settings | Settings panel with smooth transitions and elegant blur | react, tailwind, motion |
| Contextual Toolbar | Suggests actions based on the current route without leaving context | react, tailwind, motion |
| Beta Feedback | Reuses an existing component to collect feedback without a modal | react, radix, motion |
| Calendar Widget | Clear time-zone differences, "In 15 mins" meeting card | react, tailwind, motion |
| Flexible Tags Container | Container grows/shrinks as tags change (rationale: jumpy positions → not for prod) | react, tailwind, motion |
| Elastic Card | Card actions trigger a playful informative stretch | react, tailwind, motion |
| Animated Cards | Tiny set of animated showcase cards | react, tailwind |
| Dynamic Header Dropdown · Dynamic Footer Widget · Parameters iOS Slider | Morphing headers/footers, iOS-style parameter slider | react, tailwind, motion |

## What to borrow
- **Morph-in-place** (popover → step 2, toolbar → status) instead of opening new surfaces.
- Writing **"why I wouldn't ship this"** next to experiments — good habit for our critique notes.
