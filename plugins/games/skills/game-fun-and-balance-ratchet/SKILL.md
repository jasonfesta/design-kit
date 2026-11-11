---
name: game-fun-and-balance-ratchet
description: >-
  Improve game pacing, strategic variety, recoverability, and option vitality
  across solo and competitive genres using external playtest sweeps and
  confidence-bounded outcome checks.
metadata:
  icon: ✨
---

# Game fun and balance ratchet

## What it is

This skill turns vague playability goals ("make it more fun", "fix pacing", "make choices matter") into observable external signals backed by automated playtests.

Re-reading constants in source code rarely reveals why a game drags or snowballs. By pairing a headless simulation loop with simple diverse playtest policies, you can run hundreds of episodes in seconds, expose dominant strategies or dead mechanics, verify changes with proper statistical intervals, and keep only edits that measurably improve play.

## When to use it

- Immediately after a new prototype's 10-second core toy responds cleanly (`game-concept-and-toy-first`), to verify real failure risk, skill separation, and round-to-round escalation within the same build session rather than shipping a passive calibration widget.
- Tuning difficulty, pacing, economy curves, level solvability, or competitive balance once a core game loop runs.
- Diagnosing why episodes drag into stalemates, snowball irreversibly from early luck, or collapse onto one dominant build.
- Adding new tools, cards, upgrades, hazards, or unit types and verifying they earn genuine use rather than sitting as dead weight.

## When not to use it

- Before the 10-second core toy works; automated bots cannot tell you whether raw movement, aiming, or tactile timing feels satisfying to human hands.
- Purely linear narrative vignettes or meditative sandboxes with no failure states, resource trade-offs, or strategic choices.

## Four systemic fun killers and their remedies

### 1. Identical rote openings

When every run or match starts with two minutes of identical low-stakes chores before the first real decision, replayability collapses.

- Remedy: Introduce meaningful asymmetry or choice at `t = 0`—distinct starting loadouts, drafted rule modifiers, varied board seeds, or immediate risk-reward routes—so decision-making starts on the first screen.

### 2. Passive play dominating active risk

If hiding in a corner, hoarding resources, or waiting out cooldowns reliably beats engaging with the world, episodes stall into tedious attrition.

- Remedy: Place high-value rewards, tempo boosts, or scoring multipliers in contested or hazardous space, or escalate environmental pressure over time so inaction steadily loses ground to bold play.

### 3. Early snowballs and rubber-band handouts

Two opposite flaws ruin mid-game tension: linear snowballing (where a small early lead guarantees victory for the remaining 80% of the game) and crude rubber-banding (where automatic handouts punish skilled early play).

- Remedy: Offer skill-testing comeback paths—telegraphed high-risk objectives, loss-charged tactical tools that opponents can still outplay, or tighter defensive geometry near defeat—so recovery stays possible without erasing earned leads.

### 4. Dead options and stat-bloat fixes

New items, moves, cards, or units often see near-zero usage because one generalist option already solves every situation. Simply inflating numbers until the ignored option overtakes the old favourite just swaps which option is dead.

- Remedy: Carve orthogonal situational niches. Design distinct obstacle shapes, enemy behaviours, or terrain puzzles where the underused mechanic is uniquely effective rather than universally stronger.

## Running an honest playtest ratchet

### 1. Build diverse, simple playtest policies

One heuristic bot only tests its own blind spots. Write three to five lightweight policies that stress extreme behaviours suited to your genre:

- Solo action, arcade, or roguelike: cautious survivor, greedy risk-taker, speedrunner, single-tool specialist, and random baseline.
- Puzzle or board game: greedy 1-ply lookahead, breadth-first solver within a small node cap, edge/corner bias, and random legal mover.
- Competitive or symmetric tactics: aggressive early rusher, economy builder, defensive turtle, specialist build, and balanced opportunist.

### 2. Prove the harness actually measures the game

Before trusting a sweep that reports "good balance", run one mutation check: deliberately break a parameter (such as doubling hazard speed or zeroing an option's cost) and confirm the episode metrics swing sharply in the expected direction. A harness that stays green when the rules are broken is grading noise.

### 3. Size runs for statistical resolution

Small samples lie. Twenty wins out of 20 trials still leaves the true failure rate anywhere up to roughly 17%, and a 50-episode sweep has a margin of error near 14 percentage points.

- Use 50 to 100 episodes as a fast filter to catch gross softlocks or broken rules.
- Use 300 to 1,000+ seeded episodes across paired seeds when comparing two balance patches or checking option win rates.
- Compare candidate edits on the exact same seed set so map or draw luck cancels out.

### 4. Promote only on external signal, never on hunches

State what improvement looks like before running the sweep (for example, cutting timeout stalemates below 5% while keeping episode survival or comeback rates inside a healthy band). If an edit makes the numbers worse or leaves them within sampling noise, revert it cleanly instead of stacking speculative tweaks.

## CLI outcome assay

`scripts/assay_playtest_outcomes.py` (PEP 723, zero external dependencies) reads standard CSV or newline-delimited JSON (`JSONL`) episode logs from any game genre using whatever column names your runner already emits, and prints exact counts and Wilson 95% confidence intervals as JSON:

```bash
python3 ~/.gemini/config/skills/game-fun-and-balance-ratchet/scripts/assay_playtest_outcomes.py \
  --input ./playtests.jsonl \
  --outcome-col outcome \
  --option-col loadout \
  --duration-col duration_sec \
  --json
```

It never requires a custom telemetry schema; pass only the columns relevant to your game.

## Traps

- Optimising the bot instead of the game. Rewriting bot heuristics so an underpowered mechanic gets picked artificially hides the real design flaw from human players.
- Collapsing fun into a 50% coin flip. Random damage spikes can force a 50% win rate while making every decision feel pointless. Check that skilled policies consistently beat random policies.
- Tuning five knobs at once. Changing economy rates, hazard damage, and cooldowns in one patch makes it impossible to tell which edit helped and which hurt.
- Ignoring human feel after headless sweeps. Bots validate pacing envelopes, solvability, and option viability; always play or visually inspect recorded episodes to confirm the winning behaviours actually look and feel exciting.

## Self-check

| Check | Pass | Fail symptom |
| :--- | :--- | :--- |
| Opening agency | Meaningful player choice or varied tactical puzzle appears immediately | First minute repeats identical mandatory setup chores |
| Anti-stagnation | Active engagement beats passive waiting or corner camping | Optimal policy stalls, turtles, or farms indefinitely |
| Skill separation | Informed policies reliably outperform random legal play | Random mover matches top heuristics because outcomes are mostly luck |
| Option niches | Every shipped tool, card, move, or unit solves a distinct problem | Half the roster goes unused or wins only via flat stat inflation |
| Verified sweep | Paired-seed sweep with confidence intervals and a tested negative control | Claims of balance based on 10 noisy runs or unexecuted reasoning |

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
