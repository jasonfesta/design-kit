#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Compute Wilson confidence intervals and summary metrics over CSV or JSONL playtest logs."""

from __future__ import annotations

import argparse
import csv
import json
import math
from pathlib import Path
import statistics
import sys
from typing import Any


def wilson_interval(successes: int, total: int, z: float = 1.959963984540054) -> dict[str, float]:
    """Return exact point estimate and Wilson score interval for a binomial proportion."""
    if total <= 0:
        return {"k": 0, "n": 0, "rate": 0.0, "ci_low": 0.0, "ci_high": 1.0}
    p = successes / total
    z2 = z * z
    denom = 1.0 + z2 / total
    center = (p + z2 / (2.0 * total)) / denom
    half = (z / denom) * math.sqrt((p * (1.0 - p) / total) + (z2 / (4.0 * total * total)))
    return {
        "k": successes,
        "n": total,
        "rate": round(p, 4),
        "ci_low": round(max(0.0, center - half), 4),
        "ci_high": round(min(1.0, center + half), 4),
    }


def load_episode_rows(input_path: Path) -> list[dict[str, Any]]:
    """Load episode records from JSONL, JSON list, or CSV without imposing a fixed schema."""
    raw = input_path.read_text(encoding="utf-8").strip()
    if not raw:
        return []
    suffix = input_path.suffix.lower()
    if suffix == ".csv":
        reader = csv.DictReader(raw.splitlines())
        return [dict(row) for row in reader]
    if suffix == ".json" and raw.startswith("["):
        parsed = json.loads(raw)
        if not isinstance(parsed, list):
            raise ValueError("JSON file must contain a list of episode objects.")
        return [dict(item) for item in parsed if isinstance(item, dict)]

    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(raw.splitlines(), start=1):
        stripped = line.strip()
        if not stripped:
            continue
        obj = json.loads(stripped)
        if not isinstance(obj, dict):
            raise ValueError(f"Line {line_no} is not a JSON object.")
        rows.append(obj)
    return rows


def _is_truthy(val: Any) -> bool:
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return val > 0
    if isinstance(val, str):
        return val.strip().lower() in {"1", "true", "yes", "y"}
    return False


