# YYC³ 项目结构重组方案

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

**创建日期**: 2026-01-29
**作者**: YYC³ Team
**版本**: 1.0.0
**状态**: 待实施

---

## 📊 当前问题分析

### 主要问题

1. **根目录文件过多**: 17个Markdown文档散落在根目录，缺乏组织
2. **分类不清晰**: 文档、配置、代码混合在一起
3. **子模块管理混乱**: 外部子模块与内部项目混在一起
4. **缺乏层次结构**: 没有清晰的目录层级关系
5. **命名不统一**: 中英文混用，格式不一致

### 影响范围

- 🔴 严重: 影响项目可维护性和可读性
- 🟡 警告: 降低开发效率，增加学习成本
- ✅ 合规: 需要符合YYC³标准化要求

---

## 🎯 重组目标

### 核心原则

1. **清晰分层**: 按功能和职责进行分层
2. **易于导航**: 快速找到所需文件
3. **符合标准**: 遵循YYC³五高五标五化规范
4. **可扩展性**: 支持未来功能扩展
5. **向后兼容**: 尽量减少对现有工作流的影响

---

## 📁 推荐的项目结构

```
yyc3-claude-code/
├── README.md                          # 项目主README
├── LICENSE                           # 许可证
├── .gitignore                        # Git忽略文件
├── .yyc3-config.json                 # YYC³配置文件
│
├── 📂 docs/                          # 📚 文档中心
│   ├── 📂 01-overview/               # 项目概览
│   │   ├── README.md                 # 项目介绍
│   │   ├── QUICK-REF.md              # 快速参考
│   │   └── YYC³团队标准化审核清单.md
│   │
│   ├── 📂 02-architecture/           # 架构设计
│   │   ├── AGENTIC-ECOSYSTEM-DESIGN.md
│   │   ├── AGENTIC-ECOSYSTEM-SUMMARY.md
│   │   └── NODE-PLANNING-ROADMAP.md
│   │
│   ├── 📂 03-implementation/         # 实施指南
│   │   ├── IMPLEMENTATION-GUIDE.md
│   │   ├── GITHUB-SETUP.md
│   │   ├── PERMISSION-FIX-GUIDE.md
│   │   ├── CLAUDE-TRUST-FIX.md
│   │   └── RESTART-CHECKLIST.md
│   │
│   ├── 📂 04-workflow/              # 工作流文档
│   │   ├── INTELLIGENT-PROGRAMMING-WORKFLOW.md
│   │   └── YYC3-STANDARD-WORKFLOW.md
│   │
│   ├── 📂 05-progress/              # 进度跟踪
│   │   ├── PROGRESS-TRACKER.md
│   │   ├── PROGRESS-REPORT-2026-01-29.md
│   │   ├── SESSION-RECORD.md
│   │   └── VERIFICATION-REPORT.md
│   │
│   ├── 📂 06-evaluation/            # 评估报告
│   │   ├── COMPREHENSIVE-EVALUATION-REPORT.md
│   │   ├── VERIFICATION-PHASE1.md
│   │   └── POST-RESTART-GUIDE.txt
│   │
│   └── 📂 07-projects/              # 项目分析
│       └── YYC-CUBE-ECOSYSTEM.md
│
├── 📂 src/                          # 💻 源代码
│   ├── 📂 core/                     # 核心功能
│   ├── 📂 skills/                   # 技能模块
│   │   ├── yyc3-ai-integration/
│   │   ├── yyc3-deployment-ops/
│   │   ├── yyc3-five-highs/
│   │   ├── yyc3-microservices/
│   │   └── yyc3-stack-master/
│   │
│   ├── 📂 subagents/                # 子代理
│   │   ├── configs/
│   │   ├── prompts/
│   │   └── SUBAGENTS-CONFIG.md
│   │
│   └── 📂 workflow/                 # 工作流模板
│       └── YYC3-STANDARD-WORKFLOW.md
│
├── 📂 tools/                        # 🔧 工具和脚本
│   ├── 📂 automation/               # 自动化脚本
│   │   ├── activate-mcp.sh
│   │   ├── trust-claude-dirs.sh
│   │   └── yyc3-cli.sh
│   │
│   └── 📂 mcp/                      # MCP服务器
│       ├── API-KEY-GUIDE.md
│       ├── MCP-CONFIG-GUIDE.md
│       ├── MCP-QUICK-SETUP.md
│       ├── YYC3-MCP-GUIDE.md
│       └── mcp-config.json
│
├── 📂 test/                         # 🧪 测试
│   ├── 📂 unit/                     # 单元测试
│   ├── 📂 e2e/                      # 端到端测试
│   └── README.md
│
├── 📂 projects/                     # 📦 项目实例
│   ├── 📂 ralph-loop/               # Ralph Loop项目
│   │   ├── Ralph-Loop-HaiLan-Adult-products-实操方案.md
│   │   ├── Ralph-Loop-HaiLan-Adult-products.md
│   │   ├── Ralph-Loop-Python+Flask.md
│   │   ├── Ralph-Loop-场景开发-阶段落地.md
│   │   ├── Ralph-Loop-文档闭环立项版.md
│   │   ├── Ralph-Loop-维度解析-落地指导.md
│   │   └── 文档闭环工具需求规格说明书（立项版）.md
│   │
│   └── 📂 external/                 # 外部子模块
│       ├── claude-prompts-mcp/      # Claude Prompts MCP
│       └── zai-coding-plugins/      # Zai Coding Plugins
│
├── 📂 config/                       # ⚙️ 配置文件
│   ├── .env.mcp
│   ├── .prettierrc
│   └── eslint.config.mjs
│
├── 📂 .github/                      # GitHub配置
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── 📂 .claude/                      # Claude配置
│   └── instructions.md
│
├── 📂 runtime/                      # 运行时状态
│   └── argument-history.json
│
├── 📂 public/                       # 公共资源
│
└── 📂 node_modules/                 # 依赖包
```

