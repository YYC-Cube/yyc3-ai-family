#!/usr/bin/env bash
# ============================================================
# YYC3 Hacker Chatbot — One-Click Development Setup
# Phase 33: Environment Bootstrap Script
#
# Usage (from ANY directory):
#   chmod +x scripts/setup.sh
#   ./scripts/setup.sh          # from project root
#   cd scripts && ./setup.sh    # from scripts dir — also works
#
# What this script does:
#   1. Detects project root automatically
#   2. Checks Node.js >= 20 + pnpm
#   3. Generates dotfiles from config/ templates
#   4. Patches package.json for local dev (react → dependencies)
#   5. Installs dependencies via pnpm
#   6. Verifies critical packages
#   7. Verifies project file structure
#   8. Runs TypeScript type-check
#   9. Runs Vitest tests
#
# Prerequisites:
#   - Node.js >= 20.0.0
#   - pnpm >= 9.0.0 (auto-installed if missing)
# ============================================================

set -euo pipefail

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

BRAND="${CYAN}[YYC3]${NC}"

# ============================================================
# 0. Auto-detect project root
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If we're in scripts/, go up one level
if [ "$(basename "$SCRIPT_DIR")" = "scripts" ]; then
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
else
  PROJECT_ROOT="$SCRIPT_DIR"
fi

# Verify we found the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo -e "${RED}[ERROR] Cannot find package.json. Are you in the project directory?${NC}"
  echo -e "  Expected: $PROJECT_ROOT/package.json"
  exit 1
fi

cd "$PROJECT_ROOT"
echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════════════╗"
echo "  ║   YYC3 Hacker Chatbot — Dev Environment Setup    ║"
echo "  ║   Cyberpunk DevOps Intelligence Platform          ║"
echo "  ╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${BRAND} Project root: ${BOLD}$PROJECT_ROOT${NC}"
echo ""

# ============================================================
# 1. Check prerequisites
# ============================================================

echo -e "${BRAND} ${BOLD}[1/7] Checking prerequisites...${NC}"

# Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}  [FAIL] Node.js not found. Install: https://nodejs.org/${NC}"
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo -e "${RED}  [FAIL] Node.js >= 20 required. Current: $(node -v)${NC}"
  echo -e "${YELLOW}  Fix: nvm install 20 && nvm use 20${NC}"
  exit 1
fi
echo -e "${GREEN}  [OK] Node.js $(node -v)${NC}"

# pnpm
if ! command -v pnpm &> /dev/null; then
  echo -e "${YELLOW}  [WARN] pnpm not found. Installing globally...${NC}"
  npm install -g pnpm@latest
fi
echo -e "${GREEN}  [OK] pnpm $(pnpm -v)${NC}"

# Git (optional)
if command -v git &> /dev/null; then
  echo -e "${GREEN}  [OK] Git $(git --version | cut -d' ' -f3)${NC}"
else
  echo -e "${YELLOW}  [SKIP] Git not found (optional)${NC}"
fi
echo ""

# ============================================================
# 2. Generate dotfiles from config/ templates
# ============================================================

echo -e "${BRAND} ${BOLD}[2/7] Generating dotfiles from config/ templates...${NC}"

if [ ! -d "config" ]; then
  echo -e "${RED}  [FAIL] config/ directory not found!${NC}"
  echo -e "  Make sure you exported the full project from Figma Make."
  exit 1
fi

# Helper: copy template to dotfile (skip if target already exists and is newer)
copy_template() {
  local src="$1"
  local dst="$2"
  if [ -f "$src" ]; then
    if [ -f "$dst" ]; then
      echo -e "${GREEN}  [SKIP] $dst (already exists)${NC}"
    else
      cp "$src" "$dst"
      echo -e "${GREEN}  [NEW]  $dst${NC}"
    fi
  else
    echo -e "${YELLOW}  [MISS] $src template not found${NC}"
  fi
}

# Core dotfiles
copy_template "config/env.example"      ".env.example"
copy_template "config/env.development"  ".env.development"
copy_template "config/env.production"   ".env.production"
copy_template "config/gitignore"        ".gitignore"
copy_template "config/editorconfig"     ".editorconfig"
copy_template "config/nvmrc"            ".nvmrc"
copy_template "config/npmrc"            ".npmrc"

