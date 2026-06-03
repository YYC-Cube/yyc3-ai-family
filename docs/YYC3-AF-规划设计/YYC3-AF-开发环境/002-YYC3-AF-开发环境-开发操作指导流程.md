# 🚀 YYC3 开发操作指导流程

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 一、每日开发工作流

### 1.1 早上启动环境

```bash
# 一键启动所有服务
~/yyc3-start.sh

# 或者分步启动：
# 1. 确认 PostgreSQL 运行
brew services list | grep postgresql

# 2. 确认 Docker 运行
docker info | head -5

# 3. 进入项目
cd /Volumes/Build/yyc3_aify

# 4. 启动开发服务器
npm run dev
```

### 1.2 开发时常用命令

```bash
# 进入项目（已配置别名）
yyc3

# 查看当前分支
git branch

# 创建新功能分支
git checkout -b feature/新功能名称

# 安装新依赖
npm install 包名
# 或
npm install 包名 --save-dev
```

---

## 💻 二、核心开发任务

### 2.1 AI 智能体开发

根据您的 README，项目有 7 大 AI 智能体：

```bash
# 智能体相关代码位置
cd /Volumes/Build/yyc3_aify/src/components/agents/

# 查看现有智能体
ls -la

# 各智能体职责：
# - Navigator   (治愈·领航员) - 琥珀色
# - Thinker     (洞察·思想家) - 蓝色
# - Prophet     (预见·先知)   - 紫色
# - Bole        (知遇·伯乐)   - 粉色
# - Pivot       (元启·天枢)   - 青色
# - Sentinel    (卫安·哨兵)   - 红色
# - Grandmaster (格物·宗师)   - 绿色
```

### 2.2 修改智能体配置

```bash
# 编辑智能体配置文件
vim src/config/agents.ts

# 添加新模型到模型池
vim src/config/models.ts
```

### 2.3 数据库操作

```bash
# 连接主数据库
psql -p 5433 -U yyc3_dev -d yyc3_main

# 常用 SQL 操作
```

```sql
-- 查看所有表
\dt

-- 查看表结构
\d 表名

-- 查询最近对话
SELECT * FROM chats ORDER BY created_at DESC LIMIT 10;

-- 退出
\q
```

---

## 🔧 三、特定功能开发

### 3.1 修改系统设置

```bash
# 设置相关组件
cd /Volumes/Build/yyc3_aify/src/components/settings/

# 主要文件：
# - AIConfig.tsx      (AI模型配置)
# - SystemConfig.tsx  (系统配置)
# - UserConfig.tsx    (用户配置)
# - GitOpsConfig.tsx  (GitOps配置)
```

### 3.2 修改导航系统

```bash
# 五级导航相关代码
cd /Volumes/Build/yyc3_aify/src/components/layout/

# 关键文件：
# - Sidebar.tsx       (侧边栏 - L1)
# - AgentGrid.tsx     (智能体网格 - L2)
# - TabSystem.tsx     (标签页系统 - L3)
# - SubPanel.tsx      (子面板 - L4)
# - ActionBar.tsx     (操作栏 - L5)
```

### 3.3 修改 DevOps 终端

```bash
# DevOps 终端组件
cd /Volumes/Build/yyc3_aify/src/components/devops/

# 子标签页：
# - Pipeline.tsx      (CI/CD流水线)
# - Containers.tsx    (容器管理)
# - MCPTemplates.tsx  (MCP模板)
# - DAGView.tsx       (DAG编排器)
# - Terminal.tsx      (模拟终端)
```

---

## 🗄️ 四、数据持久化操作

### 4.1 localStorage 数据结构

```typescript
// 主要存储键
const STORAGE_KEYS = {
  CHAT_HISTORY: 'yyc3_chat_messages',
  AGENT_MESSAGES: 'yyc3_agent_messages',
  AI_CONFIG: 'yyc3_models-config',
  UI_SETTINGS: 'yyc3_appearance-config',
  SYSTEM_CONFIG: 'yyc3_settings'
}
```

### 4.2 手动操作 localStorage

