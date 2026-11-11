# 07. YouTube & YouTube Studio Design System (`yt-spec` v2.0.279)

- **Carbon Design System ID**: `designSystems/6a965cee65b87233` (`Version v2.0.279` — `platform: web`, `output: mss_vars / typescript_constants`)
- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/youtube/versions/v2_0/sass_maps/` (`_yt-ref-color-constants.scss`, `_yt-sys-color-baseline.scss`)
  - `//depot/google3/ux/tokens/design_systems/youtube/versions/v2_0/mss_vars/declarations.scss`
  - `//depot/google3/video/youtube/src/web/` & `//depot/google3/video/youtube/creator/` (YouTube Watch & YouTube Studio Creator NLE / Analytics)
- **Internal Documentation**: go/yt-tokens · go/youtube-web
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**YouTube (`yt-spec` v2.0.279)** is Google's high-contrast media, playback, creator analytics, and non-linear video editing (`YouTube Studio Editor`) design system:

1. **Cinema-Black `#0F0F0F` + Additive Alpha Surfaces**: Anchors media viewports in pure `#0F0F0F` (`base-background`) so video frames, waveforms, and thumbnails command 100% chromatic authority, using `#212121` raised cards and `rgba(255,255,255,0.10)` (`additive-background`) translucent chips.
2. **High-Signal Playhead Red + Creator CTA Blue + Retention Green**: Pairs unmistakable `#FF0033` (`baseline-red-youtube-red`) live/playhead scrubbers with `#3EA6FF` (`#065FD4` light) creator call-to-action links, `#2BA640` retention/monetization gains, and `#007A65` (`genai-1` teal) AI cut/caption markers (`0% purple`).
3. **4-Zone Studio Editor & Analytics Architecture**: Top Studio bar (`56px`), Upper Split (`16:9` Timecode Preview Monitor + Real-Time Retention & Clip Repurposing Inspector), and Bottom Multi-Track Video / Audio Waveform / AI Caption Timeline.

---

## 2. Verbatim Google3 Token Reference (`v2_0/sass_maps`)

| CSS Custom Property | Google3 `yt` Token | Dark Hex (Cinema) | Light Hex | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--yt-spec-base-background` | `base-background (grey5)` | `#0F0F0F` | `#FFFFFF` | Outer cinema/studio NLE canvas |
| `--yt-spec-raised-background` | `raised-background` | `#212121` | `#F8F8F8` | Inspector panels, cards & timeline track bed |
| `--yt-spec-additive-background` | `white1-alpha10 / black-alpha5` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.05)` | `8px`-radius filter chips & timecode pills |
| `--yt-spec-brand-red` | `baseline-red-youtube-red` | `#FF0033` | `#FF0033` | Playhead scrubber, live REC badge |
| `--yt-spec-call-to-action` | `baseline-blue-light/dark-blue` | `#3EA6FF` | `#065FD4` | Track selection, analytics curve & links |
| `--yt-spec-badge-green` | `baseline-green-light/dark-green` | `#2BA640` | `#107516` | Published status, above-average retention |
| `--yt-spec-badge-teal` | `baseline-teal70 / genai-1` | `#007A65` | `#007A65` | AI auto-cut & caption highlight clip |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **YouTube `yt-spec`** for non-linear video/audio editors, waveform annotation suites, creator analytics, and social media studios:
- **`#34` PULSE AI Video Editor, Repurposing & Social Scheduler (`10/10` Difficulty)**: Exact match for the 4-pane dark NLE timeline, `#FF0033` playhead scrubber, AI highlight clips (`#007A65` / `#2BA640`), 9:16 short repurposing preview, and social campaign scheduler.
- **`#31` Synchronized Audio-Conditioned Testing Platform**: Acoustic waveform scrubbing, timecode markers, and locked playback controls.
- **`#33` Four Rivers Media Studio** & **`#36` SycaPost Creator Feed**: Rich dark media framing and high-engagement creator metrics.
