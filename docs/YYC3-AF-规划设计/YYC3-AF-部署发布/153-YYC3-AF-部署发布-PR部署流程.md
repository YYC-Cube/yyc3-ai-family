# YYC³ PR 部署流程文档

> **YanYuCloudCube**
> 言启象限 | 语枢未来
> *Words Initiate Quadrants, Language Serves as Core for Future*
> 万象归元于云枢 | 深栈智启新纪元
> *All things converge in cloud pivot; Deep stacks ignite a new era of intelligence*

---

## 📋 概述

本文档描述 YYC³ 项目的 PR（Pull Request）部署流程，包括 CI/CD 自动部署、自定义域名配置和 PR 预览环境。

### 部署信息

| 项目 | 值 |
|------|-----|
| 仓库 | YYC-Cube/yyc3-ai-family |
| 主分支 | main |
| 自定义域名 | https://ai.yyccube.xin/ |
| GitHub Pages | 自动启用 |

---

## 🚀 PR 部署流程

### 1. 创建功能分支

```bash
# 从 main 分支创建功能分支
git checkout -b feature/your-feature-name

# 或者从其他分支创建
git checkout -b feature/your-feature-name origin/develop
```

### 2. 开发和提交

```bash
# 开发代码
# 进行修改...

# 提交更改
git add .
git commit -m "feat: 添加新功能描述"

# 推送到远程
git push origin feature/your-feature-name
```

### 3. 创建 PR

1. 访问 GitHub 仓库页面
2. 点击 "Compare & pull request"
3. 选择分支：
   - Base: `main`
   - Compare: `feature/your-feature-name`
4. 填写 PR 标题和描述
5. 点击 "Create pull request"

### 4. CI/CD 自动触发

创建 PR 后，GitHub Actions 会自动触发 CI/CD 流程：

#### 工作流步骤

1. **文档结构检查**
   - 检查 `docs/INDEX.md` 存在
   - 检查 `docs/README.md` 存在
   - 检查 `docs/DEPLOYMENT_GUIDE.md` 存在
   - 检查 `docs/LOCAL_SETUP_GUIDE.md` 存在
   - 验证 YYC3-AF 文档命名规范

2. **构建和测试**
   - 安装依赖 (`pnpm install`)
   - 运行 Lint (`pnpm run lint`)
   - 运行类型检查 (`pnpm run type-check`)
   - 运行测试 (`pnpm test`)
   - 构建项目 (`pnpm build`)
   - 生成错误报告

3. **部署到 GitHub Pages**
   - 上传构建产物到 GitHub Pages
   - 部署到 https://ai.yyccube.xin/

4. **PR 评论（仅限 PR）**
   - 在 PR 中自动评论构建结果
   - 提供修复建议
   - 附带错误报告链接

---

## 🌐 自定义域名配置

### 当前配置

项目已配置自定义域名 `https://ai.yyccube.xin/`，部署流程会自动使用此域名。

### Vite 配置

