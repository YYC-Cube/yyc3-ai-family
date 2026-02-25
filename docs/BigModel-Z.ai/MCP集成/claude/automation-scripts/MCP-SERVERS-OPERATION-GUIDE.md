# YYC3 MCP 服务器完整操作指导文档

> **文档版本**: 1.0.0
> **创建时间**: 2026-02-04
> **最后更新**: 2026-02-04
> **维护者**: YYC³ Team

---

## 📚 目录

- [概述](#概述)
- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [详细配置步骤](#详细配置步骤)
- [服务器详解](#服务器详解)
- [使用示例](#使用示例)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)
- [附录](#附录)

---

## 概述

### 什么是 MCP？

MCP (Model Context Protocol) 是一个开放协议，允许 AI 助手与外部工具和数据源进行安全、标准化的交互。

### YYC3 MCP 服务器架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Desktop / CLI                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   claude_desktop_config.json                     │
│                    (MCP 服务器配置中心)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 本地服务器    │    │  NPX 服务器   │    │  Docker 服务器│
├──────────────┤    ├──────────────┤    ├──────────────┤
│yyc3-cn       │    │github        │    │docker        │
│claude-prompts│    │filesystem    │    │              │
│              │    │brave-search  │    │              │
│              │    │postgres      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 系统架构

### 核心组件

| 组件 | 说明 | 路径 |
|------|------|------|
| **Claude Desktop** | 主应用程序 | `/Applications/Claude.app` |
| **MCP 配置文件** | 服务器配置中心 | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **环境变量文件** | API 密钥配置 | `/Users/yanyu/yyc3-claude/.env.mcp` |
| **自动化脚本** | 部署和维护工具 | `/Users/yanyu/yyc3-claude/automation-scripts/` |
| **服务器源码** | 自定义服务器代码 | `/Users/yanyu/yyc3-claude/claude-prompts-mcp/` |

### 数据流向

```
用户输入 → Claude → MCP 协议 → MCP 服务器 → 外部服务/数据
                ↑                              │
                └──────── 响应返回 ────────────┘
```

---

## 快速开始

### 前置条件

```bash
# 检查 Node.js (需要 >= v24)
node --version

# 检查 npm/npx
npx --version

# 检查 Docker (可选)
docker --version

# 检查 Claude Desktop
ls "/Applications/Claude.app"
```

### 一键部署

```bash
# 1. 进入脚本目录
cd /Users/yanyu/yyc3-claude/automation-scripts

# 2. 运行激活脚本
./activate-mcp.sh

# 3. 设置信任目录
./trust-claude-dirs.sh trust-all

# 4. 重启 Claude
killall Claude && open -a Claude
```

---

## 详细配置步骤

### 步骤 1: 准备环境变量

编辑 `.env.mcp` 文件：

```bash
# 使用你喜欢的编辑器
vim /Users/yanyu/yyc3-claude/.env.mcp
```

文件内容：

```bash
# YYC3 MCP 服务器环境配置

# GitHub 个人访问令牌
# 创建地址: https://github.com/settings/tokens
# 所需权限: repo, read:org, read:user, user:email
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_你的实际令牌

# Brave 搜索 API 密钥
# 获取地址: https://api.search.brave.com/app/keys
BRAVE_API_KEY=BS你的实际密钥

# PostgreSQL 连接字符串
# 格式: postgresql://用户名:密码@主机:端口/数据库名
DATABASE_URL=postgresql://yyc3_33:yyc3_33@192.168.3.45:5432/yyc3_mcp
```

### 步骤 2: 构建自定义服务器

```bash
# 进入 claude-prompts-mcp 服务器目录
cd /Users/yanyu/yyc3-claude/claude-prompts-mcp/server

# 安装依赖
npm install

# 构建服务器
npm run build

# 验证构建
ls -la dist/index.js
```

### 步骤 3: 配置 MCP 服务器

编辑 Claude Desktop 配置：

```bash
vim "/Users/yanyu/Library/Application Support/Claude/claude_desktop_config.json"
```

完整配置示例：

```json
{
  "mcpServers": {
    "yyc3-cn-assistant": {
      "command": "node",
      "args": [
        "/Users/yanyu/www/API文档/YYC3-CN/代码/yyc3-cn-mcp-server.js"
      ],
      "env": {
        "TRAE_CN_MODE": "development",
        "NODE_ENV": "development"
      }
    },
    "claude-prompts": {
      "command": "node",
      "args": [
        "/Users/yanyu/yyc3-claude/claude-prompts-mcp/server/dist/index.js"
      ]
    },
    "mcp-github-yyc3": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "github_pat_你的实际令牌"
      }
    },
    "mcp-filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yanyu"
      ]
    },
    "mcp-brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "BS你的实际密钥"
      }
    },
    "mcp-postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://yyc3_33:yyc3_33@192.168.3.45:5432/yyc3_mcp"
      ]
    },
    "mcp-docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock",
        "modelcontextprotocol/server-docker"
      ],
      "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock"
      }
    }
  }
}
```

### 步骤 4: 设置信任目录

```bash
cd /Users/yanyu/yyc3-claude/automation-scripts

# 信任所有 YYC3 常用目录
./trust-claude-dirs.sh trust-all

# 或信任指定目录
./trust-claude-dirs.sh trust /path/to/directory
```

### 步骤 5: 重启 Claude

```bash
# 完全重启 Claude Desktop
killall Claude
sleep 2
open -a Claude
```

---

## 服务器详解

### 1. yyc3-cn-assistant (中文助手)

**功能**: 提供 YYC³ 中文编程辅助工具集

**技术规格**:

- 版本: v2.0.0
- 工具总数: 20 个
  - 原有工具: 5 个
  - 智能编程: 9 个
  - 协同编程: 6 个

**使用场景**:

- 中文代码注释生成
- 中文技术文档编写
- 本地化编程指导

**配置示例**:

```json
{
  "command": "node",
  "args": ["/Users/yanyu/www/API文档/YYC3-CN/代码/yyc3-cn-mcp-server.js"],
  "env": {
    "TRAE_CN_MODE": "development",
    "NODE_ENV": "development"
  }
}
```

---

### 2. claude-prompts (提示词管理)

**功能**: 动态提示词和链式执行管理

**技术规格**:

- 版本: v1.0.0
- 构建输出: `/server/dist/index.js`
- 支持: 热重载、符号化命令语言

**核心特性**:

- 提示词版本控制
- 链式工作流 (`-->` 操作符)
- 框架集成 (`@CAGEERF`)
- 质量门控 (`::` 操作符)
- 样式控制 (`#` 操作符)

**符号化命令示例**:

```
# 顺序执行
>>step1 --> >>step2 --> >>step3

# 框架应用
>>prompt @CAGEERF

# 质量门控
>>prompt :: '质量标准文本'

# 样式控制
#analytical >>report

# 组合使用
>>analysis @CAGEERF :: '高准确性' --> >>summary #concise
```

**MCP 工具**:

- `prompt_manager` - 创建/更新/删除提示词
- `prompt_engine` - 执行提示词和链
- `system_control` - 系统状态和控制

**配置示例**:

```json
{
  "command": "node",
  "args": ["/Users/yanyu/yyc3-claude/claude-prompts-mcp/server/dist/index.js"]
}
```

---

### 3. mcp-github-yyc3 (GitHub 集成)

**功能**: 与 GitHub 仓库和 API 交互

**所需权限**:

- `repo` - 完整仓库访问权限
- `read:org` - 读取组织信息
- `read:user` - 读取用户资料
- `user:email` - 访问用户邮箱

**主要功能**:

- 仓库管理 (创建、克隆、列表)
- Issue 和 PR 操作
- 文件内容读取
- Git 操作 (提交、分支)

**使用示例**:

```
# Claude 中的自然语言请求
"列出我的所有仓库"
"在 repo-name 创建 issue: 标题是 'Fix bug'"
"读取 repo-name 的 README.md"
```

**配置示例**:

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "github_pat_你的令牌"
  }
}
```

---

### 4. mcp-filesystem (文件系统访问)

**功能**: 安全的文件系统操作

**可用工具** (14 个):

| 工具名 | 功能 | 示例用法 |
|--------|------|----------|
| `read_text_file` | 读取文件内容 | 读取配置文件 |
| `write_file` | 创建/覆盖文件 | 写入新文档 |
| `edit_file` | 行级编辑 | 修改代码 |
| `list_directory` | 列出目录内容 | 浏览项目结构 |
| `create_directory` | 创建目录 | 初始化项目 |
| `search_files` | 搜索文件 | 查找特定文件 |
| `directory_tree` | 递归树形视图 | 可视化目录 |
| `move_file` | 移动/重命名 | 整理文件 |
| `get_file_info` | 获取文件元数据 | 检查文件属性 |
| `read_multiple_files` | 批量读取 | 分析多个文件 |
| `read_media_file` | 读取媒体文件 | 处理图片/音频 |
| `list_allowed_directories` | 列出可访问目录 | 验证权限 |

**安全限制**:

- 只能访问配置的目录 (`/Users/yanyu`)
- 所有操作都在允许的目录范围内

**配置示例**:

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/yanyu"]
}
```

---

### 5. mcp-brave-search (网络搜索)

**功能**: 隐私友好的网络搜索

**特性**:

- 独立搜索索引
- 隐私保护
- 实时结果
- 支持 API 调用

**使用场景**:

- 技术文档搜索
- 新闻资讯查询
- 快速事实核查

**配置示例**:

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "BS你的密钥"
  }
}
```

---

### 6. mcp-postgres (数据库访问)

**功能**: PostgreSQL 数据库查询和操作

**连接信息**:

```
主机: 192.168.3.45
端口: 5432
数据库: yyc3_mcp
用户: yyc3_33
```

**主要功能**:

- 执行 SQL 查询
- 读取表结构
- 数据分析
- 报表生成

**使用示例**:

```
# Claude 中的自然语言请求
"列出所有表"
"查询 users 表的前 10 条记录"
"分析 orders 表的月度销售趋势"
```

**配置示例**:

```json
{
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://yyc3_33:yyc3_33@192.168.3.45:5432/yyc3_mcp"
  ]
}
```

---

### 7. mcp-docker (容器管理)

**功能**: Docker 容器管理

**特性**:

- 容器生命周期管理
- 镜像操作
- 网络配置
- 卷管理

**前置条件**:

```bash
# 确保 Docker 运行
docker info

