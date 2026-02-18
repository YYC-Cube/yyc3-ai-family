// ============================================================
// Vitest Test Setup
// Provides localStorage mock and global setup for jsdom
// ============================================================

import { beforeEach, afterEach } from 'vitest';

// localStorage is available in jsdom but we ensure it's clean
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
