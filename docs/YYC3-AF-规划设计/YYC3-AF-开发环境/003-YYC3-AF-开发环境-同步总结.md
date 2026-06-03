# 🤝 YanYuCloudCube

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

开发环境初始化文件套件全部生成完毕。 共创建14个新文件，覆盖环境变量模板、依赖管理、编辑器配置、脚本工具、文档更新五大维度，与现有的 LOCAL_SETUP_GUIDE.md（Phase 28）和 env-variables-reference.md 形成完整闭环。

新增文件清单：

.env.example 主模板：7大分组×31个变量，每个带中英文注释
.env.development 开发预设：localStorage策略 + debug日志
.env.production 生产预设：nasSqlite策略 + NAS Ollama端点
.gitignore 完整忽略规则（.env.local系列不提交）
.editorconfig 编辑器统一：2空格缩进、UTF-8、LF换行
.nvmrc Node.js 20锁定
.npmrc pnpm配置：auto-install-peers + 可选国内镜像
.vscode/extensions.json 10个推荐VS Code插件
scripts/setup.sh 一键初始化：检查环境→创建.env.local→安装依赖→验证结构→类型检查→跑测试
scripts/install-deps.sh 三模式安装：default(沙箱) / --local(本地开发自动patch react) / --ci(冻结lockfile)
scripts/verify-env.ts TypeScript环境校验器：验证31个变量格式，分组报告+CLI输出
vite-env.d.ts 新增3个 VITE_KB_* 类型声明
env-variables-reference.md 追加Phase 32/33两个章节（KB后端服务端口表+搜索权重表+开发文件矩阵+Vite加载优先级图）
本地克隆后的Quick Start：

git clone <repo> && cd yyc3-hacker-chatbot
chmod +x scripts/setup.sh && ./scripts/setup.sh

# → 自动完成全部初始化，pnpm dev 即可启动
