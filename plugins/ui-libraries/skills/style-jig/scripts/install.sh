#!/usr/bin/env bash
# Portable installer for Design Kit Jig (`style-jig` skill or `design-kit-jig` Jetski plugin).
#
# Usage:
#   # Install standalone skill globally for all Jetski chats (default):
#   bash install.sh
#
#   # Install full Jetski plugin (style-jig + jig-agent + jig-recorder) globally:
#   bash install.sh --plugin
#
#   # Install skill into one specific repository (.agents/skills/ or _agents/skills/):
#   bash install.sh --project /path/to/repo

set -euo pipefail

MODE="skill"
PROJECT_DIR=""
SOURCE_ROOT="/google/data/ro/users/jf/jfesta/www/style-jig"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --plugin)
      MODE="plugin"
      shift
      ;;
    --skill)
      MODE="skill"
      shift
      ;;
    --project)
      PROJECT_DIR="${2:-}"
      shift 2
      ;;
    --source)
      SOURCE_ROOT="${2:-}"
      shift 2
      ;;
    -h|--help)
      sed -n '2,15p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

find_archive() {
  local name="$1"
  if [[ -f "${SCRIPT_DIR}/${name}" ]]; then
    echo "${SCRIPT_DIR}/${name}"
  elif [[ -f "${SCRIPT_DIR}/../${name}" ]]; then
    echo "${SCRIPT_DIR}/../${name}"
  elif [[ -f "${SOURCE_ROOT}/${name}" ]]; then
    echo "${SOURCE_ROOT}/${name}"
  elif [[ -f "./${name}" ]]; then
    echo "./${name}"
  else
    return 1
  fi
}

if [[ "$MODE" == "plugin" ]]; then
  ARCHIVE="$(find_archive design-kit-jig-plugin.zip || true)"
  if [[ -z "$ARCHIVE" ]]; then
    echo "Could not find design-kit-jig-plugin.zip locally or at ${SOURCE_ROOT}." >&2
    echo "Download it from https://jfesta.users.x20web.corp.google.com/www/style-jig/design-kit-jig-plugin.zip and re-run." >&2
    exit 1
  fi
  TARGET="${HOME}/.gemini/config/plugins"
  mkdir -p "$TARGET"
  unzip -qo "$ARCHIVE" -d "$TARGET"
  echo "Installed Jetski plugin -> ${TARGET}/design-kit-jig"
  echo "Next: open a new Jetski chat and say: \"Set up style-jig for my project.\""
  exit 0
fi

ARCHIVE="$(find_archive style-jig.zip || true)"
if [[ -z "$ARCHIVE" ]]; then
  echo "Could not find style-jig.zip locally or at ${SOURCE_ROOT}." >&2
  echo "Download it from https://jfesta.users.x20web.corp.google.com/www/style-jig/style-jig.zip and re-run." >&2
  exit 1
fi

if [[ -n "$PROJECT_DIR" ]]; then
  if [[ -d "${PROJECT_DIR}/.citc" || -d "${PROJECT_DIR}/_agents" ]]; then
    TARGET="${PROJECT_DIR}/_agents/skills"
  else
    TARGET="${PROJECT_DIR}/.agents/skills"
  fi
else
  TARGET="${HOME}/.gemini/config/skills"
fi

mkdir -p "$TARGET"
unzip -qo "$ARCHIVE" -d "$TARGET"
echo "Installed style-jig skill -> ${TARGET}/style-jig"
echo "Next: open a new Jetski chat and say: \"Set up style-jig for my project.\""
