# 文档维护规范

## 基本规则

- 任何代码变更前，先阅读 `PROJECT_OVERVIEW.md`、`ARCHITECTURE.md`、`FILE_STRUCTURE.md`、`CHANGELOG.md`、`PROBLEM_MAPPING.md`。
- 每次代码变更后，必须更新 `CHANGELOG.md`。
- 若变更影响架构、目录或职责，必须同步更新 `ARCHITECTURE.md` 与 `FILE_STRUCTURE.md`。
- 若变更新增或修复了功能点，必须同步更新 `PROBLEM_MAPPING.md`。
- 重大变更、重构、依赖升级、初始化动作，必须追加到 `HISTORY.md`。

## 新对话顺序

新 AI 会话应优先读取：

1. `PROJECT_OVERVIEW.md`
2. `ARCHITECTURE.md`
3. `FILE_STRUCTURE.md`
4. `CHANGELOG.md`
5. `PROBLEM_MAPPING.md`

## 文档格式

- 使用 Markdown
- 优先使用标题、表格、列表
- 路径必须使用相对路径
- 不要写空占位内容

## 维护要求

- 新增文件后立即更新 `FILE_STRUCTURE.md`
- 新增页面、状态或接口时立即更新 `ARCHITECTURE.md`
- 调整功能定位时立即更新 `PROBLEM_MAPPING.md`
- 保持 `HISTORY.md` 中的推断说明不被删除

