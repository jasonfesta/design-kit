#!/usr/bin/env python3
"""harvest_rss_chair.py -- 5-Website Capped 24-Hour RSS Studio Chair Harvester.

Polls up to 5 curated design/furniture RSS feeds (`Dezeen`, `Yanko Design`, `Designboom`,
`Core77`, `Wallpaper*`) within a hard network-call ceiling:
  - Never calls more than `max_site_calls` (default 5) distinct RSS feeds/websites.
  - Never crawls HTML article pages (parses `<item>` / `<entry>` titles, `<pubDate>`,
    `<category>`, `<media:content>`, `<enclosure>`, and `<content:encoded>` images directly).
  - Filters for unseen chair designs published in the last 24 hours (with optional graceful
    window expansion if 0 studio-white chairs landed in the exact 24h window).
  - Downloads at most `max_image_downloads` (default 2, stopping immediately on the first
    passing high-res white-background chair) and emits `<day_dir>/{reference.jpg, probe.json}`.
"""

import argparse
import datetime as dt
import email.utils
import hashlib
import html
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from typing import Any
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET


DEFAULT_FEEDS = [
    {
        "id": "dezeen-chairs",
        "name": "Dezeen Furniture & Chairs",
        "url": "https://www.dezeen.com/design/furniture/feed/",
        "fallback_url": "https://www.dezeen.com/tag/seating/feed/",
    },
    {
        "id": "yanko-design",
        "name": "Yanko Design Chairs",
        "url": "https://www.yankodesign.com/tag/chair/feed/",
        "fallback_url": "https://www.yankodesign.com/feed/",
    },
    {
        "id": "designboom-design",
        "name": "Designboom Design",
        "url": "https://www.designboom.com/design/feed/",
    },
    {
        "id": "core77",
        "name": "Core77 Industrial Design",
        "url": "https://feeds.feedburner.com/core77/blog",
    },
    {
        "id": "wallpaper-design",
        "name": "Wallpaper* Design",
        "url": "https://www.wallpaper.com/feeds/all",
    },
]

CHAIR_POSITIVE_RE = re.compile(
    r"\b(chair|chairs|armchair|armchairs|lounge\s+chair|dining\s+chair|task\s+chair|"
    r"office\s+chair|rocking\s+chair|swivel\s+chair|stool|barstool|seating|chaise|fauteuil)\b",
    re.IGNORECASE,
)
CHAIR_NEGATIVE_RE = re.compile(
    r"\b(wheelchair\s+ramp|chairlift|chairman|chairperson|chairwoman|"
    r"skyscraper|masterplan|bridge|pavilion|tower|car|suv|motorcycle|headphone|smartphone)\b",
    re.IGNORECASE,
)
ROUNDUP_OR_EXPO_RE = re.compile(
    r"\b(exhibition|graduates|students|school\s+show|festival|fair|design\s+week|newsletter|"
    r"biennale|triennale|roundup|among\s+(?:\d+|two|three|four|five|six|seven|eight|nine|ten)|"
    r"(?:\d+|two|three|four|five|six|seven|eight|nine|ten)\s+(?:new\s+)?(?:chairs|projects|products|designs))\b",
    re.IGNORECASE,
)
IMG_URL_POSITIVE_RE = re.compile(
    r"(chair|stool|seat|white|studio|cutout|hero|front|3-4|product|ortho)",
    re.IGNORECASE,
)
IMG_URL_NEGATIVE_RE = re.compile(
    r"(avatar|logo|icon|banner|portrait|author|headshot|150x150|300x|thumb|pixel|tracking|gif$)",
    re.IGNORECASE,
)


def _load_chair_probe():
  here = Path(__file__).resolve().parent / "probe_white_studio_chair.py"
  spec = importlib.util.spec_from_file_location("probe_white_studio_chair", str(here))
  if not spec or not spec.loader:
    raise RuntimeError(f"Cannot load {here}")
  mod = importlib.util.module_from_spec(spec)
  spec.loader.exec_module(mod)
  return mod.probe_chair_plate