# 确保 Docker socket 可访问
ls -la /var/run/docker.sock
```

**配置示例**:

```json
{
  "command": "docker",
  "args": [
    "run",
    "-i",
    "--rm",
    "-v",
    "/var/run/docker.sock:/var/run/docker.sock",
    "modelcontextprotocol/server-docker"
  ],
  "env": {
    "DOCKER_HOST": "unix:///var/run/docker.sock"
  }
}
```

---

## 使用示例

### 示例 1: 代码分析和重构

```
用户请求:
"分析 /Users/yanyu/my-project/src 目录下的所有 TypeScript 文件，
找出重复代码模式，并给出重构建议"

MCP 流程:
1. mcp-filesystem: search_files 找到所有 .ts 文件
2. mcp-filesystem: read_multiple_files 批量读取文件
3. yyc3-cn-assistant: 使用智能编程工具分析
4. mcp-filesystem: write_file 生成重构报告
```

### 示例 2: 自动化 GitHub 工作流

```
用户请求:
"为我的项目创建 issue，包含当前所有 TODO 注释，
并生成标签 'enhancement'"

MCP 流程:
1. mcp-filesystem: search_files 搜索 TODO 注释
2. claude-prompts: 使用模板生成 issue 描述
3. mcp-github-yyc3: create_issue 创建 issue
4. mcp-github-yyc3: add_labels 添加标签
```

### 示例 3: 数据驱动报告

```
用户请求:
"从数据库查询上个月的销售数据，
生成图表，并创建 README 报告"

