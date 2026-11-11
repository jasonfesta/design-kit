# Six Interactive Design Systems — Product & Marketing Component Library

Complete offline-first installation of the **Six Interactive Design Systems** (`Switchyard`, `Ledgermark`, `Civicgate`, `Fieldrig`, `Folio Archive`, `Wardline`) and the **`design-system-creation`** skill specification inside WDA (`/usr/local/google/home/jfesta/wda/design-systems/`).

- **Source Directory Index**: `index.html` (*Six interactive design systems — Product & Workspace systems*)
- **Source Marketing Index**: `marketing.html` (*Marketing and media components across all six systems*)
- **Skill & Verification Suite**: `SKILL.md`, `references/`, `scripts/verify_design_system.py`, `scripts/font_manifest.json` (also installed in `/usr/local/google/home/jfesta/wda/skills/design-system-creation/` and `/usr/local/google/home/jfesta/wda/skills/product-design-system/`)
- **Component Registry**: `registry.json`

---

## Summary Counts

| Category | Count | Location |
| :--- | :---: | :--- |
| **Interactive Design Systems** | **6** | `systems/*.html` & `marketing/*.html` |
| **Product Workspaces (`#workspace`)** | **6** | `components/product/<system>/00-workspace.html` |
| **Token & Typography Foundations (`#tokens`)** | **6** | `components/product/<system>/01-foundations-tokens.html` |
| **Product Component Specimen Modules (`#components`)** | **26** | `components/product/<system>/02-*.html` .. `06-*.html` |
| **Product Modal Dialogs & Slide-Over Drawers** | **13** | `components/product/<system>/snippets/overlay-*.partial.html` |
| **Marketing & Media Component Chapters** | **36** | `components/marketing/<system>/01-*.html` .. `06-*.html` |
| **Marketing Onboarding / Booking Dialogs** | **6** | `components/marketing/<system>/snippets/overlay-*.partial.html` |
| **Extracted Two-Layer OKLCH Token CSS Sheets** | **12** | `tokens/<system>-product.css` & `tokens/<system>-marketing.css` |
| **Self-Hosted Offline WOFF2 Font Bundles** | **7** | `fonts/*-fonts.css` (`directory`, `switchyard`, `ledgermark`, `civicgate`, `fieldrig`, `folioarchive`, `wardline`) |
| **Lossless PNG / WebP Media Assets** | **42** | `images/*` |

---

## The Six Design Systems

| System | Archetype | Domain | Self-Hosted WOFF2 Fonts | Product System | Marketing System |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Switchyard** | Precision Technical Studio | Developer Infrastructure, CI/CD & Observability | `Space Grotesk`, `IBM Plex Sans`, `JetBrains Mono` | [`systems/switchyard.html`](systems/switchyard.html) | [`marketing/switchyard.html`](marketing/switchyard.html) |
| **Ledgermark** | Institutional Fiduciary | Operating Treasury, Cash Management & Settlement | `Source Serif 4`, `Instrument Sans`, `IBM Plex Mono` | [`systems/ledgermark.html`](systems/ledgermark.html) | [`marketing/ledgermark.html`](marketing/ledgermark.html) |
| **Civicgate** | High-Legibility Civic Forms | Municipal Permits, Public Tariffs & Statutory Services | `Public Sans`, `Source Code Pro` | [`systems/civicgate.html`](systems/civicgate.html) | [`marketing/civicgate.html`](marketing/civicgate.html) |
| **Fieldrig** | Tactile Industrial Instrument | Four-Track Audio Hardware, Field Recording & Modular Kits | `Archivo`, `Azeret Mono` | [`systems/fieldrig.html`](systems/fieldrig.html) | [`marketing/fieldrig.html`](marketing/fieldrig.html) |
| **Folio Archive** | Gallery Monograph & Archival Catalogue | Exhibition Catalogues, Conservation Plates & Timed Entry | `Fraunces`, `Newsreader`, `Work Sans` | [`systems/folioarchive.html`](systems/folioarchive.html) | [`marketing/folioarchive.html`](marketing/folioarchive.html) |
| **Wardline** | Calm Clinical & Biometric Daylight | Preventive Medicine, Biomarker Translation & Lab Draws | `Source Sans 3`, `Fira Code` | [`systems/wardline.html`](systems/wardline.html) | [`marketing/wardline.html`](marketing/wardline.html) |

---

## Complete Product & Marketing Component Catalog by System

### Switchyard — *Release and Issue Design System*

- **Archetype**: Precision Technical Studio (Developer Infrastructure, CI/CD & Observability)
- **Full Product System Page**: [`systems/switchyard.html`](systems/switchyard.html)
- **Full Marketing System Page**: [`marketing/switchyard.html`](marketing/switchyard.html)
- **Token & Component CSS**: [`tokens/switchyard-product.css`](tokens/switchyard-product.css) · [`tokens/switchyard-marketing.css`](tokens/switchyard-marketing.css)
- **Offline WOFF2 Font Bundle**: [`fonts/switchyard-fonts.css`](fonts/switchyard-fonts.css)

#### Product Components (Workspaces, Foundations, Specimens & Overlays)

