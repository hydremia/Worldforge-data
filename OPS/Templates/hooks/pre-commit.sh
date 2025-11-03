#!/usr/bin/env bash
set -euo pipefail
node tools/check_banned_terms.mjs
node tools/size_guard.mjs --all
