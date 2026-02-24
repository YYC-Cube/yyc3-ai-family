---
@file: 归档文档-文档索引.md
@description: 归档分类下所有历史文档的索引与说明，统一管理归档文档
@author: YYC³
@version: v1.0.0
@created: 2026-02-25
@updated: 2026-02-25
@status: published
@tags: [归档],[文档索引],[目录总览]
---

# 归档文档索引

## 概述

YYC³ AI-Family 归档文档，存储项目历史版本、废弃文档和参考文档。

## 文档列表

### 1. 环境配置

| 文档名称 | 描述 | 创建日期 |
|---------|------|---------|
| [4-ENVIRONMENT-GUIDE.md](./4-ENVIRONMENT-GUIDE.md) | 旧版环境部署指南 | 历史版本 |
| [V-3-FILE-DIFFERENCES.md](./V-3-FILE-DIFFERENCES.md) | V3版本文件差异记录 | 历史版本 |

### 2. 集成架构

| 文档名称 | 描述 | 创建日期 |
|---------|------|---------|
| [YYC3-Integrated-Architecture-Design-9.md](./YYC3-Integrated-Architecture-Design-9.md) | 集成架构设计文档第9版 | 历史版本 |

### 3. 可用性测试

| 文档名称 | 描述 | 创建日期 |
|---------|------|---------|
| [USABILITY_TEST_PLAN.md](./USABILITY_TEST_PLAN.md) | 英文版可用性测试计划 | 历史版本 |
| [USABILITY_TEST_PLAN_CN.md](./USABILITY_TEST_PLAN_CN.md) | 中文版可用性测试计划 | 历史版本 |

## 归档标准

### 归档条件

文档符合以下任一条件时，应归档：

1. **版本过时**: 文档描述的功能或架构已不再使用
2. **重构完成**: 原有设计已重构，新设计文档已发布
3. **参考价值**: 虽然不再使用，但有历史参考价值
4. **替代方案**: 已有更优的替代方案

### 归档流程

```mermaid
graph LR
    A[识别归档文档] --> B[添加归档说明]
    B --> C[移动到archive目录]
    C --> D[更新README索引]
    D --> E[在活跃文档中添加引用]
```

### 活跃文档引用

当活跃文档需要引用归档内容时：

1. 在活跃文档中添加"历史参考"章节
2. 使用相对路径链接归档文档
3. 说明参考内容的具体用途

## 归档文档使用建议

### 何时查阅归档文档

- **历史追溯**: 了解功能演进过程
- **架构对比**: 对比新旧架构设计差异
- **问题排查**: 参考历史问题的解决方案
- **学习参考**: 学习历史技术决策过程

### 归档文档维护

- **定期清理**: 每季度评估归档文档价值
- **元数据更新**: 更新文档状态和创建日期
- **交叉引用**: 确保活跃文档正确引用归档内容

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」

</div>
