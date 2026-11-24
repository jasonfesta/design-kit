/* Generic Stage Playback Autopilot: drives a visible animated cursor (`.ap-cursor`)
   across `[data-ap]` targets or auto-discovered interactive elements inside the active stage,
   with tap ripple feedback and clean abort on manual user input or Escape. */

class AbortedError extends Error {
  constructor() {
    super('Autopilot aborted');
    this.name = 'AbortedError';
  }
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(new AbortedError());
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new AbortedError());
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

let cursorEl: HTMLDivElement | null = null;

function getCursor(): HTMLDivElement {
  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.className = 'ap-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.setAttribute('data-jig-autopilot-cursor', 'true');
    cursorEl.style.transform = `translate3d(${Math.round(window.innerWidth * 0.52)}px, ${Math.round(
      window.innerHeight * 0.5,
    )}px, 0)`;
    document.body.appendChild(cursorEl);
  }
  return cursorEl;
}

export function hideAutopilotCursor(): void {
  if (cursorEl) {
    cursorEl.remove();
    cursorEl = null;
  }
}

function isInsideJigChrome(el: Element): boolean {
  return Boolean(
    el.closest(
      '.top-jig-wrap, .bottom-motion-wrap, .toc, .right-variant-notches, .dk-panel, [data-jig-trace-modal], [data-style-jig], [data-style-jig-bottom]',
    ),
  );
}

function isInteractable(el: HTMLElement): boolean {
  if (isInsideJigChrome(el)) return false;
  const r = el.getBoundingClientRect();
  if (r.width <= 4 || r.height <= 4) return false;
  if (r.right <= 0 || r.left >= window.innerWidth) return false;
  if (r.bottom <= 0 || r.top >= window.innerHeight) return false;
  const cs = window.getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') {
    return false;
  }
  if (parseFloat(cs.opacity || '1') <= 0.05) return false;
  return true;
}

function resolveStageRoot(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>('[data-jig-stage-viewport]') ??
    document.querySelector<HTMLElement>('[data-standalone="true"]') ??
    document.querySelector<HTMLElement>('[data-jig-stage]')
  );
}

function collectStageTargets(stage: HTMLElement): HTMLElement[] {
  // 1. Prefer explicitly authored `[data-ap]` playback waypoints when present
  const authored = Array.from(stage.querySelectorAll<HTMLElement>('[data-ap]')).filter(
    isInteractable,
  );
  if (authored.length > 0) {
    return authored;
  }

  // 2. Fallback: discover safe visible controls inside the mounted view
  const interactive = Array.from(
    stage.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [role="tab"], [role="switch"], a[href], input:not([disabled]), [data-empty-stage-bay], .blank-stage-surface',
    ),
  ).filter((el) => {
    if (!isInteractable(el)) return false;
    const label = (el.textContent || el.getAttribute('aria-label') || '').toLowerCase();
    if (/delete|remove|logout|sign out|destroy|reset/.test(label)) return false;
    return true;
  });

  return interactive;
}

async function moveCursorToPoint(x: number, y: number, signal: AbortSignal): Promise<void> {
  const c = getCursor();
  c.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  await sleep(430, signal);
}

async function tapAtCurrent(target: HTMLElement | null, signal: AbortSignal): Promise<void> {
  const c = getCursor();
  c.classList.remove('is-tapping');
  void c.offsetWidth;
  c.classList.add('is-tapping');
  await sleep(140, signal);
  if (target && !target.matches('[data-empty-stage-bay], .blank-stage-surface')) {
    const r = target.getBoundingClientRect();
    target.dispatchEvent(
      new PointerEvent('pointerenter', {
        bubbles: true,
        clientX: r.left + r.width * 0.5,
        clientY: r.top + r.height * 0.5,
      }),
    );
    target.click();
  }
  await sleep(240, signal);
}

export function startStageAutopilot(): () => void {
  const controller = new AbortController();
  const { signal } = controller;

  const run = async () => {
    getCursor();
    let step = 0;

    try {
      while (!signal.aborted) {
        const stage = resolveStageRoot();
        if (!stage) {
          await sleep(400, signal);
          continue;
        }

        const targets = collectStageTargets(stage);
        if (targets.length === 0) {
          const rect = stage.getBoundingClientRect();
          const cx = rect.left + rect.width * (0.42 + (step % 3) * 0.12);
          const cy = rect.top + rect.height * (0.44 + ((step + 1) % 2) * 0.14);
          await moveCursorToPoint(cx, cy, signal);
          await tapAtCurrent(null, signal);
          await sleep(650, signal);
          step += 1;
          continue;
        }

        const target = targets[step % targets.length];
        const rect = target.getBoundingClientRect();

        if (target.matches('[data-empty-stage-bay], .blank-stage-surface')) {
          const offsets: readonly [number, number][] = [
            [0.32, 0.36],
            [0.68, 0.42],
            [0.52, 0.66],
            [0.38, 0.58],
          ];
          const [ox, oy] = offsets[step % offsets.length];
          await moveCursorToPoint(rect.left + rect.width * ox, rect.top + rect.height * oy, signal);
          await tapAtCurrent(target, signal);
        } else {
          const tx = rect.left + Math.min(rect.width * 0.5, Math.max(14, rect.width * 0.44));
          const ty = rect.top + rect.height * 0.5;
          await moveCursorToPoint(tx, ty, signal);
          await tapAtCurrent(target, signal);
        }

        // Sweep synthetic pointer to any embedded 3D / shader iframes
        const t = performance.now() * 0.001;
        stage.querySelectorAll('iframe').forEach((frame) => {
          if (frame.contentWindow) {
            frame.contentWindow.postMessage(
              { type: 'IMMERSIVE_POINTER', nx: Math.sin(t * 0.85) * 0.55, ny: Math.cos(t * 0.62) * 0.38 },
              '*',
            );
          }
        });

        await sleep(520, signal);
        step += 1;
      }
    } catch (err) {
      if (!(err instanceof AbortedError)) {
        // Ignore transient DOM unmount errors cleanly
      }
    } finally {
      hideAutopilotCursor();
    }
  };

  void run();

  return () => {
    controller.abort();
    hideAutopilotCursor();
  };
}
