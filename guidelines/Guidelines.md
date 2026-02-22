# LocalOps Hub 设计指南  

*(默认中文，English version follows each paragraph)*  

## 项目概述 / Project Overview  

**中文**：LocalOps Hub 是面向本地运维与开发者的统一管理平台，集成 LLM、API 网关、邮件服务、VPN、FRP 等模块，提供统一身份认证与 AI 辅助运维的未来科技感界面。  
**English**: LocalOps Hub is a local‑only unified management console for ops and developers, integrating LLM, API gateway, email, VPN, FRP, etc., offering unified authentication and AI‑assisted operations with a futuristic UI.

## 设计系统 / Design System  

### 颜色 Tokens / Color Tokens  

| 变量 | 颜色值 | 说明 | Description |
|------|-------|------|-------------|
| `--color-primary` | `#0A84FF` | 主色（按钮、链接） | Primary (buttons, links) |
| `--color-secondary` | `#30D158` | 次色（成功、开关） | Secondary (success, toggles) |
| `--color-accent` | `#FF2D55` | 强调色（错误、警告） | Accent (error, warnings) |
| `--color-background` | `#1C1C1E` | 背景深色 | Dark background |
| `--color-surface` | `#2C2C2E` | 卡片、面板底色 | Surface (cards, panels) |
| `--color-text-primary` | `#FFFFFF` | 主文字 | Primary text |
| `--color-text-secondary` | `#A1A1A6` | 次要文字 | Secondary text |
| `--color-error` | `#FF3B30` | 错误提示 | Error |

### 排版 Tokens / Typography Tokens  

```ts
export const typography = {
  headline: { fontFamily: "Inter", size: 24, weight: 600, lineHeight: 32 },
  title:    { fontFamily: "Inter", size: 18, weight: 600, lineHeight: 28 },
  subtitle: { fontFamily: "Inter", size: 16, weight: 500, lineHeight: 24 },
  body:     { fontFamily: "Inter", size: 14, weight: 400, lineHeight: 20 },
  caption:  { fontFamily: "Inter", size: 12, weight: 400, lineHeight: 16 }
};
```  

**Chinese**：使用 `Inter` 系列字体，保持层级清晰，确保在暗色背景下的可读性。  

### 间距 Tokens / Spacing Tokens  

```ts
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
```  

### 阴影 / Elevation  

| Level | CSS `box-shadow` |
|-------|------------------|
| 0 | `none` |
| 1 | `0 1px 3px rgba(0,0,0,0.12)` |
| 2 | `0 4px 6px rgba(0,0,0,0.15)` |
| 3 | `0 10px 20px rgba(0,0,0,0.18)` |
| 4 | `0 20px 40px rgba(0,0,0,0.22)` |

## 组件库 / Component Library  

| 组件 | 变体 | 说明 | Variants | Description |
|------|------|------|----------|-------------|
| 按钮 Button | Primary / Secondary / Disabled / Loading | 主操作按钮 | 颜色、加载状态、禁用 | Primary, secondary, disabled, loading |
| 卡片 Card | Interactive / Static | 支持点击弹出详情或仅展示信息 | hover 效果、阴影 | Interactive (hover+click), static |
| 侧边栏 Sidebar | Collapsed / Expanded | 折叠抽屉式导航 | 图标+文字、仅图标 | Collapsed shows icons only; expanded shows label |
| 底部标签栏 TabBar | 3‑4 tabs | 移动端主导航 | 活动/未活动状态 | Active tab glows with accent color |
| 输入框 Input | Standard / With Icon / Password | 支持密码可视切换 | 图标、占位、错误提示 | Standard, with prefix/suffix icon, password toggle |
| 列表 List | Simple / With Avatar | 展示数据列表 | 交互行、选中态 | Simple text rows, rows with avatar & actions |
| 弹窗 Modal | Card‑Modal / Full‑Screen | 卡片弹出或全屏 | 动画、遮罩 | Card‑Modal animation fade‑in, full‑screen for LLM console |
| 开关 Switch | On / Off | 控制服务启停 | 颜色、状态动画 | On (primary) / Off (grey) with smooth toggle animation |
| 进度条 Progress | Linear / Circular | 显示任务进度 | 颜色、大小 | Linear bar for download, circular for loading LLM |

> **每个组件都配有 `Variant`（使用 `ComponentSet`）和 `Component Property`（如 `state: enabled|disabled`），便于在 Figma 中生成交互式组件库。

## 交互与动效 / Interaction & Motion  

| 交互 | 触发方式 | 动效 | Duration | Easing |
|------|----------|------|----------|--------|
| 页面切换 | 路由跳转 | slide‑left + fade‑in | 300 ms | cubic‑bezier(0.4,0,0.2,1) |
| 卡片弹出 | 点击卡片 | scale‑from‑0.95 + fade‑in | 250 ms | ease‑out‑quad |
| 按钮点击 | 按下 | ripple‑effect + color‑darken | 120 ms | linear |
| 开关切换 | 点击 | 滑块平移 + 背景色过渡 | 200 ms | ease‑out |
| 抽屉展开 | 点击菜单图标 | slide‑in (from‑left) | 300 ms | ease‑out‑cubic |
| LLM 对话滚动 | New message | auto‑scroll + fade‑in | 150 ms | ease‑in |
| 错误提示 | 验证失败 | shake + color‑flash | 500 ms | ease‑in‑out |

## 可访问性 / Accessibility  