---

## 🔄 文件迁移映射表

### 根目录文档 → docs/

| 原路径 | 新路径 | 分类 |
|--------|--------|------|
| `README.md` | `docs/01-overview/README.md` | 概览 |
| `QUICK-REF.md` | `docs/01-overview/QUICK-REF.md` | 概览 |
| `YYC³团队标准化审核清单.md` | `docs/01-overview/YYC³团队标准化审核清单.md` | 概览 |
| `AGENTIC-ECOSYSTEM-DESIGN.md` | `docs/02-architecture/AGENTIC-ECOSYSTEM-DESIGN.md` | 架构 |
| `AGENTIC-ECOSYSTEM-SUMMARY.md` | `docs/02-architecture/AGENTIC-ECOSYSTEM-SUMMARY.md` | 架构 |
| `NODE-PLANNING-ROADMAP.md` | `docs/02-architecture/NODE-PLANNING-ROADMAP.md` | 架构 |
| `IMPLEMENTATION-GUIDE.md` | `docs/03-implementation/IMPLEMENTATION-GUIDE.md` | 实施 |
| `GITHUB-SETUP.md` | `docs/03-implementation/GITHUB-SETUP.md` | 实施 |
| `PERMISSION-FIX-GUIDE.md` | `docs/03-implementation/PERMISSION-FIX-GUIDE.md` | 实施 |
| `CLAUDE-TRUST-FIX.md` | `docs/03-implementation/CLAUDE-TRUST-FIX.md` | 实施 |
| `RESTART-CHECKLIST.md` | `docs/03-implementation/RESTART-CHECKLIST.md` | 实施 |
| `INTELLIGENT-PROGRAMMING-WORKFLOW.md` | `docs/04-workflow/INTELLIGENT-PROGRAMMING-WORKFLOW.md` | 工作流 |
| `workflow-templates/YYC3-STANDARD-WORKFLOW.md` | `docs/04-workflow/YYC3-STANDARD-WORKFLOW.md` | 工作流 |
| `PROGRESS-TRACKER.md` | `docs/05-progress/PROGRESS-TRACKER.md` | 进度 |
| `PROGRESS-REPORT-2026-01-29.md` | `docs/05-progress/PROGRESS-REPORT-2026-01-29.md` | 进度 |
| `SESSION-RECORD.md` | `docs/05-progress/SESSION-RECORD.md` | 进度 |
| `VERIFICATION-REPORT.md` | `docs/05-progress/VERIFICATION-REPORT.md` | 进度 |
| `COMPREHENSIVE-EVALUATION-REPORT.md` | `docs/06-evaluation/COMPREHENSIVE-EVALUATION-REPORT.md` | 评估 |
| `VERIFICATION-PHASE1.md` | `docs/06-evaluation/VERIFICATION-PHASE1.md` | 评估 |
| `POST-RESTART-GUIDE.txt` | `docs/06-evaluation/POST-RESTART-GUIDE.txt` | 评估 |
| `projects-analysis/YYC-CUBE-ECOSYSTEM.md` | `docs/07-projects/YYC-CUBE-ECOSYSTEM.md` | 项目 |

