# deterministic `2x` density, zero-drift & sharpness dev eval (`nano-banana`)

Before `jason-dev-agent` embeds an upscaled image into a Golden Template React build or sends it to `jason-design-agent`, it stops and runs this five-gate dev self-eval in sandboxed mode (`BypassSandbox: false`).

---

## 1. quick one-shot python audit snippet

Run this standard-library + ImageMagick check in `/tmp` (or inline via `python3 -c`) to verify Gates 1–4 on every `(low_res_path, high_res_path, css_w, css_h)` tuple:

```bash
python3 - <<'PY'
import json, subprocess

def magick_vals(cmd):
    return subprocess.check_output(["/usr/bin/magick"] + cmd, text=True).strip()

def eval_plate(low_path, hi_path, css_w, css_h, clean_plate=False):
    lw, lh = map(int, magick_vals(["identify", "-format", "%w %h", low_path]).split())
    hw, hh, cs = magick_vals(["identify", "-format", "%w %h %[colorspace]", hi_path]).split()
    hw, hh = int(hw), int(hh)

    # Gate 1: >= 2x Retina pixel density
    density_ok = (hw >= 2 * css_w) and (hh >= 2 * css_h) and ("sRGB" in cs)

    # Gate 2: <= 0.5% aspect drift vs target CSS box
    target_ar = css_w / css_h
    actual_ar = hw / hh
    ar_drift = abs(actual_ar - target_ar) / target_ar
    aspect_ok = ar_drift <= 0.005

    # Gate 3: 8x8 coarse color/structure lock vs low-res source
    rmse_raw = magick_vals([
        "(", low_path, "-colorspace", "sRGB", "-scale", "8x8!", ")",
        "(", hi_path,  "-colorspace", "sRGB", "-scale", "8x8!", ")",
        "-metric", "MAE", "-compare", "-format", "%[distortion]", "info:"
    ])
    mae_255 = float(rmse_raw) * 255.0
    drift_limit = 18.0 if clean_plate else 12.0
    drift_ok = mae_255 <= drift_limit

    # Gate 4: sharpness gain vs bicubic upscale of low-res crop
    bicubic_lap = float(magick_vals([
        low_path, "-resize", f"{hw}x{hh}!", "-colorspace", "Gray",
        "-define", "convolve:scale=!", "-morphology", "Convolve", "Laplacian:0",
        "-format", "%[fx:standard_deviation*255]", "info:"
    ]))
    hi_lap = float(magick_vals([
        hi_path, "-colorspace", "Gray",
        "-define", "convolve:scale=!", "-morphology", "Convolve", "Laplacian:0",
        "-format", "%[fx:standard_deviation*255]", "info:"
    ]))
    sharp_ratio = hi_lap / max(bicubic_lap, 0.01)
    sharp_ok = sharp_ratio >= 1.15

    return {
        "hi_px": f"{hw}x{hh}",
        "target_2x": f"{2*css_w}x{2*css_h}",
        "density_ok": density_ok,
        "ar_drift_pct": round(ar_drift * 100, 3),
        "aspect_ok": aspect_ok,
        "mae_8x8_rgb": round(mae_255, 2),
        "drift_ok": drift_ok,
        "sharpness_gain": round(sharp_ratio, 2),
        "sharp_ok": sharp_ok,
        "passed": all([density_ok, aspect_ok, drift_ok, sharp_ok]),
    }

# Example usage:
# print(json.dumps(eval_plate("/tmp/low.png", "/tmp/hi_2x.png", 440, 560), indent=2))
PY
```

---

## 2. unboxed studio border-seam check (gate 5 helper)

When a freestanding silhouette sits on a solid surface token (such as `#FBF6EE`), verify the outer `2px` perimeter matches `--surface` within `<= 2` RGB units so no faint rectangular box edge appears on desktop or mobile:

```bash
# Sample top-left & top-right corner pixels of the 2x plate
/usr/bin/magick "/tmp/crops/bag_2x.png" -format "%[hex:p{2,2}] %[hex:p{w-3,2}]\n" info:
```

If `nano-banana` shifted a `#FBF6EE` studio ground slightly to `#F9F3EA` (`delta == 3`), flood-normalize or feather-key the outer perimeter back to `#FBF6EE` in ImageMagick before embedding so seamless grounding matches `replicate-mock`'s purity rules.

---

## 3. failure modes & remediation table

| symptom | failed gate | root cause | deterministic fix |
| :--- | :--- | :--- | :--- |
| `Cannot articulate aspect ratio` error | pre-flight | Input crop has `W / H > 4.0` (ultra-wide ribbon/banner). | Pad vertically with `#F5F0E8` to `W / H = 3.0`, run `nano-banana`, and center-crop back to `2*W x 2*H`. |
| `mae_8x8_rgb > 12` (warmth or subject shifted) | gate 3 (`drift_ok`) | Prompt was too open-ended or omitted `100% hex palette & framing lock`. | Re-run with Template A (`strict 1:1 fidelity and zero semantic drift`) and explicitly name the primary hex colors. |
| Faint ghost letters visible under live `<h1>` | gate 4 (`clean_plate`) | Clean-plate prompt didn't specify removing button/caption overlays. | Re-run with Template B naming the exact text string to remove (`remove the white serif text "..."`) and inspect via `read_file`. |
| `sharpness_gain < 1.15` or waxy skin/leather | gate 4 / `design-critique` | Model over-denoised micro-texture into plastic sheen. | Prompt explicitly for material grain (`pebbled full-grain calfskin`, `matte stoneware glaze`, `linen slub weave`) without artificial airbrushing. |
| Rectangular halo visible around unboxed bag | gate 5 (`seam-free`) | Background hex drifted by `2-5` RGB steps from CSS `--surface`. | Use Template C with explicit `<HEX_SURFACE>` and normalize outer border background to exact `--surface`. |
