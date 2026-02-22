#!/usr/bin/env bash
# ============================================================
# YYC3 Hacker Chatbot — Dependency Installation Script
# Phase 33: Standalone dependency bootstrap
#
# Usage:
#   chmod +x scripts/install-deps.sh
#   ./scripts/install-deps.sh           # Standard install
#   ./scripts/install-deps.sh --local   # Patch react → dependencies
#   ./scripts/install-deps.sh --ci      # Frozen lockfile for CI
# ============================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MODE="${1:-default}"

# --- Auto-detect project root ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$(basename "$SCRIPT_DIR")" = "scripts" ]; then
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
else
  PROJECT_ROOT="$SCRIPT_DIR"
fi

if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo -e "${RED}[ERROR] package.json not found at $PROJECT_ROOT${NC}"
  exit 1
fi

cd "$PROJECT_ROOT"
echo -e "${CYAN}[YYC3] Dependency Installation — Mode: ${MODE}${NC}"
echo -e "  Project root: $PROJECT_ROOT"
echo ""

# ============================================================
# 1. Pre-flight
# ============================================================

echo -e "${CYAN}[1/4] Checking runtime...${NC}"
NODE_VER=$(node -v 2>/dev/null || echo "none")
if [ "$NODE_VER" = "none" ]; then
  echo -e "${RED}  Node.js not found! Install from https://nodejs.org/${NC}"
  exit 1
fi
echo -e "${GREEN}  Node.js ${NODE_VER}${NC}"

if ! command -v pnpm &>/dev/null; then
  echo -e "${YELLOW}  pnpm not found. Installing...${NC}"
  npm install -g pnpm@latest
fi
echo -e "${GREEN}  pnpm $(pnpm -v)${NC}"
echo ""

# ============================================================
# 2. Local mode: patch package.json
# ============================================================

echo -e "${CYAN}[2/4] Package.json setup...${NC}"

if [ "$MODE" = "--local" ]; then
  if grep -q '"peerDependencies"' package.json 2>/dev/null; then
    if command -v jq &>/dev/null; then
      TEMP_PKG=$(mktemp)
      jq '
        .dependencies.react = (.peerDependencies.react // "^18.3.1") |
        .dependencies["react-dom"] = (.peerDependencies["react-dom"] // "^18.3.1") |
        .name = "yyc3-hacker-chatbot" |
        .version = "0.33.0" |
        del(.peerDependencies.react) |
        del(.peerDependencies["react-dom"]) |
        if (.peerDependencies | length) == 0 then del(.peerDependencies, .peerDependenciesMeta) else . end
      ' package.json > "$TEMP_PKG" && mv "$TEMP_PKG" package.json
      echo -e "${GREEN}  [OK] package.json patched (react → dependencies)${NC}"
    else
      echo -e "${YELLOW}  [MANUAL] jq not found. Install: brew install jq${NC}"
      echo -e "    Then re-run: ./scripts/install-deps.sh --local"
    fi
  else
    echo -e "${GREEN}  [OK] Already patched${NC}"
  fi
else
  echo -e "${GREEN}  [OK] Keeping package.json as-is (mode: ${MODE})${NC}"
fi
echo ""

# ============================================================
# 3. Install
# ============================================================

echo -e "${CYAN}[3/4] Installing dependencies...${NC}"

[ -f "package-lock.json" ] && rm -f package-lock.json
[ -f "yarn.lock" ] && rm -f yarn.lock

if [ "$MODE" = "--ci" ]; then
  pnpm install --frozen-lockfile
else
  pnpm install
fi
echo -e "${GREEN}  [OK] Dependencies installed${NC}"
echo ""

# ============================================================
# 4. Verify
# ============================================================

echo -e "${CYAN}[4/4] Verifying critical packages...${NC}"

PACKAGES=("react:18" "react-dom:18" "zustand:5" "zod:4" "vite:6" "tailwindcss:4" "typescript:5" "vitest:3")

for entry in "${PACKAGES[@]}"; do
  pkg="${entry%%:*}"
  expected="${entry##*:}"

  if [ -f "node_modules/$pkg/package.json" ]; then
    actual=$(node -e "try{console.log(require('./node_modules/$pkg/package.json').version)}catch(e){console.log('?')}" 2>/dev/null || echo "?")
    actual_major="${actual%%.*}"
    if [ "$actual_major" = "$expected" ]; then
      echo -e "${GREEN}  [OK]   $pkg@$actual${NC}"
    else
      echo -e "${YELLOW}  [WARN] $pkg@$actual (expected v${expected}.x)${NC}"
    fi
  else
    echo -e "${RED}  [MISS] $pkg${NC}"
  fi
done

echo ""
echo -e "${GREEN}Done! Run 'pnpm dev' to start the dev server.${NC}"
