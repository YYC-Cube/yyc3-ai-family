// ============================================================
// YYC3 Hacker Chatbot — NAS Client Unit Tests (Vitest)
// Phase 48: Test Coverage Enhancement (P1)
//
// Tests: Device config persistence, SQLite config management,
//        Docker config management, mock data integrity,
//        DEFAULT_DEVICES registry, config merge logic.
//
// Run: npx vitest run src/lib/__tests__/nas-client.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_DEVICES,
  loadDeviceConfigs,
  saveDeviceConfigs,
  loadSQLiteConfig,
  saveSQLiteConfig,
  loadDockerConfig,
  saveDockerConfig,
  MOCK_DOCKER_CONTAINERS,
  MOCK_DOCKER_INFO,
  type DeviceConfig,
  type NasSQLiteConfig,
  type DockerConfig,
} from '../nas-client';

const DEVICE_STORAGE_KEY = 'yyc3-device-configs';
const SQLITE_CONFIG_KEY = 'yyc3-nas-sqlite-config';
const DOCKER_CONFIG_KEY = 'yyc3-docker-config';

// ============================================================
// Setup
// ============================================================

beforeEach(() => {
  localStorage.removeItem(DEVICE_STORAGE_KEY);
  localStorage.removeItem(SQLITE_CONFIG_KEY);
  localStorage.removeItem(DOCKER_CONFIG_KEY);
});

// ============================================================
// Suite 1: DEFAULT_DEVICES Registry
// ============================================================

