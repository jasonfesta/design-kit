# Evaluation and Reporting with WCAG-EM-Style Methods

Use this for formal reviews, sprint QA, acceptance criteria, executive reporting, remediation backlogs, sampling, evidence capture, and repeatable WCAG 2.2 audits. This is a practical audit method; it does not certify legal compliance.

## Evaluation Principles

- Define scope before testing.
- Test complete processes, not only isolated pages.
- Include representative pages, templates, states, user roles, and breakpoints.
- Use automated tools as support, not final judgment.
- Record evidence clearly enough that another reviewer can reproduce findings.
- Distinguish conformance failures from improvements.
- Retest after remediation.

## Step 1: Define Scope

Capture:

- Website or application boundaries.
- Target WCAG version and level.
- User roles and authenticated states.
- Included technologies and third-party content.
- Included languages, themes, and responsive variants.
- Complete processes.
- Known exclusions and reasons.
- Testing environment: browsers, devices, assistive technologies, automation tools.

## Step 2: Explore the Product

Before selecting samples, identify:

- Templates and layout families.
- Navigation structures.
- Forms and validation flows.
- Media content.
- Documents and downloads.
- Dynamic widgets.
- Error, loading, empty, success, and timeout states.
- Payment, legal, data-modifying, or destructive actions.
- Third-party embeds.
- High-traffic or high-risk pages.

## Step 3: Select Sample

A representative sample should include:

- Home or main entry page.
- Each major template.
- Key user journeys and process steps.
- Forms with errors and success states.
- Search results and no-results state.
- Media pages.
- Data tables or dashboards.
- Help/contact page.
- Authentication and re-authentication states.
- Pages with third-party widgets.
- Pages likely to have accessibility issues due to complexity.

Add random or high-traffic pages to reduce bias.

## Step 4: Audit

For each sampled page/state/process, test:

- Keyboard operation and focus order.
- Focus visibility and obscuration.
- Screen reader names, roles, states, and announcements.
- Headings, landmarks, labels, lists, and table relationships.
- Link purpose.
- Form instructions, errors, suggestions, and prevention.
- Contrast and non-text contrast.
- Reflow, resize, and text spacing.
- Media alternatives.
- Motion, flashing, timing, and interruptions.
- Input modalities, gestures, dragging, and target size.
- Language, readability, and predictable behavior.
- Authentication and session recovery.

## Automated Tool Use

Automated tools can quickly detect:

- Missing labels and alt attributes.
- Some ARIA errors.
- Some contrast failures.
- Missing language attributes.
- Heading and landmark issues.
- Duplicate IDs and invalid references.

Automated tools cannot reliably judge:

- Alt text quality.
- Reading order meaning.
- Link purpose in context.
- Keyboard parity for every function.
- Caption or transcript quality.
- Error message usefulness.
- Correct focus management after dynamic changes.
- Whether a design meets user needs.

## Severity Model

Use severity to prioritize remediation without changing pass/fail status.

| Severity | Meaning |
|---|---|
| Critical | Blocks task completion, traps users, creates safety/security risk, or violates non-interference. |
| High | Major barrier for a user group or key process; workaround difficult. |
| Medium | Barrier exists but task can be completed with effort or workaround. |
| Low | Minor issue, polish issue, or limited-scope failure. |
| Improvement | Not a target-level failure but improves usability, robustness, or AAA alignment. |

## Evidence Format

Each issue should include:

- Unique issue ID.
- Page, route, state, and process step.
- WCAG criterion and target level.
- Severity.
- User impact.
- Steps to reproduce.
- Expected result.
- Actual result.
- Evidence: screenshot, DOM snippet, accessibility tree, screen reader output, or video note.
- Affected components/templates.
- Remediation guidance.
- Acceptance test.
- Owner and status.

## Reporting Structure

A useful report includes:

1. Executive summary.
2. Scope and limitations.
3. Method and tools.
4. Target standard and level.
5. Sample list.
6. Overall conformance result by page/process.
7. Issues grouped by severity and WCAG criterion.
8. Common systemic causes.
9. Remediation plan.
10. Retest plan.
11. Appendix with detailed evidence.

## Dashboard Metrics

Track progress with metrics such as:

- Open issues by severity and WCAG level.
- Failures by template/component.
- Failures by process.
- Issues fixed and retested.
- Pages/processes passing target level.
- Documents/media reviewed.
- Components with complete accessibility specs.
- People trained.
- User-reported barriers received and resolved.

Do not use a single automated score as the accessibility quality measure.

## Retesting

Retesting should verify:

- The original issue is fixed.
- The fix did not create regressions.
- Related components/templates are updated.
- Documentation and design system rules are updated if the issue was systemic.
- The complete process still works at the target level.

## Common Reporting Failures

- Reporting only automated findings.
- Testing only desktop default state.
- Ignoring authenticated or error states.
- Treating each page as independent when a process fails.
- Missing third-party content.
- Giving vague remediation such as "make accessible".
- No acceptance test for fixes.
- No retest evidence.
