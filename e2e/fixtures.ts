/**
 * Playwright Test Fixtures
 * 自定义测试夹具
 */

import { test as base } from '@playwright/test';
import { HomePage, ConsolePage, SettingsPage, AgentChatPage, ClusterMonitorPage } from './pages';

// Extend Playwright test with custom fixtures
export const test = base.extend<{
  homePage: HomePage;
  consolePage: ConsolePage;
  settingsPage: SettingsPage;
  agentPage: AgentChatPage;
  clusterMonitor: ClusterMonitorPage;
}>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await use(homePage);
  },

  consolePage: async ({ page }, use) => {
    const consolePage = new ConsolePage(page);
    await consolePage.goto();
    await use(consolePage);
  },

  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await use(settingsPage);
  },

  agentPage: async ({ page }, use) => {
    const agentPage = new AgentChatPage(page);
    await agentPage.goto();
    await use(agentPage);
  },

  clusterMonitor: async ({ page }, use) => {
    const clusterMonitor = new ClusterMonitorPage(page);
    await clusterMonitor.goto();
    await use(clusterMonitor);
  },
});

export { expect } from '@playwright/test';
