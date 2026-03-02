/**
 * Playwright Global Teardown
 * E2E 测试全局清理
 */

import { type FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log(`✅ Playwright E2E Tests Complete`);
  console.log(`📊 Report: ${config.reporter[0][0] === 'html' ? config.reporter[0][1]?.outputFolder : 'N/A'}`);
}

export default globalTeardown;
