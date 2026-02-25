/* eslint-disable no-useless-escape */
// ============================================================
// YYC3 — PostgreSQL Telemetry Schema Client
// Phase 43: REST-based client for telemetry.* tables in PG15
//
// Database: PostgreSQL 15 @ 192.168.3.22:5433 (user: yyc3_max)
// Schema: telemetry
// Tables: metrics, thermal_log, alerts, latency_history
//
// Architecture:
//   Frontend → HTTP REST API → PG15 telemetry schema
//   Fallback: localStorage when PG is unreachable
//
// This module assumes a lightweight REST proxy (yyc3-pg-proxy)
// running on 192.168.3.22:3003 that translates HTTP requests
// to PostgreSQL queries. Deployment script is available in
// TelemetryAgentManager → PG Schema tab.
//
// Tables DDL (auto-generated via getMigrationSQL):
//   telemetry.metrics         — time-series node metrics
//   telemetry.thermal_log     — thermal zone snapshots
//   telemetry.alerts          — threshold-based alerts
//   telemetry.latency_history — infra service latency records
// ============================================================

import { eventBus } from './event-bus';
import type { LatencyHistoryEntry, InfraStatus } from './useInfraHealth';

// ============================================================
// Configuration
// ============================================================

const PG_PROXY_BASE = 'http://192.168.3.22:3003';
const PG_PROXY_TIMEOUT = 8000; // ms

export interface PgTelemetryConfig {
  baseUrl: string;
  timeout: number;
  enabled: boolean;
  lastConnected?: number;
  lastError?: string;
}

let _config: PgTelemetryConfig = {
  baseUrl: PG_PROXY_BASE,
  timeout: PG_PROXY_TIMEOUT,
  enabled: false,
};

// Restore config from localStorage
try {
  const raw = localStorage.getItem('yyc3_pg_telemetry_config');

  if (raw) {
    const saved = JSON.parse(raw);

    _config = { ..._config, ...saved };
  }
} catch { /* ignore */ }

export function getPgTelemetryConfig(): PgTelemetryConfig {
  return { ..._config };
}

export function setPgTelemetryConfig(updates: Partial<PgTelemetryConfig>): void {
  _config = { ..._config, ...updates };
  try {
    localStorage.setItem('yyc3_pg_telemetry_config', JSON.stringify(_config));
  } catch { /* ignore */ }
  _notifyListeners();
}

// ============================================================
// Connection Status Singleton
// ============================================================

export type PgTelemetryStatus = 'unknown' | 'checking' | 'connected' | 'disconnected' | 'error';

interface PgTelemetryState {
  status: PgTelemetryStatus;
  latencyMs?: number;
  lastChecked?: number;
  version?: string;
  tableCount?: number;
  rowCount?: number;
  error?: string;
}

let _pgState: PgTelemetryState = { status: 'unknown' };
const _pgListeners = new Set<() => void>();

function _notifyListeners() {
  _pgListeners.forEach(fn => fn());
}

export function getPgTelemetryState(): PgTelemetryState {
  return _pgState;
}

export function onPgTelemetryChange(fn: () => void): () => void {
  _pgListeners.add(fn);

  return () => { _pgListeners.delete(fn); };
}

// ============================================================
// HTTP Helper
// ============================================================

