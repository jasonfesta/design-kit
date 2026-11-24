#!/usr/bin/env python3
"""Handshake-test every server in the live plugin mcp_config.json files (never prints keys)."""
import json, os, subprocess, concurrent.futures as cf
KIT = "/usr/local/google/home/jfesta/design-kit"
PROBE = os.path.join(os.path.dirname(__file__), "probe.py")
jobs = []
for plug in ["ui-libraries", "motion-craft", "design-mcp"]:
    cfg = json.load(open(f"{KIT}/plugins/{plug}/mcp_config.json"))["mcpServers"]
    for name, s in cfg.items():
        if "url" in s:
            hdr = [f"{k}:{v}" for k, v in s.get("headers", {}).items()]
            jobs.append((plug, name, ["python3", PROBE, "http", s["url"], *hdr], {}))
        else:
            env = {"PROBE_PATH": s.get("env", {}).get("PATH", "/usr/bin:/bin")}
            jobs.append((plug, name, ["python3", PROBE, "stdio", "/", s["command"], *s.get("args", [])], env))

def run(j):
    plug, name, cmd, env = j
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=240,
                             env={**os.environ, **env}).stdout
    except subprocess.TimeoutExpired:
        out = "TIMEOUT"
    tl = [l for l in out.splitlines() if l.startswith("tools/list") or "FAILED" in l]
    return f"{plug:13} {name:18} {(tl[0] if tl else out[-200:])[:160]}"

with cf.ThreadPoolExecutor(8) as ex:
    for r in ex.map(run, jobs):
        print(r, flush=True)