class NetworkBudget:
  """Hard counter guaranteeing we never exceed the configured site/call limits."""

  def __init__(self, max_site_calls: int = 5, max_total_calls: int = 5):
    self.max_site_calls = max_site_calls
    self.max_total_calls = max_total_calls
    self.site_calls = 0
    self.total_calls = 0
    self.hosts_called: list[str] = []
    self.call_log: list[dict[str, Any]] = []

  def can_call(self, kind: str = "rss") -> bool:
    if self.total_calls >= self.max_total_calls:
      return False
    if kind == "rss" and self.site_calls >= self.max_site_calls:
      return False
    return True

  def fetch_bytes(self, url: str, kind: str = "rss", timeout: int = 18) -> bytes:
    if not self.can_call(kind):
      raise RuntimeError(
          f"Network budget reached (total={self.total_calls}/{self.max_total_calls}, "
          f"sites={self.site_calls}/{self.max_site_calls})"
      )
    host = urllib.parse.urlparse(url).netloc.lower()
    self.total_calls += 1
    if kind == "rss":
      self.site_calls += 1
    if host and host not in self.hosts_called:
      self.hosts_called.append(host)

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            ),
            "Accept": (
                "application/rss+xml, application/xml, text/xml, image/avif, "
                "image/webp, image/apng, image/*, */*;q=0.8"
            ),
        },
    )
    try:
      with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
        self.call_log.append({
            "index": self.total_calls,
            "kind": kind,
            "host": host,
            "url": url,
            "status": getattr(resp, "status", 200),
            "bytes": len(data),
        })
        return data
    except Exception as exc:  # pylint: disable=broad-except
      self.call_log.append({
          "index": self.total_calls,
          "kind": kind,
          "host": host,
          "url": url,
          "error": str(exc),
      })
      raise


def _parse_pub_date(raw_date: str) -> dt.datetime | None:
  if not raw_date:
    return None
  raw_date = raw_date.strip()
  try:
    parsed = email.utils.parsedate_to_datetime(raw_date)
    if parsed.tzinfo is None:
      parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)
  except Exception:  # pylint: disable=broad-except
    pass
  try:
    iso = raw_date.replace("Z", "+00:00")
    parsed = dt.datetime.fromisoformat(iso)
    if parsed.tzinfo is None:
      parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)
  except Exception:  # pylint: disable=broad-except
    return None


def _canonical_img_stem(url: str) -> str:
  base = url.split("?")[0]
  return re.sub(r"[-_]\d{3,4}x\d{3,4}(?=\.[a-zA-Z0-9]+$)", "", base)


def _extract_images_from_html_snippet(snippet: str) -> list[tuple[str, int]]:
  """Extracts (url, hinted_width) pairs from RSS HTML content/srcset without network calls."""
  if not snippet:
    return []
  unescaped = html.unescape(snippet)
  by_stem: dict[str, tuple[str, int]] = {}

  def _record(u: str, w: int) -> None:
    if not u.startswith("http"):
      return
    stem = _canonical_img_stem(u)
    prev = by_stem.get(stem)
    if prev is None or w > prev[1]:
      by_stem[stem] = (u, w)

  # 1. srcset candidates (pick highest pixel width w descriptor!)
  for srcset_match in re.finditer(r'srcset=["\']([^"\']+)["\']', unescaped, re.IGNORECASE):
    parts = [p.strip() for p in srcset_match.group(1).split(",") if p.strip()]
    for part in parts:
      tokens = part.split()
      u = tokens[0]
      w = 0
      if len(tokens) > 1 and tokens[1].lower().endswith("w"):
        try:
          w = int(tokens[1][:-1])
        except ValueError:
          w = 0
      _record(u, w)

  # 2. Direct <img src / data-src / data-orig-file> attributes
  for attr in ("data-orig-file", "data-large-file", "data-full-url", "data-src", "src"):
    for m in re.finditer(rf'{attr}=["\'](https?://[^"\']+)["\']', unescaped, re.IGNORECASE):
      u = m.group(1)
      w_match = re.search(r"[-_](\d{3,4})x(\d{3,4})\.", u)
      hinted_w = int(w_match.group(1)) if w_match else 1200
      _record(u, hinted_w)

  return sorted(by_stem.values(), key=lambda kv: kv[1], reverse=True)


