import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { CollaborationTask, DatabaseConfig, HardwareSnapshot } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// YYC3 Max Database & Hardware Utilities
// ============================================================

export async function persistToLocalDB(task: CollaborationTask, config: DatabaseConfig) {
  console.log(`[PG15_IO] Writing task ${task.id} to host ${config.user}@192.168.3.22:5433...`);

  return new Promise(resolve => {
    const latency = Math.random() * 5 + 2;

    setTimeout(() => {
      resolve({ success: true, latencyMs: latency, vaultId: `vlt-${Date.now()}` });
    }, latency);
  });
}

export function getHardwareTelemetry(): HardwareSnapshot {
  return {
    cpuLoad: Array.from({ length: 56 }, () => Math.random() * 30 + 10),
    ramUsedGB: 42.5 + Math.random() * 5,
    diskIOps: 8500 + Math.random() * 2000,
    gpuLoad: Math.random() * 15,
    tempCelsius: 38 + Math.random() * 6,
    timestamp: new Date().toISOString(),
  };
}

export function terminalLog(module: string, message: string, type: 'info' | 'warn' | 'error' = 'info') {
  const _colors = { info: 'text-primary', warn: 'text-orange-400', error: 'text-red-500' };
  const timestamp = new Date().toLocaleTimeString();

  console.log(`%c[${timestamp}] [${module}] ${message}`, `color: ${type === 'info' ? '#00f2ff' : type === 'warn' ? '#fbbf24' : '#ef4444'}`);
}
