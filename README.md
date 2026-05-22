# Nebula Desk

🤖 AI 留痕规范：本项目所有变更和结构均记录在 `PROJECT_OVERVIEW.md`、`HISTORY.md` 等文档中。任何新 AI 会话请先阅读 `DOCUMENTATION_GUIDE.md` 和上述文档，再修改代码。

Nebula Desk 是一个基于 React + Vite 的智能对话工作台，包含聊天页、设置页、技能/智能体/工具/MCP 页面，以及本地历史对话管理。

## 快速启动

```bash
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## 环境变量

把下面内容写入项目根目录的 `.env`：

```bash
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_USE_MOCK_CHAT=true
```

## 说明

- `VITE_API_BASE_URL`：后端基础地址，留空时走 Vite 代理
- `VITE_API_PROXY_TARGET`：开发环境代理目标
- `VITE_USE_MOCK_CHAT`：`true` 使用前端 mock，`false` 调用后端流式接口

## 文档入口

- `PROJECT_OVERVIEW.md`
- `ARCHITECTURE.md`
- `FILE_STRUCTURE.md`
- `CHANGELOG.md`
- `PROBLEM_MAPPING.md`
- `DOCUMENTATION_GUIDE.md`

