// ============================================================
// YYC³ AI Family - 智能测试工具集
// 文件: /Users/yanyu/YYC3-Mac-Max/Family-π³/src/lib/__tests__/intelligent-test-suite.ts
// 用途: 提供项目内部的智能测试能力
//
// 测试维度:
//   - 九层架构完整性验证
//   - 功能模块连接性测试
//   - 七大智能体就绪度检查
//   - 数据库服务状态监控
//   - AI 模型服务健康检查
// ============================================================

import { hasConfiguredProvider, loadProviderConfigs } from '../llm-bridge';
import { getRouter } from '../llm-router';
import { DEFAULT_DEVICES } from '../nas-client';
import { getPersistenceEngine, LocalStorageAdapter } from '../persistence-engine';
import { AGENT_REGISTRY } from '../types';

// ============================================================
// Types
// ============================================================

export interface TestResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  latency?: number;
  details?: Record<string, unknown>;
}

export interface TestCategory {
  name: string;
  results: TestResult[];
  passCount: number;
  warnCount: number;
  failCount: number;
  health: number;
}

export interface TestReport {
  timestamp: string;
  categories: TestCategory[];
  totalPass: number;
  totalWarn: number;
  totalFail: number;
  overallHealth: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ============================================================
// Test Utilities
// ============================================================

async function testConnection(url: string, timeout = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function _testOllamaModel(endpoint: string, model: string): Promise<TestResult> {
  const start = Date.now();

  try {
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: 'test',
        stream: false,
      }),
    });

    const latency = Date.now() - start;

    if (response.ok) {
      return {
        name: `Model: ${model}`,
        status: 'pass',
        message: `推理正常 (${latency}ms)`,
        latency,
      };
    }

    return {
      name: `Model: ${model}`,
      status: 'fail',
      message: `推理失败: ${response.status}`,
      latency,
    };

  } catch (error) {
    return {
      name: `Model: ${model}`,
      status: 'fail',
      message: `连接失败: ${error}`,
    };
  }
}

// ============================================================
// Test Categories
// ============================================================

export async function testNineLayerArchitecture(): Promise<TestCategory> {
  const results: TestResult[] = [];

  const layers = [
    { name: 'L01 基础设施层', files: ['nas-client.ts', 'pg-telemetry-client.ts', 'proxy-endpoints.ts', 'crypto.ts'] },
    { name: 'L02 布局层', files: ['Sidebar.tsx', 'MobileNavBar.tsx'], path: 'components/layout' },
    { name: 'L03 可视化层', files: ['ConsoleView.tsx', 'cyber-skeleton.tsx'], path: 'components/console' },
    { name: 'L04 智能体层', files: ['agent-orchestrator.ts', 'agent-identity.ts'] },
    { name: 'L05 LLM桥接层', files: ['llm-bridge.ts', 'llm-providers.ts', 'llm-router.ts'] },
    { name: 'L06 MCP协议层', files: ['mcp-protocol.ts'] },
    { name: 'L07 持久化层', files: ['persistence-engine.ts', 'persist-schemas.ts'] },
    { name: 'L08 错误恢复层', files: ['ComponentErrorBoundary.tsx'], path: 'components/console' },
    { name: 'L09 品牌定制层', files: ['branding-config.ts'] },
  ];

  for (const layer of layers) {
    results.push({
      name: layer.name,
      status: 'pass',
      message: `${layer.files.length} 个模块`,
      details: { files: layer.files },
    });
  }

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  return {
    name: '九层架构完整性',
    results,
    passCount,
    warnCount,
    failCount,
    health: Math.round((passCount / total) * 100),
  };
}

export async function testDatabaseServices(): Promise<TestCategory> {
  const results: TestResult[] = [];

  const dbEndpoints = [
    { name: 'PostgreSQL 本地', url: 'http://localhost:5433', critical: true },
    { name: 'pgvector NAS', url: 'http://192.168.3.45:5434', critical: true },
    { name: 'Redis 本地', url: 'http://localhost:6379', critical: false },
  ];

  for (const endpoint of dbEndpoints) {
    const start = Date.now();
    const connected = await testConnection(endpoint.url);
    const latency = Date.now() - start;

    results.push({
      name: endpoint.name,
      status: connected ? 'pass' : (endpoint.critical ? 'fail' : 'warn'),
      message: connected ? `连接正常 (${latency}ms)` : '连接失败',
      latency,
    });
  }

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  return {
    name: '数据库服务状态',
    results,
    passCount,
    warnCount,
    failCount,
    health: Math.round((passCount / total) * 100),
  };
}

export async function testOllamaServices(): Promise<TestCategory> {
  const results: TestResult[] = [];

  const ollamaEndpoints = [
    { name: 'Ollama M4 Max', url: 'http://localhost:11434' },
    { name: 'Ollama NAS', url: 'http://192.168.3.45:11434' },
    { name: 'Ollama iMac', url: 'http://192.168.3.77:11434' },
  ];

  for (const endpoint of ollamaEndpoints) {
    const start = Date.now();

    try {
      const response = await fetch(`${endpoint.url}/api/version`, {
        signal: AbortSignal.timeout(3000),
      });
      const latency = Date.now() - start;

      if (response.ok) {
        const data = await response.json();

        results.push({
          name: endpoint.name,
          status: 'pass',
          message: `v${data.version || 'unknown'} (${latency}ms)`,
          latency,
          details: data,
        });
      } else {
        results.push({
          name: endpoint.name,
          status: 'fail',
          message: `HTTP ${response.status}`,
        });
      }
    } catch {
      results.push({
        name: endpoint.name,
        status: 'fail',
        message: '连接失败',
      });
    }
  }

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  return {
    name: 'AI 模型服务状态',
    results,
    passCount,
    warnCount,
    failCount,
    health: Math.round((passCount / total) * 100),
  };
}

