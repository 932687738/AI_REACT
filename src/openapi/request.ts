/**
 * 统一 REST 请求入口（配置见 src/app.tsx export request）。
 * SSE 流式见 src/utils/StreamSse.ts，仅 chatService 调用。
 */
export { request } from '@umijs/max';
