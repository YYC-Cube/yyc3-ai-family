# YYC³ CI/CD与监控指南

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future**
> 万象归元于云枢 | 深栈智启新纪元
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence*

---

## 概述

本文档详细说明YYC³ AI-Family项目的CI/CD流程、告警通知系统和性能监控体系。通过完善的自动化流程和监控机制，确保代码质量和系统稳定性。

### 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | 1.0.0 |
| **创建日期** | 2026-02-25 |
| **最后更新** | 2026-02-25 |
| **维护者** | YYC³ Team |
| **相关文档** | [审核报告](file:///Users/yanyu/Family-π³/docs/YYC3-AF-审核报告/262-YYC3-AF-审核报告-数据库同步脚本审查.md) |

---

## 一、CI/CD流程

### 1.1 工作流概览

YYC³ CI/CD流程使用GitHub Actions实现自动化构建、测试和部署。

**工作流文件**: [.github/workflows/ci-cd.yml](file:///Users/yanyu/Family-π³/.github/workflows/ci-cd.yml)

**触发条件**:
- 推送到 `main` 或 `develop` 分支
- 创建Pull Request
- 手动触发 (workflow_dispatch)

### 1.2 CI/CD架构

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 代码质量检查  │  │ 数据库测试   │  │ 性能监控     │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  集成测试    │
                  └──────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  部署       │
                  └──────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  告警通知    │
                  └──────────────┘
```

### 1.3 CI/CD作业详解

#### 作业1: 代码质量检查 (quality-check)

**目的**: 确保代码质量和类型安全

**检查项目**:
- ✅ ESLint代码规范检查
- ✅ TypeScript类型检查
- ✅ npm安全审计

**执行命令**:
```bash
pnpm run lint
pnpm run type-check
npm audit --production
```

**失败条件**: 任何一项检查失败则终止流程

---

#### 作业2: 数据库同步测试 (database-sync-test)

**目的**: 验证数据库同步功能

**依赖**: quality-check

**服务**: PostgreSQL 16 (Docker容器)

**测试项目**:
- ✅ 数据库健康检查
- ✅ 错误恢复机制测试
- ✅ 日志记录功能测试
- ✅ 回滚流程测试

**测试脚本**:
- [scripts/db-health-check.sh](file:///Users/yanyu/Family-π³/scripts/db-health-check.sh)
- [scripts/test-error-recovery.sh](file:///Users/yanyu/Family-π³/scripts/test-error-recovery.sh)
- [scripts/test-logging.sh](file:///Users/yanyu/Family-π³/scripts/test-logging.sh)
- [scripts/test-rollback.sh](file:///Users/yanyu/Family-π³/scripts/test-rollback.sh)

**输出**: 测试日志artifacts (保留7天)

---

#### 作业3: 性能监控测试 (performance-monitor)

**目的**: 收集系统性能指标

**依赖**: quality-check

**监控指标**:
- ✅ CPU使用率
- ✅ 内存使用率
- ✅ 磁盘使用率
- ✅ 进程数量
- ✅ 服务状态
- ✅ 数据库连接数
- ✅ API响应时间

**测试脚本**: [scripts/performance-monitor.sh](file:///Users/yanyu/Family-π³/scripts/performance-monitor.sh)

**输出**: 性能指标artifacts (保留30天)

---

#### 作业4: 集成测试 (integration-test)

**目的**: 验证系统整体集成

**依赖**: database-sync-test

**服务**: PostgreSQL 16 (Docker容器)

**测试项目**:
- ✅ 集成测试套件
- ✅ 综合测试

**测试脚本**:
- [scripts/test-comprehensive.sh](file:///Users/yanyu/Family-π³/scripts/test-comprehensive.sh)

---

#### 作业5: 性能基准测试 (performance-benchmark)

**目的**: 建立性能基准线，对比性能变化

**依赖**: quality-check

**服务**: PostgreSQL 16 (Docker容器)

**测试项目**:
- ✅ 数据库查询性能
- ✅ API响应时间
- ✅ 系统资源使用
- ✅ 磁盘I/O性能
- ✅ 网络延迟

**测试脚本**: [scripts/performance-benchmark.sh](file:///Users/yanyu/Family-π³/scripts/performance-benchmark.sh)

**输出**: 基准测试结果artifacts (保留90天)

---

#### 作业6: 告警通知 (notify)

**目的**: 发送CI/CD执行结果通知

**依赖**: 所有测试作业

**触发条件**: always() (无论成功失败都执行)

**通知类型**:
- ✅ 成功通知 (所有测试通过)
- ✅ 失败通知 (任一测试失败)

**通知脚本**: [scripts/send-alert.sh](file:///Users/yanyu/Family-π³/scripts/send-alert.sh)

**收件人**: admin@0379.email

---

#### 作业7: 部署 (deploy)

**目的**: 自动部署到生产环境

**依赖**: quality-check, database-sync-test, integration-test

**触发条件**:
- 推送到 `main` 分支
- 所有依赖作业成功

**部署流程**:
1. 检出代码
2. 执行部署脚本
3. 发送部署通知

---

### 1.4 环境变量配置

CI/CD流程需要以下环境变量：

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|--------|
| `NODE_VERSION` | Node.js版本 | 否 | 20 |
| `PNPM_VERSION` | pnpm版本 | 否 | 9 |
| `DB_HOST` | 数据库主机 | 是 | localhost |
| `DB_PORT` | 数据库端口 | 是 | 5433 |
| `DB_NAME` | 数据库名称 | 是 | yyc3_test |
| `DB_USER` | 数据库用户 | 是 | yyc3_test |
| `DB_PASSWORD` | 数据库密码 | 是 | *** |
| `SMTP_SERVER` | SMTP服务器 | 否 | smtp.gmail.com |
| `SMTP_PORT` | SMTP端口 | 否 | 587 |
| `SMTP_USER` | SMTP用户名 | 否 | admin@0379.email |
| `SMTP_PASSWORD` | SMTP密码 | 否 | *** |
| `ALERT_EMAIL` | 告警收件人 | 否 | admin@0379.email |

**配置方法**:
1. GitHub仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加上述环境变量

---

## 二、告警通知系统

### 2.1 告警脚本

**脚本文件**: [scripts/send-alert.sh](file:///Users/yanyu/Family-π³/scripts/send-alert.sh)

**功能特性**:
- ✅ 支持多种告警类型
- ✅ HTML格式邮件
- ✅ 多种邮件发送方式
- ✅ 告警日志记录
- ✅ 命令行参数支持

### 2.2 告警类型

| 类型 | 图标 | 颜色 | 用途 |
|------|------|------|------|
| `success` | ✅ | green | 成功通知 |
| `failure` | ❌ | red | 失败告警 |
| `warning` | ⚠️ | orange | 警告通知 |
| `critical` | 🚨 | red | 严重告警 |
| `info` | ℹ️ | blue | 信息通知 |

### 2.3 使用方法

#### 基本用法

```bash
# 发送成功通知
bash scripts/send-alert.sh \
  --type success \
  --subject "部署成功" \
  --message "应用已成功部署到生产环境"

# 发送失败告警
bash scripts/send-alert.sh \
  --type failure \
  --subject "测试失败" \
  --message "部分测试失败，请检查日志"

# 发送警告通知
bash scripts/send-alert.sh \
  --type warning \
  --subject "性能告警" \
  --message "CPU使用率超过80%"
```

#### 高级用法

```bash
# 指定收件人
bash scripts/send-alert.sh \
  --type critical \
  --subject "严重错误" \
  --message "数据库连接失败" \
  --email admin@0379.email

# 从文件读取消息
bash scripts/send-alert.sh \
  --type info \
  --subject "系统报告" \
  --file /path/to/report.txt
```

#### 环境变量配置

```bash
# 配置默认收件人
export ALERT_EMAIL="admin@0379.email"

# 配置SMTP
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASSWORD="your-password"

# 发送告警（使用环境变量）
bash scripts/send-alert.sh \
  --type success \
  --subject "测试" \
  --message "测试消息"
```

### 2.4 邮件发送方式

脚本支持多种邮件发送方式，按优先级自动选择：

1. **sendmail** (优先级最高)
   ```bash
   # 系统自带sendmail
   sendmail -t
   ```

2. **mail命令**
   ```bash
   # 系统自带mail命令
   mail -s "Subject" recipient@example.com
   ```

3. **mutt**
   ```bash
   # mutt邮件客户端
   mutt -s "Subject" recipient@example.com
   ```

4. **SMTP** (需要配置)
   ```bash
   # 使用curl通过SMTP发送
   curl --url "smtp://server:port" \
     --user "user:password" \
     --mail-from "sender@example.com" \
     --mail-rcpt "recipient@example.com" \
     --upload-file email.txt
   ```

### 2.5 告警日志

所有告警都会记录到日志文件：

**默认日志文件**: `/var/log/yyc3/alerts.log`

**日志格式**:
```
[2026-02-25 10:30:00] [success] 部署成功
应用已成功部署到生产环境

[2026-02-25 10:35:00] [failure] 测试失败
部分测试失败，请检查日志
```

**查看日志**:
```bash
# 查看最近10条告警
tail -n 10 /var/log/yyc3/alerts.log

# 搜索失败告警
grep "failure" /var/log/yyc3/alerts.log

# 搜索今天的告警
grep "$(date +%Y-%m-%d)" /var/log/yyc3/alerts.log
```

---

## 三、性能监控体系

### 3.1 性能监控脚本

**脚本文件**: [scripts/performance-monitor.sh](file:///Users/yanyu/Family-π³/scripts/performance-monitor.sh)

**监控指标**:

#### 系统指标

| 指标 | 说明 | 阈值 |
|------|------|------|
| CPU使用率 | 系统CPU占用百分比 | >80% 告警 |
| 内存使用率 | 系统内存占用百分比 | >85% 告警 |
| 磁盘使用率 | 磁盘空间占用百分比 | >90% 告警 |
| 进程数量 | 系统运行进程总数 | - |

#### 服务指标

| 指标 | 说明 | 端口 |
|------|------|------|
| 前端服务状态 | 端口3200服务状态 | 3200 |
| 后端服务状态 | 端口3001服务状态 | 3001 |
| Ollama服务状态 | 端口11434服务状态 | 11434 |

#### 数据库指标

| 指标 | 说明 |
|------|------|
| 活跃连接数 | PostgreSQL活跃连接数 |
| 数据库大小 | 数据库存储占用 |

#### 应用指标

| 指标 | 说明 |
|------|------|
| API响应时间 | API请求响应时间 |

### 3.2 使用方法

#### 手动运行

```bash
# 运行性能监控
bash scripts/performance-monitor.sh
```

#### 定时任务

```bash
# 每小时运行一次
0 * * * * /Users/yanyu/Family-π³/scripts/performance-monitor.sh

# 每30分钟运行一次
*/30 * * * * /Users/yanyu/Family-π³/scripts/performance-monitor.sh
```

### 3.3 输出格式

监控数据以JSON格式输出：

```json
{
  "timestamp": "2026-02-25 10:30:00",
  "system": {
    "cpu_usage": 25.5,
    "memory_usage": 68.2,
    "disk_usage": 45.3,
    "process_count": 156
  },
  "services": {
    "frontend": {
      "port": 3200,
      "status": "running"
    },
    "backend": {
      "port": 3001,
      "status": "running"
    },
    "ollama": {
      "port": 11434,
      "status": "running"
    }
  },
  "database": {
    "connections": 5,
    "size": "2.5G"
  },
  "application": {
    "api_response_time": "45ms"
  }
}
```

### 3.4 性能告警

当指标超过阈值时，自动发送告警：

```bash
# 示例：CPU使用率超过80%
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
  bash scripts/send-alert.sh \
    --type warning \
    --subject "性能告警" \
    --message "CPU使用率: ${cpu_usage}%"
fi
```

---

## 四、性能基准测试

### 4.1 基准测试脚本

**脚本文件**: [scripts/performance-benchmark.sh](file:///Users/yanyu/Family-π³/scripts/performance-benchmark.sh)

**测试项目**:

#### 数据库基准测试

| 测试项 | 说明 | 迭代次数 |
|--------|------|-----------|
| 简单查询 | `SELECT 1` | 100次 |
| 复杂查询 | `COUNT(*) FROM tables` | 50次 |
| 连接建立 | 数据库连接时间 | 20次 |
| 批量插入 | 插入1000条记录 | 10次 |

#### API基准测试

| 测试项 | 说明 | 迭代次数 |
|--------|------|-----------|
| 健康检查 | `/api/health` | 50次 |
| 数据库状态 | `/api/db/status` | 30次 |
| 静态资源 | 首页加载 | 20次 |

#### 系统基准测试

| 测试项 | 说明 |
|--------|------|
| CPU性能 | 数学计算测试 |
| 磁盘I/O | 文件读写测试 |
| 网络延迟 | ping测试 |
| 系统资源 | CPU/内存使用率 |

### 4.2 使用方法

#### 运行基准测试

```bash
# 运行完整基准测试
bash scripts/performance-benchmark.sh

# 指定数据库连接
DB_HOST=localhost DB_PORT=5433 DB_NAME=yyc3_test \
bash scripts/performance-benchmark.sh
```

#### 定时任务

```bash
# 每周一凌晨2点运行
0 2 * * 1 /Users/yanyu/Family-π³/scripts/performance-benchmark.sh

# 每月1号凌晨2点运行
0 2 1 * * /Users/yanyu/Family-π³/scripts/performance-benchmark.sh
```

### 4.3 基准线管理

#### 创建基准线

首次运行或重大变更后，创建基准线：

```bash
bash scripts/performance-benchmark.sh
# 提示时选择 "yes" 将当前结果设为基准线
```

#### 对比基准线

后续运行会自动与基准线对比：

```bash
bash scripts/performance-benchmark.sh
# 自动显示与基准线的差异
```

#### 更新基准线

当性能有显著改善时，更新基准线：

```bash
# 删除旧基准线
rm /tmp/yyc3-benchmark/results/baseline.json

# 重新运行测试
bash scripts/performance-benchmark.sh
# 选择 "yes" 创建新基准线
```

### 4.4 历史记录

基准测试结果会自动保存到历史目录：

**历史目录**: `/tmp/yyc3-benchmark/results/history`

**保留策略**: 最近30天的历史记录

**查看历史**:
```bash
# 列出所有历史记录
ls -lth /tmp/yyc3-benchmark/results/history/

# 查看特定日期的结果
cat /tmp/yyc3-benchmark/results/history/current-20260225-103000.json
```

---

## 五、日志轮转机制

### 5.1 日志轮转脚本

**脚本文件**: [scripts/log-rotation.sh](file:///Users/yanyu/Family-π³/scripts/log-rotation.sh)

**功能特性**:
- ✅ 自动压缩旧日志
- ✅ 自动删除过期日志
- ✅ 清理超大日志
- ✅ 限制文件数量
- ✅ 生成日志摘要

### 5.2 配置参数

| 参数 | 默认值 | 说明 |
|------|---------|------|
| `LOG_DIR` | `/var/log/yyc3` | 日志目录 |
| `MAX_SIZE_MB` | `100` | 最大文件大小（MB） |
| `MAX_FILES` | `10` | 最大文件数量 |
| `COMPRESS_DAYS` | `7` | 压缩天数 |
| `DELETE_DAYS` | `30` | 删除天数 |

### 5.3 使用方法

#### 手动运行

```bash
# 使用默认配置
bash scripts/log-rotation.sh

# 自定义配置
LOG_DIR=/custom/logs MAX_SIZE_MB=50 \
bash scripts/log-rotation.sh
```

#### 定时任务

```bash
# 每天凌晨2点运行
0 2 * * * /Users/yanyu/Family-π³/scripts/log-rotation.sh

# 每周日凌晨3点运行
0 3 * * 0 /Users/yanyu/Family-π³/scripts/log-rotation.sh
```

### 5.4 日志摘要

每次运行后生成日志摘要：

```
日志摘要:
----------------------------------------
   活跃日志文件: 5
   压缩日志文件: 15
   总大小: 2.5G

   最大的5个日志文件:
     application.log - 512MB
     error.log - 256MB
     access.log - 128MB
     db-sync.log - 64MB
     api.log - 32MB
```

---

## 六、集成与部署

### 6.1 CI/CD集成

#### GitHub Actions配置

1. 创建GitHub仓库
2. 添加环境变量 (Settings → Secrets)
3. 推送代码到 `main` 分支
4. 自动触发CI/CD流程

#### 环境变量清单

必需的环境变量：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5433
DB_NAME=yyc3_test
DB_USER=yyc3_test
DB_PASSWORD=***

# SMTP配置 (用于告警通知)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=***

# 告警配置
ALERT_EMAIL=admin@0379.email
```

### 6.2 本地测试

#### 测试CI/CD脚本

```bash
# 测试代码质量检查
pnpm run lint
pnpm run type-check
npm audit --production

# 测试数据库同步
bash scripts/db-health-check.sh
bash scripts/test-error-recovery.sh
bash scripts/test-logging.sh
bash scripts/test-rollback.sh

# 测试性能监控
bash scripts/performance-monitor.sh

# 测试性能基准
bash scripts/performance-benchmark.sh

# 测试告警通知
bash scripts/send-alert.sh \
  --type success \
  --subject "测试" \
  --message "测试消息"
```

### 6.3 生产部署

#### 部署前检查清单

- [ ] 所有CI/CD测试通过
- [ ] 性能基准测试完成
- [ ] 告警通知配置完成
- [ ] 环境变量配置正确
- [ ] 日志轮转配置完成
- [ ] 监控告警测试通过

#### 部署流程

1. **代码合并**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout main
   git merge develop
   ```

2. **推送到main**
   ```bash
   git push origin main
   ```

3. **CI/CD自动执行**
   - 代码质量检查
   - 数据库同步测试
   - 性能监控测试
   - 集成测试
   - 性能基准测试
   - 自动部署

4. **接收通知**
   - 成功: admin@0379.email
   - 失败: admin@0379.email

---

## 七、监控仪表板

### 7.1 监控指标汇总

| 类别 | 指标 | 监控频率 | 告警阈值 |
|------|------|-----------|---------|
| **系统** | CPU使用率 | 每小时 | >80% |
| | 内存使用率 | 每小时 | >85% |
| | 磁盘使用率 | 每小时 | >90% |
| **服务** | 前端服务 | 每小时 | 停止 |
| | 后端服务 | 每小时 | 停止 |
| | Ollama服务 | 每小时 | 停止 |
| **数据库** | 活跃连接数 | 每小时 | >100 |
| | 数据库大小 | 每天 | >10G |
| **应用** | API响应时间 | 每小时 | >500ms |

### 7.2 告警策略

#### 告警级别

| 级别 | 类型 | 响应时间 | 通知方式 |
|------|------|---------|---------|
| P0 | critical | 立即 | 邮件 + 短信 |
| P1 | failure | 5分钟内 | 邮件 |
| P2 | warning | 30分钟内 | 邮件 |
| P3 | info | 每日汇总 | 邮件 |

#### 告警升级

```
P0告警 → 立即通知 → 5分钟未处理 → 升级到团队
P1告警 → 5分钟内通知 → 30分钟未处理 → 升级到负责人
P2告警 → 30分钟内通知 → 1小时未处理 → 记录日志
```

---

## 八、最佳实践

### 8.1 CI/CD最佳实践

1. **代码质量**
   - 每次提交前运行lint
   - 定期更新依赖
   - 保持测试覆盖率 >80%

2. **测试策略**
   - 单元测试: 快速反馈
   - 集成测试: 验证集成
   - E2E测试: 端到端验证

3. **部署策略**
   - 蓝绿部署: 零停机
   - 金丝雀发布: 逐步推广
   - 回滚准备: 快速恢复

### 8.2 监控最佳实践

1. **监控指标**
   - 关注关键指标
   - 设置合理阈值
   - 定期审查告警

2. **性能优化**
   - 建立基准线
   - 定期对比分析
   - 持续优化改进

3. **日志管理**
   - 日志轮转
   - 日志聚合
   - 日志分析

### 8.3 告警最佳实践

1. **告警设计**
   - 明确告警级别
   - 提供上下文信息
   - 包含处理建议

2. **告警响应**
   - 及时响应
   - 记录处理过程
   - 复盘改进

3. **告警优化**
   - 减少误报
   - 提高准确率
   - 持续调整阈值

---

## 九、故障排查

### 9.1 CI/CD故障

#### 问题: 测试失败

**排查步骤**:
1. 查看GitHub Actions日志
2. 下载测试artifacts
3. 本地复现问题
4. 修复并重新提交

#### 问题: 部署失败

**排查步骤**:
1. 检查环境变量配置
2. 验证部署脚本权限
3. 检查目标服务器状态
4. 查看部署日志

### 9.2 监控故障

#### 问题: 告警未发送

**排查步骤**:
1. 检查SMTP配置
2. 验证邮件服务状态
3. 查看告警日志
4. 测试邮件发送

#### 问题: 性能告警频繁

**排查步骤**:
1. 分析性能数据
2. 检查系统资源
3. 优化应用性能
4. 调整告警阈值

---

## 十、附录

### 10.1 相关文档

- [审核报告](file:///Users/yanyu/Family-π³/docs/YYC3-AF-审核报告/262-YYC3-AF-审核报告-数据库同步脚本审查.md)
- [测试验证报告](file:///Users/yanyu/Family-π³/docs/YYC3-AF-审核报告/263-YYC3-AF-审核报告-测试验证报告.md)
- [对齐检查报告](file:///Users/yanyu/Family-π³/docs/YYC3-AF-审核报告/264-YYC3-AF-审核报告-对齐检查报告.md)

### 10.2 脚本清单

| 脚本 | 用途 | 文档 |
|------|------|------|
| [ci-cd.yml](file:///Users/yanyu/Family-π³/.github/workflows/ci-cd.yml) | CI/CD工作流 | 本文档 |
| [send-alert.sh](file:///Users/yanyu/Family-π³/scripts/send-alert.sh) | 告警通知 | 本文档 |
| [performance-monitor.sh](file:///Users/yanyu/Family-π³/scripts/performance-monitor.sh) | 性能监控 | 本文档 |
| [performance-benchmark.sh](file:///Users/yanyu/Family-π³/scripts/performance-benchmark.sh) | 性能基准测试 | 本文档 |
| [log-rotation.sh](file:///Users/yanyu/Family-π³/scripts/log-rotation.sh) | 日志轮转 | 本文档 |

### 10.3 联系方式

- **YYC³ Team**: admin@0379.email
- **项目仓库**: https://github.com/YanYuCloudCube/Family-π³
- **问题反馈**: GitHub Issues

---

<div align="center">

**YYC³ AI-Family**

*言启象限 | 语枢未来*

**质量第一 · 安全至上 · 持续改进**

---

*文档版本: 1.0.0*
*最后更新: 2026-02-25*
*维护者: YYC³ Team*

</div>