| Slug | Kind | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `00-workspace` | `workspace` | Core API · Release 24.11 | [`components/product/switchyard/00-workspace.html`](components/product/switchyard/00-workspace.html) | [`components/product/switchyard/snippets/00-workspace.partial.html`](components/product/switchyard/snippets/00-workspace.partial.html) |
| `01-foundations-tokens` | `foundations` | Foundations — Color Swatches & Typography Specimens | [`components/product/switchyard/01-foundations-tokens.html`](components/product/switchyard/01-foundations-tokens.html) | [`components/product/switchyard/snippets/01-foundations-tokens.partial.html`](components/product/switchyard/snippets/01-foundations-tokens.partial.html) |
| `02-deploy-actions` | `product-component` | Deploy actions | [`components/product/switchyard/02-deploy-actions.html`](components/product/switchyard/02-deploy-actions.html) | [`components/product/switchyard/snippets/02-deploy-actions.partial.html`](components/product/switchyard/snippets/02-deploy-actions.partial.html) |
| `03-webhook-endpoint` | `product-component` | Webhook endpoint | [`components/product/switchyard/03-webhook-endpoint.html`](components/product/switchyard/03-webhook-endpoint.html) | [`components/product/switchyard/snippets/03-webhook-endpoint.partial.html`](components/product/switchyard/snippets/03-webhook-endpoint.partial.html) |
| `04-rollout-gates` | `product-component` | Rollout gates | [`components/product/switchyard/04-rollout-gates.html`](components/product/switchyard/04-rollout-gates.html) | [`components/product/switchyard/snippets/04-rollout-gates.partial.html`](components/product/switchyard/snippets/04-rollout-gates.partial.html) |
| `05-commit-inspection` | `product-component` | Commit inspection | [`components/product/switchyard/05-commit-inspection.html`](components/product/switchyard/05-commit-inspection.html) | [`components/product/switchyard/snippets/05-commit-inspection.partial.html`](components/product/switchyard/snippets/05-commit-inspection.partial.html) |
| `06-promotion-and-alerts` | `product-component` | Promotion and alerts | [`components/product/switchyard/06-promotion-and-alerts.html`](components/product/switchyard/06-promotion-and-alerts.html) | [`components/product/switchyard/snippets/06-promotion-and-alerts.partial.html`](components/product/switchyard/snippets/06-promotion-and-alerts.partial.html) |
| `overlay-promote-dialog` | `dialog/drawer` | Promote Release 24.11 (`#promote-dialog`) | *(Embedded in standalone pages)* | [`components/product/switchyard/snippets/overlay-promote-dialog.partial.html`](components/product/switchyard/snippets/overlay-promote-dialog.partial.html) |
| `overlay-issue-drawer` | `dialog/drawer` | Release activity (`#issue-drawer`) | *(Embedded in standalone pages)* | [`components/product/switchyard/snippets/overlay-issue-drawer.partial.html`](components/product/switchyard/snippets/overlay-issue-drawer.partial.html) |
| `overlay-cmdk-dialog` | `dialog/drawer` | Jump to section (`#cmdk-dialog`) | *(Embedded in standalone pages)* | [`components/product/switchyard/snippets/overlay-cmdk-dialog.partial.html`](components/product/switchyard/snippets/overlay-cmdk-dialog.partial.html) |

#### Marketing & Media Components

| Slug | Section ID | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `01-image-guidelines` | `#image-guidelines` | Photography and frame ratios | [`components/marketing/switchyard/01-image-guidelines.html`](components/marketing/switchyard/01-image-guidelines.html) | [`components/marketing/switchyard/snippets/01-image-guidelines.partial.html`](components/marketing/switchyard/snippets/01-image-guidelines.partial.html) |
| `02-hero-banner` | `#hero-banner` | Background-image hero | [`components/marketing/switchyard/02-hero-banner.html`](components/marketing/switchyard/02-hero-banner.html) | [`components/marketing/switchyard/snippets/02-hero-banner.partial.html`](components/marketing/switchyard/snippets/02-hero-banner.partial.html) |
| `03-install-stage` | `#install-stage` | CLI install command | [`components/marketing/switchyard/03-install-stage.html`](components/marketing/switchyard/03-install-stage.html) | [`components/marketing/switchyard/snippets/03-install-stage.partial.html`](components/marketing/switchyard/snippets/03-install-stage.partial.html) |
| `04-editorial-proof` | `#editorial-proof` | Customer portrait and release log | [`components/marketing/switchyard/04-editorial-proof.html`](components/marketing/switchyard/04-editorial-proof.html) | [`components/marketing/switchyard/snippets/04-editorial-proof.partial.html`](components/marketing/switchyard/snippets/04-editorial-proof.partial.html) |
| `05-pricing-tiers` | `#pricing-tiers` | Seat pricing cards | [`components/marketing/switchyard/05-pricing-tiers.html`](components/marketing/switchyard/05-pricing-tiers.html) | [`components/marketing/switchyard/snippets/05-pricing-tiers.partial.html`](components/marketing/switchyard/snippets/05-pricing-tiers.partial.html) |
| `06-cta-band` | `#cta-band` | Background-image signup band | [`components/marketing/switchyard/06-cta-band.html`](components/marketing/switchyard/06-cta-band.html) | [`components/marketing/switchyard/snippets/06-cta-band.partial.html`](components/marketing/switchyard/snippets/06-cta-band.partial.html) |

