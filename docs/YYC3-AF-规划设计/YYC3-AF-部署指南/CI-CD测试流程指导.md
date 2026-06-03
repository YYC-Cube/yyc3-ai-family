# CI/CD测试流程指导

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future*
> 万象归元于云枢 | 深栈智启新纪元
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence*

---

## 概述

本文档详细说明如何测试YYC³项目的CI/CD流程，确保所有自动化测试和部署流程正常工作。

---

## 一、CI/CD流程概述

### 1.1 CI/CD架构

```
┌─────────────────────────────────────────────────────┐
│              GitHub Actions CI/CD               │
└─────────────────────────────────────────────────────┘
                      │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│代码质量检查│ │数据库测试 │ │性能监控   │
└──────────┘ └──────────┘ └──────────┘
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
            ┌──────────┐
            │集成测试  │
            └──────────┘
                    │
                    ▼
            ┌──────────┐
            │性能基准  │
            └──────────┘
                    │
                    ▼
            ┌──────────┐
            │部署     │
            └──────────┘
                    │
                    ▼
            ┌──────────┐
            │告警通知 │
            └──────────┘
```

### 1.2 CI/CD作业清单

| 作业名称 | 功能 | 执行时间 | 依赖 |
|---------|------|---------|------|
| quality-check | 代码质量检查 | ~2分钟 | 无 |
| database-sync-test | 数据库同步测试 | ~3分钟 | quality-check |
| performance-monitor | 性能监控测试 | ~2分钟 | quality-check |
| integration-test | 集成测试 | ~5分钟 | database-sync-test, performance-monitor |
| performance-benchmark | 性能基准测试 | ~3分钟 | integration-test |
| notify | 告警通知 | ~1分钟 | 所有测试作业 |
| deploy | 自动部署 | ~5分钟 | 所有测试作业 |

---

## 二、测试前准备

### 2.1 配置GitHub Secrets

在开始测试之前，请确保已配置以下GitHub Secrets：

#### 数据库配置

```yaml
DB_HOST: localhost
DB_PORT: 5433
DB_NAME: yyc3_test
DB_USER: yyc3_test
DB_PASSWORD: your-secure-password
```

#### SMTP配置

```yaml
SMTP_SERVER: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: your-email@gmail.com
SMTP_PASSWORD: your-app-password
```

#### 告警配置

```yaml
ALERT_EMAIL: admin@0379.email
```

### 2.2 检查CI/CD工作流文件

确认CI/CD工作流文件存在且配置正确：

```bash
# 检查工作流文件
ls -la .github/workflows/ci-cd.yml

# 查看工作流内容
cat .github/workflows/ci-cd.yml
```

### 2.3 检查脚本权限

确保所有脚本具有执行权限：

```bash
# 检查脚本权限
ls -la scripts/*.sh

# 添加执行权限
chmod +x scripts/*.sh
```

---

## 三、本地测试

### 3.1 测试代码质量检查

#### ESLint检查

```bash
# 运行ESLint
npm run lint

# 或使用pnpm
pnpm run lint
```

#### TypeScript类型检查

```bash
# 运行TypeScript类型检查
npm run type-check

# 或使用pnpm
pnpm run type-check
```

#### npm安全审计

```bash
# 运行npm安全审计
npm audit --production
```

### 3.2 测试数据库同步

#### 数据库健康检查

```bash
# 运行数据库健康检查
bash scripts/db-health-check.sh
```

#### 数据库同步测试

```bash
# 运行数据库同步测试
bash scripts/db-sync-precheck.sh
```

#### 错误恢复测试

```bash
# 运行错误恢复测试
bash scripts/test-error-recovery.sh
```

#### 日志记录测试

```bash
# 运行日志记录测试
bash scripts/test-logging.sh
```

#### 回滚流程测试

```bash
# 运行回滚流程测试
bash scripts/test-rollback.sh
```

### 3.3 测试性能监控

#### 性能监控脚本

```bash
# 运行性能监控
bash scripts/performance-monitor.sh
```

#### 性能基准测试

```bash
# 运行性能基准测试
bash scripts/performance-benchmark.sh
```

### 3.4 测试告警通知

#### 发送成功通知

```bash
# 发送成功通知
bash scripts/send-alert.sh \
  --type success \
  --subject "测试成功" \
  --message "所有测试通过"
```

#### 发送失败告警

```bash
# 发送失败告警
bash scripts/send-alert.sh \
  --type failure \
  --subject "测试失败" \
  --message "部分测试失败，请检查日志"
```

#### 发送警告通知

```bash
# 发送警告通知
bash scripts/send-alert.sh \
  --type warning \
  --subject "性能警告" \
  --message "系统性能下降，请检查"
```

---

