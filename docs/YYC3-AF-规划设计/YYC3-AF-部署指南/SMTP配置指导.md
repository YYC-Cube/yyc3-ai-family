# SMTP配置指导

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future*
> 万象归元于云枢 | 深栈智启新纪元
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence*

---

## 概述

本文档详细说明如何配置SMTP服务器以启用YYC³项目的告警邮件通知功能。

---

## 一、SMTP配置概述

### 1.1 什么是SMTP

SMTP（Simple Mail Transfer Protocol）是用于发送电子邮件的标准协议。YYC³项目使用SMTP来发送告警通知邮件。

### 1.2 支持的邮件服务商

YYC³支持以下邮件服务商：

| 邮件服务商 | SMTP服务器 | 端口 | 加密方式 |
|-----------|-----------|------|---------|
| Gmail | smtp.gmail.com | 587/465 | TLS/SSL |
| QQ邮箱 | smtp.qq.com | 587/465 | TLS/SSL |
| 163邮箱 | smtp.163.com | 587/465 | TLS/SSL |
| Outlook | smtp-mail.outlook.com | 587 | TLS |
| 126邮箱 | smtp.126.com | 587/465 | TLS/SSL |
| 企业邮箱 | 根据服务商 | 根据服务商 | TLS/SSL |

---

## 二、Gmail配置

### 2.1 配置信息

**SMTP服务器**: `smtp.gmail.com`  
**端口**: `587` (TLS) 或 `465` (SSL)  
**用户名**: 您的Gmail邮箱地址  
**密码**: 应用专用密码（不是账户密码）

### 2.2 获取应用专用密码

#### 步骤1: 启用两步验证

1. 登录您的Google账户
2. 访问 https://myaccount.google.com/security
3. 找到"两步验证"部分
4. 点击"开始"
5. 按照提示完成两步验证设置

#### 步骤2: 生成应用专用密码

1. 在Google账户安全页面，找到"应用密码"部分
2. 点击"应用密码"
3. 如果需要，重新输入密码
4. 在"选择应用"下拉菜单中选择"邮件"
5. 在"选择设备"下拉菜单中选择"其他（自定义名称）"
6. 输入"YYC³"作为自定义名称
7. 点击"生成"
8. 复制生成的16位密码（格式：`xxxx xxxx xxxx xxxx`）

**注意**: 
- 应用专用密码只显示一次，请妥善保存
- 不要在代码中硬编码此密码
- 建议定期更换应用专用密码

### 2.3 配置示例

```yaml
SMTP_SERVER: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: your-email@gmail.com
SMTP_PASSWORD: xxxx xxxx xxxx xxxx
```

---

## 三、QQ邮箱配置

### 3.1 配置信息

**SMTP服务器**: `smtp.qq.com`  
**端口**: `587` (TLS) 或 `465` (SSL)  
**用户名**: 您的QQ邮箱地址  
**密码**: 授权码（不是QQ密码）

### 3.2 获取授权码

#### 步骤1: 开启IMAP/SMTP服务

1. 登录QQ邮箱
2. 点击页面顶部的"设置"
3. 选择"账户"
4. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"部分
5. 找到"IMAP/SMTP服务"
6. 点击"开启"

#### 步骤2: 验证身份

1. 系统会要求您发送短信验证
2. 按照提示发送短信
3. 点击"我已发送"
4. 系统会生成授权码

#### 步骤3: 保存授权码

1. 复制生成的授权码（16位字符）
2. 妥善保存授权码

**注意**: 
- 授权码只显示一次，请妥善保存
- 不要在代码中硬编码此授权码
- 建议定期更换授权码

### 3.3 配置示例

```yaml
SMTP_SERVER: smtp.qq.com
SMTP_PORT: 587
SMTP_USER: your-email@qq.com
SMTP_PASSWORD: xxxxxxxxxxxxxxxx
```

---

## 四、163邮箱配置

### 4.1 配置信息

**SMTP服务器**: `smtp.163.com`  
**端口**: `587` (TLS) 或 `465` (SSL)  
**用户名**: 您的163邮箱地址  
**密码**: 授权码（不是邮箱密码）

### 4.2 获取授权码

#### 步骤1: 开启IMAP/SMTP服务

1. 登录163邮箱
2. 点击页面顶部的"设置"
3. 选择"POP3/SMTP/IMAP"
4. 找到"IMAP/SMTP服务"
5. 点击"开启"

#### 步骤2: 验证身份

1. 系统会要求您发送短信验证
2. 按照提示发送短信
3. 点击"我已发送"
4. 系统会生成授权码

#### 步骤3: 保存授权码

1. 复制生成的授权码
2. 妥善保存授权码

**注意**: 
- 授权码只显示一次，请妥善保存
- 不要在代码中硬编码此授权码
- 建议定期更换授权码

### 4.3 配置示例

