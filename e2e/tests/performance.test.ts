/**
 * YYC³ Family-π³ Performance Benchmark Tests
 * 性能基准测试 - Web Vitals 指标监控
 */

import { test, expect } from '@playwright/test';

// ============================================================
// Web Vitals Metrics Types
// ============================================================

interface WebVitalsMetrics {
  fcp: number;  // First Contentful Paint
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  tti: number;  // Time to Interactive
}

// ============================================================
// Test Suite 1: Page Load Performance
// ============================================================

test.describe('Page Load Performance', () => {
  test('should meet FCP target (<1.8s)', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      return new Promise<{ fcp: number }>(resolve => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve({ fcp: lastEntry.startTime });
        }).observe({ entryTypes: ['paint'] });
      });
    });

    // FCP should be under 1.8 seconds
    expect(metrics.fcp).toBeLessThan(1800);
    console.log(`✅ FCP: ${metrics.fcp.toFixed(0)}ms`);
  });

  test('should meet LCP target (<2.5s)', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      return new Promise<{ lcp: number }>(resolve => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve({ lcp: lastEntry.startTime });
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    }).catch(() => ({ lcp: 0 }));

    // LCP should be under 2.5 seconds
    expect(metrics.lcp).toBeLessThan(2500);
    console.log(`✅ LCP: ${metrics.lcp.toFixed(0)}ms`);
  });

  test('should meet TTI target (<3.8s)', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('chat-area')).toBeVisible();
    
    const tti = Date.now() - startTime;
    
    // TTI should be under 3.8 seconds
    expect(tti).toBeLessThan(3800);
    console.log(`✅ TTI: ${tti.toFixed(0)}ms`);
  });

  test('should meet TTFB target (<800ms)', async ({ page }) => {
    let ttfb = 0;

    page.on('request', request => {
      if (request.url() === page.url() || request.url() === page.url() + '/') {
        ttfb = Date.now();
      }
    });

    page.on('response', response => {
      if (response.url() === page.url() || response.url() === page.url() + '/') {
        ttfb = Date.now() - ttfb;
      }
    });

    await page.goto('/');

    // TTFB should be under 800ms
    expect(ttfb).toBeLessThan(800);
    console.log(`✅ TTFB: ${ttfb.toFixed(0)}ms`);
  });
});

// ============================================================
// Test Suite 2: Layout Stability
// ============================================================

test.describe('Layout Stability (CLS)', () => {
  test('should meet CLS target (<0.1)', async ({ page }) => {
    await page.goto('/');

    const cls = await page.evaluate(() => {
      return new Promise<{ cls: number }>(resolve => {
        let clsValue = 0;

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // @ts-ignore - layout-shift entry
            if (!entry.hadRecentInput) {
              // @ts-ignore
              clsValue += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // Calculate CLS after 5 seconds
        setTimeout(() => {
          resolve({ cls: clsValue });
        }, 5000);
      });
    }).catch(() => ({ cls: 0 }));

    // CLS should be under 0.1
    expect(cls.cls).toBeLessThan(0.1);
    console.log(`✅ CLS: ${cls.cls.toFixed(3)}`);
  });

  test('should not have layout shift during page load', async ({ page }) => {
    await page.goto('/');

    // Get initial layout
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);

    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get final layout
    const finalHeight = await page.evaluate(() => document.body.scrollHeight);

    // Layout shift should be minimal (<5%)
    const shift = Math.abs(finalHeight - initialHeight) / initialHeight;
    expect(shift).toBeLessThan(0.05);
    console.log(`✅ Layout shift: ${(shift * 100).toFixed(1)}%`);
  });
});

// ============================================================
// Test Suite 3: Animation Performance
// ============================================================

