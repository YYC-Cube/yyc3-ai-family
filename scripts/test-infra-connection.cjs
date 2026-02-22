#!/usr/bin/env node

// ============================================================
// YYC3 AI Family — L01 基础设施层连接验证测试
// Phase 52: 真实连接验证诊断
// ============================================================

const fetch = require('node-fetch');

console.log('🔍 YYC3 AI Family — L01 基础设施层连接验证测试\n');
console.log('='.repeat(60));

async function runTests() {
  const results = [];

  // Test 1: NAS SQLite HTTP Proxy (8484)
  console.log('\n📦 Test 1: NAS SQLite HTTP Proxy (192.168.3.45:8484)');
  try {
    const start = Date.now();
    const response = await fetch('http://192.168.3.45:8484/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ db: '/Volume2/yyc3/yyc3.db', sql: 'SELECT sqlite_version() as version', params: [] }),
      timeout: 5000,
    });
    const latency = Date.now() - start;
    if (response.ok) {
      const data = await response.json();
      const version = data.rows?.[0]?.[0] || 'unknown';
      console.log(`   ✅ 连接成功 | 延迟: ${latency}ms | 版本: ${version}`);
      results.push({ name: 'SQLite Proxy', status: 'PASS', latency });
    } else {
      console.log(`   ❌ 连接失败 | 延迟: ${latency}ms | 状态: ${response.status}`);
      results.push({ name: 'SQLite Proxy', status: 'FAIL', latency, error: `HTTP ${response.status}` });
    }
  } catch (err) {
    const latency = Date.now() - Date.now();
    console.log(`   ❌ 连接失败 | 错误: ${err.message}`);
    results.push({ name: 'SQLite Proxy', status: 'FAIL', latency, error: err.message });
  }

  // Test 2: Docker Engine API (2375)
  console.log('\n🐳 Test 2: Docker Engine API (192.168.3.45:2375)');
  try {
    const start = Date.now();
    const response = await fetch('http://192.168.3.45:2375/v1.41/_ping', {
      method: 'GET',
      timeout: 5000,
    });
    const latency = Date.now() - start;
    if (response.ok) {
      console.log(`   ✅ 连接成功 | 延迟: ${latency}ms`);
      results.push({ name: 'Docker API', status: 'PASS', latency });
    } else {
      console.log(`   ❌ 连接失败 | 延迟: ${latency}ms | 状态: ${response.status}`);
      results.push({ name: 'Docker API', status: 'FAIL', latency, error: `HTTP ${response.status}` });
    }
  } catch (err) {
    const latency = Date.now() - Date.now();
    console.log(`   ❌ 连接失败 | 错误: ${err.message}`);
    results.push({ name: 'Docker API', status: 'FAIL', latency, error: err.message });
  }

  // Test 3: Backend API (localhost:3001)
  console.log('\n🌐 Test 3: Backend API (localhost:3001/api/v1/health)');
  try {
    const start = Date.now();
    const response = await fetch('http://localhost:3001/api/v1/health', {
      method: 'GET',
      timeout: 5000,
    });
    const latency = Date.now() - start;
    if (response.ok) {
      console.log(`   ✅ 连接成功 | 延迟: ${latency}ms`);
      results.push({ name: 'Backend API', status: 'PASS', latency });
    } else {
      console.log(`   ❌ 连接失败 | 延迟: ${latency}ms | 状态: ${response.status}`);
      results.push({ name: 'Backend API', status: 'FAIL', latency, error: `HTTP ${response.status}` });
    }
  } catch (err) {
    const latency = Date.now() - Date.now();
    console.log(`   ❌ 连接失败 | 错误: ${err.message}`);
    results.push({ name: 'Backend API', status: 'FAIL', latency, error: err.message });
  }

  // Test 4: WebSocket Heartbeat (9090)
  console.log('\n🔌 Test 4: WebSocket Heartbeat (192.168.3.45:9090)');
  try {
    const WebSocket = require('ws');
    const start = Date.now();
    await new Promise((resolve, reject) => {
      const ws = new WebSocket('ws://192.168.3.45:9090/ws/heartbeat');
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('连接超时'));
      }, 4000);
      ws.on('open', () => {
        clearTimeout(timeout);
        const latency = Date.now() - start;
        ws.close();
        resolve(latency);
      });
      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
    const latency = Date.now() - start;
    console.log(`   ✅ 连接成功 | 延迟: ${latency}ms`);
    results.push({ name: 'WebSocket', status: 'PASS', latency });
  } catch (err) {
    const latency = Date.now() - Date.now();
    console.log(`   ❌ 连接失败 | 错误: ${err.message}`);
    results.push({ name: 'WebSocket', status: 'FAIL', latency, error: err.message });
  }

  // Test 5: Device Reachability
  console.log('\n🖥️  Test 5: 设备连通性检查');
  const devices = [
    { id: 'm4-max', name: 'MacBook Pro M4 Max', ip: '192.168.3.22' },
    { id: 'imac-m4', name: 'iMac M4', ip: '192.168.3.77' },
    { id: 'matebook', name: 'MateBook X Pro', ip: '192.168.3.66' },
    { id: 'yanyucloud', name: '铁威马 F4-423 NAS', ip: '192.168.3.45' },
  ];

  for (const device of devices) {
    console.log(`\n   检测: ${device.name} (${device.ip})`);
    try {
      const start = Date.now();
      const response = await fetch(`http://${device.ip}`, {
        method: 'HEAD',
        timeout: 3000,
      });
      const latency = Date.now() - start;
      console.log(`      ✅ 可达 | 延迟: ${latency}ms`);
      results.push({ name: `Device ${device.id}`, status: 'PASS', latency });
    } catch (err) {
      const latency = Date.now() - Date.now();
      console.log(`      ❌ 不可达 | 错误: ${err.message}`);
      results.push({ name: `Device ${device.id}`, status: 'FAIL', latency, error: err.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试结果汇总:\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`   总计: ${total} | ✅ 通过: ${passed} | ❌ 失败: ${failed}\n`);

  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    const latency = result.latency ? ` | ${result.latency}ms` : '';
    const error = result.error ? ` | ${result.error}` : '';
    console.log(`   ${icon} ${result.name.padEnd(20)} ${latency}${error}`);
  }

  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('\n🎉 所有连接验证通过！L01 基础设施层状态良好。\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分连接验证失败，建议检查相关服务状态。\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('\n💥 测试执行失败:', err);
  process.exit(1);
});
