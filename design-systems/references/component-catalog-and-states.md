# Component catalog and state contracts

Engineer UI components as calm, tactile, keyboard-complete state machines with zero raw operating-system chrome poking through. Every blueprint below pairs semantic HTML, intrinsic sizing, custom form styling, human microcopy, WAI-ARIA focus contracts, and forced-colors resilience.

## Contents

1. [Honest catalog naming and calm specimen pads](#honest-catalog-naming-and-calm-specimen-pads)
2. [Normative WCAG 2.2 accessibility thresholds](#normative-wcag-22-accessibility-thresholds)
3. [Intrinsic buttons quiet danger and state locks](#intrinsic-buttons-quiet-danger-and-state-locks)
4. [OS-free inputs custom selects and blur validation](#os-free-inputs-custom-selects-and-blur-validation)
5. [Custom checkboxes switches comboboxes and range sliders](#custom-checkboxes-switches-comboboxes-and-range-sliders)
6. [Roving tabs navigation and calm breadcrumbs](#roving-tabs-navigation-and-calm-breadcrumbs)
7. [Airy sortable tables and shape status cues](#airy-sortable-tables-and-shape-status-cues)
8. [Focus managed modal dialogs drawers and polite status](#focus-managed-modal-dialogs-drawers-and-polite-status)
9. [Density scaling and forced colors preservation](#density-scaling-and-forced-colors-preservation)

## Honest catalog naming and calm specimen pads

Twelve to fifteen well-crafted primitives power almost every real product cleanly. Finish Tier 1 essentials (buttons, links, text fields, selects, checkboxes, radios, switches, typography, and pads) first. Then complete Tier 2 workhorses (tabs, sortable tables, summary lists, modal dialogs, drawers, menus, banners, and empty states) before adding niche widgets.

Name every catalog section honestly in plain human words such as Buttons, Text fields, Selection, Navigation, Tables, and Dialogs. Never dress simple documentation sections in theatrical jargon like Solenoid actuation triggers or Telemetry matrices. Place every component specimen inside a spacious 2rem to 3rem pad so reviewers appreciate hover, focus, and spacing craft without crowded lines.

Match each user intent to one unambiguous persistence contract:

| User goal | Semantic element | Persistence rule |
| :--- | :--- | :--- |
| Visit another URL | `a[href]` link | Updates browser location cleanly |
| Run an action | `button[type="button"]` | Fires handler at intrinsic width |
| Flip a live setting | `button[role="switch"]` | Applies straight away without Save |
| Mark form choices | `input[type="checkbox"]` | Waits for explicit form submit |
| Swap 2 to 5 local views | Segmented group | Updates peer view inline |
| Choose 1 under 7 items | Exposed radio group | Keeps every option scannable |
| Choose 1 of 7 to 15 | Custom-styled `select` | Clean chevron without search box |
| Choose 1 above 15 | Searchable combobox | Filters long list while typing |

Render account digits, postal codes, and card numbers as plain text inputs with numeric inputmode hints so stray trackpad scroll events never change digits silently.

## Normative WCAG 2.2 accessibility thresholds

Check these concrete WCAG 2.2 thresholds deterministically in tokens and headless browser tests rather than guessing by eye:

| Criterion | Level | Floor | Practical contract |
| :--- | :--- | :--- | :--- |
| SC 1.4.3 Contrast | AA | `4.5:1` body, `3:1` large | Verify across light and dark themes |
| SC 1.4.10 Reflow | AA | `320` CSS px width | Reflow prose cleanly; wrap wide tables |
| SC 1.4.11 Non-text | AA | `3:1` active edge | Keep input, select, and slider rims clear |
| SC 2.1.4 Hotkeys | A | Toggleable and guarded | Ignore single keys inside controls |
| SC 2.4.11 Unobscured | AA | Focus stays uncovered | Offset scroll padding for sticky bars |
| SC 2.4.13 Focus ring | AAA | `2px` ring at `3:1` | Offset solid focus rings cleanly |
| SC 2.5.3 Label name | A | Visible words lead | Match ARIA labels to visible copy |
| SC 2.5.7 Dragging | AA | Click stepper path | Pair range sliders with step buttons |
| SC 2.5.8 Target size | AA | `24` by `24` CSS px | Expand to `44` by `44` on touch |
| SC 3.3.7 Redundant | A | Keep typed values | Never wipe fields on validation error |

Disabled controls are exempt from 3-to-1 border rules, while active text inputs, custom selects, switches, checkboxes, and slider rails must maintain crisp 3-to-1 boundary contrast in both themes.

## Intrinsic buttons quiet danger and state locks

Compose button states orthogonally so focus outlines remain crisp on hovered, pressed, invalid, and busy controls alike. Give each screen view one unmistakable primary action and never stretch a short desktop action button across a 400px container. Keep destructive triggers calm muted ink or neutral outline at rest so red never clashes beside your primary button.

Separate unavailable states across three distinct HTML contracts:

| Attribute | Tab stop | Submitted | Right moment |
| :--- | :--- | :--- | :--- |
| Native `disabled` | Skipped | No | Action does not apply right now |
| `aria-disabled="true"` | Focused | Blocked in JS | Tooltip explains missing prerequisite |
| HTML `readonly` | Focused | Yes | Fixed text value people copy |

Keep busy buttons rock-steady at 0.0px width change by overlapping the hidden label and centered spinner inside grid cell 1 / 1 while hiding idle spinners completely:

```html
<div class="l-cluster">
  <button type="button" class="ds-btn ds-btn-primary">Save changes</button>
  <button type="button" class="ds-btn ds-btn-secondary">Preview draft</button>
  <button type="button" class="ds-btn ds-btn-ghost">Cancel</button>
  <button type="button" class="ds-btn ds-btn-danger">Remove member</button>
  <button type="button" class="ds-btn ds-btn-primary" data-loading="true"
          aria-busy="true" aria-disabled="true">
    <span class="ds-btn-label">Send invite</span>
    <span class="ds-btn-spinner" aria-hidden="true"></span>
  </button>
</div>
```

```css
.ds-btn {
  appearance: none;
  display: inline-grid;
  align-items: center;
  justify-items: center;
  justify-self: start;
  align-self: flex-start;
  min-block-size: 2.5rem;
  min-inline-size: 24px;
  padding-inline: 1.05rem;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  font: 550 0.875rem / 1.2 var(--font-ui);
  cursor: pointer;
  user-select: none;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease,
    transform 120ms cubic-bezier(0.2, 0, 0, 1);
}

.ds-btn > * { grid-area: 1 / 1; }

.ds-btn-primary {
  background: var(--primary-fill);
  color: var(--primary-ink);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.16), 0 1px 2px oklch(0 0 0 / 0.12);
}

.ds-btn-secondary {
  background: var(--surface-raised);
  color: var(--ink-primary);
  border-color: var(--border-control);
}

.ds-btn-ghost {
  background: transparent;
  color: var(--ink-secondary);
}

/* Quiet danger button at rest; crimson appears on intentional hover or confirm */
.ds-btn-danger {
  background: transparent;
  color: var(--ink-secondary);
  border-color: var(--border-hairline);
}

@media (hover: hover) and (pointer: fine) {
  .ds-btn-primary:hover:not(:disabled):not([aria-disabled="true"]) {
    filter: brightness(1.06);
  }
  .ds-btn-secondary:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--surface-sunken);
  }
  .ds-btn-ghost:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--surface-sunken);
    color: var(--ink-primary);
  }
  .ds-btn-danger:hover:not(:disabled):not([aria-disabled="true"]) {
    color: var(--signal-critical);
    border-color: color-mix(in oklch, var(--signal-critical) 45%, transparent);
    background: color-mix(in oklch, var(--signal-critical) 8%, var(--surface-raised));
  }
}

.ds-btn:active:not(:disabled):not([aria-disabled="true"]) {
  transform: translateY(1px);
  transition-duration: 45ms;
}

.ds-btn:focus-visible,
.ds-input:focus-visible,
.ds-select:focus-visible,
.ds-range:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.ds-btn[aria-disabled="true"],
.ds-btn:disabled {
  opacity: 0.52;
  cursor: not-allowed;
}

.ds-btn[data-loading="true"] .ds-btn-label { visibility: hidden; }
.ds-btn:not([data-loading="true"]) .ds-btn-spinner { display: none; }
.ds-btn[data-loading="true"] .ds-btn-spinner {
  display: block;
  inline-size: 1rem;
  block-size: 1rem;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: 50%;
  animation: ds-spin 650ms linear infinite;
}
@keyframes ds-spin { to { transform: rotate(360deg); } }
```

## OS-free inputs custom selects and blur validation

Wrap every input or select in a calm static-label stack containing a clear label, optional plain-English hint, control slot, and inline error message. Never leave raw browser select arrows unstyled. Strip native select appearance and position a crisp inline SVG chevron inside a wrapper so the arrow inherits semantic ink across all themes.

Validate late on blur or submit and clear errors live on valid keystrokes so nobody gets scolded mid-word while typing an email address. Place the error ID ahead of the hint ID inside ARIA descriptions so screen readers announce the problem first:

```html
<form id="billing-form" class="l-stack" style="max-inline-size: 26rem;" novalidate>
  <div class="ds-field">
    <label class="ds-label" for="billing-email">Billing email</label>
    <p class="ds-hint" id="billing-email-hint">Monthly receipts go directly to this address.</p>
    <p class="ds-error-msg" id="billing-email-err" hidden></p>
    <input class="ds-input" id="billing-email" name="email" type="email"
           autocomplete="email" required aria-describedby="billing-email-hint">
  </div>

  <div class="ds-field">
    <label class="ds-label" for="payout-cadence">Payout schedule</label>
    <div class="ds-select-wrap">
      <select class="ds-select" id="payout-cadence" name="cadence">
        <option value="daily">Every business day</option>
        <option value="weekly">Every Friday</option>
        <option value="monthly">First business day of month</option>
      </select>
      <svg class="ds-select-chevron" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M3.5 5.25L7 8.75L10.5 5.25" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>

  <button type="submit" class="ds-btn ds-btn-primary" data-test-validate>Save billing settings</button>
</form>
```

```css
.ds-field { display: flex; flex-direction: column; gap: 0.375rem; }
.ds-label { font: 550 0.875rem / 1.3 var(--font-ui); color: var(--ink-primary); }
.ds-hint { margin: 0; font: 400 0.8125rem / 1.45 var(--font-ui); color: var(--ink-secondary); }
.ds-error-msg { margin: 0; font: 500 0.8125rem / 1.4 var(--font-ui); color: var(--signal-critical); }

.ds-input,
.ds-select {
  appearance: none;
  -webkit-appearance: none;
  inline-size: 100%;
  min-block-size: 2.5rem;
  padding: 0.5rem 0.8rem;
  background: var(--surface-raised);
  color: var(--ink-primary);
  border: 1px solid var(--border-control);
  border-radius: var(--radius-control);
  font: 400 0.9375rem / 1.35 var(--font-ui);
}

.ds-input[aria-invalid="true"] {
  border-color: var(--signal-critical);
}

.ds-select-wrap {
  position: relative;
  display: grid;
  align-items: center;
}

.ds-select {
  padding-inline-end: 2.35rem;
  cursor: pointer;
}

.ds-select-chevron {
  position: absolute;
  inset-inline-end: 0.8rem;
  color: var(--ink-secondary);
  pointer-events: none;
}
```

```js
function bindLateEarlyField(input, hintId, errId, checkValue) {
  const errEl = document.getElementById(errId);
  let wasInvalid = false;

  function apply(showErr) {
    const message = checkValue(input.value.trim());
    if (message && showErr) {
      wasInvalid = true;
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", errId + " " + hintId);
      errEl.textContent = message;
      errEl.hidden = false;
    } else if (!message) {
      wasInvalid = false;
      input.removeAttribute("aria-invalid");
      input.setAttribute("aria-describedby", hintId);
      errEl.textContent = "";
      errEl.hidden = true;
    }
    return !message;
  }

  input.addEventListener("blur", () => {
    if (input.value.trim().length > 0 || wasInvalid) apply(true);
  });
  input.addEventListener("input", () => {
    if (wasInvalid) apply(true);
  });
  return () => apply(true);
}
```

## Custom checkboxes switches comboboxes and range sliders

Style checkboxes, radios, switches, and range sliders explicitly so OS-blue checkmarks and shiny grey browser slider bars never leak onto bespoke surfaces:

```html
<button type="button" class="ds-switch" role="switch" aria-checked="true">
  <span>Weekly summary email</span>
  <span class="ds-switch-track" aria-hidden="true"><span class="ds-switch-thumb"></span></span>
</button>

<div class="ds-range-field">
  <div class="ds-range-head">
    <label class="ds-label" for="transfer-cap">Daily card limit</label>
    <output class="num" id="transfer-cap-out" for="transfer-cap">$2,500</output>
  </div>
  <div class="ds-range-row">
    <button type="button" class="ds-btn ds-btn-secondary" data-step="-250"
            aria-label="Decrease daily card limit by 250 dollars">&minus;</button>
    <input class="ds-range" id="transfer-cap" type="range" min="500" max="10000" step="250" value="2500">
    <button type="button" class="ds-btn ds-btn-secondary" data-step="250"
            aria-label="Increase daily card limit by 250 dollars">+</button>
  </div>
</div>
```

```css
input[type="checkbox"],
input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  inline-size: 1.125rem;
  block-size: 1.125rem;
  margin: 0;
  border: 1.5px solid var(--border-control);
  background: var(--surface-raised);
  border-radius: min(4px, var(--radius-control));
  display: inline-grid;
  place-content: center;
  cursor: pointer;
}
input[type="radio"] { border-radius: 50%; }

input[type="checkbox"]::before {
  content: "";
  inline-size: 0.55rem;
  block-size: 0.32rem;
  border-inline-start: 2px solid var(--primary-ink);
  border-block-end: 2px solid var(--primary-ink);
  transform: rotate(-45deg) scale(0);
  transform-origin: center;
}
input[type="checkbox"]:checked,
input[type="checkbox"]:indeterminate,
input[type="radio"]:checked {
  background: var(--primary-fill);
  border-color: var(--primary-fill);
}
input[type="checkbox"]:checked::before { transform: rotate(-45deg) scale(1); }
input[type="checkbox"]:indeterminate::before {
  block-size: 0; border-inline-start: 0; inline-size: 0.55rem; transform: scale(1);
}
input[type="radio"]::before {
  content: ""; inline-size: 0.45rem; block-size: 0.45rem;
  border-radius: 50%; background: var(--primary-ink); transform: scale(0);
}
input[type="radio"]:checked::before { transform: scale(1); }

.ds-switch {
  appearance: none; display: inline-flex; align-items: center; gap: 0.75rem;
  padding: 0.25rem 0; border: 0; background: transparent;
  color: var(--ink-primary); font: 500 0.875rem / 1.3 var(--font-ui); cursor: pointer;
}
.ds-switch-track {
  display: inline-flex; align-items: center; inline-size: 2.375rem; block-size: 1.375rem;
  padding: 2px; background: var(--surface-sunken); border: 1px solid var(--border-control);
  border-radius: 999px; transition: background-color 140ms ease;
}
.ds-switch[aria-checked="true"] .ds-switch-track {
  background: var(--primary-fill); border-color: var(--primary-fill); justify-content: flex-end;
}
.ds-switch-thumb {
  inline-size: 0.95rem; block-size: 0.95rem; border-radius: 50%;
  background: var(--surface-overlay);
}
[data-theme="dark"] .ds-switch[aria-checked="true"] .ds-switch-thumb {
  background: var(--primary-ink);
}

.ds-range-field { display: flex; flex-direction: column; gap: 0.5rem; max-inline-size: 24rem; }
.ds-range-head { display: flex; justify-content: space-between; align-items: baseline; }
.ds-range-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 0.625rem; }
.ds-range {
  appearance: none; -webkit-appearance: none; inline-size: 100%;
  block-size: 1.75rem; background: transparent; cursor: pointer;
}
.ds-range::-webkit-slider-runnable-track {
  block-size: 0.375rem; border-radius: 999px;
  background: var(--surface-sunken); border: 1px solid var(--border-control);
}
.ds-range::-moz-range-track {
  block-size: 0.375rem; border-radius: 999px;
  background: var(--surface-sunken); border: 1px solid var(--border-control);
}
.ds-range::-webkit-slider-thumb {
  appearance: none; -webkit-appearance: none;
  inline-size: 1.125rem; block-size: 1.125rem; margin-block-start: -0.42rem;
  border-radius: 50%; background: var(--primary-fill); border: 2px solid var(--surface-raised);
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.25);
}
.ds-range::-moz-range-thumb {
  inline-size: 1.125rem; block-size: 1.125rem; border-radius: 50%;
  background: var(--primary-fill); border: 2px solid var(--surface-raised);
}
```

Sync bulk parent checkboxes using both the DOM indeterminate flag and a mixed ARIA checked attribute. Keep typing focus inside searchable combobox inputs while Up and Down arrows move an active-descendant highlight.

## Roving tabs navigation and calm breadcrumbs

Hold composite controls to a single Tab stop so keyboard visitors step swiftly across the page:

| Widget | Arrow keys | Focus owner | Escape behavior |
| :--- | :--- | :--- | :--- |
| Tabs | Left, Right, Home, End | Roving `tabindex` | Tab steps into panel |
| Action menu | Down, Up, Home, End | Active menu item | Closes menu to button |
| Combobox | Down, Up while typing | Input `activedescendant` | Hides list before dialog |
| Modal dialog | Tab cycles within | Background marked `inert` | Closes dialog to opener |

Switch local tabs cleanly on click and Left or Right arrow keys, toggling hidden state on the paired tabpanel:

```html
<div class="ds-tabs">
  <div role="tablist" aria-label="Account transfers">
    <button type="button" role="tab" id="tab-recent" aria-selected="true"
            aria-controls="panel-recent" tabindex="0">Recent</button>
    <button type="button" role="tab" id="tab-scheduled" aria-selected="false"
            aria-controls="panel-scheduled" tabindex="-1">Scheduled</button>
    <button type="button" role="tab" id="tab-archived" aria-selected="false"
            aria-controls="panel-archived" tabindex="-1">Archived</button>
  </div>
  <section role="tabpanel" id="panel-recent" aria-labelledby="tab-recent" tabindex="0"></section>
  <section role="tabpanel" id="panel-scheduled" aria-labelledby="tab-scheduled" tabindex="0" hidden></section>
  <section role="tabpanel" id="panel-archived" aria-labelledby="tab-archived" tabindex="0" hidden></section>
</div>
```

```js
function initTabs(tablist) {
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  function selectTab(target, moveFocus) {
    tabs.forEach((tab) => {
      const active = tab === target;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = !active;
    });
    if (moveFocus) target.focus();
  }
  tablist.addEventListener("click", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) selectTab(tab, false);
  });
  tablist.addEventListener("keydown", (e) => {
    const idx = tabs.indexOf(document.activeElement);
    if (idx < 0) return;
    const map = {
      ArrowRight: (idx + 1) % tabs.length,
      ArrowLeft: (idx - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1
    };
    if (e.key in map) { e.preventDefault(); selectTab(tabs[map[e.key]], true); }
  });
}
```

## Airy sortable tables and shape status cues

Give tables comfortable 12px to 15px vertical row padding that tightens smoothly in compact mode, using calm horizontal hairlines and zero vertical prison borders. Put semantic buttons inside sortable headers and render statuses as quiet inline SVG silhouettes paired with plain words rather than colorful pill confetti or circular dots:

```html
<div class="ds-table-wrap">
  <table class="ds-table">
    <thead>
      <tr>
        <th scope="col">Recipient</th>
        <th scope="col">Status</th>
        <th scope="col">Updated</th>
        <th scope="col" data-numeric="true" aria-sort="descending">
          <button type="button" class="ds-sort-btn" data-sort-key="amount">
            Amount
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <path d="M2.5 4L5.5 7.2L8.5 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Northwind Paper Co.</td>
        <td>
          <span class="ds-status" data-tone="warning">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 1.75L10.75 10.25H1.25Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            </svg>
            Awaiting approval
          </span>
        </td>
        <td><time datetime="2026-11-05">4m ago</time></td>
        <td data-numeric="true" class="num">&minus;$1,240.00</td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.ds-table-wrap {
  overflow-x: auto;
  scroll-padding-top: 2.75rem;
  border-block: 1px solid var(--border-hairline);
}
.ds-table { inline-size: 100%; border-collapse: separate; border-spacing: 0; }
.ds-table th, .ds-table td {
  padding: 0.85rem 1rem;
  text-align: start;
  border-block-end: 1px solid var(--border-hairline);
}
[data-density="compact"] .ds-table th,
[data-density="compact"] .ds-table td { padding-block: 0.45rem; }
.ds-table thead th {
  position: sticky; inset-block-start: 0; background: var(--surface-canvas);
  font: 550 0.8125rem / 1.3 var(--font-ui); color: var(--ink-secondary);
}
.ds-status {
  display: inline-flex; align-items: center; gap: 0.375rem;
  font: 500 0.8125rem / 1.3 var(--font-ui); color: var(--ink-secondary);
}
.ds-status[data-tone="warning"] { color: var(--signal-warning); }
.ds-status[data-tone="critical"] { color: var(--signal-critical); }
```

## Focus managed modal dialogs drawers and polite status

Open modal dialogs and side drawers via native top-layer showModal calls over a calmed dark OKLCH backdrop. Mark the background app shell inert while open and restore focus to the opener button whenever Escape or Cancel closes the dialog:

```html
<button type="button" class="ds-btn ds-btn-primary" data-open-modal="#send-dialog">
  Send transfer
</button>
<dialog class="ds-dialog" id="send-dialog" aria-labelledby="send-dialog-title">
  <form method="dialog" class="l-stack">
    <h2 id="send-dialog-title">Send transfer to Northwind Paper</h2>
    <p class="ds-hint">Arrives tomorrow morning with zero wire fee.</p>
    <p class="num">Amount: $1,240.00 (remaining balance $38,760.00)</p>
    <div class="l-cluster">
      <button type="button" class="ds-btn ds-btn-secondary" data-close-dialog>Cancel</button>
      <button type="submit" class="ds-btn ds-btn-primary">Confirm transfer</button>
    </div>
  </form>
</dialog>

<div class="ds-polite-bar" role="status" aria-live="polite" id="polite-notice" hidden></div>
```

```js
function wireModalDialog(dialogEl, triggerAttr) {
  let opener = null;
  const shell = document.querySelector("[data-app-shell]");
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[" + triggerAttr + "]");
    if (!btn) return;
    opener = btn;
    if (shell) shell.inert = true;
    dialogEl.showModal();
  });
  dialogEl.addEventListener("close", () => {
    if (shell) shell.inert = false;
    if (opener && typeof opener.focus === "function") opener.focus();
  });
  dialogEl.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-dialog]")) dialogEl.close("cancel");
  });
}
```

Boot with zero corner toast clutter and replace polite notices cleanly inside one status bar so multiple messages never stack. Provide tailored empty states for first-run setup, zero-match searches with a one-click Reset filters trigger, and clear recovery steps on errors.

## Density scaling and forced colors preservation

Switch comfortable and compact density strictly via spacing and row-height variables so column alignments stay steady, while guaranteeing 44 by 44 CSS pixel tap targets on touch screens. Preserve 1px solid transparent borders at rest and map active states to system keywords under Windows Contrast Themes so custom controls never disappear when shadows strip out:

```css
@media (forced-colors: active) {
  .ds-btn-primary,
  input[type="checkbox"]:checked,
  input[type="radio"]:checked,
  .ds-switch[aria-checked="true"] .ds-switch-track,
  [role="tab"][aria-selected="true"] {
    background-color: Highlight;
    color: HighlightText;
    border: 1px solid Highlight;
  }

  .ds-btn,
  .ds-input,
  .ds-select,
  input[type="checkbox"],
  input[type="radio"],
  [role="switch"],
  .ds-range,
  .surface-card,
  dialog {
    border: 1px solid ButtonText;
  }

  .ds-btn[aria-disabled="true"],
  .ds-btn:disabled {
    color: GrayText;
    border-color: GrayText;
  }

  .token-swatch-chip { forced-color-adjust: none; }
}
```