- **对比度**：所有文字与背景对比度 ≥ 4.5:1；大标题 ≥ 3:1。  
- **键盘导航**：`Tab` 键在页面间顺序流畅，`Enter/Space` 触发按钮，`Esc` 关闭弹窗。  
- **ARIA 标记**：为 `Button`、`Modal`、`TabBar` 添加 `aria‑label`、`role="dialog"`、`aria‑selected` 等。  
- **焦点可视化**：使用 `outline: 2px solid var(--color-primary)`，确保在暗色背景下清晰可见。  

## 本地部署 / Local Deployment  

1. **前置**：确保机器已安装 Docker、Node ≥ 20、Homebrew。  
2. **启动数据库**（已在前置文档中完成）。  
3. **运行 API 管理服务**  

   ```bash
   cd ~/localops-hub-api
   docker compose up -d   # 启动后端服务，默认 3000 端口
   ```  

4. **启动 Figma‑Ready 插件**（可使用 `figma-plugin-template`，或直接运行 `npm run dev` 生成 `manifest.json` 与 `code.js` 并在 Figma 中链接）。  
5. **安全**：所有网络请求仅限 `http://127.0.0.1`，请在系统防火墙中阻止外部访问。  

## 类型定义 / Type Definitions  

```ts
/** 统一服务配置（LLM、API、Email、VPN、FRP） */
export interface ServiceConfig {
  id: string;
  name: string;
  type: "llm" | "api" | "email" | "vpn" | "frp";
  enabled: boolean;
  endpoint: string;               // 本地 http://127.0.0.1:xxxx
  auth: AuthConfig;
}

/** 认证方式抽象 */
export type AuthConfig = 
  | { method: "none" }
  | { method: "basic"; username: string; password: string }
  | { method: "token"; token: string }
  | { method: "oauth2"; clientId: string; clientSecret: string; scopes: string[]; redirectUri: string };

/** UI Token 集合 */
export interface DesignToken {
  colors: Record<string, string>;
  typography: Record<string, { fontFamily: string; size: number; weight: number; lineHeight: number }>;
  spacing: Record<string, number>;
  elevation: Record<string, string>;
}

/** 全局状态 */
export interface AppState {
  services: ServiceConfig[];
  currentUser: { id: string; name: string; roles: string[] };
  authToken: string;
}
```

## 核心功能测试用例 / Core Functional Test Cases  

（已在交互稿第🅱️ 步中提供 JSON 示例，这里给出更完整的 **E2E** 表格，便于在 Playwright、Cypress 或 Jest 中直接使用）

| ID | 功能 | 前置条件 | 步骤 | 预期结果 |
|----|------|----------|------|----------|
| TC-001 | 登录 & SSO | 无 | 1. 打开登录页 2. 输入本地 LDAP 用户/密码 3. 点击登录 | 跳转 Dashboard，`authToken` 存入 localStorage，状态 `Authenticated` |
| TC-002 | LLM Prompt 发送 | 已登录 | 1. 进入 LLM 控制台 2. 输入 Prompt 3. 点击发送 | 后端返回 `answer`，界面展示文本，`usage.tokens` 显示 |
| TC-003 | API 创建（POST） | 已登录 | 1. 进入 API 管理页 2. 点击 “新增路由” 3. 填写路径/方法/后端 4. 保存 | 路由列表出现新条目，后端可调试 `curl http://localhost:5433/api/<path>` 返回 200 |
| TC-004 | Email 发送测试 | 已登录 | 1. 打开 Email 设置 2. 填写 SMTP 参数 3. 点击 “发送测试邮件” | 收到邮件，返回 `SMTP_OK` |
| TC-005 | VPN 连接 | 已登录 | 1. 打开 VPN 页面 2. 生成 QR 码并在客户端扫描 3. 观察状态 | 状态变为 `Connected`，流量图表实时更新 |
| TC-006 | FRP 隧道映射 | 已登录 | 1. 新建隧道 (本地3000 → 远程8080) 2. 启动隧道 3. 用另一台机器访问公网 IP:8080 | 隧道状态 `Running`，远程访问成功返回本地页面 |
| TC-007 | 统一认证 (MFA) | 已登录 | 1. 在设置中启用 MFA 2. 扫描 TOTP QR 码 3. 登录时输入一次性验证码 | 登录成功，`authToken` 带 `mfa:true` 标记 |
| TC-008 | 角色权限校验 | 已登录，用户角色 `viewer` | 1. 尝试在 UI 中打开 “服务编辑” 页面 | 页面弹出 “权限不足” 提示，API 返回 403 |

> **执行方式**（Playwright 示例）  

```ts
test('LLM Prompt returns answer', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/llm');
  await page.fill('#prompt-input', 'Explain quantum entanglement');
  await page.click('button:has-text("发送")');
  await expect(page.locator('.response')).toContainText('entanglement');
});
```

## 未来可扩展 / Future Extensibility  

- **模块化插件系统**：通过 `micro‑frontend` + `iframe` 方式添加新工具（如容器监控、日志聚合）。  
- **AI‑驱动自动化**：在 LLM 控制台加入 `code‑gen` 插件，可直接生成 API 文档或脚本并一键部署。  
- **多租户 & 本地网络隔离**：利用 Docker‑Compose 多实例，每个租户独立数据卷，实现本地 “SaaS” 体验。  
- **暗/亮主题切换**：在 `Design Tokens` 中加入 `colorScheme`，通过 CSS `prefers-color-scheme` 自动切换。  

---END FILE---