MCP 流程:
1. mcp-postgres: query 执行 SQL 查询
2. claude-prompts: 使用分析框架处理数据
3. mcp-filesystem: write_file 生成 Markdown 报告
4. mcp-github-yyc3: (可选) 推送到仓库
```

### 示例 4: 链式提示词执行

```
用户请求:
"使用 @CAGEERF 框架分析这段代码，
要求高准确性，最后生成简洁摘要"

符号化命令:
>>code-analysis @CAGEERF :: '高准确性要求' --> >>summary #concise

MCP 流程:
1. claude-prompts: prompt_engine 执行链
2. yyc3-cn-assistant: 提供中文分析
3. mcp-filesystem: 读取源代码
4. 输出: 符合质量标准的简洁摘要
```

---

## 故障排除

### 问题诊断清单

```bash
# 1. 检查配置文件语法
cat "/Users/yanyu/Library/Application Support/Claude/claude_desktop_config.json" | python3 -m json.tool

# 2. 检查进程状态
ps aux | grep -E "(mcp|claude-prompts|yyc3)" | grep -v grep

# 3. 检查日志
tail -100 ~/Library/Logs/Claude/main.log
tail -100 ~/Library/Logs/Claude/mcp.log

# 4. 测试单个服务器
node /Users/yanyu/yyc3-claude/claude-prompts-mcp/server/dist/index.js --help

