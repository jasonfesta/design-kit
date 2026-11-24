# Motion & animation libraries

Everything for **UI motion** (springs, layout, gestures), **timeline / scroll choreography**, **vector & interactive animation formats** (Lottie, Rive), **text & number motion**, **smooth scroll**, **native web APIs**, and **tuning / authoring tools**.

- **Golden Template default:** CSS transitions + `motion` (import from `motion/react`) for springs/layout/exit. Reach for GSAP for timelines and scroll-scrubbed storytelling.
- Decide *whether* to animate first: `animate`, `remove-animations`, `emil-design-eng` skills (motion-craft plugin). Performance: `animation-performance` skill.
- `★★★` industry standard · `★★` solid · `★` young / design-forward. Stars approximate (late 2026).

**Count: 72 entries.**

---

## 1. Core UI animation engines

| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Motion** (ex-Framer Motion) | `motion` (`motion/react`, `motion/mini`) | MIT | Springs, gestures, layout/shared-layout (`layoutId`), `AnimatePresence`, scroll, hardware-accelerated WAAPI | ★★★ ~30k★ | Default React motion; exit animations; layout morphs | `npm i motion` |
| **Motion+ / Motion Studio** | motion.dev/plus | Commercial | Premium components (Ticker, Carousel, Cursor, AnimateNumber, Typewriter), VS Code transition editor, examples | ★★ | Pro snippets and visual curve editing | per site |
| **GSAP** | `gsap` (+ `@gsap/react`) | Free "no-charge" Standard License (all plugins free since 2025, Webflow) | Timelines, ScrollTrigger, SplitText, MorphSVG, DrawSVG, Flip, Draggable, Inertia, ScrollSmoother, MotionPath, CustomEase | ★★★ ~23k★ | Choreographed sequences, scroll storytelling, SVG morphs, Awwwards sites | `npm i gsap @gsap/react` |
| **React Spring** | `@react-spring/web` (+`/three`) | MIT | Physics springs as hooks (`useSpring`, `useTransition`, `useTrail`) | ★★★ ~29k★ | Physics-first React, R3F springs | `npm i @react-spring/web` |
| **anime.js v4** | `animejs` | MIT | Modular ESM engine: timelines, `createScope`, draggable, `onScroll`, text split, WAAPI mode, springs | ★★★ ~66k★ | Framework-agnostic timelines, small bundle | `npm i animejs` |
| **Popmotion** | `popmotion` | MIT | Low-level animation functions (`animate`, `spring`, `inertia`) — engine under early Framer Motion | ★★ ~20k★ (legacy, low activity) | Custom vanilla physics; prefer `motion` now | `npm i popmotion` |
| **AutoAnimate** | `@formkit/auto-animate` | MIT | One-line add/remove/move animations for lists | ★★★ ~13k★ | Zero-config list transitions | `npm i @formkit/auto-animate` |
| **Motion One** | merged into `motion` (vanilla `animate()`) | MIT | WAAPI-based tiny animate | — | Vanilla JS sites | `npm i motion` |
| **Velocity / Mo.js** | `@mojs/core` | MIT | Burst/shape motion graphics | ★★ ~18k★ (low activity) | Celebratory bursts | `npm i @mojs/core` |
| **Tween.js** | `@tweenjs/tween.js` | MIT | Simple tweening (common in three.js scenes) | ★★★ ~10k★ | Camera tweens in three | `npm i @tweenjs/tween.js` |
| **Theatre.js** | `@theatre/core` `@theatre/studio` (+`@theatre/r3f`) | Apache-2.0 (core) / AGPL (studio) | Visual timeline editor for DOM + three.js keyframes | ★★ ~12k★ (slower releases) | Cinematic R3F camera/scene sequencing | `npm i @theatre/core @theatre/studio` |
| **Remotion** | `remotion` | Source-available (company license >3 people) | Programmatic video in React | ★★★ ~25k★ | Rendering marketing videos from components | `npx create-video@latest` |
| **Motion Canvas** | `@motion-canvas/core` | MIT | Code-driven animated explainers/vector video | ★★ ~17k★ | Explainer videos | `npm init @motion-canvas@latest` |
| **Revideo** | `@revideo/core` | MIT | Motion Canvas fork for programmatic rendering | ★ | API-rendered video | `npm init @revideo@latest` |

## 2. React Native / Expo motion

| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Reanimated 4** | `react-native-reanimated` | MIT | UI-thread worklets, CSS-style transitions/animations in RN | ★★★ ~10k★ | All Expo motion (see `animate-expo`) | `npx expo install react-native-reanimated` |
| **Gesture Handler** | `react-native-gesture-handler` | MIT | Native gestures | ★★★ | Drag/swipe in RN | `npx expo install react-native-gesture-handler` |
| **Moti** | `moti` | MIT | Framer-Motion-like API over Reanimated | ★★ ~4k★ | Declarative RN motion | `npm i moti` |
| **React Native Skia** | `@shopify/react-native-skia` | MIT | GPU 2D drawing + shaders in RN | ★★★ ~7k★ | Shader/graphics UI on native | `npx expo install @shopify/react-native-skia` |

## 3. Vector / interactive animation formats

| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **dotLottie (web)** | `@lottiefiles/dotlottie-react` (`@lottiefiles/dotlottie-web`) | MIT | ThorVG/WASM renderer for `.lottie` + `.json`; theming, state machines, multi-animation | ★★★ | Default Lottie player in 2026 (faster/smaller than lottie-web) | `npm i @lottiefiles/dotlottie-react` |
| **lottie-web** | `lottie-web` / `lottie-react` | MIT | Original Airbnb After Effects player | ★★★ ~31k★ | Legacy compat | `npm i lottie-react` |
| **Lottie creator / LottieFiles** | lottiefiles.com | free/commercial | 100k+ free animations, editor, prompt-to-Lottie | ★★★ | Sourcing micro-illustration motion | — |
| **Rive** | `@rive-app/react-canvas` (or `-webgl2`) | MIT runtime; editor commercial | Interactive state-machine vector animations with data binding, scripting | ★★★ | Interactive mascots, onboarding, game-like UI, animated icons with logic | `npm i @rive-app/react-canvas` |
| **SVGator / Jitter / Haiku** | svgator.com · jitter.video | Commercial | Visual SVG / motion design export (CSS/Lottie/video) | ★★ | Designers authoring without code | — |
| **Spline (2D/3D interactive)** | `@splinetool/react-spline` | proprietary runtime (MIT wrapper) | Interactive 3D scenes with states/events | ★★★ | 3D hero objects authored visually (see [3d.md](3d.md)) | `npm i @splinetool/react-spline` |
| **useAnimations** | `react-useanimations` | MIT | Lottie-driven micro-interaction icons | ★★ | Animated icon set (see [icons.md](icons.md)) | `npm i react-useanimations` |

## 4. Text, number & micro-motion

| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NumberFlow** | `@number-flow/react` | MIT | Digit-rolling number transitions with Intl formatting (Max Barvian) | ★★★ ~6k★ | Prices, KPIs, counters | `npm i @number-flow/react` |
| **Torph** | `torph` (`torph/react`, `torph/vue`, `torph/svelte`) · [local](sources/torph/README.md) · `torph` skill | MIT | Dependency-free text & place-value number morphing (grapheme/word diff, `cursorIndex` caret mode, multi-line, springs, a11y + reduced motion) | ★★ ~1.6k★ (`0.1.4`) | Button labels ("Copy" → "Copied"), live KPIs/tickers, editable numeric fields, inline rewrites | `npm i torph` |
| **Motion `AnimateNumber` / `Typewriter`** | `motion-plus` | Commercial | Motion+ text components | ★★ | If already on Motion+ | per site |
| **GSAP SplitText** | `gsap/SplitText` | GSAP license (free) | Char/word/line splitting with masks, autoSplit on resize | ★★★ | Editorial headline reveals | `npm i gsap` |
| **SplitType** | `split-type` | MIT | Split text into lines/words/chars | ★★ | Splitting for motion/anime.js | `npm i split-type` |
| **Splitting.js** | `splitting` | MIT | CSS-variable splitting for CSS-only effects | ★★ | CSS stagger via `--char-index` | `npm i splitting` |
| **use-scramble / scramble-text** | `use-scramble` | MIT | Decode/scramble text effect | ★ | Hacker/terminal reveals | `npm i use-scramble` |
| **Typed.js / TypeIt** | `typed.js` · `typeit` | GPL-3.0 (v3) / GPL+commercial | Typewriter effect | ★★★ | Typing headlines | `npm i typed.js` |
| **react-fast-marquee** | `react-fast-marquee` | MIT | Infinite marquee | ★★ | Logo walls | `npm i react-fast-marquee` |
| **canvas-confetti** | `canvas-confetti` | ISC | Confetti bursts | ★★★ ~11k★ | Success celebration (use rarely) | `npm i canvas-confetti` |
| **tw-animate-css** | `tw-animate-css` | MIT | Tailwind v4 animation utilities (shadcn replacement for tailwindcss-animate) | ★★ | shadcn enter/exit utilities | `npm i -D tw-animate-css` |
| **Animate.css** | `animate.css` | Hippocratic | Classic CSS keyframe classes | ★★★ ~82k★ | Quick prototypes only | `npm i animate.css` |

