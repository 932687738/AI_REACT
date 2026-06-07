import { message } from 'antd';

interface HttpErrorLike {
  response?: { status?: number };
  data?: { message?: string };
  message?: string;
}

export function isPlatformUnauthorizedError(err: unknown): boolean {
  const e = err as HttpErrorLike;
  return e?.response?.status === 401;
}

export function getPlatformErrorMessage(err: unknown, fallback: string): string {
  const e = err as HttpErrorLike;
  return e?.data?.message || e?.message || fallback;
}

export function handlePlatformUnauthorized(
  err: unknown,
  openSettings: () => void,
  unauthorizedMessage: string,
): boolean {
  if (!isPlatformUnauthorizedError(err)) {
    return false;
  }
  message.error(unauthorizedMessage);
  openSettings();
  return true;
}
