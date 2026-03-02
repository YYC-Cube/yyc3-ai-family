# YYC³ Family-π³ Figma AI 设计指南

> **文档版本**: 1.0.0  
> **生成日期**: 2026 年 3 月 1 日  
> **适用范围**: Figma 设计稿创建、AI 辅助设计、Design-to-Code 流水线  
> **目标读者**: UI/UX 设计师、前端工程师、AI Agent 开发者

---

## 目录

1. [设计哲学与原则](#1-设计哲学与原则)
2. [设计系统核心规范](#2-设计系统核心规范)
3. [赛博朋克设计语言](#3-赛博朋克设计语言)
4. [Figma 组件库规范](#4-figma-组件库规范)
5. [AI 辅助设计工作流](#5-ai-辅助设计工作流)
6. [MCP Figma 集成](#6-mcp-figma-集成)
7. [Design-to-Code 流水线](#7-design-to-code 流水线)
8. [设计交付与协作](#8-设计交付与协作)
9. [设计质量检查清单](#9-设计质量检查清单)
10. [附录：设计资源](#10-附录设计资源)

---

## 1. 设计哲学与原则

### 1.1 五高五标五化 (5H-5S-5M)

YYC³ 的设计体系遵循"五高五标五化"质量框架，确保设计输出的一致性和高质量。

#### 五高 (Five Highs) - 设计质量标准

| 标识符 | 名称 | 设计实现 |
|--------|------|----------|
| **H1** | **高可用性** | 无障碍设计 (WCAG 2.1 AA)、对比度 ≥4.5:1、键盘导航支持 |
| **H2** | **高性能** | 组件懒加载、虚拟滚动、60fps 动画 |
| **H3** | **高安全性** | 敏感信息遮蔽、安全边界视觉提示、审计日志可视化 |
| **H4** | **高可扩展性** | 模块化组件、设计令牌系统、主题变量 |
| **H5** | **高智能化** | AI 辅助布局、智能配色生成、自动化设计审查 |

#### 五标 (Five Standards) - 设计协作语言

| 标识符 | 名称 | 设计实现 |
|--------|------|----------|
| **S1** | **标准化接口** | 统一组件 API、Props 命名规范、事件处理一致 |
| **S2** | **标准化数据** | 设计令牌 JSON Schema、组件变体命名规范 |
| **S3** | **标准化流程** | 设计审查流程、版本控制规范、交付物清单 |
| **S4** | **标准化组件** | shadcn/ui + Radix 原语、设计令牌系统 |
| **S5** | **标准化文档** | 组件文档模板、使用示例、最佳实践 |

#### 五化 (Five Modernizations) - 设计持续演进

| 标识符 | 名称 | 设计实现 |
|--------|------|----------|
| **M1** | **自动化** | Design-to-Code 自动生成、设计令牌同步 |
| **M2** | **智能化** | AI 布局建议、智能配色、自动无障碍检查 |
| **M3** | **可视化** | 设计系统文档站、组件预览沙盒 |
| **M4** | **容器化** | Figma 组件库版本管理、设计令牌打包 |
| **M5** | **生态化** | 社区组件贡献、第三方插件集成 |

### 1.2 设计核心价值观

```
┌─────────────────────────────────────────────────────────┐
│                    YYC³ 设计价值观                       │
├─────────────────────────────────────────────────────────┤
│  🎯 实用为基 | 效率为积                                  │
│  💎 赛博朋克美学 × 现代极简主义                          │
│  🤖 人机协同设计：AI 作为设计伙伴                         │
│  ♿ 无障碍优先：包容性设计                                │
│  📐 系统化思维：设计令牌驱动                             │
│  🔄 持续演进：版本化设计系统                             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 设计系统核心规范

### 2.1 色彩系统

#### 2.1.1 品牌原色

```css
/* 品牌主色 - 科技蓝 */
--color-brand-900: #1a365d;  /* Brand Main - 深色背景 */
--color-brand-500: #3182ce;  /* Interaction/Accent - 交互强调 */

/* 状态色 */
--color-success-500: #38a169;  /* 成功/正常 */
--color-error-500:   #e53e3e;  /* 错误/危险 */
--color-warning-500: #dd6b20;  /* 警告/注意 */
--color-info-500:    #3182ce;  /* 信息/提示 */
```

#### 2.1.2 中性色阶

| 色阶 | Token | Hex | 用途 |
|------|-------|-----|------|
| 900 | `--color-gray-900` | `#171923` | 深色背景 |
| 800 | `--color-gray-800` | `#2d3748` | 卡片背景 |
| 700 | `--color-gray-700` | `#4a5568` | 边框/分隔线 |
| 600 | `--color-gray-600` | `#718096` | 次要文本 |
| 500 | `--color-gray-500` | `#a0aec0` | 占位文本 |
| 300 | `--color-gray-300` | `#cbd5e0` | 边框 |
| 100 | `--color-gray-100` | `#edf2f7` | 浅色背景 |
| 50  | `--color-gray-50`  | `#f7fafc` | 画布背景 |

#### 2.1.3 语义色 (Dark Theme)

```css
:root {
  /* 背景层 */
  --background: #050505;
  --card: #111111;
  --popover: #111111;
  
  /* 前景层 */
  --foreground: #cbd5e0;
  --card-foreground: #cbd5e0;
  
  /* 交互层 */
  --primary: #0EA5E9;           /* 科技蓝 - 主交互色 */
  --primary-foreground: #ffffff;
  --secondary: #1a365d;
  --secondary-foreground: #ffffff;
  --accent: #1a202c;
  --accent-foreground: #0EA5E9;
  
  /* 状态层 */
  --destructive: #ef4444;       /* 错误红 */
  --destructive-foreground: #ffe4e6;
  --success: #22c55e;           /* 成功绿 */
  --success-foreground: #c6f6d5;
  
  /* 辅助层 */
  --muted: #171923;
  --muted-foreground: #718096;
  --border: #2d3748;
  --input: #2d3748;
  --ring: #0EA5E9;
}
```

#### 2.1.4 Agent 专属色

| 智能体 | 颜色 | Hex | 用途 |
|--------|------|-----|------|
| **Navigator (领航员)** | 琥珀色 | `#F59E0B` | 指挥调度 |
| **Thinker (思想家)** | 蓝色 | `#3B82F6` | 深度推理 |
| **Prophet (先知)** | 紫色 | `#8B5CF6` | 趋势预测 |
| **Bole (伯乐)** | 粉色 | `#EC4899` | 模型评估 |
| **Pivot (天枢)** | 青色 | `#06B6D4` | 状态管理 |
| **Sentinel (哨兵)** | 红色 | `#EF4444` | 安全防护 |
| **Grandmaster (宗师)** | 绿色 | `#10B981` | 知识构建 |

### 2.2 字体系统

#### 2.2.1 字体栈

```css
/* 无衬线字体 - 界面主体 */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, "Noto Sans", sans-serif;

/* 等宽字体 - 代码/终端 */
--font-mono: "JetBrains Mono", "Fira Code", ui-monospace,
             SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

#### 2.2.2 字体层级

| 元素 | 字号 | 字重 | 行高 | 字间距 |
|------|------|------|------|--------|
| H1 | 32px | 700 | 1.4 | 0.05em |
| H2 | 24px | 600 | 1.4 | 0.04em |
| H3 | 20px | 600 | 1.5 | 0.03em |
| H4 | 18px | 500 | 1.5 | 0.02em |
| H5 | 16px | 500 | 1.6 | 0.02em |
| H6 | 14px | 500 | 1.6 | 0.02em |
| Body | 14-16px | 400 | 1.6 | 0.02em |
| Small | 12px | 400 | 1.4 | 0.01em |
| Code | 13px | 400 | 1.5 | 0em |

#### 2.2.3 多语言字间距

```css
/* 中文文本增加字间距以提升可读性 */
:lang(zh) {
  letter-spacing: 0.05em;
}

/* 英文文本保持紧凑 */
:lang(en) {
  letter-spacing: 0.01em;
}
```

### 2.3 间距系统

#### 2.3.1 基础网格

基于 **4px** 基础网格的间距系统：

| Token | 值 | 用途 |
|-------|-----|------|
| `space-1` | 4px | 最小间距 |
| `space-2` | 8px | 紧凑间距 |
| `space-3` | 12px | 小组件间距 |
| `space-4` | 16px | 标准间距 |
| `space-5` | 20px | 中等间距 |
| `space-6` | 24px | 大间距 |
| `space-8` | 32px | 区块间距 |
| `space-10` | 40px | 大区块间距 |
| `space-12` | 48px | 页面间距 |
| `space-16` | 64px | 超大间距 |

#### 2.3.2 布局间距规范

```css
/* 页面容器 */
.page-container {
  padding: 1.5rem 2rem;  /* 24px 32px */
  max-width: 1280px;
  margin: 0 auto;
}

/* 区块间距 */
.section-spacing {
  padding: 2rem 0;  /* 32px */
}

/* 堆叠间距 */
.stack-sm { gap: 0.5rem; }   /* 8px - 紧凑列表 */
.stack-md { gap: 1rem; }     /* 16px - 标准列表 */
.stack-lg { gap: 2rem; }     /* 32px - 大区块 */
```

### 2.4 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `radius-sm` | 4px | 小按钮、标签 |
| `radius-md` | 6px | 输入框、卡片 |
| `radius-lg` | 8px | 大卡片、模态框 |
| `radius-xl` | 12px | 特殊组件 |
| `radius-full` | 9999px | 圆形、胶囊形 |

### 2.5 阴影系统

```css
/* 层级阴影 */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* 赛博朋克发光效果 */
--glow-primary: 0 0 10px rgba(14, 165, 233, 0.5),
                0 0 20px rgba(14, 165, 233, 0.3);
--glow-success: 0 0 10px rgba(34, 197, 94, 0.5);
--glow-error:   0 0 10px rgba(239, 68, 68, 0.5);
```

### 2.6 动效系统

#### 2.6.1 持续时间

| Token | 值 | 用途 |
|-------|-----|------|
| `duration-fast` | 150ms | 悬停状态、小交互 |
| `duration-normal` | 200-300ms | 标准动画 |
| `duration-slow` | 400-500ms | 页面转场、大动画 |

#### 2.6.2 缓动函数

```css
/* 标准缓动 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* 弹性缓动 */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### 2.6.3 动画类型

| 动画名 | 用途 | 持续时间 |
|--------|------|----------|
| `fade-in` | 淡入 | 200ms |
| `fade-out` | 淡出 | 200ms |
| `slide-up` | 上滑进入 | 300ms |
| `slide-down` | 下滑进入 | 300ms |
| `scale-in` | 缩放进入 | 200ms |
| `spin` | 旋转加载 | 持续 |
| `pulse` | 脉冲提示 | 2s |
| `shimmer` | 骨架屏闪烁 | 2s |

---

## 3. 赛博朋克设计语言

### 3.1 核心视觉特征

```
┌─────────────────────────────────────────────────────────┐
│              YYC³ 赛博朋克设计元素                        │
├─────────────────────────────────────────────────────────┤
│  🌃 深色主题：#050505 背景，降低视觉疲劳                   │
│  💡 霓虹发光：主色调 #0EA5E9 发光效果                    │
│  📺 CRT 扫描线：复古显示器纹理叠加                        │
│  🪞 玻璃拟态：半透明模糊面板                             │
│  🔲 科技边框：细边框 + 角标装饰                          │
│  ⚡ 数据流：动态粒子/线条动画                            │
│  🔤 等宽字体：终端风格文本                               │
│  🎨 高对比：状态色鲜明突出                               │
└─────────────────────────────────────────────────────────┘
```

### 3.2 CRT 扫描线效果

```css
.scanline {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.03) 50%
  );
  background-size: 100% 2px;
  opacity: 0.15;
}
```

**Figma 实现方法**:
1. 创建覆盖全画布的矩形
2. 填充：线性渐变 (透明 → `rgba(0,0,0,0.25)` → 透明)
3. 渐变角度：90°
4. 混合模式：Overlay，不透明度 15%

### 3.3 霓虹发光效果

```css
.glow-text {
  text-shadow: 0 0 10px rgba(14, 165, 233, 0.5),
               0 0 20px rgba(14, 165, 233, 0.3);
}

.glow-primary {
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.5),
              0 0 20px rgba(14, 165, 233, 0.3),
              inset 0 0 5px rgba(14, 165, 233, 0.1);
}
```

**Figma 实现方法**:
1. 选择文本/形状
2. 效果 → 投影：
   - 混合模式：Linear Dodge (Add)
   - 颜色：`#0EA5E9`
   - 不透明度：50%
   - X/Y 偏移：0
   - 模糊：10-20px
3. 添加内阴影增强效果

### 3.4 玻璃拟态效果

```css
.glass-panel {
  background: rgba(17, 17, 17, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

**Figma 实现方法**:
1. 创建矩形
2. 填充：`rgba(17, 17, 17, 0.7)`
3. 效果 → 背景模糊：12px
4. 描边：`rgba(255, 255, 255, 0.1)`，1px

### 3.5 科技边框装饰

```css
.tech-border {
  position: relative;
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.tech-border::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 20px;
  height: 20px;
  border-top: 2px solid #0EA5E9;
  border-left: 2px solid #0EA5E9;
}

.tech-border::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 20px;
  height: 20px;
  border-bottom: 2px solid #0EA5E9;
  border-right: 2px solid #0EA5E9;
}
```

### 3.6 数据流动画

```css
@keyframes data-flow {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.data-stream {
  position: relative;
  overflow: hidden;
}

.data-stream::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #0EA5E9,
    transparent
  );
  animation: data-flow 2s infinite;
}
```

---

## 4. Figma 组件库规范

### 4.1 组件命名规范

```
Category/Component/Variant
├───┬───────┬─────────┬────────┐
│   │       │         │ State
│   │       │    Size/Variants
│   │   Component Name
│ Category
```

**示例**:
```
Button/Primary/Default
Button/Primary/Hover
Button/Primary/Disabled
Button/Secondary/Small
Input/Text/Default
Input/Text/Error
Input/Text/Focused
Card/Stat/Default
Card/Stat/Expanded
```

### 4.2 Auto Layout 规范

#### 4.2.1 基础原则

```
┌─────────────────────────────────────────┐
│  Auto Layout 配置规范                    │
├─────────────────────────────────────────┤
│  • 方向：根据内容选择 Horizontal/Vertical │
│  • 间距：使用 4px 网格系统                │
│  • 内边距：至少 12px                     │
│  • 对齐：根据组件功能选择                │
│  • 填充：Hug contents / Fill container   │
└─────────────────────────────────────────┘
```

#### 4.2.2 按钮组件 Auto Layout

```
Button (Frame)
├── Direction: Horizontal
├── Gap: 8px
├── Padding: 12px 16px
├── Align: Center
└── Resizing: Hug contents

Button Content
├── Icon (optional, 16x16)
└── Label (Text)
```

### 4.3 组件变体系统

#### 4.3.1 Button 组件变体

| Property | Values |
|----------|--------|
| `variant` | `primary`, `secondary`, `outline`, `ghost`, `destructive` |
| `size` | `sm`, `md`, `lg`, `icon` |
| `state` | `default`, `hover`, `pressed`, `disabled`, `loading` |
| `icon` | `true`, `false` |

#### 4.3.2 Input 组件变体

| Property | Values |
|----------|--------|
| `type` | `text`, `password`, `email`, `number`, `search` |
| `state` | `default`, `focused`, `error`, `disabled` |
| `size` | `sm`, `md`, `lg` |
| `prefix` | `true`, `false` |
| `suffix` | `true`, `false` |

### 4.4 设计令牌 (Design Tokens)

#### 4.4.1 颜色令牌

```json
{
  "color": {
    "brand": {
      "primary": { "value": "#0EA5E9" },
      "secondary": { "value": "#1a365d" }
    },
    "semantic": {
      "success": { "value": "#22c55e" },
      "error": { "value": "#ef4444" },
      "warning": { "value": "#f59e0b" },
      "info": { "value": "#3b82f6" }
    },
    "neutral": {
      "900": { "value": "#171923" },
      "800": { "value": "#2d3748" },
      "700": { "value": "#4a5568" },
      "600": { "value": "#718096" },
      "500": { "value": "#a0aec0" },
      "300": { "value": "#cbd5e0" },
      "100": { "value": "#edf2f7" },
      "50": { "value": "#f7fafc" }
    }
  }
}
```

#### 4.4.2 间距令牌

```json
{
  "spacing": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" },
    "md": { "value": "12px" },
    "lg": { "value": "16px" },
    "xl": { "value": "20px" },
    "2xl": { "value": "24px" },
    "3xl": { "value": "32px" },
    "4xl": { "value": "48px" }
  }
}
```

### 4.5 核心组件清单

#### 4.5.1 基础组件 (40+)

| 类别 | 组件 | 变体数 |
|------|------|--------|
| **Button** | Button, IconButton, ToggleButton | 20 |
| **Input** | TextInput, TextArea, SearchInput, PasswordInput | 16 |
| **Select** | Select, MultiSelect, ComboBox | 12 |
| **Checkbox** | Checkbox, CheckboxGroup | 8 |
| **Radio** | Radio, RadioGroup | 8 |
| **Switch** | Switch, Toggle | 6 |
| **Slider** | Slider, RangeSlider | 6 |
| **Progress** | Progress, ProgressBar, CircularProgress | 6 |

#### 4.5.2 布局组件

| 组件 | 用途 | 变体 |
|------|------|------|
| `Card` | 内容卡片 | 4 |
| `Panel` | 面板容器 | 3 |
| `Modal` | 模态框 | 5 |
| `Drawer` | 抽屉 | 4 |
| `Accordion` | 手风琴 | 3 |
| `Tabs` | 标签页 | 4 |

#### 4.5.3 反馈组件

| 组件 | 用途 | 变体 |
|------|------|------|
| `Alert` | 警告提示 | 5 |
| `Toast` | 轻提示 | 4 |
| `Skeleton` | 加载骨架 | 6 |
| `Spinner` | 加载旋转 | 3 |
| `Empty` | 空状态 | 5 |

#### 4.5.4 导航组件

| 组件 | 用途 | 变体 |
|------|------|------|
| `Sidebar` | 侧边栏 | 4 |
| `Navbar` | 导航栏 | 3 |
| `Breadcrumb` | 面包屑 | 2 |
| `Pagination` | 分页器 | 3 |
| `Menu` | 下拉菜单 | 4 |

---

## 5. AI 辅助设计工作流

### 5.1 AI 辅助设计场景

```
┌─────────────────────────────────────────────────────────┐
│              AI 辅助设计场景矩阵                          │
├─────────────────────────────────────────────────────────┤
│  🎨 智能配色：基于品牌色生成和谐配色方案                   │
│  📐 自动布局：根据内容自动生成最优布局                    │
│  ♿ 无障碍检查：自动检测对比度、焦点管理问题               │
│  🔄 组件推荐：根据场景推荐合适组件                        │
│  📊 设计审查：自动检查设计系统一致性                      │
│  🖼️ 资源生成：自动生成图标、插图、背景                    │
│  📝 文案优化：AI 生成/优化界面文案                        │
│  🔧 代码生成：Design-to-Code 自动转换                     │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Agent 辅助设计流程

```
用户输入设计需求
       │
       ▼
┌──────────────┐
│ 意图解析引擎  │ ←── Agent: Pivot (状态管理)
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ 智能体路由    │────►│  Navigator   │ 路径规划
└──────┬───────┘     └──────────────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Thinker    │ │   Prophet    │ │    Bole      │
│ 架构设计     │ │ 风险评估     │ │ 组件推荐     │
└──────────────┘ └──────────────┘ └──────────────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ▼
                  ┌──────────────┐
                  │ Grandmaster  │ 综合决策
                  └──────┬───────┘
                         ▼
                  ┌──────────────┐
                  │   Sentinel   │ 安全检查
                  └──────┬───────┘
                         ▼
                  输出设计方案
```

### 5.3 AI 提示词模板

#### 5.3.1 配色方案生成

```
你是一位专业的 UI 设计师，请为以下场景生成配色方案：

**场景**: {场景描述，如 "DevOps 监控仪表盘"}
**品牌色**: #0EA5E9 (科技蓝)
**风格**: 赛博朋克 + 现代极简
**要求**:
- 主色、辅色、强调色
- 成功/警告/错误状态色
- 背景/前景/边框中性色
- 符合 WCAG 2.1 AA 对比度标准

请输出 JSON 格式的配色方案。
```

#### 5.3.2 布局建议生成

```
你是一位资深的 UX 设计师，请为以下页面提供布局建议：

**页面类型**: {如 "数据仪表盘"}
**核心内容**:
- 集群拓扑图
- 实时指标图表
- 日志流
- 操作按钮

**目标用户**: DevOps 工程师
**设备**: 桌面端 (1920x1080)

请提供：
1. 信息层级划分
2. 区域布局建议 (网格系统)
3. 交互优先级排序
```

#### 5.3.3 无障碍检查

```
你是一位无障碍设计专家，请检查以下设计稿的无障碍合规性：

**检查项**:
- 颜色对比度 (文本/背景 ≥4.5:1)
- 焦点可见性
- 键盘导航路径
- 屏幕阅读器友好性
- 错误提示可访问性

**设计稿**: [上传 Figma 链接或截图]

请输出检查报告和修复建议。
```

### 5.4 设计审查 AI 工作流

```typescript
// AI 辅助设计审查脚本示例
interface DesignReviewResult {
  score: number;           // 总体评分 (0-100)
  issues: DesignIssue[];   // 问题列表
  suggestions: string[];   // 改进建议
}

interface DesignIssue {
  severity: 'critical' | 'major' | 'minor';
  category: 'color' | 'typography' | 'spacing' | 'a11y';
  description: string;
  location: string;        // Figma 节点路径
  suggestion: string;
}

// 调用 AI Agent 进行设计审查
async function reviewDesign(figmaFileKey: string): Promise<DesignReviewResult> {
  const agent = getAgent('sentinel'); // Sentinel 负责安全检查
  
  const result = await agent.review({
    type: 'design_audit',
    figmaFileKey,
    checks: ['contrast', 'spacing', 'typography', 'a11y'],
  });
  
  return result;
}
```

---

## 6. MCP Figma 集成

### 6.1 MCP Figma Server 配置

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp",
        "--figma-api-key=YOUR_FIGMA_API_KEY"
      ],
      "env": {
        "FIGMA_API_KEY": "figd_xxxxxxxxxxxxxxxxxxxxxxxxx",
        "FIGMA_TEAM_ID": "your_team_id"
      }
    }
  }
}
```

### 6.2 Figma MCP 能力

| 方法 | 用途 | 参数 |
|------|------|------|
| `figma_get_file` | 获取 Figma 文件完整数据 | `fileKey`, `depth` |
| `figma_get_node` | 获取指定节点属性 | `fileKey`, `nodeId` |
| `figma_get_styles` | 提取设计系统 Token | `fileKey` |
| `figma_export_assets` | 导出 SVG/PNG 资源 | `fileKey`, `nodeIds`, `format` |
| `figma_get_comments` | 获取设计评审评论 | `fileKey`, `nodeId` |

### 6.3 设计令牌提取工作流

```
┌─────────────┐
│ Figma 文件   │
└──────┬──────┘
       │ figma_get_styles
       ▼
┌─────────────┐
│ MCP Server  │
└──────┬──────┘
       │ 返回设计令牌 JSON
       ▼
┌─────────────┐
│ 令牌处理器   │ → 格式转换 (JSON → CSS/TS)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 代码仓库     │ → 自动提交 PR
└─────────────┘
```

### 6.4 设计稿同步自动化

```yaml
# .github/workflows/figma-sync.yml
name: Figma Design Sync

on:
  push:
    branches: [main]
    paths: ['src/app/components/ui/**']

jobs:
  sync-figma:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install MCP CLI
        run: npm install -g @modelcontextprotocol/cli
      
      - name: Sync Design Tokens
        run: |
          mcp call figma figma_get_styles \
            --fileKey ${{ secrets.FIGMA_FILE_KEY }} \
            --output tokens.json
      
      - name: Commit Changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/styles/tokens.css
          git commit -m "chore: sync design tokens from Figma" || exit 0
          git push
```

### 6.5 组件代码生成

```typescript
// 使用 MCP Figma 生成 React 组件
async function generateComponentFromFigma(
  fileKey: string,
  nodeId: string
): Promise<string> {
  // 1. 获取节点数据
  const nodeData = await mcpCall('figma', 'figma_get_node', {
    fileKey,
    nodeId,
  });
  
  // 2. 提取样式属性
  const styles = extractStyles(nodeData.styles);
  
  // 3. 生成组件代码
  const componentCode = generateReactComponent({
    name: nodeData.name,
    props: extractProps(nodeData),
    styles,
    children: nodeData.children,
  });
  
  return componentCode;
}

// 示例输出
const generatedCode = `
import React from 'react';
import { cn } from '@/lib/utils';

export interface CyberCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function CyberCard({ title, children, className }: CyberCardProps) {
  return (
    <div className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      'border-cyan-500/20 bg-zinc-900/50 backdrop-blur',
      className
    )}>
      <div className="flex items-center gap-2 p-4 border-b border-white/5">
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        <h3 className="font-semibold text-cyan-400">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
`;
```

---

## 7. Design-to-Code 流水线

### 7.1 流水线架构

```
┌─────────────────────────────────────────────────────────┐
│              Design-to-Code 流水线                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Figma Design  →  Token Extract  →  Code Generation    │
│       │              │                   │              │
│       ▼              ▼                   ▼              │
│  ┌────────┐    ┌────────┐         ┌────────┐           │
│  │ 设计稿  │    │ 令牌   │         │ React  │           │
│  │ .fig   │    │ JSON   │         │ 组件   │           │
│  └────────┘    └────────┘         └────────┘           │
│                                                         │
│  Quality Check  ←  Type Generation  ←  Style Export    │
│       │                   │                   │         │
│       ▼                   ▼                   ▼         │
│  ┌────────┐         ┌────────┐         ┌────────┐      │
│  │ 审查   │         │ TS     │         │ CSS    │      │
│  │ 报告   │         │ 类型   │         │ 令牌   │      │
│  └────────┘         └────────┘         └────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.2 设计令牌导出

```javascript
// figma-export-tokens.js
const figma = require('figma-js');

async function exportDesignTokens(fileKey) {
  const client = figma({
    token: process.env.FIGMA_ACCESS_TOKEN,
  });
  
  // 获取文件中的所有样式
  const { data: styles } = await client.fileStyles(fileKey);
  
  // 获取文件中的所有组件
  const { data: components } = await client.fileComponents(fileKey);
  
  // 转换为设计令牌格式
  const tokens = {
    color: transformColorStyles(styles.colors),
    typography: transformTextStyles(styles.textStyles),
    effect: transformEffectStyles(styles.effectStyles),
    component: transformComponents(components),
  };
  
  // 导出为 JSON
  return JSON.stringify(tokens, null, 2);
}
```

### 7.3 组件代码生成器

```typescript
// component-generator.ts
interface ComponentTemplate {
  name: string;
  props: PropDefinition[];
  styles: StyleDefinition[];
  children?: ComponentTemplate[];
}

function generateReactComponent(template: ComponentTemplate): string {
  const { name, props, styles } = template;
  
  const interfaceCode = generateInterface(name, props);
  const componentCode = generateComponentBody(name, props, styles);
  
  return `
import React from 'react';
import { cn } from '@/lib/utils';

${interfaceCode}

${componentCode}
`.trim();
}

function generateInterface(name: string, props: PropDefinition[]): string {
  const propsName = `${name}Props`;
  
  return `
export interface ${propsName} {
${props.map(p => `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`).join('\n')}
}
`.trim();
}
```

### 7.4 质量检查自动化

```yaml
# .github/workflows/design-quality-check.yml
name: Design Quality Check

on:
  pull_request:
    paths: ['src/app/components/**', 'src/styles/**']

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run accessibility check
        run: npm run lint:a11y
      
      - name: Run design token check
        run: npm run check:tokens
      
      - name: Run component test
        run: npm test -- src/app/components
      
      - name: Generate quality report
        run: npm run report:quality
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: quality-report
          path: reports/quality-report.html
```

### 7.5 自动化发布流程

```yaml
# .github/workflows/design-system-release.yml
name: Design System Release

on:
  push:
    tags: ['design-system-v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Build design tokens
        run: npm run build:tokens
      
      - name: Build components
        run: npm run build:components
      
      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
      
      - name: Update Figma library
        run: npm run sync:figma
        env:
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
```

---

## 8. 设计交付与协作

### 8.1 设计交付物清单

```
┌─────────────────────────────────────────────────────────┐
│              设计交付物清单                              │
├─────────────────────────────────────────────────────────┤
│  📐 Figma 设计文件                                       │
│     ├── 设计系统库 (Design System Library)              │
│     ├── 组件库 (Component Library)                      │
│     ├── 页面模板 (Page Templates)                       │
│     └── 原型交互 (Interactive Prototypes)               │
│                                                         │
│  📄 设计文档                                            │
│     ├── 设计规范文档 (Design Guidelines)                │
│     ├── 组件使用文档 (Component Documentation)          │
│     ├── 交互说明文档 (Interaction Specifications)       │
│     └── 无障碍指南 (Accessibility Guide)                │
│                                                         │
│  🎨 设计资源                                            │
│     ├── 设计令牌 (Design Tokens JSON)                   │
│     ├── 图标库 (Icon Library SVG)                       │
│     ├── 插图库 (Illustration Library)                   │
│     └── 品牌资产 (Brand Assets)                         │
│                                                         │
│  💻 代码资源                                            │
│     ├── React 组件库                                    │
│     ├── CSS/Tailwind 配置                              │
│     ├── TypeScript 类型定义                            │
│     └── Storybook 文档站                               │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Figma 文件组织规范

```
YYC3 Design System/
├── 📘 00_Cover (封面)
├── 📗 01_Design_System (设计系统)
│   ├── Foundations (基础)
│   │   ├── Colors (色彩)
│   │   ├── Typography (字体)
│   │   ├── Spacing (间距)
│   │   ├── Shadows (阴影)
│   │   └── Effects (效果)
│   └── Components (组件)
│       ├── Buttons (按钮)
│       ├── Inputs (输入框)
│       ├── Cards (卡片)
│       └── ...
├── 📙 02_Pages (页面)
│   ├── Terminal (终端视图)
│   ├── Console (控制台视图)
│   ├── Projects (项目视图)
│   └── Settings (设置视图)
├── 📕 03_Prototypes (原型)
│   ├── User_Flows (用户流程)
│   └── Interactions (交互)
└── 📔 04_Archive (归档)
    ├── Deprecated (已废弃)
    └── Experiments (实验性)
```

### 8.3 设计审查流程

```
┌─────────────┐
│ 设计稿完成   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 自审        │ 设计师自查设计系统一致性
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AI 审查      │ Sentinel Agent 自动检查
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 团队审查     │ 设计评审会议
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 开发审查     │ 前端工程师可行性评估
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 定稿        │ 标记为 Ready for Dev
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 开发实现     │ Design-to-Code
└─────────────┘
```

### 8.4 设计版本控制

```
设计系统版本规范：v{Major}.{Minor}.{Patch}

v1.0.0  - 初始发布
v1.1.0  - 新增组件 (Button 变体)
v1.1.1  - Bug 修复 (颜色对比度)
v2.0.0  - 重大更新 (新色彩系统)
```

**版本发布检查清单**:
- [ ] 更新 Figma 组件库
- [ ] 更新设计令牌 JSON
- [ ] 更新 React 组件包
- [ ] 更新 Storybook 文档
- [ ] 发布说明 (Changelog)
- [ ] 通知相关团队

---

## 9. 设计质量检查清单

### 9.1 视觉设计检查

| 检查项 | 标准 | 检查方法 |
|--------|------|----------|
| 色彩一致性 | 使用设计令牌定义的颜色 | Figma 样式检查 |
| 字体层级 | 符合字体规范 | 文本样式检查 |
| 间距统一 | 使用 4px 网格系统 | Auto Layout 检查 |
| 圆角一致 | 使用统一圆角令牌 | 组件检查 |
| 阴影层级 | 符合阴影系统 | 效果检查 |

### 9.2 交互设计检查

| 检查项 | 标准 | 检查方法 |
|--------|------|----------|
| 悬停状态 | 所有可交互元素有 hover 态 | 原型测试 |
| 焦点管理 | 键盘 Tab 导航顺序合理 | 键盘测试 |
| 加载状态 | 异步操作有 loading 反馈 | 流程测试 |
| 错误提示 | 表单验证有清晰错误提示 | 边界测试 |
| 空状态 | 空数据有引导性空状态 | 场景测试 |

### 9.3 无障碍检查

| 检查项 | 标准 | 检查方法 |
|--------|------|----------|
| 颜色对比度 | 文本/背景 ≥4.5:1 | Contrast Checker |
| 焦点可见 | 焦点环清晰可见 | 键盘导航测试 |
| 屏幕阅读器 | ARIA 标签完整 | Screen Reader 测试 |
| 缩放支持 | 支持 200% 缩放 | 浏览器缩放测试 |
| 动画控制 | 提供减少动画选项 | 系统设置测试 |

### 9.4 响应式检查

| 检查项 | 标准 | 检查方法 |
|--------|------|----------|
| 断点覆盖 | 支持 320px-1920px+ | 多设备测试 |
| 布局适配 | 各断点布局合理 | 响应式模式测试 |
| 触摸友好 | 触摸目标 ≥44px | 移动端测试 |
| 横竖屏 | 横竖屏切换正常 | 设备旋转测试 |

### 9.5 性能检查

| 检查项 | 标准 | 检查方法 |
|--------|------|----------|
| 图片优化 | WebP/AVIF 格式，适当压缩 | 文件大小检查 |
| 动画性能 | 60fps，避免 layout shift | DevTools Performance |
| 加载优化 | 骨架屏、懒加载 | 网络节流测试 |
| 代码分割 | 按需加载组件 | Bundle Analyzer |

---

## 10. 附录：设计资源

### 10.1 设计工具

| 工具 | 用途 | 链接 |
|------|------|------|
| Figma | 主设计工具 | figma.com |
| Figma MCP | Figma API 集成 | npmjs.com/package/figma-developer-mcp |
| Stark | 无障碍检查 | getstark.co |
| Contrast | 颜色对比度检查 | contrast-checker.com |
| Zeroheight | 设计系统文档 | zeroheight.com |

### 10.2 设计资源

| 资源 | 描述 | 链接 |
|------|------|------|
| YYC3 Design System | Figma 设计库 | [内部链接] |
| shadcn/ui | UI 组件参考 | ui.shadcn.com |
| Radix UI | 无障碍原语 | radix-ui.com |
| Tailwind CSS | 原子化 CSS | tailwindcss.com |
| Lucide Icons | 图标库 | lucide.dev |

### 10.3 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Figma 官方教程 | 视频教程 | help.figma.com |
| Design Systems Handbook | 书籍 | invisionapp.com/design-systems-handbook |
| Web Content Accessibility Guidelines | 标准 | w3.org/WAI/WCAG21/Quickref |
| Material Design | 设计系统 | material.io/design |

### 10.4 内部资源

| 资源 | 位置 |
|------|------|
| Figma 设计文件 | [Figma YYC3 Design System] |
| Storybook 文档站 | [内部 Storybook 链接] |
| 设计令牌 JSON | `src/styles/tokens.json` |
| 组件源码 | `src/app/components/ui/` |
| 设计审查报告 | `docs/YYC3-AF-原型设计/` |

---

## 文档信息

| 项目 | 信息 |
|------|------|
| **文档名称** | YYC³ Family-π³ Figma AI 设计指南 |
| **版本** | 1.0.0 |
| **生成日期** | 2026 年 3 月 1 日 |
| **作者** | YYC³ Design Team |
| **审核者** | YYC³ AI Agents (Navigator, Thinker, Bole) |
| **状态** | ✅ 已发布 |
| **下次审查** | 2026 年 6 月 1 日 |

---

> **设计理念**: 实用为基、效率为积、人机协同、智爱同行  
> **设计愿景**: 构建赛博朋克美学与极致体验并存的 DevOps 智能平台
