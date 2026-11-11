#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Check simulation source files for browser/clock leaks and optional replay parity."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from typing import Any

CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".mjs", ".cjs", ".py"}

BASE_FORBIDDEN_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("unseeded Math.random()", re.compile(r"\bMath\.random\s*\(")),
    ("unseeded Python random module", re.compile(r"\brandom\.(?:random|randint|uniform|choice|shuffle)\s*\(")),
    ("wall-clock Date.now / new Date()", re.compile(r"\bDate\.now\s*\(|\bnew\s+Date\s*\(\s*\)")),
    ("wall-clock performance.now()", re.compile(r"\bperformance\.now\s*\(")),
    ("wall-clock time.time()", re.compile(r"\btime\.(?:time|monotonic|perf_counter)\s*\(")),
    ("browser DOM or storage global", re.compile(r"\b(?:window|document|localStorage|sessionStorage|navigator)\b")),
    ("requestAnimationFrame in simulation", re.compile(r"\brequestAnimationFrame\s*\(")),
    ("WebAudio context in simulation", re.compile(r"\b(?:AudioContext|webkitAudioContext|OfflineAudioContext)\b")),
    ("renderer import in simulation", re.compile(r"\b(?:THREE|Phaser|PIXI)\b|from\s+['\"](?:three|phaser|pixi\.js)['\"]")),
]

CROSS_ENGINE_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (
        "engine-dependent Math transcendental (use fixed-point, LUT, or fround approximation in cross-engine lockstep)",
        re.compile(r"\bMath\.(?:sin|cos|tan|atan2|acos|asin|sinh|cosh|tanh)\s*\("),
    ),
]


def _strip_comments_and_strings(source: str, suffix: str) -> str:
    """Remove comments while preserving line numbers so findings point to real code."""
    if suffix == ".py":
        return re.sub(r"#.*$", "", source, flags=re.M)

    def _blank_newlines(match: re.Match[str]) -> str:
        return "\n" * match.group(0).count("\n")

    no_block = re.sub(r"/\*[\s\S]*?\*/", _blank_newlines, source)
    return re.sub(r"//.*$", "", no_block, flags=re.M)


def collect_source_files(sim_path: Path) -> list[Path]:
    if not sim_path.exists():
        return []
    if sim_path.is_file():
        return [sim_path] if sim_path.suffix.lower() in CODE_EXTENSIONS else []
    return sorted(
        p
        for p in sim_path.rglob("*")
        if p.is_file()
        and p.suffix.lower() in CODE_EXTENSIONS
        and not p.name.startswith("test_")
        and not p.name.endswith(".test.ts")
        and not p.name.endswith(".test.js")
        and not p.name.endswith(".spec.ts")
        and not p.name.endswith(".spec.js")
    )


def audit_sim_path(sim_path: Path, cross_engine: bool = False) -> dict[str, Any]:
    """Scan simulation source file(s) and return structured findings."""
    errors: list[str] = []
    if not sim_path.exists():
        return {
            "ok": False,
            "checked_files": 0,
            "cross_engine": cross_engine,
            "replay_hash": None,
            "errors": [f"Simulation path does not exist: {sim_path}"],
        }

    files = collect_source_files(sim_path)
    if not files:
        return {
            "ok": False,
            "checked_files": 0,
            "cross_engine": cross_engine,
            "replay_hash": None,
            "errors": [f"No simulation source files found at: {sim_path}"],
        }

    patterns = list(BASE_FORBIDDEN_PATTERNS)
    if cross_engine:
        patterns.extend(CROSS_ENGINE_PATTERNS)

    base_root = sim_path if sim_path.is_dir() else sim_path.parent
    for path in files:
        raw = path.read_text(encoding="utf-8", errors="replace")
        clean = _strip_comments_and_strings(raw, path.suffix.lower())
        rel = path.relative_to(base_root)
        for label, pat in patterns:
            for match in pat.finditer(clean):
                line_no = clean[: match.start()].count("\n") + 1
                errors.append(f"{rel}:{line_no}: forbidden {label} -> {match.group(0)!r}")

    return {
        "ok": len(errors) == 0,
        "checked_files": len(files),
        "cross_engine": cross_engine,
        "replay_hash": None,
        "errors": errors,
    }


def run_double_check_command(cmd: str) -> tuple[str | None, list[str]]:
    """Execute a headless command twice and verify identical stdout SHA-256."""
    hashes: list[str] = []
    samples: list[str] = []
    for run_idx in (1, 2):
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if res.returncode != 0:
            detail = res.stderr.strip() or res.stdout.strip()
            return None, [f"Check run {run_idx} exited with code {res.returncode}: {detail}"]
        out = res.stdout.strip()
        samples.append(out[:160])
        hashes.append(hashlib.sha256(out.encode("utf-8")).hexdigest())

    if hashes[0] != hashes[1]:
        return None, [
            f"Headless output diverged between run 1 ({hashes[0][:12]}) and run 2 ({hashes[1][:12]}): "
            f"{samples[0]!r} vs {samples[1]!r}"
        ]
    return hashes[0], []


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check simulation files for browser/clock leaks and optional headless replay parity."
    )
    path_group = parser.add_mutually_exclusive_group(required=True)
    path_group.add_argument("--sim-path", type=Path, help="Simulation source file or directory")
    path_group.add_argument("--sim-dir", type=Path, help="Alias for --sim-path")
    parser.add_argument(
        "--cross-engine",
        action="store_true",
        help="Also flag engine-dependent Math.sin/cos/tan/atan2 calls for Tier 3 cross-browser lockstep",
    )
    parser.add_argument(
        "--check-cmd",
        "--replay-cmd",
        dest="check_cmd",
        type=str,
        default=None,
        help="Optional headless command to run twice and compare output hashes",
    )
    parser.add_argument("--json", action="store_true", help="Print structured JSON result")
    args = parser.parse_args()

    target = args.sim_path or args.sim_dir
    report = audit_sim_path(target, cross_engine=args.cross_engine)
    if report["ok"] and args.check_cmd:
        replay_hash, cmd_errors = run_double_check_command(args.check_cmd)
        report["replay_hash"] = replay_hash
        report["errors"].extend(cmd_errors)
        report["ok"] = len(report["errors"]) == 0

    if args.json:
        print(json.dumps(report, indent=2))
    elif report["ok"]:
        print(f"[PASS] {target} ({report['checked_files']} file(s)) passed simulation determinism checks.")
    else:
        for err in report["errors"]:
            print(f"[FAIL] {err}", file=sys.stderr)

    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
