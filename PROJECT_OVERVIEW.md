# Nebula Desk 项目概览

## 项目简介

Nebula Desk 是一个基于 React + Vite 的智能对话工作台前端，包含聊天主页面、设置页、技能/智能体/工具/MCP 视图，以及本地历史对话留存能力。

## 技术栈

- React `19.2.6`
- React DOM `19.2.6`
- Vite `8.0.12`
- ESLint `10.3.0`
- `@vitejs/plugin-react` `6.0.1`

## 快速启动

```bash
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## 核心目录

- `src/app/` - 应用入口组合层
- `src/pages/` - 页面级组件
- `src/api/` - 后端接口定义
- `src/utils/` - 通用请求与工具
- `src/services/` - 本地持久化与历史对话逻辑
- `src/i18n/` - 多语言文案
- `src/styles/` - 全局样式
- `public/` - 静态资源

## 运行配置

- `VITE_API_BASE_URL`：后端基础地址
- `VITE_API_PROXY_TARGET`：开发环境代理目标
- `VITE_USE_MOCK_CHAT`：是否启用 mock 流式回复

## 入口文件

- `src/main.jsx`
- `src/app/App.jsx`
- `src/pages/HomePage.jsx`

