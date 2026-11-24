#!/usr/bin/env python3
"""Frame-diff smoothness check. For every card rect (parsed from the L layout table in index.html) it measures the mean
absolute grey difference between consecutive frames and flags SPIKES: a frame whose diff is > 4x the median of its +-6
neighbours and > 1.0. A spike = a discontinuity (snap, hard swap, jump at a cycle wrap). Smooth motion has none or only tiny ones.
Usage: python3 scripts/smoothness.py [frames_dir] [--skip-intro-frames 240]"""
import re, sys, numpy as np
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
import os
D = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'frames'
SKIP = int(sys.argv[sys.argv.index('--skip-intro-frames') + 1]) if '--skip-intro-frames' in sys.argv else 240
src = open('index.html').read()
L = [(m[0], int(m[1]), int(m[2]), int(m[3]), int(m[4])) for m in re.findall(r"\['(\w+)',(\d+),(\d+),(\d+),(\d+),'\w*'\]", src)]
files = sorted(f for f in os.listdir(D) if f.endswith('.png'))
def load(f): return np.asarray(Image.open(os.path.join(D, f)).convert('L').resize((512, 384)), dtype=np.float32)
def diff(i):
    a, b = load(files[i]), load(files[i + 1])
    return [np.abs(a[y//2:(y+h)//2, x//2:(x+w)//2] - b[y//2:(y+h)//2, x//2:(x+w)//2]).mean() for _, x, y, w, h in L]
if __name__ == '__main__':
    with ProcessPoolExecutor() as ex: M = np.array(list(ex.map(diff, range(len(files) - 1), chunksize=40)))
    bad = 0
    for j, (n, *_) in enumerate(L):
        c = M[:, j]; sp = []
        for i in range(SKIP, len(c)):
            nb = np.concatenate([c[max(0, i-6):i], c[i+1:i+7]])
            if c[i] > 1.0 and c[i] > 4 * np.median(nb) + .2: sp.append((i, round(float(c[i]), 2)))
        big = [s for s in sp if s[1] > 2.0]; bad += len(big)
        print(f'{n:10s} max {c[SKIP:].max():5.2f}  spikes {len(sp):3d}  big(>2.0) {big[:6]}')
    print('BIG SPIKES:', bad, '(0 = smooth; inspect any big spike frame-by-frame)')