```javascript
// 在浏览器控制台中
// 查看所有存储
Object.keys(localStorage).filter(k => k.startsWith('yyc3_'))

// 查看特定数据
JSON.parse(localStorage.getItem('yyc3_models-config'))

// 清除某个配置
localStorage.removeItem('yyc3_models-config')

// 导出数据
const data = {}
for(let k of Object.keys(localStorage)) {
  if(k.startsWith('yyc3_')) data[k] = JSON.parse(localStorage.getItem(k))
}
console.log(JSON.stringify(data, null, 2))
```

---

## 🐳 五、Docker 相关操作

### 5.1 开发用容器

```bash
# 查看运行中的容器
docker ps

# 启动项目配套容器（如果有 docker-compose）
cd /Volumes/Build/yyc3_aify
docker-compose up -d

# 查看容器日志
docker logs -f 容器名

# 进入容器
docker exec -it 容器名 /bin/bash
```

### 5.2 常用数据库容器

```bash
# 启动 Redis（如果项目需要）
docker run -d --name yyc3-redis \
  -p 6379:6379 \
  -v /Volumes/Cache/redis:/data \
  redis:alpine

# 启动 MongoDB（如果项目需要）
docker run -d --name yyc3-mongo \
  -p 27017:27017 \
  -v /Volumes/Knowledge/mongo:/data/db \
  mongo:latest
```

---

## 🤖 六、Ollama 模型管理

```bash
# 查看已安装模型
ollama list

# 拉取新模型
ollama pull llama2
ollama pull codellama
ollama pull mistral
ollama pull phi

# 运行模型测试
ollama run llama2 "你好，介绍一下自己"

# 查看模型详情
ollama show llama2
```

---

## 🧪 七、测试和调试

### 7.1 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- src/components/agents/Navigator.test.tsx

# 测试覆盖率
npm run test:coverage

# 类型检查
npm run type-check
```

### 7.2 调试技巧

```bash
# 在代码中添加 debugger
# 然后打开浏览器 DevTools (F12)

# 查看网络请求
# DevTools -> Network 标签

# 查看 React 组件
# 安装 React DevTools 浏览器扩展
```

### 7.3 日志查看

```bash
# 查看应用日志
tail -f ~/Library/Logs/yyc3.log

# 查看 PostgreSQL 日志
tail -f /Volumes/Cache/postgres/data/log/postgresql-*.log

# 查看 Docker 日志
docker logs -f 容器名
```

---

## 📦 八、构建和部署

### 8.1 生产构建

```bash
# 构建生产版本
cd /Volumes/Build/yyc3_aify
npm run build

# 预览构建结果
npm run preview

# 构建产物位置
ls -la dist/
```

### 8.2 部署到 GitHub Pages

```bash
# 如果配置了 GitHub Pages
npm run deploy

# 或者手动部署
npm run build
git add dist -f
git commit -m "Deploy"
git push origin `git subtree split --prefix dist main`:gh-pages --force
```

---

## 🔄 九、版本控制和协作

### 9.1 Git 工作流

```bash
# 更新代码
git pull origin main

# 提交更改
git add .
git commit -m "描述更改内容"
git push origin 当前分支名

# 创建 PR 前的检查
npm run lint
npm run type-check
npm test
```

### 9.2 处理合并冲突

```bash
# 拉取最新代码
git pull origin main

# 如果有冲突，手动解决后
git add .
git commit -m "解决合并冲突"
git push
```

---

## 🗑️ 十、清理和维护

### 10.1 定期清理

```bash
# 每周清理
# 清理 npm 缓存
npm cache clean --force

# 清理 Docker 无用数据
docker system prune -f

# 清理构建产物
rm -rf /Volumes/Build/yyc3_aify/dist
rm -rf /Volumes/Build/yyc3_aify/.next  # 如果是 Next.js
```

### 10.2 每月维护

```bash
# 检查磁盘使用
df -h /Volumes/{Max,Development,Build,Cache,Containers,Knowledge}

# 清理 PostgreSQL 旧数据
psql -p 5433 -U yanyu -d yyc3_main -c "VACUUM ANALYZE;"

# 更新依赖
npm outdated
npm update

# 检查 Docker 镜像
docker images | grep "<none>"  # 查找悬空镜像
docker image prune  # 清理悬空镜像
```

### 10.3 备份重要数据（到 NAS）

```bash
# 手动备份到 NAS（假设 NAS 挂载在 /Volumes/NAS）
rsync -av --progress \
  /Volumes/Knowledge/yyc3/ \
  /Volumes/NAS/backup/yyc3-knowledge-$(date +%Y%m%d)/