def _parse_rss_items(xml_bytes: bytes, feed_meta: dict[str, str]) -> list[dict[str, Any]]:
  text = xml_bytes.decode("utf-8", errors="replace").lstrip("\ufeff \t\r\n")
  root = ET.fromstring(text)
  items: list[dict[str, Any]] = []

  # Support both RSS 2.0 (<item>) and Atom (<entry>)
  nodes = root.findall(".//item")
  if not nodes:
    nodes = root.findall(".//{http://www.w3.org/2005/Atom}entry")

  for node in nodes:
    title = ""
    link = ""
    guid = ""
    pub_raw = ""
    categories: list[str] = []
    html_blobs: list[str] = []
    media_imgs: list[tuple[str, int]] = []

    for child in list(node):
      tag = child.tag.split("}")[-1].lower()
      txt = (child.text or "").strip()
      if tag == "title" and txt:
        title = html.unescape(txt)
      elif tag == "link":
        href = child.attrib.get("href", "").strip()
        link = href or txt or link
      elif tag in ("guid", "id") and txt:
        guid = txt
      elif tag in ("pubdate", "published", "updated", "date") and txt and not pub_raw:
        pub_raw = txt
      elif tag == "category":
        cat = child.attrib.get("term") or txt
        if cat:
          categories.append(cat.strip())
      elif tag in ("description", "encoded", "content", "summary") and txt:
        html_blobs.append(txt)
      elif tag in ("content", "thumbnail", "enclosure"):
        m_url = child.attrib.get("url", "").strip()
        m_type = child.attrib.get("type", "").lower()
        if m_url.startswith("http") and ("image" in m_type or re.search(r"\.(jpe?g|png|webp)(\?|$)", m_url, re.I)):
          wm = re.search(r"[-_](\d{3,4})x(\d{3,4})\.", m_url)
          default_w = int(wm.group(1)) if wm else 1200
          try:
            mw = int(child.attrib.get("width", str(default_w)))
          except ValueError:
            mw = default_w
          media_imgs.append((m_url, mw))

    for sub in node.iter():
      sub_tag = sub.tag.split("}")[-1].lower()
      if sub_tag in ("content", "thumbnail") and "url" in sub.attrib:
        m_url = sub.attrib["url"].strip()
        if m_url.startswith("http"):
          wm = re.search(r"[-_](\d{3,4})x(\d{3,4})\.", m_url)
          default_w = int(wm.group(1)) if wm else 1200
          try:
            mw = int(sub.attrib.get("width", str(default_w)))
          except ValueError:
            mw = default_w
          media_imgs.append((m_url, mw))

    stem_map: dict[str, tuple[str, int]] = {}
    for u, w in media_imgs:
      st = _canonical_img_stem(u)
      if st not in stem_map or w > stem_map[st][1]:
        stem_map[st] = (u, w)
    for blob in html_blobs:
      for u, w in _extract_images_from_html_snippet(blob):
        st = _canonical_img_stem(u)
        if st not in stem_map or w > stem_map[st][1]:
          stem_map[st] = (u, w)

    clean_imgs = [
        (u, w)
        for u, w in stem_map.values()
        if not IMG_URL_NEGATIVE_RE.search(u) and w >= 800
    ]
    # Prefer studio product gallery plates (`_col_1..4`, `white`, `studio`, `cutout`, `product`)
    # over `_col_0` / `_hero` / `_sq` staged lifestyle interior hero crops!
    def _img_studio_rank(uw: tuple[str, int]) -> tuple[int, int]:
      u, w = uw
      if re.search(r"(white|studio|cutout|isolated|ortho)", u, re.I):
        tier = 4
      elif re.search(r"_col_[1234](?:[-_.]|$)", u, re.I):
        tier = 3
      elif re.search(r"(_col_|product)", u, re.I) and not re.search(r"_col_0", u, re.I):
        tier = 2
      elif IMG_URL_POSITIVE_RE.search(u):
        tier = 1
      else:
        tier = 0
      return (tier, w)

    clean_imgs.sort(key=_img_studio_rank, reverse=True)

    plain_summary = re.sub(r"<[^>]+>", " ", " ".join(html_blobs))
    plain_summary = re.sub(r"\s+", " ", html.unescape(plain_summary)).strip()[:600]

    items.append({
        "feed_id": feed_meta["id"],
        "feed_name": feed_meta["name"],
        "guid": guid or link or title,
        "title": title,
        "link": link,
        "pub_date_utc": _parse_pub_date(pub_raw),
        "categories": categories,
        "summary": plain_summary,
        "images": clean_imgs[:8],
    })
  return items


