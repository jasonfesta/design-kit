# taxonomy: canonical two-level classification of prompts, screens & builds (`taxonomy`) — End-to-End Test Plan

This test plan verifies that the `taxonomy` skill loads cleanly, executes its deterministic workflow and helper scripts, and passes all `validate_skill` invariants.

## Test Case 1: Primary Workflow Execution

### Prompt
> "Run `taxonomy` on a sample artifact and verify all quality gates."

### Verification Criteria
1.  **Skill Discovery & Load**: The agent loads `taxonomy/SKILL.md` and follows its numbered workflow checklist.
2.  **Reference & Script Execution**: Any bundled scripts in `scripts/` and reference guides in `references/` resolve via relative paths with zero broken links.
3.  **Deliverable Verification**: All outputs meet the verification criteria documented in `SKILL.md`.

## Automated Validation Check

```bash
python3 ../skill-maker/scripts/validate_and_wrap.py --skill-dir=.
```