### Ledgermark — *Operating Treasury Design System*

- **Archetype**: Institutional Fiduciary (Operating Treasury, Cash Management & Settlement)
- **Full Product System Page**: [`systems/ledgermark.html`](systems/ledgermark.html)
- **Full Marketing System Page**: [`marketing/ledgermark.html`](marketing/ledgermark.html)
- **Token & Component CSS**: [`tokens/ledgermark-product.css`](tokens/ledgermark-product.css) · [`tokens/ledgermark-marketing.css`](tokens/ledgermark-marketing.css)
- **Offline WOFF2 Font Bundle**: [`fonts/ledgermark-fonts.css`](fonts/ledgermark-fonts.css)

#### Product Components (Workspaces, Foundations, Specimens & Overlays)

| Slug | Kind | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `00-workspace` | `workspace` | Operating cash | [`components/product/ledgermark/00-workspace.html`](components/product/ledgermark/00-workspace.html) | [`components/product/ledgermark/snippets/00-workspace.partial.html`](components/product/ledgermark/snippets/00-workspace.partial.html) |
| `01-foundations-tokens` | `foundations` | Foundations — Color Swatches & Typography Specimens | [`components/product/ledgermark/01-foundations-tokens.html`](components/product/ledgermark/01-foundations-tokens.html) | [`components/product/ledgermark/snippets/01-foundations-tokens.partial.html`](components/product/ledgermark/snippets/01-foundations-tokens.partial.html) |
| `02-move-money` | `product-component` | Move money | [`components/product/ledgermark/02-move-money.html`](components/product/ledgermark/02-move-money.html) | [`components/product/ledgermark/snippets/02-move-money.partial.html`](components/product/ledgermark/snippets/02-move-money.partial.html) |
| `03-account-limits-and-routing` | `product-component` | Account limits and routing | [`components/product/ledgermark/03-account-limits-and-routing.html`](components/product/ledgermark/03-account-limits-and-routing.html) | [`components/product/ledgermark/snippets/03-account-limits-and-routing.partial.html`](components/product/ledgermark/snippets/03-account-limits-and-routing.partial.html) |
| `04-approval-rules` | `product-component` | Approval rules | [`components/product/ledgermark/04-approval-rules.html`](components/product/ledgermark/04-approval-rules.html) | [`components/product/ledgermark/snippets/04-approval-rules.partial.html`](components/product/ledgermark/snippets/04-approval-rules.partial.html) |
| `05-statements-and-alerts` | `product-component` | Statements and alerts | [`components/product/ledgermark/05-statements-and-alerts.html`](components/product/ledgermark/05-statements-and-alerts.html) | [`components/product/ledgermark/snippets/05-statements-and-alerts.partial.html`](components/product/ledgermark/snippets/05-statements-and-alerts.partial.html) |
| `overlay-transfer-dialog` | `dialog/drawer` | Send transfer (`#transfer-dialog`) | *(Embedded in standalone pages)* | [`components/product/ledgermark/snippets/overlay-transfer-dialog.partial.html`](components/product/ledgermark/snippets/overlay-transfer-dialog.partial.html) |
| `overlay-receipt-drawer` | `dialog/drawer` | Northstar Design Studio (`#receipt-drawer`) | *(Embedded in standalone pages)* | [`components/product/ledgermark/snippets/overlay-receipt-drawer.partial.html`](components/product/ledgermark/snippets/overlay-receipt-drawer.partial.html) |

#### Marketing & Media Components

| Slug | Section ID | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `01-image-guidelines` | `#image-guidelines` | Editorial photography and portraits | [`components/marketing/ledgermark/01-image-guidelines.html`](components/marketing/ledgermark/01-image-guidelines.html) | [`components/marketing/ledgermark/snippets/01-image-guidelines.partial.html`](components/marketing/ledgermark/snippets/01-image-guidelines.partial.html) |
| `02-editorial-hero` | `#editorial-hero` | Editorial split hero | [`components/marketing/ledgermark/02-editorial-hero.html`](components/marketing/ledgermark/02-editorial-hero.html) | [`components/marketing/ledgermark/snippets/02-editorial-hero.partial.html`](components/marketing/ledgermark/snippets/02-editorial-hero.partial.html) |
| `03-background-stage` | `#background-stage` | Architectural background-image banner | [`components/marketing/ledgermark/03-background-stage.html`](components/marketing/ledgermark/03-background-stage.html) | [`components/marketing/ledgermark/snippets/03-background-stage.partial.html`](components/marketing/ledgermark/snippets/03-background-stage.partial.html) |
| `04-customer-proof` | `#customer-proof` | Executive quote and settlement table | [`components/marketing/ledgermark/04-customer-proof.html`](components/marketing/ledgermark/04-customer-proof.html) | [`components/marketing/ledgermark/snippets/04-customer-proof.partial.html`](components/marketing/ledgermark/snippets/04-customer-proof.partial.html) |
| `05-fee-schedule` | `#fee-schedule` | Treasury fee schedule | [`components/marketing/ledgermark/05-fee-schedule.html`](components/marketing/ledgermark/05-fee-schedule.html) | [`components/marketing/ledgermark/snippets/05-fee-schedule.partial.html`](components/marketing/ledgermark/snippets/05-fee-schedule.partial.html) |
| `06-application-states` | `#application-states` | Onboarding form states | [`components/marketing/ledgermark/06-application-states.html`](components/marketing/ledgermark/06-application-states.html) | [`components/marketing/ledgermark/snippets/06-application-states.partial.html`](components/marketing/ledgermark/snippets/06-application-states.partial.html) |

