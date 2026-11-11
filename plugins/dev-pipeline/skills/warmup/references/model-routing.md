# Model Routing, API Keys & Assistant Fallback Configuration

Warmup benchmarks five frontier model slots by default: **Grok**, **Claude**, **Astra**, **GPT**, and **Argon**.

Because different workstations and environments have different API credentials available, Warmup supports **three-tier credential resolution** per model slot:

1.  **Direct Provider API Key** (per-model environment variables or `.env`)
2.  **Unified Gateway API Key** (`PORTKEY_API_KEY` or `OPENROUTER_API_KEY`)
3.  **Automatic Assistant Model Fallback** (uses the active host assistant model or spawns isolated subagents when no API key is configured for that slot)

--------------------------------------------------------------------------------

## 1. Per-Model Environment Variables & Endpoints

Configure any combination of the five models in a local `.env` file (passed via `--env-file=.env` or placed in the working directory) or shell environment variables:

Model Slot | Default Provider | Primary API Key Env Var | Default Model ID (Override Var) | Default Endpoint (Override Var)
:--- | :--- | :--- | :--- | :---
**Grok** | xAI | `XAI_API_KEY` (or `GROK_API_KEY`) | `grok-2-vision-latest` (`WARMUP_GROK_MODEL`) | `https://api.x.ai/v1/chat/completions` (`WARMUP_GROK_URL`)
**Claude** | Anthropic | `ANTHROPIC_API_KEY` (or `CLAUDE_API_KEY`) | `claude-sonnet-4-20250514` (`WARMUP_CLAUDE_MODEL`) | `https://api.anthropic.com/v1/messages` (`WARMUP_CLAUDE_URL`)
**Astra** | Google / Gemini | `ASTRA_API_KEY` (or `GEMINI_API_KEY`, `GOOGLE_API_KEY`) | `gemini-2.5-pro` (`WARMUP_ASTRA_MODEL`) | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` (`WARMUP_ASTRA_URL`)
**GPT** | OpenAI | `OPENAI_API_KEY` (or `GPT_API_KEY`) | `gpt-4o` (`WARMUP_GPT_MODEL`) | `https://api.openai.com/v1/chat/completions` (`WARMUP_GPT_URL`)
**Argon** | Frontier / Custom / OpenRouter | `ARGON_API_KEY` (or `OPENROUTER_API_KEY`, `PORTKEY_API_KEY`) | `argon-vision-latest` (`WARMUP_ARGON_MODEL`) | `https://openrouter.ai/api/v1/chat/completions` (`WARMUP_ARGON_URL`)

### Example `.env` Configuration

```ini
# Direct provider API keys (configure any subset; missing keys fall back to assistant model)
XAI_API_KEY=
ANTHROPIC_API_KEY=
ASTRA_API_KEY=
OPENAI_API_KEY=
ARGON_API_KEY=

# Optional unified gateway fallback (Portkey or OpenRouter)
PORTKEY_API_KEY=
OPENROUTER_API_KEY=

# Optional model ID overrides
WARMUP_GROK_MODEL=grok-2-vision-latest
WARMUP_CLAUDE_MODEL=claude-sonnet-4-20250514
WARMUP_ASTRA_MODEL=gemini-2.5-pro
WARMUP_GPT_MODEL=gpt-4o
WARMUP_ARGON_MODEL=argon-vision-latest
```

### Example `warmup.config.json` (Optional)

You can also pass `--config=warmup.config.json` to customize endpoints, headers, or provider slugs without hardcoding keys (keys inside `warmup.config.json` can reference environment variable names via `"apiKeyEnv"`):

```json
{
  "timeoutMs": 180000,
  "maxTokens": 12000,
  "temperature": 0.2,
  "models": {
    "grok": {
      "label": "Grok",
      "apiKeyEnv": "XAI_API_KEY",
      "model": "grok-2-vision-latest",
      "endpoint": "https://api.x.ai/v1/chat/completions",
      "portkeyProvider": "@xai"
    },
    "claude": {
      "label": "Claude",
      "apiKeyEnv": "ANTHROPIC_API_KEY",
      "model": "claude-sonnet-4-20250514",
      "endpoint": "https://api.anthropic.com/v1/messages",
      "protocol": "anthropic",
      "portkeyProvider": "@anthropic"
    },
    "astra": {
      "label": "Astra",
      "apiKeyEnv": "ASTRA_API_KEY",
      "fallbackKeyEnvs": ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
      "model": "gemini-2.5-pro",
      "endpoint": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      "portkeyProvider": "@google"
    },
    "gpt": {
      "label": "GPT",
      "apiKeyEnv": "OPENAI_API_KEY",
      "model": "gpt-4o",
      "endpoint": "https://api.openai.com/v1/chat/completions",
      "portkeyProvider": "@openai"
    },
    "argon": {
      "label": "Argon",
      "apiKeyEnv": "ARGON_API_KEY",
      "fallbackKeyEnvs": ["OPENROUTER_API_KEY", "PORTKEY_API_KEY"],
      "model": "argon-vision-latest",
      "endpoint": "https://openrouter.ai/api/v1/chat/completions",
      "portkeyProvider": "@openrouter"
    }
  }
}
```

--------------------------------------------------------------------------------

## 2. Automatic Assistant Model Fallback Protocol

When a user runs Warmup without external API keys for one or more models (or in an offline/sandboxed environment), Warmup **never fails or blocks waiting for credentials**:

1.  `scripts/check_models.py` and `scripts/run_warmup.py` detect which model slots lack an active API key and set their trial execution mode to `"executionMode": "assistant-fallback (<host-model>)"`.
2.  For each `assistant-fallback` trial, `run_warmup.py` scaffolds the complete runnable Golden Template directory at `{output_dir}/trials/{model_slug}/project/` (including `dist/index.html`) containing the frozen Pass 1 prompt, Pass 2 self-analysis prompt, and image path.
3.  The agent then executes those trials using available host assistant models:
    -   **Multi-model host environment (`swarm` or `invoke_subagent`)**: Query available host models (e.g., `swarm(action="models", all=true)` or `invoke_subagent` with `Model: "inherit" | "pro" | "flash"`), spawn an isolated worker per fallback slot with the exact locked Pass 1 prompt, and collect its Pass 1 React code and Pass 2 self-analysis.
    -   **Single-model host environment**: Execute the locked Pass 1 image-to-React translation and Pass 2 self-analysis directly using the active assistant model.
4.  Every generated report (`WARMUP-REPORT.md` and `index.html`) displays an explicit provenance badge on each trial (`Direct API`, `Gateway API`, or `Assistant Model Fallback (<host-model>)`) so the user can distinguish external API runs from host-assistant fallback runs at a glance.

--------------------------------------------------------------------------------

## 3. Credential Hygiene & Security Rules

-   **Never request raw API keys in chat** and never echo secret keys to terminal logs.
-   `scripts/run_warmup.py` automatically redacts any configured API key value (`[REDACTED]`) before saving raw HTTP responses or error payloads to `trial.json`.
-   Generated React folders (`trials/*/project/`) and reports (`WARMUP-REPORT.md`, `index.html`) must never contain API keys or `.env` files.
