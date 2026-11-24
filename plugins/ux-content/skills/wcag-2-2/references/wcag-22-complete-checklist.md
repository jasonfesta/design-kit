# WCAG 2.2 Complete Checklist

Use this checklist for full WCAG 2.2 reviews, acceptance criteria, backlog creation, design-system coverage, and A/AA/AAA gap analysis. It covers the 86 active success criteria. 4.1.1 Parsing is removed in WCAG 2.2 and is listed only as legacy context.

Levels are cumulative: AA includes A; AAA includes A and AA. Automation coverage is a planning signal, not a verdict: High means many failures can be detected automatically, Medium means automation can assist, Low means human judgment is dominant.

## Review Keys

| Key | Meaning |
|---|---|
| Design | Visible layout, interaction, content behavior, and state requirements. |
| Content | Words, alternatives, media assets, labels, help, and editorial rules. |
| Frontend | Semantics, programmatic relationships, focus, keyboard behavior, and dynamic updates. |
| Test | Primary manual or automated validation action. |
| Auto | Expected automated coverage: High, Medium, or Low. |

## Perceivable

| SC | Level | Pass condition | Main obligations | Test | Auto |
|---|---:|---|---|---|---|
| 1.1.1 Non-text Content | A | Meaningful non-text content has an equivalent purpose in text; decorative/invisible content is ignored. | Content: write alternatives. Frontend: expose or hide correctly. Design: avoid unexplained visual-only meaning. | Inspect images, icons, controls, charts, CAPTCHA, SVG, canvas, and decorative assets. | Medium |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | Prerecorded audio-only has an equivalent text alternative; prerecorded video-only has text or audio equivalent. | Content: provide transcripts or audio tracks. Design: label media alternatives. | Compare transcript/track against the media outcome. | Low |
| 1.2.2 Captions (Prerecorded) | A | Prerecorded synchronized media has captions for all audio information. | Content: captions include speech, speaker changes, and meaningful sounds. | Play media with captions and compare to audio. | Low |
| 1.2.3 Audio Description or Media Alternative | A | Prerecorded video in synchronized media has audio description or a full media alternative. | Content: describe visual information needed to understand outcome. | Compare visual-only information against description or transcript. | Low |
| 1.2.4 Captions (Live) | AA | Live synchronized media has captions for audio. | Content: provide real-time captioning workflow. | Observe live stream with captions enabled. | Low |
| 1.2.5 Audio Description (Prerecorded) | AA | Prerecorded video in synchronized media has audio description. | Content: add an audio-description track or integrated descriptions. | Check that important visual-only information is spoken. | Low |
| 1.2.6 Sign Language (Prerecorded) | AAA | Prerecorded synchronized media has sign-language interpretation. | Content: provide accurate interpretation in the intended sign language. | Review interpretation availability and synchronization. | Low |
| 1.2.7 Extended Audio Description | AAA | When natural pauses are insufficient, video pauses or extends to allow full audio description. | Content/design: support extended description without losing timing. | Check visual information that cannot fit normal pauses. | Low |
| 1.2.8 Media Alternative (Prerecorded) | AAA | Prerecorded synchronized media and video-only content have a complete media alternative. | Content: provide full transcript with dialogue, sounds, visual action, and interactions. | Compare transcript to full media experience. | Low |
| 1.2.9 Audio-only (Live) | AAA | Live audio-only content has an equivalent live text alternative. | Content: provide real-time text or equivalent live transcript. | Observe live alternative during event. | Low |
| 1.3.1 Info and Relationships | A | Structure and relationships are programmatically determinable or available in text. | Frontend: use semantic headings, lists, groups, labels, table headers, landmarks. | Inspect accessibility tree and source order. | Medium |
| 1.3.2 Meaningful Sequence | A | Programmatic reading order preserves meaning. | Frontend/design: DOM order matches intended sequence across responsive states. | Read with keyboard and screen reader; disable CSS if useful. | Low |
| 1.3.3 Sensory Characteristics | A | Instructions do not rely only on shape, color, size, visual location, orientation, or sound. | Content/design: pair sensory cues with names or text. | Review instructions and control references. | Low |
| 1.3.4 Orientation | AA | Content and operation do not require one display orientation unless essential. | Design/frontend: support portrait and landscape. | Rotate device or emulator and complete tasks. | Medium |
| 1.3.5 Identify Input Purpose | AA | Personal-data fields expose their expected purpose when supported. | Frontend: use appropriate autocomplete tokens. Content: avoid ambiguous labels. | Inspect attributes and test autofill. | Medium |
| 1.3.6 Identify Purpose | AAA | UI component, icon, and region purpose can be programmatically determined where supported. | Frontend/design: use recognizable semantics and consistent purpose metadata. | Inspect landmarks, regions, controls, and personalization hooks. | Low |
| 1.4.1 Use of Color | A | Color is not the only way to convey information, action, response, or distinction. | Design/content: add text, icons, patterns, labels, or state. | Check color-blind and grayscale conditions. | Medium |
| 1.4.2 Audio Control | A | Auto-playing audio over 3 seconds can be paused/stopped or controlled independently. | Design/frontend: provide immediate control and avoid autoplay. | Load page and verify control within 3 seconds. | Low |
| 1.4.3 Contrast (Minimum) | AA | Text contrast is at least 4.5:1; large text at least 3:1, with stated exceptions. | Design: enforce color tokens. Frontend: preserve states and themes. | Measure normal, hover, focus, disabled-adjacent, and responsive states. | High |
| 1.4.4 Resize Text | AA | Text resizes to 200% without loss of content or function. | Design/frontend: use flexible units and layouts. | Browser zoom/text resize to 200% and complete tasks. | Medium |
| 1.4.5 Images of Text | AA | Images of text are avoided unless customizable or essential. | Content/design: use real text except logos or essential presentations. | Inspect banners, cards, charts, hero images, screenshots. | Medium |
| 1.4.6 Contrast (Enhanced) | AAA | Text contrast is at least 7:1; large text at least 4.5:1, with exceptions. | Design: stronger token requirements. | Measure all text states and themes. | High |
| 1.4.7 Low or No Background Audio | AAA | Speech audio has no background, a way to turn it off, or background at least 20 dB lower except brief sounds. | Content/media: mix and publish speech tracks accessibly. | Listen and inspect audio mix. | Low |
| 1.4.8 Visual Presentation | AAA | Blocks of text support user-adjustable colors, max 80 characters, non-justified text, adequate spacing, and 200% resize. | Design/content: readable typography and customization tolerance. | Check line length, spacing, alignment, zoom, and user style overrides. | Medium |
| 1.4.9 Images of Text (No Exception) | AAA | Images of text are only decorative or essential. | Design/content: replace all nonessential text images with real text. | Inspect text embedded in images across content. | Medium |
| 1.4.10 Reflow | AA | Content reflows without two-dimensional scrolling at 320 CSS px width or 256 CSS px height except essential 2D content. | Design/frontend: responsive layout preserves content and function. | Test 400% zoom or 320 px viewport. | Medium |
| 1.4.11 Non-text Contrast | AA | UI component boundaries/states and meaningful graphics have at least 3:1 contrast. | Design: tokens for controls, focus, charts, icons. | Measure controls, states, graph elements, icons. | Medium |
| 1.4.12 Text Spacing | AA | User text-spacing overrides do not lose content or function. | Frontend/design: allow line, paragraph, letter, and word spacing changes. | Apply spacing overrides and complete tasks. | Low |
| 1.4.13 Content on Hover or Focus | AA | Hover/focus popups are dismissible, hoverable, and persistent unless exempt. | Design/frontend: tooltips, menus, and popovers do not trap or obscure. | Trigger with pointer and keyboard; test Escape/dismissal. | Low |

