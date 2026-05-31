---
name: Nebula Desk
description: Agent Hub 智能对话工作台 — 沉稳可控的 AI 操作界面
colors:
  canvas-deep: "#030712"
  canvas-mid: "#07111f"
  ink-primary: "#e5eefb"
  ink-secondary: "#dbeafe"
  ink-muted: "#94a3b8"
  ink-subtle: "#64748b"
  accent-sky: "#38bdf8"
  accent-indigo: "#818cf8"
  accent-blue: "#2563eb"
  accent-blue-soft: "#60a5fa"
  surface-dark: "#0f172a"
  surface-glass: "rgba(2, 6, 23, 0.62)"
  surface-raised: "rgba(15, 23, 42, 0.72)"
  surface-composer: "rgba(2, 6, 23, 0.8)"
  border-subtle: "rgba(148, 163, 184, 0.12)"
  border-accent: "rgba(96, 165, 250, 0.22)"
  success-green: "#86efac"
  warning-amber: "#fcd34d"
  error-red: "#f87171"
  theme-dzj-bg: "#f0f9ff"
  theme-lv-bg: "#f0fdf4"
typography:
  display:
    fontFamily: "Inter, 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(2rem, 3vw, 2.8rem)"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  shell: "26px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "14px"
  lg: "18px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "rgba(37, 99, 235, 0.88)"
    textColor: "#e2e8f0"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "rgba(37, 99, 235, 0.95)"
    textColor: "#f8fafc"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  composer-shell:
    backgroundColor: "{colors.surface-composer}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.shell}"
    padding: "16px 18px 14px"
  bubble-assistant:
    backgroundColor: "rgba(15, 23, 42, 0.86)"
    textColor: "#e2e8f0"
    rounded: "{rounded.xl}"
    padding: "16px 18px"
---

# Design System: Nebula Desk

## Overview

**Creative North Star: "The Nebula Operations Deck"**

Nebula Desk 是一套面向长时间 AI 工作的 product 界面系统：深色星云画布为默认，辅以可切换的品牌浅色主题（dzj 浅蓝、lv 浅绿）。视觉语言强调**分层透明**（毛玻璃侧栏、raised surface）与**冷色 accent**（sky → indigo 渐变仅用于 avatar/icon 等小面积标识），避免消费级聊天或 SaaS 营销页的套路。

系统拒绝：hero 指标模板、全站 uppercase eyebrow、装饰性 gradient text、为「酷」而做的 glassmorphism 堆叠。深度主要通过 tonal layering 与细边框传达，阴影克制使用。

**Key Characteristics:**

- 280px 固定侧栏 + fluid 主区的 app shell
- 默认 dark canvas；三套 `[data-theme]` 浅色变体
- Inter 单族 + 字重/字号层级；圆角 8–26px 梯度
- 对话 composer 为视觉锚点（rounded shell + accent border）
- 模式 badge（知识库 / 智能体 / 需求开发）用颜色+文字双重编码

## Colors

深色默认画布由 `#07111f` → `#030712` 线性渐变叠加 radial 光斑（sky / indigo 低透明度）构成。

### Primary

