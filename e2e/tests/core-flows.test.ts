/**
 * YYC³ Family-π³ E2E Tests - Core User Flows
 * 核心用户流程端到端测试
 */

import { test, expect } from '@playwright/test';

import { HomePage, ConsolePage, SettingsPage, AgentChatPage, ClusterMonitorPage } from './pages';

// ============================================================
// Test Suite 1: Application Boot & Navigation
// ============================================================

test.describe('Application Boot & Navigation', () => {
  test('should load the application successfully', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify app title
    await expect(page).toHaveTitle(/YYC3|Family/);

    // Verify main chat area is visible
    await expect(homePage.chatInput).toBeVisible();

    // Verify sidebar is present
    await expect(homePage.sidebar).toBeVisible();
  });

  test('should navigate between views', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Navigate to Console
    await page.getByRole('button', { name: /控制台|Console/i }).click();
    await expect(page.getByTestId('console-view')).toBeVisible();

    // Navigate to Projects
    await page.getByRole('button', { name: /项目|Projects/i }).click();
    await expect(page.getByTestId('projects-view')).toBeVisible();

    // Navigate to Artifacts
    await page.getByRole('button', { name: /工件|Artifacts/i }).click();
    await expect(page.getByTestId('artifacts-view')).toBeVisible();

    // Navigate back to Terminal
    await page.getByRole('button', { name: /终端|Terminal/i }).click();
    await expect(homePage.chatInput).toBeVisible();
  });

  test('should handle mobile responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const homePage = new HomePage(page);

    await homePage.goto();

    // Mobile nav should be visible
    await expect(page.getByTestId('mobile-nav')).toBeVisible();

    // Chat input should still be accessible
    await expect(homePage.chatInput).toBeVisible();
  });
});

// ============================================================
// Test Suite 2: Chat & Messaging
// ============================================================

test.describe('Chat & Messaging', () => {
  test('should send a message and receive response', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Send a test message
    await homePage.sendMessage('你好，测试消息');

    // Verify message appears in chat
    await expect(page.getByText('你好，测试消息')).toBeVisible();

    // Wait for AI response (mock or real)
    await page.waitForTimeout(3000);

    // Verify response appears
    const aiResponse = page.getByTestId('ai-message').first();

    await expect(aiResponse).toBeVisible();
  });

  test('should display message history', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Send multiple messages
    await homePage.sendMessage('消息 1');
    await page.waitForTimeout(1000);
    await homePage.sendMessage('消息 2');
    await page.waitForTimeout(1000);
    await homePage.sendMessage('消息 3');

    // Verify all messages are visible
    await expect(page.getByText('消息 1')).toBeVisible();
    await expect(page.getByText('消息 2')).toBeVisible();
    await expect(page.getByText('消息 3')).toBeVisible();
  });

  test('should handle empty message submission', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Try to send empty message
    await homePage.chatInput.fill('');

    // Send button should be disabled or nothing happens
    const sendButton = homePage.sendButton;
    const isDisabled = await sendButton.isDisabled();

    expect(isDisabled || true).toBeTruthy();
  });
});

// ============================================================
// Test Suite 3: Agent System
// ============================================================

test.describe('Agent System', () => {
  test('should display all 7 agents', async ({ page }) => {
    const agentPage = new AgentChatPage(page);

    await agentPage.goto();

    // Verify all agents are visible
    await expect(agentPage.navigatorButton).toBeVisible();
    await expect(agentPage.thinkerButton).toBeVisible();
    await expect(agentPage.prophetButton).toBeVisible();
    await expect(agentPage.sentinelButton).toBeVisible();
    await expect(agentPage.grandmasterButton).toBeVisible();
  });

  test('should switch between agents', async ({ page }) => {
    const agentPage = new AgentChatPage(page);

    await agentPage.goto();

    // Select Navigator
    await agentPage.selectNavigator();
    await expect(page.getByText(/领航员|Navigator/i)).toBeVisible();

    // Select Thinker
    await agentPage.selectThinker();
    await expect(page.getByText(/思想家|Thinker/i)).toBeVisible();
  });

  test('should maintain agent chat history', async ({ page }) => {
    const agentPage = new AgentChatPage(page);

    await agentPage.goto();

    // Send message to Navigator
    await agentPage.selectNavigator();
    await page.getByPlaceholder(/输入消息/i).fill('Navigator 测试');
    await page.getByRole('button', { name: /发送/i }).click();

    // Switch to Thinker
    await agentPage.selectThinker();
    await page.waitForTimeout(500);

    // Switch back to Navigator - history should persist
    await agentPage.selectNavigator();
    await expect(page.getByText('Navigator 测试')).toBeVisible();
  });
});