def assay_episodes(
    rows: list[dict[str, Any]],
    outcome_col: str | None = "outcome",
    win_values: set[str] | None = None,
    stalemate_values: set[str] | None = None,
    option_col: str | None = None,
    comeback_col: str | None = None,
    duration_col: str | None = None,
    min_episodes: int = 1,
    max_stalemate_rate: float | None = None,
    min_option_share: float | None = None,
) -> dict[str, Any]:
    """Summarize playtest episode rows with Wilson 95% intervals and optional threshold checks."""
    wins_set = {s.lower() for s in (win_values or {"win", "clear", "solved", "victory", "1", "true"})}
    draw_set = {s.lower() for s in (stalemate_values or {"draw", "stalemate", "timeout", "undecided"})}

    n = len(rows)
    errors: list[str] = []
    if n < min_episodes:
        errors.append(f"Episode count {n} is below required minimum {min_episodes}.")

    summary: dict[str, Any] = {
        "ok": True,
        "episodes": n,
        "errors": errors,
    }
    if n == 0:
        summary["ok"] = False
        if not errors:
            errors.append("No episode rows found.")
        return summary

    if outcome_col and any(outcome_col in r for r in rows):
        outcomes = [str(r.get(outcome_col, "")).strip().lower() for r in rows]
        win_k = sum(1 for o in outcomes if o in wins_set)
        draw_k = sum(1 for o in outcomes if o in draw_set)
        summary["win_or_clear"] = wilson_interval(win_k, n)
        summary["stalemate_or_timeout"] = wilson_interval(draw_k, n)
        if max_stalemate_rate is not None and (draw_k / n) > max_stalemate_rate:
            errors.append(
                f"Stalemate/timeout rate {draw_k / n:.1%} exceeds ceiling {max_stalemate_rate:.1%}."
            )

    if comeback_col and any(comeback_col in r for r in rows):
        eligible = [r for r in rows if r.get(comeback_col) is not None and str(r.get(comeback_col)).strip() != ""]
        cb_k = sum(1 for r in eligible if _is_truthy(r.get(comeback_col)))
        summary["comeback"] = wilson_interval(cb_k, len(eligible))

    if duration_col and any(duration_col in r for r in rows):
        vals: list[float] = []
        for r in rows:
            raw_v = r.get(duration_col)
            if raw_v is None or str(raw_v).strip() == "":
                continue
            vals.append(float(raw_v))
        if vals:
            vals_sorted = sorted(vals)
            q1 = vals_sorted[len(vals_sorted) // 4]
            q3 = vals_sorted[(3 * len(vals_sorted)) // 4]
            summary["duration"] = {
                "count": len(vals_sorted),
                "median": round(statistics.median(vals_sorted), 3),
                "iqr": [round(q1, 3), round(q3, 3)],
                "min": round(vals_sorted[0], 3),
                "max": round(vals_sorted[-1], 3),
            }

    if option_col and any(option_col in r for r in rows):
        by_opt: dict[str, list[dict[str, Any]]] = {}
        for r in rows:
            raw_opt = r.get(option_col)
            if raw_opt is None:
                continue
            opts = [str(x) for x in raw_opt] if isinstance(raw_opt, list) else [str(raw_opt).strip()]
            for opt in opts:
                if opt:
                    by_opt.setdefault(opt, []).append(r)

        opt_report: dict[str, Any] = {}
        for opt_name in sorted(by_opt):
            sub = by_opt[opt_name]
            pick_stats = wilson_interval(len(sub), n)
            entry: dict[str, Any] = {"pick_share": pick_stats}
            if outcome_col and any(outcome_col in r for r in sub):
                opt_wins = sum(1 for r in sub if str(r.get(outcome_col, "")).strip().lower() in wins_set)
                entry["win_rate"] = wilson_interval(opt_wins, len(sub))
            opt_report[opt_name] = entry
            if min_option_share is not None and (len(sub) / n) < min_option_share:
                errors.append(
                    f"Option {opt_name!r} pick share {len(sub) / n:.1%} is below floor {min_option_share:.1%}."
                )
        summary["options"] = opt_report

    summary["ok"] = len(errors) == 0
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Compute Wilson 95% intervals and summary metrics from CSV or JSONL playtest rows."
    )
    parser.add_argument("--input", type=Path, required=True, help="Path to .jsonl, .json, or .csv episode log")
    parser.add_argument("--outcome-col", type=str, default="outcome", help="Column holding episode outcome")
    parser.add_argument(
        "--win-values",
        type=str,
        default="win,clear,solved,victory,1,true",
        help="Comma-separated values treated as win or clear",
    )
    parser.add_argument(
        "--stalemate-values",
        type=str,
        default="draw,stalemate,timeout,undecided",
        help="Comma-separated values treated as stalemate or timeout",
    )
    parser.add_argument("--option-col", type=str, default=None, help="Optional column for loadout/card/tool choice")
    parser.add_argument("--comeback-col", type=str, default=None, help="Optional boolean column for deficit recovery")
    parser.add_argument("--duration-col", type=str, default=None, help="Optional numeric column for episode length")
    parser.add_argument("--min-episodes", type=int, default=1, help="Minimum episode count required")
    parser.add_argument("--max-stalemate-rate", type=float, default=None, help="Optional max stalemate fraction")
    parser.add_argument("--min-option-share", type=float, default=None, help="Optional min pick share per option")
    parser.add_argument("--json", action="store_true", help="Print JSON report (default output is also JSON)")
    args = parser.parse_args()

    rows = load_episode_rows(args.input)
    report = assay_episodes(
        rows,
        outcome_col=args.outcome_col,
        win_values={x.strip() for x in args.win_values.split(",") if x.strip()},
        stalemate_values={x.strip() for x in args.stalemate_values.split(",") if x.strip()},
        option_col=args.option_col,
        comeback_col=args.comeback_col,
        duration_col=args.duration_col,
        min_episodes=args.min_episodes,
        max_stalemate_rate=args.max_stalemate_rate,
        min_option_share=args.min_option_share,
    )
    print(json.dumps(report, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