### 工具和脚本 → tools/

| 原路径 | 新路径 | 分类 |
|--------|--------|------|
| `automation-scripts/` | `tools/automation/` | 自动化 |
| `mcp-servers/` | `tools/mcp/` | MCP |

### 项目实例 → projects/

| 原路径 | 新路径 | 分类 |
|--------|--------|------|
| `Ralph-Loop/` | `projects/ralph-loop/` | 项目 |
| `claude-prompts-mcp/` | `projects/external/claude-prompts-mcp/` | 外部 |
| `zai-coding-plugins/` | `projects/external/zai-coding-plugins/` | 外部 |

### 源代码 → src/

| 原路径 | 新路径 | 分类 |
|--------|--------|------|
| `skills/` | `src/skills/` | 技能 |
| `subagents/` | `src/subagents/` | 子代理 |
| `workflow-templates/` | `src/workflow/` | 工作流 |

### 运行时状态 → runtime/

| 原路径 | 新路径 | 分类 |
|--------|--------|------|
| `runtime-state/` | `runtime/` | 运行时 |

### 配置文件 → config/

| 原路径 | 新路径 | 分类 |
|--------|--------|------|
| `.env.mcp` | `config/.env.mcp` | 配置 |
| `.prettierrc` | `config/.prettierrc` | 配置 |
| `eslint.config.mjs` | `config/eslint.config.mjs` | 配置 |

---

## 📋 实施步骤

### 阶段1: 准备工作 (30分钟)

1. **备份当前项目**
   ```bash
   cp -r /Users/yanyu/yyc3-claude /Users/yanyu/yyc3-claude-backup
   ```

2. **创建新目录结构**
   ```bash
   cd /Users/yanyu/yyc3-claude
   mkdir -p docs/{01-overview,02-architecture,03-implementation,04-workflow,05-progress,06-evaluation,07-projects}
   mkdir -p src/{core,skills,subagents,workflow}
   mkdir -p tools/{automation,mcp}
   mkdir -p projects/{ralph-loop,external}
   mkdir -p config
   ```

### 阶段2: 文件迁移 (1小时)

3. **迁移文档文件**
   ```bash
   # 概览文档
   mv QUICK-REF.md docs/01-overview/
   mv "YYC³团队标准化审核清单.md" docs/01-overview/

   # 架构文档
   mv AGENTIC-ECOSYSTEM-DESIGN.md docs/02-architecture/
   mv AGENTIC-ECOSYSTEM-SUMMARY.md docs/02-architecture/
   mv NODE-PLANNING-ROADMAP.md docs/02-architecture/

   # 实施文档
   mv IMPLEMENTATION-GUIDE.md docs/03-implementation/
   mv GITHUB-SETUP.md docs/03-implementation/
   mv PERMISSION-FIX-GUIDE.md docs/03-implementation/
   mv CLAUDE-TRUST-FIX.md docs/03-implementation/
   mv RESTART-CHECKLIST.md docs/03-implementation/

   # 工作流文档
   mv INTELLIGENT-PROGRAMMING-WORKFLOW.md docs/04-workflow/
   mv workflow-templates/YYC3-STANDARD-WORKFLOW.md docs/04-workflow/

   # 进度文档
   mv PROGRESS-TRACKER.md docs/05-progress/
   mv PROGRESS-REPORT-2026-01-29.md docs/05-progress/
   mv SESSION-RECORD.md docs/05-progress/
   mv VERIFICATION-REPORT.md docs/05-progress/

   # 评估文档
   mv COMPREHENSIVE-EVALUATION-REPORT.md docs/06-evaluation/
   mv VERIFICATION-PHASE1.md docs/06-evaluation/
   mv POST-RESTART-GUIDE.txt docs/06-evaluation/

   # 项目文档
   mv projects-analysis/YYC-CUBE-ECOSYSTEM.md docs/07-projects/
   ```

