# Flutter, Canvas & DOM Artifact Remediation (`url-variant`)

When capturing live URLs from Google Chrome DevTools, pages built with **Flutter Web**, **Canvas/WebGL frameworks**, or site builders often exhibit structural and visual artifacts in both the DOM and screenshot captures. `url-variant` automatically detects these in [capture_url_devtools_and_dom.mjs](../scripts/capture_url_devtools_and_dom.mjs) and purges them during Nano Banana 2.1 generation.

---

## 1. How `capture_url_devtools_and_dom.mjs` Handles Flutter & Shadow DOMs

1. **Automatic Semantics Activation**:
   - Flutter Web renders into a `<flt-glass-pane>` shadow root or `<flutter-view>` / `<flt-scene-host>` canvas and hides its accessible DOM tree until `flt-semantics-placeholder` is triggered.
   - `capture_url_devtools_and_dom.mjs` automatically clicks `flt-semantics-placeholder` (`[aria-label="Enable accessibility"]`) during hydration and walks all open Shadow DOM roots (`el.shadowRoot`) so `dom/desktop-dom.txt` and `dom/mobile-dom.txt` capture `flt-semantics` text, headings, buttons, and ARIA labels even on canvas-rendered Flutter apps.
2. **Dual-Mode Full-Page Scrolling (`window.scrollTo` + `Input.dispatchMouseEvent` `mouseWheel`)**:
   - Standard DOM pages scroll via `window.scrollTo(0, y)`, whereas Flutter Web canvas scrollers intercept wheel events inside `<flt-glass-pane>`.
   - When `hasFlutter` is detected, the capture script dispatches native CDP `Input.dispatchMouseEvent` (`type: "mouseWheel"`) deltas between viewport captures so long-form Flutter pages advance cleanly down the scroll.
3. **Fixed Header De-Duplication**:
   - After Band `01` (top hero + navbar) is captured, fixed and sticky topbars (`position: fixed | sticky` near `top: 0`) are hidden for bands `02..NN` and restored afterward, preventing repeated navbars stamped across every mid-page slice.

---

## 2. Artifacts Catalogued in `dom/dom-audit.json` & Purged in the Variant

| Artifact Type | Detection Signal in DOM / Screenshot | Remediation in Nano Banana 2.1 Variant Prompt |
| :--- | :--- | :--- |
| **`flutter_web_canvas`** | `<flt-glass-pane>`, `<flutter-view>`, `<flt-scene-host>`, or `flt-*` custom elements | Replaces soft canvas-rasterized text, custom Flutter scrollbars, and yellow/blue debug underlines with razor-sharp native vector UI typography and crisp `1px` CSS borders. |
| **`watermark_or_debug_badge`** | Flutter top-right `DEBUG` ribbon, `Made in Webflow`, `Made in Framer`, `Built with Flutter` pills | Completely strips all framework badges, corner ribbons, and builder watermarks. |
| **`cookie_or_chat_overlay`** | `#onetrust-consent-sdk`, `#CybotCookiebotDialog`, Intercom/Crisp chat launchers | Hidden via injected CSS before capture AND banned in the variant prompt so zero floating banners obscure the UI. |
| **`original_brand_and_copy`** | All text nodes, SVG wordmarks, and product names in `desktop-dom.txt` and `mobile-dom.txt` | Added to `forbidden_copy_phrases` and replaced 100% with the new variant brand persona, new headlines, and new domain telemetry. |
| **`original_fonts_and_colors`** | Top computed `fontFamily`, `backgroundColor`, and `color` values in `dom-audit.json` | Added to `avoid_fonts`, `avoid_bg_colors`, and `avoid_text_colors`; replaced with a high-contrast palette ($\Delta E \ge 22$) and fresh Google Fonts. |
