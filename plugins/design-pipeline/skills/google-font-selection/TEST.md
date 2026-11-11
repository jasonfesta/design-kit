# Google Font Selection v2 — End-to-End Test Plan

Verifies that `google-font-selection` fetches Google's live catalog data, uses a model (or the host agent) to associate any input with Google's official tags, ranks the whole catalog, and never reports a false match.

## Test Case 1: Novel word → real fonts
> "Give me 5 wacky Google Fonts."

1. Translation yields `/Theme/Wacky` as the primary tag (plus Playful/Awkward).
2. Top 5 are families scoring 100 on `/Theme/Wacky` (e.g. Kablammo, Danfo, Eater, Fontdiner Swanky, Irish Grover); `confidence: high`.
3. Output includes the `fonts.google.com/?categoryFilters=Appearance:%2FTheme%2FWacky…` URL, CSS2 `<link>` embeds, and 4 download methods per font.

## Test Case 2: Nonsense input → honest failure
> "Fonts for asdfgh"

1. `status: low_confidence`, `interpretation_hint` present, no `PASS` verdicts.
2. The agent re-translates or tells the user the input has no typographic meaning; it does not present the fallbacks as recommendations.

## Test Case 3: Agent-authored brief (image or complex brief)
> Upload a poster image / "a haunted carnival poster"

1. Agent writes `brief.json` with official tags only (hallucinated tags are dropped and listed in `dropped_tags`).
2. `--brief brief.json` returns 5 families with ≥ 70 on the primary tag; `translated_by: agent`.

## Automated Verification

```bash
python3 scripts/test_google_font_skill.py                          # ALL TESTS PASSED (live data; golden suite needs a model key)
GEMINI_API_KEY=... python3 scripts/recommend_google_fonts.py --run-eval-suite   # 33/33 via model
python3 scripts/build_specimen.py                                  # rebuild the live x20 page
python3 ../skill-maker/scripts/validate_and_wrap.py --skill-dir=.
```