4. **迁移工具和脚本**
   ```bash
   mv automation-scripts tools/automation
   mv mcp-servers tools/mcp
   ```

5. **迁移项目实例**
   ```bash
   mv Ralph-Loop projects/ralph-loop
   mv claude-prompts-mcp projects/external/
   mv zai-coding-plugins projects/external/
   ```

6. **迁移源代码**
   ```bash
   mv skills src/skills
   mv subagents src/subagents
   mv workflow-templates src/workflow
   ```

7. **迁移配置文件**
   ```bash
   mv .env.mcp config/
   mv .prettierrc config/
   mv eslint.config.mjs config/
   ```

8. **迁移运行时状态**
   ```bash
   mv runtime-state runtime
   ```

### 阶段3: 更新引用 (30分钟)

9. **更新README.md中的链接**
   - 更新所有文档链接指向新路径
   - 更新目录结构说明

10. **更新CI/CD配置**
    - 更新 `.github/workflows/ci.yml` 中的路径
    - 更新 `.github/workflows/deploy.yml` 中的路径

11. **更新配置文件**
    - 更新 `.yyc3-config.json` 中的路径引用
    - 更新其他配置文件中的路径

### 阶段4: 验证和测试 (30分钟)

12. **验证文件完整性**
   ```bash
   # 检查所有文件是否迁移成功
   find . -name "*.md" -type f | sort
   ```

13. **运行测试**
   ```bash
   npm test
   ```

14. **检查CI/CD**
   - 提交更改并观察CI/CD是否正常运行

### 阶段5: 清理和提交 (15分钟)

15. **清理空目录**
   ```bash
   find . -type d -empty -delete
   ```

16. **提交更改**
   ```bash
   git add .
   git commit -m "refactor: 重组项目结构，提升可维护性

- 将文档按功能分类到docs/目录
- 将工具脚本整理到tools/目录
- 将项目实例整理到projects/目录
- 将源代码整理到src/目录
- 将配置文件整理到config/目录
- 更新所有路径引用"
   git push origin main
   ```

---

## ⚠️ 注意事项

### 风险评估

1. **路径引用失效**: 需要更新所有文档中的相对路径引用
2. **CI/CD中断**: 需要更新GitHub Actions中的路径
3. **子模块问题**: 外部子模块的路径变更可能影响其正常工作
4. **配置文件路径**: 需要更新所有配置文件中的路径引用

### 缓解措施

1. **备份**: 在开始前创建完整备份
2. **逐步迁移**: 分阶段进行，每阶段验证
3. **更新引用**: 及时更新所有路径引用
4. **测试验证**: 每个阶段完成后进行测试

### 回滚计划

如果重组过程中出现问题，可以快速回滚：

```bash
# 删除当前项目
rm -rf /Users/yanyu/yyc3-claude

# 恢复备份
cp -r /Users/yanyu/yyc3-claude-backup /Users/yanyu/yyc3-claude
```

---

## 📊 预期收益

### 短期收益 (1-2周)

- ✅ 提高项目可读性
- ✅ 加快文件查找速度
- ✅ 减少开发困惑
- ✅ 提升团队协作效率

### 长期收益 (1-3个月)

- ✅ 降低维护成本
- ✅ 提高代码质量
- ✅ 加速新成员入职
- ✅ 支持项目扩展

---

## 🎯 下一步行动

1. **审核本方案**: 确认重组方案符合需求
2. **制定时间表**: 安排具体的实施时间
3. **分配任务**: 如果是团队项目，分配迁移任务
4. **开始实施**: 按照步骤执行重组
5. **持续优化**: 根据使用反馈持续优化结构

---

## 📞 联系方式

如有问题或建议，请联系：

- **Email**: admin@0379.email
- **GitHub**: https://github.com/YYC-Cube/yyc3-claude-code

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