[vite.config.ts](../../vite.config.ts) 中的配置：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      manifest: {
        name: 'YYC³ AI-Family',
        short_name: 'YYC³',
        description: 'YYC³ AI-Family - 智能家庭协同平台',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'utils': ['zustand', 'zod']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
```

**关键配置**：
- `base: '/'` - 自定义域名必须使用根路径
- `outDir: 'dist'` - 构建输出目录

### GitHub Pages 配置

GitHub 仓库设置中已配置：

1. **Pages 设置**
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Directory: `/dist`
   - Custom domain: `ai.yyccube.xin`

2. **DNS 配置**
   - CNAME 记录指向 `YYC-Cube.github.io`
   - 或者 A 记录指向 GitHub Pages IP

---

## 📊 CI/CD 工作流详解

### 触发条件

```yaml
on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  workflow_dispatch:
```

- **Push to main**: 自动部署到生产环境
- **Pull Request**: 自动部署预览并生成报告
- **Workflow Dispatch**: 手动触发部署

### 权限配置

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
  checks: write
```

### 并发控制

```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

---

## 🔄 PR 预览环境

### 预览 URL

当创建 PR 后，CI/CD 会自动构建并部署预览版本：

| 环境类型 | 访问地址 |
|----------|---------|
| 生产环境 | https://ai.yyccube.xin/ |
| PR 预览 | https://deploy-preview-<pr-number>-pages-pr... |

### 查看预览

1. 在 PR 页面点击 "Checks" 标签
2. 查看 "deploy" job 的详细日志
3. 等待部署完成
4. 点击预览链接（如果有）

---

## 📝 PR 提交规范

### PR 标题规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**：
```
feat(ui): 添加新的 AI 智能体配置面板

- 支持自定义模型参数
- 添加模型切换功能
- 优化加载性能

Closes #123
```

### PR 描述模板

```markdown
## 📋 变更描述
简要描述本次 PR 的主要变更内容

## 🎯 关联 Issue
Closes #123

## ✅ 变更类型
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 性能优化 (perf)
- [ ] 重构 (refactor)

## 🧪 测试
- [ ] 已通过本地测试
- [ ] 已通过 CI/CD 测试
- [ ] 已手动验证

## 📸 截图
如果有 UI 变更，请附上截图

## ⚠️ 破坏性变更
如果有 API 变更或数据库迁移，请在此说明
```

---

## 🐛 CI/CD 失败处理

### 常见失败原因

#### 1. Lint 错误

```bash
# 运行 lint 查看具体错误
pnpm run lint

# 自动修复（如果支持）
pnpm run lint --fix
```

#### 2. 类型检查错误

```bash
# 运行类型检查
pnpm run type-check

# 查看具体错误位置
pnpm run type-check 2>&1 | grep "error TS"
```

#### 3. 测试失败

```bash
# 运行测试查看详细输出
pnpm test

# 运行特定测试
pnpm test -- src/components/your-component.test.tsx
```

#### 4. 构建失败

```bash
# 检查环境变量
cat .env.local

# 清理并重新构建
rm -rf node_modules dist
pnpm install
pnpm build
```

### 查看日志

1. 打开 PR 页面
2. 点击 "Checks" 标签
3. 选择失败的 job（如 `build-and-test`）
4. 查看详细日志

### 重新触发 CI/CD

```bash
# 空提交触发重新构建
git commit --allow-empty -m "chore: 重新触发 CI/CD"
git push

# 或者使用 GitHub Actions 手动触发
# GitHub 仓库 -> Actions -> CI/CD Deploy to GitHub Pages -> Run workflow
```

---

## 🔍 PR 自动评论功能

### 评论内容

CI/CD 会在 PR 中自动评论以下内容：

1. **构建摘要**
   - Lint 状态
   - 类型检查状态
   - 测试状态
   - 构建状态

2. **错误详情**
   - 具体错误信息
   - 文件位置
   - 错误代码

3. **修复建议**
   - 针对性的修复建议
   - 相关文档链接
   - 命令示例

### 示例评论

```markdown
## 🔍 CI/CD 构建结果

### ✅ 通过的检查
- [x] 文档结构检查
- [x] Lint 检查
- [x] 类型检查
- [x] 测试
- [x] 构建

### ⚠️ 发现的问题
1. **Lint 错误**: 2 个错误
   - `src/components/AgentCard.tsx:15:5` - 缺少分号
   - `src/lib/store.ts:42:3` - 未使用的变量

### 💡 修复建议
1. 修复 Lint 错误
   ```bash
   pnpm run lint --fix
   ```

2. 运行类型检查
   ```bash
   pnpm run type-check
   ```

3. 重新提交
   ```bash
   git add .
   git commit -m "fix: 修复 lint 和类型错误"
   git push
   ```

📊 [查看完整报告](链接)
```

---

## 📊 部署监控

### 查看部署状态

1. **GitHub Actions**
   - 访问 https://github.com/YYC-Cube/yyc3-ai-family/actions
   - 查看最新工作流运行状态

2. **GitHub Pages**
   - 访问 https://github.com/YYC-Cube/yyc3-ai-family/deployments
   - 查看部署历史

3. **自定义域名**
   - 访问 https://ai.yyccube.xin/
   - 验证部署是否成功

### 检查部署时间

通常部署流程需要 2-5 分钟：

| 步骤 | 预计时间 |
|------|---------|
| 文档检查 | ~30s |
| 构建测试 | ~90s |
| 部署 | ~60s |
| **总计** | **~3 分钟** |

---

## 🎯 最佳实践

### 1. 频繁提交

```bash
# 小步提交，频繁推送
git add .
git commit -m "feat: 添加第一个功能"
git push

# 继续开发
git add .
git commit -m "feat: 添加第二个功能"
git push
```

### 2. 保持 PR 小而专注

- 每个 PR 应该专注于一个功能
- PR 不应超过 500 行代码变更
- 避免大的重构 PR

### 3. 充分测试后再提交

```bash
# 本地测试
pnpm test

# 类型检查
pnpm run type-check

# Lint 检查
pnpm run lint

# 构建测试
pnpm build
```

### 4. 及时响应 CI/CD 反馈

- 关注 CI/CD 的评论
- 快速修复失败的问题
- 避免阻塞 main 分支

---

## 🔗 相关文档

- [136-YYC3-AF-部署发布-部署计划](./136-YYC3-AF-部署发布-部署计划.md)
- [138-YYC3-AF-部署发布-环境配置文档](./138-YYC3-AF-部署发布-环境配置文档.md)
- [152-YYC3-AF-部署发布-PWA发布状态报告](./152-YYC3-AF-部署发布-PWA发布状态报告.md)
- [DEPLOYMENT_GUIDE](../DEPLOYMENT_GUIDE.md)

---

## 📞 帮助与支持

### 常见问题

**Q: PR 创建后没有自动触发 CI/CD？**

A: 检查以下几点：
1. 确认 PR 目标分支是 `main`
2. 确认工作流文件 `.github/workflows/deploy.yml` 存在
3. 检查 GitHub Actions 是否有权限

**Q: 部署成功但域名无法访问？**

A: 检查以下几点：
1. DNS 配置是否正确
2. GitHub Pages 设置是否启用自定义域名
3. 是否需要等待 DNS 生效（通常需要几分钟到几小时）

**Q: 如何回滚部署？**

A: 使用以下命令回滚：
```bash
# 回滚到上一个版本
git revert HEAD

# 或回滚到特定提交
git revert <commit-hash>

git push origin main
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」
