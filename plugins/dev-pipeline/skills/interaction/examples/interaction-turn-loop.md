# walkthrough: multi-turn interaction loop (`jason-dev-agent` <-> `jason-design-agent`)

This example traces how `jason-dev-agent` iterates `interaction` until passing its dev eval, then runs the paired interaction critique back in `jason-design-agent`.

---

## turn 1 — `jason-dev-agent` stops & judges initial build (`failed`)

`jason-dev-agent` audits every element on a newly translated 5-section editorial commerce page:
- **dead elements found (`3`)**:
  1. Top-right `Bag (1)` button has no `onClick`.
  2. Three journal cards at the bottom use `<a href="#">`.
  3. Hero video-poster `||` pause button and `0:08` bar are static icons.
- **pattern gaps**:
  - Product trio shows 4 finish dots per card, but clicking dots does nothing.
  - Workshop triptych has 3 static photos with no story detail when clicked.
- **verdict**: `failed` (`dead_control_count = 3`). `jason-dev-agent` does **not** hand off to `jason-design-agent` yet.

---

## turn 2 — `jason-dev-agent` wires all controls & upgrades patterns (`passed` dev eval)

`jason-dev-agent` updates `src/data/*Data.ts` and `src/components/*.tsx` while keeping `t=0` untouched:
- Wires `Bag (1)` to a slide-over bag drawer with `- 1 +` stepper and live `tabular-nums` subtotal.
- Wires all 4 finish swatches per card (`role="group"` sibling buttons) to swap finish photography and metadata.
- Wires the hero video-poster `play/pause` and `mute` buttons to `videoRef.current`.
- Replaces `href="#"` on the journal cards with an interactive **story reader drawer** including `previous / next story` pagination (`01 / 03`), and makes the lookbook strip keyboard- and button-steppable as a **slider** (`01 / 05`, starting at the exact `t=0` trio).
- Re-runs element audit + `eval-image-to-react.mjs`: `0` dead controls, `0` collisions, `0` overflow, `t=0` `s_total = 0.94` -> **dev eval passed**.

---

## turn 3 — paired interaction critique in `jason-design-agent`

`jason-dev-agent` sends the passed interaction map and state screenshots back to `jason-design-agent` alongside the original Polène / Hereu inspiration:
- **`jason-design-agent` turn 1 response (`changes_requested`)**:
  - *"Every control works and the journal story drawer fits the quiet editorial voice well. One addition from the original workshop inspiration: make the 3-step craft sequence ('pattern -> cut -> saddle stitch') interactive so clicking or scrolling through each step highlights its tool callout and lets the user step the craft story inline, and add subtle pagination pills below the mobile lookbook slider."*
- **`jason-dev-agent` turn 3 patch & re-check**:
  - Adds the interactive 3-step craft story state (defaulting to the exact `t=0` view) and mobile slider pagination pills.
  - Re-verifies `interaction` dev eval (`0` dead elements, `0` overflow) + `responsiveness` dev eval + `image-to-react` `t=0` eval.
  - Sends updated states to `jason-design-agent` -> **`approved`**.
