import { useEffect, useRef, useCallback } from 'react';

import { useSystemStore } from './store';

// ============================================================
// YYC3 — Real-time Metrics Simulation Engine
// Phase 9: WebSocket-pattern simulation layer
//
// 模拟 4 个硬件节点的真实指标数据流:
// - M4 Max (主力开发机)
// - iMac M4 (辅助开发机)
// - MateBook X Pro (测试机 — 通常 standby)
// - YanYuCloud NAS (存储节点)
//
// 后续对接: 替换 simulate() 为真实 WebSocket/SSE 连接
// ws://localhost:3001/ws/metrics
// ============================================================

/** 单个节点的指标快照 */
export interface NodeMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number; // Mbps
  temperature: number; // Celsius
  processes: number;
  uptime: number; // hours
}

/** 全集群指标 */
export interface ClusterMetrics {
  'm4-max': NodeMetrics;
  'imac-m4': NodeMetrics;
  'matebook': NodeMetrics;
  'yanyucloud': NodeMetrics;
  timestamp: number;
}

/** 时序数据点 */
export interface MetricDataPoint {
  time: number;
  value: number;
}

// --- Simulation Algorithms ---

/**
 * 带惯性的随机游走: 更真实的服务器指标模拟
 * - base: 基础值 (静息态)
 * - current: 当前值
 * - volatility: 波动率
 * - momentum: 惯性系数 (0-1)
 * - min/max: 边界
 */
function walk(
  current: number,
  base: number,
  volatility: number,
  momentum: number,
  min: number,
  max: number,
): number {
  // 均值回归力
  const reversion = (base - current) * 0.05;
  // 随机冲击
  const shock = (Math.random() - 0.5) * volatility;
  // 惯性延续
  const drift = (current - base) * momentum * 0.1;

  let next = current + reversion + shock + drift;

  // 偶尔的尖峰 (模拟 CI/CD 构建等)
  if (Math.random() < 0.02) {
    next += volatility * 2 * (Math.random() > 0.5 ? 1 : -0.5);
  }

  return Math.max(min, Math.min(max, next));
}

/**
 * 时间感知基础值: 工作时段 CPU 较高
 */
function getTimeAwareBase(defaultBase: number, isWorkstation: boolean): number {
  const hour = new Date().getHours();

  if (!isWorkstation) return defaultBase;

  // 工作时段 9-18 点负载较高
  if (hour >= 9 && hour <= 18) {
    return defaultBase * 1.4;
  }
  // 深夜低负载
  if (hour >= 0 && hour <= 6) {
    return defaultBase * 0.5;
  }

  return defaultBase;
}

// --- Node Baseline Configs ---

interface NodeConfig {
  cpuBase: number;
  memBase: number;
  diskBase: number;
  netBase: number;
  tempBase: number;
  processBase: number;
  uptimeBase: number;
  volatility: number;
  isWorkstation: boolean;
}

const NODE_CONFIGS: Record<string, NodeConfig> = {
  'm4-max': {
    cpuBase: 22, memBase: 38, diskBase: 42, netBase: 120,
    tempBase: 42, processBase: 347, uptimeBase: 168,
    volatility: 8, isWorkstation: true,
  },
  'imac-m4': {
    cpuBase: 12, memBase: 28, diskBase: 35, netBase: 45,
    tempBase: 38, processBase: 198, uptimeBase: 720,
    volatility: 5, isWorkstation: true,
  },
  'matebook': {
    cpuBase: 5, memBase: 15, diskBase: 28, netBase: 8,
    tempBase: 35, processBase: 82, uptimeBase: 48,
    volatility: 3, isWorkstation: false, // standby most of the time
  },
  'yanyucloud': {
    cpuBase: 8, memBase: 62, diskBase: 61, netBase: 200,
    tempBase: 36, processBase: 45, uptimeBase: 2160,
    volatility: 4, isWorkstation: false,
  },
};

// --- Main Hook ---

