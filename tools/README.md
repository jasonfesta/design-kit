# tools/

Local runtimes the kit's skills use. These are git-ignored and can be re-created.

| Path | What | Used by |
| :--- | :--- | :--- |
| `bin/bento-grid` | Wrapper that runs the bento skill's scripts with the runtimes below | `bento-ui-motion-grid` |
| `python/site/` | Vendored Python 3.13 packages: playwright 1.65, pillow 13, numpy 2.5, greenlet, pyee, typing_extensions (≈240 MB) | any skill script that needs Playwright/PIL/numpy: set `PYTHONPATH` to this folder |
| `ms-playwright/` | Playwright's headless Chromium shell + ffmpeg (≈290 MB) | set `PLAYWRIGHT_BROWSERS_PATH` to this folder |

Why: this host's `python3` has no `pip`, and system `google-chrome` hangs in headless mode.

## Re-create
```bash
# 1. wheels (cp313, manylinux x86_64) from PyPI → unzip into tools/python/site
#    playwright greenlet pyee typing_extensions pillow numpy
python3 -m zipfile -e <wheel>.whl ~/design-kit/tools/python/site/
chmod -R u+x ~/design-kit/tools/python/site/playwright/driver
# 2. browser
PYTHONPATH=~/design-kit/tools/python/site PLAYWRIGHT_BROWSERS_PATH=~/design-kit/tools/ms-playwright \
  python3 -m playwright install chromium-headless-shell
```

To use these from any script:
```bash
export PYTHONPATH=~/design-kit/tools/python/site PLAYWRIGHT_BROWSERS_PATH=~/design-kit/tools/ms-playwright
```
