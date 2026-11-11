#!/usr/bin/env python3
"""Check configured API keys and discover available host assistant models for Warmup.

When one or more of the five target frontier models (Grok, Claude, Astra, GPT, Argon)
do not have an external API key configured, this tool inspects the host environment's
available assistant models (from `swarm(action="models", all=True)` or local config)
and generates a structured offer table and `ask_question` options so the user can
choose how to map missing slots to available host models.
"""

import argparse
import json
import os
from typing import Any

DEFAULT_SLOTS: list[dict[str, Any]] = [
    {
        "slug": "grok",
        "label": "Grok",
        "provider": "xAI",
        "api_key_envs": ["XAI_API_KEY", "GROK_API_KEY"],
        "default_api_model": "grok-2-vision-latest",
        "preferred_host_fallbacks": [
            "fable-5.1-high",
            "fable-5.1-max",
            "gemini-3.8-flash-high",
            "auto",
        ],
    },
    {
        "slug": "claude",
        "label": "Claude",
        "provider": "Anthropic",
        "api_key_envs": ["ANTHROPIC_API_KEY", "CLAUDE_API_KEY"],
        "default_api_model": "claude-sonnet-4-20250514",
        "preferred_host_fallbacks": [
            "opus-5.5-high",
            "opus-5.5-max",
            "opus-5.5-medium",
            "auto",
        ],
    },
    {
        "slug": "astra",
        "label": "Astra",
        "provider": "Google",
        "api_key_envs": ["ASTRA_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"],
        "default_api_model": "gemini-2.5-pro",
        "preferred_host_fallbacks": [
            "gemini-3.1-pro-high",
            "gemini-pro-coordinator",
            "gemini-3.8-flash-high",
            "auto",
        ],
    },
    {
        "slug": "gpt",
        "label": "GPT",
        "provider": "OpenAI",
        "api_key_envs": ["OPENAI_API_KEY", "GPT_API_KEY"],
        "default_api_model": "gpt-4o",
        "preferred_host_fallbacks": [
            "fable-5.1-max",
            "opus-5.5-max",
            "gemini-flash-next",
            "auto",
        ],
    },
    {
        "slug": "argon",
        "label": "Argon",
        "provider": "Argon / Frontier",
        "api_key_envs": ["ARGON_API_KEY"],
        "default_api_model": "gemini-4-argon-high",
        "preferred_host_fallbacks": [
            "gemini-pro-coordinator",
            "gemini-3.1-pro-high",
            "opus-5.5-high",
            "auto",
        ],
    },
]

DEFAULT_HOST_MODELS: dict[str, Any] = {
    "models": [
        "opus-5.5-high",
        "opus-5.5-max",
        "gemini-3.1-pro-high",
        "gemini-pro-coordinator",
        "fable-5.1-high",
        "fable-5.1-max",
        "gemini-3.8-flash-high",
        "gemini-flash-next",
        "gemini-3.5-flash-lite",
        "auto",
    ],
    "quotas": {
        "opus-5.5-high": {"quota_remaining": "80%"},
        "opus-5.5-max": {"quota_remaining": "80%"},
        "gemini-3.1-pro-high": {"quota_remaining": "100%"},
        "gemini-pro-coordinator": {"quota_remaining": "96%"},
        "fable-5.1-high": {"quota_remaining": "80%"},
        "fable-5.1-max": {"quota_remaining": "80%"},
        "gemini-3.8-flash-high": {"quota_remaining": "97%"},
        "gemini-flash-next": {"quota_remaining": "100%"},
        "gemini-3.5-flash-lite": {"quota_remaining": "99%"},
        "auto": {"quota_remaining": "100%"},
    },
}


def load_env_file(env_path: str | None) -> dict[str, str]:
  env_map: dict[str, str] = {}
  if not env_path or not os.path.exists(env_path):
    return env_map
  with open(env_path, "r", encoding="utf-8") as f:
    for raw_line in f:
      line = raw_line.strip()
      if not line or line.startswith("#") or "=" not in line:
        continue
      k, v = line.split("=", 1)
      k = k.strip()
      v = v.strip().strip('"').strip("'")
      if k and v:
        env_map[k] = v
  return env_map


def pick_host_fallback(
    preferred: list[str],
    available_models: list[str],
    quotas: dict[str, Any],
    used: set[str],
) -> tuple[str, str]:
  """Selects a distinct available host model with >0% quota when possible."""
  def has_quota(m: str) -> bool:
    q = quotas.get(m, {}).get("quota_remaining", "100%")
    return q != "0%"

  for candidate in preferred:
    if candidate in available_models and has_quota(candidate) and candidate not in used:
      used.add(candidate)
      return candidate, quotas.get(candidate, {}).get("quota_remaining", "available")

  for candidate in preferred:
    if candidate in available_models and has_quota(candidate):
      return candidate, quotas.get(candidate, {}).get("quota_remaining", "available")

  for candidate in available_models:
    if has_quota(candidate) and candidate not in used:
      used.add(candidate)
      return candidate, quotas.get(candidate, {}).get("quota_remaining", "available")

  fallback = available_models[0] if available_models else "inherit"
  return fallback, quotas.get(fallback, {}).get("quota_remaining", "available")