describe('NAS Client — DEFAULT_DEVICES', () => {
  it('NAS-01: has exactly 4 devices', () => {
    expect(DEFAULT_DEVICES).toHaveLength(4);
  });

  it('NAS-02: all devices have required fields', () => {
    for (const device of DEFAULT_DEVICES) {
      expect(device.id).toBeTruthy();
      expect(device.hostName).toBeTruthy();
      expect(device.displayName).toBeTruthy();
      expect(device.ip).toBeTruthy();
      expect(device.chip).toBeTruthy();
      expect(device.cores).toBeTruthy();
      expect(device.ram).toBeTruthy();
      expect(device.storage).toBeTruthy();
      expect(device.os).toBeTruthy();
      expect(device.role).toBeTruthy();
      expect(device.icon).toBeTruthy();
      expect(device.color).toBeTruthy();
      expect(device.status).toBe('unknown');
      expect(Array.isArray(device.services)).toBe(true);
    }
  });

  it('NAS-03: device IDs are unique', () => {
    const ids = DEFAULT_DEVICES.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('NAS-04: expected device IDs present', () => {
    const ids = DEFAULT_DEVICES.map(d => d.id);
    expect(ids).toContain('m4-max');
    expect(ids).toContain('imac-m4');
    expect(ids).toContain('matebook');
    expect(ids).toContain('yanyucloud');
  });

  it('NAS-05: M4 Max has correct IP', () => {
    const m4 = DEFAULT_DEVICES.find(d => d.id === 'm4-max');
    expect(m4).toBeDefined();
    expect(m4!.ip).toBe('192.168.3.22');
    expect(m4!.chip).toBe('Apple M4 Max');
    expect(m4!.ram).toBe('128GB');
  });

  it('NAS-06: NAS (yanyucloud) has correct services', () => {
    const nas = DEFAULT_DEVICES.find(d => d.id === 'yanyucloud');
    expect(nas).toBeDefined();
    expect(nas!.ip).toBe('192.168.3.45');
    const serviceNames = nas!.services.map(s => s.name);
    expect(serviceNames).toContain('Docker API');
    expect(serviceNames).toContain('SQLite HTTP');
    expect(serviceNames).toContain('Heartbeat WS');
  });

  it('NAS-07: all services have required fields', () => {
    for (const device of DEFAULT_DEVICES) {
      for (const svc of device.services) {
        expect(svc.id).toBeTruthy();
        expect(svc.name).toBeTruthy();
        expect(typeof svc.port).toBe('number');
        expect(['http', 'https', 'ssh', 'ws', 'tcp']).toContain(svc.protocol);
        expect(typeof svc.enabled).toBe('boolean');
        expect(['up', 'down', 'unknown']).toContain(svc.status);
        expect(svc.description).toBeTruthy();
      }
    }
  });
});

// ============================================================
// Suite 2: Device Config Persistence
// ============================================================

describe('NAS Client — Device Config Persistence', () => {
  it('NAS-08: loadDeviceConfigs returns defaults when no saved config', () => {
    const configs = loadDeviceConfigs();
    expect(configs).toHaveLength(4);
    expect(configs[0].id).toBe('m4-max');
  });

  it('NAS-09: saveDeviceConfigs + loadDeviceConfigs round-trip', () => {
    const configs = loadDeviceConfigs();
    configs[0].displayName = 'My MacBook Pro';
    configs[0].ip = '10.0.0.100';
    saveDeviceConfigs(configs);
    const loaded = loadDeviceConfigs();
    expect(loaded[0].displayName).toBe('My MacBook Pro');
    expect(loaded[0].ip).toBe('10.0.0.100');
  });

  it('NAS-10: merge preserves user edits but adds new default fields', () => {
    // Simulate a saved config with only partial data
    const partial = [
      { id: 'm4-max', hostName: 'Custom-Max', displayName: 'Custom Display', ip: '10.0.0.1', services: DEFAULT_DEVICES[0].services },
    ];
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(partial));
    const loaded = loadDeviceConfigs();
    const m4 = loaded.find(d => d.id === 'm4-max');
    expect(m4).toBeDefined();
    expect(m4!.hostName).toBe('Custom-Max');
    expect(m4!.displayName).toBe('Custom Display');
    expect(m4!.ip).toBe('10.0.0.1');
    // Default fields should still be present from merge
    expect(m4!.chip).toBe('Apple M4 Max');
    // Other devices should also be present (from defaults)
    expect(loaded).toHaveLength(4);
  });

  it('NAS-11: handles corrupt localStorage gracefully', () => {
    localStorage.setItem(DEVICE_STORAGE_KEY, 'invalid json');
    const configs = loadDeviceConfigs();
    expect(configs).toHaveLength(4); // falls back to defaults
  });
});

// ============================================================
// Suite 3: NAS SQLite Config
// ============================================================

describe('NAS Client — SQLite Config', () => {
  it('NAS-12: loadSQLiteConfig returns defaults', () => {
    const config = loadSQLiteConfig();
    expect(config.host).toBe('192.168.3.45');
    expect(config.port).toBe(8484);
    expect(config.dbPath).toBe('/Volume2/yyc3/yyc3.db');
  });

  it('NAS-13: saveSQLiteConfig + load round-trip', () => {
    const custom: NasSQLiteConfig = {
      host: '10.0.0.45',
      port: 9090,
      dbPath: '/data/custom.db',
    };
    saveSQLiteConfig(custom);
    const loaded = loadSQLiteConfig();
    expect(loaded.host).toBe('10.0.0.45');
    expect(loaded.port).toBe(9090);
    expect(loaded.dbPath).toBe('/data/custom.db');
  });

  it('NAS-14: partial config merge with defaults', () => {
    localStorage.setItem(SQLITE_CONFIG_KEY, JSON.stringify({ port: 7777 }));
    const config = loadSQLiteConfig();
    expect(config.host).toBe('192.168.3.45'); // default
    expect(config.port).toBe(7777); // overridden
    expect(config.dbPath).toBe('/Volume2/yyc3/yyc3.db'); // default
  });
});

// ============================================================
// Suite 4: Docker Config
// ============================================================

describe('NAS Client — Docker Config', () => {
  it('NAS-15: loadDockerConfig returns defaults', () => {
    const config = loadDockerConfig();
    expect(config.host).toBe('192.168.3.45');
    expect(config.port).toBe(2375);
    expect(config.apiVersion).toBe('v1.41');
  });

  it('NAS-16: saveDockerConfig + load round-trip', () => {
    const custom: DockerConfig = {
      host: '10.0.0.45',
      port: 2376,
      apiVersion: 'v1.43',
    };
    saveDockerConfig(custom);
    const loaded = loadDockerConfig();
    expect(loaded.host).toBe('10.0.0.45');
    expect(loaded.port).toBe(2376);
    expect(loaded.apiVersion).toBe('v1.43');
  });

  it('NAS-17: handles corrupt config gracefully', () => {
    localStorage.setItem(DOCKER_CONFIG_KEY, '{bad}');
    const config = loadDockerConfig();
    // Falls back to defaults
    expect(config.host).toBe('192.168.3.45');
    expect(config.port).toBe(2375);
  });
});

// ============================================================
// Suite 5: Mock Data Integrity
// ============================================================

describe('NAS Client — Mock Data', () => {
  it('NAS-18: MOCK_DOCKER_CONTAINERS has expected containers', () => {
    expect(MOCK_DOCKER_CONTAINERS.length).toBeGreaterThanOrEqual(6);
    const names = MOCK_DOCKER_CONTAINERS.map(c => c.Names[0]);
    expect(names).toContain('/yyc3-postgres');
    expect(names).toContain('/yyc3-redis');
    expect(names).toContain('/yyc3-sqlite-proxy');
  });

  it('NAS-19: mock containers have correct structure', () => {
    for (const c of MOCK_DOCKER_CONTAINERS) {
      expect(c.Id).toBeTruthy();
      expect(Array.isArray(c.Names)).toBe(true);
      expect(c.Image).toBeTruthy();
      expect(['running', 'exited', 'paused', 'created']).toContain(c.State);
      expect(c.Status).toBeTruthy();
      expect(Array.isArray(c.Ports)).toBe(true);
    }
  });

  it('NAS-20: MOCK_DOCKER_INFO has complete system info', () => {
    expect(MOCK_DOCKER_INFO.Containers).toBeGreaterThan(0);
    expect(MOCK_DOCKER_INFO.ContainersRunning).toBeGreaterThan(0);
    expect(MOCK_DOCKER_INFO.Images).toBeGreaterThan(0);
    expect(MOCK_DOCKER_INFO.NCPU).toBe(4);
    expect(MOCK_DOCKER_INFO.MemTotal).toBeGreaterThan(0);
    expect(MOCK_DOCKER_INFO.OperatingSystem).toBe('TOS (Linux)');
    expect(MOCK_DOCKER_INFO.Name).toBe('YanYuCloud');
    expect(MOCK_DOCKER_INFO.ServerVersion).toBeTruthy();
  });

  it('NAS-21: mock running count matches', () => {
    const running = MOCK_DOCKER_CONTAINERS.filter(c => c.State === 'running').length;
    expect(running).toBe(MOCK_DOCKER_INFO.ContainersRunning);
  });

  it('NAS-22: mock stopped count matches', () => {
    const stopped = MOCK_DOCKER_CONTAINERS.filter(c => c.State === 'exited').length;
    expect(stopped).toBe(MOCK_DOCKER_INFO.ContainersStopped);
  });
});

// ============================================================
// Suite 6: Edge Cases
// ============================================================

describe('NAS Client — Edge Cases', () => {
  it('NAS-23: save/load cycle preserves all 4 device IDs', () => {
    const configs = loadDeviceConfigs();
    saveDeviceConfigs(configs);
    const reloaded = loadDeviceConfigs();
    const ids = reloaded.map(d => d.id);
    expect(ids).toContain('m4-max');
    expect(ids).toContain('imac-m4');
    expect(ids).toContain('matebook');
    expect(ids).toContain('yanyucloud');
  });

  it('NAS-24: empty localStorage returns fresh defaults', () => {
    localStorage.clear();
    const devices = loadDeviceConfigs();
    expect(devices).toHaveLength(4);
    const sqliteConfig = loadSQLiteConfig();
    expect(sqliteConfig.host).toBe('192.168.3.45');
    const dockerConfig = loadDockerConfig();
    expect(dockerConfig.host).toBe('192.168.3.45');
  });
});
