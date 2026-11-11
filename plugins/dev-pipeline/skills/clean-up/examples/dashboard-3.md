# Example: clean-up on a dashboard page (run 2026-11-04)

```bash
python3 {skill_dir}/scripts/clean_up.py efferd-dashboard-3/index.html --out efferd-dashboard-3/distilled --name dashboard-3
```

Result: **PASS in 233 ms** (esbuild 91 ms). The source was a 75 KB single-file HTML page. Output:

| File | Size |
| :-- | :-- |
| `dashboard-3.prompt.md` | 50 lines |
| `dashboard-3.App.tsx` | 1,267 lines, 94 KB (charts are inline SVG), 28 icons, imports only `react` |
| `dashboard-3.preview.html` | 270 KB standalone bundle (React inlined) |

Issues the first runs caught, now fixed in the script:

- Library-internal `data-recharts-*` attributes leaked into the TSX. The pre-lint flagged them, and they are now dropped by `LIB_ATTR`.
- `style` and `script` text was read through the visible-text helper (empty). It now uses `raw_text`.
- Prompt labels fused adjacent numbers ("38" + "12.4%"). It now uses `words()` with separators.
- Chart detection missed charts made of `line` elements. It now uses viewBox width or shape count.
