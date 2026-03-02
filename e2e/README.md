# YYC³ Family-π³ Playwright E2E 测试框架

> **创建日期**: 2026 年 3 月 1 日  
> **测试框架**: Playwright 1.40+  
> **项目版本**: 0.34.0

---

## 目录结构

```
Family-π³/
├── e2e/
│   ├── pages/              # 页面对象模型 (POM)
│   │   └── index.ts        # 页面对象导出
│   ├── tests/              # E2E 测试用例
│   │   ├── core-flows.test.ts   # 核心用户流程测试
│   │   └── ...             # 其他测试
│   ├── fixtures.ts         # 测试夹具
│   ├── global-setup.ts     # 全局设置
│   └── global-teardown.ts  # 全局清理
├── playwright.config.ts    # Playwright 配置
├── package.json            # NPM 脚本
└── README.md               # 本文档
```

---

## 快速开始

### 1. 安装依赖

```bash
# 安装 Playwright
pnpm add -D @playwright/test

# 安装浏览器
pnpm exec playwright install

# 或只安装 Chromium
pnpm exec playwright install chromium
```

### 2. 运行测试

```bash
# 运行所有 E2E 测试
pnpm test:e2e

# 运行特定测试文件
pnpm test:e2e e2e/tests/core-flows.test.ts

# 运行特定测试（按名称过滤）
pnpm test:e2e --grep "Chat"

# 有头模式运行（看到浏览器）
pnpm test:e2e --headed

# 调试模式运行
pnpm test:e2e:debug

# UI 模式运行
pnpm test:e2e:ui

# 查看测试报告
pnpm test:e2e:report
```

---

## 测试用例清单

### 核心用户流程测试 (core-flows.test.ts)

| 套件 | 测试用例 | 描述 |
|------|---------|------|
| **Application Boot** | 3 用例 | 应用加载、导航、响应式 |
| **Chat & Messaging** | 3 用例 | 发送消息、历史记录、空消息 |
| **Agent System** | 3 用例 | Agent 列表、切换、历史 |
| **Console & Monitoring** | 3 用例 | 仪表盘、指标、DevOps |
| **Settings & Configuration** | 3 用例 | 设置模态、标签页、保存 |
| **Keyboard Shortcuts** | 3 用例 | Ctrl+K、Enter 发送、Escape 关闭 |
| **Error Handling** | 3 用例 | 离线处理、长消息、特殊字符 |
| **Visual & Accessibility** | 4 用例 | 标题结构、可访问性、焦点管理、主题 |
| **Performance** | 2 用例 | 加载时间、动画 FPS |
| **Integration Scenarios** | 2 用例 | 完整用户旅程、Agent 协作 |

**总计**: 30 个 E2E 测试用例

---

## 页面对象模型

### HomePage

```typescript
import { HomePage } from './pages';

test('should send message', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.sendMessage('Hello');
  await homePage.waitForMessage('Response');
});
```

### ConsolePage

```typescript
import { ConsolePage } from './pages';

test('should switch tabs', async ({ page }) => {
  const consolePage = new ConsolePage(page);
  await consolePage.goto();
  await consolePage.switchToDashboard();
  await consolePage.switchToAI();
});
```

### SettingsPage

```typescript
import { SettingsPage } from './pages';

test('should save settings', async ({ page }) => {
  const settingsPage = new SettingsPage(page);
  await settingsPage.goto();
  await settingsPage.switchToModels();
  await settingsPage.save();
  await settingsPage.close();
});
```

---

## 测试配置

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/output',
  reporter: [
    ['html', { outputFolder: './e2e/playwright-report' }],
    ['json', { outputFile: './e2e/test-results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3133',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3133',
    reuseExistingServer: true
  },
  retries: 1,
  workers: 2
});
```

---

## 测试最佳实践

### 1. 使用页面对象模型

```typescript
// ✅ 好的做法
const homePage = new HomePage(page);
await homePage.sendMessage('Hello');

// ❌ 避免
await page.fill('input[placeholder="Enter message"]', 'Hello');
await page.click('button:has-text("Send")');
```

### 2. 使用有意义的选择器

```typescript
// ✅ 好的做法 - 使用 role
await page.getByRole('button', { name: /发送/i }).click();

// ✅ 好的做法 - 使用 testid
await page.getByTestId('chat-input').fill('Hello');

// ❌ 避免 - CSS 选择器易碎
await page.click('.chat-area > div > input').fill('Hello');
```

### 3. 等待元素而非超时

```typescript
// ✅ 好的做法
await expect(page.getByText('Success')).toBeVisible();

// ❌ 避免
await page.waitForTimeout(5000);
```

### 4. 使用夹具简化测试

```typescript
// 使用 fixtures.ts 中的预定义夹具
test('should work', async ({ homePage }) => {
  // homePage 已自动导航到主页
  await homePage.sendMessage('Hello');
});
```

---

## CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: e2e/playwright-report/
```

---

## 测试报告

### HTML 报告

运行测试后查看 HTML 报告：

```bash
pnpm test:e2e:report
```

报告包含：
- 测试执行摘要
- 每个测试的详细信息
- 失败截图
- 执行录像
- 性能指标

### JSON 报告

JSON 报告位于 `e2e/test-results.json`，可用于：
- CI/CD 集成
- 自定义仪表板
- 历史趋势分析

---

## 调试技巧

### 1. 有头模式

```bash
pnpm test:e2e --headed
```

### 2. 调试模式

```bash
pnpm test:e2e:debug
```

### 3. 使用 Playwright Inspector

```typescript
await page.pause(); // 测试暂停
```

### 4. 追踪功能

```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry'
}

// 查看追踪
pnpm exec playwright show-trace trace.zip
```

---

## 常见问题

### Q: 测试失败 "页面未加载"
**A**: 确保开发服务器正在运行，或配置 `webServer` 自动启动。

### Q: 选择器找不到元素
**A**: 使用 Playwright Inspector 检查元素，使用更稳定的选择器（role、testid）。

### Q: 测试超时
**A**: 增加超时时间或优化等待逻辑：
```typescript
// playwright.config.ts
timeout: 60000,
expect: { timeout: 10000 }
```

### Q: 跨域问题
**A**: 配置 `baseURL` 或使用 `page.route()` 拦截请求。

---

## 后续扩展

### 计划添加的测试

1. **视觉回归测试**
   ```typescript
   await expect(page).toHaveScreenshot('homepage.png');
   ```

2. **API  mocking 测试**
   ```typescript
   await page.route('**/api/**', route => {
     route.fulfill({ json: { data: 'mocked' } });
   });
   ```

3. **认证流程测试**
   ```typescript
   await page.goto('/login');
   await page.fill('input[name="email"]', 'test@example.com');
   await page.fill('input[name="password"]', 'password');
   await page.click('button[type="submit"]');
   ```

4. **文件上传/下载测试**
   ```typescript
   await page.setInputFiles('input[type="file"]', 'test.pdf');
   ```

---

## 参考资源

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright Test 介绍](https://playwright.dev/docs/intro)
- [页面对象模式](https://playwright.dev/docs/pom)
- [测试最佳实践](https://playwright.dev/docs/best-practices)

---

> **文档版本**: 1.0.0  
> **最后更新**: 2026 年 3 月 1 日  
> **维护者**: YYC³ Team