## 5. Scroll, smooth-scroll & page transitions

| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Lenis** | `lenis` (`lenis/react`) | MIT | Smooth scroll that plays nice with sticky & ScrollTrigger | ★★★ ~10k★ | Awwwards-style scroll feel | `npm i lenis` |
| **GSAP ScrollTrigger / ScrollSmoother** | `gsap` | GSAP license | Pinning, scrubbing, snapping | ★★★ | Scroll storytelling | `npm i gsap` |
| **Motion `useScroll` / `scroll()`** | `motion` | MIT | Scroll-linked values, uses ScrollTimeline when possible | ★★★ | Simple parallax/progress | `npm i motion` |
| **CSS Scroll-driven animations** | native `animation-timeline: scroll() / view()` | web std | Off-main-thread scroll animations | Chrome/Edge stable, Safari 26 | Progress bars, reveals with zero JS | — |
| **View Transitions API** | native `document.startViewTransition`, `@view-transition`, `view-transition-name` | web std | Same-document + cross-document (MPA) morphs | Baseline (same-doc) 2025; cross-doc Chrome/Safari | Page/route morphs, shared-element transitions | — |
| **React `<ViewTransition>`** | `react` (canary/19.2+) | MIT | Declarative view transitions with Suspense/transitions | ★★ experimental→stable | Route morphs in React/Next | `npm i react@canary` |
| **glimm** | `glimm` (`glimm/react`, `glimm/next`) · [local](sources/glimm/README.md) · `glimm` skill | MIT | WebGL color-sweep page transitions + `GlimmScope` (HTML-in-Canvas bend + View Transitions masking); zero runtime deps (~11 KB) | ★ (0.4.1) | Editorial/marketing route sweeps or rare in-app milestones (avoid purple presets; use `lagoon`/`citrus`/`ember` or brand `accentChain`) | `npm i glimm` |
| **Next.js view transitions** | `next-view-transitions` | MIT | VT for App Router | ★★ | Next.js route morphs | `npm i next-view-transitions` |
| **Barba.js / Swup / Taxi** | `@barba/core` · `swup` · `@unseenco/taxi` | MIT | MPA page transitions | ★★ | Static/Webflow-like sites | `npm i swup` |
| **Locomotive Scroll v5** | `locomotive-scroll` | MIT | Lenis-based scroll + in-view detection | ★★ | Agency sites | `npm i locomotive-scroll` |

## 6. Ready-made motion component collections

| Name | URL | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Motion Primitives** | motion-primitives.com | MIT | Text effect, morphing dialog, magnetic, dock, spotlight, in-view | ★★ ~5k★ | Tasteful motion building blocks | `npx motion-primitives@latest add morphing-dialog` |
| **Motion examples** | motion.dev/examples | MIT / Plus | 300+ copy-paste Motion snippets (React/JS/Vue) | ★★★ | Starting point for any Motion pattern | copy |
| **Animate UI** | animate-ui.com | MIT | Animated primitives, text, icons, backgrounds | ★★ | Animated shadcn | `npx shadcn add @animate-ui/<name>` |
| **React Bits** | reactbits.dev | MIT + Commons Clause | Text animations, shader backgrounds, cursors | ★★★ | Splash effects | `npx shadcn add @react-bits/<name>` |
| **Magic UI / Aceternity** | magicui.design · ui.aceternity.com | MIT | Marketing motion (see [ui-primitives.md](ui-primitives.md)) | ★★★ | Landing hero motion | registry |
| **Fluid Functionalism springs** | `@fluid` (local) | MIT | `spring.fast/moderate/slow` presets | local | House spring feel | registry |
| **Emil's Animations on the Web examples** | animations.dev | course | Family drawer, Dynamic Island, nav menu, SVG walkthroughs | ★★★ | Reference implementations | course |
| **Codrops demos** | tympanus.net/codrops | per demo (MIT mostly) | GSAP/WebGL creative demos | ★★★ | Creative scroll & WebGL techniques | GitHub |