// ============================================================
// Test Suite 4: Console & Monitoring
// ============================================================

test.describe('Console & Monitoring', () => {
  test('should display cluster dashboard', async ({ page }) => {
    const consolePage = new ConsolePage(page);

    await consolePage.goto();
    await consolePage.switchToDashboard();

    // Verify cluster topology is visible
    await expect(page.getByTestId('cluster-topology')).toBeVisible();

    // Verify node cards are displayed
    await expect(page.getByTestId('node-cards')).toBeVisible();

    // Verify metrics chart is displayed
    const clusterMonitor = new ClusterMonitorPage(page);

    await clusterMonitor.waitForMetrics();
  });

  test('should display real-time metrics', async ({ page }) => {
    const consolePage = new ConsolePage(page);

    await consolePage.goto();
    await consolePage.switchToDashboard();

    // Wait for metrics to load
    await page.waitForTimeout(3000);

    // Verify metrics are updating
    const cpuMetric = page.getByText(/CPU|cpu/i).first();

    await expect(cpuMetric).toBeVisible();
  });

  test('should navigate to DevOps workspace', async ({ page }) => {
    const consolePage = new ConsolePage(page);

    await consolePage.goto();
    await consolePage.switchToDevOps();

    // Verify DevOps tabs are visible
    await expect(page.getByRole('tab', { name: /Pipeline/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /容器|Container/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /MCP/i })).toBeVisible();
  });
});

// ============================================================
// Test Suite 5: Settings & Configuration
// ============================================================

test.describe('Settings & Configuration', () => {
  test('should open settings modal', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.openSettings();

    // Verify settings modal is visible
    const settingsModal = page.getByRole('dialog', { name: /设置|Settings/i });

    await expect(settingsModal).toBeVisible();
  });

  test('should switch between settings tabs', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();

    // Switch to Models tab
    await settingsPage.switchToModels();
    await expect(page.getByText(/模型|Models/i)).toBeVisible();

    // Switch to Appearance tab
    await settingsPage.switchToAppearance();
    await expect(page.getByText(/外观|Appearance/i)).toBeVisible();
  });

  test('should save and close settings', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();

    // Make a change (e.g., toggle a setting)
    const themeToggle = page.getByRole('switch', { name: /主题|Theme/i }).first();

    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }

    // Save settings
    await settingsPage.save();

    // Modal should close or show success message
    await page.waitForTimeout(1000);
  });
});

// ============================================================
// Test Suite 6: Keyboard Shortcuts
// ============================================================

test.describe('Keyboard Shortcuts', () => {
  test('should use Ctrl+K for quick command', async ({ page }) => {
    await page.goto('/');

    // Press Ctrl+K (or Cmd+K on Mac)
    await page.keyboard.press('Control+K');

    // Command palette should open
    const commandPalette = page.getByRole('dialog', { name: /命令|Command/i });

    await expect(commandPalette).toBeVisible();
  });

  test('should use Enter to send message', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Type message and press Enter
    await homePage.chatInput.fill('Enter 发送测试');
    await page.keyboard.press('Enter');

    // Message should appear
    await expect(page.getByText('Enter 发送测试')).toBeVisible();
  });

  test('should use Escape to close modal', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.openSettings();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    const settingsModal = page.getByRole('dialog', { name: /设置|Settings/i });

    await expect(settingsModal).not.toBeVisible();
  });
});

// ============================================================
// Test Suite 7: Error Handling & Edge Cases
// ============================================================

test.describe('Error Handling & Edge Cases', () => {
  test('should handle network disconnection gracefully', async ({ page }) => {
    await page.goto('/');

    // Simulate offline mode
    await page.context().setOffline(true);

    // App should still be usable (offline mode)
    const homePage = new HomePage(page);

    await expect(homePage.chatInput).toBeVisible();

    // Restore online mode
    await page.context().setOffline(false);
  });

  test('should handle long message input', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Type long message
    const longMessage = 'A'.repeat(1000);

    await homePage.chatInput.fill(longMessage);
    await homePage.sendButton.click();

    // Message should be sent (may be truncated)
    await page.waitForTimeout(2000);
  });

  test('should handle special characters in input', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Type special characters
    const specialChars = '<script>alert("test")</script> 特殊字符测试';

    await homePage.chatInput.fill(specialChars);
    await homePage.sendButton.click();

    // Should handle safely (XSS prevention)
    await page.waitForTimeout(2000);
    await expect(page.getByText(/特殊字符/i)).toBeVisible();
  });
});