### Civicgate — *Public Service Design System*

- **Archetype**: High-Legibility Civic Forms (Municipal Permits, Public Tariffs & Statutory Services)
- **Full Product System Page**: [`systems/civicgate.html`](systems/civicgate.html)
- **Full Marketing System Page**: [`marketing/civicgate.html`](marketing/civicgate.html)
- **Token & Component CSS**: [`tokens/civicgate-product.css`](tokens/civicgate-product.css) · [`tokens/civicgate-marketing.css`](tokens/civicgate-marketing.css)
- **Offline WOFF2 Font Bundle**: [`fonts/civicgate-fonts.css`](fonts/civicgate-fonts.css)

#### Product Components (Workspaces, Foundations, Specimens & Overlays)

| Slug | Kind | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `00-workspace` | `workspace` | Tell us about your vehicle | [`components/product/civicgate/00-workspace.html`](components/product/civicgate/00-workspace.html) | [`components/product/civicgate/snippets/00-workspace.partial.html`](components/product/civicgate/snippets/00-workspace.partial.html) |
| `01-foundations-tokens` | `foundations` | Foundations — Color Swatches & Typography Specimens | [`components/product/civicgate/01-foundations-tokens.html`](components/product/civicgate/01-foundations-tokens.html) | [`components/product/civicgate/snippets/01-foundations-tokens.partial.html`](components/product/civicgate/snippets/01-foundations-tokens.partial.html) |
| `02-start-and-confirmation-actions` | `product-component` | Start and confirmation actions | [`components/product/civicgate/02-start-and-confirmation-actions.html`](components/product/civicgate/02-start-and-confirmation-actions.html) | [`components/product/civicgate/snippets/02-start-and-confirmation-actions.partial.html`](components/product/civicgate/snippets/02-start-and-confirmation-actions.partial.html) |
| `03-registration-and-zone-questions` | `product-component` | Registration and zone questions | [`components/product/civicgate/03-registration-and-zone-questions.html`](components/product/civicgate/03-registration-and-zone-questions.html) | [`components/product/civicgate/snippets/03-registration-and-zone-questions.partial.html`](components/product/civicgate/snippets/03-registration-and-zone-questions.partial.html) |
| `04-eligibility-choices-and-permit-cap` | `product-component` | Eligibility choices and permit cap | [`components/product/civicgate/04-eligibility-choices-and-permit-cap.html`](components/product/civicgate/04-eligibility-choices-and-permit-cap.html) | [`components/product/civicgate/snippets/04-eligibility-choices-and-permit-cap.partial.html`](components/product/civicgate/snippets/04-eligibility-choices-and-permit-cap.partial.html) |
| `05-application-review-table-and-notices` | `product-component` | Application review table and notices | [`components/product/civicgate/05-application-review-table-and-notices.html`](components/product/civicgate/05-application-review-table-and-notices.html) | [`components/product/civicgate/snippets/05-application-review-table-and-notices.partial.html`](components/product/civicgate/snippets/05-application-review-table-and-notices.partial.html) |
| `overlay-permit-modal` | `dialog/drawer` | Update permit details (`#permit-modal`) | *(Embedded in standalone pages)* | [`components/product/civicgate/snippets/overlay-permit-modal.partial.html`](components/product/civicgate/snippets/overlay-permit-modal.partial.html) |
| `overlay-fee-drawer` | `dialog/drawer` | Zone B annual fees (`#fee-drawer`) | *(Embedded in standalone pages)* | [`components/product/civicgate/snippets/overlay-fee-drawer.partial.html`](components/product/civicgate/snippets/overlay-fee-drawer.partial.html) |

#### Marketing & Media Components