- **Sky Signal** (#38bdf8): accent 高光、gradient 端点、流式光标（浅色主题下转为 #0284c7 / #16a34a）
- **Indigo Bridge** (#818cf8): 与 sky 组成 135° avatar/icon 渐变
- **Action Blue** (rgba(37, 99, 235, 0.88)): 主按钮、激活态菜单、用户气泡 tint

### Neutral

- **Ink Primary** (#e5eefb / #e2e8f0): 正文与标题（dark）
- **Ink Muted** (#94a3b8): 副文案、placeholder（dark 下需 vigilance 对比度）
- **Ink Subtle** (#64748b): section label、hint
- **Surface Raised** (rgba(15, 23, 42, 0.72)): 侧栏项、历史条目、bubble
- **Surface Glass** (rgba(2, 6, 23, 0.62)): 侧栏背景 + backdrop-filter blur(18px)

### Semantic

- **Knowledge Green** (#86efac): 知识库模式 badge
- **Agent Blue** (#93c5fd): 智能体模式 badge
- **Requirement Amber** (#fcd34d): 需求开发模式 badge
- **Error Red** (#f87171): 错误 bubble、destructive 操作

### Theme Variants

- **dzj**: 浅蓝白底 (#dbeafe → #ffffff)，accent #0369a1 / #0284c7
- **lv**: 浅绿白底 (#dcfce7 → #ffffff)，accent #15803d / #16a34a
- **default (dark)**: 无 data-theme 或 yxy 品牌资源；yxy 主题 CSS 待补齐

## Typography

**Character:** 单一 Inter 栈，靠字重与 clamp 尺度建立层级；label 允许 uppercase + letter-spacing 但仅限侧栏 section title（HISTORY 类），禁止每节 eyebrow 滥用。

### Hierarchy

- **Display** (600, clamp(1.8rem, 4vw, 2.8rem), 1.2): welcome 标题、skills 页 h1
- **Headline** (600, clamp(2rem, 3vw, 2.8rem), 1.2): skills section 级
- **Title** (600, 1.4rem, 1.3): chat topbar、settings 标题
- **Body** (400, 0.88–0.98rem, 1.5): 对话正文、表单项；聊天 thread 宽度 max ~960px
- **Label** (600, 0.78rem, 0.12em tracking, uppercase): 侧栏 `.sidebar__module-title`、`.sidebar__label`

## Elevation

系统以 **tonal layering + 细边框** 为主，阴影为辅。侧栏与 composer 使用中等 spread 阴影（0 24px 80px rgba(0,0,0,0.22)）强调浮层；卡片内项 mostly flat。

### Shadow Vocabulary

- **Brand mark** (`0 10px 30px rgba(0,0,0,0.28)`): logo 头像
- **Composer** (`0 24px 80px rgba(0,0,0,0.22)`): 输入区锚点
- **Dropdown / menu** (`0 18px 40px` – `0 24px 80px`): 历史菜单、account menu
- **Modal panel** (`0 24px 48px rgba(0,0,0,0.35)`): feedback modal

## Components

### Buttons

- **Shape:** 主操作 12px 圆角；pill 形用于 mode chip、shortcut
- **Primary:** Action Blue 底 + #e2e8f0 字；hover translateY(-1px)
- **Secondary:** surface-raised 底 + border-subtle；settings / sidebar 菜单同族
- **Disabled:** opacity 0.6，cursor not-allowed

### Cards / Containers

- **Corner:** 18–22px（skill-card、settings-card）；composer 26px
- **Background:** dark 下 semi-transparent slate；skills 列表区 skill-card 用白底 (#ffffff 96%) 形成 contrast panel
- **Border:** 1px rgba(148,163,184,0.08–0.16)
- **Padding:** 16–18px 标准内边距

### Inputs / Composer

- **Composer shell:** 26px 圆角容器，min-height textarea ~78px，accent border
- **Placeholder:** #94a3b8（浅色主题同样）；需满足 4.5:1
- **Mode bar:** pill toggle（composer-mode.is-active）

### Navigation

- **Sidebar:** 280px sticky；module trigger 带 inset 3px left accent（激活态加深）
- **Nested menu:** 38px 行高，dot marker ::before
- **Mobile (≤1024px):** 单列堆叠，侧栏非 sticky

### Chat Bubbles

- **Assistant:** slate raised，top-left 8px 切角
- **User:** blue tint rgba(37,99,235,0.16)，top-right 8px 切角
- **Error:** red tint border
- **Citations:** 分隔线 + 小字 source list

### Modals

- **Feedback modal:** fixed overlay z-index 1000，backdrop rgba(2,6,23,0.72)

## Do's and Don'ts

### Do:

- **Do** 保持 sidebar + main 壳层在所有 major screen 一致
- **Do** 用模式 badge 颜色+文字双重表达会话类型
- **Do** 限制 hero/display clamp max ≤ 2.8rem（product 密度优先）
- **Do** 新 surface 复用 composer、bubble、settings-card 既有圆角与 surface token
- **Do** 主题切换通过 `[data-theme]` 覆盖，保持同一组件结构

### Don't:

- **Don't** 做成通用 SaaS 仪表盘：紫渐变 hero、大数字 KPI、每节 uppercase eyebrow、icon 卡片无限网格
- **Don't** 模仿消费级 IM：纯圆角对称气泡、贴纸化、轻娱乐配色
- **Don't** 使用 gradient text（background-clip: text）做标题装饰
- **Don't** 默认 glassmorphism 堆叠；backdrop-filter 仅用于侧栏等已有层次
- **Don't** 在 colored background 上用 washed-out gray 正文；muted 文字需满足对比度
- **Don't** 新增未文档化的 z-index 魔法数（9999）；使用语义层级（dropdown 10 → modal 1000）
