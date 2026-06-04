export const ALLOWED_UPLOAD_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.doc'] as const;

export const UPLOAD_FORMAT_LABELS = ['TXT', 'MD', 'PDF', 'DOCX', 'DOC'] as const;

export function isAllowedUploadFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_UPLOAD_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function formatDocumentTime(value: string | number | undefined, locale: string): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString(locale.startsWith('zh') ? 'zh-CN' : 'en-US');
}