| Slug | Section ID | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `01-image-guidelines` | `#image-guidelines` | Documentary photography and captions | [`components/marketing/civicgate/01-image-guidelines.html`](components/marketing/civicgate/01-image-guidelines.html) | [`components/marketing/civicgate/snippets/01-image-guidelines.partial.html`](components/marketing/civicgate/snippets/01-image-guidelines.partial.html) |
| `02-service-start` | `#service-start` | Service start hero | [`components/marketing/civicgate/02-service-start.html`](components/marketing/civicgate/02-service-start.html) | [`components/marketing/civicgate/snippets/02-service-start.partial.html`](components/marketing/civicgate/snippets/02-service-start.partial.html) |
| `03-fee-estimator` | `#fee-estimator` | Household tariff calculator | [`components/marketing/civicgate/03-fee-estimator.html`](components/marketing/civicgate/03-fee-estimator.html) | [`components/marketing/civicgate/snippets/03-fee-estimator.partial.html`](components/marketing/civicgate/snippets/03-fee-estimator.partial.html) |
| `04-tariff-table` | `#tariff-table` | Published tariff table and audit block | [`components/marketing/civicgate/04-tariff-table.html`](components/marketing/civicgate/04-tariff-table.html) | [`components/marketing/civicgate/snippets/04-tariff-table.partial.html`](components/marketing/civicgate/snippets/04-tariff-table.partial.html) |
| `05-background-banner` | `#background-banner` | Background-image reminder banner | [`components/marketing/civicgate/05-background-banner.html`](components/marketing/civicgate/05-background-banner.html) | [`components/marketing/civicgate/snippets/05-background-banner.partial.html`](components/marketing/civicgate/snippets/05-background-banner.partial.html) |
| `06-form-states` | `#form-states` | Registration input and alert states | [`components/marketing/civicgate/06-form-states.html`](components/marketing/civicgate/06-form-states.html) | [`components/marketing/civicgate/snippets/06-form-states.partial.html`](components/marketing/civicgate/snippets/06-form-states.partial.html) |

### Fieldrig — *Portable Studio Design System*

- **Archetype**: Tactile Industrial Instrument (Four-Track Audio Hardware, Field Recording & Modular Kits)
- **Full Product System Page**: [`systems/fieldrig.html`](systems/fieldrig.html)
- **Full Marketing System Page**: [`marketing/fieldrig.html`](marketing/fieldrig.html)
- **Token & Component CSS**: [`tokens/fieldrig-product.css`](tokens/fieldrig-product.css) · [`tokens/fieldrig-marketing.css`](tokens/fieldrig-marketing.css)
- **Offline WOFF2 Font Bundle**: [`fonts/fieldrig-fonts.css`](fonts/fieldrig-fonts.css)

#### Product Components (Workspaces, Foundations, Specimens & Overlays)

| Slug | Kind | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `00-workspace` | `workspace` | TP-4 Four-Track Mixer | [`components/product/fieldrig/00-workspace.html`](components/product/fieldrig/00-workspace.html) | [`components/product/fieldrig/snippets/00-workspace.partial.html`](components/product/fieldrig/snippets/00-workspace.partial.html) |
| `01-foundations-tokens` | `foundations` | Foundations — Color Swatches & Typography Specimens | [`components/product/fieldrig/01-foundations-tokens.html`](components/product/fieldrig/01-foundations-tokens.html) | [`components/product/fieldrig/snippets/01-foundations-tokens.partial.html`](components/product/fieldrig/snippets/01-foundations-tokens.partial.html) |
| `02-transport` | `product-component` | Transport | [`components/product/fieldrig/02-transport.html`](components/product/fieldrig/02-transport.html) | [`components/product/fieldrig/snippets/02-transport.partial.html`](components/product/fieldrig/snippets/02-transport.partial.html) |
| `03-monitor-output` | `product-component` | Monitor output | [`components/product/fieldrig/03-monitor-output.html`](components/product/fieldrig/03-monitor-output.html) | [`components/product/fieldrig/snippets/03-monitor-output.partial.html`](components/product/fieldrig/snippets/03-monitor-output.partial.html) |
| `04-reel-bounce` | `product-component` | Reel bounce | [`components/product/fieldrig/04-reel-bounce.html`](components/product/fieldrig/04-reel-bounce.html) | [`components/product/fieldrig/snippets/04-reel-bounce.partial.html`](components/product/fieldrig/snippets/04-reel-bounce.partial.html) |
| `05-session-takes` | `product-component` | Session takes | [`components/product/fieldrig/05-session-takes.html`](components/product/fieldrig/05-session-takes.html) | [`components/product/fieldrig/snippets/05-session-takes.partial.html`](components/product/fieldrig/snippets/05-session-takes.partial.html) |
| `overlay-bounce-modal` | `dialog/drawer` | Bounce stereo mix (`#bounce-modal`) | *(Embedded in standalone pages)* | [`components/product/fieldrig/snippets/overlay-bounce-modal.partial.html`](components/product/fieldrig/snippets/overlay-bounce-modal.partial.html) |
| `overlay-notes-drawer` | `dialog/drawer` | Reel 04 microphone notes (`#notes-drawer`) | *(Embedded in standalone pages)* | [`components/product/fieldrig/snippets/overlay-notes-drawer.partial.html`](components/product/fieldrig/snippets/overlay-notes-drawer.partial.html) |

#### Marketing & Media Components

