# Accessible Single Page Applications

Use this for React, Vue, Angular, Svelte, client-rendered applications, partial hydration, route transitions, lazy loading, virtualized content, async validation, and dynamic state management.

SPAs are not exempt from page-level WCAG requirements. Each route, state variant, and complete process step must be perceivable, operable, understandable, and robust.

## Route Changes

When client-side navigation changes the main view:

- Update the document title to the new view's topic or purpose.
- Move focus to a logical destination, usually the main heading, main region, or route container.
- Announce route changes only when title and focus movement are insufficient for the assistive-technology experience.
- Preserve expected browser history behavior.
- Do not leave focus on a control that disappeared or now means something else.

## Initial Load and Hydration

During loading and hydration:

- Server-rendered or fallback content should not expose controls before they can operate.
- Skeletons and spinners need accessible status text when the wait matters.
- Avoid infinite or aggressive loading animation.
- Do not duplicate landmarks or headings during hydration.
- Maintain stable names and relationships before and after hydration.
- Handle hydration errors with readable, recoverable messages.

## Dynamic Titles and Headings

Every route should have:

- Unique document title.
- Visible heading that matches or clarifies the title.
- Landmark structure consistent with the app shell.
- Error, empty, loading, and success states with appropriate titles/headings when they replace the main view.

## Focus Management

Define focus behavior for:

- Route change.
- Modal open/close.
- Drawer open/close.
- Menu open/close.
- Form validation.
- Toast or status update.
- Sort, filter, pagination.
- Add/remove item.
- Authentication timeout and return.
- Error boundary fallback.

Do not steal focus for routine updates. Do move focus when a new context requires immediate user action.

## Async States

For loading, empty, error, and success states:

- Provide visible text, not only animation or color.
- Expose status messages when content changes without focus movement.
- Keep controls disabled only as long as necessary and expose disabled/busy state.
- Provide retry, cancel, or fallback for failures.
- Preserve user input during async validation and submission.
- Prevent layout shifts from hiding focus or changing task order.

## Virtualized and Infinite Content

Virtualization can break screen reader navigation and browser find.

Requirements:

- Keep the user's current item stable when new items render.
- Expose item counts, loaded range, and loading status when relevant.
- Do not remove focused items from the DOM unexpectedly.
- Provide pagination or load-more alternatives where infinite scroll impairs access.
- Ensure headings, landmarks, and list semantics still make sense.
- Avoid scroll jumps after data refresh.

## Client-Side Forms

- Labels, instructions, and autocomplete must be present in rendered markup.
- Client-side validation must identify errors in text and associate them with fields.
- Server-side validation errors must return to the same accessible error pattern.
- Multi-step forms must preserve data across routes and re-authentication.
- Error summaries should link or move to invalid fields.
- Avoid redundant entry across steps.

## Modals, Drawers, and Portals

Portals can separate visual and DOM position. Ensure:

- Modal content has correct semantics and accessible name.
- Background content is inert while modal is active.
- Focus moves into modal and returns on close.
- Escape and close controls work.
- Nested modals are avoided or strictly managed.
- Drawers that are not modal do not trap focus.
- Portal IDs used in labels/descriptions remain valid.

## State Stores and Announcements

Central state changes may need user-facing feedback.

Announce only meaningful changes:

- Save status.
- Cart count updated.
- Search results updated.
- Error occurred.
- Item moved or removed.
- Filter applied.

Avoid announcing every internal state change. Batch rapid changes and use polite announcements unless urgent.

## Error Boundaries

Error fallback UI must be accessible.

- Provide a clear heading and message.
- Preserve navigation and support options.
- Provide retry or safe return where possible.
- Do not expose stack traces or internal names to users.
- Move focus to the fallback heading if the main view is replaced.
- Keep the document title accurate when the error is the page state.

## Acceptance Tests

- Navigate routes with keyboard and screen reader; verify title, focus, and heading.
- Refresh on deep links and compare behavior with client-side navigation.
- Test loading, empty, error, success, validation, and timed-out states.
- Test modals and drawers created through portals.
- Use browser back/forward and verify focus and state recovery.
- Test virtualized lists with keyboard and screen reader navigation.
- Confirm reduced motion affects route and component transitions.

## Common Failures

- Route changes visually but screen reader receives no cue.
- Focus remains on a removed link after navigation.
- All routes share the same document title.
- Loading skeleton is announced as real content.
- Virtualized list removes focused row.
- Error boundary traps users with no navigation or retry.
- Portal modal has broken label references.
- Async filter updates results and resets focus to the top unexpectedly.
