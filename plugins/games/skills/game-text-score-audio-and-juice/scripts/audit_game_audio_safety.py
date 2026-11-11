#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Audit rendered PCM WAV game audio for clipping, silence, DC offset, loop clicks, and >6 kHz fatigue."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import struct
import sys
from typing import Any
import wave


def read_mono_float_samples(wav_path: Path) -> tuple[int, list[float]]:
    """Decode 16-bit, 24-bit, or 32-bit PCM WAV into normalized mono float samples in [-1, 1]."""
    with wave.open(str(wav_path), "rb") as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)

    if n_frames == 0:
        return framerate, []

    mono: list[float] = []
    if sampwidth == 2:
        total = n_frames * n_channels
        ints = struct.unpack(f"<{total}h", raw)
        scale = 32768.0
        for i in range(0, total, n_channels):
            mono.append(sum(ints[i : i + n_channels]) / (n_channels * scale))
    elif sampwidth == 3:
        step = 3 * n_channels
        scale = 8388608.0
        for base in range(0, len(raw), step):
            acc = 0.0
            for ch in range(n_channels):
                off = base + ch * 3
                val = int.from_bytes(raw[off : off + 3], byteorder="little", signed=True)
                acc += val / scale
            mono.append(acc / n_channels)
    elif sampwidth == 4:
        total = n_frames * n_channels
        ints = struct.unpack(f"<{total}i", raw)
        scale = 2147483648.0
        for i in range(0, total, n_channels):
            mono.append(sum(ints[i : i + n_channels]) / (n_channels * scale))
    else:
        raise ValueError(f"Expected 16/24/32-bit PCM WAV, got {sampwidth * 8}-bit.")

    return framerate, mono


def highpass_6khz_rms(samples: list[float], sample_rate: int) -> float:
    """First-order RC high-pass filter at 6 kHz measuring upper-band harshness."""
    if not samples:
        return 0.0
    rc = 1.0 / (2.0 * math.pi * 6000.0)
    dt = 1.0 / float(sample_rate)
    alpha = rc / (rc + dt)
    y_prev = 0.0
    x_prev = samples[0]
    acc = 0.0
    for x in samples:
        y = alpha * (y_prev + x - x_prev)
        acc += y * y
        y_prev = y
        x_prev = x
    return math.sqrt(acc / len(samples))


def audit_wav_file(
    wav_path: Path,
    check_loop_seam: bool = False,
    max_peak_dbfs: float = -1.0,
    max_hf_ratio: float = 0.18,
) -> dict[str, Any]:
    """Measure psychoacoustic safety and mastering metrics on a rendered WAV file."""
    if not wav_path.exists():
        return {"ok": False, "file": str(wav_path), "errors": [f"WAV file not found: {wav_path}"]}

    sr, samples = read_mono_float_samples(wav_path)
    duration_sec = len(samples) / float(sr) if sr > 0 else 0.0
    if duration_sec < 0.05:
        return {
            "ok": False,
            "file": wav_path.name,
            "sample_rate": sr,
            "duration_sec": round(duration_sec, 4),
            "errors": [f"{wav_path.name}: audio clip too short ({duration_sec:.3f} s < 0.050 s)."],
        }

    errors: list[str] = []
    peak = max(abs(x) for x in samples)
    rms = math.sqrt(sum(x * x for x in samples) / len(samples))
    dc_offset = sum(samples) / len(samples)

    if rms < 1e-4:
        errors.append(f"{wav_path.name}: rendered audio is silent (RMS={rms:.6f}).")
        return {
            "ok": False,
            "file": wav_path.name,
            "sample_rate": sr,
            "duration_sec": round(duration_sec, 4),
            "rms_dbfs": None,
            "peak_dbfs": None,
            "dc_offset": round(dc_offset, 6),
            "hf_6khz_ratio": 0.0,
            "errors": errors,
        }

    peak_dbfs = 20.0 * math.log10(max(peak, 1e-9))
    rms_dbfs = 20.0 * math.log10(max(rms, 1e-9))
    hf_rms = highpass_6khz_rms(samples, sr)
    hf_ratio = hf_rms / rms
    seam_jump = abs(samples[0] - samples[-1])

    if peak_dbfs > max_peak_dbfs:
        errors.append(
            f"{wav_path.name}: peak {peak_dbfs:.2f} dBFS exceeds {max_peak_dbfs:.2f} dBFS headroom ceiling."
        )
    if abs(dc_offset) > 0.02:
        errors.append(f"{wav_path.name}: DC offset {dc_offset:+.4f} exceeds +/-0.0200 limit.")
    if check_loop_seam and seam_jump > 0.05:
        errors.append(
            f"{wav_path.name}: loop boundary discontinuity |x[0]-x[-1]|={seam_jump:.3f} > 0.050 causes audible clicks."
        )
    if hf_ratio > max_hf_ratio:
        errors.append(
            f"{wav_path.name}: >6 kHz energy ratio {hf_ratio:.1%} exceeds {max_hf_ratio:.1%} listener comfort ceiling."
        )

    return {
        "ok": len(errors) == 0,
        "file": wav_path.name,
        "sample_rate": sr,
        "duration_sec": round(duration_sec, 4),
        "peak_dbfs": round(peak_dbfs, 2),
        "rms_dbfs": round(rms_dbfs, 2),
        "dc_offset": round(dc_offset, 6),
        "loop_seam_delta": round(seam_jump, 4),
        "hf_6khz_ratio": round(hf_ratio, 4),
        "errors": errors,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Audit a rendered WAV file for clipping, silence, DC offset, loop clicks, and >6 kHz screech."
    )
    parser.add_argument("--wav", type=Path, required=True, help="Path to 16/24/32-bit PCM .wav file")
    parser.add_argument("--loop", action="store_true", help="Also verify seamless loop-boundary continuity")
    parser.add_argument("--max-peak-dbfs", type=float, default=-1.0, help="Maximum allowed sample peak in dBFS")
    parser.add_argument("--max-hf-ratio", type=float, default=0.18, help="Maximum >6 kHz RMS / total RMS ratio")
    parser.add_argument("--json", action="store_true", help="Print structured JSON output")
    args = parser.parse_args()

    report = audit_wav_file(
        args.wav,
        check_loop_seam=args.loop,
        max_peak_dbfs=args.max_peak_dbfs,
        max_hf_ratio=args.max_hf_ratio,
    )
    if args.json:
        print(json.dumps(report, indent=2))
    elif report["ok"]:
        print(
            f"[PASS] {report['file']} passed acoustic safety checks "
            f"(peak {report['peak_dbfs']} dBFS, >6 kHz {report['hf_6khz_ratio']:.1%})."
        )
    else:
        for err in report["errors"]:
            print(f"[FAIL] {err}", file=sys.stderr)

    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
