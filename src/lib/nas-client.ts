// ============================================================
// YYC3 Hacker Chatbot — NAS & Cluster Client
// Phase 15.1 + 16.1: Data Dimension (D2) + Infrastructure
//
// 统一的本地集群 HTTP 客户端:
// - NAS SQLite 数据库连接 (铁威马 F4-423)
// - Docker Engine API 代理
// - 设备网络健康检测
// - 设备配置持久化 (localStorage)
//
// 架构: 前端直连 NAS HTTP API → 降级到 localStorage mock
// ============================================================

// ============================================================
// 1. Device Registry — 基于 /docs/yyc3-Max.md 配置
// ============================================================

export interface DeviceConfig {
  id: string;
  hostName: string; // editable
  displayName: string; // editable
  ip: string; // editable
  // --- auto-detected / read-only ---
  chip: string;
  cores: string;
  ram: string;
  storage: string;
  os: string;
  role: string;
  icon: string; // emoji/code
  color: string; // tailwind color
  // --- status ---
  status: 'online' | 'offline' | 'standby' | 'unknown';
  lastPing: number;
  latencyMs: number;
  // --- network services ---
  services: DeviceService[];
}

export interface DeviceService {
  id: string;
  name: string;
  port: number;
  protocol: 'http' | 'https' | 'ssh' | 'ws' | 'tcp';
  path?: string;
  enabled: boolean;
  status: 'up' | 'down' | 'unknown';
  description: string;
}

const DEVICE_STORAGE_KEY = 'yyc3-device-configs';