| Slug | Section ID | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `01-product-photography` | `#product-photography` | Studio and session photography | [`components/marketing/fieldrig/01-product-photography.html`](components/marketing/fieldrig/01-product-photography.html) | [`components/marketing/fieldrig/snippets/01-product-photography.partial.html`](components/marketing/fieldrig/snippets/01-product-photography.partial.html) |
| `02-hardware-hero` | `#hardware-hero` | Studio product showcase and buy bar | [`components/marketing/fieldrig/02-hardware-hero.html`](components/marketing/fieldrig/02-hardware-hero.html) | [`components/marketing/fieldrig/snippets/02-hardware-hero.partial.html`](components/marketing/fieldrig/snippets/02-hardware-hero.partial.html) |
| `03-macro-banner` | `#macro-banner` | Macro background-image feature stage | [`components/marketing/fieldrig/03-macro-banner.html`](components/marketing/fieldrig/03-macro-banner.html) | [`components/marketing/fieldrig/snippets/03-macro-banner.partial.html`](components/marketing/fieldrig/snippets/03-macro-banner.partial.html) |
| `04-spec-bento` | `#spec-bento` | Measured specification bento | [`components/marketing/fieldrig/04-spec-bento.html`](components/marketing/fieldrig/04-spec-bento.html) | [`components/marketing/fieldrig/snippets/04-spec-bento.partial.html`](components/marketing/fieldrig/snippets/04-spec-bento.partial.html) |
| `05-kit-configurator` | `#kit-configurator` | Modular hardware configurator | [`components/marketing/fieldrig/05-kit-configurator.html`](components/marketing/fieldrig/05-kit-configurator.html) | [`components/marketing/fieldrig/snippets/05-kit-configurator.partial.html`](components/marketing/fieldrig/snippets/05-kit-configurator.partial.html) |
| `06-allocation-form` | `#allocation-form` | Batch reservation and editorial proof states | [`components/marketing/fieldrig/06-allocation-form.html`](components/marketing/fieldrig/06-allocation-form.html) | [`components/marketing/fieldrig/snippets/06-allocation-form.partial.html`](components/marketing/fieldrig/snippets/06-allocation-form.partial.html) |

### Folio Archive — *Museum and Editorial Design System*

- **Archetype**: Gallery Monograph & Archival Catalogue (Exhibition Catalogues, Conservation Plates & Timed Entry)
- **Full Product System Page**: [`systems/folioarchive.html`](systems/folioarchive.html)
- **Full Marketing System Page**: [`marketing/folioarchive.html`](marketing/folioarchive.html)
- **Token & Component CSS**: [`tokens/folioarchive-product.css`](tokens/folioarchive-product.css) · [`tokens/folioarchive-marketing.css`](tokens/folioarchive-marketing.css)
- **Offline WOFF2 Font Bundle**: [`fonts/folioarchive-fonts.css`](fonts/folioarchive-fonts.css)

#### Product Components (Workspaces, Foundations, Specimens & Overlays)

| Slug | Kind | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `00-workspace` | `workspace` | Colour as Structure , 1954–1978 | [`components/product/folioarchive/00-workspace.html`](components/product/folioarchive/00-workspace.html) | [`components/product/folioarchive/snippets/00-workspace.partial.html`](components/product/folioarchive/snippets/00-workspace.partial.html) |
| `01-foundations-tokens` | `foundations` | Foundations — Color Swatches & Typography Specimens | [`components/product/folioarchive/01-foundations-tokens.html`](components/product/folioarchive/01-foundations-tokens.html) | [`components/product/folioarchive/snippets/01-foundations-tokens.partial.html`](components/product/folioarchive/snippets/01-foundations-tokens.partial.html) |
| `02-fig-1-visitor-reservation-and-checklist-actions` | `product-component` | Fig. 1 — Visitor reservation and checklist actions | [`components/product/folioarchive/02-fig-1-visitor-reservation-and-checklist-actions.html`](components/product/folioarchive/02-fig-1-visitor-reservation-and-checklist-actions.html) | [`components/product/folioarchive/snippets/02-fig-1-visitor-reservation-and-checklist-actions.partial.html`](components/product/folioarchive/snippets/02-fig-1-visitor-reservation-and-checklist-actions.partial.html) |
| `03-fig-2-timed-entry-pass-request` | `product-component` | Fig. 2 — Timed-entry pass request | [`components/product/folioarchive/03-fig-2-timed-entry-pass-request.html`](components/product/folioarchive/03-fig-2-timed-entry-pass-request.html) | [`components/product/folioarchive/snippets/03-fig-2-timed-entry-pass-request.partial.html`](components/product/folioarchive/snippets/03-fig-2-timed-entry-pass-request.partial.html) |
| `04-fig-3-gallery-room-and-edition-selection` | `product-component` | Fig. 3 — Gallery room and edition selection | [`components/product/folioarchive/04-fig-3-gallery-room-and-edition-selection.html`](components/product/folioarchive/04-fig-3-gallery-room-and-edition-selection.html) | [`components/product/folioarchive/snippets/04-fig-3-gallery-room-and-edition-selection.partial.html`](components/product/folioarchive/snippets/04-fig-3-gallery-room-and-edition-selection.partial.html) |
| `05-fig-4-archive-room-navigation-and-catalogue-index` | `product-component` | Fig. 4 — Archive room navigation and catalogue index | [`components/product/folioarchive/05-fig-4-archive-room-navigation-and-catalogue-index.html`](components/product/folioarchive/05-fig-4-archive-room-navigation-and-catalogue-index.html) | [`components/product/folioarchive/snippets/05-fig-4-archive-room-navigation-and-catalogue-index.partial.html`](components/product/folioarchive/snippets/05-fig-4-archive-room-navigation-and-catalogue-index.partial.html) |
| `06-fig-5-timed-entry-booking-and-reading-room-provenance` | `product-component` | Fig. 5 — Timed entry booking and reading-room provenance | [`components/product/folioarchive/06-fig-5-timed-entry-booking-and-reading-room-provenance.html`](components/product/folioarchive/06-fig-5-timed-entry-booking-and-reading-room-provenance.html) | [`components/product/folioarchive/snippets/06-fig-5-timed-entry-booking-and-reading-room-provenance.partial.html`](components/product/folioarchive/snippets/06-fig-5-timed-entry-booking-and-reading-room-provenance.partial.html) |
| `overlay-pass-dialog` | `dialog/drawer` | Reserve timed pass (`#pass-dialog`) | *(Embedded in standalone pages)* | [`components/product/folioarchive/snippets/overlay-pass-dialog.partial.html`](components/product/folioarchive/snippets/overlay-pass-dialog.partial.html) |
| `overlay-work-drawer` | `dialog/drawer` | Study for Warm Meridian (`#work-drawer`) | *(Embedded in standalone pages)* | [`components/product/folioarchive/snippets/overlay-work-drawer.partial.html`](components/product/folioarchive/snippets/overlay-work-drawer.partial.html) |

