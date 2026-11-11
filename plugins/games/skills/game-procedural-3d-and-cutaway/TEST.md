# Game procedural worlds, sightlines, and bundles (`game-procedural-3d-and-cutaway`) — End-to-End Test Plan

This test plan verifies that the `game-procedural-3d-and-cutaway` skill loads cleanly, executes its deterministic workflow and helper scripts, and passes all `validate_skill` invariants.

## Test Case 1: Primary Workflow Execution

### Prompt
> "Run `game-procedural-3d-and-cutaway` on a sample artifact and verify all quality gates."

### Verification Criteria
1.  **Skill Discovery & Load**: The agent loads `game-procedural-3d-and-cutaway/SKILL.md` and follows its numbered workflow checklist.
2.  **Reference & Script Execution**: Any bundled scripts in `scripts/` and reference guides in `references/` resolve via relative paths with zero broken links.
3.  **Deliverable Verification**: All outputs meet the verification criteria documented in `SKILL.md`.

## Automated Validation Check

```bash
python3 ../skill-maker/scripts/validate_and_wrap.py --skill-dir=.
```
