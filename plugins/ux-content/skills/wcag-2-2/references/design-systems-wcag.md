# WCAG 2.2 in Design Systems

Use this to convert WCAG 2.2 into design tokens, component behavior specifications, documentation, QA gates, and governance. Do not use it to ship pre-made components; use it to define how components must be designed, built, reviewed, and maintained.

## Design System Accessibility Contract

Each pattern must define:

- Purpose and allowed use.
- Semantic structure.
- Accessible name and description rules.
- Keyboard interaction.
- Focus order, focus visibility, and focus return.
- Pointer, touch, and speech-input behavior.
- Responsive and zoom behavior.
- Visual contrast requirements.
- Motion and reduced-motion behavior.
- Error, loading, empty, disabled, selected, expanded, collapsed, and invalid states.
- Content guidance for labels, headings, instructions, and messages.
- Test requirements and known limitations.

## Token Requirements

Tokens should make accessible decisions easier by default.

| Token area | Requirements |
|---|---|
| Color | Text and non-text contrast pairs; state colors with non-color cues; dark/high-contrast variants. |
| Typography | Scalable units, readable line height, spacing, line length guidance, no justified body text. |
| Focus | Indicator thickness, offset, color, contrast, and behavior over dark/light backgrounds. |
| Spacing | Target size, touch spacing, text spacing tolerance, layout gutters at zoom. |
| Motion | Duration, easing, reduced-motion replacements, no flashing patterns. |
| Elevation/overlay | Contrast over scrims, focus visibility, non-obscuration, dismiss behavior. |
| Breakpoints | Reflow without loss of content or function at small widths and high zoom. |

Do not encode inaccessible brand combinations as primary tokens. If brand colors fail contrast, define accessible usage restrictions.

## Component Specification Template

For each component or pattern, document:

1. User purpose.
2. WCAG criteria affected.
3. Required semantics.
4. Required visible content.
5. Accessible name/description source.
6. States and programmatic state mapping.
7. Keyboard and pointer behavior.
8. Focus behavior.
9. Responsive and zoom behavior.
10. Motion behavior.
11. Error and recovery behavior.
12. Content rules.
13. Acceptance tests.
14. Anti-patterns.

This is a specification, not a code recipe.

## State Coverage

Every component must define all states it can enter.

Common states:

- Default.
- Hover.
- Focus.
- Active/pressed.
- Selected/current.
- Expanded/collapsed.
- Disabled/read-only.
- Required/optional.
- Valid/invalid.
- Loading/busy.
- Empty.
- Success.
- Error.
- Timed out.
- Reduced motion.
- High contrast.
- 200% text resize and 400% zoom.

State definitions must include visual styling, semantics, announcements, and input behavior.

## Content Standards

A design system should define content rules for:

- Button text.
- Link text.
- Headings.
- Field labels.
- Help text.
- Error messages.
- Success messages.
- Empty states.
- Loading states.
- Dialog titles.
- Accessible names for icon-only controls.
- Alt text decision-making.

Keep strings specific, actionable, and consistent. Do not leave accessible names as developer afterthoughts.

## Documentation Requirements

Documentation should include:

- Accessibility intent.
- Required and optional behaviors.
- Keyboard model.
- Focus management rules.
- Anatomy and content slots.
- State matrix.
- Design annotations.
- Do/don't examples described in text.
- Testing checklist.
- Browser/assistive-technology notes.
- Known limitations and allowed exceptions.

Documentation should be usable by designers, developers, QA, product managers, and content designers.

## Governance

Accessibility quality must survive product changes.

Governance practices:

- Accessibility review before a pattern is marked ready.
- Token contrast validation before release.
- Manual keyboard and screen reader checks for interactive patterns.
- Regression tests for names, roles, states, and focus behavior.
- Versioning that flags accessibility-breaking changes.
- Deprecation path for inaccessible patterns.
- Intake process for defects reported by users.
- Regular review after framework, browser, or assistive-technology changes.

## Design-to-Development Handoff

Design annotations should include:

- Heading levels and landmarks.
- Reading and focus order.
- Accessible names and descriptions.
- Alt text or alt text decision.
- Required field/error relationships.
- Focus indicator styling.
- Target size and spacing.
- Reflow behavior.
- Motion behavior and reduced-motion variant.
- Live status messages and urgency.

## QA Gates

Before adoption, each pattern should pass:

- Keyboard-only operation.
- Focus visibility and non-obscuration.
- Screen reader name/role/value/state check.
- Contrast and non-text contrast checks.
- Reflow and resize checks.
- Text-spacing check for text-heavy patterns.
- Reduced-motion check.
- Error and status announcement check.
- Touch target and pointer cancellation check.

## Common Systemic Failures

- Tokens allow contrast failures across products.
- Component docs show visuals but omit keyboard behavior.
- Focus style is global but hidden by component overflow.
- Icon-only buttons rely on inconsistent developer-written labels.
- Motion tokens have no reduced-motion equivalent.
- Responsive examples reorder content but docs omit reading order.
- Error patterns differ between teams.
- QA checks only the default state.
