---
@file: README.md
@description: YYC3 AI-Family Scripts Documentation Index | YYC3 AI-Family 脚本文档索引
@author: YanYuCloudCube Team
@version: 1.0.0
@created: 2026-02-25
@updated: 2026-02-25
@status: active
@tags: scripts, documentation, index, automation
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ AI-Family Scripts Documentation | 脚本文档

## Overview | 概述

This directory contains automation scripts for the YYC³ AI-Family project, covering deployment, testing, monitoring, and database operations.

本目录包含 YYC³ AI-Family 项目的自动化脚本，涵盖部署、测试、监控和数据库操作。

---

## Script Categories | 脚本分类

### 1. Deployment Scripts | 部署脚本

| Script | Description (EN) | 描述 (中文) | Usage |
|--------|-----------------|------------|-------|
| `integrated-deploy.sh` | One-click full-stack deployment | 一键全栈部署脚本 | `bash scripts/integrated-deploy.sh [start\|stop\|status\|health]` |
| `deploy-backend-api.sh` | Backend API deployment | 后端 API 部署脚本 | `bash scripts/deploy-backend-api.sh` |
| `deploy-nas-services.sh` | NAS services deployment | NAS 服务部署 | `bash scripts/deploy-nas-services.sh` |
| `deploy-authorized-models.sh` | Authorized model deployment | 授权模型部署 | `bash scripts/deploy-authorized-models.sh` |

### 2. Testing Scripts | 测试脚本

| Script | Description (EN) | 描述 (中文) | Usage |
|--------|-----------------|------------|-------|
| `test-comprehensive.sh` | Comprehensive test suite | 综合测试套件 | `bash scripts/test-comprehensive.sh` |
| `test-modules.sh` | Module-specific tests | 模块测试 | `bash scripts/test-modules.sh` |
| `test-agents.sh` | AI agent tests | AI 智能体测试 | `bash scripts/test-agents.sh` |
| `test-nine-layers.sh` | Nine-layer architecture tests | 九层架构测试 | `bash scripts/test-nine-layers.sh` |
| `test-error-recovery.sh` | Error recovery tests | 错误恢复测试 | `bash scripts/test-error-recovery.sh` |
| `test-rollback.sh` | Rollback process tests | 回滚流程测试 | `bash scripts/test-rollback.sh` |
| `test-logging.sh` | Logging system tests | 日志系统测试 | `bash scripts/test-logging.sh` |
| `test-infra-connection.cjs` | Infrastructure connection test | 基础设施连接测试 | `node scripts/test-infra-connection.cjs` |

### 3. Performance Scripts | 性能脚本

| Script | Description (EN) | 描述 (中文) | Usage |
|--------|-----------------|------------|-------|
| `performance-monitor.sh` | Real-time performance monitoring | 实时性能监控 | `bash scripts/performance-monitor.sh` |
| `performance-benchmark.sh` | Performance benchmark testing | 性能基准测试 | `bash scripts/performance-benchmark.sh` |
| `startup-test.sh` | Startup verification tests | 启动验证测试 | `bash scripts/startup-test.sh` |

### 4. Database Scripts | 数据库脚本

| Script | Description (EN) | 描述 (中文) | Usage |
|--------|-----------------|------------|-------|
| `db-health-check.sh` | Database health check | 数据库健康检查 | `bash scripts/db-health-check.sh` |
| `db-smart-sync.sh` | Smart database synchronization | 智能数据库同步 | `bash scripts/db-smart-sync.sh` |
| `db-sync-precheck.sh` | Pre-sync validation | 同步前检查 | `bash scripts/db-sync-precheck.sh` |
| `db-sync-verify.sh` | Post-sync verification | 同步后验证 | `bash scripts/db-sync-verify.sh` |

### 5. Ollama Scripts | Ollama 脚本

| Script | Description (EN) | 描述 (中文) | Usage |
|--------|-----------------|------------|-------|
| `ollama-optimization.sh` | Ollama optimization configuration | Ollama 优化配置 | `bash scripts/ollama-optimization.sh` |
| `ollama-optimized-start.sh` | Optimized Ollama startup | 优化启动脚本 | `bash scripts/ollama-optimized-start.sh` |
| `ollama-optimization.env` | Ollama environment configuration | 环境配置文件 | Source this file |

### 6. Utility Scripts | 工具脚本

| Script | Description (EN) | 描述 (中文) | Usage |
|--------|-----------------|------------|-------|
| `setup.sh` | Initial project setup | 项目初始化设置 | `bash scripts/setup.sh` |
| `install-deps.sh` | Dependency installation | 依赖安装 | `bash scripts/install-deps.sh` |
| `pre-commit-check.sh` | Pre-commit validation | 提交前检查 | `bash scripts/pre-commit-check.sh` |
| `log-rotation.sh` | Log rotation management | 日志轮转管理 | `bash scripts/log-rotation.sh` |
| `send-alert.sh` | Alert notification sender | 告警通知发送 | `bash scripts/send-alert.sh --type error` |
| `verify-env.ts` | Environment verification | 环境验证 | `npx tsx scripts/verify-env.ts` |

---

## Port Configuration | 端口配置

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3133 | Vite Dev Server |
| Backend | 3177 | Express API Server |
| Ollama | 11434 | LLM Inference Server |
| PostgreSQL | 5433 | Database Server |

---

## Quick Start | 快速开始

### Full Deployment | 完整部署

```bash
# Start all services | 启动所有服务
bash scripts/integrated-deploy.sh start

# Check status | 检查状态
bash scripts/integrated-deploy.sh status

# Health check | 健康检查
bash scripts/integrated-deploy.sh health

# Stop all services | 停止所有服务
bash scripts/integrated-deploy.sh stop
```

### Run Tests | 运行测试

```bash
# Comprehensive tests | 综合测试
bash scripts/test-comprehensive.sh

# Performance benchmark | 性能基准
bash scripts/performance-benchmark.sh

# Module tests | 模块测试
bash scripts/test-modules.sh
```

### Database Operations | 数据库操作

```bash
# Health check | 健康检查
bash scripts/db-health-check.sh

# Sync database | 同步数据库
bash scripts/db-smart-sync.sh
```

---

## Error Handling | 错误处理

### Common Errors | 常见错误

| Error | Solution (EN) | 解决方案 (中文) |
|-------|--------------|----------------|
| Port already in use | Kill existing process or change port | 终止现有进程或更改端口 |
| Database connection failed | Check PostgreSQL service status | 检查 PostgreSQL 服务状态 |
| Ollama not responding | Restart Ollama service | 重启 Ollama 服务 |
| Permission denied | Run with appropriate permissions | 使用适当权限运行 |

### Debug Mode | 调试模式

```bash
# Enable verbose output | 启用详细输出
DEBUG=1 bash scripts/integrated-deploy.sh start

# Check logs | 检查日志
tail -f /tmp/yyc3-test.log
```

---

## CI/CD Integration | CI/CD 集成

Scripts are integrated with GitHub Actions workflows:

- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/deploy.yml` - GitHub Pages deployment

---

## Related Documentation | 相关文档

- [iMac M4 Analysis](./iMac-M4-Analysis.md) - iMac M4 analysis report
- [iMac M4 Optimization Guide](./iMac-M4-Optimization-Guide.md) - Optimization guide
- [iMac M4 Quick Reference](./iMac-M4-Quick-Reference.md) - Quick reference card

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
