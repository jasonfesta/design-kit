# Privacy, Security, and Accessibility

Use this for login, MFA, CAPTCHA, sessions, payments, sensitive forms, privacy settings, consent, error handling, support flows, and security controls that could block assistive technology or people with cognitive, sensory, or motor disabilities.

Accessibility must not weaken privacy or security. Privacy and security must not create avoidable accessibility barriers.

## High-Risk WCAG Intersections

| Area | Accessibility risk | Security/privacy risk |
|---|---|---|
| CAPTCHA | Visual/audio/cognitive challenges block users. | Weak alternatives can invite abuse. |
| Authentication | Memory, transcription, puzzles, blocked paste, inaccessible MFA. | Overly detailed errors leak account data. |
| Timeouts | Data loss and disorientation. | Excessive persistence exposes private data. |
| Redundant entry | Repeated typing creates cognitive and motor burden. | Auto-fill may expose sensitive information. |
| Error suggestions | Users need correction guidance. | Suggestions may reveal private or security-sensitive facts. |
| Live announcements | Screen reader users need status. | Spoken private data can be overheard. |
| Security headers/widgets | Third-party controls may be inaccessible. | Blocking scripts or frames may break accessibility features if not planned. |

## Accessible Authentication

Authentication should support:

- Password managers.
- Copy and paste.
- Visible labels and clear instructions.
- Accessible error messages.
- Multiple MFA options where possible.
- Recovery paths that do not require inaccessible documents or phone-only support.
- Session return to the original task after login.

Avoid:

- Blocking paste in password or code fields.
- Requiring users to memorize generated codes from another screen when alternatives exist.
- Visual-only CAPTCHA.
- Audio-only CAPTCHA.
- Puzzles, calculations, or object recognition as the only path.
- Timeout recovery that discards work.

## MFA Requirements

Offer MFA options with different access characteristics:

- Time-based codes with paste/autofill support.
- Push approval with accessible app flow.
- Backup codes presented accessibly and storable by the user.
- Security keys with clear instructions and fallback.
- Recovery support that does not rely on one sensory or motor ability.

Do not assume SMS, phone calls, authenticator apps, biometrics, or hardware keys are universally accessible.

## CAPTCHA Alternatives

Prefer avoiding CAPTCHA through risk scoring, rate limits, honeypots that do not trap assistive technology, server-side abuse detection, or authenticated flows.

When a CAPTCHA is necessary:

- Provide alternatives for different sensory abilities.
- Provide a support path.
- Ensure keyboard and screen reader operation.
- Do not require users to identify disability.
- Do not make the alternative substantially slower or more stigmatizing.
- Do not rely solely on object recognition for AA authentication unless another allowed mechanism exists.

## Privacy-Preserving Announcements

Status messages and screen reader announcements should be useful without exposing sensitive data.

Prefer:

- "Payment method saved" rather than reading the full card number.
- "Verification code sent" rather than announcing the full destination if privacy-sensitive.
- "3 errors found" with user-controlled navigation to details.

Avoid automatically speaking passwords, tokens, full addresses, account balances, medical details, or legal information unless the user explicitly requests reveal.

## Error Messages

Security-sensitive errors must balance clarity and leakage.

- Login: "Email or password is incorrect" may be safer than identifying which field matched an account.
- Password creation: give specific password requirements without revealing security internals.
- MFA: explain next steps and recovery without exposing backup channels to attackers.
- Payment: identify user-correctable issues without revealing fraud rules.
- File upload: explain allowed file types/sizes and malware rejection in plain language.

## Timeouts and Data Preservation

Design timeout behavior by data sensitivity.

- Warn before session expiry when possible.
- Let users extend sessions accessibly.
- Save drafts where privacy permits.
- Explain what is saved and for how long.
- Restore users to the interrupted task after re-authentication.
- Provide explicit save-and-exit for sensitive flows.
- Avoid preserving sensitive data without consent or policy basis.

## Privacy Settings and Consent

Privacy choices must be accessible and understandable.

- Use clear labels and consequences.
- Do not rely on color-only toggles.
- Do not use pre-checked consent where prohibited or misleading.
- Keep focus order logical in banners and preference centers.
- Provide reject, accept, and manage options with comparable accessibility.
- Do not trap keyboard users in cookie banners.
- Persist choices and make them easy to change.

## Secure Forms

For state-changing forms:

- Preserve accessible labels and instructions even when adding security tokens or anti-abuse fields.
- Hidden security fields must not become focusable or announced unnecessarily.
- Server-side errors return accessible messages.
- Client-side sanitization and server validation do not remove accessibility attributes.
- Security overlays do not obscure focus or block zoom.

## Content Security and Accessibility

Security policies should be tested with accessibility features.

- CSP should allow required caption, transcript, media, and assistive scripts used by the product.
- Embedded third-party security tools must be keyboard and screen reader accessible.
- Error pages created by security middleware need titles, headings, language, and focusable recovery actions.
- Rate-limit and lockout notices must be accessible and explain recovery.

## Acceptance Tests

- Complete login, MFA, recovery, and logout with keyboard and screen reader.
- Use password manager and paste into relevant fields.
- Let session expire after entering data; verify warning and recovery.
- Trigger security-related errors and verify clarity without sensitive leakage.
- Test privacy banner and settings at zoom and with keyboard.
- Verify live regions do not announce private data automatically.
- Confirm CAPTCHA or anti-abuse flow has accessible alternatives.

## Common Failures

- Password paste blocked.
- CAPTCHA is the only route to submit a form.
- Timeout warning cannot be extended by keyboard.
- Re-authentication returns user to the dashboard and discards work.
- Error message reveals whether an email address has an account.
- Screen reader announcement exposes private field values.
- Cookie banner traps focus or hides page focus.
- Security widget is inaccessible but required to proceed.
