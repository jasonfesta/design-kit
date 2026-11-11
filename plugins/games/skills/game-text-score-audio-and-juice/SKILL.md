---
name: game-text-score-audio-and-juice
description: >-
  Design expressive procedural or symbolic browser game audio, smooth adaptive
  intensity layers, proportional multi-sensory action feedback, and
  listener-safe acoustic ceilings without locking into a fixed score format.
metadata:
  icon: ✨
---

# Game audio, adaptive stems, and feel

## What it is

This skill guides how a browser game sounds and feels under the player's hands: choosing the right musical and sound-effect representation, tying audio smoothly to gameplay tension, pairing motion and sound for crisp action feedback, and enforcing hard acoustic comfort limits so synthesized sound never clips, clicks, or fatigues the ear.

## When to use it

- Adding sound effects, musical beds, adaptive combat/tension layers, or tactile impact feel ("juice") to a web game.
- Building zero-asset or offline-capable WebAudio engines where models author music and foley directly in code.
- Auditing rendered game audio `.wav` captures for clipping, DC offset, loop-seam clicks, silence, or harsh high-frequency screech.

## When not to use it

- Silent data visualisations or productivity tools where unsolicited audio annoys the user.
- Studio film scoring or multi-minute vocal songwriting outside interactive games; use dedicated music production or video scoring skills there.

## Decisions that determine quality

### 1. Pick the musical representation that fits the genre

Models cannot hear opaque binary audio files while editing code, which is why symbolic or parametric representations work well for iterative game builds. Do not force every game into one fixed JSON score schema; pick the representation that matches the game's musical structure:

| Musical need | Natural code representation | Best fit |
| :--- | :--- | :--- |
| Melodic themes and loops | Compact tracker rows, ABC/MML strings, or pitch-duration tuples | Adventure, RPG, platformer, puzzle themes |
| Rhythmic groove and pulse | Step-sequencer bitmasks or Euclidean trigger generators | Arcade action, rhythm, tactics, sports |
| Generative ambient worlds | Scale-constrained chord walkers and sparse probabilistic arpeggios | Meditative toys, exploration, cozy sims |
| Rich acoustic or vocal stems | Pre-rendered compressed audio stems scheduled on a shared WebAudio clock | Narrative scenes or acoustic instruments DSP cannot fake |

Always unlock `AudioContext` on the first user gesture and provide an obvious, instant mute control.

### 2. Shape every synthesized sound from transient, body, and tail

Bare un-enveloped sine, square, or sawtooth waves sound like diagnostic test equipment and fatigue listeners within seconds.

- Layer physical impacts and UI cues across three short windows: a crisp onset transient (`0-30 ms` filtered noise burst or pitch drop) for timing snap, a resonant mid-range body (`30-200 ms` filtered tone or resonant mode bank) for material weight, and a gentle decay tail.
- Tame raw geometric waveforms (`sawtooth`, `square`) through a low-pass filter or bandlimited synthesis, and ramp every voice's gain envelope over at least `4 ms` on attack and release to prevent discontinuity clicks.
- Vary pitch (`±4% to 8%`), filter cutoff, or sample choice across repeated footsteps, hits, and pickups to defeat the robotic machine-gun effect.

### 3. Couple adaptive music smoothly to gameplay state

Hard-stopping an exploration loop and starting a combat loop resets musical phase and creates jarring seams.

- Drive musical layers from one shared lookahead clock (`AudioContext.currentTime` scheduled 50 to 100 ms ahead of a short timer, never raw `setTimeout` alone).
- Adapt to rising gameplay tension by ramping stem gains, opening low-pass filter cutoffs, or enabling rhythmic accompaniment voices smoothly over `100 to 300 ms` (`setTargetAtTime` or linear ramps) rather than calling `stop()` and `start()` mid-phrase.

### 4. Scale multi-channel feedback proportionally to stakes

Good game feel comes from synchronising visual, temporal, and acoustic cues in proportion to what just happened—not shaking the camera on every footstep or spraying floating damage text across the screen.

- Routine actions (footsteps, tile shifts, cursor moves): subtle micro-motion (`< 80 ms`) and quiet mid/low-pocket foley (`-20 to -14 dBFS`).
- Significant hits, clears, or parries: clear startup telegraph before impact, brief hit-pause or velocity impulse on contact, secondary physical reaction on the target, and layered transient-plus-body impact sound.
- Critical warnings or major swings: pre-duck continuous background beds by `3 to 6 dB` just before the alert sounds, pair a clear spatial indicator on the playfield with a distinct acoustic callout, and drop any active fast-forward (`2x/4x`) back to `1x` speed so the player can react.

### 5. Enforce hard psychoacoustic comfort and headroom limits

Careless browser synthesis can cause real physical listener discomfort—especially continuous high-pitched carriers or unclipped oscillator sums when twenty projectiles land at once.

- Keep continuous ambient beds quiet (`-24 to -18 dBFS`) so foreground actions cut through by subtraction rather than loudness wars.
- Route game buses through gentle dynamic compression or soft limiting with master peaks capped at or below `-1.0 dBFS`.
- Never emit sustained or pulsing narrowband tones above `6 kHz`, and never use ultrasonic or near-ultrasonic audio modems for device pairing.

## CLI acoustic safety check

`scripts/audit_game_audio_safety.py` (PEP 723, zero external dependencies) inspects any rendered 16/24/32-bit PCM `.wav` bounce directly—regardless of how your game authored or synthesized its audio—to catch clipping, dead silence, DC offset, optional loop-seam clicks (`--loop`), and harsh `> 6 kHz` energy spikes:

```bash
python3 ~/design-kit/skills/game-text-score-audio-and-juice/scripts/audit_game_audio_safety.py \
  --wav ./preview.wav \
  --json
```

## Traps

- Scheduling notes on `requestAnimationFrame` or `setInterval` directly. Main-thread frame jitter turns steady 16th-note grooves into uneven stumbles; always schedule ahead against `AudioContext.currentTime`.
- Uncapped voice polyphony. Spawning 40 simultaneous explosion nodes during a chain reaction clips the output and stalls mobile audio threads; pool voices and steal oldest quiet tails.
- Constant screen shake and text popups. Uniform camera shake blurs trajectories and hides incoming hazards; tie directional recoil to real impact vectors and let motion dissolve cleanly.
- Harsh upper-midrange oscillator buildup. Stacking bright square and saw leads around `4-10 kHz` causes rapid ear fatigue; carve spectral room with gentle low-pass roll-off.

## Self-check

| Check | Pass | Fail symptom |
| :--- | :--- | :--- |
| Gesture & mute | Audio starts cleanly on first input and mutes instantly via one control | Console autoplay errors or unstoppable background music |
| Clock stability | Musical pulse stays rock-steady during heavy rendering frames | Audible rhythm stutter when frame rate dips |
| Variation | Ten rapid pickups or footsteps sound organic rather than identical | Identical repeated waveform produces robotic phasing |
| Proportional feel | Feedback intensity clearly distinguishes minor taps from major impacts | Everything shakes the screen equally, or major hits feel weightless |
| Acoustic safety | `.wav` capture passes `-1 dBFS` peak, zero DC offset, and `<= 6 kHz` comfort check | Digital clipping, envelope clicks, or piercing high-frequency whine |

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
