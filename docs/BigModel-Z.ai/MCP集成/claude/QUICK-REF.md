# YYC3 零度空间 - 快速参考卡

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 🚀 核心命令

### YYC3 Dev CLI (使用 yc 或 yyc3-devcli)

```bash
# 项目管理
yc init <name>                # 初始化新项目
yc dev                        # 启动开发服务器
yc build                      # 构建生产版本
yc test                       # 运行测试
yc clean                      # 清理缓存

# AI辅助开发
yc ai generate <type>         # AI生成代码
yc review                     # AI代码审查
yc commit                     # AI生成commit
yc fix                        # AI自动修复错误

# 部署
yc deploy vercel              # 部署到Vercel
yc deploy ecs                 # 部署到阿里云
yc deploy nas                 # 部署到NAS

# 依赖管理
yc deps check                 # 检查更新
yc deps update                # 更新依赖
yc deps audit                 # 安全审计
```

## 🤖 AI工具

### Claude Code (零摩擦模式)

```bash
claude                        # 已配置跳过权限
claude --help                 # 查看帮助
```

### Crush AI (GLM-4.7)

```bash
crush                         # 使用GLM-4.7
crush -d                      # 调试模式
crush run "提示"               # 单次执行
```

### Ollama (本地模型)

```bash
ollama run llama3             # 运行Llama3
ollama list                   # 查看模型列表
ollama ps                     # 查看运行状态
```

## 📁 重要路径

```bash
/Users/yanyu/yyc3-claude           # YYC3工作目录
/Users/yanyu/claude-workspace      # 旧工作目录
/Users/yanyu/.local/share/crush/   # Crush配置
~/.zshrc                           # Shell配置
```

## 🌐 GitHub组织

- **组织**: YYC-Cube
- **仓库数**: 45
- **URL**: <https://github.com/YYC-Cube>
- **理念**: 万象归元于云枢 | 深栈智启新纪元

### 核心项目

- `yyc3-mana` - 企业管理系统
- `YYC3-PortAISys` - 智能浮窗系统
- `yyc3-learning-platform` - AI协作平台
- `YYC3-NAS-ECS` - NAS/云服务器管理

## 🎨 技术栈

### 前端

- Next.js 14/15/16
- React 18/19
- TypeScript
- Tailwind CSS

### 后端

- 微服务架构
- Docker
- PostgreSQL/MongoDB

### AI

- GLM-4.7
- OpenAI
- Claude
- Ollama
- MCP协议

## 🔧 配置文件

### YYC3配置

```bash
~/.yyc3-config.json           # YYC3全局配置
~/.zshrc                      # Shell别名配置
```

### Crush配置

```bash
~/.local/share/crush/crush.json     # 模型配置
~/.local/share/crush/providers.json # 提供者配置
```

### Claude配置

```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

## 📋 Git工作流

```bash
# 标准提交流程
git add .
yyc3-commit                   # AI生成commit信息

# 或手动提交
git commit -m "feat: 描述

Co-Authored-By: Claude <noreply@anthropic.com>"

# 推送到远程
git push
```

## 🧪 测试命令

```bash
yyc3 test                     # 运行所有测试
yyc3-test generate            # AI生成测试
yyc3-test e2e                 # E2E测试
yyc3-test coverage            # 测试覆盖率
```

## 🔐 安全命令

```bash
yyc3 deps audit               # 依赖安全审计
yyc3-security scan            # 代码安全扫描
yyc3-security auth            # 权限检查
```

## 📊 监控

```bash
yyc3-monitor start            # 启动监控
yyc3-report performance       # 性能报告
yyc3-log view                 # 查看日志
```

## 🎯 快捷操作

### 创建新组件

```bash
yc ai generate component UserCard --props="user:Object"
```

### 创建API路由

```bash
yc ai generate api /api/users --method=GET
```

### 代码审查并修复

```bash
yc review --auto-fix
```

### 一键部署

```bash
yc deploy vercel --prod
```

## 💡 最佳实践

### 1. 开发流程

```bash
yc init my-app
cd my-app
yc dev
# 开发...
yc review
yc commit
yc deploy
```

### 2. AI辅助

```bash
# 分析需求
yc ai analyze "需求描述"

# 生成代码
yc ai generate component MyComponent

# 审查代码
yc review

# 自动测试
yc test --ai-fix
```

### 3. 部署流程

```bash
# 本地测试
yc test

# 构建
yc build

# 部署
yc deploy vercel --prod
```

## 🚨 故障排查

### Claude无法启动

```bash
# 检查配置
claude --version

# 重新安装
npm install -g @anthropic-ai/claude-code
```

### Crush模型错误

```bash
# 检查配置
cat ~/.local/share/crush/crush.json

# 重置模型
crush config reset
```

### 依赖问题

```bash
# 清理并重新安装
yyc3 clean --all
bun install
```

## 📚 文档

```bash
# 查看完整文档
cat /Users/yanyu/yyc3-claude/README.md

# 项目分析
cat /Users/yanyu/yyc3-claude/projects-analysis/YYC-CUBE-ECOSYSTEM.md

# 工作流指南
cat /Users/yanyu/yyc3-claude/workflow-templates/YYC3-STANDARD-WORKFLOW.md

# MCP配置
cat /Users/yanyu/yyc3-claude/mcp-servers/YYC3-MCP-GUIDE.md
```

## 🎓 学习资源

- Next.js: <https://nextjs.org/docs>
- React: <https://react.dev>
- TypeScript: <https://www.typescriptlang.org/docs>
- Tailwind: <https://tailwindcss.com/docs>
- Claude Code: <https://docs.anthropic.com/claude-code>

---

**零度空间 | 100%信任AI协同 | 万象归元于云枢**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
