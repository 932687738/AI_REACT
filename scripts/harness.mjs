#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const command = process.argv[2];

function run(cmd, args, env = process.env) {
  return spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  });
}

function runOrExit(cmd, args, env = process.env) {
  const result = run(cmd, args, env);
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

const handlers = {
  install() {
    runOrExit('npm', ['install']);
  },
  dev() {
    runOrExit('npm', ['run', 'dev']);
  },
  lint() {
    runOrExit('npm', ['run', 'lint']);
  },
  build() {
    const e2eEnv = { ...process.env, HARNESS_E2E_BUILD: '1', MOCK_CHAT: 'true' };
    runOrExit('npx', ['max', 'build'], e2eEnv);
    runOrExit('npx', ['playwright', 'test'], e2eEnv);
  },
};

if (!command || !handlers[command]) {
  console.error('Usage: harness <install|dev|build|lint>');
  process.exit(1);
}

handlers[command]();
