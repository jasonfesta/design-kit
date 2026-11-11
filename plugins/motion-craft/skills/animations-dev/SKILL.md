---
name: animations-dev
description: Emil Kowalski's web animation philosophy, decision framework, easing curves, spring physics, gesture mechanics, choreography, performance rules, and UI polish from animations.dev and aiforui.dev. Routes to and synthesizes emil-design-eng, animate, review-animations, improve-animations, animation-performance, choreograph, gestures, animation-vocabulary, find-animation-opportunities, remove-animations, and animate-expo. Use whenever applying animations.dev principles, designing web motion, choosing easing/duration/springs, or auditing UI animation craft.
---

# Animations on the Web (`animations.dev`)

This skill provides full access to **Emil Kowalski's `animations.dev` & `aiforui.dev` design engineering suite** installed in WDA.

## Core Quick-Reference Principles

1. **Frequency Gate (Should It Animate At All?)**:
   - **100+ times/day** (keyboard shortcuts, command palette toggle): **No animation. Ever.**
   - **Tens of times/day** (hover effects, list navigation): Near-imperceptible (`100–160ms`) or none.
   - **Occasional** (modals, drawers, toasts): Standard purposeful animation (`150–250ms`, max `< 300ms`).
   - **Rare / First-time** (onboarding, celebration): Delight budget lives here.
2. **Custom Easing Curves (Never Built-in `ease-in` on UI)**:
   ```css
   --ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* Entering / exiting UI */
   --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* On-screen morphing / movement */
   --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);  /* iOS-style drawer / sheet curve */
   ```
3. **Origins, Scale & Properties**:
   - Animate **`transform` and `opacity` only** (plus `clip-path: inset(...)` for reveals/tabs/hold-to-confirm). Never `transition: all`.
   - **Never animate from `scale(0)`** — start from `scale(0.95)` + `opacity: 0`.
   - **Origin-aware popovers**: Set `transform-origin: var(--transform-origin)` anchored to the trigger (modals stay centered).
   - **Responsive press feedback**: `transform: scale(0.97)` on `:active` (`100–160ms ease-out`).
   - **Interruptibility**: Use CSS transitions or springs (`{ type: "spring", duration: 0.5, bounce: 0.2 }`) instead of keyframes for rapidly triggered UI.
   - **Pointer & Reduced Motion Gating**: Gate `:hover` transforms behind `@media (hover: hover) and (pointer: fine)` and ship `@media (prefers-reduced-motion: reduce)` fallbacks.

## Installed Companion Skills in WDA (`.agents/skills/`)

- **[`emil-design-eng`](../emil-design-eng/SKILL.md)** — Complete design engineering philosophy, review table format, Sonner principles, [`ui-cheatsheet.md`](../emil-design-eng/ui-cheatsheet.md), and [`performance-cheatsheet.md`](../emil-design-eng/performance-cheatsheet.md).
- **[`animate`](../animate/SKILL.md)** + **[`RECIPES.md`](../animate/RECIPES.md)** — Step-by-step animation builder and copy-ready recipes (buttons, dropdowns, tooltips, modals, drawers, toasts, accordions, stagger, hold-to-confirm, tab indicators, scroll reveals, drag-to-dismiss).
- **[`review-animations`](../review-animations/SKILL.md)** + **[`STANDARDS.md`](../review-animations/STANDARDS.md)** — Strict animation code reviewer with `Before | After | Why` tables.
- **[`improve-animations`](../improve-animations/SKILL.md)** + **[`AUDIT.md`](../improve-animations/AUDIT.md)** — Codebase-wide motion audit and prioritized execution plans.
- **[`animation-performance`](../animation-performance/SKILL.md)** — Frame-budget diagnostics, composite-only properties, off-main-thread CSS/WAAPI vs JS, and Motion 14.2+ hardware acceleration.
- **[`choreograph`](../choreograph/SKILL.md)** + **[`RECIPES.md`](../choreograph/RECIPES.md)** — Multi-element staging, lead/follow hierarchy, and stagger timing (`30–80ms`).
- **[`gestures`](../gestures/SKILL.md)** — 1:1 finger tracking, velocity dismissal (`velocity > 0.11`), boundary damping, pointer capture, and multi-touch protection.
- **[`find-animation-opportunities`](../find-animation-opportunities/SKILL.md)** & **[`remove-animations`](../remove-animations/SKILL.md)** — Identify high-value motion opportunities or strip sluggish/unnecessary animations.
- **[`animation-vocabulary`](../animation-vocabulary/SKILL.md)** — Reverse-lookup glossary for motion effects.
- **[`apple-design`](../apple-design/SKILL.md)** & **[`mobile-native`](../mobile-native/SKILL.md)** — Apple fluid motion principles and native-feeling mobile web fixes.
- **[`animate-expo`](../animate-expo/SKILL.md)** — React Native & Expo Reanimated/Gesture Handler motion.
- **[`pick-ui-library`](../pick-ui-library/SKILL.md)** — Curated UI library selector (`base-ui`, `cmdk`, `Sonner`, `input-otp`, `motion`, `NumberFlow`, `torph`, `Cobe`, `shiki`, `Liveline`, `recharts`, `dnd kit`, `Virtuoso`, `zustand`, `clsx`, `cva`, `next-themes`).
