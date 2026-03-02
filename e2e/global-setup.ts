/**
 * Playwright Global Setup
 * E2E 测试全局配置
 */

import { type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  console.log(`🚀 Playwright E2E Tests Starting...`);
  console.log(`📍 Base URL: ${baseURL}`);
  console.log(`🌐 Projects: ${config.projects.map(p => p.name).join(', ')}`);
  console.log(`⚙️  Workers: ${config.workers}`);
  console.log(`🔄 Retries: ${config.retries}`);
}

export default globalSetup;