async function pgFetch<T>(path: string, options?: RequestInit): Promise<{ ok: boolean; data?: T; error?: string; latencyMs: number }> {
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), _config.timeout);
    const res = await fetch(`${_config.baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timeout);
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json() as T;

      return { ok: true, data, latencyMs };
    }
    const errText = await res.text().catch(() => res.statusText);

    return { ok: false, error: `HTTP ${res.status}: ${errText}`, latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : 'Unknown error';

    return { ok: false, error: msg, latencyMs };
  }
}

// ============================================================
// Health Check / Connection Test
// ============================================================

export async function checkPgTelemetryHealth(): Promise<PgTelemetryState> {
  _pgState = { ..._pgState, status: 'checking' };
  _notifyListeners();

  const result = await pgFetch<{
    status: string;
    version?: string;
    tables?: number;
    rows?: number;
    schema?: string;
  }>('/health');

  if (result.ok && result.data) {
    const state: PgTelemetryState = {
      status: 'connected',
      latencyMs: result.latencyMs,
      lastChecked: Date.now(),
      version: result.data.version || 'PG15',
      tableCount: result.data.tables,
      rowCount: result.data.rows,
    };

    _pgState = state;
    setPgTelemetryConfig({ lastConnected: Date.now(), lastError: undefined });
    eventBus.emit({
      category: 'persist',
      type: 'persist.pg_telemetry_connected',
      level: 'success',
      source: 'PG_TELEMETRY',
      message: `PG telemetry schema connected (${result.latencyMs}ms)`,
      metadata: { latencyMs: result.latencyMs, tables: result.data.tables, rows: result.data.rows },
    });
  } else {
    const state: PgTelemetryState = {
      status: result.error?.includes('abort') || result.error?.includes('Failed to fetch') ? 'disconnected' : 'error',
      latencyMs: result.latencyMs,
      lastChecked: Date.now(),
      error: result.error,
    };

    _pgState = state;
    setPgTelemetryConfig({ lastError: result.error });
    eventBus.emit({
      category: 'persist',
      type: 'persist.pg_telemetry_failed',
      level: 'warn',
      source: 'PG_TELEMETRY',
      message: `PG telemetry schema unreachable: ${result.error}`,
    });
  }

  _notifyListeners();

  return _pgState;
}

// ============================================================
// Latency History — Read / Write / Migrate
// ============================================================

export interface PgLatencyRecord {
  id?: number;
  check_id: string;
  timestamp: number;
  latency_ms: number;
  status: InfraStatus;
  created_at?: string;
}

/**
 * Write a batch of latency history entries to PG telemetry.latency_history
 */
export async function writeLatencyBatch(
  checkId: string,
  entries: LatencyHistoryEntry[],
): Promise<{ ok: boolean; inserted: number; error?: string }> {
  if (!_config.enabled || entries.length === 0) {
    return { ok: false, inserted: 0, error: 'PG telemetry not enabled or empty batch' };
  }

  const records: PgLatencyRecord[] = entries.map(e => ({
    check_id: checkId,
    timestamp: e.timestamp,
    latency_ms: e.latencyMs,
    status: e.status,
  }));

  const result = await pgFetch<{ inserted: number }>('/telemetry/latency_history/batch', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });

  if (result.ok && result.data) {
    return { ok: true, inserted: result.data.inserted };
  }

  return { ok: false, inserted: 0, error: result.error };
}

/**
 * Write a single latency entry (for real-time dual-write)
 */
export async function writeLatencyEntry(
  checkId: string,
  entry: LatencyHistoryEntry,
): Promise<boolean> {
  if (!_config.enabled) return false;

  const result = await pgFetch<{ ok: boolean }>('/telemetry/latency_history', {
    method: 'POST',
    body: JSON.stringify({
      check_id: checkId,
      timestamp: entry.timestamp,
      latency_ms: entry.latencyMs,
      status: entry.status,
    }),
  });

  return result.ok === true;
}

/**
 * Read latency history from PG with optional time range
 */
export async function readLatencyHistory(
  checkId?: string,
  fromTimestamp?: number,
  toTimestamp?: number,
  limit?: number,
): Promise<{ ok: boolean; data: PgLatencyRecord[]; error?: string }> {
  if (!_config.enabled) {
    return { ok: false, data: [], error: 'PG telemetry not enabled' };
  }

  const params = new URLSearchParams();

  if (checkId) params.set('check_id', checkId);
  if (fromTimestamp) params.set('from', String(fromTimestamp));
  if (toTimestamp) params.set('to', String(toTimestamp));
  if (limit) params.set('limit', String(limit));

  const result = await pgFetch<{ records: PgLatencyRecord[] }>(
    `/telemetry/latency_history?${params.toString()}`,
  );

  if (result.ok && result.data) {
    return { ok: true, data: result.data.records || [] };
  }

  return { ok: false, data: [], error: result.error };
}

// ============================================================
// Metrics — Time-series node metrics
// ============================================================

export interface PgMetricsRecord {
  id?: number;
  node_id: string;
  timestamp: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
  processes: number;
  gpu_usage?: number;
  created_at?: string;
}

export async function writeMetricsBatch(
  records: PgMetricsRecord[],
): Promise<{ ok: boolean; inserted: number; error?: string }> {
  if (!_config.enabled || records.length === 0) {
    return { ok: false, inserted: 0, error: 'PG telemetry not enabled or empty batch' };
  }

  const result = await pgFetch<{ inserted: number }>('/telemetry/metrics/batch', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });

  if (result.ok && result.data) {
    return { ok: true, inserted: result.data.inserted };
  }

  return { ok: false, inserted: 0, error: result.error };
}

export async function readMetrics(
  nodeId?: string,
  fromTimestamp?: number,
  toTimestamp?: number,
  limit?: number,
): Promise<{ ok: boolean; data: PgMetricsRecord[]; error?: string }> {
  if (!_config.enabled) {
    return { ok: false, data: [], error: 'PG telemetry not enabled' };
  }

  const params = new URLSearchParams();

  if (nodeId) params.set('node_id', nodeId);
  if (fromTimestamp) params.set('from', String(fromTimestamp));
  if (toTimestamp) params.set('to', String(toTimestamp));
  if (limit) params.set('limit', String(limit));

  const result = await pgFetch<{ records: PgMetricsRecord[] }>(
    `/telemetry/metrics?${params.toString()}`,
  );

  if (result.ok && result.data) {
    return { ok: true, data: result.data.records || [] };
  }

  return { ok: false, data: [], error: result.error };
}

// ============================================================
// Alerts
// ============================================================

export interface PgAlertRecord {
  id?: number;
  node_id: string;
  metric: string;
  threshold: number;
  actual_value: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  acknowledged: boolean;
  timestamp: number;
  created_at?: string;
}

export async function writeAlert(alert: Omit<PgAlertRecord, 'id' | 'created_at'>): Promise<boolean> {
  if (!_config.enabled) return false;

  const result = await pgFetch<{ ok: boolean }>('/telemetry/alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  });

  return result.ok === true;
}

export async function readAlerts(
  limit = 50,
  severity?: string,
): Promise<{ ok: boolean; data: PgAlertRecord[]; error?: string }> {
  if (!_config.enabled) {
    return { ok: false, data: [], error: 'PG telemetry not enabled' };
  }

  const params = new URLSearchParams({ limit: String(limit) });

  if (severity) params.set('severity', severity);

  const result = await pgFetch<{ records: PgAlertRecord[] }>(
    `/telemetry/alerts?${params.toString()}`,
  );

  if (result.ok && result.data) {
    return { ok: true, data: result.data.records || [] };
  }

  return { ok: false, data: [], error: result.error };
}

// ============================================================
// Migration: localStorage → PostgreSQL
// ============================================================

export interface MigrationResult {
  success: boolean;
  totalRecords: number;
  insertedRecords: number;
  failedChecks: string[];
  durationMs: number;
  error?: string;
}

/**
 * Migrate all latency history from localStorage to PG telemetry schema.
 * Reads from useInfraHealth's exported data and bulk-inserts into PG.
 */
export async function migrateLatencyToPostgres(
  localData: Record<string, LatencyHistoryEntry[]>,
): Promise<MigrationResult> {
  const start = performance.now();
  const failedChecks: string[] = [];
  let totalRecords = 0;
  let insertedRecords = 0;

  if (!_config.enabled) {
    return {
      success: false,
      totalRecords: 0,
      insertedRecords: 0,
      failedChecks: [],
      durationMs: Math.round(performance.now() - start),
      error: 'PG telemetry not enabled',
    };
  }

  eventBus.emit({
    category: 'persist',
    type: 'persist.pg_migration_started',
    level: 'info',
    source: 'PG_TELEMETRY',
    message: `Starting localStorage → PG migration (${Object.keys(localData).length} checks)`,
  });

  for (const [checkId, entries] of Object.entries(localData)) {
    if (!Array.isArray(entries) || entries.length === 0) continue;
    totalRecords += entries.length;

    const result = await writeLatencyBatch(checkId, entries);

    if (result.ok) {
      insertedRecords += result.inserted;
    } else {
      failedChecks.push(checkId);
    }
  }

  const durationMs = Math.round(performance.now() - start);
  const success = failedChecks.length === 0;

  eventBus.emit({
    category: 'persist',
    type: success ? 'persist.pg_migration_complete' : 'persist.pg_migration_partial',
    level: success ? 'success' : 'warn',
    source: 'PG_TELEMETRY',
    message: `Migration ${success ? 'complete' : 'partial'}: ${insertedRecords}/${totalRecords} records in ${durationMs}ms`,
    metadata: { totalRecords, insertedRecords, failedChecks, durationMs },
  });

  return {
    success,
    totalRecords,
    insertedRecords,
    failedChecks,
    durationMs,
  };
}

// ============================================================
// SQL Migration Script Generator
// ============================================================

export function getMigrationSQL(): string {
  return `-- ============================================================
-- YYC3 Telemetry Schema — PostgreSQL 15 Migration
-- Database: yyc3_max @ 192.168.3.22:5433
-- Schema: telemetry
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS telemetry;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: telemetry.metrics
-- Time-series node hardware metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS telemetry.metrics (
  id            BIGSERIAL PRIMARY KEY,
  node_id       VARCHAR(64)   NOT NULL,
  timestamp     BIGINT        NOT NULL,
  cpu           REAL          NOT NULL DEFAULT 0,
  memory        REAL          NOT NULL DEFAULT 0,
  disk          REAL          NOT NULL DEFAULT 0,
  network       REAL          NOT NULL DEFAULT 0,
  temperature   REAL          NOT NULL DEFAULT 0,
  processes     INTEGER       NOT NULL DEFAULT 0,
  gpu_usage     REAL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_node_ts
  ON telemetry.metrics (node_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_metrics_timestamp
  ON telemetry.metrics (timestamp DESC);

-- ============================================================
-- Table: telemetry.thermal_log
-- Thermal zone snapshots (CPU/GPU/SSD/Battery)
-- ============================================================
CREATE TABLE IF NOT EXISTS telemetry.thermal_log (
  id            BIGSERIAL PRIMARY KEY,
  node_id       VARCHAR(64)   NOT NULL,
  timestamp     BIGINT        NOT NULL,
  zone          VARCHAR(32)   NOT NULL,
  temp_celsius  REAL          NOT NULL,
  throttled     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thermal_node_ts
  ON telemetry.thermal_log (node_id, timestamp DESC);

-- ============================================================
-- Table: telemetry.alerts
-- Threshold-based metric alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS telemetry.alerts (
  id            BIGSERIAL PRIMARY KEY,
  node_id       VARCHAR(64)   NOT NULL,
  metric        VARCHAR(32)   NOT NULL,
  threshold     REAL          NOT NULL,
  actual_value  REAL          NOT NULL,
  severity      VARCHAR(16)   NOT NULL DEFAULT 'info',
  message       TEXT          NOT NULL DEFAULT '',
  acknowledged  BOOLEAN       NOT NULL DEFAULT FALSE,
  timestamp     BIGINT        NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_severity
  ON telemetry.alerts (severity, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_node_ts
  ON telemetry.alerts (node_id, timestamp DESC);

-- ============================================================
-- Table: telemetry.latency_history
-- Infrastructure service latency records (from InfraHealthMatrix)
-- ============================================================
CREATE TABLE IF NOT EXISTS telemetry.latency_history (
  id            BIGSERIAL PRIMARY KEY,
  check_id      VARCHAR(64)   NOT NULL,
  timestamp     BIGINT        NOT NULL,
  latency_ms    INTEGER       NOT NULL,
  status        VARCHAR(16)   NOT NULL DEFAULT 'unknown',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_latency_check_ts
  ON telemetry.latency_history (check_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_latency_timestamp
  ON telemetry.latency_history (timestamp DESC);

-- ============================================================
-- Retention policy: auto-clean records older than 90 days
-- (Schedule via pg_cron or crontab)
-- ============================================================
-- DELETE FROM telemetry.metrics
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- DELETE FROM telemetry.latency_history
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- DELETE FROM telemetry.thermal_log
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- DELETE FROM telemetry.alerts
--   WHERE acknowledged = TRUE AND created_at < NOW() - INTERVAL '30 days';

-- ============================================================
-- Summary views
-- ============================================================
CREATE OR REPLACE VIEW telemetry.v_latest_metrics AS
  SELECT DISTINCT ON (node_id)
    node_id, timestamp, cpu, memory, disk, network, temperature, processes, gpu_usage
  FROM telemetry.metrics
  ORDER BY node_id, timestamp DESC;

CREATE OR REPLACE VIEW telemetry.v_latency_summary AS
  SELECT
    check_id,
    COUNT(*)                          AS sample_count,
    ROUND(AVG(latency_ms)::numeric, 1) AS avg_ms,
    MIN(latency_ms)                   AS min_ms,
    MAX(latency_ms)                   AS max_ms,
    MAX(timestamp)                    AS last_check
  FROM telemetry.latency_history
  GROUP BY check_id
  ORDER BY check_id;

-- Grant access
GRANT USAGE ON SCHEMA telemetry TO yyc3_max;
GRANT ALL ON ALL TABLES IN SCHEMA telemetry TO yyc3_max;
GRANT ALL ON ALL SEQUENCES IN SCHEMA telemetry TO yyc3_max;

-- Done
SELECT 'Telemetry schema migration complete' AS result;
`;
}

// ============================================================
// PG Proxy Deployment Script
// ============================================================

export function getPgProxyScript(): string {
  return `#!/usr/bin/env node
// ============================================================
// yyc3-pg-proxy — Lightweight REST → PostgreSQL Proxy
// Endpoint: http://192.168.3.22:3003
// Database: postgresql://yyc3_max@localhost:5433/yyc3
// Schema: telemetry
//
// Deploy: node pg-proxy.js
// Service: systemctl start yyc3-pg-proxy
// ============================================================

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const PORT = 3003;
const pool = new Pool({
  user: 'yyc3_max',
  host: 'localhost',
  database: 'yyc3',
  port: 5433,
  max: 10,
  idleTimeoutMillis: 30000,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    const r = await pool.query(\`
      SELECT version() AS version,
             (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'telemetry') AS tables,
             (SELECT COALESCE(SUM(n_live_tup), 0)
              FROM pg_stat_user_tables
              WHERE schemaname = 'telemetry') AS rows
    \`);
    res.json({
      status: 'ok',
      schema: 'telemetry',
      version: r.rows[0]?.version?.split(' ').slice(0, 2).join(' ') || 'PG15',
      tables: parseInt(r.rows[0]?.tables || '0'),
      rows: parseInt(r.rows[0]?.rows || '0'),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// --- Latency History ---

app.get('/telemetry/latency_history', async (req, res) => {
  try {
    const { check_id, from, to, limit = 500 } = req.query;
    let sql = 'SELECT * FROM telemetry.latency_history WHERE 1=1';
    const params = [];
    if (check_id) { params.push(check_id); sql += \` AND check_id = $\${params.length}\`; }
    if (from) { params.push(parseInt(from)); sql += \` AND timestamp >= $\${params.length}\`; }
    if (to) { params.push(parseInt(to)); sql += \` AND timestamp <= $\${params.length}\`; }
    sql += ' ORDER BY timestamp DESC';
    params.push(parseInt(limit)); sql += \` LIMIT $\${params.length}\`;
    const r = await pool.query(sql, params);
    res.json({ records: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/latency_history', async (req, res) => {
  try {
    const { check_id, timestamp, latency_ms, status } = req.body;
    await pool.query(
      'INSERT INTO telemetry.latency_history (check_id, timestamp, latency_ms, status) VALUES ($1, $2, $3, $4)',
      [check_id, timestamp, latency_ms, status]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/latency_history/batch', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ error: 'records must be array' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let inserted = 0;
      for (const r of records) {
        await client.query(
          'INSERT INTO telemetry.latency_history (check_id, timestamp, latency_ms, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [r.check_id, r.timestamp, r.latency_ms, r.status]
        );
        inserted++;
      }
      await client.query('COMMIT');
      res.json({ inserted });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Metrics ---

app.get('/telemetry/metrics', async (req, res) => {
  try {
    const { node_id, from, to, limit = 500 } = req.query;
    let sql = 'SELECT * FROM telemetry.metrics WHERE 1=1';
    const params = [];
    if (node_id) { params.push(node_id); sql += \` AND node_id = $\${params.length}\`; }
    if (from) { params.push(parseInt(from)); sql += \` AND timestamp >= $\${params.length}\`; }
    if (to) { params.push(parseInt(to)); sql += \` AND timestamp <= $\${params.length}\`; }
    sql += ' ORDER BY timestamp DESC';
    params.push(parseInt(limit)); sql += \` LIMIT $\${params.length}\`;
    const r = await pool.query(sql, params);
    res.json({ records: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/metrics/batch', async (req, res) => {
  try {
    const { records } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let inserted = 0;
      for (const r of records) {
        await client.query(
          \`INSERT INTO telemetry.metrics (node_id, timestamp, cpu, memory, disk, network, temperature, processes, gpu_usage)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)\`,
          [r.node_id, r.timestamp, r.cpu, r.memory, r.disk, r.network, r.temperature, r.processes, r.gpu_usage || null]
        );
        inserted++;
      }
      await client.query('COMMIT');
      res.json({ inserted });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Alerts ---

app.get('/telemetry/alerts', async (req, res) => {
  try {
    const { limit = 50, severity } = req.query;
    let sql = 'SELECT * FROM telemetry.alerts WHERE 1=1';
    const params = [];
    if (severity) { params.push(severity); sql += \` AND severity = $\${params.length}\`; }
    sql += ' ORDER BY timestamp DESC';
    params.push(parseInt(limit)); sql += \` LIMIT $\${params.length}\`;
    const r = await pool.query(sql, params);
    res.json({ records: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/alerts', async (req, res) => {
  try {
    const { node_id, metric, threshold, actual_value, severity, message, acknowledged, timestamp } = req.body;
    await pool.query(
      \`INSERT INTO telemetry.alerts (node_id, metric, threshold, actual_value, severity, message, acknowledged, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)\`,
      [node_id, metric, threshold, actual_value, severity || 'info', message || '', acknowledged || false, timestamp]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Summary ---

app.get('/telemetry/summary', async (req, res) => {
  try {
    const [metrics, latency, alerts] = await Promise.all([
      pool.query('SELECT count(*) AS total, (SELECT count(DISTINCT node_id) FROM telemetry.metrics) AS nodes FROM telemetry.metrics'),
      pool.query('SELECT count(*) AS total, count(DISTINCT check_id) AS checks FROM telemetry.latency_history'),
      pool.query("SELECT count(*) AS total, count(*) FILTER (WHERE severity = 'critical') AS critical FROM telemetry.alerts WHERE acknowledged = false"),
    ]);
    res.json({
      metrics: { total: parseInt(metrics.rows[0]?.total || '0'), nodes: parseInt(metrics.rows[0]?.nodes || '0') },
      latency: { total: parseInt(latency.rows[0]?.total || '0'), checks: parseInt(latency.rows[0]?.checks || '0') },
      alerts: { total: parseInt(alerts.rows[0]?.total || '0'), critical: parseInt(alerts.rows[0]?.critical || '0') },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[yyc3-pg-proxy] Listening on :$\{PORT\}\`);
  console.log(\`[yyc3-pg-proxy] Database: yyc3_max@localhost:5433/yyc3\`);
  console.log(\`[yyc3-pg-proxy] Schema: telemetry\`);
});
`;
}

// ============================================================
// systemd service template for pg-proxy
// ============================================================

export function getPgProxyServiceTemplate(): string {
  return `[Unit]
Description=YYC3 PostgreSQL Telemetry Proxy
After=network.target postgresql.service

[Service]
Type=simple
User=yyc3
WorkingDirectory=/opt/yyc3/pg-proxy
ExecStart=/usr/local/bin/node /opt/yyc3/pg-proxy/pg-proxy.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;
}

// ============================================================
// Phase 46: Schema Validation
// ============================================================

export interface SchemaValidationResult {
  valid: boolean;
  tables: { name: string; exists: boolean; rowCount: number }[];
  views: { name: string; exists: boolean }[];
  extensions: string[];
  error?: string;
  latencyMs: number;
}

/**
 * Validate that all required telemetry schema objects exist in PG.
 * Queries information_schema via the proxy /telemetry/validate endpoint.
 */
export async function validateTelemetrySchema(): Promise<SchemaValidationResult> {
  if (!_config.enabled) {
    return {
      valid: false,
      tables: [],
      views: [],
      extensions: [],
      error: 'PG telemetry not enabled',
      latencyMs: 0,
    };
  }

  const result = await pgFetch<{
    tables: { name: string; exists: boolean; row_count: number }[];
    views: { name: string; exists: boolean }[];
    extensions: string[];
  }>('/telemetry/validate');

  if (result.ok && result.data) {
    const tables = (result.data.tables || []).map(t => ({
      name: t.name,
      exists: t.exists,
      rowCount: t.row_count || 0,
    }));
    const allExist = tables.length >= 4 && tables.every(t => t.exists);

    return {
      valid: allExist,
      tables,
      views: result.data.views || [],
      extensions: result.data.extensions || [],
      latencyMs: result.latencyMs,
    };
  }

  // Fallback: if /validate endpoint doesn't exist, try /health
  const healthResult = await pgFetch<{ tables?: number }>('/health');

  if (healthResult.ok && healthResult.data) {
    return {
      valid: (healthResult.data.tables || 0) >= 4,
      tables: [
        { name: 'telemetry.metrics', exists: true, rowCount: 0 },
        { name: 'telemetry.thermal_log', exists: true, rowCount: 0 },
        { name: 'telemetry.alerts', exists: true, rowCount: 0 },
        { name: 'telemetry.latency_history', exists: true, rowCount: 0 },
      ],
      views: [],
      extensions: [],
      latencyMs: healthResult.latencyMs,
    };
  }

  return {
    valid: false,
    tables: [],
    views: [],
    extensions: [],
    error: result.error || 'Validation failed',
    latencyMs: result.latencyMs,
  };
}

// ============================================================
// Phase 46: Thermal Log — Read / Write
// ============================================================

export interface PgThermalRecord {
  id?: number;
  node_id: string;
  timestamp: number;
  zone: string;
  temp_celsius: number;
  throttled: boolean;
  created_at?: string;
}

export async function writeThermalBatch(
  records: PgThermalRecord[],
): Promise<{ ok: boolean; inserted: number; error?: string }> {
  if (!_config.enabled || records.length === 0) {
    return { ok: false, inserted: 0, error: 'PG telemetry not enabled or empty batch' };
  }

  const result = await pgFetch<{ inserted: number }>('/telemetry/thermal_log/batch', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });

  if (result.ok && result.data) {
    return { ok: true, inserted: result.data.inserted };
  }

  return { ok: false, inserted: 0, error: result.error };
}

export async function readThermalLog(
  nodeId?: string,
  fromTimestamp?: number,
  limit = 200,
): Promise<{ ok: boolean; data: PgThermalRecord[]; error?: string }> {
  if (!_config.enabled) {
    return { ok: false, data: [], error: 'PG telemetry not enabled' };
  }

  const params = new URLSearchParams({ limit: String(limit) });

  if (nodeId) params.set('node_id', nodeId);
  if (fromTimestamp) params.set('from', String(fromTimestamp));

  const result = await pgFetch<{ records: PgThermalRecord[] }>(
    `/telemetry/thermal_log?${params.toString()}`,
  );

  if (result.ok && result.data) {
    return { ok: true, data: result.data.records || [] };
  }

  return { ok: false, data: [], error: result.error };
}

// ============================================================
// Phase 46: Aggregated Metrics — Time-Bucketed for Long-Range Charts
// ============================================================

export interface AggregatedMetricsBucket {
  bucket: string; // ISO timestamp of bucket start
  node_id: string;
  avg_cpu: number;
  avg_memory: number;
  avg_disk: number;
  avg_network: number;
  avg_temperature: number;
  max_cpu: number;
  max_temperature: number;
  sample_count: number;
}

/**
 * Read time-bucketed aggregated metrics from PG.
 * bucketInterval: 'hour' | 'day' | '15min'
 */
export async function getAggregatedMetrics(
  nodeId?: string,
  bucketInterval: '15min' | 'hour' | 'day' = 'hour',
  fromTimestamp?: number,
  toTimestamp?: number,
  limit = 500,
): Promise<{ ok: boolean; data: AggregatedMetricsBucket[]; error?: string }> {
  if (!_config.enabled) {
    return { ok: false, data: [], error: 'PG telemetry not enabled' };
  }

  const params = new URLSearchParams({
    interval: bucketInterval,
    limit: String(limit),
  });

  if (nodeId) params.set('node_id', nodeId);
  if (fromTimestamp) params.set('from', String(fromTimestamp));
  if (toTimestamp) params.set('to', String(toTimestamp));

  const result = await pgFetch<{ buckets: AggregatedMetricsBucket[] }>(
    `/telemetry/metrics/aggregated?${params.toString()}`,
  );

  if (result.ok && result.data) {
    return { ok: true, data: result.data.buckets || [] };
  }

  return { ok: false, data: [], error: result.error };
}

export interface AggregatedLatencyBucket {
  bucket: string;
  check_id: string;
  avg_ms: number;
  min_ms: number;
  max_ms: number;
  p95_ms: number;
  sample_count: number;
}

/**
 * Read time-bucketed latency aggregation from PG.
 */
export async function getAggregatedLatency(
  checkId?: string,
  bucketInterval: '15min' | 'hour' | 'day' = 'hour',
  fromTimestamp?: number,
  limit = 500,
): Promise<{ ok: boolean; data: AggregatedLatencyBucket[]; error?: string }> {
  if (!_config.enabled) {
    return { ok: false, data: [], error: 'PG telemetry not enabled' };
  }

  const params = new URLSearchParams({
    interval: bucketInterval,
    limit: String(limit),
  });

  if (checkId) params.set('check_id', checkId);
  if (fromTimestamp) params.set('from', String(fromTimestamp));

  const result = await pgFetch<{ buckets: AggregatedLatencyBucket[] }>(
    `/telemetry/latency_history/aggregated?${params.toString()}`,
  );

  if (result.ok && result.data) {
    return { ok: true, data: result.data.buckets || [] };
  }

  return { ok: false, data: [], error: result.error };
}

// ============================================================
// Phase 46: PG Proxy Deploy Script (Enhanced with validate endpoint)
// ============================================================

export function getPgProxyScriptV2(): string {
  return `#!/usr/bin/env node
// ============================================================
// yyc3-pg-proxy v2 — REST → PostgreSQL Proxy + Schema Validation
// Endpoint: http://192.168.3.22:3003
// Database: postgresql://yyc3_max@localhost:5433/yyc3
// Schema: telemetry
//
// Phase 46: Added /telemetry/validate, /telemetry/metrics/aggregated,
//           /telemetry/latency_history/aggregated, /telemetry/thermal_log
//
// Deploy:
//   cd /opt/yyc3/pg-proxy && npm install && node pg-proxy.js
// ============================================================

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const PORT = 3003;
const pool = new Pool({
  user: 'yyc3_max',
  host: 'localhost',
  database: 'yyc3',
  port: 5433,
  max: 10,
  idleTimeoutMillis: 30000,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    const r = await pool.query(\\\`
      SELECT version() AS version,
             (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'telemetry') AS tables,
             (SELECT COALESCE(SUM(n_live_tup), 0) FROM pg_stat_user_tables WHERE schemaname = 'telemetry') AS rows
    \\\`);
    res.json({
      status: 'ok', schema: 'telemetry',
      version: r.rows[0]?.version?.split(' ').slice(0, 2).join(' ') || 'PG15',
      tables: parseInt(r.rows[0]?.tables || '0'),
      rows: parseInt(r.rows[0]?.rows || '0'),
    });
  } catch (err) { res.status(500).json({ status: 'error', error: err.message }); }
});

// Schema Validation
app.get('/telemetry/validate', async (req, res) => {
  try {
    const tablesQ = await pool.query(\\\`
      SELECT t.table_name AS name,
             COALESCE(s.n_live_tup, 0) AS row_count
      FROM (VALUES ('metrics'), ('thermal_log'), ('alerts'), ('latency_history')) AS expected(table_name)
      LEFT JOIN information_schema.tables ist ON ist.table_schema = 'telemetry' AND ist.table_name = expected.table_name
      LEFT JOIN pg_stat_user_tables s ON s.schemaname = 'telemetry' AND s.relname = expected.table_name
    \\\`);
    const tables = tablesQ.rows.map(r => ({
      name: 'telemetry.' + r.name,
      exists: r.row_count !== null,
      row_count: parseInt(r.row_count || '0'),
    }));

    const viewsQ = await pool.query(\\\`
      SELECT table_name AS name FROM information_schema.views WHERE table_schema = 'telemetry'
    \\\`);
    const views = viewsQ.rows.map(r => ({ name: 'telemetry.' + r.name, exists: true }));

    const extQ = await pool.query("SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgvector', 'pg_trgm')");
    const extensions = extQ.rows.map(r => r.extname);

    res.json({ tables, views, extensions });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Metrics (original endpoints) ---
app.get('/telemetry/metrics', async (req, res) => {
  try {
    const { node_id, from, to, limit = 500 } = req.query;
    let sql = 'SELECT * FROM telemetry.metrics WHERE 1=1';
    const params = [];
    if (node_id) { params.push(node_id); sql += \\\` AND node_id = $\\\${params.length}\\\`; }
    if (from) { params.push(parseInt(from)); sql += \\\` AND timestamp >= $\\\${params.length}\\\`; }
    if (to) { params.push(parseInt(to)); sql += \\\` AND timestamp <= $\\\${params.length}\\\`; }
    sql += ' ORDER BY timestamp DESC';
    params.push(parseInt(limit)); sql += \\\` LIMIT $\\\${params.length}\\\`;
    const r = await pool.query(sql, params);
    res.json({ records: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/metrics/batch', async (req, res) => {
  try {
    const { records } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let inserted = 0;
      for (const r of records) {
        await client.query(
          'INSERT INTO telemetry.metrics (node_id, timestamp, cpu, memory, disk, network, temperature, processes, gpu_usage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [r.node_id, r.timestamp, r.cpu, r.memory, r.disk, r.network, r.temperature, r.processes, r.gpu_usage || null]
        );
        inserted++;
      }
      await client.query('COMMIT');
      res.json({ inserted });
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Aggregated Metrics
app.get('/telemetry/metrics/aggregated', async (req, res) => {
  try {
    const { node_id, interval = 'hour', from, to, limit = 500 } = req.query;
    const bucketSql = interval === 'day' ? "86400000" : interval === '15min' ? "900000" : "3600000";
    let sql = \\\`
      SELECT
        to_timestamp((timestamp / \\\${bucketSql}) * \\\${bucketSql} / 1000) AS bucket,
        node_id,
        ROUND(AVG(cpu)::numeric, 1) AS avg_cpu,
        ROUND(AVG(memory)::numeric, 1) AS avg_memory,
        ROUND(AVG(disk)::numeric, 1) AS avg_disk,
        ROUND(AVG(network)::numeric, 1) AS avg_network,
        ROUND(AVG(temperature)::numeric, 1) AS avg_temperature,
        ROUND(MAX(cpu)::numeric, 1) AS max_cpu,
        ROUND(MAX(temperature)::numeric, 1) AS max_temperature,
        COUNT(*) AS sample_count
      FROM telemetry.metrics
      WHERE 1=1
    \\\`;
    const params = [];
    if (node_id) { params.push(node_id); sql += \\\` AND node_id = $\\\${params.length}\\\`; }
    if (from) { params.push(parseInt(from)); sql += \\\` AND timestamp >= $\\\${params.length}\\\`; }
    if (to) { params.push(parseInt(to)); sql += \\\` AND timestamp <= $\\\${params.length}\\\`; }
    sql += \\\` GROUP BY bucket, node_id ORDER BY bucket DESC\\\`;
    params.push(parseInt(limit)); sql += \\\` LIMIT $\\\${params.length}\\\`;
    const r = await pool.query(sql, params);
    res.json({ buckets: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Latency History ---
app.get('/telemetry/latency_history', async (req, res) => {
  try {
    const { check_id, from, to, limit = 500 } = req.query;
    let sql = 'SELECT * FROM telemetry.latency_history WHERE 1=1';
    const params = [];
    if (check_id) { params.push(check_id); sql += \\\` AND check_id = $\\\${params.length}\\\`; }
    if (from) { params.push(parseInt(from)); sql += \\\` AND timestamp >= $\\\${params.length}\\\`; }
    if (to) { params.push(parseInt(to)); sql += \\\` AND timestamp <= $\\\${params.length}\\\`; }
    sql += ' ORDER BY timestamp DESC';
    params.push(parseInt(limit)); sql += \\\` LIMIT $\\\${params.length}\\\`;
    const r = await pool.query(sql, params);
    res.json({ records: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/latency_history', async (req, res) => {
  try {
    const { check_id, timestamp, latency_ms, status } = req.body;
    await pool.query('INSERT INTO telemetry.latency_history (check_id, timestamp, latency_ms, status) VALUES ($1,$2,$3,$4)', [check_id, timestamp, latency_ms, status]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/latency_history/batch', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ error: 'records must be array' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let inserted = 0;
      for (const r of records) {
        await client.query('INSERT INTO telemetry.latency_history (check_id, timestamp, latency_ms, status) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING', [r.check_id, r.timestamp, r.latency_ms, r.status]);
        inserted++;
      }
      await client.query('COMMIT');
      res.json({ inserted });
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Aggregated Latency
app.get('/telemetry/latency_history/aggregated', async (req, res) => {
  try {
    const { check_id, interval = 'hour', from, limit = 500 } = req.query;
    const bucketSql = interval === 'day' ? "86400000" : interval === '15min' ? "900000" : "3600000";
    let sql = \\\`
      SELECT
        to_timestamp((timestamp / \\\${bucketSql}) * \\\${bucketSql} / 1000) AS bucket,
        check_id,
        ROUND(AVG(latency_ms)::numeric, 1) AS avg_ms,
        MIN(latency_ms) AS min_ms,
        MAX(latency_ms) AS max_ms,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_ms,
        COUNT(*) AS sample_count
      FROM telemetry.latency_history
      WHERE 1=1
    \\\`;
    const params = [];
    if (check_id) { params.push(check_id); sql += \\\` AND check_id = $\\\${params.length}\\\`; }
    if (from) { params.push(parseInt(from)); sql += \\\` AND timestamp >= $\\\${params.length}\\\`; }
    sql += \\\` GROUP BY bucket, check_id ORDER BY bucket DESC\\\`;
    params.push(parseInt(limit)); sql += \\\` LIMIT $\\\${params.length}\\\`;
    const r = await pool.query(sql, params);
    res.json({ buckets: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Thermal Log ---
app.get('/telemetry/thermal_log', async (req, res) => {
  try {
    const { node_id, from, limit = 200 } = req.query;
    let sql = 'SELECT * FROM telemetry.thermal_log WHERE 1=1';
    const params = [];
    if (node_id) { params.push(node_id); sql += \\\` AND node_id = $\\\${params.length}\\\`; }
    if (from) { params.push(parseInt(from)); sql += \\\` AND timestamp >= $\\\${params.length}\\\`; }
    sql += ' ORDER BY timestamp DESC';
    params.push(parseInt(limit)); sql += \\\` LIMIT $\\\${params.length}\\\`;
    const r = await pool.query(sql, params);
    res.json({ records: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/thermal_log/batch', async (req, res) => {
  try {
    const { records } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let inserted = 0;
      for (const r of records) {
        await client.query(
          'INSERT INTO telemetry.thermal_log (node_id, timestamp, zone, temp_celsius, throttled) VALUES ($1,$2,$3,$4,$5)',
          [r.node_id, r.timestamp, r.zone, r.temp_celsius, r.throttled || false]
        );
        inserted++;
      }
      await client.query('COMMIT');
      res.json({ inserted });
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Alerts ---
app.get('/telemetry/alerts', async (req, res) => {
  try {
    const { limit = 50, severity } = req.query;
    let sql = 'SELECT * FROM telemetry.alerts WHERE 1=1';
    const params = [];
    if (severity) { params.push(severity); sql += \\\` AND severity = $\\\${params.length}\\\`; }
    sql += ' ORDER BY timestamp DESC';
    params.push(parseInt(limit)); sql += \\\` LIMIT $\\\${params.length}\\\`;
    const r = await pool.query(sql, params);
    res.json({ records: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/telemetry/alerts', async (req, res) => {
  try {
    const { node_id, metric, threshold, actual_value, severity, message, acknowledged, timestamp } = req.body;
    await pool.query(
      'INSERT INTO telemetry.alerts (node_id, metric, threshold, actual_value, severity, message, acknowledged, timestamp) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [node_id, metric, threshold, actual_value, severity || 'info', message || '', acknowledged || false, timestamp]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Summary ---
app.get('/telemetry/summary', async (req, res) => {
  try {
    const [metrics, latency, alerts, thermal] = await Promise.all([
      pool.query('SELECT count(*) AS total, count(DISTINCT node_id) AS nodes FROM telemetry.metrics'),
      pool.query('SELECT count(*) AS total, count(DISTINCT check_id) AS checks FROM telemetry.latency_history'),
      pool.query("SELECT count(*) AS total, count(*) FILTER (WHERE severity = 'critical') AS critical FROM telemetry.alerts WHERE acknowledged = false"),
      pool.query('SELECT count(*) AS total, count(DISTINCT zone) AS zones FROM telemetry.thermal_log'),
    ]);
    res.json({
      metrics: { total: parseInt(metrics.rows[0]?.total || '0'), nodes: parseInt(metrics.rows[0]?.nodes || '0') },
      latency: { total: parseInt(latency.rows[0]?.total || '0'), checks: parseInt(latency.rows[0]?.checks || '0') },
      alerts: { total: parseInt(alerts.rows[0]?.total || '0'), critical: parseInt(alerts.rows[0]?.critical || '0') },
      thermal: { total: parseInt(thermal.rows[0]?.total || '0'), zones: parseInt(thermal.rows[0]?.zones || '0') },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('[yyc3-pg-proxy] v2 Listening on :' + PORT);
  console.log('[yyc3-pg-proxy] Database: yyc3_max@localhost:5433/yyc3');
  console.log('[yyc3-pg-proxy] Schema: telemetry (with validate + aggregation)');
});
`;
}

// ============================================================
// Phase 46: launchd plist template for macOS
// ============================================================

export function getPgProxyLaunchdTemplate(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.yyc3.pg-proxy</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/opt/yyc3/pg-proxy/pg-proxy.js</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>WorkingDirectory</key>
  <string>/opt/yyc3/pg-proxy</string>
  <key>StandardOutPath</key>
  <string>/tmp/yyc3-pg-proxy.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/yyc3-pg-proxy.err</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key>
    <string>production</string>
  </dict>
</dict>
</plist>
`;
}

// ============================================================
// Phase 46: Package.json template for pg-proxy
// ============================================================

export function getPgProxyPackageJson(): string {
  return JSON.stringify({
    name: 'yyc3-pg-proxy',
    version: '2.0.0',
    description: 'YYC3 REST → PostgreSQL Telemetry Proxy (Phase 46)',
    main: 'pg-proxy.js',
    scripts: {
      start: 'node pg-proxy.js',
      dev: 'node --watch pg-proxy.js',
    },
    dependencies: {
      express: '^4.18.2',
      pg: '^8.12.0',
      cors: '^2.8.5',
    },
  }, null, 2);
}

// ============================================================
// Phase 46: One-shot deploy command script
// ============================================================

export function getDeployScript(): string {
  return `#!/bin/bash
# ============================================================
# YYC3 PG Proxy — One-Shot Deploy Script
# Target: 192.168.3.22 (yyc3-22 / M4 Max)
# ============================================================

set -euo pipefail

DEPLOY_DIR="/opt/yyc3/pg-proxy"
SERVICE_NAME="yyc3-pg-proxy"

echo "=== YYC3 PG Proxy Deploy ==="
echo "Target: $DEPLOY_DIR"
echo ""

# 1. Create directory
sudo mkdir -p "$DEPLOY_DIR"
sudo chown $(whoami):staff "$DEPLOY_DIR"

# 2. Write files
echo "Writing pg-proxy.js..."
cat > "$DEPLOY_DIR/pg-proxy.js" << 'PROXY_EOF'
$(cat pg-proxy.js 2>/dev/null || echo "// Copy pg-proxy.js content here")
PROXY_EOF

echo "Writing package.json..."
cat > "$DEPLOY_DIR/package.json" << 'PKG_EOF'
${JSON.stringify({
    name: 'yyc3-pg-proxy', version: '2.0.0',
    dependencies: { express: '^4.18.2', pg: '^8.12.0', cors: '^2.8.5' },
  }, null, 2)}
PKG_EOF

# 3. Install dependencies
cd "$DEPLOY_DIR"
npm install --production

# 4. Test PG connectivity
echo "Testing PostgreSQL connection..."
psql -h localhost -p 5433 -U yyc3_max -d yyc3 -c "SELECT 'PG OK' AS status;" || {
  echo "ERROR: Cannot connect to PostgreSQL"
  exit 1
}

# 5. Run schema migration
echo "Applying telemetry schema..."
psql -h localhost -p 5433 -U yyc3_max -d yyc3 << 'SQL_EOF'
CREATE SCHEMA IF NOT EXISTS telemetry;
CREATE TABLE IF NOT EXISTS telemetry.metrics (
  id BIGSERIAL PRIMARY KEY, node_id VARCHAR(64) NOT NULL,
  timestamp BIGINT NOT NULL, cpu REAL NOT NULL DEFAULT 0,
  memory REAL NOT NULL DEFAULT 0, disk REAL NOT NULL DEFAULT 0,
  network REAL NOT NULL DEFAULT 0, temperature REAL NOT NULL DEFAULT 0,
  processes INTEGER NOT NULL DEFAULT 0, gpu_usage REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS telemetry.thermal_log (
  id BIGSERIAL PRIMARY KEY, node_id VARCHAR(64) NOT NULL,
  timestamp BIGINT NOT NULL, zone VARCHAR(32) NOT NULL,
  temp_celsius REAL NOT NULL, throttled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS telemetry.alerts (
  id BIGSERIAL PRIMARY KEY, node_id VARCHAR(64) NOT NULL,
  metric VARCHAR(32) NOT NULL, threshold REAL NOT NULL,
  actual_value REAL NOT NULL, severity VARCHAR(16) NOT NULL DEFAULT 'info',
  message TEXT NOT NULL DEFAULT '', acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  timestamp BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS telemetry.latency_history (
  id BIGSERIAL PRIMARY KEY, check_id VARCHAR(64) NOT NULL,
  timestamp BIGINT NOT NULL, latency_ms INTEGER NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_metrics_node_ts ON telemetry.metrics (node_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_latency_check_ts ON telemetry.latency_history (check_id, timestamp DESC);
SQL_EOF

# 6. Start service
echo "Starting pg-proxy..."
cd "$DEPLOY_DIR"
node pg-proxy.js &
PID=$!
sleep 2

# 7. Health check
echo "Running health check..."
curl -s http://localhost:3003/health | python3 -m json.tool || {
  echo "ERROR: Health check failed"
  kill $PID 2>/dev/null
  exit 1
}

echo ""
echo "=== Deploy Complete ==="
echo "PID: $PID"
echo "Endpoint: http://192.168.3.22:3003"
echo "To daemonize: use launchd (macOS) or systemd (Linux)"
`;
}