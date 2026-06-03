# GitHub Secrets 配置指南

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future*
> 万象归元于云枢 | 深栈智启新纪元
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence*

---

## 概述

本文档详细说明如何在GitHub仓库中配置Secrets，以启用YYC³项目的CI/CD流程和告警通知功能。

---

## 一、配置步骤

### 1.1 访问GitHub Secrets页面

1. 打开您的GitHub仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Secrets and variables**
4. 点击 **Actions**
5. 点击 **New repository secret** 按钮添加新的Secret

### 1.2 配置数据库Secrets

#### DB_HOST

**名称**: `DB_HOST`  
**值**: 数据库主机地址  
**示例**: `localhost` 或 `your-database-host.com`

#### DB_PORT

**名称**: `DB_PORT`  
**值**: 数据库端口  
**示例**: `5433`

#### DB_NAME

**名称**: `DB_NAME`  
**值**: 数据库名称  
**示例**: `yyc3_test` 或 `yyc3_aify`

#### DB_USER

**名称**: `DB_USER`  
**值**: 数据库用户名  
**示例**: `yyc3_test`

#### DB_PASSWORD

**名称**: `DB_PASSWORD`  
**值**: 数据库密码  
**示例**: `your-secure-password`

**注意**: 请使用强密码，不要使用默认密码

---

## 二、配置SMTP Secrets

### 2.1 SMTP_SERVER

**名称**: `SMTP_SERVER`  
**值**: SMTP服务器地址  
**示例**: 
- Gmail: `smtp.gmail.com`
- Outlook: `smtp-mail.outlook.com`
- QQ邮箱: `smtp.qq.com`
- 163邮箱: `smtp.163.com`

### 2.2 SMTP_PORT

**名称**: `SMTP_PORT`  
**值**: SMTP服务器端口  
**示例**: 
- TLS: `587`
- SSL: `465`
- 非加密: `25`

### 2.3 SMTP_USER

**名称**: `SMTP_USER`  
**值**: SMTP用户名（通常是邮箱地址）  
**示例**: `your-email@gmail.com`

### 2.4 SMTP_PASSWORD

**名称**: `SMTP_PASSWORD`  
**值**: SMTP密码或应用专用密码

**注意**: 
- Gmail需要使用应用专用密码，不是账户密码
- QQ邮箱需要使用授权码，不是QQ密码
- 163邮箱需要使用授权码，不是邮箱密码

---

## 三、配置告警Secrets

### 3.1 ALERT_EMAIL

**名称**: `ALERT_EMAIL`  
**值**: 接收告警通知的邮箱地址  
**示例**: `admin@0379.email`

---

## 四、常用邮箱服务商配置

### 4.1 Gmail

**SMTP服务器**: `smtp.gmail.com`  
**端口**: `587` (TLS) 或 `465` (SSL)  
**用户名**: 您的Gmail邮箱地址  
**密码**: 应用专用密码

**获取应用专用密码步骤**:
1. 登录Google账户
2. 访问 https://myaccount.google.com/security
3. 启用两步验证（如果未启用）
4. 在"应用密码"部分生成新密码
5. 选择"邮件"和"其他（自定义名称）"
6. 输入"YYC³"作为名称
7. 点击"生成"
8. 复制生成的16位密码

### 4.2 QQ邮箱

**SMTP服务器**: `smtp.qq.com`  
**端口**: `587` (TLS) 或 `465` (SSL)  
**用户名**: 您的QQ邮箱地址  
**密码**: 授权码

**获取授权码步骤**:
1. 登录QQ邮箱
2. 点击"设置"
3. 选择"账户"
4. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
5. 开启"IMAP/SMTP服务"
6. 按照提示发送短信
7. 获取授权码

### 4.3 163邮箱

**SMTP服务器**: `smtp.163.com`  
**端口**: `587` (TLS) 或 `465` (SSL)  
**用户名**: 您的163邮箱地址  
**密码**: 授权码

**获取授权码步骤**:
1. 登录163邮箱
2. 点击"设置"
3. 选择"POP3/SMTP/IMAP"
4. 开启"IMAP/SMTP服务"
5. 按照提示设置授权密码

### 4.4 Outlook

**SMTP服务器**: `smtp-mail.outlook.com`  
**端口**: `587` (TLS)  
**用户名**: 您的Outlook邮箱地址  
**密码**: 您的Outlook密码

---

## 五、配置验证

### 5.1 验证Secrets配置

配置完成后，可以通过以下方式验证：

#### 方法1: 查看Secrets列表

在GitHub仓库的 **Settings → Secrets and variables → Actions** 页面，应该能看到所有配置的Secrets。

#### 方法2: 测试CI/CD流程

推送代码到GitHub，触发CI/CD流程，检查是否能够正常连接数据库和发送邮件。

### 5.2 测试数据库连接

```bash
# 在本地测试数据库连接
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1"
```

### 5.3 测试SMTP连接

```bash
# 使用telnet测试SMTP连接
telnet $SMTP_SERVER $SMTP_PORT
```