// Default device configs from /docs/yyc3-Max.md
export const DEFAULT_DEVICES: DeviceConfig[] = [
  {
    id: 'm4-max',
    hostName: 'Max',
    displayName: 'MacBook Pro M4 Max',
    ip: '192.168.3.22',
    chip: 'Apple M4 Max',
    cores: '16P+40E',
    ram: '128GB',
    storage: '2TB + 2TB',
    os: 'macOS Sequoia',
    role: 'Orchestrator (Main)',
    icon: 'MBP',
    color: 'amber',
    status: 'unknown',
    lastPing: 0,
    latencyMs: 0,
    services: [
      { id: 'ssh-mbp', name: 'SSH', port: 22, protocol: 'ssh', enabled: true, status: 'unknown', description: 'Secure Shell' },
      { id: 'ollama-mbp', name: 'Ollama', port: 11434, protocol: 'http', path: '/v1', enabled: true, status: 'unknown', description: 'Local LLM Inference' },
      { id: 'lmstudio-mbp', name: 'LM Studio', port: 1234, protocol: 'http', path: '/v1', enabled: false, status: 'unknown', description: 'LM Studio API' },
      { id: 'dev-server', name: 'Dev Server', port: 5173, protocol: 'http', enabled: true, status: 'unknown', description: 'Vite Dev Server' },
    ],
  },
  {
    id: 'imac-m4',
    hostName: 'iMac',
    displayName: 'iMac M4',
    ip: '192.168.3.77',
    chip: 'Apple M4',
    cores: '10P+10E',
    ram: '32GB',
    storage: '2TB + 2TB SN850X',
    os: 'macOS Sequoia',
    role: 'Visual / Auxiliary',
    icon: 'iMC',
    color: 'blue',
    status: 'unknown',
    lastPing: 0,
    latencyMs: 0,
    services: [
      { id: 'ssh-imac', name: 'SSH', port: 22, protocol: 'ssh', enabled: true, status: 'unknown', description: 'Secure Shell' },
      { id: 'ollama-imac', name: 'Ollama', port: 11434, protocol: 'http', path: '/v1', enabled: false, status: 'unknown', description: 'Local LLM Inference' },
    ],
  },
  {
    id: 'matebook',
    hostName: 'HW-Book',
    displayName: 'MateBook X Pro',
    ip: '192.168.3.66',
    chip: 'Intel Ultra7 155H',
    cores: '16C / 22T',
    ram: '32GB',
    storage: '1TB',
    os: 'Windows 11 Pro',
    role: 'Edge / Test',
    icon: 'HW',
    color: 'zinc',
    status: 'unknown',
    lastPing: 0,
    latencyMs: 0,
    services: [
      { id: 'ssh-hw', name: 'SSH', port: 22, protocol: 'ssh', enabled: false, status: 'unknown', description: 'Secure Shell' },
      { id: 'rdp-hw', name: 'RDP', port: 3389, protocol: 'tcp', enabled: true, status: 'unknown', description: 'Remote Desktop' },
    ],
  },
  {
    id: 'yanyucloud',
    hostName: 'YanYuCloud',
    displayName: '铁威马 F4-423 NAS',
    ip: '192.168.3.45',
    chip: 'Intel Quad-Core',
    cores: '4C / 4T',
    ram: '32GB',
    storage: 'RAID6 4x8TB + RAID1 2x2TB SSD',
    os: 'TOS (Linux)',
    role: 'Data Center',
    icon: 'NAS',
    color: 'purple',
    status: 'unknown',
    lastPing: 0,
    latencyMs: 0,
    services: [
      { id: 'nas-web', name: 'TOS Web UI', port: 9898, protocol: 'https', enabled: true, status: 'unknown', description: 'NAS Management Portal' },
      { id: 'nas-ssh', name: 'SSH', port: 22, protocol: 'ssh', enabled: true, status: 'unknown', description: 'Secure Shell' },
      { id: 'nas-docker', name: 'Docker API', port: 2375, protocol: 'http', path: '/v1.41', enabled: true, status: 'unknown', description: 'Docker Engine REST API' },
      { id: 'nas-sqlite', name: 'SQLite HTTP', port: 8484, protocol: 'http', path: '/api/db', enabled: true, status: 'unknown', description: 'SQLite over HTTP Proxy' },
      { id: 'nas-heartbeat', name: 'Heartbeat WS', port: 9090, protocol: 'ws', path: '/ws/heartbeat', enabled: true, status: 'unknown', description: 'Family Heartbeat WebSocket Relay (Phase 20)' },
      { id: 'nas-smb', name: 'SMB/CIFS', port: 445, protocol: 'tcp', enabled: true, status: 'unknown', description: 'File Sharing' },
      { id: 'nas-webdav', name: 'WebDAV', port: 5005, protocol: 'http', enabled: true, status: 'unknown', description: 'WebDAV File Access' },
    ],
  },
];

// ============================================================
// 2. Device Config Persistence
// ============================================================

export function loadDeviceConfigs(): DeviceConfig[] {
  try {
    const raw = localStorage.getItem(DEVICE_STORAGE_KEY);

    if (raw) {
      const saved = JSON.parse(raw) as DeviceConfig[];

      // Merge with defaults to ensure new fields are present
      return DEFAULT_DEVICES.map(def => {
        const saved_dev = saved.find(s => s.id === def.id);

        if (saved_dev) {
          return {
            ...def,
            // Preserve user-editable fields
            hostName: saved_dev.hostName ?? def.hostName,
            displayName: saved_dev.displayName ?? def.displayName,
            ip: saved_dev.ip ?? def.ip,
            services: (saved_dev.services || def.services).map((svc, i) => ({
              ...(def.services[i] || svc),
              enabled: svc.enabled,
              port: svc.port,
            })),
          };
        }

        return def;
      });
    }
  } catch { /* ignore */ }

  return [...DEFAULT_DEVICES];
}

export function saveDeviceConfigs(devices: DeviceConfig[]): void {
  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(devices));
  } catch { /* ignore */ }
}

// ============================================================
// 3. Network Health Check — Ping via HTTP
// ============================================================