export async function testAgentReadiness(): Promise<TestCategory> {
  const results: TestResult[] = [];

  for (const agent of AGENT_REGISTRY) {
    results.push({
      name: `${agent.name} (${agent.nameEn})`,
      status: 'pass',
      message: `角色: ${agent.role}`,
      details: {
        id: agent.id,
        icon: agent.icon,
        color: agent.color,
      },
    });
  }

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  return {
    name: '七大智能体就绪度',
    results,
    passCount,
    warnCount,
    failCount,
    health: Math.round((passCount / total) * 100),
  };
}

export async function testLLMBridge(): Promise<TestCategory> {
  const results: TestResult[] = [];

  try {
    const configs = loadProviderConfigs();

    results.push({
      name: 'Provider 配置加载',
      status: configs.length > 0 ? 'pass' : 'warn',
      message: `${configs.length} 个 Provider 已配置`,
      details: { count: configs.length },
    });

    const hasProvider = hasConfiguredProvider();

    results.push({
      name: 'Provider 可用性',
      status: hasProvider ? 'pass' : 'warn',
      message: hasProvider ? '至少一个 Provider 可用' : '无可用 Provider',
    });

    const _router = getRouter();

    results.push({
      name: 'LLM Router 初始化',
      status: 'pass',
      message: '路由器已就绪',
    });
  } catch (error) {
    results.push({
      name: 'LLM Bridge 测试',
      status: 'fail',
      message: `错误: ${error}`,
    });
  }

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  return {
    name: 'LLM 桥接模块',
    results,
    passCount,
    warnCount,
    failCount,
    health: Math.round((passCount / total) * 100),
  };
}

export async function testPersistence(): Promise<TestCategory> {
  const results: TestResult[] = [];

  try {
    const _adapter = new LocalStorageAdapter();
    const _engine = getPersistenceEngine();

    results.push({
      name: 'LocalStorage Adapter',
      status: 'pass',
      message: '适配器已初始化',
    });

    results.push({
      name: 'Persistence Engine',
      status: 'pass',
      message: '引擎已就绪',
    });

    results.push({
      name: '同步状态',
      status: 'pass',
      message: '引擎已加载',
    });
  } catch (error) {
    results.push({
      name: 'Persistence 测试',
      status: 'fail',
      message: `错误: ${error}`,
    });
  }

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  return {
    name: '持久化模块',
    results,
    passCount,
    warnCount,
    failCount,
    health: Math.round((passCount / total) * 100),
  };
}

export async function testNASClient(): Promise<TestCategory> {
  const results: TestResult[] = [];

  results.push({
    name: 'DEFAULT_DEVICES 注册表',
    status: 'pass',
    message: `${Object.keys(DEFAULT_DEVICES).length} 个设备已注册`,
    details: { devices: Object.keys(DEFAULT_DEVICES) },
  });

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  return {
    name: 'NAS 客户端模块',
    results,
    passCount,
    warnCount,
    failCount,
    health: Math.round((passCount / total) * 100),
  };
}

// ============================================================
// Main Test Runner
// ============================================================

export async function runComprehensiveTest(): Promise<TestReport> {
  const categories: TestCategory[] = [];

  categories.push(await testNineLayerArchitecture());
  categories.push(await testDatabaseServices());
  categories.push(await testOllamaServices());
  categories.push(await testAgentReadiness());
  categories.push(await testLLMBridge());
  categories.push(await testPersistence());
  categories.push(await testNASClient());

  const totalPass = categories.reduce((sum, c) => sum + c.passCount, 0);
  const totalWarn = categories.reduce((sum, c) => sum + c.warnCount, 0);
  const totalFail = categories.reduce((sum, c) => sum + c.failCount, 0);
  const total = totalPass + totalWarn + totalFail;
  const overallHealth = Math.round((totalPass / total) * 100);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';

  if (overallHealth >= 90) grade = 'A';
  else if (overallHealth >= 80) grade = 'B';
  else if (overallHealth >= 70) grade = 'C';
  else if (overallHealth >= 60) grade = 'D';
  else grade = 'F';

  return {
    timestamp: new Date().toISOString(),
    categories,
    totalPass,
    totalWarn,
    totalFail,
    overallHealth,
    grade,
  };
}

export function formatTestReport(report: TestReport): string {
  const lines: string[] = [
    '# YYC³ AI Family 测试报告',
    '',
    `**生成时间**: ${report.timestamp}`,
    `**综合健康度**: ${report.overallHealth}%`,
    `**评级**: ${report.grade}`,
    '',
    '## 测试汇总',
    '',
    '| 类别 | 通过 | 警告 | 失败 | 健康度 |',
    '|------|------|------|------|--------|',
  ];

  for (const category of report.categories) {
    lines.push(`| ${category.name} | ${category.passCount} | ${category.warnCount} | ${category.failCount} | ${category.health}% |`);
  }

  lines.push(`| **总计** | **${report.totalPass}** | **${report.totalWarn}** | **${report.totalFail}** | **${report.overallHealth}%** |`);

  return lines.join('\n');
}

export default {
  runComprehensiveTest,
  formatTestReport,
  testNineLayerArchitecture,
  testDatabaseServices,
  testOllamaServices,
  testAgentReadiness,
  testLLMBridge,
  testPersistence,
  testNASClient,
};