## Operable

| SC | Level | Pass condition | Main obligations | Test | Auto |
|---|---:|---|---|---|---|
| 2.1.1 Keyboard | A | All functionality works through a keyboard interface except path-dependent input. | Design/frontend: provide keyboard equivalents for every action. | Complete tasks with keyboard only. | Low |
| 2.1.2 No Keyboard Trap | A | Keyboard focus can always leave any component using standard or documented keys. | Frontend: modals, embeds, menus, and widgets have exit paths. | Tab through every interactive state. | Low |
| 2.1.3 Keyboard (No Exception) | AAA | All functionality works through keyboard with no path-dependent exceptions. | Design/frontend: provide full keyboard parity even for drawing and gestures. | Complete all functions without pointer. | Low |
| 2.1.4 Character Key Shortcuts | A | Single-character shortcuts can be turned off, remapped, or limited to active components. | Design/frontend: avoid global letter shortcuts. | Test keyboard shortcuts and settings. | Low |
| 2.2.1 Timing Adjustable | A | Time limits can be turned off, adjusted, or extended unless exempt. | Design/frontend: warn, extend, save, or remove timers. | Trigger timers and verify control. | Low |
| 2.2.2 Pause, Stop, Hide | A | Moving, blinking, scrolling, or auto-updating content can be paused, stopped, hidden, or controlled. | Design/frontend: give user control over carousels, tickers, loaders, refreshes. | Observe content over time and test controls. | Medium |
| 2.2.3 No Timing | AAA | Timing is not essential except real-time events or exempt cases. | Design: remove task deadlines where possible. | Check forms, quizzes, checkout, sessions. | Low |
| 2.2.4 Interruptions | AAA | Non-emergency interruptions can be postponed or suppressed. | Design/frontend: let users control popups and notifications. | Trigger interruptions and inspect settings. | Low |
| 2.2.5 Re-authenticating | AAA | After re-authentication, users continue without data loss. | Frontend/backend: preserve state through session renewal. | Expire session mid-task and re-authenticate. | Low |
| 2.2.6 Timeouts | AAA | Users are warned about inactivity timeouts that could cause data loss unless data is preserved for over 20 hours. | Content/design/frontend: disclose timeout duration and recovery. | Review notices and session behavior. | Low |
| 2.3.1 Three Flashes or Below Threshold | A | No content flashes more than three times per second or exceeds flash thresholds. | Design/media: avoid unsafe flashing. | Analyze animation and video. | Medium |
| 2.3.2 Three Flashes | AAA | No content flashes more than three times per second. | Design/media: stricter flash ban. | Analyze all motion and media. | Medium |
| 2.3.3 Animation from Interactions | AAA | Nonessential interaction-triggered motion can be disabled. | Design/frontend: respect reduced motion and provide controls. | Trigger motion with reduced-motion enabled. | Low |
| 2.4.1 Bypass Blocks | A | Users can bypass repeated blocks. | Frontend/design: skip links, landmarks, or equivalent. | Keyboard from page start; inspect landmarks. | Medium |
| 2.4.2 Page Titled | A | Each page has a descriptive title. | Content/frontend: unique titles for pages and SPA routes. | Inspect title during navigation and route changes. | High |
| 2.4.3 Focus Order | A | Focus order preserves meaning and operability. | Design/frontend: logical tab order and no harmful tabindex. | Tab through all states and breakpoints. | Low |
| 2.4.4 Link Purpose (In Context) | A | Link purpose is clear from link text or programmatic/contextual information. | Content: avoid ambiguous repeated links. | Review links out of and in context. | Medium |
| 2.4.5 Multiple Ways | AA | More than one way exists to locate web pages in a set, with exceptions. | Design: navigation plus search, sitemap, index, or links. | Verify alternate finding paths. | Low |
| 2.4.6 Headings and Labels | AA | Headings and labels describe topic or purpose. | Content/design: clear, specific section and control names. | Review headings, labels, and form fields. | Low |
| 2.4.7 Focus Visible | AA | Keyboard focus indicator is visible. | Design/frontend: visible focus for all interactive elements. | Keyboard through states and themes. | Medium |
| 2.4.8 Location | AAA | User location within a set of pages is available. | Design/content: breadcrumbs, current nav, step indicators. | Verify orientation cues. | Low |
| 2.4.9 Link Purpose (Link Only) | AAA | Link text alone identifies purpose unless ambiguous to all users. | Content: unique standalone link text. | Review extracted link list. | Low |
| 2.4.10 Section Headings | AAA | Section headings organize content. | Content/design: divide substantial content into named sections. | Scan content hierarchy. | Low |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Focused component is not entirely hidden by author-created content. | Design/frontend: sticky UI and overlays do not fully cover focus. | Keyboard at all zoom levels and breakpoints. | Low |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | Focused component is not partially hidden by author-created content. | Design/frontend: reserve clear space around focused components. | Keyboard with sticky headers, drawers, banners. | Low |
| 2.4.13 Focus Appearance | AAA | Focus indicator meets minimum area and contrast requirements and is not thinner than required. | Design: specify robust focus tokens. | Measure focus indicator size and contrast. | Medium |
| 2.5.1 Pointer Gestures | A | Multipoint or path-based gestures have single-pointer alternatives unless essential. | Design/frontend: provide simple alternatives for pinch, swipe, drawn paths. | Complete gesture actions with simple pointer and keyboard. | Low |
| 2.5.2 Pointer Cancellation | A | Pointer actions avoid accidental activation and support cancellation unless essential. | Frontend: prefer up-event activation and allow abort/reversal. | Press, drag away, release; test cancellation. | Low |
| 2.5.3 Label in Name | A | Accessible name contains the visible text label. | Content/frontend: visible label text matches accessible name. | Inspect speech-input names and accessibility tree. | Medium |
| 2.5.4 Motion Actuation | A | Motion-triggered functionality has a non-motion alternative and motion can be disabled unless essential. | Design/frontend: provide buttons for shake/tilt actions. | Test without device motion. | Low |
| 2.5.5 Target Size (Enhanced) | AAA | Pointer targets are at least 44 by 44 CSS px except allowed cases. | Design: generous touch areas and spacing. | Measure targets across states/breakpoints. | Medium |
| 2.5.6 Concurrent Input Mechanisms | AAA | Content does not restrict available input methods unless necessary. | Design/frontend: support keyboard, touch, pointer, stylus, speech together. | Switch input methods during use. | Low |
| 2.5.7 Dragging Movements | AA | Dragging actions have non-drag alternatives unless essential. | Design/frontend: add discrete controls for reorder, resize, move, select. | Complete without dragging. | Low |
| 2.5.8 Target Size (Minimum) | AA | Pointer targets are at least 24 by 24 CSS px or meet spacing/equivalent/exemption rules. | Design/frontend: avoid dense tiny controls. | Measure target areas and spacing. | Medium |

