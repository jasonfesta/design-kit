#!/usr/bin/env python3
"""translate_brief.py — the LLM association step: ANY word, phrase, brief, or image → Google Fonts' official tags.

No keyword dictionary. A model reads the request and chooses from the live tag vocabulary (fetched from Google):
  agent      (default inside Jetski) print the prompt; the host agent answers; pass the answer back with --from-json
  gemini     GEMINI_API_KEY / GOOGLE_API_KEY — text + images
  anthropic  ANTHROPIC_API_KEY            — text + images
  auto       gemini if a key is set, else anthropic, else "agent"

brief.json (validated against the live tag list; hallucinated tags are dropped):
  {"query": "mobster", "tags": {"/Expressive/Vintage": 1.0, "/Theme/Art Deco": 0.9}, "avoid_tags": {"/Expressive/Cute": 0.9},
   "category": [], "rationale": "...", "confidence": 0.85, "source": "gemini:gemini-2.5-flash"}
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from gf_live import TAG_DIMENSION, fetch_live  # noqa: E402

CATEGORIES = ("serif", "sans-serif", "display", "handwriting", "monospace")
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


class NeedsModel(Exception):
    """Raised when no model backend is available; carries the prompt for the host agent to answer."""

    def __init__(self, prompt: str):
        super().__init__("No model key set — the host agent must answer the prompt and pass --brief")
        self.prompt = prompt


def google_fonts_url(tags: dict[str, float], query: str | None = None) -> str:
    parts = []
    for tag, _w in sorted(tags.items(), key=lambda kv: -kv[1])[:3]:
        dim = TAG_DIMENSION.get(tag.split("/")[1], "Appearance")
        if dim != "Quality":
            parts.append(f"{dim}:{quote(tag, safe='')}")
    if parts:
        return "https://fonts.google.com/?categoryFilters=" + ";".join(parts)
    return "https://fonts.google.com/" + (f"?query={quote(query)}" if query else "")


def validate_brief(brief: dict, vocab: list[str]) -> dict:
    vocab_set, lower = set(vocab), {v.lower(): v for v in vocab}

    def clean(d) -> dict[str, float]:
        out = {}
        for k, v in (d or {}).items():
            key = k if k in vocab_set else lower.get(str(k).lower())
            if key and not key.startswith("/Quality/"):
                try:
                    out[key] = max(0.0, min(1.0, float(v)))
                except (TypeError, ValueError):
                    pass
        return dict(sorted(out.items(), key=lambda kv: -kv[1]))

    tags, avoid = clean(brief.get("tags")), clean(brief.get("avoid_tags"))
    avoid = {t: w for t, w in avoid.items() if t not in tags}
    cats = [c for c in (brief.get("category") or []) if c in CATEGORIES]
    try:
        conf = max(0.0, min(1.0, float(brief.get("confidence"))))
    except (TypeError, ValueError):
        conf = 0.8 if tags else 0.0
    return {"query": brief.get("query", ""), "modality": brief.get("modality", "text"), "tags": tags, "avoid_tags": avoid,
            "category": cats, "google_fonts_url": google_fonts_url(tags, brief.get("query")), "rationale": str(brief.get("rationale", ""))[:600],
            "confidence": round(conf if tags else 0.0, 2), "source": brief.get("source", "agent"),
            "dropped_tags": sorted(set((brief.get("tags") or {}).keys()) - set(tags.keys()))}


def build_prompt(query: str, vocab: list[str], has_image: bool) -> str:
    tag_lines = "\n".join(f"  {t}" for t in vocab if not t.startswith("/Quality/"))
    subject = "the attached image (UI, poster, moodboard, photo, or type sample)" if has_image else f'the request: "{query}"'
    return f"""You are a typography director translating a request into Google Fonts' OFFICIAL tag vocabulary.
Google scores every family in its live catalog 0-100 against these tags (they power the Feeling/Appearance filters on fonts.google.com):

{tag_lines}

