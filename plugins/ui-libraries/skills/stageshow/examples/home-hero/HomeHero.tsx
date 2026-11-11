import { Fragment, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { Badge, Bar, Check, Icon, Roll, Spinner, Stage, States, Swap, Toggle, Window, between, clock, type Act, type Rect } from '../../kit'
import './home-hero.css'

// Exact local port of the opening 5-tile showcase ("Made with Stageshow.")
// at the top of https://benji.org/stageshow:
//   1. Controls stage (cursor clicks Publish -> Live, toggle, tabs, search, marquee, stepper, slider, menu, command ring)
//   2. Frosted glass revenue window over warm radial gradient rings
//   3. Dark music player with animated cover art & live progress bar
//   4. Tactile orange kana keyboard with circle cursor typing words
//   5. App icon grid with long-press jiggle edit mode and drag-to-reorder

type ControlState = {
  sent: 'idle' | 'busy' | 'done'
  on: boolean
  tab: number
  checks: [boolean, boolean, boolean]
  q: string
  qFocus: boolean
  marq: Rect | null
  added: boolean
  gap: number
  level: number
  menu: boolean
  hover: number
  pick: number
  spin: number
}

const initialControls: ControlState = {
  sent: 'idle',
  on: false,
  tab: 0,
  checks: [true, false, false],
  q: '',
  qFocus: false,
  marq: null,
  added: false,
  gap: 24,
  level: 0.15,
  menu: false,
  hover: 1,
  pick: 1,
  spin: 0,
}

const controlRest = { x: 256, y: 124 }
const cadenceOptions = ['Daily', 'Weekly', 'Monthly']
const checklistItems = ['Design', 'Build', 'Ship']
const peopleInitials = ['A', '', '']

const posStyle = (left: number, top: number, width?: number, height?: number): CSSProperties => ({
  left,
  top,
  width,
  height,
})

async function runControlScript(e: Act<ControlState>) {
  await e.wait(400)
  await e.click({ at: 'publish', x: 0.6, y: 0.6 })
  await e.set({ sent: 'busy' })
  await e.wait(650)
  await e.set({ sent: 'done' })
  await e.wait(200)
  await e.click('switch')
  await e.set({ on: true })
  await e.click('tab-1')
  await e.set({ tab: 1 })
  await e.wait(100)
  await e.click('check-1')
  await e.set((a) => ({ checks: [a.checks[0], true, a.checks[2]] }))
  await e.wait(150)
  await e.click({ at: 'search', x: 0.55, y: 0.5 })
  await e.set({ qFocus: true })
  await e.type('q', 'Stageshow', { interval: 60 })
  await e.wait(150)
  e.mark('created')

  const marqStart = { x: 198, y: 88 }
  await e.move(marqStart)
  await e.set({ qFocus: false })
  await e.drag({ x: 322, y: 192 }, (at) => e.put({ marq: between(marqStart, at) }), { duration: 800 })
  await e.set({ added: true })
  await e.wait(350)
  await e.click('plus')
  await e.set({ gap: 25 })
  await e.click('plus')
  await e.set({ gap: 26 })
  await e.wait(250)
  await e.move('knob')
  const track = e.rect('track')
  await e.drag(
    { x: track.x + 0.58 * track.width, y: track.y + track.height / 2 },
    (at) => e.put({ level: Math.min(1, Math.max(0, (at.x - track.x) / track.width)) }),
    { duration: 600 },
  )
  await e.click({ at: 'select', x: 0.4, y: 0.55 })
  await e.set({ menu: true, hover: 1 })
  await e.wait(300)
  const moveOpt2 = e.move('opt-2', { duration: 520 })
  await e.wait(260)
  await e.set({ hover: 2 })
  await moveOpt2
  await e.wait(150)
  await e.click('opt-2')
  await e.set({ pick: 2 })
  await e.wait(140)
  await e.set({ menu: false })
  await e.wait(300)
  await e.click({ at: 'command', x: 0.55, y: 0.6 })
  await e.set((a) => ({ spin: a.spin + 1 }))
  await e.wait(1100)

  // Seamless reset sequence
  await e.click({ at: 'select', x: 0.4, y: 0.55 })
  await e.set({ menu: true, hover: 2 })
  await e.wait(250)
  const moveOpt1 = e.move('opt-1', { duration: 420 })
  await e.wait(210)
  await e.set({ hover: 1 })
  await moveOpt1
  await e.wait(100)
  await e.click('opt-1')
  await e.set({ pick: 1 })
  await e.wait(140)
  await e.set({ menu: false })
  await e.wait(150)
  await e.click({ x: 198, y: 194 })
  await e.set({ added: false, marq: null })
  await e.wait(150)
  await e.move('knob')
  const trackReset = e.rect('track')
  await e.drag(
    { x: trackReset.x + trackReset.width * initialControls.level, y: trackReset.y + trackReset.height / 2 },
    (at) => e.put({ level: Math.min(1, Math.max(0, (at.x - trackReset.x) / trackReset.width)) }),
    { duration: 550 },
  )
  await e.set({ level: initialControls.level })
  await e.set({ sent: 'idle' })
  await e.click('minus')
  await e.set({ gap: 25 })
  await e.click('minus')
  await e.set({ gap: 24 })
  await e.wait(150)
  await e.click('switch')
  await e.set({ on: false })
  await e.click('tab-0')
  await e.set({ tab: 0 })
  await e.wait(150)
  await e.click('clear')
  await e.set({ q: '' })
  await e.wait(100)
  await e.click('check-1')
  await e.set({ checks: [true, false, false] })
  await e.wait(200)
  await e.move(controlRest, { duration: 800 })
  await e.set({ ...initialControls })
  await e.wait(300)
}

function ControlsScene() {
  return (
    <div className="ho-controls" data-ss-fill="">
      <Stage
        width={480}
        height={270}
        initial={initialControls}
        cursor={{ at: controlRest, idle: false, style: 'large' }}
        className="ac"
        script={runControlScript}
      >
        {(a) => (
          <div className="ac-wall">
            <span className="ac-seg" style={posStyle(16, 16, 204, 48)}>
              <span className="ac-seg__thumb" style={{ transform: `translateX(${100 * a.tab}%)` }} />
              {['Day', 'Week', 'Month'].map((label, idx) => (
                <span
                  key={label}
                  className="ac-seg__opt"
                  data-target={`tab-${idx}`}
                  data-cursor="hand"
                  data-on={a.tab === idx || undefined}
                >
                  {label}
                </span>
              ))}
            </span>
            <span className="ac-pos" style={posStyle(234, 26)}>
              <Toggle on={a.on} data-target="switch" data-cursor="hand" />
            </span>
            <span className="ac-stepper" style={posStyle(298, 16, 166, 48)}>
              <span className="ac-stepper__label">Gap</span>
              <span className="ac-stepper__btn" data-target="minus" data-cursor="hand">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path d="M3.5 8h9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              <Roll className="ac-stepper__value">{String(a.gap)}</Roll>
              <span className="ac-stepper__btn" data-target="plus" data-cursor="hand">
                <Icon name="plus" size={16} stroke={2} />
              </span>
            </span>
            <span
              className="ac-search"
              data-target="search"
              data-cursor="ibeam"
              data-focus={a.qFocus || undefined}
              style={posStyle(16, 80, 168, 48)}
            >
              <Icon name="search" size={18} />
              <span className="ac-search__text">
                {a.q || (!a.qFocus && <span className="ac-hint">Search</span>)}
                {a.qFocus && <span className="ac-caret" />}
              </span>
              <span
                className="ac-search__clear"
                data-target="clear"
                data-cursor="hand"
                data-show={(a.q && !a.qFocus) || undefined}
              >
                <Icon name="close" size={10} stroke={2.2} />
              </span>
            </span>
            <div className="ac-list" style={posStyle(16, 144, 168, 150)}>
              {checklistItems.map((item, idx) => (
                <span key={item} className="ac-item" data-done={a.checks[idx] || undefined}>
                  <span data-target={`check-${idx}`} data-cursor="hand" className="ac-check">
                    <Check on={a.checks[idx]} size={20} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
            <span
              className="ac-btn ac-btn--primary"
              data-target="publish"
              data-cursor="hand"
              data-state={a.sent}
              style={posStyle(336, 86, 128, 48)}
            >
              <States
                value={a.sent}
                states={{
                  idle: 'Publish',
                  busy: <Spinner size={18} />,
                  done: (
                    <span className="ac-ok">
                      <Icon name="check" size={18} stroke={2.2} />
                      Live
                    </span>
                  ),
                }}
              />
            </span>
            <div className="ac-slider" style={posStyle(344, 158, 160, 28)}>
              <span className="ac-slider__track" data-target="track">
                <span className="ac-slider__fill" style={{ width: `${100 * a.level}%` }} />
                <span className="ac-slider__knob" data-target="knob" data-cursor="open" style={{ left: `${100 * a.level}%` }} />
              </span>
            </div>
            {a.spin > 0 && (
              <span key={a.spin} className="ac-blooms" style={posStyle(344, 210, 48, 48)}>
                <span className="ac-bloom" />
                <span className="ac-bloom" />
              </span>
            )}
            <span className="ac-icon-btn" data-target="command" data-cursor="hand" style={posStyle(344, 210, 48, 48)}>
              <span key={a.spin} className="ac-ring" data-whirl={a.spin > 0 || undefined} />
            </span>
            <span className="ac-people" style={posStyle(408, 207)}>
              {peopleInitials.map((initial, idx) => (
                <span key={idx} aria-hidden={!initial || undefined}>
                  {initial}
                </span>
              ))}
            </span>
            <div className="ac-area" data-cursor="crosshair" style={posStyle(188, 72, 144, 132)} />
            <div
              className="ac-frame"
              data-cursor="crosshair"
              data-selected={a.added || undefined}
              style={posStyle(208, 98, 104, 84)}
            >
              <span className="ac-frame__name">Frame</span>
              {a.added && (
                <Fragment>
                  {[0, 1, 2, 3].map((corner) => (
                    <span key={corner} className="ac-frame__handle" data-corner={corner} />
                  ))}
                  <span className="ac-frame__size">104 × 84</span>
                </Fragment>
              )}
            </div>
            {a.marq && !a.added && <div className="ac-marq" style={posStyle(a.marq.x, a.marq.y, a.marq.width, a.marq.height)} />}
            <span className="ac-btn ac-select" data-target="select" data-cursor="hand" style={posStyle(200, 210, 128, 48)}>
              <Roll variant="fade">{cadenceOptions[a.pick]}</Roll>
              <Icon name="chevron-down" size={18} />
            </span>
            <div className="ac-menu" data-open={a.menu || undefined} style={posStyle(200, 86, 144)}>
              <div className="ac-menu__list" role="menu">
                <span className="ac-menu__hl" style={{ transform: `translateY(${100 * a.hover}%)` }} />
                {cadenceOptions.map((opt, idx) => (
                  <span
                    key={opt}
                    className="ac-menu__item"
                    data-target={`opt-${idx}`}
                    data-on={idx === a.hover || undefined}
                    role="menuitem"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Stage>
    </div>
  )
}

/* ---------------- Palette & Timing Helpers ---------------- */

const waitUntil = <T,>(a: Act<T>, startedAt: number, targetMs: number) =>
  a.wait(Math.max(0, targetMs - (clock.now() - startedAt)))

const radialRings = (stops: string[]) =>
  `radial-gradient(circle at 104% 108%, ${stops[0]} 0 22%, ${stops[1]} 22% 36%, ${stops[2]} 36% 50%, ${stops[3]} 50% 63%, ${stops[4]} 63% 77%, ${stops[5]} 77% 91%, ${stops[6]} 91%)`

const originalPaletteVars: CSSProperties = {
  '--p-light': '#f4f4f3',
  '--p-dark': '#111113',
  '--p-accent': '#3b82f6',
  '--p-accent-soft': 'rgba(59,130,246,.12)',
  '--p-deep': '#5b5bf6',
  '--p-c1': '#ffd9a0',
  '--p-c2': '#ff8a3d',
  '--p-c3': '#5b5bf6',
  '--p-ring': radialRings(['#ff5b2e', '#ff8a3d', '#ffb547', '#ffd9a0', '#c8bdff', '#8b7bff', '#5b5bf6']),
  '--p-ring-deep': radialRings(['#ff6a3d', '#e0457b', '#8a3fd1', '#4b35c9', '#2a2a8f', '#17184f', '#17184f']),
  '--p-tint': 'linear-gradient(180deg, #f7dfc8, #f0c7a9)',
  '--p-wall': 'linear-gradient(180deg, #f59a5a, #e4627a 58%, #8c4290)',
  '--p-rule': '#e5e3de',
  '--p-shadow': 'rgba(40, 30, 90, 0.3)',
  '--p-keys': 'linear-gradient(180deg, #ff7438, #ff5a1f)',
  '--p-glass': '#5b5bf6',
} as CSSProperties

/* ---------------- Frosted Glass Revenue Window ---------------- */

const seriesPoints = [22, 25, 23, 28, 26, 30, 27, 32, 29, 25]
const revenueDeltas = [120, 64, 210, 38, 96, 152, 72, 184, 45, 110]
const growthRates = [18, 18, 18, 19, 19, 19, 19, 18, 18, 18]
const cycleDeltaSum = revenueDeltas.reduce((acc, n) => acc + n, 0)
const mod = (n: number, m: number) => ((n % m) + m) % m
const revenueAt = (step: number) =>
  12480 + Math.floor(step / revenueDeltas.length) * cycleDeltaSum + revenueDeltas.slice(0, mod(step, revenueDeltas.length)).reduce((a, b) => a + b, 0)

function sampleSpline(pos: number) {
  const idx = Math.floor(pos)
  const t = pos - idx
  const pt = (k: number) => seriesPoints[mod(k, seriesPoints.length)]
  const p0 = pt(idx - 1)
  const p1 = pt(idx)
  const p2 = pt(idx + 1)
  const p3 = pt(idx + 2)
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function LiveSpline({ k, width, height }: { k: number; width: number; height: number }) {
  const lineRef = useRef<SVGPathElement>(null)
  const fillRef = useRef<SVGPathElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const currentK = useRef(k)
  const rightX = width - 5
  const segW = (rightX - 5) / 8
  const maxVal = Math.max(...seriesPoints) + 1
  const yOf = (val: number) => 5 + (1 - val / maxVal) * (height - 5) * 1.6

  useLayoutEffect(() => {
    const draw = (atK: number) => {
      let d = ''
      for (let x = 5; ; x += 3) {
        const cx = Math.min(x, rightX)
        d += `${d ? 'L' : 'M'}${cx.toFixed(1)} ${yOf(sampleSpline(atK - 8 + (cx - 5) / segW)).toFixed(1)}`
        if (cx >= rightX) break
      }
      lineRef.current?.setAttribute('d', d)
      fillRef.current?.setAttribute('d', `${d}L${rightX} ${height}L5 ${height}Z`)
      headRef.current?.setAttribute('transform', `translate(${rightX} ${yOf(sampleSpline(atK)).toFixed(1)})`)
    }
    const startK = currentK.current
    const svg = lineRef.current?.ownerSVGElement
    const isStill = Boolean(svg?.closest('[data-still]')) || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (startK === k || isStill) {
      currentK.current = k
      draw(k)
      return
    }
    const t0 = clock.now()
    let rafId = clock.raf(function frame(now) {
      const progress = Math.min(1, (now - t0) / 1000)
      currentK.current = startK + (k - startK) * easeInOut(progress)
      draw(currentK.current)
      if (progress < 1) rafId = clock.raf(frame)
    })
    return () => clock.cancelRaf(rafId)
  }, [k, width, height, rightX, segW, maxVal])

  const gradId = useId().replace(/:/g, '')
  return (
    <svg className="ho-live" width={width} height={height} aria-hidden>
      <defs>
        <linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ss-accent)" stopOpacity="0.18" />
          <stop offset="1" stopColor="var(--ss-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path ref={fillRef} fill={`url(#${gradId}-fill)`} />
      <path ref={lineRef} className="ho-live__line" />
      <g ref={headRef}>
        {k > 0 && <circle key={k} className="ho-live__ping" r={3.5} />}
        <circle className="ho-live__dot" r={3.5} />
      </g>
    </svg>
  )
}

function GlassRevenueTile({ w, h, g = 20, off = 1200, frosted = true }: { w: number; h: number; g?: number; off?: number; frosted?: boolean }) {
  const winWidth = Math.max(300, Math.round((w - g) * 1.22))
  const chartW = Math.min(300, w - g - 18 - 22)
  const chartH = Math.max(80, h - g - 68)
  return (
    <Stage
      width={w}
      height={h}
      theme="glass"
      accent="var(--p-glass, var(--p-accent))"
      initial={{ k: 0, t: 0, p: 0 }}
      script={async (a) => {
        const t0 = clock.now()
        for (let step = 1; ; step++) {
          const beatAt = off + (step - 1) * 2400
          await waitUntil(a, t0, beatAt)
          await a.set({ k: step })
          await waitUntil(a, t0, beatAt + 450)
          await a.set({ t: step })
          if (growthRates[mod(step, growthRates.length)] !== growthRates[mod(step - 1, growthRates.length)]) {
            await waitUntil(a, t0, beatAt + 1100)
            await a.set({ p: step })
          }
        }
      }}
      className="ho-stage ho-glass ho-ground--rings"
    >
      {(s) => (
        <Window
          chrome={frosted ? 'glass' : undefined}
          lights={frosted ? 'white' : undefined}
          url={frosted ? 'dashboard.northwind.co' : undefined}
          title={frosted ? undefined : 'Revenue'}
          className="ho-glass__window"
          data-frosted={frosted || undefined}
          style={{ left: g, top: g, width: winWidth, height: h + 40 }}
        >
          <div className="ho-glass__body">
            <div className="ho-glass__head">
              <span className="ho-glass__value">
                <Roll>{`$${revenueAt(s.t).toLocaleString('en-US')}`}</Roll>
              </span>
              <Badge tone="success">
                <Roll>{`+${growthRates[mod(s.p, growthRates.length)]}%`}</Roll>
              </Badge>
            </div>
            <LiveSpline k={s.k} width={chartW} height={frosted ? chartH - 12 : chartH} />
          </div>
        </Window>
      )}
    </Stage>
  )
}

/* ---------------- Dark Music Player Tile ---------------- */

const tracks = [
  { title: 'Low Tide', artist: 'Marlo', dur: 168 },
  { title: 'Neon Harbor', artist: 'The Vales', dur: 192 },
]

const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`

function PlayerGlyph({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  )
}

function MusicPlayerTile({ w, h, g = 20, off = 10000 }: { w: number; h: number; g?: number; off?: number }) {
  const innerH = h - 2 * g
  const isRow = w - 2 * g - innerH - 18 >= 136
  const startSec = tracks[0].dur - Math.round(off / 1000)
  const totalDur = tracks.reduce((sum, tr) => sum + tr.dur, 0)

  const playerScript = useMemo(
    () => async (a: Act<{ t: number; s: number }>) => {
      const t0 = clock.now()
      for (let tick = 1; ; tick++) {
        await waitUntil(a, t0, 1000 * tick)
        let rem = (startSec + tick) % totalDur
        let trackIdx = 0
        while (rem >= tracks[trackIdx].dur) {
          rem -= tracks[trackIdx++].dur
        }
        await a.set({ t: trackIdx, s: rem })
      }
    },
    [startSec, totalDur],
  )

  return (
    <Stage width={w} height={h} theme="dark" initial={{ t: 0, s: startSec }} script={playerScript} className="ho-stage ho-player ho-player--dark">
      {(a) => {
        const track = tracks[a.t]
        return (
          <div
            className="ho-player__in"
            data-layout={isRow ? 'row' : 'stack'}
            style={{ left: g, top: g, width: w - 2 * g, height: innerH, '--cover': `${isRow ? innerH : 48}px` } as CSSProperties}
          >
            <span className="ho-cover">
              <span className="ho-cover__a" data-on={a.t === 0 || undefined}>
                <span className="ho-cover__sun" />
                <span className="ho-cover__sea" />
              </span>
              <span className="ho-cover__b" data-on={a.t === 1 || undefined}>
                <span className="ho-cover__ring" />
              </span>
            </span>
            <div className="ho-player__side">
              <span className="ho-player__names">
                <Swap id={a.t} className="ho-player__title">{track.title}</Swap>
                <Swap id={a.t} className="ho-player__artist">{track.artist}</Swap>
              </span>
              <span className="ho-player__progress">
                <span className="ho-player__bar">
                  <span key={a.t} className="ho-player__fill" style={{ transform: `scaleX(${a.s / track.dur})` }} />
                </span>
                <span className="ho-player__times">
                  <Roll>{fmtTime(a.s)}</Roll>
                  <Swap id={a.t}>{fmtTime(track.dur)}</Swap>
                </span>
              </span>
              <span className="ho-player__controls">
                <PlayerGlyph d="M3.2 3h1.6v10H3.2zM13 3.7v8.6a.7.7 0 0 1-1.07.6L5.6 8.6a.7.7 0 0 1 0-1.2l6.33-4.3A.7.7 0 0 1 13 3.7Z" size={18} />
                <span className="ho-player__play">
                  <PlayerGlyph d="M4.2 3h2.6v10H4.2zM9.2 3h2.6v10H9.2z" size={16} />
                </span>
                <PlayerGlyph d="M11.2 3h1.6v10h-1.6zM3 3.7v8.6a.7.7 0 0 0 1.07.6l6.33-4.3a.7.7 0 0 0 0-1.2L4.07 3.1A.7.7 0 0 0 3 3.7Z" size={18} />
              </span>
            </div>
          </div>
        )
      }}
    </Stage>
  )
}

/* ---------------- Jiggle-Mode App Icon Reorder Tile ---------------- */

const appIcons = [
  { d: 'M12 4.5c4.7 0 8.5 3 8.5 6.8S16.7 18 12 18c-.9 0-1.8-.1-2.6-.3L5.2 19.6l1.2-3.4C4.6 14.9 3.5 13.2 3.5 11.3 3.5 7.5 7.3 4.5 12 4.5Z' },
  { text: '24' },
  { d: 'M13.2 2.8 5.6 13.1a.8.8 0 0 0 .64 1.27H11l-1.2 6.8 7.6-10.3a.8.8 0 0 0-.64-1.27H12l1.2-6.8Z' },
  { d: 'M7.4 5.2v12.8a.9.9 0 0 0 1.37.77l10.2-6.4a.9.9 0 0 0 0-1.54L8.77 4.43A.9.9 0 0 0 7.4 5.2Z' },
  { d: 'M12 2.8a7 7 0 0 1 7 7c0 5-7 11.6-7 11.6S5 14.8 5 9.8a7 7 0 0 1 7-7Zm0 4.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z' },
  { d: 'M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5Zm3.5 2.3v1.6h7V8.8Zm0 3.6v1.6h7v-1.6Zm0 3.6v1.6h4.4V16Z' },
  { d: 'M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z' },
  { d: 'M4 8.2A2.2 2.2 0 0 1 6.2 6h1.6l1.3-1.6h5.8L16.2 6h1.6A2.2 2.2 0 0 1 20 8.2v8.6a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 16.8Zm8 1.3a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z' },
  { d: 'M6 5h12v2.4H6Zm0 4.8h12v2.4H6Zm0 4.8h8v2.4H6Z' },
  { d: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Zm-.9 4v5.2l4.3 2.6.9-1.5-3.4-2V7.5Z' },
  { d: 'M5 11.2 10 16l9-9.2-1.7-1.6L10 12.7 6.7 9.5Z' },
  { d: 'M7 4h10a1 1 0 0 1 1 1v15.2l-6-3.6-6 3.6V5a1 1 0 0 1 1-1Z' },
]

const appBg = ['#0a7cff', '#fff', '#ff9500', '#1c1c1e', '#2fc455', '#7a5cff', '#ff3b45', '#2bb3f0', '#ffcc00', '#1c1c1e', '#1fb38a', '#ff6a3d']
const appFg = ['#fff', '#1c1c1e', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#6b4e00', '#fff', '#fff', '#fff']
const swaps: [number, number][] = [[0, 3], [2, 0], [1, 2], [3, 1], [0, 2], [2, 3]]

const moveItem = (arr: number[], from: number, to: number) => {
  const next = arr.filter((_, idx) => idx !== from)
  next.splice(to, 0, arr[from])
  return next
}

type IconGridState = {
  order: number[]
  edit: boolean
  lift: number | null
  drop: number | null
  drag: { id: number; x: number; y: number } | null
}

function buildIconScript(cfg: {
  off: number
  g: number
  size: number
  gap: number
  cols: number
  w: number
  h: number
  root: RefObject<HTMLDivElement | null>
}) {
  const { off, g, size, gap, cols, w, h, root } = cfg
  const step = size + gap
  const cellPos = (idx: number) => ({ x: g + (idx % cols) * step, y: g + Math.floor(idx / cols) * step })
  const grabOffset = { x: 0.84 * size, y: 0.86 * size }
  const handlePos = (idx: number) => ({ x: cellPos(idx).x + grabOffset.x, y: cellPos(idx).y + grabOffset.y })
  const visibleSlots = appIcons.map((_, idx) => idx).filter((idx) => cellPos(idx).x + size <= w && cellPos(idx).y + size <= h)
  const restCursor = { x: Math.round(0.55 * w), y: h + 36 }

  return async (s: Act<IconGridState>) => {
    const t0 = clock.now()
    let order = appIcons.map((_, idx) => idx)
    let pairIdx = 0
    if (visibleSlots.length < 2) return s.wait(1e9)
    for (let cycle = 0; ; cycle++) {
      const cycleStart = off + 12000 * cycle
      for (let move = 0; move < 3; move++, pairIdx++) {
        const [aIdx, bIdx] = swaps[pairIdx % swaps.length]
        const fromSlot = visibleSlots[aIdx % visibleSlots.length]
        let toSlot = visibleSlots[bIdx % visibleSlots.length]
        if (toSlot === fromSlot) toSlot = visibleSlots[(bIdx + 1) % visibleSlots.length]
        const itemId = order[fromSlot]
        const dragStartAt = cycleStart + 1500 + 2400 * move
        const holdDur = move ? 320 : 520
        await waitUntil(s, t0, dragStartAt - holdDur - 620)
        await s.move(handlePos(fromSlot), { duration: 620 })
        const cursorEl = root.current?.closest('.ss-stage')?.querySelector('.ss-cursor')
        cursorEl?.setAttribute('data-pressed', 'true')
        await s.wait(holdDur - 300)
        await s.set({ lift: itemId })
        if (!move) {
          await s.wait(220)
          await s.set({ edit: true })
        }
        await waitUntil(s, t0, dragStartAt)
        const nextOrder = moveItem(order, fromSlot, toSlot)
        const dest = handlePos(toSlot)
        let swapped = false
        await s.drag(
          dest,
          (at) => {
            const patch: Partial<IconGridState> = { drag: { id: itemId, x: at.x - grabOffset.x - g, y: at.y - grabOffset.y - g } }
            if (!swapped && Math.hypot(at.x - dest.x, at.y - dest.y) < 0.5 * step) {
              swapped = true
              patch.order = nextOrder
            }
            s.put(patch)
          },
          { duration: 820 },
        )
        order = nextOrder
        await s.set({ order, drag: null, lift: null, drop: itemId })
        await s.wait(440)
        await s.set({ drop: null })
      }
      await s.move(restCursor, { duration: 800 })
      await waitUntil(s, t0, cycleStart + 9200)
      await s.set({ edit: false })
    }
  }
}

function IconsTile({ w, h, g = 20, size = 48, gap = 14, cols = 3, off = 400 }: { w: number; h: number; g?: number; size?: number; gap?: number; cols?: number; off?: number }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cellStep = size + gap
  return (
    <Stage<IconGridState>
      width={w}
      height={h}
      initial={{ order: appIcons.map((_, idx) => idx), edit: false, lift: null, drop: null, drag: null }}
      script={buildIconScript({ off, g, size, gap, cols, w, h, root: rootRef })}
      cursor={{ at: { x: Math.round(0.55 * w), y: h + 36 }, style: 'circle', idle: false }}
      className="ho-stage ho-icons ho-icons--product"
    >
      {(a) => (
        <div ref={rootRef} className="ho-icons__grid" data-edit={a.edit || undefined} style={{ left: g, top: g, '--size': `${size}px` } as CSSProperties}>
          {appIcons.map((icon, id) => {
            const slotIdx = a.order.indexOf(id)
            const isDragging = a.drag?.id === id
            const tx = isDragging ? a.drag!.x : (slotIdx % cols) * cellStep
            const ty = isDragging ? a.drag!.y : Math.floor(slotIdx / cols) * cellStep
            return (
              <span
                key={id}
                className="ho-slot"
                data-drag={isDragging || undefined}
                data-lift={a.lift === id || undefined}
                data-drop={a.drop === id || undefined}
                style={{ translate: `${tx}px ${ty}px` }}
              >
                <span
                  className="ho-icon"
                  style={{
                    background: appBg[id],
                    color: appFg[id],
                    animationDelay: `${-((97 * id) % 280)}ms`,
                    animationDuration: `${250 + ((37 * id) % 4) * 14}ms`,
                  }}
                >
                  {icon.text ? (
                    <span className="ho-icon__text">
                      <span>FRI</span>
                      {icon.text}
                    </span>
                  ) : (
                    <svg viewBox="0 0 24 24" width={0.5 * size} height={0.5 * size} aria-hidden>
                      <path d={icon.d} fill="currentColor" fillRule="evenodd" />
                    </svg>
                  )}
                  <span className="ho-icon__minus" />
                </span>
              </span>
            )
          })}
        </div>
      )}
    </Stage>
  )
}

/* ---------------- Tactile Kana Keyboard Tile ---------------- */

const kanaMap: Record<string, string> = {
  Q: 'た', W: 'て', E: 'い', R: 'す', T: 'か', Y: 'ん', U: 'な',
  A: 'ち', S: 'と', D: 'し', F: 'は', G: 'き', H: 'く', J: 'ま',
  Z: 'つ', X: 'さ', C: 'そ', V: 'ひ', B: 'こ', N: 'み', M: 'も',
}

const keyRows = [
  { x: 0, keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U'].map((l) => ({ l, kana: kanaMap[l] })) },
  { x: 0, keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J'].map((l) => ({ l, kana: kanaMap[l] })) },
  { x: 0, keys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((l) => ({ l, kana: kanaMap[l] })) },
]

const words = ['SEA', 'WADED', 'SAW', 'EASED', 'DEW', 'CASE', 'WAS', 'SEWED', 'ACED', 'SAD', 'AWED', 'DECADES', 'WEDS', 'TREAD', 'FAST', 'GRADE', 'STAR', 'DRAFT', 'FEAST']

function pickKeyUnit(w: number, h: number, pad: number) {
  for (let u = 34; u <= 48; u++) {
    const gap = Math.round(0.17 * u)
    const bleed = (span: number) => (span - Math.floor((span + gap) / (u + gap)) * (u + gap)) / u
    const bx = bleed(w - pad)
    const by = bleed(h - pad)
    if (bx >= 0.4 && bx <= 0.7 && by >= 0.38 && by <= 0.7) return { u, gap }
  }
  return { u: 40, gap: 7 }
}

function fitKeysWidth(targetW: number, h: number) {
  for (let delta = 0; delta < 40; delta++) {
    for (const candidate of [targetW + delta, targetW - delta]) {
      const pad = 14
      let matches = false
      for (let u = 34; u <= 48; u++) {
        const gap = Math.round(0.17 * u)
        const bleed = (span: number) => (span - Math.floor((span + gap) / (u + gap)) * (u + gap)) / u
        const bx = bleed(candidate - pad)
        const by = bleed(h - pad)
        if (bx >= 0.4 && bx <= 0.7 && by >= 0.38 && by <= 0.7) { matches = true; break }
      }
      if (matches) return candidate
    }
  }
  return targetW
}

function KeysTile({ w, h, off = 600 }: { w: number; h: number; off?: number }) {
  const pad = 14
  const { u, gap } = pickKeyUnit(w, h, pad)

  const script = async (a: Act<{ down: string | null }>) => {
    const fits = (ch: string) => {
      const r = a.rect(`key-${ch}`)
      return Boolean(r && r.x >= 0 && r.y >= 0 && r.x + r.width <= w + 0.5 && r.y + r.height <= h + 0.5)
    }
    let valid = words.filter((word) => word.length <= 5 && word.split('').every(fits))
    if (!valid.length) valid = [keyRows.flatMap((r) => r.keys.map((k) => k.l)).filter(fits).join('')]
    if (!valid[0]) return a.wait(1e9)

    const t0 = clock.now()
    await waitUntil(a, t0, off)
    for (let wordIdx = 0; ; wordIdx++) {
      const chars = valid[wordIdx % valid.length].split('')
      for (let charIdx = 0; charIdx < chars.length; charIdx++) {
        const ch = chars[charIdx]
        const rect = a.rect(`key-${ch}`)
        await a.move(rect ? { x: rect.x + 0.95 * rect.width, y: rect.y + 0.96 * rect.height } : `key-${ch}`, {
          duration: wordIdx || charIdx ? 230 + ((3 * wordIdx + 7 * charIdx) % 4) * 45 : 620,
        })
        const clickDone = a.click()
        await a.set({ down: ch })
        await clickDone
        await a.wait(70 + ((wordIdx + charIdx) % 2) * 30)
        await a.set({ down: null })
        await a.wait(90)
      }
      await a.wait(600 + ((5 * wordIdx) % 4) * 200)
    }
  }

  return (
    <Stage<{ down: string | null }>
      width={w}
      height={h}
      initial={{ down: null }}
      script={script}
      cursor={{ at: { x: Math.round(0.62 * w), y: h + 36 }, style: 'circle', idle: false }}
      className="ho-stage ho-keys ho-keys--accent"
    >
      {(a) => (
        <div className="ho-keys__board" style={{ left: pad, top: pad, '--u': `${u}px`, '--kgap': `${gap}px` } as CSSProperties}>
          {keyRows.map((row, rIdx) => (
            <div key={rIdx} className="ho-keys__row" style={{ marginLeft: -row.x * (u + gap) }}>
              {row.keys.map((key) => (
                <span
                  key={key.l}
                  className="ho-key"
                  data-target={`key-${key.l}`}
                  data-down={a.down === key.l || undefined}
                  data-kana=""
                  style={{ width: u }}
                >
                  <span className="ho-key__l">{key.l}</span>
                  <span className="ho-key__kana">{key.kana}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </Stage>
  )
}

/* ---------------- Responsive 5-Tile Home Bento ---------------- */

type TileSpec = {
  key: string
  x: number
  y: number
  w: number
  h: number
  dark?: boolean
  draw: (w: number, h: number) => ReactNode
}

function layoutTiles(containerW: number): TileSpec[] {
  const heroH = Math.round((9 * containerW) / 16)
  if (containerW >= 520) {
    const rightW = fitKeysWidth(172, 126)
    const leftW = containerW - rightW - 8
    const row1Y = heroH + 8
    const row2Y = row1Y + 176 + 8
    return [
      { key: 'controls', x: 0, y: 0, w: containerW, h: heroH, draw: () => <ControlsScene /> },
      { key: 'glass', x: 0, y: row1Y, w: leftW, h: 176, draw: (w, h) => <GlassRevenueTile w={w} h={h} off={1200} frosted /> },
      { key: 'player', x: 0, y: row2Y, w: leftW, h: 176, dark: true, draw: (w, h) => <MusicPlayerTile w={w} h={h} off={10000} /> },
      { key: 'keys', x: leftW + 8, y: row1Y, w: rightW, h: 126, draw: (w, h) => <KeysTile w={w} h={h} /> },
      { key: 'icons', x: leftW + 8, y: row1Y + 126 + 8, w: rightW, h: 226, draw: (w, h) => <IconsTile w={w} h={h} /> },
    ]
  }
  const halfW = fitKeysWidth(Math.round((containerW - 8) / 2), 126)
  const row1Y = heroH + 8
  const row2Y = row1Y + 126 + 8
  return [
    { key: 'controls', x: 0, y: 0, w: containerW, h: heroH, draw: () => <ControlsScene /> },
    { key: 'keys', x: 0, y: row1Y, w: halfW, h: 126, draw: (w, h) => <KeysTile w={w} h={h} /> },
    { key: 'icons', x: halfW + 8, y: row1Y, w: containerW - halfW - 8, h: 126, draw: (w, h) => <IconsTile w={w} h={h} /> },
    { key: 'glass', x: 0, y: row2Y, w: containerW, h: 230, draw: (w, h) => <GlassRevenueTile w={w} h={h} off={1200} frosted /> },
    { key: 'player', x: 0, y: row2Y + 230 + 8, w: containerW, h: 196, dark: true, draw: (w, h) => <MusicPlayerTile w={w} h={h} off={10000} /> },
  ]
}

export function HomeHero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(Math.round(el.clientWidth)))
    ro.observe(el)
    setWidth(Math.round(el.clientWidth))
    return () => ro.disconnect()
  }, [])

  const tiles = width ? layoutTiles(width) : []
  const totalHeight = tiles.length ? Math.max(...tiles.map((t) => t.y + t.h)) : 0

  return (
    <div data-demo="home-hero" style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
      <div ref={rootRef} className="home-bento" style={{ ...originalPaletteVars, height: totalHeight || undefined }}>
        {tiles.map((tile) => (
          <figure
            key={tile.key}
            className="home-bento__tile"
            data-dark={tile.dark || undefined}
            style={{ left: tile.x, top: tile.y, width: tile.w, height: tile.h }}
          >
            {tile.draw(tile.w, tile.h)}
          </figure>
        ))}
      </div>
    </div>
  )
}