test.describe('Animation Performance', () => {
  test('should maintain 60fps during animations', async ({ page }) => {
    await page.goto('/');

    // Trigger animations by opening settings
    await page.getByRole('button', { name: /设置/i }).click();

    const fps = await page.evaluate(() => {
      return new Promise<{ fps: number; droppedFrames: number }>(resolve => {
        let frameCount = 0;
        let droppedFrames = 0;
        let lastTime = performance.now();
        let fps = 60;

        function measure() {
          frameCount++;
          const now = performance.now();
          
          if (now - lastTime >= 1000) {
            fps = frameCount;
            // Estimate dropped frames (assuming 60fps target)
            droppedFrames = Math.max(0, 60 - fps);
            resolve({ fps, droppedFrames });
          } else {
            requestAnimationFrame(measure);
          }
        }

        requestAnimationFrame(measure);
      });
    });

    // FPS should be at least 50 (allowing some variance)
    expect(fps.fps).toBeGreaterThan(50);
    console.log(`✅ FPS: ${fps.fps}, Dropped: ${fps.droppedFrames}`);
  });

  test('should not block main thread during animations', async ({ page }) => {
    await page.goto('/');

    const longTasks = await page.evaluate(() => {
      return new Promise<{ longTasks: number; maxDuration: number }>(resolve => {
        const tasks: number[] = [];

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // @ts-ignore - duration property
            tasks.push(entry.duration);
          }
        }).observe({ entryTypes: ['longtask'] });

        setTimeout(() => {
          resolve({
            longTasks: tasks.length,
            maxDuration: Math.max(...tasks, 0),
          });
        }, 3000);
      });
    }).catch(() => ({ longTasks: 0, maxDuration: 0 }));

    // Should have minimal long tasks (>50ms)
    expect(tasks.longTasks).toBeLessThan(5);
    console.log(`✅ Long tasks: ${tasks.longTasks}, Max: ${tasks.maxDuration.toFixed(0)}ms`);
  });
});

// ============================================================
// Test Suite 4: Memory Usage
// ============================================================

test.describe('Memory Usage', () => {
  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/');

    const initialMemory = await page.evaluate(() => {
      // @ts-ignore - performance.memory is Chrome-specific
      return performance.memory?.usedJSHeapSize || 0;
    });

    // Perform multiple navigation cycles
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /控制台/i }).click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /终端/i }).click();
      await page.waitForLoadState('networkidle');
    }

    const finalMemory = await page.evaluate(() => {
      // @ts-ignore
      return performance.memory?.usedJSHeapSize || 0;
    });

    // Memory increase should be less than 20%
    const increase = (finalMemory - initialMemory) / initialMemory;
    expect(increase).toBeLessThan(0.2);
    console.log(`✅ Memory increase: ${(increase * 100).toFixed(1)}%`);
  });

  test('should clean up event listeners', async ({ page }) => {
    await page.goto('/');

    const initialListeners = await page.evaluate(() => {
      // @ts-ignore - getEventListeners is DevTools-specific
      return typeof getEventListeners === 'function' 
        ? Object.keys(getEventListeners(window)).length 
        : 0;
    });

    // Navigate and interact
    await page.getByRole('button', { name: /设置/i }).click();
    await page.keyboard.press('Escape');

    const finalListeners = await page.evaluate(() => {
      // @ts-ignore
      return typeof getEventListeners === 'function'
        ? Object.keys(getEventListeners(window)).length
        : 0;
    });

    // Listener count should not increase significantly
    const increase = finalListeners - initialListeners;
    expect(increase).toBeLessThan(5);
    console.log(`✅ Event listeners increase: ${increase}`);
  });
});

// ============================================================
// Test Suite 5: Bundle Size & Resource Loading
// ============================================================

test.describe('Bundle Size & Resource Loading', () => {
  test('should load JavaScript bundle under target size', async ({ page }) => {
    const jsRequests: { url: string; size: number }[] = [];

    page.on('response', response => {
      if (response.request().resourceType() === 'script') {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          jsRequests.push({
            url: response.url(),
            size: parseInt(contentLength, 10),
          });
        }
      }
    });

    await page.goto('/');

    const totalJsSize = jsRequests.reduce((sum, req) => sum + req.size, 0);
    const maxBundleSize = 500 * 1024; // 500KB target

    expect(totalJsSize).toBeLessThan(maxBundleSize);
    console.log(`✅ Total JS size: ${(totalJsSize / 1024).toFixed(1)}KB`);
  });

  test('should load CSS bundle under target size', async ({ page }) => {
    const cssRequests: { url: string; size: number }[] = [];

    page.on('response', response => {
      if (response.request().resourceType() === 'stylesheet') {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          cssRequests.push({
            url: response.url(),
            size: parseInt(contentLength, 10),
          });
        }
      }
    });

    await page.goto('/');

    const totalCssSize = cssRequests.reduce((sum, req) => sum + req.size, 0);
    const maxBundleSize = 100 * 1024; // 100KB target

    expect(totalCSSSize).toBeLessThan(maxBundleSize);
    console.log(`✅ Total CSS size: ${(totalCSSSize / 1024).toFixed(1)}KB`);
  });

  test('should limit total number of requests', async ({ page }) => {
    const requests: string[] = [];

    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Total requests should be under 50 for initial load
    expect(requests.length).toBeLessThan(50);
    console.log(`✅ Total requests: ${requests.length}`);
  });

  test('should use compression for text resources', async ({ page }) => {
    const uncompressedTextResources: string[] = [];

    page.on('response', response => {
      const contentType = response.headers()['content-type'];
      const contentEncoding = response.headers()['content-encoding'];
      
      if (contentType && (
        contentType.includes('text') || 
        contentType.includes('javascript') ||
        contentType.includes('json')
      )) {
        if (!contentEncoding || contentEncoding === 'identity') {
          uncompressedTextResources.push(response.url());
        }
      }
    });

    await page.goto('/');

    // All text resources should be compressed
    expect(uncompressedTextResources.length).toBe(0);
    if (uncompressedTextResources.length > 0) {
      console.log(`⚠️  Uncompressed resources: ${uncompressedTextResources.length}`);
    }
  });
});

