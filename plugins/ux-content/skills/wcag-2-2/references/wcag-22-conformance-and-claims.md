# WCAG 2.2 Conformance and Claims

Use this reference to scope audits, plan remediation, define target levels, prepare conformance claims, write accessibility statements, and handle partial conformance. This is technical guidance, not legal certification.

## Conformance Rules

WCAG 2.2 conformance is evaluated for web pages and complete processes, not isolated components. A page or process conforms only when every applicable success criterion at the target level is satisfied, or when a conforming alternate version is provided.

| Requirement | What it means for web design and review |
|---|---|
| Conformance level | A requires all Level A criteria. AA requires all A and AA criteria. AAA requires all A, AA, and AAA criteria. |
| Full pages | The whole page is in scope: header, footer, content, forms, overlays, media, responsive variants, directly linked alternatives, error states, and dynamic states. |
| Complete processes | Every required step in a process must conform at the claimed level. A final confirmation page cannot conform if checkout, login, or payment steps fail. |
| Accessibility-supported use | Relied-upon technologies must work with users' browsers, accessibility features, and assistive technologies in the language of the content. |
| Non-interference | Non-conforming or non-relied-upon content must not block the rest of the page. Audio control, no keyboard trap, pause/stop/hide, and flash safety apply to all content. |

## Target Level Guidance

Level A is the minimum baseline. It catches blocking issues but is not enough for most public or enterprise targets.

Level AA is the common product target because it combines access-critical requirements with broad usability and mobile/low-vision support.

Level AAA is best treated as an enhanced quality bar, a page-specific target, or a design-system ambition. Do not require site-wide AAA by default unless the content type and scope make it realistic.

4.1.1 Parsing is removed in WCAG 2.2. Keep valid HTML as engineering quality control because invalid markup can still cause failures under other criteria.

## Scope Definition

A useful scope statement identifies:

- domain, product, application, or service name;
- target WCAG version and level;
- included pages, templates, flows, states, and breakpoints;
- excluded content and the reason for exclusion;
- relied-upon technologies and versions where meaningful;
- user agents and assistive technologies used in testing;
- languages, locales, and content variants;
- known third-party or user-generated content.

Do not scope only the happy path. Include authentication, account recovery, session expiry, validation errors, empty states, loading states, search results, filters, modal flows, payment or data-submission paths, and responsive layouts.

## Conforming Alternate Versions

An alternate version can support conformance only when it is itself conforming, provides equivalent information and functionality, is available from the non-conforming page, and does not create a worse or segregated experience.

Prefer making the primary experience accessible. Use alternate versions only when the primary technology or format cannot be made accessibility-supported within the real scope.

## Accessibility-Supported Technologies

A technology is usable for conformance only in the way it is implemented. HTML, CSS, JavaScript, SVG, PDF, canvas, and ARIA can be accessible or inaccessible depending on usage.

Before relying on a technology, confirm:

- users can perceive its output through the intended user agents and assistive technologies;
- users can operate its functionality through keyboard and other required inputs;
- names, roles, values, states, and relationships are exposed where needed;
- fallback or equivalent content exists when support is absent;
- the technology is not required for a basic task if it cannot be made accessible.

## Non-Interference Checklist

Always test these even for ads, embeds, experimental widgets, decorative animations, or nonessential panels:

- Auto-playing audio over 3 seconds has a page-level or component-level pause, stop, mute, or independent volume control.
- Keyboard focus can enter and leave every component and embedded region.
- Moving, blinking, scrolling, or auto-updating content can be paused, stopped, hidden, or controlled.
- Content does not flash more than allowed by the relevant flash criteria.

If a page cannot satisfy non-interference, it cannot be included in a conformance claim.

## Conformance Claim Content

A WCAG conformance claim is optional. If made, include:

| Required item | What to record |
|---|---|
| Claim date | Month/day/year or other unambiguous date. |
| Guidelines | Web Content Accessibility Guidelines 2.2 and the WCAG 2.2 URI. |
| Level | A, AA, or AAA. |
| Scope | Exact pages, URI patterns, product surfaces, or included domains/subdomains. |
| Relied-upon technologies | Technologies required to satisfy criteria, such as HTML, CSS, JavaScript, SVG, ARIA, PDF, or media formats. |

Recommended optional items:

- success criteria met above the claimed level;
- technologies used but not relied upon;
- user agents and assistive technologies used in testing;
- additional accessibility features;
- testing method and date range;
- known limitations and remediation plan;
- user feedback channel.

## Claim Templates

Entire site:

> On [date], all web pages on [domain] conform to Web Content Accessibility Guidelines 2.2, Level [A/AA/AAA], for the technologies [list].

Single page:

> On [date], the web page [title] at [URL] conforms to Web Content Accessibility Guidelines 2.2, Level [A/AA/AAA], for the technologies [list].

Selected pages:

> On [date], the web pages listed below conform to Web Content Accessibility Guidelines 2.2, Level [A/AA/AAA], for the technologies [list]: [page list].

Do not use a conformance logo unless the required claim content is present.

## Partial Conformance

Use partial conformance only for content outside the author's control or for language-support limitations. It is not a way to excuse known internal issues.

For third-party or user-generated content, either monitor and repair non-conforming content within two business days before claiming conformance, or state that the page would conform if the identified uncontrolled parts were removed.

For language limitations, state that the page would conform at level X if accessibility support existed for the identified language or languages.

Describe uncontrolled content specifically enough that users and auditors can identify it. Do not say only "third-party content" or "uncontrolled areas" when the parts are visible on the page.

## Accessibility Statements

An accessibility statement is user-facing and should be plain, accurate, and useful. Include:

- organization and product/site identification;
- accessibility standard and target level;
- current conformance status: conformant, partially conformant, non-conformant, or not assessed;
- known limitations and alternatives where available;
- contact mechanism for accessibility feedback and accessible-format requests;
- preparation or last review date;
- testing method summary;
- escalation or complaint procedure where required by policy.

Do not claim full conformance unless evidence supports it. Prefer precise known limitations over vague statements such as "we are working to improve accessibility."

## ACR and VPAT Notes

An Accessibility Conformance Report documents how a product supports selected standards, often for procurement. A VPAT is a common template used to produce that report.

For procurement-facing reports:

- define the exact product version and scope;
- state each criterion result consistently;
- distinguish "supports" from "partially supports" and "does not support";
- include remarks that explain limitations and user impact;
- avoid using marketing claims as evidence;
- align the report with current product behavior, not roadmap intent.

## Privacy and Security in Claims

WCAG 2.2 identifies privacy implications around timeouts and redundant entry, and security implications around non-text content, input purpose, background audio, timing, re-authentication, timeouts, concurrent input, error suggestions, redundant entry, and authentication.

When writing claims or statements, disclose security and privacy constraints only at a safe level. Do not reveal implementation details that weaken security. Provide accessible support paths without exposing sensitive user data in public channels.

## Evidence Package

A defensible conformance assessment should preserve:

- inventory of pages, templates, components, flows, and states;
- representative sample rationale;
- automated tool results with tool versions;
- manual keyboard, screen reader, zoom, contrast, media, and form test notes;
- issue list with criteria, impact, remediation, and retest status;
- screenshots or recordings where useful;
- final claim or statement text and approval date.