def inspect_models(
    env_map: dict[str, str], host_catalog: dict[str, Any]
) -> dict[str, Any]:
  available_host = host_catalog.get("models", DEFAULT_HOST_MODELS["models"])
  quotas = host_catalog.get("quotas", DEFAULT_HOST_MODELS["quotas"])

  portkey_key = env_map.get("PORTKEY_API_KEY") or os.environ.get("PORTKEY_API_KEY")
  openrouter_key = env_map.get("OPENROUTER_API_KEY") or os.environ.get("OPENROUTER_API_KEY")

  used_host: set[str] = set()
  slot_reports: list[dict[str, Any]] = []
  missing_key_slots: list[str] = []

  for slot in DEFAULT_SLOTS:
    found_env = None
    for env_name in slot["api_key_envs"]:
      val = env_map.get(env_name) or os.environ.get(env_name)
      if val and val.strip():
        found_env = env_name
        break

    host_model, host_quota = pick_host_fallback(
        slot["preferred_host_fallbacks"], available_host, quotas, used_host
    )

    if found_env:
      status = "ready-direct-api"
      active_route = f"Direct API ({found_env} -> {slot['default_api_model']})"
    elif portkey_key:
      status = "ready-gateway-api"
      active_route = f"Portkey Gateway (PORTKEY_API_KEY -> {slot['default_api_model']})"
    elif openrouter_key:
      status = "ready-gateway-api"
      active_route = f"OpenRouter Gateway (OPENROUTER_API_KEY -> {slot['default_api_model']})"
    else:
      status = "missing-key-offer-host-model"
      active_route = f"Host Assistant Fallback -> {host_model} (Quota: {host_quota})"
      missing_key_slots.append(slot["label"])

    slot_reports.append({
        "slug": slot["slug"],
        "label": slot["label"],
        "provider": slot["provider"],
        "expected_env_vars": slot["api_key_envs"],
        "status": status,
        "has_api_key": status != "missing-key-offer-host-model",
        "offered_host_model": host_model,
        "offered_host_quota": host_quota,
        "active_route_summary": active_route,
    })

  healthy_host_models = [
      {
          "model": m,
          "quota_remaining": quotas.get(m, {}).get("quota_remaining", "available"),
          "quota_resets": quotas.get(m, {}).get("quota_resets", ""),
      }
      for m in available_host
      if quotas.get(m, {}).get("quota_remaining", "100%") != "0%"
  ]

  mapping_summary = ", ".join(
      f"{s['label']} -> {s['offered_host_model']} ({s['offered_host_quota']})"
      for s in slot_reports
      if not s["has_api_key"]
  )

  ask_question_payload = {
      "questions": [
          {
              "question": (
                  f"No external API keys were found for: {', '.join(missing_key_slots)}. "
                  "How would you like Warmup to run these model slots?"
              ),
              "is_multi_select": False,
              "options": [
                  (
                      "(Recommended) Use the discovered available host assistant models "
                      f"for missing slots ({mapping_summary})"
                  ),
                  (
                      "Let me choose which specific available host assistant models "
                      f"({', '.join(m['model'] for m in healthy_host_models[:6])}) to run"
                  ),
                  (
                      "I will add external API keys to .env (XAI_API_KEY, ANTHROPIC_API_KEY, "
                      "ASTRA_API_KEY, OPENAI_API_KEY, ARGON_API_KEY) before running"
                  ),
              ],
          }
      ]
  } if missing_key_slots else None

  return {
      "all_keys_configured": len(missing_key_slots) == 0,
      "missing_key_slots": missing_key_slots,
      "slots": slot_reports,
      "available_host_models": healthy_host_models,
      "ask_question_payload": ask_question_payload,
  }


def main() -> None:
  parser = argparse.ArgumentParser(
      description="Check Warmup API keys and offer available host assistant models."
  )
  parser.add_argument(
      "--env-file",
      type=str,
      default=".env",
      help="Path to optional .env file with provider API keys.",
  )
  parser.add_argument(
      "--host-models-json",
      type=str,
      default="",
      help="Optional JSON string or file path from swarm(action='models', all=True).",
  )
  parser.add_argument(
      "--json",
      action="store_true",
      help="Print structured JSON output including ask_question payload.",
  )
  args = parser.parse_args()

  env_map = load_env_file(args.env_file)
  host_catalog = DEFAULT_HOST_MODELS
  if args.host_models_json:
    if os.path.exists(args.host_models_json):
      with open(args.host_models_json, "r", encoding="utf-8") as f:
        host_catalog = json.load(f)
    else:
      host_catalog = json.loads(args.host_models_json)

  report = inspect_models(env_map, host_catalog)

  if args.json:
    print(json.dumps(report, indent=2))
    return

  print("WARMUP MODEL & CREDENTIAL DISCOVERY")
  print("=" * 78)
  print(
      f"{'Slot':<10} | {'API Key Env Var':<20} | {'Key Status':<14} | {'Offered Route / Host Fallback'}"
  )
  print("-" * 78)
  for s in report["slots"]:
    env_label = s["expected_env_vars"][0]
    key_status = "Configured" if s["has_api_key"] else "No Key Found"
    print(
        f"{s['label']:<10} | {env_label:<20} | {key_status:<14} | {s['active_route_summary']}"
    )
  print("-" * 78)
  print("\nAvailable Host Assistant Models Discovered (Quota > 0%):")
  for hm in report["available_host_models"]:
    print(f"  - {hm['model']:<30} (Quota remaining: {hm['quota_remaining']})")


if __name__ == "__main__":
  main()
