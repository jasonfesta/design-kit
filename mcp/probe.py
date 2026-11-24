#!/usr/bin/env python3
"""MCP handshake probe: initialize -> notifications/initialized -> tools/list.

Usage:
  mcp_probe.py http <url> [Header:Value ...]
  mcp_probe.py stdio <cwd> <cmd> [args...]
Env for stdio inherits a minimal PATH (like the Jetski hub) unless PROBE_PATH set.
Never prints header values.
"""
import json, os, subprocess, sys, urllib.request, select, time

INIT = {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
    "protocolVersion": "2025-03-26", "capabilities": {},
    "clientInfo": {"name": "probe", "version": "0.1"}}}
INITED = {"jsonrpc": "2.0", "method": "notifications/initialized"}
LIST = {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}


def parse_body(body, ctype):
    if "text/event-stream" in (ctype or ""):
        for line in body.splitlines():
            if line.startswith("data:"):
                try:
                    return json.loads(line[5:].strip())
                except Exception:
                    pass
        return {"raw": body[:300]}
    try:
        return json.loads(body)
    except Exception:
        return {"raw": body[:300]}


def http(url, headers):
    h = {"Content-Type": "application/json",
         "Accept": "application/json, text/event-stream", "User-Agent": "mcp-probe/0.1"}
    h.update(headers)
    def post(msg):
        req = urllib.request.Request(url, data=json.dumps(msg).encode(), headers=h, method="POST")
        with urllib.request.urlopen(req, timeout=25) as r:
            sid = r.headers.get("Mcp-Session-Id")
            body = r.read().decode("utf-8", "replace")
            return r.status, sid, parse_body(body, r.headers.get("Content-Type"))
    st, sid, res = post(INIT)
    info = res.get("result", {}).get("serverInfo") if isinstance(res, dict) else None
    print("initialize", st, "serverInfo=", info, "session=", bool(sid))
    if sid:
        h["Mcp-Session-Id"] = sid
    try:
        post(INITED)
    except Exception as e:
        pass
    st, _, res = post(LIST)
    tools = [t["name"] for t in res.get("result", {}).get("tools", [])]
    print("tools/list", st, len(tools), tools[:40])
    if not tools:
        print("raw:", str(res)[:400])


def stdio(cwd, cmd):
    env = dict(os.environ)
    env["PATH"] = os.environ.get("PROBE_PATH", "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin")
    p = subprocess.Popen(cmd, cwd=cwd, env=env, stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    def send(m):
        p.stdin.write(json.dumps(m) + "\n"); p.stdin.flush()
    def recv(want_id, timeout=120):
        end = time.time() + timeout
        while time.time() < end:
            r, _, _ = select.select([p.stdout], [], [], 1)
            if r:
                line = p.stdout.readline()
                if not line:
                    break
                try:
                    m = json.loads(line)
                except Exception:
                    continue
                if m.get("id") == want_id:
                    return m
            if p.poll() is not None:
                break
        return None
    send(INIT)
    m = recv(1)
    if not m:
        p.kill(); print("initialize FAILED; stderr:", p.stderr.read()[-800:]); return
    print("initialize ok serverInfo=", m.get("result", {}).get("serverInfo"))
    send(INITED); send(LIST)
    m = recv(2, 60)
    tools = [t["name"] for t in (m or {}).get("result", {}).get("tools", [])]
    print("tools/list", len(tools), tools[:40])
    calls = json.loads(os.environ.get("PROBE_CALLS", "[]"))
    for i, c in enumerate(calls):
        send({"jsonrpc": "2.0", "id": 10 + i, "method": "tools/call", "params": c})
        m = recv(10 + i, 90)
        print("call", c["name"], "->", json.dumps(m)[:700] if m else "TIMEOUT")
    p.kill()


if __name__ == "__main__":
    if sys.argv[1] == "http":
        hdrs = dict(a.split(":", 1) for a in sys.argv[3:])
        try:
            http(sys.argv[2], hdrs)
        except Exception as e:
            body = ""
            if hasattr(e, "read"):
                try: body = e.read().decode()[:300]
                except Exception: pass
            print("HTTP FAILED:", repr(e)[:300], body)
    else:
        stdio(sys.argv[2], sys.argv[3:])
