/** 解析 Umi define 注入的环境变量，兼容空串被编译成 "" 或带引号的值 */
export function resolveEnvString(raw: string | undefined, fallback: string): string {
  let value = String(raw ?? '').trim();
  if (!value || value === '""' || value === "''") {
    return fallback;
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value || fallback;
}