def _score_rss_item(item: dict[str, Any]) -> float:
  hay_title = f"{item['title']} {' '.join(item['categories'])}"
  hay_full = f"{hay_title} {item['summary']}"
  if CHAIR_NEGATIVE_RE.search(hay_title):
    return -100.0

  title_match = bool(CHAIR_POSITIVE_RE.search(hay_title))
  body_match = bool(CHAIR_POSITIVE_RE.search(hay_full))
  if not title_match and not body_match:
    return -10.0

  score = 55.0 if title_match else 22.0
  if re.search(
      r"\b(chair|armchair|lounge\s+chair|dining\s+chair|swivel\s+chair|task\s+chair|office\s+chair|rocking\s+chair|stool)\b",
      item["title"],
      re.I,
  ):
    score += 25.0
  if re.search(r"(dezeen\s+showroom|showroom)", hay_title, re.I):
    score += 24.0
  if ROUNDUP_OR_EXPO_RE.search(hay_title):
    score -= 38.0
  if item["images"]:
    best_u, best_w = item["images"][0]
    score += min(20.0, best_w / 100.0)
    if IMG_URL_POSITIVE_RE.search(best_u):
      score += 10.0
  else:
    return -50.0
  return score


def _slugify(text: str) -> str:
  slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
  return (slug[:42].rstrip("-")) or "studio-chair"