## 四、GitHub Actions测试

### 4.1 触发CI/CD流程

#### 方法1: 推送代码到main分支

```bash
# 切换到main分支
git checkout main

# 合并develop分支
git merge develop

# 推送到GitHub
git push origin main
```

#### 方法2: 推送代码到develop分支

```bash
# 切换到develop分支
git checkout develop

# 推送到GitHub
git push origin develop
```

#### 方法3: 创建Pull Request

```bash
# 创建新分支
git checkout -b feature/test-ci-cd

# 提交更改
git add .
git commit -m "test: 测试CI/CD流程"

# 推送到GitHub
git push origin feature/test-ci-cd

# 在GitHub上创建Pull Request
```

#### 方法4: 手动触发工作流

1. 打开GitHub仓库
2. 点击 **Actions** 标签
3. 选择 **YYC³ CI/CD Pipeline** 工作流
4. 点击 **Run workflow** 按钮
5. 选择分支
6. 点击 **Run workflow** 确认

### 4.2 监控CI/CD执行

#### 查看工作流状态

1. 打开GitHub仓库
2. 点击 **Actions** 标签
3. 查看最新的工作流运行状态

#### 查看作业日志

1. 点击具体的工作流运行
2. 点击具体的作业
3. 查看作业日志

#### 查看作业步骤

1. 在作业页面中，展开具体的步骤
2. 查看步骤的详细日志
3. 检查是否有错误或警告

### 4.3 检查作业执行结果

#### quality-check作业

**预期结果**:
- ✅ ESLint检查通过
- ✅ TypeScript类型检查通过
- ✅ npm安全审计通过

**检查点**:
- 代码风格是否符合规范
- 是否有类型错误
- 是否有安全漏洞

#### database-sync-test作业

**预期结果**:
- ✅ 数据库健康检查通过
- ✅ 错误恢复机制测试通过
- ✅ 日志记录功能测试通过
- ✅ 回滚流程测试通过

**检查点**:
- 数据库连接是否正常
- 错误恢复是否有效
- 日志记录是否完整
- 回滚流程是否正确

#### performance-monitor作业

**预期结果**:
- ✅ 系统资源监控正常
- ✅ 服务状态监控正常
- ✅ 数据库性能监控正常
- ✅ API响应时间监控正常

**检查点**:
- 系统资源使用是否正常
- 服务状态是否健康
- 数据库性能是否良好
- API响应时间是否合理

#### integration-test作业

**预期结果**:
- ✅ 集成测试套件通过
- ✅ 综合测试通过

**检查点**:
- 集成测试是否通过
- 综合测试是否通过

#### performance-benchmark作业

**预期结果**:
- ✅ 数据库查询性能测试通过
- ✅ API响应时间测试通过
- ✅ 系统资源测试通过
- ✅ 基准线对比通过

**检查点**:
- 数据库查询性能是否达标
- API响应时间是否达标
- 系统资源使用是否合理
- 性能是否在基准线范围内

#### notify作业

**预期结果**:
- ✅ 成功通知已发送
- ✅ 失败告警已发送（如果失败）
- ✅ 邮件发送成功

**检查点**:
- 邮件是否成功发送
- 邮件内容是否正确
- 邮件格式是否正确

#### deploy作业

**预期结果**:
- ✅ 自动部署到生产环境
- ✅ 部署通知已发送

**检查点**:
- 部署是否成功
- 服务是否正常运行
- 部署通知是否发送

---

## 五、故障排查

### 5.1 常见问题

#### 问题1: 工作流未触发

**可能原因**:
- 工作流文件路径错误
- 工作流文件格式错误
- 触发条件不满足

**解决方案**:
1. 检查工作流文件路径是否为 `.github/workflows/ci-cd.yml`
2. 检查工作流文件格式是否正确（YAML格式）
3. 检查触发条件是否满足（push到main/develop分支或创建PR）

#### 问题2: 作业执行失败

**可能原因**:
- 依赖作业失败
- 环境变量未配置
- 脚本执行错误

**解决方案**:
1. 检查依赖作业是否成功
2. 检查GitHub Secrets是否配置正确
3. 查看作业日志，定位具体错误

#### 问题3: 数据库连接失败

**可能原因**:
- 数据库Secrets配置错误
- 数据库服务未运行
- 网络连接问题

**解决方案**:
1. 检查数据库Secrets配置是否正确
2. 检查数据库服务是否运行
3. 检查网络连接是否正常

#### 问题4: 邮件发送失败

**可能原因**:
- SMTP Secrets配置错误
- SMTP服务器不可达
- 邮件内容格式错误

**解决方案**:
1. 检查SMTP Secrets配置是否正确
2. 检查SMTP服务器是否可达
3. 检查邮件内容格式是否正确