export async function pingDevice(device: DeviceConfig): Promise<{
  reachable: boolean;
  latencyMs: number;
}> {
  const start = performance.now();

  try {
    // Try to reach any HTTP service on the device
    const httpService = device.services.find(
      s => s.enabled && (s.protocol === 'http' || s.protocol === 'https'),
    );

    if (!httpService) {
      return { reachable: false, latencyMs: 0 };
    }

    const url = `${httpService.protocol}://${device.ip}:${httpService.port}${httpService.path || '/'}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // Will succeed as opaque response if reachable
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const latencyMs = Math.round(performance.now() - start);

    return { reachable: true, latencyMs };
  } catch {
    return { reachable: false, latencyMs: Math.round(performance.now() - start) };
  }
}

export async function pingService(device: DeviceConfig, serviceId: string): Promise<boolean> {
  const svc = device.services.find(s => s.id === serviceId);

  if (!svc || !svc.enabled) return false;

  if (svc.protocol === 'ssh' || svc.protocol === 'tcp') {
    // Cannot test TCP/SSH from browser, assume unknown
    return false;
  }

  try {
    const url = `${svc.protocol}://${device.ip}:${svc.port}${svc.path || '/'}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout);

    return true;
  } catch {
    return false;
  }
}

// ============================================================
// 4. NAS SQLite HTTP Proxy Client
// ============================================================

export interface NasSQLiteConfig {
  host: string;
  port: number;
  dbPath: string; // e.g., /Volume2/yyc3/data.db
}

const DEFAULT_SQLITE_CONFIG: NasSQLiteConfig = {
  host: '192.168.3.45',
  port: 8484,
  dbPath: '/Volume2/yyc3/yyc3.db',
};

const SQLITE_CONFIG_KEY = 'yyc3-nas-sqlite-config';

export function loadSQLiteConfig(): NasSQLiteConfig {
  try {
    const raw = localStorage.getItem(SQLITE_CONFIG_KEY);

    if (raw) return { ...DEFAULT_SQLITE_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }

  return { ...DEFAULT_SQLITE_CONFIG };
}

export function saveSQLiteConfig(config: NasSQLiteConfig): void {
  try {
    localStorage.setItem(SQLITE_CONFIG_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

export interface SQLiteQueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  changesCount: number;
}

/**
 * Execute SQL query against NAS SQLite HTTP Proxy
 * Expected proxy API format:
 * POST http://NAS_IP:8484/api/db/query
 * Body: { db: "/path/to.db", sql: "SELECT ...", params: [] }
 * Response: { columns: [...], rows: [...], rowCount: N }
 */
export async function querySQLite(
  sql: string,
  params: unknown[] = [],
  config?: NasSQLiteConfig,
): Promise<SQLiteQueryResult> {
  const cfg = config || loadSQLiteConfig();
  const url = `http://${cfg.host}:${cfg.port}/api/db/query`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        db: cfg.dbPath,
        sql,
        params,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`SQLite HTTP ${res.status}: ${await res.text()}`);
    }

    return await res.json() as SQLiteQueryResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    throw new Error(`NAS SQLite unreachable: ${message}`);
  }
}

/**
 * Test NAS SQLite connectivity
 */
export async function testSQLiteConnection(config?: NasSQLiteConfig): Promise<{
  success: boolean;
  latencyMs: number;
  error?: string;
  version?: string;
}> {
  const start = performance.now();

  try {
    const result = await querySQLite('SELECT sqlite_version() as version', [], config);
    const latency = Math.round(performance.now() - start);
    const version = result.rows?.[0]?.[0] as string;

    return { success: true, latencyMs: latency, version };
  } catch (err) {
    const latency = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : 'Unknown error';

    return { success: false, latencyMs: latency, error: message };
  }
}

// ============================================================
// 5. Docker Engine API Client (NAS F4-423)
// ============================================================

export interface DockerConfig {
  host: string;
  port: number;
  apiVersion: string;
}

const DEFAULT_DOCKER_CONFIG: DockerConfig = {
  host: '192.168.3.45',
  port: 2375,
  apiVersion: 'v1.41',
};

const DOCKER_CONFIG_KEY = 'yyc3-docker-config';

