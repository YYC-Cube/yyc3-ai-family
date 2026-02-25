# MCP 服务器调用示例配置文档

> **文档版本**: 1.0.0
> **创建时间**: 2026-02-05
> **最后更新**: 2026-02-05
> **维护者**: YYC³ Team

---

## 📚 目录

- [概述](#概述)
- [Claude Desktop中的调用方式](#claude-desktop中的调用方式)
- [完整配置示例](#完整配置示例)
- [各服务器调用示例](#各服务器调用示例)
- [高级调用技巧](#高级调用技巧)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

---

## 概述

本文档提供了MCP服务器在Claude Desktop中的详细调用方法和完整配置示例。

### MCP调用流程

```
用户自然语言请求
    ↓
Claude Desktop 解析
    ↓
识别需要使用的MCP工具
    ↓
调用对应的MCP服务器
    ↓
执行工具操作
    ↓
返回结果给用户
```

---

## Claude Desktop中的调用方式

### 方式1: 自然语言直接调用

在Claude聊天界面中直接用自然语言描述需求，Claude会自动选择合适的MCP工具。

**示例1: 文件系统操作**
```
请列出 /Users/yanyu/yyc3-claude 目录下的所有文件
```

**示例2: 代码分析**
```
分析 /Users/yanyu/my-project/src 目录下的所有TypeScript文件，
找出重复代码模式并给出重构建议
```

**示例3: GitHub操作**
```
列出我的所有GitHub仓库
```

**示例4: 数据库查询**
```
查询数据库中users表的前10条记录
```

---

### 方式2: 明确指定工具

在请求中明确指定要使用的工具或服务器。

**示例1: 使用文件系统工具**
```
使用文件系统工具读取 /Users/yanyu/config.json 文件的内容
```

**示例2: 使用GitHub工具**
```
使用GitHub工具在 yyc3-claude 仓库中创建一个issue，
标题是"修复登录bug"，描述详细的问题
```

**示例3: 使用数据库工具**
```
使用PostgreSQL工具执行以下查询：
SELECT * FROM orders WHERE created_at > '2024-01-01' ORDER BY total DESC LIMIT 10
```

---

### 方式3: 链式调用

组合多个MCP工具完成复杂任务。

**示例: 完整的工作流**
```
请帮我完成以下任务：
1. 使用文件系统工具搜索 /Users/yanyu/my-project 目录下所有包含 TODO 注释的文件
2. 读取这些文件的内容
3. 使用GitHub工具为每个TODO创建一个issue
4. 使用提示词工具生成项目进度报告
```

---

## 完整配置示例

### 最小配置（仅本地服务器）

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "node",
      "args": [
        "/Users/yanyu/yyc3-claude/claude-prompts-mcp/server/dist/index.js"
      ]
    }
  }
}
```

### 标准配置（常用服务器）

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "node",
      "args": [
        "/Users/yanyu/yyc3-claude/claude-prompts-mcp/server/dist/index.js"
      ]
    },
    "mcp-filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yanyu"
      ]
    },
    "mcp-github-yyc3": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "github_pat_你的实际令牌"
      }
    }
  }
}
```

### 完整配置（所有服务器）

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

---

## 各服务器调用示例

### 1. 文件系统服务器 (mcp-filesystem)

#### 基础操作

**读取文件**
```
读取 /Users/yanyu/yyc3-claude/README.md 文件的内容
```

**写入文件**
```
创建一个新文件 /Users/yanyu/test/hello.txt，
内容为 "Hello, World!"
```

**编辑文件**
```
在 /Users/yanyu/config.json 文件的第10行后添加：
"new_key": "new_value"
```

**列出目录**
```
列出 /Users/yanyu/yyc3-claude 目录下的所有文件和子目录
```

**创建目录**
```
在 /Users/yanyu 下创建一个新目录 test-project
```

#### 高级操作

**搜索文件**
```
在 /Users/yanyu/yyc3-claude 目录下搜索所有 .ts 文件
```

**批量读取**
```
读取 /Users/yanyu/yyc3-claude 目录下所有的 README.md 文件
```

**目录树**
```
显示 /Users/yanyu/yyc3-claude 目录的完整树形结构
```

**文件信息**
```
获取 /Users/yanyu/yyc3-claude/README.md 文件的详细信息（大小、修改时间等）
```

---

### 2. GitHub服务器 (mcp-github-yyc3)

#### 仓库操作

**列出仓库**
```
列出我的所有GitHub仓库
```

**创建仓库**
```
创建一个新的GitHub仓库，名称为 test-repo，
描述为 "测试仓库"，设置为公开
```

**克隆仓库**
```
克隆 yyc3-claude 仓库到 /Users/yanyu/test 目录
```

#### Issue和PR操作

**创建Issue**
```
在 yyc3-claude 仓库中创建一个issue：
- 标题: 修复登录功能bug
- 描述: 用户无法正常登录，提示认证失败
- 标签: bug, high-priority
```

**列出Issue**
```
列出 yyc3-claude 仓库中所有开放的issue
```

**创建Pull Request**
```
在 yyc3-claude 仓库中创建一个PR：
- 源分支: feature/new-feature
- 目标分支: main
- 标题: 添加新功能
- 描述: 实现了用户请求的新功能
```

#### 文件操作

**读取文件**
```
读取 yyc3-claude 仓库中 main 分支的 README.md 文件
```

**提交更改**
```
在 yyc3-claude 仓库中提交更改：
- 文件: src/index.js
- 提交信息: fix: 修复登录bug
- 分支: feature/fix-login
```

---

### 3. 数据库服务器 (mcp-postgres)

#### 查询操作

**简单查询**
```
查询数据库中users表的所有记录
```

**条件查询**
```
查询users表中年龄大于18的用户
```

**排序和限制**
```
查询orders表，按金额降序排列，返回前10条记录
```

**聚合查询**
```
统计每个用户的订单数量和总金额
```

#### 表操作

**列出所有表**
```
列出数据库中的所有表
```

**查看表结构**
```
查看users表的结构（字段名、类型、约束等）
```

#### 复杂查询

**连接查询**
```
查询用户的订单信息，包括用户名、订单号、订单金额
```

**分组统计**
```
按月份统计订单数量和总金额
```

**子查询**
```
查询消费金额超过平均值的用户
```

---

### 4. 搜索服务器 (mcp-brave-search)

#### 基础搜索

**简单搜索**
```
搜索 "TypeScript 最佳实践"
```

**技术文档搜索**
```
搜索 "React Hooks 官方文档"
```

#### 高级搜索

**新闻搜索**
```
搜索最新的 "AI 技术进展" 新闻
```

**代码示例搜索**
```
搜索 "Python 异步编程示例"
```

**问题解决搜索**
```
搜索 "Docker 容器无法启动的解决方案"
```

---

### 5. Docker服务器 (mcp-docker)

#### 容器操作

**列出容器**
```
列出所有正在运行的Docker容器
```

**启动容器**
```
启动名为 my-app 的容器
```

**停止容器**
```
停止所有正在运行的容器
```

#### 镜像操作

**列出镜像**
```
列出所有Docker镜像
```

**拉取镜像**
```
拉取最新的 nginx 镜像
```

**删除镜像**
```
删除未使用的Docker镜像
```

#### 日志和监控

**查看日志**
```
查看 my-app 容器的最近100行日志
```

**查看资源使用**
```
查看所有容器的资源使用情况（CPU、内存）
```

---

### 6. 提示词服务器 (claude-prompts)

#### 基础操作

**创建提示词**
```
创建一个名为 code-review 的提示词，
内容是用于代码审查的指导原则
```

**执行提示词**
```
使用 code-review 提示词审查以下代码：
[粘贴代码]
```

**列出提示词**
```
列出所有已创建的提示词
```

#### 高级操作

**链式执行**
```
执行以下提示词链：
>>code-analysis --> >>refactor-suggestions --> >>summary
```

**框架应用**
```
使用 CAGEERF 框架分析这段代码：
[粘贴代码]
```

**质量门控**
```
执行代码审查，要求通过以下质量标准：
- 代码安全性
- 性能优化
- 可维护性
```

---

### 7. 中文助手服务器 (yyc3-cn-assistant)

#### 代码注释生成

**生成中文注释**
```
为以下代码生成详细的中文注释：
[粘贴代码]
```

**文档翻译**
```
将以下英文技术文档翻译成中文：
[粘贴文档]
```

#### 本地化指导

**中文编程建议**
```
为以下Python代码提供中文编程建议和最佳实践：
[粘贴代码]
```

**中文错误信息**
```
将以下英文错误信息翻译成中文，并提供解决方案：
[粘贴错误信息]
```

---

## 高级调用技巧

### 技巧1: 多服务器协同

```
请帮我完成以下任务：
1. 使用文件系统工具搜索项目中所有包含 TODO 的文件
2. 使用GitHub工具为每个TODO创建issue
3. 使用提示词工具生成项目进度报告
4. 使用数据库工具记录任务完成情况
```

### 技巧2: 条件判断

```
检查 /Users/yanyu/config.json 文件是否存在：
- 如果存在，读取其内容
- 如果不存在，创建一个默认配置文件
```

### 技巧3: 批量处理

```
批量处理以下文件：
- /Users/yanyu/file1.txt
- /Users/yanyu/file2.txt
- /Users/yanyu/file3.txt

对每个文件执行：
1. 读取内容
2. 提取关键信息
3. 生成摘要报告
```

### 技巧4: 错误处理

```
尝试连接数据库并执行查询：
- 如果连接失败，记录错误日志
- 如果查询成功，保存结果到文件
```

### 技巧5: 性能优化

```
并行执行以下任务：
1. 分析 src 目录下的所有文件
2. 查询数据库获取用户数据
3. 搜索最新的技术文档
4. 生成综合报告
```

---

## 故障排除

### 问题1: MCP服务器未响应

**症状**: Claude提示无法连接到MCP服务器

**解决方案**:
```
1. 检查配置文件是否正确
2. 确认服务器进程是否运行
3. 查看日志文件
4. 重启Claude Desktop
```

### 问题2: 工具调用失败

**症状**: 执行MCP工具时返回错误

**解决方案**:
```
1. 确认工具名称拼写正确
2. 检查参数是否完整
3. 验证权限设置
4. 查看详细错误信息
```

### 问题3: 性能问题

**症状**: MCP调用响应缓慢

**解决方案**:
```
1. 减少一次性处理的数据量
2. 使用批量操作代替多次单独调用
3. 优化查询语句
4. 检查网络连接
```

---

## 最佳实践

### 1. 明确需求

```
❌ 不好的示例:
"帮我处理一下文件"

✅ 好的示例:
"使用文件系统工具读取 /Users/yanyu/config.json 文件，
提取所有以 'api_' 开头的配置项，并生成一个JSON报告"
```

### 2. 分步执行

```
❌ 不好的示例:
"搜索所有文件，分析代码，创建issue，生成报告"

✅ 好的示例:
"请按以下步骤执行：
1. 搜索 /Users/yanyu/my-project 目录下所有 .ts 文件
2. 读取这些文件的内容
3. 分析代码质量
4. 为发现的问题创建GitHub issue
5. 生成分析报告"
```

### 3. 错误处理

```
✅ 好的示例:
"尝试读取 /Users/yanyu/config.json 文件：
- 如果文件存在，读取内容并解析
- 如果文件不存在，创建一个默认配置
- 如果读取失败，记录错误并通知我"
```

### 4. 批量操作

```
✅ 好的示例:
"批量读取以下文件：
- /Users/yanyu/file1.txt
- /Users/yanyu/file2.txt
- /Users/yanyu/file3.txt

然后生成一个包含所有文件内容的综合报告"
```

### 5. 结果验证

```
✅ 好的示例:
"创建 /Users/yanyu/test.txt 文件后，
请验证文件是否成功创建，并显示文件内容"
```

---

## 附录

### A. 配置文件位置

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### B. 日志文件位置

- **macOS**: `~/Library/Logs/Claude/`
- **Linux**: `~/.local/state/Claude/logs/`
- **Windows**: `%LOCALAPPDATA%\Claude\logs\`

### C. 环境变量配置

```bash
# GitHub 令牌
export GITHUB_PERSONAL_ACCESS_TOKEN="github_pat_你的令牌"

# Brave API 密钥
export BRAVE_API_KEY="BS你的密钥"

# 数据库连接
export DATABASE_URL="postgresql://用户:密码@主机:端口/数据库"
```

### D. 相关文档

- [MCP服务器完整操作指导文档](./MCP-SERVERS-OPERATION-GUIDE.md)
- [自动化脚本使用指南](./AUTOMATION-SCRIPTS-GUIDE.md)
- [YYC³团队智能应用开发标准规范](../README.md)

---

<div align="center">

> **YYC³ Team**
> **言启象限 | 语枢未来**
> **Words Initiate Quadrants, Language Serves as Core for the Future**

</div>