### 5.2 调试技巧

#### 启用调试日志

在GitHub Actions工作流中启用调试日志：

1. 打开GitHub仓库
2. 点击 **Settings** 标签
3. 找到 **Secrets and variables**
4. 点击 **Actions**
5. 添加新的Secret：
   - 名称: `ACTIONS_STEP_DEBUG`
   - 值: `true`
6. 添加新的Secret：
   - 名称: `ACTIONS_RUNNER_DEBUG`
   - 值: `true`

#### 本地复现问题

在本地复现CI/CD中的问题：

```bash
# 模拟CI/CD环境
docker run -it --rm \
  -e DB_HOST=localhost \
  -e DB_PORT=5433 \
  -e DB_NAME=yyc3_test \
  -e DB_USER=yyc3_test \
  -e DB_PASSWORD=your-password \
  -v $(pwd):/workspace \
  node:20 \
  bash

# 在容器中运行测试
cd /workspace
npm install
npm run lint
npm run type-check
```

#### 查看详细日志

在GitHub Actions中查看详细日志：

1. 点击具体的工作流运行
2. 点击具体的作业
3. 展开具体的步骤
4. 查看步骤的详细日志

---

## 六、性能优化

### 6.1 减少构建时间

#### 使用缓存

在GitHub Actions中使用缓存：

```yaml
jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - name: 缓存依赖
        uses: actions/cache@v3
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
```

#### 并行执行

将独立的作业设置为并行执行：

```yaml
jobs:
  quality-check:
    runs-on: ubuntu-latest
    
  database-sync-test:
    runs-on: ubuntu-latest
    needs: quality-check
    
  performance-monitor:
    runs-on: ubuntu-latest
    needs: quality-check
```

### 6.2 优化测试执行

#### 跳过不必要的测试

在特定条件下跳过测试：

```yaml
jobs:
  database-sync-test:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

#### 使用矩阵策略

使用矩阵策略并行运行测试：

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - name: 设置Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

---

## 七、最佳实践

### 7.1 工作流管理

- ✅ 为不同的环境创建不同的工作流
- ✅ 使用有意义的作业名称
- ✅ 添加详细的作业描述
- ✅ 使用环境变量管理配置

### 7.2 错误处理

- ✅ 添加适当的错误处理
- ✅ 提供清晰的错误消息
- ✅ 记录详细的错误日志
- ✅ 发送错误告警通知

### 7.3 安全实践

- ✅ 使用GitHub Secrets存储敏感信息
- ✅ 不要在日志中输出敏感信息
- ✅ 定期更新Secrets
- ✅ 限制工作流的访问权限

### 7.4 监控和告警

- ✅ 监控工作流执行状态
- ✅ 监控作业执行时间
- ✅ 设置失败告警
- ✅ 定期审查工作流日志

---

## 八、测试检查清单

### 8.1 测试前检查

- [ ] GitHub Secrets已配置
- [ ] 工作流文件存在且格式正确
- [ ] 脚本具有执行权限
- [ ] 本地测试通过
- [ ] 数据库服务运行正常
- [ ] SMTP服务配置正确

### 8.2 测试中检查

- [ ] 工作流成功触发
- [ ] 所有作业按预期执行
- [ ] 作业依赖关系正确
- [ ] 环境变量正确传递
- [ ] 日志输出清晰完整

### 8.3 测试后检查

- [ ] 所有作业执行成功
- [ ] 告警邮件正常发送
- [ ] 部署成功完成
- [ ] 服务正常运行
- [ ] 性能指标正常

---

## 九、总结

### 9.1 测试完成标志

当您看到以下情况时，说明CI/CD测试已完成：

1. ✅ 所有作业执行成功
2. ✅ 告警邮件正常发送
3. ✅ 部署成功完成
4. ✅ 服务正常运行
5. ✅ 性能指标正常

### 9.2 下一步

CI/CD测试完成后，您可以：

1. 配置定时任务，定期运行性能基准测试
2. 设置性能告警，监控性能变化
3. 优化CI/CD流程，提高执行效率
4. 添加更多的测试用例，提高测试覆盖率

---

## 十、相关文档

- [GitHub Secrets配置指南](./GitHub-Secrets配置指南.md)
- [SMTP配置指导](./SMTP配置指导.md)
- [265-YYC3-AF-部署指南-CICD与监控.md](./265-YYC3-AF-部署指南-CICD与监控.md)

---

> **YYC³ AI-Family**
> *言启象限 | 语枢未来*
> **质量第一 · 自动化测试 · 持续改进*

---

*CI/CD测试流程指导版本: 1.0.0*  
*最后更新: 2026-02-25*  
*执行人: YYC³ Team*