## 7. Tuning, debugging & authoring tools

| Name | Package / URL | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DialKit** | `dialkit` | MIT | Live tuning panel (dials, springs, colors) for React/Solid/Svelte/Vue (Josh Puckett) | ★ | Tuning springs/params live (used by thisiswhitespace) | `npm i dialkit motion` |
| **Leva** | `leva` | MIT | GUI panel for React (pmndrs) | ★★★ ~5k★ | Tweaking three/R3F params | `npm i leva` |
| **Tweakpane** | `tweakpane` | MIT | Compact vanilla GUI | ★★★ ~4k★ | Non-React tuning | `npm i tweakpane` |
| **lil-gui** | `lil-gui` | MIT | dat.gui successor (three.js examples) | ★★★ | Quick three.js GUIs | `npm i lil-gui` |
| **Lapse** | aiforui.dev | course tool | Emil's animation review / slow-mo tool | ★ | Frame-reviewing animations | course |
| **Motion AI Kit** (`npx motion-ai`) | `motion-ai` (14.2.0) · `motion` skill · `motion-reviewer` agent · `motion` MCP (`https://mcp.motion.dev`) | MIT | Motion best practices, docs search, CSS `linear()` springs, MotionScore audits (Motion+ MCP parked in `mcp_config.optional.json`) | installed | Spring → CSS, Motion docs, perf audits | `motion-craft` plugin |
| **cubic-bezier.com / easings.net / easing.dev** | web | — | Curve design & reference | ★★★ | Picking easings | — |
| **Linear() easing generator** | linear-easing-generator.netlify.app (Jake Archibald) | — | Springs/bounces as CSS `linear()` | ★★ | CSS-only springs | — |
| **Chrome DevTools Animations panel** | built-in | — | Scrub, slow down, inspect | ★★★ | Debugging timing | — |
| **Framer** | framer.com | commercial | Visual site builder with production motion | ★★★ | Prototyping motion feel quickly | — |
| **Jitter / Rive editor / After Effects + Bodymovin** | web/desktop | commercial | Authoring motion assets | ★★★ | Designer-authored assets | — |

## 8. Shader / generative backgrounds (motion-adjacent)

| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Paper Shaders** | `@paper-design/shaders-react` | Apache-2.0 (npm) | Zero-dep GPU shader backgrounds (mesh gradient, grain, dithering, metaballs, liquid metal) | ★★ ~2k★ | Premium animated gradients without three.js | `npm i @paper-design/shaders-react` |
| **ShaderGradient** | `@shadergradient/react` | MIT | Animated 3D gradient (R3F) | ★★ | Stripe-like gradients | `npm i @shadergradient/react` |
| **Unicorn Studio** | unicorn.studio | commercial | No-code WebGL effects embeds | ★★ | Designer-authored WebGL heroes | embed |
| **Vanta.js** | `vanta` | MIT | Animated 3D backgrounds (three/p5) | ★★ (dated) | Quick demo backgrounds | `npm i vanta` |
| **Granim / whatamesh (Stripe gradient)** | `granim` | MIT | Gradient animations | ★ | Lightweight gradients | `npm i granim` |
| **tsParticles** | `@tsparticles/react` | MIT | Particle systems | ★★★ ~8k★ | Particle backgrounds (use sparingly) | `npm i @tsparticles/react @tsparticles/slim` |

---

## Decision rubric
| Need | Pick |
| :--- | :--- |
| Hover / press / small enter | CSS transitions (`transform`, `opacity`), custom `cubic-bezier` |
| Exit animations, layout morphs, gestures | `motion` |
| Choreographed timeline / scroll storytelling / SVG morph | `gsap` (+ScrollTrigger, SplitText, Flip) |
| Lists appearing/disappearing, zero effort | `@formkit/auto-animate` |
| Numbers / labels changing | `@number-flow/react`, `torph` |
| Designer-authored illustration | dotLottie (linear) or Rive (interactive/stateful) |
| Route/page morphs | View Transitions API / React `<ViewTransition>` |
| Smooth scroll | `lenis` |
| Tuning values live | `dialkit` (UI), `leva` (3D) |