# 备份数据库
pg_dump -p 5433 -U yyc3_dev -d yyc3_main > \
  /Volumes/NAS/backup/yyc3-db-$(date +%Y%m%d).sql
```

---

## 🚨 十一、故障处理

### 11.1 常见问题解决

```bash
# 端口被占用
lsof -i :3114
kill -9 PID

# PostgreSQL 无法启动
brew services restart postgresql@15
tail -f /Volumes/Cache/postgres/data/log/postgresql-*.log

# Docker 无法启动
rm -rf ~/Library/Containers/com.docker.docker
ln -s /Volumes/Containers/docker ~/Library/Containers/com.docker.docker
open -a Docker

# Node 进程卡住
pkill node
npm run dev
```

### 11.2 性能问题排查

```bash
# 检查磁盘 IO
iostat -d 2

# 查看内存使用
top -l 1 | head -10

# 查看 Node 内存
ps aux | grep node

# 检查数据库性能
psql -p 5433 -U yanyu -d yyc3_main -c "SELECT * FROM pg_stat_activity;"
```

---

## 📚 十二、学习资源

### 12.1 项目文档

```bash
# 项目内文档
cd /Volumes/Build/yyc3_aify/docs/
ls -la

# 查看 README
cat /Volumes/Build/yyc3_aify/README.md
```

### 12.2 关键文档索引

| 文档 | 位置 | 内容 |
|------|------|------|
| 架构设计 | `docs/YYC3-AF-原型设计/` | 九层架构 |
| 导航系统 | `YYC3-5-Level-Navigation-System-Specification_CN.md` | 五级导航 |
| API 文档 | `src/lib/api.ts` | API 接口 |
| 数据库 schema | `src/lib/db-schema.ts` | 数据模型 |

---

## 🎯 十三、本周开发目标建议

### 本周可优先完成

- [ ] **熟悉项目结构**：浏览各目录，了解代码组织
- [ ] **运行测试**：确保所有测试通过
- [ ] **选择一个智能体**：修改其响应逻辑
- [ ] **添加新功能**：如新的 MCP 模板
- [ ] **优化性能**：检查是否有可以优化的组件

### 具体任务示例

```bash
# 1. 运行测试确认环境正常
npm test

# 2. 修改 Navigator 智能体的欢迎语
vim src/components/agents/Navigator.tsx
# 找到 welcome message 并修改

# 3. 提交更改
git add .
git commit -m "优化 Navigator 欢迎语"
git push
```

---

## ✅ 十四、每日开发 checklist

### 早上

- [ ] 运行 `~/yyc3-start.sh`
- [ ] 确认 PostgreSQL 运行 (`brew services list`)
- [ ] 确认 Docker 运行 (`docker info`)
- [ ] 进入项目 (`yyc3`)
- [ ] 启动 dev server (`npm run dev`)

### 开发中

- [ ] 频繁 commit (`git commit`)
- [ ] 运行测试 (`npm test`)
- [ ] 检查类型 (`npm run type-check`)
- [ ] 代码格式化 (`npm run lint`)

### 晚上

- [ ] 提交代码 (`git push`)
- [ ] 停止 dev server (`Ctrl+C`)
- [ ] 可选：备份重要数据到 NAS
- [ ] 关闭 Docker (`osascript -e 'quit app "Docker Desktop"'`)

---

## 🎯 十五、性能优化建议

### 15.1 前端性能优化

```bash
# 分析构建包大小
pnpm build
npx vite-bundle-visualizer

# 检查未使用的依赖
npx depcheck
```

### 15.2 数据库性能优化

```sql
-- 查看慢查询
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 分析表大小
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 15.3 Docker 性能优化

```bash
# 清理未使用的镜像和容器
docker system prune -a --volumes

# 查看容器资源使用
docker stats --no-stream

# 优化 Docker 镜像大小
# 使用多阶段构建
# 使用 .dockerignore
```

---

## 🎉 开始开发

现在您的环境已经完全就绪，可以开始真正的开发工作了：

```bash
# 一键启动
~/yyc3-start.sh

# 开始编码
cd /Volumes/Build/yyc3_aify
code .  # 如果使用 VS Code

# 查看效果
open http://localhost:3114
```

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
