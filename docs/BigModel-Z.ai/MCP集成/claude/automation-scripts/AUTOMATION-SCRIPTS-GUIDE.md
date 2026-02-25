# YYC3 自动化脚本 - 开发者使用指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> **文档版本**: 1.0.0
> **创建时间**: 2026-01-31
> **最后更新**: 2026-01-31
> **维护者**: YYC³ Team

---

## 📚 目录

- [概述](#概述)
- [脚本列表](#脚本列表)
- [MCP服务器激活脚本](#mcp服务器激活脚本)
- [Claude信任目录管理脚本](#claude信任目录管理脚本)
- [YYC3 Dev CLI工具](#yyc3-dev-cli工具)
- [配置说明](#配置说明)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

---

## 概述

YYC3自动化脚本目录包含三个核心脚本，旨在简化开发流程、提高开发效率、实现零摩擦AI协同开发。

### 核心理念

```
零摩擦 = 自动化 + 智能化 + 标准化
```

### 脚本特点

- ✅ **自动化**: 减少手动配置和重复操作
- ✅ **智能化**: 集成AI辅助开发
- ✅ **标准化**: 遵循YYC³开发规范
- ✅ **易用性**: 简单直观的命令行界面

---

## 脚本列表

| 脚本名称 | 功能描述 | 适用场景 | 复杂度 |
|---------|---------|---------|--------|
| [activate-mcp.sh](#mcp服务器激活脚本) | 激活和配置所有MCP服务器 | 首次设置、环境配置 | ⭐⭐ |
| [trust-claude-dirs.sh](#claude信任目录管理脚本) | 管理Claude Code信任目录 | 权限配置、目录管理 | ⭐ |
| [yyc3-cli.sh](#yyc3-dev-cli工具) | 零摩擦AI协同开发CLI | 日常开发、项目管理 | ⭐⭐⭐ |

---

## MCP服务器激活脚本

### 📄 文件信息

- **文件名**: `activate-mcp.sh`
- **路径**: `/Users/yanyu/yyc3-claude/automation-scripts/activate-mcp.sh`
- **版本**: 1.0.0
- **依赖**: Node.js, npm/npx, Docker (可选)

### 🎯 功能概述

自动激活和配置所有YYC3 MCP服务器，包括：

1. **yyc3-cn-assistant** - YYC³中文助手服务器
2. **mcp-github-yyc3** - GitHub集成服务器
3. **mcp-filesystem** - 文件系统访问服务器
4. **mcp-brave-search** - Brave搜索服务器
5. **mcp-postgres** - PostgreSQL数据库服务器
6. **mcp-docker** - Docker容器管理服务器

### 📖 使用方法

#### 基本用法

```bash
# 进入脚本目录
cd /Users/yanyu/yyc3-claude/automation-scripts

# 赋予执行权限（首次使用）
chmod +x activate-mcp.sh

# 运行激活脚本
./activate-mcp.sh
```

#### 快捷方式

```bash
# 添加到PATH后（推荐）
activate-mcp
```

### 🔧 配置步骤

#### 1. 环境变量配置

脚本会自动创建 `.env.mcp` 文件模板：

```bash
# YYC3 MCP服务器环境配置
# 生成API密钥并更新此文件

# GitHub个人访问令牌
# 创建地址: https://github.com/settings/tokens
# 所需权限: repo, read:org, read:user, user:email
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Brave搜索API密钥
# 获取地址: https://api.search.brave.com/app/keys
BRAVE_API_KEY=BSxxxxxxxxxxxxxx

# PostgreSQL连接字符串
# 格式: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://yyc3_user:yyc3_password@localhost:5432/yyc3_db
```

#### 2. 配置API密钥

编辑 `.env.mcp` 文件，填入实际的API密钥：

```bash
# 使用你喜欢的编辑器
vim .env.mcp
# 或
code .env.mcp
```

#### 3. 复制MCP配置

将生成的MCP配置复制到Claude配置文件：

```bash
# Claude配置文件路径
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 📊 输出示例

```
=================================
YYC3 MCP Servers Activation
=================================

Loading environment variables from .env.mcp...
✓ Environment variables loaded

Checking prerequisites...
✓ Node.js: v20.10.0
✓ npx is available
✓ Docker is available

Checking MCP server packages...
✓ @modelcontextprotocol/server-github is available
✓ @modelcontextprotocol/server-filesystem is available
✓ @modelcontextprotocol/server-brave-search is available
✓ @modelcontextprotocol/server-postgres is available

=================================
MCP Server Status
=================================

✓ yyc3-cn-assistant: Server file exists
✓ mcp-github-yyc3: GitHub token configured
✓ mcp-filesystem: Ready (accessing /Users/yanyu)
✓ mcp-brave-search: Brave API key configured
✓ mcp-postgres: Database URL configured
✓ mcp-docker: Docker is running

=================================
Configuration Files
=================================

MCP Config: /Users/yanyu/yyc3-claude/mcp-servers/mcp-config.json
Environment: /Users/yanyu/yyc3-claude/.env.mcp

Next Steps:
1. Edit .env.mcp with your API keys
2. Copy mcp-config.json to Claude config:
   ~/Library/Application Support/Claude/claude_desktop_config.json
3. Restart Claude Code

=================================
```

### ⚙️ 前置条件检查

脚本会自动检查以下依赖：

| 依赖项 | 检查命令 | 必需 | 说明 |
|-------|---------|------|------|
| Node.js | `node -v` | ✅ 是 | 运行MCP服务器 |
| npm/npx | `npx --version` | ✅ 是 | 安装MCP包 |
| Docker | `docker --version` | ⚠️ 可选 | mcp-docker需要 |

### 🔍 故障排除

#### 问题1: Node.js未安装

```bash
# 错误信息
✗ Node.js not found. Please install Node.js

# 解决方案
# 使用Homebrew安装
brew install node

# 或使用nvm安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

#### 问题2: Docker未运行

```bash
# 错误信息
⚠ mcp-docker: Docker is not running

# 解决方案
# 启动Docker Desktop
open -a Docker

# 或启动Docker服务
sudo systemctl start docker
```

#### 问题3: API密钥未配置

```bash
# 错误信息
⚠ mcp-github-yyc3: GitHub token not set
Set GITHUB_PERSONAL_ACCESS_TOKEN in .env.mcp

# 解决方案
# 1. 生成GitHub令牌
# 访问: https://github.com/settings/tokens
# 选择权限: repo, read:org, read:user, user:email

# 2. 更新.env.mcp文件
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_你的实际令牌
```

---

## Claude信任目录管理脚本

### 📄 文件信息

- **文件名**: `trust-claude-dirs.sh`
- **路径**: `/Users/yanyu/yyc3-claude/automation-scripts/trust-claude-dirs.sh`
- **版本**: 1.0.0
- **依赖**: jq (JSON处理工具)

### 🎯 功能概述

管理Claude Code的信任目录，避免每次访问目录时的权限确认提示。

### 📖 使用方法

#### 基本用法

```bash
# 进入脚本目录
cd /Users/yanyu/yyc3-claude/automation-scripts

# 赋予执行权限（首次使用）
chmod +x trust-claude-dirs.sh

# 查看帮助
./trust-claude-dirs.sh
```

#### 快捷方式

```bash
# 添加别名到 ~/.zshrc
alias trust-dir='/Users/yanyu/yyc3-claude/automation-scripts/trust-claude-dirs.sh'

# 使用别名
trust-dir trust-all
trust-dir list
```

### 🔧 命令详解

#### 1. 信任指定目录

```bash
# 语法
./trust-claude-dirs.sh trust <目录路径>

# 示例
./trust-claude-dirs.sh trust /Users/yanyu/my-project
./trust-claude-dirs.sh trust /Users/yanyu/Documents/work
```

**输出示例**:
```
🔐 YYC3 Claude信任目录管理

✓ 信任目录: /Users/yanyu/my-project
✅ 目录已设置为信任状态
⚠️  请重启Claude Code使设置生效
```

#### 2. 信任所有YYC3常用目录

```bash
# 语法
./trust-claude-dirs.sh trust-all

# 此命令会信任以下目录：
# - /Users/yanyu
# - /Users/yanyu/Documents
# - /Users/yanyu/www
# - /Users/yanyu/yyc3-claude
# - /Users/yanyu/claude-workspace
```

**输出示例**:
```
🔐 YYC3 Claude信任目录管理

🚀 信任所有YYC3常用目录...
✓ 信任目录: /Users/yanyu
✓ 信任目录: /Users/yanyu/Documents
✓ 信任目录: /Users/yanyu/www
✓ 信任目录: /Users/yanyu/yyc3-claude
✓ 信任目录: /Users/yanyu/claude-workspace
✅ 所有目录已设置为信任状态
⚠️  请重启Claude Code使设置生效
```

#### 3. 列出已信任目录

```bash
# 语法
./trust-claude-dirs.sh list
# 或
./trust-claude-dirs.sh ls
```

**输出示例**:
```
🔐 YYC3 Claude信任目录管理

📋 已信任的目录:

  ✓ /Users/yanyu
  ✓ /Users/yanyu/Documents
  ✓ /Users/yanyu/www
  ✓ /Users/yanyu/yyc3-claude
  ✓ /Users/yanyu/claude-workspace
```

#### 4. 撤销目录信任

```bash
# 语法
./trust-claude-dirs.sh untrust <目录路径>

# 示例
./trust-claude-dirs.sh untrust /Users/yanyu/old-project
```

**输出示例**:
```
🔐 YYC3 Claude信任目录管理

✗ 撤销信任: /Users/yanyu/old-project
✅ 已撤销目录信任
```

### ⚙️ 配置文件位置

脚本会修改Claude配置文件：

```
~/Library/Application Support/Claude/config.json
```

**配置结构**:
```json
{
  "projects": {
    "/Users/yanyu/yyc3-claude": {
      "allowedTools": [],
      "mcpContextUris": [],
      "mcpServers": {},
      "enabledMcpjsonServers": [],
      "disabledMcpjsonServers": [],
      "hasTrustDialogAccepted": true,
      "projectOnboardingSeenCount": 1,
      "hasClaudeMdExternalIncludesApproved": false,
      "hasClaudeMdExternalIncludesWarningShown": false
    }
  }
}
```

### 🔍 故障排除

#### 问题1: 配置文件不存在

```bash
# 错误信息
⚠️  配置文件不存在

# 解决方案
# 1. 确认Claude Code已安装
which claude

# 2. 手动创建配置文件
mkdir -p ~/Library/Application\ Support/Claude
echo '{}' > ~/Library/Application\ Support/Claude/config.json
```

#### 问题2: jq命令未找到

```bash
# 错误信息
jq: command not found

# 解决方案
# 使用Homebrew安装jq
brew install jq

# 验证安装
jq --version
```

#### 问题3: 信任设置未生效

```bash
# 症状
重启Claude Code后仍然提示权限确认

# 解决方案
# 1. 确认配置文件已更新
cat ~/Library/Application\ Support/Claude/config.json | jq '.projects'

# 2. 完全重启Claude Code
killall Claude
open -a Claude

# 3. 清除缓存（如果问题持续）
rm -rf ~/Library/Caches/Claude
```

---

## YYC3 Dev CLI工具

### 📄 文件信息

- **文件名**: `yyc3-cli.sh`
- **路径**: `/Users/yanyu/yyc3-claude/automation-scripts/yyc3-cli.sh`
- **版本**: 1.0.0
- **别名**: `yc`, `yyc3-devcli`

### 🎯 功能概述

零摩擦AI协同开发命令行工具，集成项目初始化、开发、测试、部署等全流程功能。

### 📖 使用方法

#### 基本用法

```bash
# 进入脚本目录
cd /Users/yanyu/yyc3-claude/automation-scripts

# 赋予执行权限（首次使用）
chmod +x yyc3-cli.sh

# 查看帮助
./yyc3-cli.sh --help
```

#### 快捷方式

```bash
# 添加别名到 ~/.zshrc
alias yc='/Users/yanyu/yyc3-claude/automation-scripts/yyc3-cli.sh'
alias yyc3-devcli='/Users/yanyu/yyc3-claude/automation-scripts/yyc3-cli.sh'

# 使用别名
yc init my-app
yc dev
yc build
```

### 🔧 命令详解

#### 核心命令

##### 1. 初始化项目

```bash
# 语法
yc init <项目名称>

# 示例
yc init my-awesome-app
```

**功能**:
- 创建Next.js项目（TypeScript + Tailwind + ESLint）
- 添加YYC³标准配置
- 创建标准目录结构
- 生成配置文件

**输出示例**:
```
   ____      _ __        __
  / __ \____(_) /_____ _/ /___  ____  ____  ____ _
 / /_/ / __ \/ / __/ _ \/ / __ \/ __ \/ __ \/ _ `/
/ _, _/ /_/ / / /_/  __/ / /_/ / / / / / / /  _/
/_/ |_|\____/_/\__/\___/_/\____/_/ /_/_/ /_/\__, /
                                            /____/
    万象归元于云枢 | 深栈智启新纪元

YYC3 Dev CLI - 零摩擦AI协同开发工具

🔍 检查开发环境...
  ✓ Node.js: v20.10.0
  ✓ Bun: 1.0.0
  ✓ Git: 2.43.0
  ✓ Claude Code 已安装
  ⚠ Ollama 未安装

📦 创建项目: my-awesome-app
📝 添加YYC3配置...
✅ 项目创建成功!

快速开始:
  cd my-awesome-app
  yyc3 dev
```

##### 2. 启动开发服务器

```bash
# 语法
yc dev

# 示例
yc dev
```

**功能**:
- 自动检测包管理器（Bun优先）
- 启动开发服务器
- 支持热重载

##### 3. 构建生产版本

```bash
# 语法
yc build

# 示例
yc build
```

**功能**:
- 构建生产版本
- 优化代码
- 生成静态资源

##### 4. 运行测试

```bash
# 语法
yc test

# 示例
yc test
```

**功能**:
- 运行所有测试
- 生成测试报告
- 支持覆盖率分析

#### AI辅助命令

##### 1. AI代码生成

```bash
# 语法
yc ai generate <类型> <名称>

# 示例
yc ai generate component UserCard
yc ai generate service UserService
yc ai generate hook useAuth
```

**功能**:
- 使用Claude AI生成代码
- 支持组件、服务、Hook等类型
- 遵循项目代码规范

##### 2. AI代码分析

```bash
# 语法
yc ai analyze <目标>

# 示例
yc ai analyze src/components
yc ai analyze performance
```

**功能**:
- 分析代码质量
- 识别性能问题
- 提供优化建议

##### 3. AI代码审查

```bash
# 语法
yc ai review [选项]

# 示例
yc ai review
yc ai review --auto-fix
```

**功能**:
- 审查代码质量
- 检查潜在问题
- 自动修复简单问题

##### 4. AI智能提交

```bash
# 语法
yc commit

# 示例
yc commit
```

**功能**:
- 自动生成commit信息
- 遵循Conventional Commits规范
- 添加AI协作标记

**输出示例**:
```
📝 AI生成commit信息...
✅ 提交成功!

Commit message:
feat(auth): 添加用户认证功能

实现基于JWT的用户认证系统，包括登录、注册和密码重置功能。

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

#### 项目管理命令

##### 1. 依赖管理

```bash
# 检查更新
yc deps check

# 更新依赖
yc deps update

# 安全审计
yc deps audit
```

##### 2. 生成文档

```bash
# 语法
yc docs

# 示例
yc docs
```

**功能**:
- 生成README.md
- 生成API文档
- 生成架构文档

##### 3. 清理缓存

```bash
# 语法
yc clean [选项]

# 示例
yc clean              # 清理缓存
yc clean --all        # 清理缓存和node_modules
```

**功能**:
- 清理Next.js缓存
- 清理临时文件
- 可选删除node_modules

#### 部署命令

```bash
# 部署到Vercel
yc deploy vercel

# 部署到阿里云ECS
yc deploy ecs

# 部署到NAS
yc deploy nas
```

### ⚙️ 环境检查

CLI会自动检查开发环境：

| 工具 | 检查命令 | 必需 | 说明 |
|-----|---------|------|------|
| Node.js | `node -v` | ✅ 是 | JavaScript运行时 |
| Bun | `bun -v` | ⚠️ 推荐 | 快速包管理器 |
| Git | `git --version` | ✅ 是 | 版本控制 |
| Claude | `claude --version` | ⚠️ 推荐 | AI辅助开发 |
| Ollama | `ollama --version` | ⚠️ 可选 | 本地AI模型 |

### 📊 项目结构

初始化的项目包含以下结构：

```
my-awesome-app/
├── .yyc3/                    # YYC³配置目录
│   └── config.json          # YYC³配置文件
├── .env.local               # 环境变量
├── components/              # React组件
├── lib/                    # 工具函数
├── hooks/                  # 自定义Hooks
├── types/                  # TypeScript类型
├── styles/                 # 样式文件
├── docs/                   # 项目文档
├── tests/                  # 测试文件
├── package.json
├── tsconfig.json
└── next.config.js
```

### 🔍 故障排除

#### 问题1: Node.js未安装

```bash
# 错误信息
✗ Node.js 未安装

# 解决方案
# 使用Homebrew安装
brew install node

# 或使用nvm安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

#### 问题2: Git未安装

```bash
# 错误信息
✗ Git 未安装

# 解决方案
# 使用Homebrew安装
brew install git

# 验证安装
git --version
```

#### 问题3: package.json未找到

```bash
# 错误信息
错误: 未找到package.json

# 解决方案
# 确保在项目根目录
cd my-awesome-app

# 或初始化新项目
yc init my-new-app
```

#### 问题4: Claude Code未安装

```bash
# 警告信息
⚠ Claude Code 未安装

# 解决方案
# 安装Claude Code
# 访问: https://claude.ai/download

# 验证安装
claude --version
```

---

## 配置说明

### 环境变量

#### MCP环境变量 (.env.mcp)

```bash
# GitHub个人访问令牌
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Brave搜索API密钥
BRAVE_API_KEY=BSxxxxxxxxxxxxxx

# PostgreSQL连接字符串
DATABASE_URL=postgresql://yyc3_user:yyc3_password@localhost:5432/yyc3_db
```

#### YYC³项目环境变量 (.env.local)

```bash
# YYC3标准配置
NEXT_PUBLIC_APP_NAME=my-awesome-app
NEXT_PUBLIC_AI_PROVIDER=glm
NEXT_PUBLIC_AI_MODEL=glm-4.7
```

### YYC³配置文件 (.yyc3/config.json)

```json
{
  "projectName": "my-awesome-app",
  "version": "1.0.0",
  "createdAt": "2026-01-31T00:00:00Z",
  "ai": {
    "provider": "glm",
    "model": "glm-4.7",
    "enabled": true
  },
  "features": {
    "testing": true,
    "ci": true,
    "monitoring": true
  }
}
```

### Claude配置文件

```json
{
  "projects": {
    "/Users/yanyu/yyc3-claude": {
      "allowedTools": [],
      "mcpContextUris": [],
      "mcpServers": {},
      "enabledMcpjsonServers": [],
      "disabledMcpjsonServers": [],
      "hasTrustDialogAccepted": true,
      "projectOnboardingSeenCount": 1,
      "hasClaudeMdExternalIncludesApproved": false,
      "hasClaudeMdExternalIncludesWarningShown": false
    }
  }
}
```

---

## 故障排除

### 通用问题

#### 问题1: 脚本没有执行权限

```bash
# 错误信息
bash: ./script.sh: Permission denied

# 解决方案
chmod +x script.sh

# 或使用bash运行
bash script.sh
```

#### 问题2: 命令未找到

```bash
# 错误信息
command not found: yc

# 解决方案
# 添加别名到 ~/.zshrc
echo "alias yc='/Users/yanyu/yyc3-claude/automation-scripts/yyc3-cli.sh'" >> ~/.zshrc

# 重新加载配置
source ~/.zshrc
```

#### 问题3: 配置文件路径错误

```bash
# 错误信息
No such file or directory

# 解决方案
# 检查文件是否存在
ls -la ~/Library/Application\ Support/Claude/

# 创建缺失的目录
mkdir -p ~/Library/Application\ Support/Claude
```

### MCP相关问题

#### 问题1: MCP服务器未启动

```bash
# 症状
Claude Code中MCP功能不可用

# 解决方案
# 1. 重新运行激活脚本
./activate-mcp.sh

# 2. 检查环境变量
cat .env.mcp

# 3. 重启Claude Code
killall Claude
open -a Claude
```

#### 问题2: API密钥无效

```bash
# 症状
API请求失败

# 解决方案
# 1. 重新生成API密钥
# GitHub: https://github.com/settings/tokens
# Brave: https://api.search.brave.com/app/keys

# 2. 更新.env.mcp文件
vim .env.mcp

# 3. 重新加载环境变量
source .env.mcp
```

### Claude权限相关问题

#### 问题1: 信任设置未生效

```bash
# 症状
重启后仍然提示权限确认

# 解决方案
# 1. 验证配置文件
cat ~/Library/Application\ Support/Claude/config.json | jq '.projects'

# 2. 完全重启Claude
killall Claude
sleep 2
open -a Claude

# 3. 清除缓存
rm -rf ~/Library/Caches/Claude
```

#### 问题2: 配置文件损坏

```bash
# 症状
JSON解析错误

# 解决方案
# 1. 备份原文件
cp ~/Library/Application\ Support/Claude/config.json ~/Library/Application\ Support/Claude/config.json.backup

# 2. 重新初始化
echo '{}' > ~/Library/Application\ Support/Claude/config.json

# 3. 重新设置信任
./trust-claude-dirs.sh trust-all
```

### YYC3 CLI相关问题

#### 问题1: 项目初始化失败

```bash
# 症状
项目创建过程中出错

# 解决方案
# 1. 检查网络连接
ping -c 3 github.com

# 2. 手动创建项目
bun create next-app my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 3. 添加YYC³配置
cd my-app
mkdir -p .yyc3
```

#### 问题2: 依赖安装失败

```bash
# 症状
npm install 或 bun install 失败

# 解决方案
# 1. 清理缓存
rm -rf node_modules package-lock.json

# 2. 使用不同的包管理器
# 尝试使用npm
npm install

# 或使用yarn
yarn install

# 3. 检查网络和镜像
npm config set registry https://registry.npmmirror.com
```

---

## 最佳实践

### 开发流程

#### 1. 项目初始化

```bash
# 使用YYC3 CLI初始化项目
yc init my-awesome-app

# 进入项目目录
cd my-awesome-app

# 启动开发服务器
yc dev
```

#### 2. 日常开发

```bash
# 开发新功能
yc ai generate component UserProfile

# 运行测试
yc test

# 代码审查
yc review

# 提交更改
yc commit
```

#### 3. 部署流程

```bash
# 构建生产版本
yc build

# 运行测试
yc test

# 部署
yc deploy vercel
```

### 环境配置

#### 1. 首次设置

```bash
# 1. 激活MCP服务器
./activate-mcp.sh

# 2. 配置API密钥
vim .env.mcp

# 3. 设置信任目录
./trust-claude-dirs.sh trust-all

# 4. 重启Claude Code
killall Claude
open -a Claude
```

#### 2. 日常维护

```bash
# 定期检查依赖更新
yc deps check

# 更新依赖
yc deps update

# 安全审计
yc deps audit

# 清理缓存
yc clean
```

### 团队协作

#### 1. 共享配置

```bash
# 提交配置文件（不包含敏感信息）
git add .yyc3/config.json
git add .env.example
git commit -m "chore: 添加YYC³配置文件"
```

#### 2. 文档管理

```bash
# 生成项目文档
yc docs

# 更新README
yc ai update-readme
```

### 性能优化

#### 1. 使用Bun加速

```bash
# 安装Bun
curl -fsSL https://bun.sh/install | bash

# 使用Bun替代npm
yc init my-app  # 自动使用Bun
```

#### 2. 并行操作

```bash
# 并行运行测试
yc test --parallel

# 并行构建
yc build --parallel
```

### 安全实践

#### 1. 敏感信息管理

```bash
# 不要提交.env.mcp
echo ".env.mcp" >> .gitignore

# 使用.env.example作为模板
cp .env.mcp .env.example
# 编辑.env.example，移除实际密钥
```

#### 2. 依赖安全

```bash
# 定期进行安全审计
yc deps audit

# 自动修复安全漏洞
npm audit fix
```

---

## 附录

### A. 快速参考

#### MCP激活脚本

```bash
# 激活MCP服务器
./activate-mcp.sh

# 配置API密钥
vim .env.mcp

# 重启Claude Code
killall Claude && open -a Claude
```

#### 信任目录管理

```bash
# 信任所有目录
./trust-claude-dirs.sh trust-all

# 列出已信任目录
./trust-claude-dirs.sh list

# 信任指定目录
./trust-claude-dirs.sh trust /path/to/dir
```

#### YYC3 CLI

```bash
# 初始化项目
yc init my-app

# 启动开发服务器
yc dev

# 运行测试
yc test

# 构建项目
yc build

# AI代码生成
yc ai generate component MyComponent

# 智能提交
yc commit

# 部署
yc deploy vercel
```

### B. 相关资源

#### 官方文档

- [YYC³团队标准化审核清单](../YYC³团队标准化审核清单.md)
- [MCP配置指南](../tools/mcp/MCP-CONFIG-GUIDE.md)
- [项目重组方案](../PROJECT-REORGANIZATION-PLAN.md)

#### 外部资源

- [Node.js官方文档](https://nodejs.org/docs/)
- [Next.js官方文档](https://nextjs.org/docs)
- [Claude Code文档](https://claude.ai/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)

### C. 联系支持

如有问题或建议，请联系：

- **邮箱**: admin@0379.email
- **GitHub**: https://github.com/YYC-Cube
- **文档**: https://github.com/YYC-Cube/yyc3-claude-code

---

<div align="center">

> **「***YanYuCloudCube***」**
> **「***<admin@0379.email>***」**
> **「***Words Initiate Quadrants, Language Serves as Core for the Future***」**
> **「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」**

</div>
