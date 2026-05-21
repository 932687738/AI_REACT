# Nebula Desk

一个基于 React + Vite 的智能对话工作台前端项目，统一了聊天页、设置页和 Skills 页面结构。

## 启动

```bash
npm.cmd install
npm.cmd run dev
```

## 环境变量

把下面配置写到项目根目录的 `.env` 中：

```bash
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_USE_MOCK_CHAT=false
```

## 说明

- `VITE_API_BASE_URL`：后端基础地址，留空时走 Vite 代理。
- `VITE_API_PROXY_TARGET`：开发环境代理到的后端地址。
- `VITE_USE_MOCK_CHAT`：`true` 时使用前端 mock，`false` 时调用后端接口。

## 目录

```text
src/
  api/       后端接口定义
  app/       应用入口
  assets/    静态资源
  hooks/     自定义 Hook
  i18n/      多语言文案
  pages/     页面
  styles/    全局样式
  utils/     请求工具
```

## 接口

- `src/api/index.js`：统一接口地址
- `src/utils/request.js`：统一 `get / post / put / del / postStream`

## 备注

- 聊天流接口参考后端 `POST /api/agent-hub/chat`
- Skills 数据来自 `GET /api/agent-hub/status`
