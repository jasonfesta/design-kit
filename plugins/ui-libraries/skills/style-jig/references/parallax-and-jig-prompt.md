# Design Kit Jig + Kinetic Scroll Parallax Engine — Master Prompt

## Copy-Pasteable Prompt

```markdown
Build a standalone, full-viewport **Kinetic Scroll Parallax Typography & Frosted-Button Stage** connected directly to the borderless **Design Kit Jig** harness. Keep the solo parallax canvas locked to **pure `#000000` black** across all styles for crisp typographic contrast, with zero idle bobbing at rest, GPU-only `translate3d` transforms, and an optional transparent overlay mode (`.transparent-over-shader`) when composited above a 3D or shader canvas.

### 1. Stage Environment & 4 Story Beat Sections (`100vw × 100vh`)
- **Pure Black Scroll Canvas (`.kp-scroll-canvas`)**:
  - Mount full-bleed (`position: fixed; inset: 0; width: 100vw; height: 100vh; overflow-y: auto; overflow-x: hidden; background: #000000;`) with hidden scrollbars (`scrollbar-width: none;` and `::-webkit-scrollbar { display: none; }`).
  - Keep `#000000` locked regardless of active Jig style so typography and buttons retain `>= 4.5:1` contrast (only switch to `background: transparent` when `.transparent-over-shader` is enabled for layering over 3D/shaders).
- **4 Full-Viewport Sections (`.kp-section[data-k-section]`)**:
  - Each section uses `min-height: 100%; padding: 84px clamp(44px, 6vw, 88px); display: flex; flex-direction: column; justify-content: center; gap: 22px;`, alternating left-aligned and `.centered` (`align-items: center; text-align: center;`).
  - Tag every animated element with `data-k-role` (`headline`, `body`, `button`) and `will-change: transform`:
    1. **Beat 1 (Left-aligned, 3 stacked `.kp-headline-line` spans, `data-line-idx="0..2"`)**: Oversized display lines (`clamp(48px, 5.2vw, 74px)`, `line-height: 0.96`, `letter-spacing: -0.03em`) + body copy (`max-width: 44ch`, `17px`, `line-height: 1.54`) + frosted glass pill CTA (`scroll next`, smooth-scrolls to the next `.kp-section`).
    2. **Beat 2 (Centered, 2 split `.kp-headline-line` spans, `data-line-idx="0..1"`)**: Split display lines that fan apart above and below the viewport horizon and converge cleanly into alignment at optical center + body copy + `scroll next`.
    3. **Beat 3 (Left-aligned, 5 inline `.kp-word` spans inside `.kp-word-row`, `data-line-idx="0..4"`)**: Word-level staggered parallax (`clamp(38px, 4vw, 54px)`, `line-height: 1.04`, `gap: 10px 14px`) where scroll velocity amplifies standing wave motion + body copy + `scroll next`.
    4. **Beat 4 (Centered, 2 finale `.kp-headline-line` spans, `data-line-idx="0..1"`)**: Closing beat + body copy + `back to top` button smoothly scrolling the container back to `scrollTop: 0`.
  - **Frosted Pill Buttons (`.kp-pill-btn`)**: `border-radius: 999px; background: rgba(245, 242, 235, 0.09); backdrop-filter: blur(14px); box-shadow: inset 0 0 0 1px rgba(245, 242, 235, 0.28), 0 8px 24px rgba(0, 0, 0, 0.16); font-size: 13.5px; font-weight: 500;`. Optically center every `<button>` vertically `-2px` down (`padding: 13px 24px 9px`).

### 2. Calm Scroll-Responsive Parallax & Magnetic Hover Physics (`requestAnimationFrame`)
- **Default Parameters (`KP_DEFAULTS`)**:
  - `headSpeed: -0.09`, `lineSpread: 12`, `bodySpeed: -0.04`, `btnSpeed: 0.08`, `scrubLerp: 0.12`, `oscAmp: 0` *(zero idle bobbing by default)*, `oscFreq: 0.35`, `oscPhase: 0.75`, `velBoost: 1.0`, `hoverLift: -4`, `magPull: 0.14`.