```yaml
SMTP_SERVER: smtp.163.com
SMTP_PORT: 587
SMTP_USER: your-email@163.com
SMTP_PASSWORD: xxxxxxxxxxxxxxxx
```

---

## 五、Outlook配置

### 5.1 配置信息

**SMTP服务器**: `smtp-mail.outlook.com`  
**端口**: `587` (TLS)  
**用户名**: 您的Outlook邮箱地址  
**密码**: 您的Outlook密码

### 5.2 配置步骤

1. 确保您的Outlook账户可以正常登录
2. 如果启用了两步验证，需要创建应用密码
3. 使用您的Outlook邮箱地址和密码

### 5.3 配置示例

```yaml
SMTP_SERVER: smtp-mail.outlook.com
SMTP_PORT: 587
SMTP_USER: your-email@outlook.com
SMTP_PASSWORD: your-password
```

---

## 六、本地测试SMTP配置

### 6.1 测试SMTP连接

#### 方法1: 使用telnet测试

```bash
# 测试Gmail SMTP连接
telnet smtp.gmail.com 587

# 测试QQ邮箱SMTP连接
telnet smtp.qq.com 587

# 测试163邮箱SMTP连接
telnet smtp.163.com 587
```

#### 方法2: 使用curl测试

```bash
# 测试SMTP连接（需要安装curl）
curl --url "smtp://smtp.gmail.com:587" --ssl-reqd --mail-from "your-email@gmail.com" --mail-rcpt "admin@0379.email" --upload-file /tmp/test-email.txt --user "your-email@gmail.com:app-password"
```

### 6.2 测试告警脚本

```bash
# 测试告警脚本
bash /Users/yanyu/Family-π³/scripts/send-alert.sh \
  --type success \
  --subject "SMTP测试" \
  --message "这是一封测试邮件"
```

### 6.3 测试邮件内容

创建测试邮件文件 `/tmp/test-email.txt`:

```
Subject: SMTP测试
From: your-email@gmail.com
To: admin@0379.email

这是一封测试邮件，用于验证SMTP配置是否正确。
```

---

## 七、GitHub Actions配置

### 7.1 配置GitHub Secrets

在GitHub仓库中配置以下Secrets：

| Secret名称 | 说明 | 示例值 |
|-----------|------|--------|
| SMTP_SERVER | SMTP服务器地址 | smtp.gmail.com |
| SMTP_PORT | SMTP端口 | 587 |
| SMTP_USER | SMTP用户名 | your-email@gmail.com |
| SMTP_PASSWORD | SMTP密码或授权码 | xxxx xxxx xxxx xxxx |
| ALERT_EMAIL | 接收告警的邮箱 | admin@0379.email |

### 7.2 在CI/CD中使用SMTP

```yaml
jobs:
  notify:
    runs-on: ubuntu-latest
    env:
      SMTP_SERVER: ${{ secrets.SMTP_SERVER }}
      SMTP_PORT: ${{ secrets.SMTP_PORT }}
      SMTP_USER: ${{ secrets.SMTP_USER }}
      SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
      ALERT_EMAIL: ${{ secrets.ALERT_EMAIL }}
    steps:
      - name: 发送告警通知
        run: |
          bash scripts/send-alert.sh \
            --type success \
            --subject "CI/CD测试成功" \
            --message "所有测试通过"
```

---

## 八、故障排查

### 8.1 常见问题

#### 问题1: 认证失败

**错误信息**: `Authentication failed`

**可能原因**:
- SMTP密码或授权码错误
- 使用了账户密码而不是应用专用密码或授权码
- 邮箱服务未开启SMTP服务

**解决方案**:
1. 检查SMTP密码或授权码是否正确
2. 确保使用的是应用专用密码或授权码，不是账户密码
3. 检查邮箱服务是否已开启SMTP服务

#### 问题2: 连接超时

**错误信息**: `Connection timeout`

**可能原因**:
- SMTP服务器地址错误
- 端口号错误
- 网络连接问题
- 防火墙阻止连接

**解决方案**:
1. 检查SMTP服务器地址是否正确
2. 检查端口号是否正确（587或465）
3. 检查网络连接是否正常
4. 检查防火墙设置

#### 问题3: 邮件发送失败

**错误信息**: `Failed to send email`

**可能原因**:
- 收件人邮箱地址错误
- 邮件内容格式错误
- 发送频率超过限制
- 邮箱服务商限制

**解决方案**:
1. 检查收件人邮箱地址是否正确
2. 检查邮件内容格式是否正确
3. 检查发送频率是否超过限制
4. 联系邮箱服务商确认限制

### 8.2 调试技巧

#### 启用详细日志

```bash
# 启用curl详细日志
curl --verbose --url "smtp://smtp.gmail.com:587" --ssl-reqd --mail-from "your-email@gmail.com" --mail-rcpt "admin@0379.email" --upload-file /tmp/test-email.txt --user "your-email@gmail.com:app-password"
```

