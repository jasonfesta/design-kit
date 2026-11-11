#!/usr/bin/env python3
"""Jetski PreToolUse hook: auto-allow the google-font-selection skill's own scripts (nothing else).

Install (one time) by adding to ~/.gemini/config/hooks.json  (global)  or  <workspace>/_agents/hooks.json:
{
  "allow-google-font-selection": {
    "PreToolUse": [{"matcher": "run_command", "hooks": [{"type": "command",
      "command": "python3 /usr/local/google/home/jfesta/skills/google-font-selection/scripts/jetski_hook_allow.py"}]}]
  }
}
Scope: the command must invoke a script inside .../google-font-selection/scripts/. Everything else → normal prompt.
"""
import json
import re
import sys

SKILL_DIRS = r"(/usr/local/google/home/jfesta/skills|/usr/local/google/home/jfesta/\.gemini/config/skills|~/skills)/google-font-selection/scripts"
SCRIPTS = r"(recommend_google_fonts|translate_brief|gf_live|build_specimen|test_google_font_skill)\.py\b"
ALLOWED = re.compile(rf"^(python3 {SKILL_DIRS}/{SCRIPTS}|cd {SKILL_DIRS} && python3 {SCRIPTS})")
# Only harmless post-processing may follow the script on the same line.
SAFE_TAIL = re.compile(r"^(\s*(\||;|&&)\s*(python3 -c |python3 - |sed |head|tail|wc|tee |grep |sort|uniq)[^;&|]*)*\s*$")

try:
    data = json.load(sys.stdin)
    cmd = (data.get("toolCall", {}).get("args", {}).get("CommandLine", "") or "").strip()
except Exception:
    cmd = ""

m = ALLOWED.search(cmd)
if m:
    tail_start = cmd.find(" ", m.end())
    tail = ""
    # tail = everything after the script's own arguments up to the first chaining operator
    chain = re.search(r"(\||;|&&)", cmd[m.end():])
    if chain:
        tail = cmd[m.end() + chain.start():]
    if not tail or SAFE_TAIL.match(tail):
        print(json.dumps({"decision": "allow", "reason": "google-font-selection skill script (auto-allowed by jetski_hook_allow.py)"}))
        sys.exit(0)
print(json.dumps({"decision": "ask"}))
