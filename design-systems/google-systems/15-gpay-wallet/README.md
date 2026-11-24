# 15. Google Pay & Wallet Design System (gpay Flutter tokens)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/gpay/versions/v0_12_80/flutter/lib/src/sys/color.dart`
  - `//depot/google3/ux/tokens/design_systems/gpay/versions/v0_12_80/flutter/lib/src/sys/color_extended_light.dart`
  - `//depot/google3/ux/tokens/design_systems/gpay/versions/v0_12_80/flutter/lib/src/sys/color_extended_dark.dart`
  - `//depot/google3/ux/tokens/design_systems/gpay/config.textproto`
- **Carbon Design System**: `gpay (design_system_id slug)` · version `0.12.80`
- **Internal Documentation**: go/gmdc-flutter-tokens · go/carbon-service-docs
- **Frameworks**: Flutter (material_ui TokenColor / TokenColorExtended)
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**Google Pay / Wallet (`gpay` 0.12.80)** — Dual (Light #FFFFFF / #F0F4F9 + Dark, protected-surface variants); Mobile-First Wallet (card stack, 56-72px transaction rows).

1. **GM3 Core + Payments Extended Palette**: Core roles match GM3 baseline (`primary` `#0B57D0`, `surface-container` `#F0F4F9`, `secondary-container` `#C2E7FF`) while `TokenColorExtended` adds payment semantics: `positive` `#146C2E`, `alert` `#B3261E`, `caution` `#BF502B`, `attention` `#0B57D0` and matching `*-container` fills.
2. **Money-Movement Visual Language**: Spend insights use `chart` `#009EBB` / `chart-highlight` `#003641` and category pies (`pie-chart-blue` `#3271EA`, `-cyan` `#00839B`, `-green` `#128937`, `-orange` `#C05A01`, `-red` `#DB372D`).
3. **Rewards & Referral Containers**: Warm promotional containers — `rewards-container` `#FFEFD6` / `on-rewards-container` `#694B00`, `referrals-container` `#DCF5FD` / `#005868` — plus four-color `qr-*` brand dots and a `star-rating` `#FFBB29`.

**Core palette**: `surface_light` `#FFFFFF` · `surface_container_light` `#F0F4F9` · `surface_dark` `#131314 (inferred)` · `primary` `#0B57D0` · `positive` `#146C2E` · `caution` `#BF502B` · `chart` `#009EBB` · `rewards_container` `#FFEFD6` · `star_rating` `#FFBB29`

**Type**: `Google Sans`, `Google Sans Text`, `Roboto` · **Token prefix**: `--gpay-sys-color-*`

---

## 2. Token Reference (`0.12.80`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--gpay-sys-color-surface` | `gpay.sys.color.surface` | `#FFFFFF` | `#131314 (inferred)` | Wallet canvas |
| `--gpay-sys-color-surface-container` | `gpay.sys.color.surface-container` | `#F0F4F9` | `#1E1F20 (inferred)` | Quick-action tiles |
| `--gpay-sys-color-primary` | `gpay.sys.color.primary` | `#0B57D0` | `#A8C7FA (inferred)` | Pay / send CTAs |
| `--gpay-sys-color-positive` | `gpay.sys.color.extended.positive` | `#146C2E` | `#6DD58C` | Received / success |
| `--gpay-sys-color-caution` | `gpay.sys.color.extended.caution` | `#BF502B` | `#FBDEBC` | Pending / review |
| `--gpay-sys-color-alert` | `gpay.sys.color.extended.alert` | `#B3261E` | `#F2B8B5` | Declined / fraud alert |
| `--gpay-sys-color-chart` | `gpay.sys.color.extended.chart` | `#009EBB` | `#00839B` | Spend trend line |
| `--gpay-sys-color-rewards-container` | `gpay.sys.color.extended.rewards-container` | `#FFEFD6` | `—` | Rewards tile |

---

## 3. Signature Components

- Payment-Method Card Stack with FOP Logo Backgrounds (fop-logo-background)
- Balance & Spend Insight with Pie-Chart Category Colors (pie-chart-*)
- Transaction List with Positive/Alert Status Containers
- Rewards / Referrals / QR Pay Quick-Action Tiles (qr-blue/green/red/yellow)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#07` / `#09` / `#11` fintech & payments**: card stack, balance, transaction list with positive/alert semantics.
- **`#17` mobile POS** and **`#32` consumer wallet apps**: QR pay, rewards and referral tiles at `390px`.
- Pair with `03-acx-ads` for desktop finance reporting; GPay is optimized for one-hand mobile flows.

Recommended archetypes: `#07`, `#09`, `#11`, `#17`, `#32`