# 5. 验证网络连接
ping -c 3 192.168.3.45
curl -I https://api.github.com
```

### 常见问题

#### 问题 1: Claude 无法连接到 MCP 服务器

**症状**:

- Claude 中 MCP 功能不可用
- 服务器列表为空

**诊断**:

```bash
# 检查配置文件是否存在
ls -la "/Users/yanyu/Library/Application Support/Claude/claude_desktop_config.json"

# 验证 JSON 格式
cat "/Users/yanyu/Library/Application Support/Claude/claude_desktop_config.json" | jq .
```

**解决方案**:

```bash
# 1. 确保配置文件存在且格式正确
# 2. 完全重启 Claude
killall Claude
sleep 3
open -a Claude

# 3. 清除缓存（如果问题持续）
rm -rf ~/Library/Caches/Claude
```

---

#### 问题 2: claude-prompts 服务器无法启动

**症状**:

- 提示 "Cannot find module" 或 "dist/index.js not found"

**诊断**:

```bash
# 检查构建是否存在
ls -la /Users/yanyu/yyc3-claude/claude-prompts-mcp/server/dist/index.js

# 检查 Node 版本
node --version  # 需要 >= v24
```

**解决方案**:

```bash
# 重新构建服务器
cd /Users/yanyu/yyc3-claude/claude-prompts-mcp/server
rm -rf dist node_modules
npm install
npm run build

# 验证构建输出
ls -la dist/index.js
```

---

#### 问题 3: GitHub 认证失败

**症状**:

- "Bad credentials" 或 "401 Unauthorized"

**诊断**:

```bash
# 测试令牌
curl -H "Authorization: token github_pat_你的令牌" \
  https://api.github.com/user
```

**解决方案**:

```bash
# 1. 生成新的 GitHub 令牌
# 访问: https://github.com/settings/tokens
# 选择权限: repo, read:org, read:user, user:email

# 2. 更新 .env.mcp
vim /Users/yanyu/yyc3-claude/.env.mcp

# 3. 更新 Claude 配置
vim "/Users/yanyu/Library/Application Support/Claude/claude_desktop_config.json"

# 4. 重启 Claude
killall Claude && open -a Claude
```

---

#### 问题 4: PostgreSQL 连接失败

**症状**:

- "connection refused" 或 "password authentication failed"

**诊断**:

```bash
# 测试数据库连接
PGPASSWORD=yyc3_33 psql -h 192.168.3.45 -U yyc3_33 -d yyc3_mcp \
  -c "SELECT version();"

# 检查网络连通性
ping -c 3 192.168.3.45
telnet 192.168.3.45 5432
```

**解决方案**:

```bash
# 1. 验证数据库凭证
# 确认用户名、密码、数据库名正确

# 2. 测试连接字符串
psql "postgresql://yyc3_33:yyc3_33@192.168.3.45:5432/yyc3_mcp"

# 3. 更新配置
# 编辑 ~/Library/Application Support/Claude/claude_desktop_config.json
# 更新 DATABASE_URL 参数

# 4. 重启 Claude
```

---

#### 问题 5: Docker MCP 无响应

**症状**:

- Docker 命令挂起或超时

**诊断**:

```bash
# 检查 Docker 状态
docker info

# 检查 Docker socket
ls -la /var/run/docker.sock