Task: analyse {subject} and decide which tags describe the typeface that would fit it best.
Think like a type designer: tone of voice (Expressive/* feelings), construction (Sans/Serif/Slab/Script/Monospace), theme or seasonal cues.
Translate slang, characters, eras, industries or novel words into the nearest tags, e.g.
  "mobster" -> /Expressive/Vintage 1.0, /Theme/Art Deco 0.9, /Serif/Fat Face 0.7, /Expressive/Loud 0.5; avoid /Expressive/Cute
  "wacky"   -> /Theme/Wacky 1.0, /Expressive/Playful 0.7, /Expressive/Awkward 0.5
  "y2k"     -> /Theme/Techno 1.0, /Expressive/Futuristic 0.7
  "fintech" -> /Sans/Neo Grotesque 1.0, /Expressive/Competent 0.8, /Expressive/Business 0.6; category ["sans-serif"]
Note: /Expressive/Sophisticated is mostly formal scripts — for luxury serifs prefer /Serif/Didone or /Serif/Old Style Garalde with category ["serif"].
For images: read mood, era, stroke contrast, rounding, and any visible lettering.

Return ONLY this JSON (no prose, no markdown fences):
{{
  "query": {json.dumps(query)},
  "modality": {json.dumps('image' if has_image else 'text')},
  "tags": {{"<tag>": <0.0-1.0>, ... 2 to 6 entries, the defining quality = 1.0}},
  "avoid_tags": {{"<tag>": <0.0-1.0>, ... 0 to 4 entries that would clash}},
  "category": [<optional subset of "serif","sans-serif","display","handwriting","monospace"; [] if any is fine>],
  "rationale": "<one or two sentences>",
  "confidence": <0.0-1.0; 0.0 only if the request has no typographic meaning at all>
}}
Rules: use tags EXACTLY as written above; never invent tags; never use /Quality/* tags."""


def extract_json(text: str) -> dict:
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.S)
    s, e = text.find("{"), text.rfind("}")
    if s < 0 or e < 0:
        raise ValueError(f"No JSON object in model reply: {text[:200]!r}")
    return json.loads(text[s:e + 1])


def _image_b64(path: Path) -> tuple[str, str]:
    return mimetypes.guess_type(str(path))[0] or "image/png", base64.b64encode(path.read_bytes()).decode("ascii")


def gemini_translate(query: str, vocab: list[str], image: Path | None, model: str) -> dict:
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        raise SystemExit("GEMINI_API_KEY (or GOOGLE_API_KEY) not set")
    parts = [{"text": build_prompt(query, vocab, image is not None)}]
    if image:
        mime, b64 = _image_b64(image)
        parts.append({"inline_data": {"mime_type": mime, "data": b64}})
    body = {"contents": [{"parts": parts}], "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}}
    req = Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                  data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode())
    out = extract_json(data["candidates"][0]["content"]["parts"][0]["text"])
    out["source"] = f"gemini:{model}"
    return out


def anthropic_translate(query: str, vocab: list[str], image: Path | None, model: str) -> dict:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise SystemExit("ANTHROPIC_API_KEY not set")
    content = []
    if image:
        mime, b64 = _image_b64(image)
        content.append({"type": "image", "source": {"type": "base64", "media_type": mime, "data": b64}})
    content.append({"type": "text", "text": build_prompt(query, vocab, image is not None)})
    req = Request("https://api.anthropic.com/v1/messages",
                  data=json.dumps({"model": model, "max_tokens": 800, "temperature": 0.2, "messages": [{"role": "user", "content": content}]}).encode(),
                  headers={"Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01"})
    with urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode())
    out = extract_json("".join(b.get("text", "") for b in data["content"]))
    out["source"] = f"anthropic:{model}"
    return out


def translate(query: str, vocab: list[str], backend: str = "auto", image: str | None = None, from_json: str | None = None,
              model: str | None = None) -> dict:
    img = Path(image) if image else None
    if from_json:
        raw = json.loads(Path(from_json).read_text(encoding="utf-8"))
        raw.setdefault("source", "agent")
        raw.setdefault("query", query)
    else:
        if backend == "auto":
            backend = "gemini" if (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")) else ("anthropic" if os.environ.get("ANTHROPIC_API_KEY") else "agent")
        if backend == "gemini":
            raw = gemini_translate(query, vocab, img, model or "gemini-2.5-flash")
        elif backend == "anthropic":
            raw = anthropic_translate(query, vocab, img, model or "claude-sonnet-4-5")
        else:
            raise NeedsModel(build_prompt(query, vocab, img is not None))
    b = validate_brief(raw, vocab)
    if img:
        b["modality"] = "image"
    return b


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--query", default="")
    ap.add_argument("--image")
    ap.add_argument("--backend", choices=["auto", "agent", "gemini", "anthropic"], default="auto")
    ap.add_argument("--model")
    ap.add_argument("--from-json", help="Validate an agent/LLM answer (JSON file) against the live tag list")
    ap.add_argument("--out")
    args = ap.parse_args()
    vocab = fetch_live()["tag_list"]
    query = args.query or (Path(args.image).stem.replace("-", " ").replace("_", " ") if args.image else "")
    try:
        brief = translate(query, vocab, args.backend, args.image, args.from_json, args.model)
    except NeedsModel as nm:
        print(nm.prompt)
        raise SystemExit(2)
    text = json.dumps(brief, indent=2, ensure_ascii=False)
    if args.out:
        Path(args.out).write_text(text + "\n", encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