# VS Code extensions
mkdir -p .vscode
copy_template "config/vscode-extensions.json" ".vscode/extensions.json"

# Personal .env.local (from .env.example, user fills in API keys)
if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    cp ".env.example" ".env.local"
    echo -e "${GREEN}  [NEW]  .env.local (from .env.example — add your API keys here)${NC}"
  fi
else
  echo -e "${GREEN}  [SKIP] .env.local (already exists)${NC}"
fi

echo ""

# ============================================================
# 3. Patch package.json for local development
# ============================================================

echo -e "${BRAND} ${BOLD}[3/7] Patching package.json for local development...${NC}"

# Check if react is in peerDependencies (Figma Make style)
if grep -q '"peerDependencies"' package.json 2>/dev/null; then
  if command -v jq &>/dev/null; then
    # Use jq for safe JSON manipulation
    TEMP_PKG=$(mktemp)
    jq '
      # Move react/react-dom from peerDependencies to dependencies
      .dependencies.react = (.peerDependencies.react // "^18.3.1") |
      .dependencies["react-dom"] = (.peerDependencies["react-dom"] // "^18.3.1") |
      # Update project identity
      .name = "yyc3-hacker-chatbot" |
      .version = "0.33.0" |
      # Remove peerDependencies entries
      del(.peerDependencies.react) |
      del(.peerDependencies["react-dom"]) |
      # Clean up empty sections
      if (.peerDependencies | length) == 0 then del(.peerDependencies, .peerDependenciesMeta) else . end
    ' package.json > "$TEMP_PKG" && mv "$TEMP_PKG" package.json
    echo -e "${GREEN}  [OK] react/react-dom moved to dependencies (via jq)${NC}"
  else
    echo -e "${YELLOW}  [MANUAL] jq not found. Please edit package.json manually:${NC}"
    echo -e "    1. Move \"react\" and \"react-dom\" from peerDependencies to dependencies"
    echo -e "    2. Delete peerDependencies and peerDependenciesMeta sections"
    echo -e "    3. Change name to \"yyc3-hacker-chatbot\""
    echo -e ""
    echo -e "    Quick fix: brew install jq && ./scripts/setup.sh"
  fi
else
  echo -e "${GREEN}  [OK] package.json already patched (no peerDependencies)${NC}"
fi

echo ""

# ============================================================
# 4. Install dependencies
# ============================================================

echo -e "${BRAND} ${BOLD}[4/7] Installing dependencies...${NC}"

# Remove stale lockfiles from other package managers
[ -f "package-lock.json" ] && rm -f package-lock.json && echo -e "${YELLOW}  Removed stale package-lock.json${NC}"
[ -f "yarn.lock" ] && rm -f yarn.lock && echo -e "${YELLOW}  Removed stale yarn.lock${NC}"

pnpm install
echo -e "${GREEN}  [OK] pnpm install completed${NC}"
echo ""

# ============================================================
# 5. Verify critical packages
# ============================================================

echo -e "${BRAND} ${BOLD}[5/7] Verifying critical packages...${NC}"

check_pkg() {
  local pkg="$1"
  local expected_major="$2"
  # Try to get version from pnpm ls
  local version
  version=$(pnpm ls "$pkg" --depth 0 2>/dev/null | grep -oE "${pkg}@[0-9]+" | head -1 | grep -oE '[0-9]+$' || echo "")

  if [ -z "$version" ]; then
    # Fallback: check node_modules directly
    if [ -f "node_modules/$pkg/package.json" ]; then
      version=$(node -e "console.log(require('./$pkg/package.json').version.split('.')[0])" 2>/dev/null || echo "")
    fi
  fi

  if [ -z "$version" ]; then
    echo -e "${RED}  [MISS] $pkg${NC}"
    return 1
  elif [ "$version" = "$expected_major" ]; then
    echo -e "${GREEN}  [OK]   $pkg v${version}.x${NC}"
    return 0
  else
    echo -e "${YELLOW}  [WARN] $pkg v${version}.x (expected v${expected_major}.x)${NC}"
    return 0
  fi
}

ALL_OK=true
check_pkg "react"       "18" || ALL_OK=false
check_pkg "react-dom"   "18" || ALL_OK=false
check_pkg "zustand"     "5"  || ALL_OK=false
check_pkg "zod"         "4"  || ALL_OK=false
check_pkg "vite"        "6"  || ALL_OK=false
check_pkg "typescript"  "5"  || ALL_OK=false
check_pkg "tailwindcss" "4"  || ALL_OK=false
check_pkg "vitest"      "3"  || ALL_OK=false

if [ "$ALL_OK" = false ]; then
  echo -e "${YELLOW}  Some packages missing — try: pnpm install${NC}"
fi
echo ""

# ============================================================
# 6. Verify project structure
# ============================================================

echo -e "${BRAND} ${BOLD}[6/7] Verifying project structure...${NC}"

REQUIRED_FILES=(
  "index.html"
  "package.json"
  "tsconfig.json"
  "vite.config.ts"
  "vitest.config.ts"
  "src/main.tsx"
  "src/vite-env.d.ts"
  "src/app/App.tsx"
  "src/styles/index.css"
  "src/styles/tailwind.css"
  "src/styles/theme.css"
  "src/styles/fonts.css"
  "src/lib/store.ts"
  "src/lib/types.ts"
  "src/lib/llm-bridge.ts"
  "src/lib/mcp-protocol.ts"
  "src/lib/agent-orchestrator.ts"
  "src/lib/persistence-engine.ts"
  "src/lib/event-bus.ts"
  "src/lib/nas-client.ts"
  "src/lib/i18n.tsx"
  "src/lib/kb-utils.ts"
  "src/lib/persist-schemas.ts"
  "src/types/global.d.ts"
  "public/favicon.svg"
)

MISSING=0
for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo -e "${RED}  [MISS] $f${NC}"
    MISSING=$((MISSING + 1))
  fi
done

if [ "$MISSING" -eq 0 ]; then
  echo -e "${GREEN}  [OK] All ${#REQUIRED_FILES[@]} core files present${NC}"
else
  echo -e "${YELLOW}  $MISSING file(s) missing — check Figma Make export${NC}"
fi
echo ""

# ============================================================
# 7. TypeScript + Tests
# ============================================================

echo -e "${BRAND} ${BOLD}[7/7] TypeScript check + Vitest...${NC}"

echo -e "  Running tsc --noEmit..."
if pnpm type-check 2>&1 | tail -3; then
  echo -e "${GREEN}  [OK] Type check passed${NC}"
else
  echo -e "${YELLOW}  [WARN] Type errors found — run: pnpm type-check${NC}"
fi

echo ""
echo -e "  Running vitest..."
if pnpm test 2>&1 | tail -5; then
  echo -e "${GREEN}  [OK] Tests passed${NC}"
else
  echo -e "${YELLOW}  [WARN] Some tests failed — run: pnpm test${NC}"
fi

echo ""

# ============================================================
# Done!
# ============================================================

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════════════╗"
echo "  ║              Setup Complete!                      ║"
echo "  ╠═══════════════════════════════════════════════════╣"
echo "  ║                                                   ║"
echo "  ║  Quick Start:                                     ║"
echo "  ║    pnpm dev            → http://localhost:5173    ║"
echo "  ║                                                   ║"
echo "  ║  Edit API Keys:                                   ║"
echo "  ║    vim .env.local      → add VITE_*_API_KEY       ║"
echo "  ║                                                   ║"
echo "  ║  Run Tests:                                       ║"
echo "  ║    pnpm test           → Vitest unit tests        ║"
echo "  ║    pnpm test:coverage  → with coverage report     ║"
echo "  ║                                                   ║"
echo "  ║  Build for NAS:                                   ║"
echo "  ║    pnpm build          → dist/ output             ║"
echo "  ║    pnpm preview        → preview build locally    ║"
echo "  ║                                                   ║"
echo "  ║  Optional:                                        ║"
echo "  ║    brew install ollama → local LLM inference      ║"
echo "  ║    Console > NAS Deploy → configure NAS           ║"
echo "  ║    Gear icon > AI Model → configure providers     ║"
echo "  ║                                                   ║"
echo "  ╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# List generated dotfiles for confirmation
echo -e "${BRAND} Generated dotfiles:"
for f in .env.example .env.development .env.production .env.local .gitignore .editorconfig .nvmrc .npmrc .vscode/extensions.json; do
  if [ -f "$f" ]; then
    echo -e "  ${GREEN}✓${NC} $f"
  fi
done
echo ""