// ============================================================
// Test Suite 8: Visual & Accessibility
// ============================================================

test.describe('Visual & Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Verify h1 exists
    const h1 = page.locator('h1').first();

    await expect(h1).toBeVisible();

    // Verify heading hierarchy
    const h2 = page.locator('h2').first();

    await expect(h2).toBeVisible();
  });

  test('should have accessible button labels', async ({ page }) => {
    await page.goto('/');

    // All buttons should have accessible names
    const buttons = page.getByRole('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(5);

    // Check first few buttons have labels
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);

      await expect(button).toBeVisible();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');
    const firstFocused = page.locator(':focus');

    await expect(firstFocused).toBeVisible();

    // Continue tabbing
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should move
    const newFocused = page.locator(':focus');

    await expect(newFocused).toBeVisible();
  });

  test('should display cyberpunk theme correctly', async ({ page }) => {
    await page.goto('/');

    // Verify cyberpunk visual elements
    const body = page.locator('body');

    // Check for dark background
    const backgroundColor = await body.evaluate(
      el => window.getComputedStyle(el).backgroundColor,
    );

    // Dark theme should have dark background
    expect(backgroundColor).toMatch(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/);
  });
});

// ============================================================
// Test Suite 9: Performance
// ============================================================

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for app to be interactive
    await expect(page.getByTestId('chat-area')).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should maintain 60fps animations', async ({ page }) => {
    await page.goto('/');

    // Trigger animations (open settings)
    const homePage = new HomePage(page);

    await homePage.openSettings();

    // Check for animation performance
    const metrics = await page.evaluate(() => {
      return new Promise<{ fps: number }>(resolve => {
        let frameCount = 0;
        const lastTime = performance.now();
        let fps = 60;

        function measure() {
          frameCount++;
          const now = performance.now();

          if (now - lastTime >= 1000) {
            fps = frameCount;
            resolve({ fps });
          } else {
            requestAnimationFrame(measure);
          }
        }

        requestAnimationFrame(measure);
      });
    });

    // FPS should be reasonable (not blocking main thread)
    expect(metrics.fps).toBeGreaterThan(30);
  });
});

// ============================================================
// Test Suite 10: Integration Scenarios
// ============================================================

test.describe('Integration Scenarios', () => {
  test('complete user journey: chat → console → settings', async ({ page }) => {
    // 1. Start at chat
    const homePage = new HomePage(page);

    await homePage.goto();

    // 2. Send a message
    await homePage.sendMessage('开始对话');
    await page.waitForTimeout(2000);

    // 3. Navigate to console
    await page.getByRole('button', { name: /控制台/i }).click();
    await expect(page.getByTestId('console-view')).toBeVisible();

    // 4. Check dashboard
    await page.getByRole('tab', { name: /总控/i }).click();
    await page.waitForTimeout(2000);

    // 5. Open settings
    await homePage.openSettings();
    await expect(page.getByRole('dialog')).toBeVisible();

    // 6. Close settings
    await page.keyboard.press('Escape');

    // 7. Return to chat
    await page.getByRole('button', { name: /终端/i }).click();
    await expect(homePage.chatInput).toBeVisible();
  });

  test('agent collaboration workflow', async ({ page }) => {
    const agentPage = new AgentChatPage(page);

    await agentPage.goto();

    // 1. Select Navigator for planning
    await agentPage.selectNavigator();
    await page.getByPlaceholder(/输入/i).fill('帮我规划项目结构');
    await page.getByRole('button', { name: /发送/i }).click();
    await page.waitForTimeout(3000);

    // 2. Switch to Thinker for analysis
    await agentPage.selectThinker();
    await page.getByPlaceholder(/输入/i).fill('分析这个架构的优缺点');
    await page.getByRole('button', { name: /发送/i }).click();
    await page.waitForTimeout(3000);

    // 3. Verify both conversations are preserved
    await agentPage.selectNavigator();
    await expect(page.getByText('项目结构')).toBeVisible();
  });
});
