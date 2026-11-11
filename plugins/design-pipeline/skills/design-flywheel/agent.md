---
name: design-flywheel
description: "Iterative self-improving design flywheel skill for jason-design-agent. Runs an automated multi-turn loop (up to 5 iterations) targeting typography, color, and individual touts using targeted Nano Banana 1K re-renders and micro-research before presenting at the designer checkpoint."
tools:
  - read_file
  - write_file
  - edit_file
  - run_command
mainAgent: false
subagent: true
commandExecutionPolicy: auto
skills:
  - /usr/local/google/home/jfesta/skills/design-flywheel
---

# design-flywheel

Subagent for running iterative multi-turn design improvement flywheels inside `jason-design-agent`.
