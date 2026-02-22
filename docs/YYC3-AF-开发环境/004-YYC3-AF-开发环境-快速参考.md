# YYC³ 快速参考

> **YanYuCloudCube**
> 言启象限 | 语枢未来
> *Words Initiate Quadrants, Language Serves as Core for Future*
> 万象归元于云枢 | 深栈智启新纪元
> *All things converge in cloud pivot; Deep stacks ignite a new era of intelligence*

---

## 🚀 一键启动

```bash
~/yyc3-start.sh
```

## 🔗 快速访问

| 服务 | 地址 | 说明 |
|------|------|------|
| YYC3 应用 | http://localhost:3115 | 主应用 |
| pgAdmin | http://127.0.0.1:5050 | 数据库管理 |
| Ollama | http://localhost:11434 | 本地 AI 模型 |
| Redis | localhost:6379 | 缓存服务 |

---

## 💻 常用命令

### 项目操作

```bash
# 进入项目
yyc3

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 数据库操作

```bash
# 进入主数据库
yyc3-psql

# 进入知识库
psql -p 5433 -U claude -d yyc3_knowledge

# 查看所有表
\dt

# 查看表结构
\d 表名

# 退出
\q
```

### Git 操作

```bash
# 查看当前分支
git branch

# 创建新功能分支
git checkout -b feature/新功能名称

# 提交更改
git add .
git commit -m "描述更改内容"
git push

# 拉取最新代码
git pull origin main
```

### Docker 操作

```bash
# 查看运行中的容器
docker ps

# 查看容器日志
docker logs -f 容器名

# 进入容器
docker exec -it 容器名 /bin/bash

# 清理无用数据
docker system prune -f
```

---

## 🐛 快速修复

### 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3115

# 杀死进程
kill -9 PID
```

### PostgreSQL 无法启动

```bash
# 重启 PostgreSQL 服务
brew services restart postgresql@15

# 查看日志
tail -f /Volumes/Cache/postgres/data/log/postgresql-*.log
```

### Docker 无法启动

```bash
# 清理 Docker 数据
docker system prune -a --volumes

# 重启 Docker Desktop
osascript -e 'quit app "Docker Desktop"'
open -a Docker
```

### Node 进程卡住

```bash
# 杀死所有 Node 进程
pkill node

# 重新启动
pnpm dev
```

---

## 🎯 开发端口映射

| 模式 | 端口 | 说明 |
|------|------|------|
| `dev` | 3113 | 开发服务器 |
| `dev:2` | 3114 | staging 预览 |
| `dev:3` | 3115 | production 预览 |
| `dev:4` | 3116 | testing 预览 |

---

## 📊 数据库配置

### PostgreSQL

| 配置项 | 值 |
|--------|-----|
| 主机 | localhost |
| 端口 | 5433 |
| 用户 | yyc3_dev |
| 密码 | yyc3_dev |
| 数据库 | yyc3_main |
| SSL | false |

### Redis

| 配置项 | 值 |
|--------|-----|
| 主机 | localhost |
| 端口 | 6379 |
| 密码 | redis_0379 |
| 数据库 | 0 |

---

## 🗂️ 重要路径

```
项目代码:   /Users/yanyu/Family-π³
PG数据:     /Volumes/Cache/postgres/data
Docker数据: /Volumes/Containers/docker
知识库:     /Volumes/Knowledge/yyc3
开发工具:   /Volumes/Development
```

---

## 🤖 Ollama 模型管理

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

## 📝 每日 Checklist

### 早上

- [ ] 运行 `~/yyc3-start.sh`
- [ ] 确认 PostgreSQL 运行 (`brew services list`)
- [ ] 确认 Docker 运行 (`docker info`)
- [ ] 进入项目 (`yyc3`)
- [ ] 启动 dev server (`pnpm dev`)

### 开发中

- [ ] 频繁 commit (`git commit`)
- [ ] 运行测试 (`pnpm test`)
- [ ] 检查类型 (`pnpm type-check`)
- [ ] 代码格式化 (`pnpm lint`)

### 晚上

- [ ] 提交代码 (`git push`)
- [ ] 停止 dev server (`Ctrl+C`)
- [ ] 可选：备份重要数据到 NAS
- [ ] 关闭 Docker (`osascript -e 'quit app "Docker Desktop"'`)

---

## 🔍 调试技巧

### 浏览器控制台

```javascript
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

### 网络请求

- 打开 DevTools (F12)
- Network 标签查看所有请求
- 过滤特定类型的请求 (XHR, JS, CSS)

### React 组件

- 安装 React DevTools 浏览器扩展
- 使用组件标签查看组件树
- Props 标签查看组件属性

---

## 📦 快速测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test -- src/components/agents/Navigator.test.tsx

# 测试覆盖率
pnpm test:coverage

# 类型检查
pnpm type-check
```

---

## 🚨 紧急恢复

### 数据库备份

```bash
# 备份数据库
pg_dump -p 5433 -U yyc3_dev -d yyc3_main > backup-$(date +%Y%m%d).sql

# 恢复数据库
psql -p 5433 -U yyc3_dev -d yyc3_main < backup-20260219.sql
```

### 应用回滚

```bash
# 回滚到上一个版本
git reset --hard HEAD~1

# 查看历史版本
git log --oneline

# 回滚到特定版本
git reset --hard <commit-hash>
```

---

## 📞 帮助与支持

### 文档索引

- [文档中心](../INDEX.md)
- [开发环境文档](./README.md)
- [本地部署指南](../LOCAL_SETUP_GUIDE.md)

### 相关文档

- [001-开发环境配置完成报告](./001-YYC3-AF-开发环境-开发环境配置完成报告.md)
- [002-开发操作指导流程](./002-YYC3-AF-开发环境-开发操作指导流程.md)
- [003-同步总结](./003-YYC3-AF-开发环境-同步总结.md)

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」