export function useMetricsSimulator(intervalMs = 2000) {
  const metricsRef = useRef<ClusterMetrics | null>(null);
  const historyRef = useRef<Record<string, Record<string, MetricDataPoint[]>>>({});
  const currentRef = useRef<Record<string, NodeMetrics>>({});
  const addLog = useSystemStore(s => s.addLog);
  const setStatus = useSystemStore(s => s.setStatus);
  const updateMetrics = useSystemStore(s => s.updateMetrics);

  // Initialize current values
  const initMetrics = useCallback(() => {
    const nodes: Record<string, NodeMetrics> = {};

    for (const [nodeId, config] of Object.entries(NODE_CONFIGS)) {
      nodes[nodeId] = {
        cpu: config.cpuBase + (Math.random() - 0.5) * config.volatility,
        memory: config.memBase + (Math.random() - 0.5) * 4,
        disk: config.diskBase,
        network: config.netBase + (Math.random() - 0.5) * 20,
        temperature: config.tempBase + (Math.random() - 0.5) * 3,
        processes: config.processBase + Math.floor((Math.random() - 0.5) * 20),
        uptime: config.uptimeBase + Math.random() * 24,
      };
    }
    currentRef.current = nodes;

    // Init history (20 points each)
    const history: Record<string, Record<string, MetricDataPoint[]>> = {};
    const now = Date.now();

    for (const nodeId of Object.keys(NODE_CONFIGS)) {
      history[nodeId] = { cpu: [], memory: [], network: [], disk: [] };
      for (let i = 19; i >= 0; i--) {
        const t = now - i * intervalMs;
        const n = nodes[nodeId];

        history[nodeId].cpu.push({ time: t, value: n.cpu + (Math.random() - 0.5) * 5 });
        history[nodeId].memory.push({ time: t, value: n.memory + (Math.random() - 0.5) * 2 });
        history[nodeId].network.push({ time: t, value: n.network + (Math.random() - 0.5) * 15 });
        history[nodeId].disk.push({ time: t, value: n.disk + (Math.random() - 0.5) * 0.5 });
      }
    }
    historyRef.current = history;
  }, [intervalMs]);

  // Simulation tick
  const tick = useCallback(() => {
    const now = Date.now();
    const nodes = currentRef.current;
    const history = historyRef.current;

    for (const [nodeId, config] of Object.entries(NODE_CONFIGS)) {
      const prev = nodes[nodeId];
      const cpuBase = getTimeAwareBase(config.cpuBase, config.isWorkstation);

      const next: NodeMetrics = {
        cpu: walk(prev.cpu, cpuBase, config.volatility, 0.3, 1, 98),
        memory: walk(prev.memory, config.memBase, config.volatility * 0.3, 0.5, 5, 95),
        disk: walk(prev.disk, config.diskBase, 0.2, 0.8, 10, 95),
        network: walk(prev.network, config.netBase, config.volatility * 3, 0.2, 0, 1000),
        temperature: walk(prev.temperature, config.tempBase, 1.5, 0.4, 25, 85),
        processes: Math.max(10, Math.round(walk(prev.processes, config.processBase, 5, 0.3, 10, 1000))),
        uptime: prev.uptime + intervalMs / 3600000,
      };

      nodes[nodeId] = next;

      // Push history
      for (const metric of ['cpu', 'memory', 'network', 'disk'] as const) {
        if (!history[nodeId]) history[nodeId] = { cpu: [], memory: [], network: [], disk: [] };
        const arr = history[nodeId][metric];

        arr.push({ time: now, value: next[metric] });
        if (arr.length > 60) arr.shift(); // 保留 60 个数据点
      }
    }

    const cluster: ClusterMetrics = {
      'm4-max': nodes['m4-max'],
      'imac-m4': nodes['imac-m4'],
      'matebook': nodes['matebook'],
      'yanyucloud': nodes['yanyucloud'],
      timestamp: now,
    };

    metricsRef.current = cluster;

    // 写入 Zustand store
    updateMetrics(cluster);

    // 全局状态推断
    const m4Cpu = nodes['m4-max'].cpu;

    if (m4Cpu > 85) {
      setStatus('warning');
    } else if (m4Cpu > 95) {
      setStatus('critical');
    } else {
      setStatus('optimal');
    }

    // 偶尔生成日志 (10% 概率)
    if (Math.random() < 0.1) {
      const sources = ['SCHEDULER', 'KERNEL', 'NETWORK', 'STORAGE', 'MONITOR'];
      const messages = [
        `Heartbeat OK — M4 Max CPU: ${Math.round(m4Cpu)}%`,
        `NAS RAID6 scrub: 0 errors detected`,
        `Memory pressure: ${Math.round(nodes['m4-max'].memory)}% utilized`,
        `Network throughput: ${Math.round(nodes['yanyucloud'].network)} Mbps`,
        `Thermal: M4 Max @ ${Math.round(nodes['m4-max'].temperature)}°C`,
        `Process count: ${nodes['m4-max'].processes} active`,
        `iMac heartbeat: CPU ${Math.round(nodes['imac-m4'].cpu)}%`,
        `Edge sync: MateBook status ${nodes['matebook'].cpu < 10 ? 'STANDBY' : 'ACTIVE'}`,
      ];

      addLog(
        'info',
        sources[Math.floor(Math.random() * sources.length)],
        messages[Math.floor(Math.random() * messages.length)],
      );
    }
  }, [intervalMs, addLog, setStatus, updateMetrics]);

  useEffect(() => {
    // intervalMs === 0 means simulation is disabled (real WebSocket is providing data)
    if (intervalMs === 0) return;

    initMetrics();
    // Initial tick
    tick();

    const id = setInterval(tick, intervalMs);

    return () => clearInterval(id);
  }, [initMetrics, tick, intervalMs]);

  return {
    getMetrics: () => metricsRef.current,
    getHistory: (nodeId: string, metric: string): MetricDataPoint[] => {
      return historyRef.current[nodeId]?.[metric] ?? [];
    },
    getNodeMetrics: (nodeId: string): NodeMetrics | null => {
      return currentRef.current[nodeId] ?? null;
    },
  };
}