---

## 六、安全建议

### 6.1 密码安全

- ✅ 使用强密码（至少12位，包含大小写字母、数字和特殊字符）
- ✅ 定期更换密码
- ✅ 不要在代码中硬编码密码
- ✅ 不要将密码提交到Git仓库

### 6.2 Secrets管理

- ✅ 限制Secrets的访问权限
- ✅ 定期审查和更新Secrets
- ✅ 使用环境特定的Secrets（开发、测试、生产）
- ✅ 记录Secrets的变更历史

### 6.3 SMTP安全

- ✅ 使用TLS或SSL加密连接
- ✅ 使用应用专用密码或授权码
- ✅ 不要在邮件中发送敏感信息
- ✅ 定期检查邮件发送日志

---

## 七、故障排查

### 7.1 数据库连接失败

**问题**: CI/CD流程中数据库连接失败

**解决方案**:
1. 检查 `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD` 是否正确
2. 检查数据库服务器是否可访问
3. 检查数据库用户权限
4. 检查防火墙设置

### 7.2 SMTP发送失败

**问题**: 告警邮件发送失败

**解决方案**:
1. 检查 `SMTP_SERVER`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASSWORD` 是否正确
2. 检查SMTP服务器是否支持TLS/SSL
3. 检查是否需要使用应用专用密码或授权码
4. 检查邮箱服务商的发送频率限制

### 7.3 Secrets不生效

**问题**: 配置的Secrets在CI/CD流程中不生效

**解决方案**:
1. 检查Secrets名称是否正确（区分大小写）
2. 检查Secrets是否在正确的仓库中配置
3. 检查GitHub Actions工作流文件中是否正确引用Secrets
4. 重新触发CI/CD流程

---

## 八、完整配置示例

### 8.1 开发环境

```yaml
DB_HOST: localhost
DB_PORT: 5433
DB_NAME: yyc3_dev
DB_USER: yyc3_dev
DB_PASSWORD: dev_password_123

SMTP_SERVER: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: dev@example.com
SMTP_PASSWORD: app_password_dev

ALERT_EMAIL: admin@0379.email
```

### 8.2 测试环境

```yaml
DB_HOST: test-db.example.com
DB_PORT: 5433
DB_NAME: yyc3_test
DB_USER: yyc3_test
DB_PASSWORD: test_password_456

SMTP_SERVER: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: test@example.com
SMTP_PASSWORD: app_password_test

ALERT_EMAIL: admin@0379.email
```

### 8.3 生产环境

```yaml
DB_HOST: prod-db.example.com
DB_PORT: 5433
DB_NAME: yyc3_prod
DB_USER: yyc3_prod
DB_PASSWORD: prod_password_789

SMTP_SERVER: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: prod@example.com
SMTP_PASSWORD: app_password_prod

ALERT_EMAIL: admin@0379.email
```

---

## 九、环境变量引用

### 9.1 在GitHub Actions中引用

```yaml
jobs:
  database-sync-test:
    runs-on: ubuntu-latest
    env:
      DB_HOST: ${{ secrets.DB_HOST }}
      DB_PORT: ${{ secrets.DB_PORT }}
      DB_NAME: ${{ secrets.DB_NAME }}
      DB_USER: ${{ secrets.DB_USER }}
      DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
    steps:
      - name: 测试数据库连接
        run: |
          PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1"
```

### 9.2 在Shell脚本中引用

```bash
#!/bin/bash

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-yyc3_test}"
DB_USER="${DB_USER:-yyc3_test}"
DB_PASSWORD="${DB_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ Error: DB_PASSWORD environment variable is required"
  exit 1
fi

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1"
```

---

## 十、总结

### 10.1 配置清单

- [ ] 配置数据库Secrets（DB_HOST、DB_PORT、DB_NAME、DB_USER、DB_PASSWORD）
- [ ] 配置SMTP Secrets（SMTP_SERVER、SMTP_PORT、SMTP_USER、SMTP_PASSWORD）
- [ ] 配置告警Secrets（ALERT_EMAIL）
- [ ] 验证Secrets配置
- [ ] 测试数据库连接
- [ ] 测试SMTP连接
- [ ] 触发CI/CD流程验证

### 10.2 配置完成标志

当您看到以下情况时，说明配置已完成：

1. ✅ 所有Secrets都在GitHub仓库中配置完成
2. ✅ CI/CD流程能够成功连接数据库
3. ✅ 告警邮件能够正常发送
4. ✅ 所有测试用例通过

### 10.3 下一步

配置完成后，请继续阅读以下文档：

- [CI/CD测试流程指导](./CI-CD测试流程指导.md)
- [SMTP配置指导](./SMTP配置指导.md)

---

> **YYC³ AI-Family**
> *言启象限 | 语枢未来*
> **安全第一 · 配置规范 · 持续改进**

---

*GitHub Secrets配置指南版本: 1.0.0*  
*最后更新: 2026-02-25*  
*执行人: YYC³ Team*