#### 检查邮件发送日志

```bash
# 查看告警日志
tail -f /var/log/yyc3/alerts.log
```

#### 测试SMTP命令

```bash
# 使用swaks测试SMTP（需要安装swaks）
swaks --to admin@0379.email --from your-email@gmail.com --server smtp.gmail.com:587 --auth LOGIN --auth-user your-email@gmail.com --auth-password app-password --tls
```

---

## 九、安全建议

### 9.1 密码安全

- ✅ 使用强密码或授权码
- ✅ 定期更换密码或授权码
- ✅ 不要在代码中硬编码密码
- ✅ 不要将密码提交到Git仓库
- ✅ 使用GitHub Secrets存储密码

### 9.2 邮件内容安全

- ✅ 不要在邮件中发送敏感信息
- ✅ 不要在邮件中发送密码
- ✅ 不要在邮件中发送个人身份信息
- ✅ 使用加密传输（TLS/SSL）

### 9.3 发送频率控制

- ✅ 遵守邮箱服务商的发送频率限制
- ✅ 避免短时间内发送大量邮件
- ✅ 使用邮件发送队列
- ✅ 监控邮件发送状态

---

## 十、最佳实践

### 10.1 配置管理

- ✅ 使用环境变量管理SMTP配置
- ✅ 为不同环境使用不同的SMTP账户
- ✅ 定期检查和更新SMTP配置
- ✅ 记录SMTP配置变更历史

### 10.2 监控和告警

- ✅ 监控邮件发送状态
- ✅ 监控邮件发送失败率
- ✅ 设置邮件发送失败告警
- ✅ 定期检查邮件发送日志

### 10.3 性能优化

- ✅ 使用邮件发送队列
- ✅ 批量发送邮件
- ✅ 使用异步发送
- ✅ 优化邮件内容大小

---

## 十一、配置检查清单

### 11.1 配置前检查

- [ ] 已选择合适的邮件服务商
- [ ] 已获取应用专用密码或授权码
- [ ] 已测试SMTP连接
- [ ] 已测试邮件发送
- [ ] 已配置GitHub Secrets

### 11.2 配置后验证

- [ ] SMTP服务器地址正确
- [ ] SMTP端口号正确
- [ ] SMTP用户名正确
- [ ] SMTP密码或授权码正确
- [ ] 收件人邮箱地址正确
- [ ] 邮件能够正常发送
- [ ] 邮件格式正确
- [ ] 告警通知正常工作

---

## 十二、总结

### 12.1 配置完成标志

当您看到以下情况时，说明SMTP配置已完成：

1. ✅ SMTP服务器配置正确
2. ✅ 能够成功连接SMTP服务器
3. ✅ 能够成功发送测试邮件
4. ✅ 告警邮件能够正常发送
5. ✅ CI/CD流程中的告警通知正常工作

### 12.2 下一步

SMTP配置完成后，请继续阅读以下文档：

- [GitHub Secrets配置指南](./GitHub-Secrets配置指南.md)
- [CI/CD测试流程指导](./CI-CD测试流程指导.md)

---

## 十三、常见邮箱服务商快速参考

### 13.1 Gmail

| 项目 | 值 |
|------|-----|
| SMTP服务器 | smtp.gmail.com |
| 端口 | 587 (TLS) / 465 (SSL) |
| 用户名 | Gmail邮箱地址 |
| 密码 | 应用专用密码 |
| 获取密码 | https://myaccount.google.com/apppasswords |

### 13.2 QQ邮箱

| 项目 | 值 |
|------|-----|
| SMTP服务器 | smtp.qq.com |
| 端口 | 587 (TLS) / 465 (SSL) |
| 用户名 | QQ邮箱地址 |
| 密码 | 授权码 |
| 获取密码 | QQ邮箱 → 设置 → 账户 → IMAP/SMTP服务 |

### 13.3 163邮箱

| 项目 | 值 |
|------|-----|
| SMTP服务器 | smtp.163.com |
| 端口 | 587 (TLS) / 465 (SSL) |
| 用户名 | 163邮箱地址 |
| 密码 | 授权码 |
| 获取密码 | 163邮箱 → 设置 → POP3/SMTP/IMAP |

### 13.4 Outlook

| 项目 | 值 |
|------|-----|
| SMTP服务器 | smtp-mail.outlook.com |
| 端口 | 587 (TLS) |
| 用户名 | Outlook邮箱地址 |
| 密码 | Outlook密码 |
| 获取密码 | 无需特殊密码 |

---

> **YYC³ AI-Family**
> *言启象限 | 语枢未来*
> **安全第一 · 配置规范 · 持续改进**

---

*SMTP配置指导版本: 1.0.0*  
*最后更新: 2026-02-25*  
*执行人: YYC³ Team*