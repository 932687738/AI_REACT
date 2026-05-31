# Nebula Desk 主题架构参考

本文件供 `custom-theme-planner` 在清单齐全、开始写代码时阅读。

## 现有文件职责

| 文件 | 职责 |
| --- | --- |
| `src/constants/theme.js` | 主题 id 常量、`themeOptions`、`brandByTheme`、`resolveBrandMark` |
| `src/hooks/useTheme.js` | `localStorage` 读写、`document.documentElement.dataset.theme` |
| `src/main.jsx` | 首屏前 `applyTheme(readStoredTheme())`，避免闪烁 |
| `src/app/App.jsx` | 组合 `useTheme`，向 `HomePage` 传递 `theme` / `onThemeChange` |
| `src/pages/SettingsPage.jsx` | 主题下拉选择 UI |
| `src/pages/HomePage.jsx` | 侧边栏品牌、账户头像、欢迎图随 `resolveBrandMark(theme)` 切换 |
| `src/styles/index.css` | 默认深色（yxy）+ `[data-theme='dzj']` 浅色覆盖块 |
| `src/i18n/messages.js` | `theme` / `themeXxx` 文案 |

## 新增主题 checklist

1. **`src/constants/theme.js`**
   - 在 `THEMES` 增加常量（小写 id，如 `foo: 'foo'`）
   - 加入 `themeOptions`（`labelKey` 指向 i18n）
   - 若有品牌图，加入 `brandByTheme` 并 import 资源
   - 更新 `isValidTheme`

2. **`src/i18n/messages.js`**
   - 中英文各加 `themeXxx` 展示名

3. **`src/styles/index.css`**
   - 追加 `[data-theme='新id'] { ... }` 覆盖块
   - 覆盖：`:root` 背景、`.sidebar`、`.composer`、`.bubble`、`.settings-*`、按钮/输入等高频区域
   - **浅色主题必查**：侧边栏历史区覆盖清单（见下文）

4. **文档**
   - `CHANGELOG.md`、`PROBLEM_MAPPING.md`（若架构变化则 `ARCHITECTURE.md`）

## 浅色主题侧边栏历史区覆盖清单

默认深色（yxy）在 `:root` 为以下类定义了 **background / border**，浅色主题若只改 `color` 会出现灰色空状态框等视觉残留。

| 选择器 | 需覆盖属性 | 说明 |
| --- | --- | --- |
| `.sidebar__module-title` | `color` | 标题建议使用主色半透明，勿与次要文案混在同一规则 |
| `.sidebar__history-empty` | `color`, `background`, `border` | 「暂无聊天内容」空状态；**不能只改文字色** |
| `.sidebar__history-more` | `background`, `color`, `border-color` | 历史项「更多」按钮 |
| `.sidebar__history` | `scrollbar-color` | Firefox 滚动条 |
| `.sidebar__history::-webkit-scrollbar-thumb` | `background` | WebKit 滚动条 |
| `.sidebar__history-item` | `background`, `border-color`, `color` | 已有，保持与主题一致 |
| `.sidebar__history-input` / `.sidebar__history-edit` / `.sidebar__history-menu` | 全套 | 重命名、菜单弹层 |

**参考实现**：`[data-theme='dzj']` 与 `[data-theme='lv']` 中 `.sidebar__history-empty` 独立规则块。

**验收**：切换至新浅色主题后，侧边栏「历史对话」标题、空状态虚线框、滚动条均应与主色/白底协调，无深灰 `#0f172a` 半透明底残留。

## 命名约定

- 主题 id：小写英文短码（如 `dzj`、`yxy`）
- Storage key：`nebula_desk_theme`（共用，值为 theme id）
- HTML 属性：`document.documentElement.dataset.theme = 'xxx'`
- CSS 选择器：`[data-theme='xxx']`
- i18n key：`theme`（标签）、`themeXxx`（选项名）

## 交互风格默认值（沿用，除非用户明确要求变更）

来自 `src/styles/index.css`：

- 圆角：卡片 `18–22px`，按钮 `12–16px`，pill `999px`
- 过渡：`transform / background / border-color / opacity`，`0.2s ease`
- 悬浮：`translateY(-1px)`（见 `.composer__send:hover` 等）
- 间距：设置卡片 gap `14px`，sidebar padding `22px 18px`
- 阴影：卡片 `0 18px 48px rgba(0,0,0,0.22)`；浅色主题降为蓝色调阴影

## 品牌资源

- 路径：`src/assets/brand-{themeId}.png`
- 使用处：`.brand-mark`、`.brand-avatar`、`.welcome-panel__image`、`.settings-profile__avatar`