## Understandable

| SC | Level | Pass condition | Main obligations | Test | Auto |
|---|---:|---|---|---|---|
| 3.1.1 Language of Page | A | Default page language is programmatically determinable. | Frontend/content: set page language correctly. | Inspect html lang and pronunciation. | High |
| 3.1.2 Language of Parts | AA | Language changes are programmatically determinable, with exceptions. | Content/frontend: mark passages, labels, and titles in other languages. | Inspect mixed-language content with screen reader. | Medium |
| 3.1.3 Unusual Words | AAA | Mechanisms identify definitions for unusual words, idioms, and jargon. | Content: define specialized language. | Review jargon and glossary behavior. | Low |
| 3.1.4 Abbreviations | AAA | Mechanisms identify expanded forms or meanings of abbreviations. | Content: expand or define abbreviations. | Review abbreviations throughout content. | Low |
| 3.1.5 Reading Level | AAA | Text above lower-secondary reading level has supplemental content or an easier version unless exempt. | Content: provide summaries, explanations, or simplified alternatives. | Assess readability and support content. | Low |
| 3.1.6 Pronunciation | AAA | Pronunciation is available when meaning is ambiguous without it. | Content: provide pronunciation guidance. | Identify ambiguous names/terms. | Low |
| 3.2.1 On Focus | A | Receiving focus does not cause a context change. | Frontend/design: focus is not a trigger for navigation or submission. | Tab through UI and observe changes. | Low |
| 3.2.2 On Input | A | Changing input does not unexpectedly change context unless warned before use. | Design/frontend: avoid unexpected auto-submit or navigation. | Change fields and controls. | Low |
| 3.2.3 Consistent Navigation | AA | Repeated navigation appears in the same relative order unless user changes it. | Design/frontend: consistent header/sidebar/footer order. | Compare pages and states. | Low |
| 3.2.4 Consistent Identification | AA | Components with the same function are identified consistently. | Content/design: consistent labels, icons, help names, actions. | Compare repeated controls. | Low |
| 3.2.5 Change on Request | AAA | Context changes happen only on user request or can be disabled. | Design/frontend: give explicit controls for major changes. | Test auto-updates, redirects, popups. | Low |
| 3.2.6 Consistent Help | A | Help mechanisms repeated across pages appear in the same relative order. | Design: consistent placement for contact/help/self-help. | Compare pages in a set. | Low |
| 3.3.1 Error Identification | A | Input errors are identified and described to the user. | Content/frontend: clear inline and summary errors. | Submit invalid forms. | Medium |
| 3.3.2 Labels or Instructions | A | Inputs have labels or instructions when needed. | Content/design/frontend: visible labels, instructions, constraints. | Inspect every field and group. | Medium |
| 3.3.3 Error Suggestion | AA | Correctable input errors receive suggestions when possible. | Content/frontend: explain how to fix errors. | Submit correctable errors. | Low |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | High-impact submissions are reversible, checked, or confirmed. | Design/frontend/backend: review, confirm, undo, or cancel. | Complete payment/legal/data-change flows. | Low |
| 3.3.5 Help | AAA | Context-sensitive help is available. | Content/design: provide task-relevant help. | Review complex tasks and forms. | Low |
| 3.3.6 Error Prevention (All) | AAA | All submissions are reversible, checked, or confirmed. | Design/frontend/backend: extend prevention beyond high-impact flows. | Test all data submissions. | Low |
| 3.3.7 Redundant Entry | A | Previously entered or provided information is not requested again unless exempt. | Design/frontend/backend: reuse, prefill, or allow selection. | Complete multi-step flows. | Low |
| 3.3.8 Accessible Authentication (Minimum) | AA | Authentication does not require a cognitive-function test unless there is an accessible alternative or support. | Design/security/frontend: support password managers, paste, passkeys, non-puzzle alternatives. | Log in, recover, and complete MFA without memory/transcription puzzles. | Low |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | Authentication avoids cognitive-function tests without relying on object/user-content recognition exceptions. | Design/security: provide direct accessible authentication paths. | Test all auth and recovery paths. | Low |

## Robust

| SC | Level | Pass condition | Main obligations | Test | Auto |
|---|---:|---|---|---|---|
| 4.1.1 Parsing | Removed | Not an active WCAG 2.2 criterion; code validity remains risk control. | Frontend: keep valid HTML to avoid failures under other criteria. | Validate as best practice, not WCAG 2.2 pass/fail. | High |
| 4.1.2 Name, Role, Value | A | UI components expose name and role; user-set states/properties/values can be set programmatically; changes are available to user agents. | Frontend: native controls first; exact custom semantics and state mapping. | Inspect accessibility tree and operate with AT. | Medium |
| 4.1.3 Status Messages | AA | Status messages are programmatically determinable without receiving focus. | Frontend/design: use appropriate status/alert/live-region behavior. | Trigger results, errors, loading, validation, and saved states. | Low |

## Audit Use

For each applicable criterion, record: result, affected page/state, evidence, user impact, severity, failure mode, remediation requirement, owner, validation method, and retest result. A criterion is not passed by intent or visual appearance; it passes only when the implemented page, state, and complete process meet the requirement at the declared level.
