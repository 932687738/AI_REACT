# Nebula Desk

一个基于 React + Vite 的智能对话工作台项目，已配置常见目录结构、`@/` 路径别名、多语言切换，以及统一的接口与请求工具。

## 启动

```bash
npm.cmd install
npm.cmd run dev
```

## 环境变量

当前开发环境默认通过 Vite 代理转发到本地后端：

```bash
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_USE_MOCK_CHAT=false
```

## 目录结构

```text
src/
  api/        后端接口定义
  app/        应用壳
  components/ 通用组件
  hooks/      自定义 hooks
  i18n/       多语言资源
  pages/      页面
  styles/     全局样式
  utils/      工具方法
```

## 路径别名

项目内统一使用 `@/` 指向 `src/`。

```js
import App from '@/app/App'
```

## 多语言

右上角设置面板内置语言切换，当前支持中文和英文，语言会自动保存在浏览器本地。

## 接口与请求

- `src/api/index.js` 统一存放后端接口
- `src/utils/request.js` 统一封装 `get / post / put / del`

## 常用命令

- `npm.cmd run dev` 开发启动
- `npm.cmd run build` 打包构建
- `npm.cmd run lint` 代码检查
