# paired `jason-dev-agent` <-> `jason-design-agent` pipeline (`image-to-react`)

This reference documents how `jason-dev-agent` sequences all packaged skills when translating an image or multi-screen grid into a finished Golden Template React application, pairing every dev-side self-eval with a mirrored designer critique in `jason-design-agent`.

---

## 1. end-to-end stage & skill map

```text
step 0 (testing gate): prompt user -> "how many turns do you want out of the design agent?" -> N
   │
   ▼
original inspiration + reference image (from jason-design-agent)
   │
   ▼
0a. replicate-mock ──► exact hex tokens, pixel measurements, bit-for-bit crops
   │
   ▼
0b. nano-banana    ──► low-res -> 2x retina / 4k upscale [dev eval: >=2x, <=0.5% ar, 0 drift]
   │                   └──► pass ──► [design-critique (up to N turns): material & photo realism]
   ▼
1.  image-to-react ──► [dev eval: s_total >= 0.85+, 0 collisions, button/grid craft]
   │                   └──► pass ──► [design-critique (up to N turns): visuals vs. inspiration]
   ▼
2.  responsiveness ──► [dev eval: desktop + mobile + 320px..1536px sweep + 1 dom]
   │                   └──► pass ──► [design-critique (up to N turns): responsive art direction]
   ▼
3.  interaction    ──► [dev eval: 0 dead elements + sliders/pagination/scroll/story]
   │                   └──► pass ──► [design-critique (up to N turns): interaction & story depth]
   ▼
4.  feel           ──► [dev eval: tactile press + gpu curves + timing + 0 shift]
   │                   └──► pass ──► [design-critique (up to N turns): feel & holistic sign-off]
   ▼
shipped golden template react build (dist/index.html + src/)
```

---

## 2. rules of engagement across turns

0. **ask for `jason-design-agent` turn count up front *(testing mode)***:
   - At the start of a run, if the user has not already given a turn budget, prompt: **"how many turns do you want out of the design agent?"** (`1`, `2`, `3`, `until approved`, or custom `N`; `0` runs dev evals only). Reuse that `design_agent_turns = N` across the stages in the run.
1. **stop and judge on every stage**:
   - `jason-dev-agent` never rushes straight from initial JSX generation to final delivery in one unverified pass.
   - At each stage (`image-to-react`, `responsiveness`, `interaction`, `feel`), `jason-dev-agent` runs multiple turns, stopping at the end of each turn to run that stage's **dev eval** until every hard gate passes.
2. **mirror every passed dev eval into `jason-design-agent`**:
   - Passing a dev eval is necessary but not sufficient. Immediately after passing any dev eval on the dev side, `jason-dev-agent` runs the **same stage as a designer critique** going back into `jason-design-agent` (via `design-critique`), anchored to `jason-design-agent`'s original inspiration (`taste` + `atlas` + reference sources).
3. **never regress earlier gates on later turns**:
   - Adding a slider in `interaction` or tuning drawer springs in `feel` must never break `t=0` visual match (`image-to-react`) or `320px` overflow (`responsiveness`). Whenever `jason-dev-agent` patches code for a later stage or a `jason-design-agent` request, it re-verifies upstream dev gates before advancing.
