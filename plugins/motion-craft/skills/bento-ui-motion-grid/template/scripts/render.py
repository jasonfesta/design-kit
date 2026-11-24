#!/usr/bin/env python3
"""Deterministic frame render: sets t = frame/FPS, calls window.draw(t), screenshots at 2.8125x (2880x2160), downscales to 1440x1080.
Usage: python3 scripts/render.py [--fps 120] [--seconds 24] [--workers 6] [--out frames] [--chrome /usr/bin/google-chrome]
Writes frames/00000.png ... ; run from the template folder."""
import argparse, io, os, subprocess, sys
from multiprocessing import Process
def worker(w, a):
    from playwright.sync_api import sync_playwright
    from PIL import Image
    N = round(a.fps * a.seconds); rng = range(w * N // a.workers, (w + 1) * N // a.workers)
    html = 'file://' + os.path.abspath('index.html')
    with sync_playwright() as p:
        kw = dict(args=['--force-color-profile=srgb', '--font-render-hinting=none'])
        if a.chrome: kw['executable_path'] = a.chrome
        b = p.chromium.launch(**kw)
        pg = b.new_page(viewport={'width': 1024, 'height': 768}, device_scale_factor=2.8125)
        pg.goto(html); pg.evaluate('document.fonts.ready')
        for i in rng:
            pg.evaluate(f'draw({i / a.fps})')
            Image.open(io.BytesIO(pg.screenshot())).convert('RGB').resize((1440, 1080), Image.LANCZOS).save(f'{a.out}/{i:05d}.png', compress_level=1)
        b.close()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--fps', type=float, default=120); ap.add_argument('--seconds', type=float, default=24)
    ap.add_argument('--workers', type=int, default=max(1, (os.cpu_count() or 4) - 2)); ap.add_argument('--out', default='frames')
    ap.add_argument('--chrome', default='/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None)
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    ps = [Process(target=worker, args=(w, a)) for w in range(a.workers)]
    [p.start() for p in ps]; [p.join() for p in ps]
    print('frames:', len([f for f in os.listdir(a.out) if f.endswith('.png')]))