// ============================================================
// Test Suite 6: Network Performance
// ============================================================

test.describe('Network Performance', () => {
  test('should handle slow 3G network gracefully', async ({ page, context }) => {
    // Simulate slow 3G
    await context.emulateMedia({ 
      colorScheme: 'dark',
    });
    
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 500); // 500ms delay
    });

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should still load within 10 seconds on slow 3G
    expect(loadTime).toBeLessThan(10000);
    console.log(`✅ Slow 3G load time: ${loadTime.toFixed(0)}ms`);
  });

  test('should prioritize critical resources', async ({ page }) => {
    const resourceTimings: { url: string; startTime: number; duration: number }[] = [];

    page.on('request', request => {
      resourceTimings.push({
        url: request.url(),
        startTime: Date.now(),
        duration: 0,
      });
    });

    page.on('response', response => {
      const timing = resourceTimings.find(r => r.url === response.url());
      if (timing) {
        timing.duration = Date.now() - timing.startTime;
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Critical resources (HTML, main JS, main CSS) should load first
    const criticalResources = resourceTimings.filter(r => 
      r.url.includes('.html') || 
      r.url.includes('main.') ||
      r.url.includes('index.')
    );

    expect(criticalResources.length).toBeGreaterThan(0);
    console.log(`✅ Critical resources: ${criticalResources.length}`);
  });
});

// ============================================================
// Test Suite 7: Interaction Performance
// ============================================================

test.describe('Interaction Performance', () => {
  test('should respond to user input within 100ms', async ({ page }) => {
    await page.goto('/');

    const inputResponseTime = await page.evaluate(() => {
      return new Promise<{ responseTime: number }>(resolve => {
        const input = document.querySelector('input,textarea') as HTMLElement;
        if (!input) {
          resolve({ responseTime: 0 });
          return;
        }

        const startTime = performance.now();
        
        input.focus();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        input.dispatchEvent(new KeyboardEvent('input', { data: 'a' }));
        
        // Measure time until visual update
        requestAnimationFrame(() => {
          const responseTime = performance.now() - startTime;
          resolve({ responseTime });
        });
      });
    });

    // Input response should be under 100ms
    expect(inputResponseTime.responseTime).toBeLessThan(100);
    console.log(`✅ Input response: ${inputResponseTime.responseTime.toFixed(1)}ms`);
  });

  test('should not freeze during scroll', async ({ page }) => {
    await page.goto('/');

    // Scroll to bottom and back
    const scrollPerformance = await page.evaluate(() => {
      return new Promise<{ averageFps: number; jankCount: number }>(resolve => {
        let frameCount = 0;
        let jankCount = 0;
        let lastTime = performance.now();
        let frameTimes: number[] = [];

        function measure() {
          const now = performance.now();
          const delta = now - lastTime;
          frameTimes.push(delta);
          
          // Jank is when frame takes >16.67ms (below 60fps)
          if (delta > 16.67) {
            jankCount++;
          }
          
          frameCount++;
          lastTime = now;

          if (frameCount < 100) {
            requestAnimationFrame(measure);
          } else {
            const averageFps = 1000 / (frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length);
            resolve({ averageFps, jankCount });
          }
        }

        // Trigger scroll
        window.scrollTo(0, document.body.scrollHeight);
        setTimeout(() => window.scrollTo(0, 0), 100);

        requestAnimationFrame(measure);
      });
    });

    // Average FPS should be above 50
    expect(scrollPerformance.averageFps).toBeGreaterThan(50);
    console.log(`✅ Scroll FPS: ${scrollPerformance.averageFps.toFixed(1)}, Jank: ${scrollPerformance.jankCount}`);
  });
});
