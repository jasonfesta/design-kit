/**
 * JIG AGENT VANILLA RUNTIME (`style-jig-runtime.js`)
 * Drop-in active view-detecting Jig Agent for standalone HTML / multi-slide showcases:
 * 1. Enforces `z-index: 2147483640` on all Jig Agent plates & `z-index: 1; isolation: isolate` on stages
 * 2. Enforces `>= 76px` safe-zone centering + proportional `fitStageTargets()` scaling
 * 3. Drives `style` (10 modes), `shadcn · ease · fluid` + `☾`/`☀` Dark/Light surface transformation
 * 4. Auto-detects `3d`, `parallax`, and `shader` views -> mounts Right / Lower-Right Drag Scrub Jig
 * 5. Drives `motion-craft ▶` Unscripted View-Detecting Auto-Traveler (scroll glider + interactive explorer)
 */
(function initJigAgentRuntime(global) {
  'use strict';

  const JIG_Z_INDEX = 2147483640;
  const SAFE_ZONE_PAD_PX = 76;
  const STYLE_TAXONOMY = [
    'clone',
    'clean',
    'grid',
    'editorial',
    'cinematic',
    'product',
    'brutal',
    'playful',
    'retro'
  ];
  const JIG_FONT_NAME = 'Instrument Sans';
  const JIG_FONT_STACK = '"' + JIG_FONT_NAME + '", "Hanken Grotesk", -apple-system, BlinkMacSystemFont, sans-serif';

  const DEFAULT_SCHEMAS = {
    '3d': {
      title: '3d',
      words: { key: 'shapeType', options: ['chain', 'helix', 'ring', 'wave', 'arch'] },
      sliders: [
        { key: 'count', label: 'count', min: 3, max: 14, dec: 0 },
        { key: 'gap', label: 'gap', min: 0, max: 0.6, dec: 2 },
        { key: 'scrollSpeed', label: 'scroll', min: 0, max: 2.0, dec: 2 },
        { key: 'rotSpeed', label: 'spin', min: 0, max: 2.0, dec: 2 },
        { key: 'camZ', label: 'depth', min: 4.0, max: 10.0, dec: 1 }
      ],
      swatches: [{ key: 'cuboidColor', label: 'surface' }],
      defaults: {
        shapeType: 'chain',
        count: 8,
        gap: 0.01,
        scrollSpeed: 0.60,
        rotSpeed: 0.57,
        camZ: 6.2,
        cuboidColor: '#242424'
      },
      formatCopy: function (p) { return JSON.stringify(p, null, 2); }
    },
    parallax: {
      title: 'parallax',
      sliders: [
        { key: 'headSpeed', label: 'head speed', min: -0.6, max: 0.6, dec: 2 },
        { key: 'lineSpread', label: 'line spread', min: 0, max: 56, dec: 0 },
        { key: 'bodySpeed', label: 'body speed', min: -0.5, max: 0.5, dec: 2 },
        { key: 'btnSpeed', label: 'btn speed', min: -0.5, max: 0.6, dec: 2 },
        { key: 'oscAmp', label: 'scroll wave', min: 0, max: 24, dec: 1 },
        { key: 'hoverLift', label: 'hover lift', min: -18, max: 0, dec: 1 }
      ],
      toggles: [{ key: 'autoScroll', label: 'auto-scroll' }],
      defaults: {
        headSpeed: -0.09,
        lineSpread: 12,
        bodySpeed: -0.04,
        btnSpeed: 0.08,
        oscAmp: 0,
        hoverLift: -4,
        autoScroll: false
      },
      formatCopy: function (p) {
        return (
          'Parallax — headSpeed: ' + p.headSpeed +
          ', lineSpread: ' + p.lineSpread + 'px, bodySpeed: ' + p.bodySpeed +
          ', btnSpeed: ' + p.btnSpeed + ', scrollWave: ' + p.oscAmp +
          'px, hoverLift: ' + p.hoverLift + 'px'
        );
      }
    },
    shader: {
      title: 'shader',
      dropdown: {
        key: 'shaderPreset',
        options: ['silk blend', 'mesh drift', 'ink ridges', 'gradient mesh', 'ascii art']
      },
      sliders: [
        { key: 'angle', label: 'angle', min: 0, max: 360, dec: 0 },
        { key: 'wave', label: 'wave', min: 0, max: 40, dec: 0 },
        { key: 'distortion', label: 'distortion', min: 0, max: 80, dec: 0 },
        { key: 'soften', label: 'soften', min: 0, max: 100, dec: 0 },
        { key: 'vignette', label: 'vignette', min: 0, max: 100, dec: 0 },
        { key: 'grain', label: 'grain', min: 0, max: 150, dec: 0 }
      ],
      defaults: {
        shaderPreset: 'silk blend',
        angle: 170,
        wave: 12,
        distortion: 28,
        soften: 58,
        vignette: 48,
        grain: 100,
        col0: '#16130e',
        col1: '#0c1617',
        col2: '#63959c'
      },
      formatCopy: function (p) {
        return '/* shader: ' + p.shaderPreset + ' */ linear-gradient(' + p.angle + 'deg, ' + p.col0 + ' 0%, ' + p.col1 + ' 69%, ' + p.col2 + ' 100%)';
      }
    },
    immersive: {
      title: 'immersive',
      sliders: [
        { key: 'depth', label: 'depth', min: 4.0, max: 10.0, dec: 1 },
        { key: 'motion', label: 'motion', min: 0, max: 2.0, dec: 2 },
        { key: 'wave', label: 'wave', min: 0, max: 40, dec: 0 },
        { key: 'soften', label: 'soften', min: 0, max: 100, dec: 0 },
        { key: 'grain', label: 'grain', min: 0, max: 150, dec: 0 }
      ],
      defaults: {
        depth: 6.2,
        motion: 0.60,
        wave: 12,
        soften: 58,
        grain: 100
      },
      formatCopy: function (p) { return JSON.stringify(p, null, 2); }
    },
    menu: {
      title: 'menu',
      words: { key: 'dockLayout', options: ['floating', 'bar', 'circle'] },
      sliders: [
        { key: 'roundness', label: 'roundness', min: 0, max: 36, dec: 0 },
        { key: 'stroke', label: 'stroke', min: 0.5, max: 3.0, dec: 2 },
        { key: 'scale', label: 'scale', min: 50, max: 120, dec: 0 },
        { key: 'blur', label: 'blur', min: 0, max: 48, dec: 0 },
        { key: 'frost', label: 'frost', min: 0, max: 100, dec: 0 },
        { key: 'refraction', label: 'refraction', min: 0, max: 100, dec: 0 },
        { key: 'specular', label: 'specular', min: 0, max: 100, dec: 0 },
        { key: 'highlight', label: 'highlight', min: 0, max: 100, dec: 0 }
      ],
      defaults: {
        dockLayout: 'floating',
        surfaceMode: 'liquid',
        tintMode: 'regular',
        roundness: 24,
        stroke: 1.85,
        scale: 70,
        blur: 22,
        frost: 36,
        refraction: 64,
        specular: 74,
        highlight: 72
      },
      formatCopy: function (p) { return JSON.stringify(p, null, 2); }
    },
    cards: {
      title: 'cards',
      dropdown: {
        key: 'cardFormation',
        options: ['glass feed', 'orbit ring', 'helix']
      },
      words: { key: 'faceMode', options: ['images', 'gray'] },
      sliders: [
        { key: 'count', label: 'count', min: 4, max: 20, dec: 0 },
        { key: 'size', label: 'size', min: 0.5, max: 1.8, dec: 2 },
        { key: 'corner', label: 'corner', min: 0.0, max: 0.25, dec: 2 },
        { key: 'speed', label: 'speed', min: 0.0, max: 2.0, dec: 2 },
        { key: 'warp', label: 'warp', min: 0.0, max: 0.5, dec: 2 },
        { key: 'zoom', label: 'zoom', min: 1.0, max: 4.5, dec: 2 },
        { key: 'orbit', label: 'orbit', min: -1.5, max: 1.5, dec: 2 },
        { key: 'tilt', label: 'tilt', min: -1.2, max: 1.2, dec: 2 }
      ],
      defaults: {
        cardFormation: 'glass feed',
        faceMode: 'images',
        count: 9,
        size: 1.0,
        corner: 0.06,
        speed: 0.34,
        warp: 0.08,
        zoom: 2.0,
        orbit: 0.0,
        tilt: -0.59
      },
      formatCopy: function (p) { return JSON.stringify(p, null, 2); }
    },
    bg: {
      title: 'background',
      dropdown: {
        key: 'bgPreset',
        options: ['mesh drift', 'silk blend', 'ink ridges', 'gradient mesh', 'ascii art']
      },
      sliders: [
        { key: 'angle', label: 'angle', min: 0, max: 360, dec: 0 },
        { key: 'wave', label: 'wave', min: 0, max: 40, dec: 0 },
        { key: 'distortion', label: 'distortion', min: 0, max: 100, dec: 0 },
        { key: 'soften', label: 'soften', min: 0, max: 100, dec: 0 },
        { key: 'vignette', label: 'vignette', min: 0, max: 100, dec: 0 },
        { key: 'grain', label: 'grain', min: 0, max: 150, dec: 0 }
      ],
      defaults: {
        bgPreset: 'mesh drift',
        angle: 360,
        wave: 0,
        distortion: 74,
        soften: 62,
        vignette: 58,
        grain: 60
      },
      formatCopy: function (p) { return JSON.stringify(p, null, 2); }
    }
  };

  function ensureJigChromeFont() {
    if (typeof document === 'undefined' || !document.head) return;
    document.documentElement.style.setProperty('--jig-chrome-font', JIG_FONT_STACK);
    if (!document.getElementById('style-jig-top-font')) {
      const link = document.createElement('link');
      link.id = 'style-jig-top-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
      document.head.appendChild(link);
    }
  }

  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) {
      return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  function isInsideJig(el) {
    if (!el || !el.closest) return true;
    return Boolean(
      el.closest(
        '[data-style-jig], [data-style-jig-bottom], [data-immersive-jig], [data-auto-ignore], .top-jig-wrap, .bottom-motion-wrap, .dk-panel, .toc'
      )
    );
  }

  function resolveActiveStage() {
    const activeSlide = document.querySelector('.slide.active, [data-jig-stage-active="true"]');
    if (isVisible(activeSlide)) return activeSlide;
    const stage = document.querySelector('[data-jig-stage], main.stage, main, #root');
    if (isVisible(stage)) return stage;
    return document.body;
  }

  function enforceLayeringAndSafeZones() {
    document.querySelectorAll('.top-jig-wrap, .bottom-motion-wrap, .dk-panel, [data-style-jig], [data-immersive-jig]').forEach((el) => {
      el.style.zIndex = String(JIG_Z_INDEX);
    });
    document.querySelectorAll('.stage, .slides-viewport, [data-jig-stage]').forEach((st) => {
      st.style.position = st.style.position || 'relative';
      st.style.zIndex = '1';
      st.style.isolation = 'isolate';
    });
    fitStageTargets();
  }

  function fitStageTargets() {
    document.querySelectorAll('.fit-stage').forEach((fitStage) => {
      if (!isVisible(fitStage)) return;
      const target = fitStage.querySelector('.fit-target');
      if (!target) return;
      const slide = fitStage.closest('.slide');
      const isImm = slide && slide.classList.contains('imm-exp-slide');
      const topReserve = isImm ? 0 : (window.innerWidth < 980 ? 108 : SAFE_ZONE_PAD_PX);
      const botReserve = isImm ? 0 : SAFE_ZONE_PAD_PX;
      const availW = Math.max(120, fitStage.clientWidth - 48);
      const availH = Math.max(120, fitStage.clientHeight - topReserve - botReserve);
      const natW = target.offsetWidth || 1;
      const natH = target.offsetHeight || 1;
      const scale = Math.min(1, availW / natW, availH / natH);
      target.style.transform = 'scale(' + scale.toFixed(4) + ')';
    });
  }

  function detectImmersiveLayer(stageEl) {
    const stage = stageEl || resolveActiveStage();
    if (!stage) return null;
    if (
      stage.getAttribute('data-hide-immersive-jig') === 'true' ||
      stage.querySelector('[data-hide-immersive-jig="true"]')
    ) {
      return null;
    }
    const explicit = stage.matches && stage.matches('[data-immersive-layer]')
      ? stage
      : stage.querySelector('[data-immersive-layer]');
    if (explicit) {
      const mode = (explicit.getAttribute('data-immersive-layer') || '').trim().toLowerCase();
      if (mode === 'assembled' || mode === 'none' || mode === 'off') return null;
      if (DEFAULT_SCHEMAS[mode] || (global.__JIG_IMMERSIVE_SCHEMA__ && global.__JIG_IMMERSIVE_SCHEMA__[mode])) {
        return mode;
      }
    }
    if (
      stage.id === 'immAssembledStage' ||
      (stage.querySelector('iframe[name*="overlay"]') && stage.querySelector('.transparent-over-shader'))
    ) {
      return null;
    }
    if (
      Array.from(
        stage.querySelectorAll(
          'canvas[data-engine*="three"], [data-r3f-canvas], [data-3d-scene], iframe[name*="cuboid"]:not([name*="overlay"]), iframe[data-immersive="3d"]'
        )
      ).some(isVisible)
    ) {
      return '3d';
    }
    if (
      Array.from(
        stage.querySelectorAll('canvas.imm-shader-canvas, canvas[data-shader], [data-shader-uniforms], #immShaderViewStage')
      ).some(isVisible)
    ) {
      return 'shader';
    }
    if (
      Array.from(
        stage.querySelectorAll('.kp-scroll-canvas:not(.transparent-over-shader), [data-parallax-stage], [data-k-section]')
      ).some(isVisible)
    ) {
      return 'parallax';
    }
    return null;
  }

  function mountScrubSliders(specs, stateObj, hostEl, onChange) {
    const updaters = [];
    if (!hostEl) return updaters;
    specs.forEach((spec) => {
      const row = document.createElement('div');
      row.className = 'dk-slider-row';
      row.innerHTML =
        '<div class="dk-slider-fill"></div>' +
        '<span class="dk-slider-label">' + spec.label + '</span>' +
        '<span class="dk-slider-val"></span>';
      hostEl.appendChild(row);

      const fillEl = row.querySelector('.dk-slider-fill');
      const valEl = row.querySelector('.dk-slider-val');

      function refresh() {
        const pct = Math.max(0, Math.min(1, (stateObj[spec.key] - spec.min) / (spec.max - spec.min))) * 100;
        fillEl.style.width = pct.toFixed(2) + '%';
        valEl.textContent = Number(stateObj[spec.key]).toFixed(spec.dec);
      }
      refresh();
      updaters.push(refresh);

      function scrubFromX(clientX) {
        const rect = row.getBoundingClientRect();
        if (!rect.width) return;
        const norm = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const raw = spec.min + norm * (spec.max - spec.min);
        stateObj[spec.key] = spec.dec === 0 ? Math.round(raw) : parseFloat(raw.toFixed(spec.dec));
        refresh();
        if (onChange) onChange(spec.key, stateObj[spec.key]);
      }

      let dragging = false;
      row.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        row.classList.add('dragging');
        row.setPointerCapture(e.pointerId);
        scrubFromX(e.clientX);
      });
      row.addEventListener('pointermove', (e) => {
        if (dragging) scrubFromX(e.clientX);
      });
      const stop = () => {
        dragging = false;
        row.classList.remove('dragging');
      };
      row.addEventListener('pointerup', stop);
      row.addEventListener('pointercancel', stop);
    });
    return updaters;
  }

  function resetParallaxJig() {
    document
      .querySelectorAll('.kp-scroll-canvas, [data-parallax-stage], #kpSoloScroller, #kpCombScroller')
      .forEach((sc) => {
        sc.scrollTop = 0;
      });
    [document.documentElement, document.body].filter(Boolean).forEach((el) => {
      el.setAttribute('data-style', 'clone');
      el.setAttribute('data-skin', 'clone');
      el.setAttribute('data-jig', 'clone');
      el.setAttribute('data-style-folder', 'styles/clone');
    });
    document.querySelectorAll('[data-jig-pick], [data-style-jig-slot]').forEach((btn) => {
      const pick = btn.getAttribute('data-jig-pick') || btn.getAttribute('data-style-jig-slot');
      btn.classList.toggle('active', pick === 'clone');
    });
    window.dispatchEvent(new CustomEvent('style-jig:reset-style', { detail: { style: 'clone' } }));
  }

  function broadcastImmersivePatch(mode, params, key, reset) {
    if (reset && mode === 'parallax') {
      resetParallaxJig();
    }
    const prefix = mode === 'parallax' ? 'kp' : mode === 'shader' ? 'shd' : mode === 'immersive' ? 'imm' : '3d';
    Object.keys(params).forEach((k) => {
      const kebab = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      document.documentElement.style.setProperty('--jig-' + prefix + '-' + kebab, String(params[k]));
    });
    window.dispatchEvent(
      new CustomEvent('style-jig:immersive-change', {
        detail: { mode: mode, key: key || null, params: Object.assign({}, params), reset: Boolean(reset) }
      })
    );
    document.querySelectorAll('iframe').forEach((frame) => {
      if (!frame.contentWindow) return;
      if (mode === '3d') {
        frame.contentWindow.postMessage(Object.assign({ type: 'CUBOID_PATCH', reset: Boolean(reset) }, params), '*');
      } else if (mode === 'shader') {
        frame.contentWindow.postMessage({ type: 'SILK_SYNC', params: Object.assign({}, params) }, '*');
      }
      frame.contentWindow.postMessage({ type: 'JIG_IMMERSIVE_PATCH', mode: mode, params: Object.assign({}, params), reset: Boolean(reset) }, '*');
    });
  }

  function createUnscriptedAutoTraveler(opts) {
    const options = opts || {};
    const actionIntervalMs = options.actionIntervalMs || 1550;
    const scrollSpeedPx = options.scrollSpeedPx || 2.1;
    let active = false;
    let rafId = 0;
    let timerId = 0;
    let scrollDir = 1;
    let dwellUntil = 0;
    let tick = 0;
    let lastHover = null;

    const samplePrompts = [
      'Summarize weekly launch milestones & open approval gate',
      'Compare Q3 conversion telemetry across mobile and desktop',
      'Generate kinetic typography & shader tokens for review'
    ];

    function findScroller(stage) {
      const all = [stage].concat(Array.from(stage.querySelectorAll('*'))).filter((el) => {
        if (isInsideJig(el) || !isVisible(el)) return false;
        if (el.scrollHeight <= el.clientHeight + 20) return false;
        const oy = window.getComputedStyle(el).overflowY;
        return oy === 'auto' || oy === 'scroll' || oy === 'overlay';
      });
      if (all.length > 0) {
        all.sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight));
        return all[0];
      }
      const docEl = document.scrollingElement;
      if (docEl && docEl.scrollHeight > docEl.clientHeight + 20) return docEl;
      return null;
    }

    function loop(now) {
      if (!active) return;
      const stage = resolveActiveStage();
      if (stage) {
        const scroller = findScroller(stage);
        if (scroller && now >= dwellUntil) {
          const maxS = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
          let next = scroller.scrollTop + scrollDir * scrollSpeedPx;
          if (next >= maxS) {
            next = maxS;
            scrollDir = -1;
            dwellUntil = now + 520;
          } else if (next <= 0) {
            next = 0;
            scrollDir = 1;
            dwellUntil = now + 520;
          }
          scroller.scrollTop = next;
        }
        const t = now * 0.001;
        const nx = Math.sin(t * 0.85) * 0.55;
        const ny = Math.cos(t * 0.62) * 0.38;
        stage.querySelectorAll('iframe').forEach((fr) => {
          if (fr.contentWindow && isVisible(fr)) {
            fr.contentWindow.postMessage({ type: 'IMMERSIVE_POINTER', nx: nx, ny: ny }, '*');
          }
        });
      }
      rafId = window.requestAnimationFrame(loop);
    }

    function stepInteraction() {
      if (!active) return;
      const stage = resolveActiveStage();
      if (!stage) return;

      const hoverables = Array.from(
        stage.querySelectorAll('[data-k-role], .wheel-card, .fl-item, button:not([disabled]), [role="tab"]')
      ).filter((el) => !isInsideJig(el) && isVisible(el));

      if (hoverables.length > 0) {
        const h = hoverables[tick % hoverables.length];
        if (lastHover && lastHover !== h) {
          lastHover.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
        }
        const r = h.getBoundingClientRect();
        h.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
        h.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r.left + r.width * 0.55, clientY: r.top + r.height * 0.45 }));
        lastHover = h;
      }

      const inputs = Array.from(
        stage.querySelectorAll('textarea:not([disabled]):not([readonly]), input[type="text"]:not([disabled]):not([readonly])')
      ).filter((el) => !isInsideJig(el) && isVisible(el));

      if (inputs.length > 0 && tick % 3 === 0) {
        const inp = inputs[tick % inputs.length];
        inp.value = samplePrompts[tick % samplePrompts.length];
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const buttons = Array.from(
        stage.querySelectorAll(
          'button:not([disabled]), [role="tab"], [role="switch"], [data-fill-target], [data-tag-box], [data-cycle-values], [data-pop-toggle]'
        )
      ).filter((el) => {
        if (isInsideJig(el) || !isVisible(el)) return false;
        const txt = (el.textContent || el.getAttribute('aria-label') || '').toLowerCase();
        if (/delete|remove|logout|sign out|destroy|reset/.test(txt)) return false;
        return true;
      });

      if (buttons.length > 0) {
        buttons[tick % buttons.length].click();
      }

      tick += 1;
      fitStageTargets();
    }

    function stop() {
      if (!active) return;
      active = false;
      window.cancelAnimationFrame(rafId);
      window.clearInterval(timerId);
      if (lastHover) {
        lastHover.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
        lastHover = null;
      }
      document.documentElement.setAttribute('data-style-auto', 'false');
      document.querySelectorAll('[data-auto-toggle], [data-style-jig-auto]').forEach((b) => {
        b.classList.remove('playing');
      });
      if (options.onStateChange) options.onStateChange(false);
    }

    function start() {
      if (active) return;
      active = true;
      document.documentElement.setAttribute('data-style-auto', 'true');
      document.querySelectorAll('[data-auto-toggle], [data-style-jig-auto]').forEach((b) => {
        b.classList.add('playing');
      });
      rafId = window.requestAnimationFrame(loop);
      timerId = window.setInterval(stepInteraction, actionIntervalMs);
      if (options.onStateChange) options.onStateChange(true);
    }

    function toggle() {
      if (active) stop();
      else start();
      return active;
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && active) stop();
    });

    return { start: start, stop: stop, toggle: toggle, isActive: function () { return active; } };
  }

  function setTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    if (document.body) document.body.setAttribute('data-theme', next);
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      const moon = btn.querySelector('.icon-moon');
      const sun = btn.querySelector('.icon-sun');
      if (moon) moon.style.display = next === 'dark' ? '' : 'none';
      if (sun) sun.style.display = next === 'light' ? '' : 'none';
    });
    window.dispatchEvent(new CustomEvent('style-jig:theme', { detail: { theme: next } }));
  }

  function mountHeaderDropdown(spec, stateObj, headerEl, onChange) {
    if (!headerEl || !spec || !spec.options) return function () {};
    const titleEl = headerEl.querySelector('.dk-root-title');
    const wrap = document.createElement('div');
    wrap.className = 'dk-dropdown';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dk-dropdown-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML =
      '<span class="dk-dropdown-label"></span>' +
      '<svg class="dk-dropdown-chevron" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6">' +
      '<path d="M3 4.5L6 7.5L9 4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const labelEl = trigger.querySelector('.dk-dropdown-label');
    const menu = document.createElement('div');
    menu.className = 'dk-dropdown-menu';
    menu.setAttribute('role', 'listbox');

    const itemButtons = [];
    spec.options.forEach((opt) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'dk-dropdown-item';
      item.setAttribute('role', 'option');
      item.dataset.optValue = opt;
      item.textContent = opt;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        stateObj[spec.key] = opt;
        setOpen(false);
        refresh();
        if (onChange) onChange(spec.key, opt);
      });
      menu.appendChild(item);
      itemButtons.push(item);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    if (titleEl) headerEl.replaceChild(wrap, titleEl);
    else headerEl.insertBefore(wrap, headerEl.firstChild);

    function setOpen(next) {
      wrap.classList.toggle('open', next);
      trigger.setAttribute('aria-expanded', next ? 'true' : 'false');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!wrap.classList.contains('open'));
    });

    document.addEventListener('pointerdown', (e) => {
      if (wrap.classList.contains('open') && !wrap.contains(e.target)) {
        setOpen(false);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrap.classList.contains('open')) {
        e.stopPropagation();
        setOpen(false);
      }
    });

    function refresh() {
      const cur = stateObj[spec.key] || spec.options[0];
      if (labelEl) labelEl.textContent = cur;
      itemButtons.forEach((btn) => {
        const isAct = btn.dataset.optValue === cur;
        btn.classList.toggle('active', isAct);
        btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
      });
    }
    refresh();
    return refresh;
  }

  function isImmersiveViewStage(stageEl) {
    const stage = stageEl || resolveActiveStage();
    if (!stage) return false;
    if (
      stage.classList.contains('imm-exp-slide') ||
      stage.id === 'immAssembledStage' ||
      stage.getAttribute('data-imm-libs-disabled') === 'true'
    ) {
      return true;
    }
    const explicit = stage.matches && stage.matches('[data-immersive-layer]')
      ? stage
      : stage.querySelector('[data-immersive-layer]');
    if (explicit) {
      const mode = (explicit.getAttribute('data-immersive-layer') || '').trim().toLowerCase();
      if (mode && mode !== 'none' && mode !== 'off') return true;
    }
    return detectImmersiveLayer(stage) !== null;
  }

  function syncImmersiveLibraryState(forceDisabled) {
    const disabled = typeof forceDisabled === 'boolean' ? forceDisabled : isImmersiveViewStage();
    document.documentElement.setAttribute('data-imm-libs-disabled', disabled ? 'true' : 'false');
    if (document.body) {
      document.body.setAttribute('data-imm-libs-disabled', disabled ? 'true' : 'false');
    }
    document
      .querySelectorAll(
        '.floating-lib-plate, [data-style-jig-plate="ui-libraries"], .floating-motion-plate, [data-style-jig-plate="motion-libraries"]'
      )
      .forEach((plate) => {
        plate.setAttribute('data-libs-disabled', disabled ? 'true' : 'false');
      });
    return disabled;
  }

  function syncAppLibraryLockState(forceLocked) {
    const stage = resolveActiveStage();
    const locked =
      typeof forceLocked === 'boolean'
        ? forceLocked
        : Boolean(
            (document.body && document.body.classList.contains('mapp-stage-active')) ||
              (stage && (stage.classList.contains('mapp-slide') || stage.getAttribute('data-app-libs-disabled') === 'true'))
          );
    document.documentElement.setAttribute('data-app-libs-disabled', locked ? 'true' : 'false');
    if (document.body) {
      document.body.setAttribute('data-app-libs-disabled', locked ? 'true' : 'false');
    }
    document.querySelectorAll('.floating-lib-plate, [data-style-jig-plate="ui-libraries"]').forEach((plate) => {
      plate.setAttribute('data-app-locked', locked ? 'true' : 'false');
    });
    return locked;
  }

  function injectNoScrollbarStyles(targetDocOrFrame) {
    try {
      const doc =
        targetDocOrFrame && targetDocOrFrame.contentDocument
          ? targetDocOrFrame.contentDocument
          : targetDocOrFrame || document;
      if (!doc || !doc.head || doc.getElementById('jig-no-scrollbar-style')) return;
      const st = doc.createElement('style');
      st.id = 'jig-no-scrollbar-style';
      st.textContent =
        '*, *::before, *::after, html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; } ' +
        '*::-webkit-scrollbar, html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }';
      doc.head.appendChild(st);
    } catch (_e) {
      // Ignore cross-origin frame access errors
    }
  }

  function getStandaloneUrl() {
    const body = document.body;
    const domain = (body && (body.getAttribute('data-domain') || body.getAttribute('data-slide'))) || 'stage';
    const style = (body && (body.getAttribute('data-active-style') || body.getAttribute('data-jig'))) || 'clone';
    const variant = (body && body.getAttribute('data-active-variant')) || '1';
    const theme = document.documentElement.getAttribute('data-jig-theme') || (body && body.getAttribute('data-theme')) || 'dark';
    const lib = (body && body.getAttribute('data-active-lib')) || 'shadcn';
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('app', domain);
      url.searchParams.set('style', style);
      url.searchParams.set('variant', variant);
      url.searchParams.set('theme', theme);
      url.searchParams.set('lib', lib);
      return url.toString();
    } catch (_e) {
      return '?app=' + encodeURIComponent(domain) + '&style=' + encodeURIComponent(style) + '&variant=' + encodeURIComponent(variant) + '&theme=' + encodeURIComponent(theme);
    }
  }

  function copyPrompt() {
    const stage = resolveActiveStage();
    const style = (document.body && (document.body.getAttribute('data-active-style') || document.body.getAttribute('data-jig'))) || 'clone';
    const variant = (document.body && document.body.getAttribute('data-active-variant')) || '1';
    const theme = document.documentElement.getAttribute('data-jig-theme') || (document.body && document.body.getAttribute('data-theme')) || 'dark';
    const snapshot = stage ? stage.innerHTML : '';
    const promptText = [
      'Build and render the EXACT view shown in the live HTML snapshot below -- preserving layout, color tokens, typography, and interactive controls.',
      '',
      'ACTIVE CONTEXT:',
      '- Style: ' + style + ' (variant #' + variant + ')',
      '- Theme: ' + theme,
      '',
      'LIVE STAGE HTML:',
      '```html',
      snapshot,
      '```'
    ].join('\n');
    global.__LAST_COPIED_JIG_PROMPT__ = promptText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(promptText).catch(function () {});
    }
    return promptText;
  }

  function openTrace() {
    const style = (document.body && (document.body.getAttribute('data-active-style') || document.body.getAttribute('data-jig'))) || 'clone';
    const variant = (document.body && document.body.getAttribute('data-active-variant')) || '1';
    const theme = document.documentElement.getAttribute('data-jig-theme') || (document.body && document.body.getAttribute('data-theme')) || 'dark';
    const md = [
      '# Design Kit Jig Trace',
      '',
      '- Style: `' + style + '` (variant #' + variant + ')',
      '- Theme: `' + theme + '`',
      '- Standalone URL: `' + getStandaloneUrl() + '`',
      ''
    ].join('\n');
    try {
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    } catch (_e) {
      // Ignore popup blocks cleanly
    }
    return md;
  }

  global.JigAgent = {
    JIG_Z_INDEX: JIG_Z_INDEX,
    SAFE_ZONE_PAD_PX: SAFE_ZONE_PAD_PX,
    STYLE_TAXONOMY: STYLE_TAXONOMY,
    DEFAULT_SCHEMAS: DEFAULT_SCHEMAS,
    ensureJigChromeFont: ensureJigChromeFont,
    enforceLayeringAndSafeZones: enforceLayeringAndSafeZones,
    fitStageTargets: fitStageTargets,
    detectImmersiveLayer: detectImmersiveLayer,
    isImmersiveViewStage: isImmersiveViewStage,
    syncImmersiveLibraryState: syncImmersiveLibraryState,
    syncAppLibraryLockState: syncAppLibraryLockState,
    injectNoScrollbarStyles: injectNoScrollbarStyles,
    resetParallaxJig: resetParallaxJig,
    mountHeaderDropdown: mountHeaderDropdown,
    mountScrubSliders: mountScrubSliders,
    broadcastImmersivePatch: broadcastImmersivePatch,
    createUnscriptedAutoTraveler: createUnscriptedAutoTraveler,
    setTheme: setTheme,
    getStandaloneUrl: getStandaloneUrl,
    copyPrompt: copyPrompt,
    openTrace: openTrace
  };

  if (typeof document !== 'undefined') {
    const boot = () => {
      ensureJigChromeFont();
      enforceLayeringAndSafeZones();
      syncImmersiveLibraryState();
      syncAppLibraryLockState();
      if (typeof MutationObserver !== 'undefined' && document.body) {
        const obs = new MutationObserver(() => {
          syncImmersiveLibraryState();
          syncAppLibraryLockState();
        });
        obs.observe(document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ['class', 'data-immersive-layer', 'data-app-libs-disabled']
        });
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
    window.addEventListener('resize', fitStageTargets);
  }
})(typeof window !== 'undefined' ? window : globalThis);
