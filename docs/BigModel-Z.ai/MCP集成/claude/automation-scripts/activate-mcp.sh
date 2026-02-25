#!/bin/bash
# YYC3 MCP Servers Activation Script
# Version: 1.0.0
# Description: Activate and configure all MCP servers for YYC3-Claude

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MCP_CONFIG_DIR="$PROJECT_ROOT/mcp-servers"
ENV_FILE="$PROJECT_ROOT/.env.mcp"

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}YYC3 MCP Servers Activation${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Check if .env.mcp exists, if not create from template
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Creating .env.mcp file...${NC}"
    cat > "$ENV_FILE" << 'EOF'
# YYC3 MCP Servers Environment Configuration
# Generate your API keys and update this file

# GitHub Personal Access Token
# Create at: https://github.com/settings/tokens
# Required scopes: repo, read:org, read:user, user:email
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Brave Search API Key
# Get from: https://api.search.brave.com/app/keys
BRAVE_API_KEY=BSxxxxxxxxxxxxxx

# PostgreSQL Connection String
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://yyc3_user:yyc3_password@localhost:5432/yyc3_db
EOF
    echo -e "${GREEN}✓ Created .env.mcp template${NC}"
    echo -e "${YELLOW}Please edit .env.mcp with your actual API keys${NC}"
    echo ""
fi

# Source environment variables
if [ -f "$ENV_FILE" ]; then
    echo -e "${BLUE}Loading environment variables from .env.mcp...${NC}"
    set -a
    source "$ENV_FILE"
    set +a
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
    echo ""
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test MCP server
test_mcp_server() {
    local server_name=$1
    local test_command=$2

    echo -e "${BLUE}Testing $server_name...${NC}"
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ $server_name is ready${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $server_name needs configuration${NC}"
        return 1
    fi
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js${NC}"
    exit 1
fi

# Check npm/npx
if command_exists npx; then
    echo -e "${GREEN}✓ npx is available${NC}"
else
    echo -e "${RED}✗ npx not found${NC}"
    exit 1
fi

# Check Docker
if command_exists docker; then
    echo -e "${GREEN}✓ Docker is available${NC}"
else
    echo -e "${YELLOW}⚠ Docker not found (mcp-docker will be skipped)${NC}"
fi

echo ""
echo -e "${BLUE}Checking MCP server packages...${NC}"

# Install MCP server packages
MCP_PACKAGES=(
    "@modelcontextprotocol/server-github"
    "@modelcontextprotocol/server-filesystem"
    "@modelcontextprotocol/server-brave-search"
    "@modelcontextprotocol/server-postgres"
)

for package in "${MCP_PACKAGES[@]}"; do
    echo -e "${BLUE}Checking $package...${NC}"
    # Use timeout and npm pack check instead of running the server
    if timeout 3 npx --yes --package "$package" --silent "true" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ $package is available${NC}"
    else
        echo -e "${YELLOW}⚠ $package will be installed on first use${NC}"
    fi
done

echo ""
echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}MCP Server Status${NC}"
echo -e "${BLUE}=================================${NC}"

# Test each MCP server
echo ""

# 1. yyc3-cn-assistant (custom server)
if [ -f "/Users/yanyu/www/API文档/YYC3-CN/代码/yyc3-cn-mcp-server.js" ]; then
    echo -e "${GREEN}✓ yyc3-cn-assistant: Server file exists${NC}"
else
    echo -e "${YELLOW}⚠ yyc3-cn-assistant: Server file not found${NC}"
fi

# 2. mcp-github-yyc3
if [ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ] && [[ ! "$GITHUB_PERSONAL_ACCESS_TOKEN" == "ghp_xxxx"* ]]; then
    echo -e "${GREEN}✓ mcp-github-yyc3: GitHub token configured${NC}"
else
    echo -e "${YELLOW}⚠ mcp-github-yyc3: GitHub token not set${NC}"
    echo -e "  Set GITHUB_PERSONAL_ACCESS_TOKEN in .env.mcp"
fi

# 3. mcp-filesystem
echo -e "${GREEN}✓ mcp-filesystem: Ready (accessing /Users/yanyu)${NC}"

# 4. mcp-brave-search
if [ -n "$BRAVE_API_KEY" ] && [[ ! "$BRAVE_API_KEY" == "BSxxx"* ]]; then
    echo -e "${GREEN}✓ mcp-brave-search: Brave API key configured${NC}"
else
    echo -e "${YELLOW}⚠ mcp-brave-search: Brave API key not set${NC}"
    echo -e "  Set BRAVE_API_KEY in .env.mcp"
fi

# 5. mcp-postgres
if [ -n "$DATABASE_URL" ] && [[ ! "$DATABASE_URL" == "postgresql://yyc3_user"* ]]; then
    echo -e "${GREEN}✓ mcp-postgres: Database URL configured${NC}"
else
    echo -e "${YELLOW}⚠ mcp-postgres: Database URL not set${NC}"
    echo -e "  Set DATABASE_URL in .env.mcp"
fi

# 6. mcp-docker
if command_exists docker; then
    if docker info >/dev/null 2>&1; then
        echo -e "${GREEN}✓ mcp-docker: Docker is running${NC}"
    else
        echo -e "${YELLOW}⚠ mcp-docker: Docker is not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠ mcp-docker: Docker not installed${NC}"
fi

echo ""
echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Configuration Files${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo -e "MCP Config: ${GREEN}$MCP_CONFIG_DIR/mcp-config.json${NC}"
echo -e "Environment: ${GREEN}$ENV_FILE${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "1. Edit ${GREEN}.env.mcp${NC} with your API keys"
echo -e "2. Copy ${GREEN}mcp-config.json${NC} to Claude config:"
echo -e "   ${YELLOW}~/Library/Application Support/Claude/claude_desktop_config.json${NC}"
echo -e "3. Restart Claude Code"
echo ""
echo -e "${BLUE}=================================${NC}"