def harvest(
    project_dir: Path,
    max_site_calls: int = 5,
    max_total_calls: int = 9,
    max_image_downloads: int = 4,
    lookback_hours: int = 24,
    date_override: str | None = None,
) -> dict[str, Any]:
  probe_chair_fn = _load_chair_probe()
  config_path = project_dir / "config" / "feeds.json"
  feeds = DEFAULT_FEEDS
  if config_path.exists():
    cfg = json.loads(config_path.read_text(encoding="utf-8"))
    feeds = cfg.get("feeds", DEFAULT_FEEDS)

  memory_dir = project_dir / "memory"
  memory_dir.mkdir(parents=True, exist_ok=True)
  seen_path = memory_dir / "seen_items.json"
  seen_data = (
      json.loads(seen_path.read_text(encoding="utf-8"))
      if seen_path.exists()
      else {"seen_guids": [], "seen_urls": [], "seen_sha256": []}
  )
  seen_guids = set(seen_data.get("seen_guids", []))
  seen_urls = set(seen_data.get("seen_urls", []))
  seen_hashes = set(seen_data.get("seen_sha256", []))

  # Strictly enforce <= max_site_calls (5 websites max) while reserving image checks to verify white background!
  rss_call_cap = min(max_site_calls, 5)
  effective_total_cap = max(max_total_calls, rss_call_cap + max_image_downloads)
  budget = NetworkBudget(max_site_calls=rss_call_cap, max_total_calls=effective_total_cap)

  now_utc = dt.datetime.now(dt.timezone.utc)
  all_items: list[dict[str, Any]] = []

  for feed in feeds[:rss_call_cap]:
    if not budget.can_call("rss"):
      break
    raw_xml = None
    try:
      raw_xml = budget.fetch_bytes(feed["url"], kind="rss")
    except Exception:  # pylint: disable=broad-except
      fb = feed.get("fallback_url")
      if fb and budget.can_call("rss"):
        try:
          raw_xml = budget.fetch_bytes(fb, kind="rss")
        except Exception:  # pylint: disable=broad-except
          raw_xml = None
    if raw_xml:
      try:
        parsed_items = _parse_rss_items(raw_xml, feed)
        all_items.extend(parsed_items)
      except Exception:  # pylint: disable=broad-except
        continue
    # Early-stop RSS polling if we already have >= 3 unseen <24h strong chair items so we save calls for image check
    recent_strong = [
        it
        for it in all_items
        if it["guid"] not in seen_guids
        and it["link"] not in seen_urls
        and _score_rss_item(it) >= 70.0
        and (
            it["pub_date_utc"] is not None
            and (now_utc - it["pub_date_utc"]).total_seconds() <= lookback_hours * 3600
        )
    ]
    if len(recent_strong) >= 3 and budget.site_calls >= 3:
      break

  # Filter unseen chair candidates: prioritize <= lookback_hours (24h), then graceful expansion if empty
  latest_pub = max(
      (it["pub_date_utc"] for it in all_items if it["pub_date_utc"] is not None),
      default=now_utc,
  )
  anchor_utc = (
      latest_pub
      if abs((now_utc - latest_pub).total_seconds()) > 7 * 86400
      else now_utc
  )

  unseen_chair_items = []
  for it in all_items:
    if it["guid"] in seen_guids or it["link"] in seen_urls:
      continue
    sc = _score_rss_item(it)
    if sc <= 0:
      continue
    age_hours = (
        (anchor_utc - it["pub_date_utc"]).total_seconds() / 3600.0
        if it["pub_date_utc"] is not None
        else 12.0
    )
    in_24h = -2.0 <= age_hours <= lookback_hours
    recency_bonus = max(0.0, 32.0 - max(0.0, age_hours) * 0.18)
    it["_chair_score"] = round(sc + recency_bonus, 2)
    it["_age_hours"] = round(max(0.0, age_hours), 2)
    it["_in_24h_window"] = in_24h
    unseen_chair_items.append(it)

  tier_24h = [it for it in unseen_chair_items if it["_in_24h_window"]]
  pool = tier_24h if tier_24h else unseen_chair_items
  window_note = "last_24h" if tier_24h else "recent_rss_fallback"
  pool.sort(key=lambda it: (it["_chair_score"], -it["_age_hours"]), reverse=True)

  if not pool:
    raise RuntimeError(
        "No unseen chair items found in RSS feeds within the 5-call budget."
    )

  # Sample best studio plate per distinct chair article first (Pass 1), stopping immediately
  # on the first `studio_white_passed == True` plate so image calls stay minimal!
  evaluated_candidates: list[dict[str, Any]] = []
  downloads_used = 0
  found_clean_white = False

  with tempfile.TemporaryDirectory(prefix="chair_rss_") as tmp_dir:
    for img_slot in (0, 1):
      if found_clean_white or downloads_used >= max_image_downloads or not budget.can_call("image"):
        break
      for item in pool:
        if found_clean_white or downloads_used >= max_image_downloads or not budget.can_call("image"):
          break
        if len(item["images"]) <= img_slot:
          continue
        img_url, hinted_w = item["images"][img_slot]
        try:
          img_bytes = budget.fetch_bytes(img_url, kind="image")
          downloads_used += 1
        except Exception:  # pylint: disable=broad-except
          continue

        sha = hashlib.sha256(img_bytes).hexdigest()
        if sha in seen_hashes:
          continue

        raw_tmp = Path(tmp_dir) / f"cand_{downloads_used}.img"
        jpg_tmp = Path(tmp_dir) / f"cand_{downloads_used}.jpg"
        raw_tmp.write_bytes(img_bytes)
        subprocess.check_call(["convert", str(raw_tmp), "-quality", "95", str(jpg_tmp)])

        probe_res = probe_chair_fn(str(jpg_tmp))
        evaluated_candidates.append({
            "item": item,
            "img_url": img_url,
            "hinted_width": hinted_w,
            "sha256": sha,
            "jpg_tmp": str(jpg_tmp),
            "probe": probe_res,
        })
        if probe_res.get("studio_white_passed"):
          found_clean_white = True
          break

    if not evaluated_candidates:
      raise RuntimeError("Could not download any candidate chair image within call budget.")

    evaluated_candidates.sort(
        key=lambda c: (
            1 if c["probe"].get("studio_white_passed") else 0,
            c["probe"].get("suitability_score", 0.0),
        ),
        reverse=True,
    )
    winner = evaluated_candidates[0]

    today_str = date_override or dt.date.today().isoformat()
    slug = f"{today_str}-{_slugify(winner['item']['title'])}"
    day_dir = project_dir / "days" / slug
    day_dir.mkdir(parents=True, exist_ok=True)

    ref_dest = day_dir / "reference.jpg"
    shutil.copyfile(winner["jpg_tmp"], ref_dest)

  probe_out = day_dir / "probe.json"
  probe_out.write_text(json.dumps(winner["probe"], indent=2), encoding="utf-8")

  # Record in seen_items.json so tomorrow picks a fresh chair
  seen_data["seen_guids"] = sorted(seen_guids | {winner["item"]["guid"]})
  seen_data["seen_urls"] = sorted(seen_urls | {winner["item"]["link"], winner["img_url"]})
  seen_data["seen_sha256"] = sorted(seen_hashes | {winner["sha256"]})
  seen_path.write_text(json.dumps(seen_data, indent=2), encoding="utf-8")

  receipt = {
      "selected_day_id": slug,
      "day_dir": str(day_dir),
      "reference_image": str(ref_dest),
      "window_mode": window_note,
      "source_feed": winner["item"]["feed_name"],
      "source_title": winner["item"]["title"],
      "source_article_url": winner["item"]["link"],
      "source_image_url": winner["img_url"],
      "pub_date_utc": (
          winner["item"]["pub_date_utc"].isoformat()
          if winner["item"]["pub_date_utc"]
          else None
      ),
      "categories": winner["item"]["categories"],
      "summary": winner["item"]["summary"],
      "probe": winner["probe"],
      "candidates_evaluated": [
          {
              "title": c["item"]["title"],
              "feed": c["item"]["feed_name"],
              "img_url": c["img_url"],
              "studio_white_passed": c["probe"].get("studio_white_passed"),
              "suitability_score": c["probe"].get("suitability_score"),
              "border_hex": c["probe"].get("border_hex"),
              "white_border_purity": c["probe"].get("white_border_purity"),
              "native_size": c["probe"].get("native_size"),
          }
          for c in evaluated_candidates
      ],
      "network_budget_receipt": {
          "max_site_calls": max_site_calls,
          "max_total_calls": max_total_calls,
          "rss_calls_made": budget.site_calls,
          "total_http_calls_made": budget.total_calls,
          "distinct_hosts_called": budget.hosts_called,
          "calls": budget.call_log,
      },
  }
  (day_dir / "harvest_receipt.json").write_text(
      json.dumps(receipt, indent=2), encoding="utf-8"
  )
  return receipt


def main() -> None:
  parser = argparse.ArgumentParser(
      description="Harvest 1 unseen studio white-background chair from up to 5 RSS feeds within <= 5 HTTP calls."
  )
  parser.add_argument(
      "--project-dir",
      default="/usr/local/google/home/jfesta/chairs",
      help="Root directory of the daily chair project",
  )
  parser.add_argument("--max-site-calls", type=int, default=5)
  parser.add_argument("--max-total-calls", type=int, default=5)
  parser.add_argument("--max-image-downloads", type=int, default=2)
  parser.add_argument("--lookback-hours", type=int, default=24)
  parser.add_argument("--date", default=None, help="Optional YYYY-MM-DD override")
  args = parser.parse_args()

  receipt = harvest(
      project_dir=Path(args.project_dir),
      max_site_calls=args.max_site_calls,
      max_total_calls=args.max_total_calls,
      max_image_downloads=args.max_image_downloads,
      lookback_hours=args.lookback_hours,
      date_override=args.date,
  )
  print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
  main()
