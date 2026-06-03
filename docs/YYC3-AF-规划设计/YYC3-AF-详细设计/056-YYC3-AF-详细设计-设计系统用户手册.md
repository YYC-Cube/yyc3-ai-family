# YYC³ Design System 用户手册

> **版本**: 1.3.0  
> **更新日期**: 2026-02-19  
> **适用项目**: YYC³-HKCT 本地一站式智能工作平台

---

## 📖 目录

1. [概述](#概述)
2. [快速开始](#快速开始)
3. [设计令牌](#设计令牌)
4. [组件库](#组件库)
5. [主题系统](#主题系统)
6. [动画系统](#动画系统)
7. [最佳实践](#最佳实践)
8. [常见问题](#常见问题)
9. [更新日志](#更新日志)

---

## 概述

### 什么是 YYC³ Design System？

YYC³ Design System 是一个基于「五高五标五化」理念的企业级设计系统，为 YYC³-HKCT 项目提供统一的设计语言、组件库和开发工具。

### 核心特性

- **统一的设计语言**: 通过设计令牌确保视觉一致性
- **多框架支持**: 支持 React、Vue、Svelte 等主流框架
- **深色主题**: 内置深色/浅色主题切换
- **OKLCH 色彩空间**: 使用现代色彩空间提供更准确的色彩表现
- **TypeScript 支持**: 完整的类型定义，提供类型安全保障
- **Storybook 文档**: 交互式组件文档和示例
- **AI 辅助**: 集成 AI 工具进行设计令牌分析和优化

### 设计哲学

#### 五高原则 (Five Highs)
- **高效协同**: 统一的设计语言促进团队协作
- **高维智能**: AI 驱动的设计令牌生成和优化
- **高可靠韧性**: 经过充分测试的稳定组件库
- **高成长进化**: 持续迭代和功能扩展
- **高安全合规**: 符合无障碍和隐私保护标准

#### 五标体系 (Five Standards)
- **架构标准**: 模块化、可扩展的组件架构
- **接口标准**: 统一的 API 设计规范
- **数据标准**: 标准化的设计令牌格式
- **安全标准**: 符合 WCAG 2.1 AA 级无障碍标准
- **演进标准**: 版本管理和向后兼容策略

#### 五化架构 (Five Transformations)
- **流程自动化**: 自动化构建和发布流程
- **能力模块化**: 可复用的组件和工具
- **决策智能化**: AI 辅助的设计决策
- **知识图谱化**: 设计知识的系统化管理
- **治理持续化**: 持续的质量监控和改进

---

## 快速开始

### 安装依赖

Design System 已集成到项目中，位于 `/yyc3-Design-System` 目录。

```bash
cd yyc3-Design-System
npm install
```

### 构建设计令牌

```bash
npm run build:tokens
```

这将生成以下文件：
- `dist/css/variables.css` - CSS 变量
- `dist/css/variables.dark.css` - 深色主题变量
- `dist/js/tokens.js` - JavaScript 令牌
- `dist/js/theme.js` - 主题配置

### 在项目中使用

#### 1. 导入样式

设计令牌已自动集成到 `src/styles/theme.css`，无需额外导入。

#### 2. 使用 CSS 变量

```tsx
<div style={{
  backgroundColor: 'var(--primary)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
  fontFamily: 'var(--typography-font-sans)',
  animation: 'fadeIn 0.3s ease-in-out'
}}>
  YYC³ Design System
</div>
```

#### 3. 使用 Tailwind 类名

```tsx
<div className="bg-primary text-primary-foreground rounded-lg shadow-card">
  YYC³ Design System
</div>
```

#### 4. 使用 JavaScript 令牌

```tsx
import { tokens } from '@/yyc3-Design-System/dist/js/tokens';

const primaryColor = tokens['color.primary'];
const borderRadius = tokens['radius.default'];
```

### 查看 Design System 示例

在 YYC³-HKCT 应用中，可以通过侧边栏访问 **Design System** 视图，查看所有设计令牌和组件的使用示例。

---

## 设计令牌

设计令牌是设计系统的核心，它们是设计决策的最小单位，用于确保整个产品的一致性。

### 颜色令牌

#### 语义化颜色

```css
--primary              /* 主色调 */
--primary-foreground   /* 主色调前景色 */
--secondary            /* 次要色调 */
--secondary-foreground /* 次要色调前景色 */
--accent              /* 强调色 */
--accent-foreground   /* 强调色前景色 */
--destructive          /* 危险操作色 */
--destructive-foreground /* 危险操作前景色 */
--success             /* 成功状态色 */
--success-foreground  /* 成功状态前景色 */
--muted              /* 静音色 */
--muted-foreground   /* 静音色前景色 */
```

#### 组件颜色

```css
--card               /* 卡片背景色 */
--card-foreground    /* 卡片前景色 */
--popover           /* 弹出层背景色 */
--popover-foreground /* 弹出层前景色 */
--border            /* 边框颜色 */
--input             /* 输入框颜色 */
--ring              /* 焦点环颜色 */
--background        /* 页面背景色 */
--foreground        /* 页面前景色 */
```

#### 使用示例

```tsx
const ColorTokenExample = () => (
  <div className="space-y-4">
    <div className="p-4 bg-primary text-primary-foreground rounded-lg">
      Primary Button
    </div>
    <div className="p-4 bg-destructive text-destructive-foreground rounded-lg">
      Destructive Action
    </div>
    <div className="p-4 bg-success text-success-foreground rounded-lg">
      Success Message
    </div>
  </div>
);
```

### 圆角令牌

```css
--radius-sm    /* 小圆角: 0.125rem */
--radius-md    /* 中圆角: 0.25rem */
--radius-lg    /* 大圆角: 0.5rem */
--radius-default /* 默认圆角: 0.5rem */
```

#### 使用示例

```tsx
<div className="rounded-sm">Small Radius</div>
<div className="rounded-md">Medium Radius</div>
<div className="rounded-lg">Large Radius</div>
```

### 阴影令牌

```css
--shadow-card    /* 卡片阴影: 0px 6px 20px -4px #0a0a0a */
--shadow-popover /* 弹出层阴影: 0px 10px 30px 0px #0a0a0a */
--shadow-focus   /* 焦点阴影: 0px 0px 0px 2px #e06a70 */
```

#### 使用示例

```tsx
<div className="shadow-card p-4 bg-card rounded-lg">
  Card with Shadow
</div>
```

### 字体令牌

#### 字体家族

```css
--typography-font-sans  /* 无衬线字体: Geist, system-ui, -apple-system */
--typography-font-serif /* 衬线字体: Source Serif 4, Georgia */
--typography-font-mono  /* 等宽字体: Geist Mono, ui-monospace */
```

#### 字体大小

```css
--font-size-heading-1 /* 标题 1: 2rem */
--font-size-heading-2 /* 标题 2: 1.5rem */
--font-size-body      /* 正文: 1rem */
--font-size-caption   /* 说明文字: 0.875rem */
```

#### 行高

```css
--line-height-heading /* 标题行高: 1.2 */
--line-height-body    /* 正文行高: 1.5 */
```

#### 使用示例

```tsx
<h1 style={{ 
  fontSize: 'var(--font-size-heading-1)', 
  lineHeight: 'var(--line-height-heading)',
  fontFamily: 'var(--typography-font-sans)'
}}>
  Heading 1
</h1>

<p style={{ 
  fontSize: 'var(--font-size-body)', 
  lineHeight: 'var(--line-height-body)',
  fontFamily: 'var(--typography-font-sans)'
}}>
  Body text
</p>

<code style={{ 
  fontFamily: 'var(--typography-font-mono)' 
}}>
  Code snippet
</code>
```

### 动画令牌

#### 动画时长

```css
--animation-duration-fast   /* 快速: 150ms */
--animation-duration-normal /* 正常: 300ms */
--animation-duration-slow    /* 慢速: 500ms */
```

#### 动画缓动函数

```css
--animation-easing-ease-in     /* 缓入: cubic-bezier(0.4, 0, 1, 1) */
--animation-easing-ease-out    /* 缓出: cubic-bezier(0, 0, 0.2, 1) */
--animation-easing-ease-in-out /* 缓入缓出: cubic-bezier(0.4, 0, 0.2, 1) */
--animation-easing-bounce      /* 弹跳: cubic-bezier(0.68, -0.55, 0.265, 1.55) */
```

#### 预定义动画

```css
--animation-keyframes-fade-in     /* 淡入: fadeIn 0.3s ease-in-out */
--animation-keyframes-fade-out    /* 淡出: fadeOut 0.3s ease-in-out */
--animation-keyframes-slide-in-up   /* 上滑: slideInUp 0.3s ease-out */
--animation-keyframes-slide-in-down /* 下滑: slideInDown 0.3s ease-out */
--animation-keyframes-scale-in     /* 缩放进入: scaleIn 0.3s ease-out */
--animation-keyframes-scale-out    /* 缩放退出: scaleOut 0.3s ease-in */
```

#### 使用示例

```tsx
<div style={{
  animation: 'fadeIn 0.3s ease-in-out'
}}>
  Fade In Animation
</div>

<div style={{
  animation: 'slideInUp 0.3s ease-out'
}}>
  Slide Up Animation
</div>

<div style={{
  animation: 'scaleIn 0.3s ease-out'
}}>
  Scale In Animation
</div>
```

---

## 组件库

YYC³ Design System 提供了一系列可复用的 UI 组件，位于 `/yyc3-Design-System/src/components/` 目录。

### 可用组件

#### Button（按钮）

```tsx
import { Button } from '@/yyc3-Design-System/src/components/Button';

<Button variant="default" size="md">
  Default Button
</Button>

<Button variant="destructive" size="lg">
  Destructive Button
</Button>

<Button variant="outline" size="sm">
  Outline Button
</Button>
```

#### Card（卡片）

```tsx
import { Card } from '@/yyc3-Design-System/src/components/Card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

#### Input（输入框）

```tsx
import { Input } from '@/yyc3-Design-System/src/components/Input';

<Input placeholder="Enter text..." />
<Input type="password" placeholder="Password" />
<Input disabled placeholder="Disabled input" />
```

#### 更多组件

- **Select**: 下拉选择器
- **Checkbox**: 复选框
- **Radio**: 单选框
- **Switch**: 开关
- **Slider**: 滑块
- **Progress**: 进度条
- **Badge**: 徽章
- **Avatar**: 头像
- **Dialog**: 对话框
- **Dropdown**: 下拉菜单
- **Tooltip**: 工具提示
- **Toast**: 通知提示

### 组件使用最佳实践

1. **优先使用 Design System 组件**，而不是自定义组件
2. **使用设计令牌**而不是硬编码样式
3. **遵循组件的 API 规范**，不要随意修改组件内部样式
4. **保持组件的可访问性**，使用正确的语义化标签
5. **测试组件在不同主题下的表现**，确保深色/浅色主题都正常

---

## 主题系统

YYC³ Design System 支持深色和浅色主题切换。

### 主题令牌

#### 深色主题（默认）

```css
:root {
  --background: #050505;
  --foreground: #cbd5e0;
  --card: #111111;
  --card-foreground: #cbd5e0;
  --primary: #0EA5E9;
  --primary-foreground: #ffffff;
  /* ... 更多主题令牌 */
}
```

#### 浅色主题

```css
.light {
  --background: #f7fafc;
  --foreground: #1a365d;
  --card: #ffffff;
  --card-foreground: #1a365d;
  --primary: #1a365d;
  --primary-foreground: #ffffff;
  /* ... 更多主题令牌 */
}
```

### 切换主题

```tsx
import { useTheme } from '@/yyc3-Design-System/src/theme/useTheme';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
    </button>
  );
};
```

### 自定义主题

可以通过覆盖 CSS 变量来自定义主题：

```css
:root {
  --primary: #custom-color;
  --radius-lg: 1rem;
  /* ... 更多自定义令牌 */
}
```

---

## 动画系统

YYC³ Design System 提供了一套完整的动画系统，包括预定义的动画和动画工具函数。

### 预定义动画

#### 淡入淡出

```tsx
<div className="animate-fade-in">
  Fade In
</div>

<div className="animate-fade-out">
  Fade Out
</div>
```

#### 滑动动画

```tsx
<div className="animate-slide-in-up">
  Slide In Up
</div>

<div className="animate-slide-in-down">
  Slide In Down
</div>

<div className="animate-slide-in-left">
  Slide In Left
</div>

<div className="animate-slide-in-right">
  Slide In Right
</div>
```

#### 缩放动画

```tsx
<div className="animate-scale-in">
  Scale In
</div>

<div className="animate-scale-out">
  Scale Out
</div>
```

#### 旋转动画

```tsx
<div className="animate-rotate-in">
  Rotate In
</div>
```

#### 弹跳动画

```tsx
<div className="animate-bounce-in">
  Bounce In
</div>
```

### 自定义动画

```tsx
import { animations } from '@/yyc3-Design-System/src/utils/animations';

const customAnimation = {
  name: 'customPulse',
  keyframes: `
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  `,
  duration: '1s',
  easing: 'ease-in-out'
};

// 使用自定义动画
<div style={{
  animation: `${customAnimation.name} ${customAnimation.duration} ${customAnimation.easing}`
}}>
  Custom Animation
</div>
```

### 动画最佳实践

1. **使用预定义动画**，避免重复实现
2. **控制动画时长**，避免过长的动画影响用户体验
3. **使用合适的缓动函数**，让动画更自然
4. **考虑性能**，优先使用 transform 和 opacity 属性
5. **提供动画关闭选项**，尊重用户的偏好设置

---

## 最佳实践

### 1. 使用设计令牌

✅ **推荐**

```tsx
<div style={{
  backgroundColor: 'var(--primary)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)'
}}>
  Content
</div>
```

❌ **不推荐**

```tsx
<div style={{
  backgroundColor: '#0EA5E9',
  borderRadius: '0.5rem',
  boxShadow: '0px 6px 20px -4px #0a0a0a'
}}>
  Content
</div>
```

### 2. 保持一致性

✅ **推荐**

```tsx
// 所有按钮使用相同的组件
<Button variant="primary">Button 1</Button>
<Button variant="primary">Button 2</Button>
```

❌ **不推荐**

```tsx
// 每个按钮都自定义样式
<button style={{ backgroundColor: '#0EA5E9' }}>Button 1</button>
<button style={{ backgroundColor: '#0EA5E9', padding: '8px' }}>Button 2</button>
```

### 3. 响应式设计

✅ **推荐**

```tsx
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

❌ **不推荐**

```tsx
<div style={{ padding: '16px' }}>
  Fixed padding
</div>
```

### 4. 可访问性

✅ **推荐**

```tsx
<button 
  aria-label="Close dialog"
  onClick={handleClose}
>
  Close
</button>
```

❌ **不推荐**

```tsx
<button onClick={handleClose}>
  X
</button>
```

### 5. 性能优化

✅ **推荐**

```tsx
// 使用 transform 和 opacity
<div style={{
  transform: 'translateX(0)',
  opacity: 1,
  transition: 'all 0.3s ease'
}}>
  Content
</div>
```

❌ **不推荐**

```tsx
// 避免使用 top/left
<div style={{
  left: 0,
  top: 0,
  transition: 'all 0.3s ease'
}}>
  Content
</div>
```

---

## 常见问题

### Q: 如何更新 Design System？

A: 运行以下命令更新 Design System：

```bash
cd yyc3-Design-System
git pull origin main
npm install
npm run build:tokens
```

### Q: 如何自定义设计令牌？

A: 编辑 `/yyc3-Design-System/design/tokens.json` 文件，然后运行 `npm run build:tokens` 重新生成令牌。

### Q: 如何添加新的组件？

A: 在 `/yyc3-Design-System/src/components/` 目录下创建新组件，并遵循现有的组件结构。

### Q: 如何在不同主题下测试组件？

A: 使用 ThemeProvider 包裹组件，并通过 setTheme 方法切换主题：

```tsx
import { ThemeProvider } from '@/yyc3-Design-System/src/theme/ThemeProvider';

<ThemeProvider initialTheme="dark">
  <YourComponent />
</ThemeProvider>
```

### Q: Design System 支持哪些框架？

A: Design System 支持 React、Vue、Svelte 等主流框架。组件位于各自的框架目录下。

### Q: 如何报告问题或提出建议？

A: 请在项目的 GitHub Issues 中提交问题或建议，并附上详细的描述和复现步骤。

---

## 更新日志

### v1.3.0 (2026-02-19)

#### 新增
- 集成到 YYC³-HKCT 主项目
- 添加 Design System 视图和示例
- 完善用户文档
- 优化构建流程

#### 改进
- 修复 ES 模块兼容性问题
- 优化设计令牌生成
- 改进深色主题支持

#### 修复
- 修复 TypeScript 类型定义问题
- 修复动画令牌生成错误

---

## 附录

### 相关资源

- **Design System 目录**: `/yyc3-Design-System/`
- **设计令牌源文件**: `/yyc3-Design-System/design/tokens.json`
- **组件目录**: `/yyc3-Design-System/src/components/`
- **主题配置**: `/yyc3-Design-System/src/theme/`
- **构建输出**: `/yyc3-Design-System/dist/`

### 技术栈

- **React 18**: UI 框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Style Dictionary**: 设计令牌管理
- **Storybook**: 组件文档
- **OKLCH**: 现代色彩空间

### 联系方式

如有问题或建议，请联系：
- **邮箱**: admin@0379.email
- **GitHub**: [项目仓库]

---

**© 2026 YYC³ Design System. All rights reserved.**