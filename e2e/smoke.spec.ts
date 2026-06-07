import { expect, test } from '@playwright/test';

const headings = {
  knowledge: /知识库会话|Knowledge session/i,
  agent: /智能体会话|Agent session/i,
  humanReview: /人工审核工作台|Human Review Workbench/i,
  kbManager: /知识库管理|Knowledge bases/i,
  skills: /Skill 管理台|Skill console/i,
  platformAgents: /平台 Agent 注册表|Platform agent registry/i,
  platformTools: /平台 Tool 摘要|Platform tool catalog/i,
  modelProviders: /模型厂商|Model providers/i,
  uncoveredIntents: /未覆盖意图|Uncovered intents/i,
  settings: /Nebula 用户|Nebula user/i,
};

test.describe('Nebula Desk smoke', () => {
  test('redirects home to knowledge chat', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/chat\/knowledge/);
    await expect(page.getByRole('heading', { level: 1, name: headings.knowledge })).toBeVisible();
  });

  test('core routes render', async ({ page }) => {
    const cases = [
      { path: '/chat/knowledge', heading: headings.knowledge, level: 1 as const },
      { path: '/chat/agent', heading: headings.agent, level: 1 as const },
      { path: '/chat/human-review', heading: headings.humanReview, level: 1 as const },
      { path: '/knowledge/bases', heading: headings.kbManager },
      { path: '/agent-hub/skills', heading: headings.skills, level: 1 as const },
      { path: '/agent-hub/platform-agents', heading: headings.platformAgents, level: 1 as const },
      { path: '/agent-hub/platform-tools', heading: headings.platformTools, level: 1 as const },
      { path: '/agent-hub/model-providers', heading: headings.modelProviders, level: 1 as const },
      { path: '/agent-hub/uncovered-intents', heading: headings.uncoveredIntents, level: 1 as const },
      { path: '/settings', heading: headings.settings, level: 1 as const },
    ];

    for (const item of cases) {
      await page.goto(item.path);
      const locator =
        item.level === 1
          ? page.getByRole('heading', { level: 1, name: item.heading })
          : page.getByRole('heading', { name: item.heading });
      await expect(locator).toBeVisible();
    }
  });

  test('knowledge chat sends a message', async ({ page }) => {
    await page.goto('/chat/knowledge');
    const input = page.locator('textarea').first();
    await input.fill('e2e smoke');
    await page.getByRole('button', { name: /发送|Send/i }).click();
    await expect(page.getByText('e2e smoke', { exact: true })).toBeVisible();
    await expect(page.locator('article').nth(1)).toBeVisible({ timeout: 20_000 });
  });
});
