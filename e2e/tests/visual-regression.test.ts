/**
 * YYC³ Family-π³ Visual Regression Tests
 * 视觉回归测试 - UI 快照对比
 */

import { test, expect } from '@playwright/test';

// ============================================================
// Test Suite 1: Homepage Visual Regression
// ============================================================

test.describe('Homepage Visual Regression', () => {
  test('should match homepage snapshot (desktop)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: false,
      maxDiffPixels: 100, // Allow some pixel differences
    });
  });

  test('should match homepage snapshot (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('should match homepage snapshot (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: false,
      maxDiffPixels: 120,
    });
  });

  test('should match homepage dark theme snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify dark theme is applied
    const backgroundColor = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundColor
    );
    
    // Dark background should have low RGB values
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const avgRgb = (parseInt(rgbMatch[1]) + parseInt(rgbMatch[2]) + parseInt(rgbMatch[3])) / 3;
      expect(avgRgb).toBeLessThan(50); // Dark theme
    }
    
    await expect(page).toHaveScreenshot('homepage-dark-theme.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });
});

// ============================================================
// Test Suite 2: Console View Visual Regression
// ============================================================

test.describe('Console View Visual Regression', () => {
  test('should match console dashboard snapshot', async ({ page }) => {
    await page.goto('/?tab=dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('console-dashboard.png', {
      fullPage: false,
      maxDiffPixels: 150,
    });
  });

  test('should match cluster topology snapshot', async ({ page }) => {
    await page.goto('/?tab=dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Focus on cluster topology area
    const clusterTopology = page.getByTestId('cluster-topology');
    
    if (await clusterTopology.isVisible()) {
      await expect(clusterTopology).toHaveScreenshot('cluster-topology.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('should match metrics chart snapshot', async ({ page }) => {
    await page.goto('/?tab=dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for metrics to load
    
    const metricsChart = page.getByTestId('metrics-chart');
    
    if (await metricsChart.isVisible()) {
      await expect(metricsChart).toHaveScreenshot('metrics-chart.png', {
        maxDiffPixels: 200, // Charts may have slight variations
      });
    }
  });

  test('should match AI agent view snapshot', async ({ page }) => {
    await page.goto('/?tab=ai');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('console-ai-agents.png', {
      fullPage: false,
      maxDiffPixels: 150,
    });
  });

  test('should match DevOps workspace snapshot', async ({ page }) => {
    await page.goto('/?tab=devops');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('console-devops.png', {
      fullPage: false,
      maxDiffPixels: 150,
    });
  });
});

// ============================================================
// Test Suite 3: Settings Modal Visual Regression
// ============================================================

test.describe('Settings Modal Visual Regression', () => {
  test('should match settings modal snapshot (general tab)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open settings
    await page.getByRole('button', { name: /设置/i }).click();
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('settings-general.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });

  test('should match settings modal snapshot (models tab)', async ({ page }) => {
    await page.goto('/?tab=settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Switch to models tab
    await page.getByRole('tab', { name: /模型/i }).click();
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('settings-models.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });

  test('should match settings modal snapshot (appearance tab)', async ({ page }) => {
    await page.goto('/?tab=settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Switch to appearance tab
    await page.getByRole('tab', { name: /外观/i }).click();
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('settings-appearance.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });
});

// ============================================================
// Test Suite 4: Component Visual Regression
// ============================================================

test.describe('Component Visual Regression', () => {
  test('should match chat input snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const chatInput = page.getByTestId('chat-input');
    
    if (await chatInput.isVisible()) {
      await expect(chatInput).toHaveScreenshot('chat-input.png', {
        maxDiffPixels: 50,
      });
    }
  });

  test('should match sidebar snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.getByTestId('sidebar');
    
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('sidebar.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('should match message bubble snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Send a test message
    const chatInput = page.getByPlaceholder(/输入/i);
    if (await chatInput.isVisible()) {
      await chatInput.fill('视觉回归测试消息');
      await page.getByRole('button', { name: /发送/i }).click();
      await page.waitForTimeout(2000);
    }
    
    // Screenshot message area
    const messageList = page.getByTestId('message-list');
    if (await messageList.isVisible()) {
      await expect(messageList).toHaveScreenshot('message-bubbles.png', {
        maxDiffPixels: 150,
      });
    }
  });

  test('should match agent card snapshot', async ({ page }) => {
    await page.goto('/?tab=ai');
    await page.waitForLoadState('networkidle');
    
    const agentList = page.getByTestId('agent-list');
    
    if (await agentList.isVisible()) {
      await expect(agentList).toHaveScreenshot('agent-cards.png', {
        maxDiffPixels: 150,
      });
    }
  });

  test('should match button states snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Capture different button states
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toHaveScreenshot(`button-state-${i}.png`, {
          maxDiffPixels: 30,
        });
      }
    }
  });
});

// ============================================================
// Test Suite 5: Responsive Design Visual Regression
// ============================================================

test.describe('Responsive Design Visual Regression', () => {
  const viewports = [
    { name: 'mobile-sm', width: 320, height: 568 },
    { name: 'mobile-md', width: 375, height: 667 },
    { name: 'mobile-lg', width: 414, height: 896 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop-sm', width: 1024, height: 768 },
    { name: 'desktop-md', width: 1280, height: 720 },
    { name: 'desktop-lg', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should match snapshot at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png', {
        fullPage: true,
        maxDiffPixels: 200,
      });
    });
  }
});

// ============================================================
// Test Suite 6: Animation Visual Regression
// ============================================================

test.describe('Animation Visual Regression', () => {
  test('should match loading animation snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Capture loading state
    await expect(page).toHaveScreenshot('loading-state.png', {
      fullPage: false,
      maxDiffPixels: 200, // Animations may vary
    });
  });

  test('should match modal open animation snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open settings modal
    await page.getByRole('button', { name: /设置/i }).click();
    
    // Capture mid-animation (after 150ms)
    await page.waitForTimeout(150);
    
    await expect(page).toHaveScreenshot('modal-open-animation.png', {
      fullPage: false,
      maxDiffPixels: 200,
    });
  });

  test('should match hover state snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hover over a button
    const button = page.getByRole('button', { name: /发送/i }).first();
    
    if (await button.isVisible()) {
      await button.hover();
      await page.waitForTimeout(200);
      
      await expect(button).toHaveScreenshot('button-hover-state.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('should match focus state snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Focus on input
    const input = page.getByPlaceholder(/输入/i);
    
    if (await input.isVisible()) {
      await input.focus();
      await page.waitForTimeout(200);
      
      await expect(input).toHaveScreenshot('input-focus-state.png', {
        maxDiffPixels: 100,
      });
    }
  });
});

// ============================================================
// Test Suite 7: Cyberpunk Theme Visual Regression
// ============================================================

test.describe('Cyberpunk Theme Visual Regression', () => {
  test('should match cyberpunk color scheme snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify cyberpunk color scheme
    const colors = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      
      return {
        backgroundColor: styles.backgroundColor,
        primaryColor: styles.getPropertyValue('--primary').trim(),
        accentColor: styles.getPropertyValue('--accent-foreground').trim(),
      };
    });
    
    // Verify dark background
    expect(colors.backgroundColor).toMatch(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/);
    
    // Verify primary color (tech blue #0EA5E9)
    expect(colors.primaryColor).toMatch(/#0EA5E9|rgb\(14,\s*165,\s*233\)/);
    
    await expect(page).toHaveScreenshot('cyberpunk-colors.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });

  test('should match glow effects snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for glow effects
    const glowElements = page.locator('.glow-text, [style*="text-shadow"]');
    
    if (await glowElements.count() > 0) {
      await expect(glowElements.first()).toHaveScreenshot('glow-effect.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('should match CRT scanline effect snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for scanline overlay
    const scanline = page.locator('.scanline');
    
    if (await scanline.count() > 0) {
      await expect(scanline.first()).toHaveScreenshot('scanline-effect.png', {
        maxDiffPixels: 150,
      });
    }
  });
});

// ============================================================
// Test Suite 8: Accessibility Visual Regression
// ============================================================

test.describe('Accessibility Visual Regression', () => {
  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check text contrast ratios
    const contrastIssues = await page.evaluate(() => {
      const elements = document.querySelectorAll('body *');
      const issues: string[] = [];
      
      for (const el of Array.from(elements)) {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        // Skip invisible or transparent elements
        if (color === 'rgba(0, 0, 0, 0)' || bgColor === 'rgba(0, 0, 0, 0)') {
          continue;
        }
        
        // Simple contrast check (production should use proper WCAG formula)
        const textBrightness = parseInt(color.match(/\d+/g)?.[0] || '0');
        const bgBrightness = parseInt(bgColor.match(/\d+/g)?.[0] || '0');
        
        if (Math.abs(textBrightness - bgBrightness) < 128) {
          issues.push(el.tagName);
        }
      }
      
      return issues;
    });
    
    // Should have minimal contrast issues
    expect(contrastIssues.length).toBeLessThan(5);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through elements and verify focus visibility
    const focusVisible = await page.evaluate(() => {
      const interactiveElements = document.querySelectorAll(
        'button, input, a, [tabindex]:not([tabindex="-1"])'
      );
      
      let allVisible = true;
      
      for (const el of Array.from(interactiveElements).slice(0, 5)) {
        el.focus();
        const styles = window.getComputedStyle(el);
        const outline = styles.outline;
        const boxShadow = styles.boxShadow;
        
        if (outline === 'none' && !boxShadow) {
          allVisible = false;
          break;
        }
      }
      
      return allVisible;
    });
    
    expect(focusVisible).toBe(true);
  });
});
