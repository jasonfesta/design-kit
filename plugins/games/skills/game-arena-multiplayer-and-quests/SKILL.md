---
name: game-arena-multiplayer-and-quests
description: >-
  Scale games cleanly into fair LLM or bot arenas, right-sized multiplayer
  topologies, and softlock-free quest or progression graphs without
  over-engineering servers or bespoke schemas.
metadata:
  icon: ✨
---

# Game arenas, multiplayer, and quest graphs

## What it is

This skill covers three ways a working single-player game expands to more players or deeper worlds: pitting AI models or bots fairly against each other in an arena harness, connecting human players across devices with minimal infrastructure, and structuring multi-step quests or world states so players can never get softlocked.

Each pattern is independent. Pull in only the section your game actually needs.

## When to use it

- Building an evaluation or spectator arena where LLMs or scripted agents play your game head-to-head or solo.
- Adding multiplayer across phones or browsers without standing up heavy backend infrastructure when a lighter topology works.
- Designing interconnected quests, locks and keys, dialogue flags, or NPC schedules where events can occur in multiple orders.

## When not to use it

- Solo arcade, puzzle, or toy prototypes with no external agent harness, no networked play, and linear level progression.
- Forcing networked multiplayer onto a game whose best social form is local shared-screen or pass-and-play.

## Pattern 1. Fair agent and LLM arena harnesses

Running language models or bots inside your game reveals emergent tactics and makes compelling spectator matches, provided the harness removes structural bias and hidden-state leaks.

### Match decision cadence to game tempo

- Turn-based games: step strictly turn by turn with a per-move token and wall-clock timeout plus a clear fallback rule on illegal moves.
- Realtime games: advance the simulation in short fixed windows (for example 2 to 10 simulated seconds), pause while all active seats compute orders, and commit those orders simultaneously on the same tick. Simultaneous window commits ensure a slower reasoning model is tested on tactical judgement rather than API latency.

### Enforce information-set and perspective symmetry

- Filter every observation strictly to what that seat is allowed to know—visible tiles, own inventory or units, public scores, and currently sighted opponents—never raw world state dumps.
- Normalise spatial coordinates or board orientation per seat (for example rotating symmetric maps so each player's home side sits in an equivalent local frame) so pretraining coordinate habits never favour Seat 1 over Seat 2.
- Keep context size flat across long matches by sending the current legal observation plus a bounded seat-authored scratchpad (such as 200 to 600 tokens of carry-over notes) rather than appending unbounded turn histories.

## Pattern 2. Right-sized multiplayer topology

Pick the simplest multiplayer architecture that satisfies your game's trust model, input cadence, and hosting constraints:

| Topology | Best game fit | Trade-off |
| :--- | :--- | :--- |
| Shared screen or pass-and-play | Local 2–4 player duel, co-op, or board game | Zero network code or latency; single physical device |
| Async share links (seed + replay) | Daily puzzles, time trials, score challenges | Works 100% on static hosts via URL hashes; no live opponent |
| Stateless lockstep WebSocket relay | Friendly co-op, tactics, or casual room-code play | Tiny `< 150`-line relay forwarding inputs; trusts peer simulation |
| Authoritative state server | Competitive hidden-hand or twitch action with strangers | Prevents map-hack cheating and hides latency; highest ops cost |

When building casual room-code lockstep over a stateless relay:

- Pair players via short room links or inline QR codes rather than account sign-up walls.
- Exchange compact input frames plus periodic simulation state hashes (`game-deterministic-sim-core` Tier 3) so any desync surfaces immediately instead of silently splitting into two different matches.
- Design graceful seat continuity on mobile browsers: let AI policies fill open lobby seats or temporarily hold a seat if a phone briefly drops connection.
- Avoid raw local-network WebRTC without TURN relays (which fails silently across symmetric NATs and corporate Wi-Fi) and never transmit multiplayer data over audible or ultrasonic speaker modems.

## Pattern 3. Softlock-free quest and progression graphs

In narrative RPGs, metroidvanias, and adventure games, softlocks rarely come from a single broken quest; they happen when Event B moves an NPC, consumes an item, or seals a room still required to finish active Quest A.

### Model shared progression as explicit state transitions

Instead of scattering ad-hoc boolean mutations across dialogue callbacks and room scripts, keep progression conditions explicit:

1. Define the discrete world flags, item states, room locks, and NPC locations that affect progression.
2. Express each story beat, door unlock, or quest step by its required preconditions and resulting state changes.
3. Ensure quest turn-ins bind to an NPC's logical identity across valid locations (or provide an alternate hand-in path) whenever world events relocate characters.

### Verify forward and backward reachability

Whenever two or more quests or world events can fire in arbitrary order, write a small breadth-first reachability test over your game's own quest/flag table:

- Forward check: every intended quest completion and ending state is reachable from the starting world state.
- No-orphan check: from every reachable intermediate world state, every active non-failed quest (and the main ending) still has at least one valid transition path to completion.

## Traps

- Dumping full game state into LLM prompts with instructions to "ignore hidden enemies". Models still condition on leaked coordinates; strip hidden state in code before serialising the prompt.
- Letting arena transcripts grow linearly. By turn 30, prompt tokens explode and older observations drown current state; use fresh per-turn state plus a bounded scratchpad.
- Standing up an authoritative server for a two-friend static prototype. Use URL-seed challenges or a tiny stateless room relay unless untrusted competitive integrity requires server authority.
- Mutating NPC locations globally without checking active turn-ins. Any world event that despawns or moves an actor must preserve or cleanly resolve pending interactions.

## Self-check

| Check | Pass | Fail symptom |
| :--- | :--- | :--- |
| Seat symmetry | Swapping seat assignments between identical agents yields ~50% split | Seat 1 wins systematically due to coordinate or turn-order bias |
| Information isolation | Prompt or client payload omits unseen opponents and hidden cards | Agent reacts to hidden moves or inspects unrevealed map tiles |
| Topology fit | Networking layer is the simplest option matching trust and latency needs | Unneeded server ops for a daily seed game, or raw NAT-fragile WebRTC |
| Disconnect resilience | Mobile tab sleep or brief drop neither crashes peers nor freezes lobbies | One dropped phone bricks the session for every connected player |
| Softlock freedom | Every reachable state preserves a valid path to finish active quests | Triggering Story Event B strands Quest A with a missing NPC or key |

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