#### Marketing & Media Components

| Slug | Section ID | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `01-image-guidelines` | `#image-guidelines` | Conservation plates and archive photography | [`components/marketing/folioarchive/01-image-guidelines.html`](components/marketing/folioarchive/01-image-guidelines.html) | [`components/marketing/folioarchive/snippets/01-image-guidelines.partial.html`](components/marketing/folioarchive/snippets/01-image-guidelines.partial.html) |
| `02-poster-hero` | `#poster-hero` | Exhibition background-image poster | [`components/marketing/folioarchive/02-poster-hero.html`](components/marketing/folioarchive/02-poster-hero.html) | [`components/marketing/folioarchive/snippets/02-poster-hero.partial.html`](components/marketing/folioarchive/snippets/02-poster-hero.partial.html) |
| `03-gallery-tabs` | `#gallery-tabs` | Room showcase switcher | [`components/marketing/folioarchive/03-gallery-tabs.html`](components/marketing/folioarchive/03-gallery-tabs.html) | [`components/marketing/folioarchive/snippets/03-gallery-tabs.partial.html`](components/marketing/folioarchive/snippets/03-gallery-tabs.partial.html) |
| `04-press-hours` | `#press-hours` | Critical excerpt and visitor hours | [`components/marketing/folioarchive/04-press-hours.html`](components/marketing/folioarchive/04-press-hours.html) | [`components/marketing/folioarchive/snippets/04-press-hours.partial.html`](components/marketing/folioarchive/snippets/04-press-hours.partial.html) |
| `05-admission-ledger` | `#admission-ledger` | Admission ledger and annual pass | [`components/marketing/folioarchive/05-admission-ledger.html`](components/marketing/folioarchive/05-admission-ledger.html) | [`components/marketing/folioarchive/snippets/05-admission-ledger.partial.html`](components/marketing/folioarchive/snippets/05-admission-ledger.partial.html) |
| `06-dispatch-signup` | `#dispatch-signup` | Seasonal dispatch signup states | [`components/marketing/folioarchive/06-dispatch-signup.html`](components/marketing/folioarchive/06-dispatch-signup.html) | [`components/marketing/folioarchive/snippets/06-dispatch-signup.partial.html`](components/marketing/folioarchive/snippets/06-dispatch-signup.partial.html) |

### Wardline — *Preventive Care and Clinical Design System*

- **Archetype**: Calm Clinical & Biometric Daylight (Preventive Medicine, Biomarker Translation & Lab Draws)
- **Full Product System Page**: [`systems/wardline.html`](systems/wardline.html)
- **Full Marketing System Page**: [`marketing/wardline.html`](marketing/wardline.html)
- **Token & Component CSS**: [`tokens/wardline-product.css`](tokens/wardline-product.css) · [`tokens/wardline-marketing.css`](tokens/wardline-marketing.css)
- **Offline WOFF2 Font Bundle**: [`fonts/wardline-fonts.css`](fonts/wardline-fonts.css)

#### Product Components (Workspaces, Foundations, Specimens & Overlays)

