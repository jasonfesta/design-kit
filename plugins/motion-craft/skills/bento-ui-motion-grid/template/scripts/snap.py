#!/usr/bin/env python3
"""Stills at chosen times for review: python3 scripts/snap.py 0.5 4.2 9.7  -> out/still_<t>.png (1440x1080)"""
import io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
os.makedirs('out', exist_ok=True)
with sync_playwright() as p:
    kw = {'executable_path': '/usr/bin/google-chrome'} if os.path.exists('/usr/bin/google-chrome') and not os.environ.get('BENTO_BUNDLED_CHROMIUM') else {}  # design-kit: env var forces Playwright's bundled Chromium
    b = p.chromium.launch(args=['--force-color-profile=srgb', '--font-render-hinting=none'], **kw)
    pg = b.new_page(viewport={'width': 1024, 'height': 768}, device_scale_factor=2.8125)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.abspath('index.html')); pg.evaluate('document.fonts.ready')
    for t in sys.argv[1:]:
        pg.evaluate(f'draw({float(t)})')
        Image.open(io.BytesIO(pg.screenshot())).convert('RGB').resize((1440, 1080), Image.LANCZOS).save(f'out/still_{t}.png')
    print('page errors:', errs[:3]); b.close()