# 测试 Docker MCP
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  modelcontextprotocol/server-docker
```

**解决方案**:

```bash
# 1. 确保 Docker 运行
open -a Docker

# 2. 等待 Docker 完全启动
until docker info >/dev/null 2>&1; do
  echo "等待 Docker 启动..."
  sleep 2
done

# 3. 重启 Claude
killall Claude && open -a Claude
```

---

#### 问题 6: 文件系统权限被拒绝

**症状**:

- "Permission denied" 或目录不可访问

**诊断**:

```bash
# 检查目录权限
ls -la /Users/yanyu

# 检查 Claude 信任配置
cat ~/Library/Application\ Support/Claude/config.json | jq '.projects'
```

**解决方案**:

```bash
# 1. 设置信任目录
cd /Users/yanyu/yyc3-claude/automation-scripts
./trust-claude-dirs.sh trust-all

# 2. 验证信任设置
./trust-claude-dirs.sh list

# 3. 重启 Claude
killall Claude && open -a Claude

# 4. 如果问题持续，清除缓存
rm -rf ~/Library/Caches/Claude
```

---

### 日志分析

#### Claude 主日志

```bash
# 查看最近的错误
grep -i error ~/Library/Logs/Claude/main.log | tail -20

# 查看 MCP 相关日志
grep -i mcp ~/Library/Logs/Claude/main.log | tail -20
```

#### MCP 服务器日志

```bash
# 查看 xcode MCP 日志
tail -100 ~/Library/Logs/Claude/mcp-server-xcode.log

# 查看 Docker MCP 日志
tail -100 ~/Library/Logs/Claude/mcp-server-MCP_DOCKER.log
```

---

## 最佳实践

### 开发流程

#### 1. 项目初始化

```bash
# 使用 YYC3 CLI 初始化项目
cd /Users/yanyu/yyc3-claude/automation-scripts
./yyc3-cli.sh init my-project

# 进入项目目录
cd my-project

# 启动开发服务器
./yyc3-cli.sh dev
```

#### 2. 代码审查

```
# 在 Claude 中请求代码审查
"审查 /Users/yanyu/my-project/src 目录，
使用 @CAGEERF 框架，要求代码安全性检查"

# MCP 会:
# 1. 使用 mcp-filesystem 扫描代码
# 2. 使用 claude-prompts 应用 CAGEERF 框架
# 3. 使用 yyc3-cn-assistant 提供中文分析
# 4. 生成详细审查报告
```

#### 3. 自动化提交

```bash
# 使用 YYC3 CLI 智能提交
cd /Users/yanyu/yyc3-claude/automation-scripts
./yyc3-cli.sh commit

# CLI 会:
# 1. 分析变更
# 2. 生成符合 Conventional Commits 的消息
# 3. 添加 AI 协作标记
```

### 配置管理

#### 环境隔离

```bash
# 开发环境
export NODE_ENV=development
export TRAE_CN_MODE=development

# 生产环境
export NODE_ENV=production
export TRAE_CN_MODE=production
```

#### 敏感信息保护

```bash
# 永远不要提交 .env.mcp
echo ".env.mcp" >> /Users/yanyu/yyc3-claude/.gitignore

# 使用 .env.example 作为模板
cp /Users/yanyu/yyc3-claude/.env.mcp \
   /Users/yanyu/yyc3-claude/.env.example

# 编辑 .env.example，移除实际密钥
vim /Users/yanyu/yyc3-claude/.env.example
```

### 性能优化

#### 并行操作

```javascript
// 在 Claude 中请求并行任务
"同时分析以下文件并生成对比报告:
- /Users/yanyu/project-a/src/index.ts
- /Users/yanyu/project-b/src/index.ts
- /Users/yanyu/project-c/src/index.ts"

// MCP 会并行处理所有文件
```

#### 缓存策略

```bash
# 定期清理缓存
cd /Users/yanyu/yyc3-claude/automation-scripts
./yyc3-cli.sh clean

# 清理所有缓存和依赖
./yyc3-cli.sh clean --all
```

### 安全实践

#### 访问控制

```json
{
  "mcp-filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/Users/yanyu/specific-directory"  // 限制访问范围
    ]
  }
}
```

#### 密钥轮换

```bash
# 定期更新 API 密钥 (建议每 90 天)
# 1. GitHub: https://github.com/settings/tokens
# 2. Brave: https://api.search.brave.com/app/keys