- **Per-Frame Update Loop (`stepKineticTracker`)**:
  - **Smoothed Scroll & Velocity**:
    - `smoothY += (scroller.scrollTop - smoothY) * scrubLerp`
    - `instVel = Math.abs(smoothY - lastSmoothY)`
    - `velocity += (instVel - velocity) * 0.15`
    - `scrollEnergy = Math.min(1, velocity / 2.2)`
    - `velFactor = 1 + Math.min(2.5, (velocity / 18) * velBoost)`
  - **Optical-Center Normalization per Section**:
    - `correctedTop = sec.offsetTop - smoothY`
    - `p = clamp((vh - correctedTop) / (vh + secH), 0, 1)`
    - `c = (p - 0.5) * 2` *(so `c = 0` locks split lines cleanly together at optical viewport center)*
  - **Role-Based Differential Depth**:
    - `headline`: `parallaxY = -c * vh * headSpeed + (c * lineIdx * lineSpread)`
    - `body`: `parallaxY = -c * vh * bodySpeed`
    - `button`: `parallaxY = -c * vh * btnSpeed` *(moves subtly opposite to headlines for foreground depth)*
  - **Velocity-Gated Standing Wave (Zero Idle Motion)**:
    - `oscY = oscAmp * scrollEnergy * velFactor * Math.sin(2 * Math.PI * oscFreq * tSec + elemIdx * oscPhase)`
  - **Magnetic Cursor Pull & Hover Lift**:
    - Track pointer offset `(dx, dy)` relative to each `[data-k-role]` element's bounding-box center on `pointermove`.
    - `targetX = hovered ? dx * magPull : 0`; `targetY = hovered ? (dy * magPull + hoverLift) : 0`.
    - Smoothly damp each frame: `curX += (targetX - curX) * 0.16`; `curY += (targetY - curY) * 0.16`.
  - **Single Compositor Write**:
    - Apply `el.style.transform = translate3d(${curX.toFixed(2)}px, ${(parallaxY + oscY + curY).toFixed(2)}px, 0)`.
    - Under `prefers-reduced-motion: reduce`, freeze parallax, wave, and magnetic offsets to `0` while keeping smooth section readability.
- **Optional 3D/Shader Layer Bridge**:
  - When mounted as `.transparent-over-shader`, emit `{ type: 'IMMERSIVE_SCROLL', smoothY, progress: clamp(smoothY / maxScroll, 0, 1) }` each frame and forward non-button pointer moves/clicks (`{ type: 'IMMERSIVE_POINTER', nx, ny, click }`) to the canvas beneath.

### 3. Connected Design Kit Jig Harness (`z-index: 9999`)
- **Top-Left Style Bar (`clone`, `clean`, `grid`, `editorial`, `cinematic`, `product`, `brutal`, `playful`, `retro`)**:
  - Borderless monochrome Jig bar (`JetBrains Mono`, `12px–13.5px`, symmetric `5px` active pill padding, `-2px` optical button vertical centering).
  - Live-switches headline & body typography and CTA shape while keeping the `#000000` black stage locked: `clone` / `editorial` (`Fraunces` + `Schibsted Grotesk`), `clean` (`Schibsted Grotesk`), `grid` (`Instrument Sans` + `IBM Plex Mono`), `cinematic` (`Syne` + `Instrument Sans`), `product` (`Instrument Sans`), `brutal` (`IBM Plex Mono`, `0px` radius, `#C8FF2E` accent), `playful` (`Bricolage Grotesque` + `Instrument Sans`), `retro` (`Fraunces` + `IBM Plex Mono`).
- **Collapsible Parallax Inspector Panel (`#kpDesignKitPanel`, `width: 256px`, collapsible via `hide` / `show` into an inline top-bar chip)**:
  - **6 Horizontal Scrub-Bar Sliders** (pointer-capture drag with live fill bar and right-aligned `tabular-nums` value):
    1. `head speed` (`-0.60` to `0.60`, default `-0.09`)
    2. `line spread` (`0` to `56`, default `12`)
    3. `body speed` (`-0.50` to `0.50`, default `-0.04`)
    4. `btn speed` (`-0.50` to `0.60`, default `0.08`)
    5. `scroll wave` (`0.0` to `24.0`, default `0.0`)
    6. `hover lift` (`-18.0` to `0.0`, default `-4.0`)
  - **`auto-scroll` Toggle Row (`off` / `on`)**: Drives frame-rate-independent (`dt`-based `240px/sec` accumulator) ping-pong scrolling cleanly between top and bottom without stalling under GPU load.
  - **Footer Controls**: `copy` (copies serialized parameter readout to clipboard with `copied` confirmation) and `reset` (restores `KP_DEFAULTS`, stops `auto-scroll`, and returns `scrollTop` + `smoothY` to `0`).
- **Bottom-Left Motion-Craft Bar (`play` `▶` Auto-Traveler)**:
  - Clicking `play` auto-detects the active `.kp-scroll-canvas` container and smoothly ping-pongs through all 4 story beats (`240px/sec` `dt`-scaled); clicking Stop or manually scrolling immediately pauses playback and returns control to the user.

Typography: Fraunces (400 display headlines) + Schibsted Grotesk (400/500 body & pill CTAs) + JetBrains Mono (500 Jig bars & tabular-nums readouts, >= 12px)
Color (Pure #000000 Dark Stage — locked for kinetic typography contrast across styles, optional transparent overlay over 3D/shader): brand Signal Emerald #10B981 (oklch(0.70 0.17 162)), accent Ember Amber #F59E0B (oklch(0.77 0.16 70)), bg #000000, text #F5F2EB, muted rgba(245, 242, 235, 0.72)
Build: Vanilla JS / React 19 `requestAnimationFrame` kinetic tracker (CSS `translate3d` GPU-only transforms, pointer-capture scrub sliders, `prefers-reduced-motion` gate) + `lucide-react` icons
Avoid: purple/violet/blue layout skins; Material fonts; idle floating/bobbing when scroll velocity is 0; changing the solo parallax background away from #000000; eyebrow descriptors or fake FPS/status chrome; uncentered buttons (shift labels -2px down)
```
