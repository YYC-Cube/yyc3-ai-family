# YYC3-Claude Testing Framework

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

> **Testing Infrastructure** | **Created**: 2026-01-29
> **Coverage Target**: 85% | **Status**: Ready for use

---

## Overview

YYC3-Claude uses a modern testing stack based on:

- **Vitest** for fast unit testing (Bun-native)
- **Playwright** for E2E testing
- **ESLint + Prettier** for code quality
- **TypeScript** for type safety

---

## Quick Start

### Installation

```bash
# Install dependencies
bun install
```

### Run Tests

```bash
# All unit tests
bun test

# Watch mode
bun test:watch

# Coverage report
bun test:coverage

# UI mode
bun test:ui

# E2E tests
bun test:e2e

# E2E UI mode
bun test:e2e:ui
```

---

## Test Structure

```
test/
├── setup.ts              # Global test setup
├── unit/                 # Unit tests
│   └── *.test.ts
├── e2e/                  # E2E tests
│   └── *.spec.ts
└── README.md             # This file
```

---

## Writing Unit Tests

### Basic Example

```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    const result = myFunction();
    expect(result).toBe('expected');
  });
});
```

### Async Tests

```typescript
it('should handle async operations', async () => {
  const result = await myAsyncFunction();
  expect(result).toHaveProperty('data');
});
```

### Snapshots

```typescript
it('should match snapshot', () => {
  const data = { name: 'YYC3', version: '1.0.0' };
  expect(data).toMatchSnapshot();
});
```

---

## Writing E2E Tests

### Basic Example

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/YYC3/);
});
```

### API Testing

```typescript
test('should call API', async ({ request }) => {
  const response = await request.get('/api/data');
  expect(response.ok()).toBeTruthy();
});
```

### Mobile Testing

```typescript
test('mobile view', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  // Mobile-specific assertions
});
```

---

## Coverage Configuration

### Current Thresholds

```typescript
// vitest.config.ts
thresholds: {
  statements: 60,
  branches: 60,
  functions: 60,
  lines: 60,
}
```

### View Coverage Report

```bash
bun test:coverage

# View HTML report
open coverage/index.html
```

---

## CI/CD Integration

Tests run automatically on:

- Push to any branch
- Pull requests
- Merge to main

### GitHub Actions

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    bun install
    bun test
    bun test:e2e
```

---

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good
it('should return 404 for non-existent user')

// ❌ Bad
it('works')
```

### 2. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate total', () => {
  // Arrange
  const cart = new Cart();
  cart.addItem({ price: 10 });

  // Act
  const total = cart.calculateTotal();

  // Assert
  expect(total).toBe(10);
});
```

### 3. One Assertion Per Test

```typescript
// ✅ Good
it('should set name correctly')
it('should validate name format')

// ❌ Avoid
it('should handle name and email')
```

---

## Debugging

### Unit Tests

```bash
# Run specific test file
bun test path/to/test.test.ts

# Run matching tests
bun test -t "should work"

# Debug mode
bun test --inspect-brk
```

### E2E Tests

```bash
# Debug mode
bun test:e2e:debug

# Run specific test
bun test:e2e -g "should load"

# Show browser
bun test:e2e:ui
```

---

## Test Utilities

### Wait Helper

```typescript
await utils.wait(1000); // Wait 1 second
```

### Retry Helper

```typescript
await utils.retry(
  async () => await checkDatabase(),
  3,      // max attempts
  100     // delay between attempts
);
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration |
| `playwright.config.ts` | Playwright configuration |
| `tsconfig.json` | TypeScript configuration |
| `eslint.config.mjs` | ESLint rules |
| `.prettierrc` | Code formatting |

---

## Next Steps

1. ✅ Framework setup complete
2. ⏳ Write tests for core modules
3. ⏳ Achieve 60% coverage baseline
4. ⏳ Increase to 85% coverage target

---

**Last Updated**: 2026-01-29
**Version**: 1.0.0

> 万象归元于云枢 | 深栈智启新纪元
