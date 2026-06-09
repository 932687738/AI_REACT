import type { IApi } from 'umi';
import { exec } from 'node:child_process';

function openInDefaultBrowser(url: string) {
  const command =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;

  exec(command, (error) => {
    if (error) {
      console.warn('[dev] Failed to open browser:', error.message);
    }
  });
}

export default (api: IApi) => {
  let opened = false;

  api.onDevCompileDone(({ isFirstCompile }) => {
    if (!isFirstCompile || opened) return;
    if (process.env.BROWSER === 'none') return;

    opened = true;

    const port = api.appData.port ?? (Number(process.env.PORT) || 8000);
    const hostRaw = api.appData.host ?? 'localhost';
    const host = hostRaw === '0.0.0.0' ? 'localhost' : hostRaw;

    openInDefaultBrowser(`http://${host}:${port}`);
  });
};