export function loadDockerConfig(): DockerConfig {
  try {
    const raw = localStorage.getItem(DOCKER_CONFIG_KEY);

    if (raw) return { ...DEFAULT_DOCKER_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }

  return { ...DEFAULT_DOCKER_CONFIG };
}

export function saveDockerConfig(config: DockerConfig): void {
  try {
    localStorage.setItem(DOCKER_CONFIG_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

function dockerUrl(path: string, config?: DockerConfig): string {
  const cfg = config || loadDockerConfig();

  return `http://${cfg.host}:${cfg.port}/${cfg.apiVersion}${path}`;
}

async function dockerFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = dockerUrl(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Docker API ${res.status}: ${await res.text()}`);
    }

    return await res.json() as T;
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : 'Unknown error';

    throw new Error(`Docker API error: ${message}`);
  }
}

// Docker API Types
export interface DockerContainer {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  State: string;
  Status: string;
  Ports: {
    IP?: string;
    PrivatePort: number;
    PublicPort?: number;
    Type: string;
  }[];
  Labels: Record<string, string>;
  SizeRw?: number;
  SizeRootFs?: number;
}

export interface DockerImage {
  Id: string;
  RepoTags: string[];
  Created: number;
  Size: number;
  VirtualSize: number;
}

export interface DockerSystemInfo {
  Containers: number;
  ContainersRunning: number;
  ContainersPaused: number;
  ContainersStopped: number;
  Images: number;
  Driver: string;
  MemTotal: number;
  NCPU: number;
  OperatingSystem: string;
  KernelVersion: string;
  Architecture: string;
  ServerVersion: string;
  Name: string;
}

// Docker API operations
export const docker = {
  async info(): Promise<DockerSystemInfo> {
    return dockerFetch<DockerSystemInfo>('/info');
  },

  async ping(): Promise<boolean> {
    try {
      const url = dockerUrl('/_ping');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });

      clearTimeout(timeout);

      return res.ok;
    } catch {
      return false;
    }
  },

  containers: {
    async list(all = true): Promise<DockerContainer[]> {
      return dockerFetch<DockerContainer[]>(`/containers/json?all=${all}`);
    },

    async start(id: string): Promise<void> {
      await dockerFetch(`/containers/${id}/start`, { method: 'POST' });
    },

    async stop(id: string): Promise<void> {
      await dockerFetch(`/containers/${id}/stop`, { method: 'POST' });
    },

    async restart(id: string): Promise<void> {
      await dockerFetch(`/containers/${id}/restart`, { method: 'POST' });
    },

    async remove(id: string, force = false): Promise<void> {
      await dockerFetch(`/containers/${id}?force=${force}`, { method: 'DELETE' });
    },

    async logs(id: string, tail = 100): Promise<string> {
      const url = dockerUrl(`/containers/${id}/logs?stdout=true&stderr=true&tail=${tail}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(url, { signal: controller.signal });

        clearTimeout(timeout);

        return await res.text();
      } catch {
        clearTimeout(timeout);

        return '[Error fetching logs]';
      }
    },
  },

  images: {
    async list(): Promise<DockerImage[]> {
      return dockerFetch<DockerImage[]>('/images/json');
    },
  },
};

// ============================================================
// 6. Mock Data (Fallback when NAS unreachable)
// Updated: 2026-02-23 based on NAS真实审计报告
// ============================================================

export const MOCK_DOCKER_CONTAINERS: DockerContainer[] = [
  {
    Id: 'a1b2c3d4e5f6',
    Names: ['/ollama'],
    Image: 'ollama/ollama:latest',
    ImageID: 'sha256:ollama123',
    Command: '/bin/ollama serve',
    Created: Date.now() / 1000 - 86400 * 7,
    State: 'running',
    Status: 'Up 7 days',
    Ports: [{ IP: '0.0.0.0', PrivatePort: 11434, PublicPort: 11434, Type: 'tcp' }],
    Labels: { 'com.yyc3.service': 'llm-inference' },
  },
  {
    Id: 'b2c3d4e5f6a1',
    Names: ['/postgres14'],
    Image: 'postgres:14-alpine',
    ImageID: 'sha256:pg14abc',
    Command: 'docker-entrypoint.sh postgres',
    Created: Date.now() / 1000 - 86400 * 30,
    State: 'running',
    Status: 'Up 30 days',
    Ports: [{ IP: '0.0.0.0', PrivatePort: 5432, PublicPort: 5432, Type: 'tcp' }],
    Labels: { 'com.yyc3.service': 'database', 'com.yyc3.db': 'yyc3_dev,yyc3_vpn,yyc3_aify' },
  },
  {
    Id: 'c3d4e5f6a1b2',
    Names: ['/pgvector'],
    Image: 'pgvector/pgvector:pg14',
    ImageID: 'sha256:pgvector456',
    Command: 'docker-entrypoint.sh postgres',
    Created: Date.now() / 1000 - 86400 * 14,
    State: 'running',
    Status: 'Up 14 days',
    Ports: [{ IP: '0.0.0.0', PrivatePort: 5434, PublicPort: 5434, Type: 'tcp' }],
    Labels: { 'com.yyc3.service': 'vector-db' },
  },
  {
    Id: 'd4e5f6a1b2c3',
    Names: ['/redis'],
    Image: 'redis:7-alpine',
    ImageID: 'sha256:redis789',
    Command: 'redis-server',
    Created: Date.now() / 1000 - 86400 * 5,
    State: 'running',
    Status: 'Up 5 days',
    Ports: [{ IP: '0.0.0.0', PrivatePort: 6379, PublicPort: 6379, Type: 'tcp' }],
    Labels: { 'com.yyc3.service': 'cache' },
  },
  {
    Id: 'e5f6a1b2c3d4',
    Names: ['/yyc3-heartbeat'],
    Image: 'yyc3-heartbeat:latest',
    ImageID: 'sha256:heartbeat012',
    Command: 'node heartbeat.js',
    Created: Date.now() / 1000 - 86400 * 3,
    State: 'running',
    Status: 'Up 3 days',
    Ports: [{ IP: '0.0.0.0', PrivatePort: 9090, PublicPort: 9090, Type: 'tcp' }],
    Labels: { 'com.yyc3.service': 'heartbeat' },
  },
  {
    Id: 'f6a1b2c3d4e5',
    Names: ['/baiduaapp'],
    Image: 'baiduaapp:1.0.0',
    ImageID: 'sha256:baidu345',
    Command: 'python main.py',
    Created: Date.now() / 1000 - 86400 * 10,
    State: 'running',
    Status: 'Up 10 days',
    Ports: [{ IP: '0.0.0.0', PrivatePort: 8080, PublicPort: 8080, Type: 'tcp' }],
    Labels: { 'com.yyc3.service': 'baidu-app' },
  },
  {
    Id: 'a7b8c9d0e1f2',
    Names: ['/baiduaapp-ui'],
    Image: 'baiduaapp-ui:1.0.0',
    ImageID: 'sha256:baiduui678',
    Command: 'nginx -g daemon off;',
    Created: Date.now() / 1000 - 86400 * 10,
    State: 'running',
    Status: 'Up 10 days',
    Ports: [{ IP: '0.0.0.0', PrivatePort: 3000, PublicPort: 3000, Type: 'tcp' }],
    Labels: { 'com.yyc3.service': 'baidu-ui' },
  },
];

export const MOCK_DOCKER_INFO: DockerSystemInfo = {
  Containers: 7,
  ContainersRunning: 7,
  ContainersPaused: 0,
  ContainersStopped: 0,
  Images: 7,
  Driver: 'overlay2',
  MemTotal: 34359738368,
  NCPU: 4,
  OperatingSystem: 'TOS 7.0 (Beta)',
  KernelVersion: '6.12.41+',
  Architecture: 'x86_64',
  ServerVersion: '24.0.7',
  Name: 'YanYuCloud',
};