| Slug | Kind | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `00-workspace` | `workspace` | Claire Lindqvist | [`components/product/wardline/00-workspace.html`](components/product/wardline/00-workspace.html) | [`components/product/wardline/snippets/00-workspace.partial.html`](components/product/wardline/snippets/00-workspace.partial.html) |
| `01-foundations-tokens` | `foundations` | Foundations — Color Swatches & Typography Specimens | [`components/product/wardline/01-foundations-tokens.html`](components/product/wardline/01-foundations-tokens.html) | [`components/product/wardline/snippets/01-foundations-tokens.partial.html`](components/product/wardline/snippets/01-foundations-tokens.partial.html) |
| `02-medication-orders` | `product-component` | Medication orders | [`components/product/wardline/02-medication-orders.html`](components/product/wardline/02-medication-orders.html) | [`components/product/wardline/snippets/02-medication-orders.partial.html`](components/product/wardline/snippets/02-medication-orders.partial.html) |
| `03-home-cuff-alerts` | `product-component` | Home cuff alerts | [`components/product/wardline/03-home-cuff-alerts.html`](components/product/wardline/03-home-cuff-alerts.html) | [`components/product/wardline/snippets/03-home-cuff-alerts.partial.html`](components/product/wardline/snippets/03-home-cuff-alerts.partial.html) |
| `04-lab-check-in` | `product-component` | Lab check-in | [`components/product/wardline/04-lab-check-in.html`](components/product/wardline/04-lab-check-in.html) | [`components/product/wardline/snippets/04-lab-check-in.partial.html`](components/product/wardline/snippets/04-lab-check-in.partial.html) |
| `05-visit-record` | `product-component` | Visit record | [`components/product/wardline/05-visit-record.html`](components/product/wardline/05-visit-record.html) | [`components/product/wardline/snippets/05-visit-record.partial.html`](components/product/wardline/snippets/05-visit-record.partial.html) |
| `overlay-dosage-dialog` | `dialog/drawer` | Update dosage (`#dosage-dialog`) | *(Embedded in standalone pages)* | [`components/product/wardline/snippets/overlay-dosage-dialog.partial.html`](components/product/wardline/snippets/overlay-dosage-dialog.partial.html) |
| `overlay-history-drawer` | `dialog/drawer` | LDL cholesterol (`#history-drawer`) | *(Embedded in standalone pages)* | [`components/product/wardline/snippets/overlay-history-drawer.partial.html`](components/product/wardline/snippets/overlay-history-drawer.partial.html) |

#### Marketing & Media Components

| Slug | Section ID | Title | Standalone Page | HTML Snippet Partial |
| :--- | :--- | :--- | :--- | :--- |
| `01-image-guidelines` | `#image-guidelines` | Portrait direction and clinical daylight | [`components/marketing/wardline/01-image-guidelines.html`](components/marketing/wardline/01-image-guidelines.html) | [`components/marketing/wardline/snippets/01-image-guidelines.partial.html`](components/marketing/wardline/snippets/01-image-guidelines.partial.html) |
| `02-lifestyle-hero` | `#lifestyle-hero` | Background-image hero | [`components/marketing/wardline/02-lifestyle-hero.html`](components/marketing/wardline/02-lifestyle-hero.html) | [`components/marketing/wardline/snippets/02-lifestyle-hero.partial.html`](components/marketing/wardline/snippets/02-lifestyle-hero.partial.html) |
| `03-range-translator` | `#range-translator` | Plain-English biomarker range cards | [`components/marketing/wardline/03-range-translator.html`](components/marketing/wardline/03-range-translator.html) | [`components/marketing/wardline/snippets/03-range-translator.partial.html`](components/marketing/wardline/snippets/03-range-translator.partial.html) |
| `04-membership-card` | `#membership-card` | Flagship membership and partner selector | [`components/marketing/wardline/04-membership-card.html`](components/marketing/wardline/04-membership-card.html) | [`components/marketing/wardline/snippets/04-membership-card.partial.html`](components/marketing/wardline/snippets/04-membership-card.partial.html) |
| `05-park-banner` | `#park-banner` | Background-image clinic lookup stage | [`components/marketing/wardline/05-park-banner.html`](components/marketing/wardline/05-park-banner.html) | [`components/marketing/wardline/snippets/05-park-banner.partial.html`](components/marketing/wardline/snippets/05-park-banner.partial.html) |
| `06-booking-states` | `#booking-states` | Slot lookup and validation states | [`components/marketing/wardline/06-booking-states.html`](components/marketing/wardline/06-booking-states.html) | [`components/marketing/wardline/snippets/06-booking-states.partial.html`](components/marketing/wardline/snippets/06-booking-states.partial.html) |

---

## Verification & Skill References

- [`SKILL.md`](SKILL.md) — 11-Section Design System Creation specification (Two-layer OKLCH token cascade, light/dark polarity, compact/comfortable density, self-hosted WOFF2 typography, anti-shadcn traps, and 27+ component states).
- [`references/archetypes-and-optical-math.md`](references/archetypes-and-optical-math.md) — The 6 distinct design archetypes, optical alignment math, and typographic hierarchy.
- [`references/component-catalog-and-states.md`](references/component-catalog-and-states.md) — Product workspace, token specimen, and 5 core interactive product component patterns.
- [`references/marketing-components.md`](references/marketing-components.md) — Marketing and media component architecture (photography ratios, directional OKLCH scrims, hero banners, calculators, bento grids, pricing ledgers, and form validation states).
- [`references/anti-shadcn-traps.md`](references/anti-shadcn-traps.md) — Visual and structural traps to avoid.
- [`scripts/verify_design_system.py`](scripts/verify_design_system.py) — Headless Playwright audit verifying contrast, theme/density toggles, keyboard navigation, and zero console/network errors.
