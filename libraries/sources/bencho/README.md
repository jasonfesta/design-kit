# Bencho (bencho.dev)

150+ tunable micro-interactions sorted by press, hover, and drag, plus synthesized UI sounds, by Lorenzo Cabra. **MIT** (free tier).

- Site: https://bencho.dev · Repo: https://github.com/cabralorenzo/bencho · Index: https://bencho.dev/llms.txt
- Grabbed 2026-11-24

## What's here
| Path | Contents |
| :--- | :--- |
| `source/` | Full MIT repo (`cabralorenzo/bencho`, no `.git`): 47 interactive React + motion blocks in `blocks/`, synthesized Web Audio UI sounds in `sounds/sounds.ts`, `tokens.css`, `playground/` |
| `llms.txt` | Full catalog index of all 158+ Bencho blocks, finds, and sounds |

## Local blocks (47 MIT)
`action-node` · `ascii-wake` · `aspect` · `asset-swap` · `card-stack` · `card-swap` · `carousel` · `checklist` · `context-meter` · `dock` · `drag-ball` · `dynamic-island` · `emoji-reactions` · `escape` · `eye-tracker` · `folding-bill` · `generate` · `glass-bubble` · `heat-word` · `huddle` · `image-accordion` · `image-compare` · `label-input` · `like` · `liq-create` · `liq-toggle` · `magnet-select` · `one-time-code` · `palette` · `particles` · `picker` · `pull` · `rolling-counter` · `seek` · `signature` · `slide-confirm` · `slingshot` · `slosh` · `sound` · `stacked-bars` · `step-player` · `tilt` · `time-scrubber` · `toast-stack` · `todo-tower` · `upload-dropzone` · `voice-note` · `wake-slider`

## Use
Copy the target block folder from `source/blocks/<name>/` (and `source/tokens.css` or `source/sounds/sounds.ts` if needed) into your project's `src/components/`. Most blocks use `motion` (`motion/react`) + Tailwind; check each block's imports.