# 更新 .env.mcp
vim /Users/yanyu/yyc3-claude/.env.mcp

# 更新 Claude 配置
vim "/Users/yanyu/Library/Application Support/Claude/claude_desktop_config.json"

# 重启 Claude
killall Claude && open -a Claude
```

---

## 附录

### A. 快速参考命令

#### 自动化脚本

```bash
# MCP 服务器激活
cd /Users/yanyu/yyc3-claude/automation-scripts
./activate-mcp.sh

# 信任目录管理
./trust-claude-dirs.sh trust-all
./trust-claude-dirs.sh list
./trust-claude-dirs.sh trust /path/to/dir
./trust-claude-dirs.sh untrust /path/to/dir

# YYC3 CLI
./yyc3-cli.sh init my-app
./yyc3-cli.sh dev
./yyc3-cli.sh build
./yyc3-cli.sh test
./yyc3-cli.sh commit
```

#### 系统维护

```bash
# 重启 Claude
killall Claude && open -a Claude

# 查看日志
tail -100 ~/Library/Logs/Claude/main.log
tail -100 ~/Library/Logs/Claude/mcp.log

# 检查进程
ps aux | grep -E "(mcp|claude)" | grep -v grep

# 清除缓存
rm -rf ~/Library/Caches/Claude
```

### B. 配置文件路径

| 文件 | 路径 |
|------|------|
| **MCP 配置** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **环境变量** | `/Users/yanyu/yyc3-claude/.env.mcp` |
| **Claude 配置** | `~/Library/Application Support/Claude/config.json` |
| **主日志** | `~/Library/Logs/Claude/main.log` |
| **MCP 日志** | `~/Library/Logs/Claude/mcp.log` |

### C. MCP 服务器端口和地址

| 服务 | 地址 |
|------|------|
| **PostgreSQL** | `192.168.3.45:5432` |
| **Docker Socket** | `/var/run/docker.sock` |
| **GitHub API** | `https://api.github.com` |
| **Brave Search** | `https://api.search.brave.com` |

### D. 符号化命令语法

```bash
# 操作符
-->      # 链式执行 (顺序)
@        # 框架应用
::       # 质量门控
#        # 样式控制
+        # 并行执行 (保留)
?        # 条件执行 (保留)

# 示例
>>step1 --> >>step2                    # 顺序执行
>>prompt @CAGEERF                      # 应用框架
>>code :: '高质量要求'                  # 添加质量标准
#concise >>report                      # 使用简洁样式
>>task1 + >>task2 + >>task3            # 并行执行
```

### E. 联系和支持

| 资源 | 链接/地址 |
|------|-----------|
| **YYC³ 文档** | `/Users/yanyu/yyc3-claude/README.md` |
| **MCP 协议** | <https://modelcontextprotocol.io/> |
| **Claude 文档** | <https://docs.anthropic.com/> |
| **问题反馈** | <admin@0379.email> |
| **GitHub** | <https://github.com/YYC-Cube> |

### F. 更新日志

#### v1.0.0 (2026-02-04)

- 初始版本
- 配置 7 个 MCP 服务器
- 完整自动化脚本
- 详细操作文档

---

## 文档维护

### 更新指南

当以下情况发生时，请更新本文档：

1. **新增 MCP 服务器** → 添加到"服务器详解"章节
2. **配置变更** → 更新"详细配置步骤"和"配置示例"
3. **故障排除** → 添加新的问题和解决方案
4. **版本更新** → 更新"附录 F. 更新日志"

### 文档版本控制

```bash
# 记录文档变更
git add MCP-SERVERS-OPERATION-GUIDE.md
git commit -m "docs: 更新 MCP 操作指导文档

- 新增 PostgreSQL 故障排除
- 更新配置示例
- 补充使用场景"
```

---

<div align="center">

> **「***YanYuCloudCube***」**
> **「***<admin@0379.email>***」**
> **「***Words Initiate Quadrants, Language Serves as Core for the Future***」**
> **「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」**

</div>
