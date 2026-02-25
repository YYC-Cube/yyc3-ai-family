# 🧪 BigModel SDK - AI交互与MCP逻辑链路测试指导

> **YYC³ 标准化测试流程文档**
> 版本: 1.0.0 | 创建日期: 2026-02-26 | 符合YYC³「五高五标五化」标准

---

## 📋 目录

- [概述](#概述)
- [AI交互逻辑链路](#ai交互逻辑链路)
- [MCP协议调用流程](#mcp协议调用流程)
- [环境准备](#环境准备)
- [测试步骤](#测试步骤)
- [故障排查](#故障排查)
- [性能基准](#性能基准)

---

## 概述

本文档提供 BigModel SDK 中 AI 模型交互和 MCP（Model Context Protocol）协议的完整测试流程，确保从用户请求到AI响应的完整链路畅通。

### 核心测试目标

1. **AI交互链路验证** - 验证从客户端到AI模型的完整调用链
2. **MCP协议兼容性** - 测试MCP服务器的工具调用能力
3. **多模态功能测试** - 验证文本、图像、语音等多模态交互
4. **错误处理机制** - 测试异常场景下的容错能力

---

## AI交互逻辑链路

### 1. 基础对话流程

```
用户请求 → SDK客户端 → API网关 → AI模型推理 → 响应返回
    ↓           ↓          ↓           ↓            ↓
  验证参数   构建请求   认证授权   模型处理    解析响应
```

#### 测试代码示例

```typescript
import { OpenAICompatibleClient } from '@yyc3/bigmodel-sdk';

// 步骤1: 初始化客户端
const client = new OpenAICompatibleClient({
  apiKey: process.env.BIGMODEL_API_KEY!,
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
  model: 'glm-4',
  timeout: 30000,
});

// 步骤2: 测试基础对话
async function testBasicChat() {
  try {
    const response = await client.chatCompletion({
      model: 'glm-4',
      messages: [
        { role: 'system', content: '你是YYC³智能助手' },
        { role: 'user', content: '你好，请介绍一下你自己' }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('✅ AI响应成功:', response.choices[0].message.content);
    console.log('📊 Token使用量:', response.usage);
    return true;
  } catch (error) {
    console.error('❌ AI响应失败:', error);
    return false;
  }
}
```

### 2. 流式对话测试

```typescript
async function testStreamChat() {
  console.log('🌊 开始流式对话测试...');
  
  const stream = client.chatCompletionStream({
    model: 'glm-4',
    messages: [
      { role: 'user', content: '请用200字介绍YYC³项目' }
    ],
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    fullResponse += chunk;
    process.stdout.write(chunk);
  }
  
  console.log('\n✅ 流式对话完成，总长度:', fullResponse.length);
  return fullResponse.length > 0;
}
```

### 3. 配置管理测试

```typescript
async function testConfigManagement() {
  console.log('⚙️  测试配置管理功能...');
  
  // 获取当前配置
  const config = client.getConfig();
  console.log('当前配置:', config);
  
  // 动态修改配置
  client.setApiKey('new-api-key');
  client.setBaseUrl('https://new-endpoint.com/api/');
  client.setTimeout(60000);
  client.setModel('glm-4-plus');
  
  const newConfig = client.getConfig();
  console.log('更新后配置:', newConfig);
  
  // 验证配置更新
  const success = 
    newConfig.apiKey === 'new-api-key' &&
    newConfig.baseUrl === 'https://new-endpoint.com/api/' &&
    newConfig.timeout === 60000 &&
    newConfig.model === 'glm-4-plus';
  
  console.log(success ? '✅ 配置管理测试通过' : '❌ 配置管理测试失败');
  return success;
}
```

---

## MCP协议调用流程

### 1. MCP架构图

```
┌─────────────────┐
│   MCPManager    │ ← 统一管理多个MCP服务器
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬──────────┐
    │         │          │          │          │
┌───▼───┐ ┌──▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│ YYC3  │ │File  │  │PostgreSQL│ │Brave  │  │Docker │
│  CN   │ │System│  │  Server  │ │Search │  │Server │
│Server │ │Server│  │          │ │Server │  │       │
└───┬───┘ └──┬───┘  └────┬────┘ └───┬───┘  └───┬───┘
    │        │           │          │          │
    └────────┴───────────┴──────────┴──────────┘
                      │
              ┌───────▼────────┐
              │  工具调用响应   │
              └────────────────┘
```

### 2. YYC³ CN服务器测试

```typescript
import { MCPClient, MCPTool } from '@yyc3/bigmodel-sdk';

async function testYYC3CNServer() {
  console.log('🚀 测试YYC³ CN MCP服务器...');
  
  const yyc3cn = new MCPClient({
    command: 'node',
    args: ['./node_modules/@yyc3/mcp-server/dist/index.js'],
    env: {
      NODE_ENV: 'development',
      YYC3_CN_VERSION: 'latest',
    },
  });

  try {
    // 连接服务器
    await yyc3cn.connect();
    console.log('✅ YYC³ CN服务器连接成功');

    // 列出所有工具
    const tools: MCPTool[] = await yyc3cn.listTools();
    console.log(`📋 可用工具数量: ${tools.length}`);
    
    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}: ${tool.description}`);
    });

    // 测试UI分析工具
    const uiResult = await yyc3cn.callTool('yyc3_ui_analysis', {
      imagePath: './test-screenshot.png',
      analysisType: 'ux_design',
      appVersion: 'latest',
    });
    console.log('🎨 UI分析结果:', uiResult);

    // 测试代码审查工具
    const codeResult = await yyc3cn.callTool('yyc3_code_review', {
      codePath: './src/example.ts',
      language: 'typescript',
      focus: 'ai_integration',
    });
    console.log('🔍 代码审查结果:', codeResult);

    return true;
  } catch (error) {
    console.error('❌ YYC³ CN服务器测试失败:', error);
    return false;
  } finally {
    await yyc3cn.disconnect();
    console.log('👋 已断开YYC³ CN服务器连接');
  }
}
```

### 3. 多服务器协同测试

```typescript
import { MCPManager } from '@yyc3/bigmodel-sdk';

async function testMultiServerCollaboration() {
  console.log('🌐 测试多服务器协同...');
  
  const manager = new MCPManager({
    servers: {
      yyc3cn: {
        command: 'node',
        args: ['./mcp-servers/yyc3cn.js'],
      },
      filesystem: {
        command: 'node',
        args: ['./mcp-servers/filesystem.js'],
      },
      postgresql: {
        command: 'node',
        args: ['./mcp-servers/postgresql.js'],
        env: {
          DATABASE_URL: process.env.DATABASE_URL,
        },
      },
    },
  });

  try {
    // 连接所有服务器
    await manager.connectAll();
    console.log('✅ 所有MCP服务器已连接');

    // 获取YYC³ CN服务器
    const yyc3cn = manager.getServer('yyc3cn');
    const filesystem = manager.getServer('filesystem');
    const postgresql = manager.getServer('postgresql');

    // 测试跨服务器工作流
    // 1. 读取代码文件
    const codeContent = await filesystem.callTool('read_file', {
      path: './src/index.ts',
    });

    // 2. 使用YYC³ CN进行代码审查
    const reviewResult = await yyc3cn.callTool('yyc3_code_review', {
      codePath: './src/index.ts',
      codeContent: codeContent.content,
      focus: 'performance',
    });

    // 3. 将结果存储到数据库
    await postgresql.callTool('execute_query', {
      sql: 'INSERT INTO code_reviews (file_path, result, created_at) VALUES ($1, $2, NOW())',
      params: ['./src/index.ts', JSON.stringify(reviewResult)],
    });

    console.log('✅ 多服务器协同工作流测试通过');
    return true;
  } catch (error) {
    console.error('❌ 多服务器协同测试失败:', error);
    return false;
  } finally {
    await manager.disconnectAll();
  }
}
```

---

## 环境准备

### 1. 环境变量配置

创建 `.env.test` 文件：

```bash
# BigModel API配置
BIGMODEL_API_KEY=your_api_key_here
BIGMODEL_BASE_URL=https://open.bigmodel.cn/api/paas/v4/

# MCP服务器配置
YYC3_CN_SERVER_PATH=./mcp-servers/yyc3cn.js
FILE_SYSTEM_ROOT=/path/to/test/directory

# 数据库配置（可选）
DATABASE_URL=postgresql://user:password@localhost:5432/testdb

# 搜索服务配置（可选）
BRAVE_API_KEY=your_brave_api_key

# 测试配置
TEST_TIMEOUT=30000
LOG_LEVEL=debug
```

### 2. 依赖安装

```bash
# 安装SDK依赖
cd packages/bigmodel-sdk
pnpm install

# 构建SDK
pnpm run build

# 运行测试
pnpm run test
```

---

## 测试步骤

### 阶段1: 基础功能测试 (30分钟)

```bash
# 1. 编译TypeScript代码
pnpm run build

# 2. 运行基础示例
node dist/examples/usage-example.js

# 3. 测试OpenAI兼容客户端
node dist/examples/openai-compatible-example.js

# 4. 测试YYC³ CN服务器
node dist/examples/yyc3cn-usage-example.js
```

### 阶段2: AI交互链路测试 (45分钟)

```typescript
// tests/ai-interaction.test.ts
import { BigModelClient, OpenAICompatibleClient } from '../index';

describe('AI交互链路测试', () => {
  test('基础对话功能', async () => {
    const client = new OpenAICompatibleClient({
      apiKey: process.env.BIGMODEL_API_KEY!,
    });

    const response = await client.chatCompletion({
      model: 'glm-4',
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(response.choices).toBeDefined();
    expect(response.choices[0].message.content).toBeTruthy();
  });

  test('流式对话功能', async () => {
    const client = new OpenAICompatibleClient({
      apiKey: process.env.BIGMODEL_API_KEY!,
    });

    const chunks: string[] = [];
    for await (const chunk of client.chatCompletionStream({
      model: 'glm-4',
      messages: [{ role: 'user', content: '测试流式输出' }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  });

  test('配置管理功能', async () => {
    const client = new OpenAICompatibleClient({
      apiKey: 'test-key',
    });

    client.setModel('glm-4-plus');
    const config = client.getConfig();
    
    expect(config.model).toBe('glm-4-plus');
  });
});
```

### 阶段3: MCP协议测试 (60分钟)

```typescript
// tests/mcp-protocol.test.ts
import { MCPManager, MCPClient } from '../index';

describe('MCP协议测试', () => {
  test('MCP客户端连接', async () => {
    const client = new MCPClient({
      command: 'node',
      args: ['./test-mock-server.js'],
    });

    await client.connect();
    const tools = await client.listTools();
    
    expect(tools.length).toBeGreaterThan(0);
    await client.disconnect();
  });

  test('YYC³ CN工具调用', async () => {
    const yyc3cn = new MCPClient({
      command: 'node',
      args: [process.env.YYC3_CN_SERVER_PATH!],
    });

    await yyc3cn.connect();
    
    const result = await yyc3cn.callTool('yyc3_ai_prompt_optimizer', {
      promptText: '测试提示词',
      optimizationGoal: 'chinese_understanding',
    });

    expect(result).toBeDefined();
    await yyc3cn.disconnect();
  });

  test('多服务器管理', async () => {
    const manager = new MCPManager({
      servers: {
        test1: { command: 'node', args: ['./mock-server1.js'] },
        test2: { command: 'node', args: ['./mock-server2.js'] },
      },
    });

    await manager.connectAll();
    const server1 = manager.getServer('test1');
    const server2 = manager.getServer('test2');
    
    expect(server1).toBeDefined();
    expect(server2).toBeDefined();
    
    await manager.disconnectAll();
  });
});
```

---

## 故障排查

### 常见问题与解决方案

#### 1. API连接失败

**症状**: `API request failed: 401 Unauthorized`

**排查步骤**:
```bash
# 检查API密钥是否正确
echo $BIGMODEL_API_KEY

# 验证API密钥格式
curl -H "Authorization: Bearer $BIGMODEL_API_KEY" \
     https://open.bigmodel.cn/api/paas/v4/models
```

**解决方案**:
- 确认API密钥有效且未过期
- 检查baseUrl配置是否正确
- 验证网络连接和防火墙设置

#### 2. MCP服务器连接超时

**症状**: `MCP server connection timeout`

**排查步骤**:
```bash
# 检查服务器文件是否存在
ls -la ./mcp-servers/yyc3cn.js

# 手动启动服务器测试
node ./mcp-servers/yyc3cn.js
```

**解决方案**:
- 确认服务器路径正确
- 检查Node.js版本兼容性
- 查看服务器日志输出

#### 3. 流式响应中断

**症状**: 流式对话中途停止

**排查代码**:
```typescript
async function debugStreamChat() {
  const client = new OpenAICompatibleClient({
    apiKey: process.env.BIGMODEL_API_KEY!,
    timeout: 60000, // 增加超时时间
  });

  try {
    const stream = client.chatCompletionStream({
      model: 'glm-4',
      messages: [{ role: 'user', content: '长文本生成测试' }],
    });

    let chunkCount = 0;
    for await (const chunk of stream) {
      chunkCount++;
      console.log(`Chunk ${chunkCount}:`, chunk.length, 'bytes');
    }
  } catch (error) {
    console.error('流式错误:', error);
  }
}
```

#### 4. 类型定义错误

**症状**: TypeScript编译错误

**解决方案**:
```bash
# 清理构建缓存
rm -rf dist/ node_modules/

# 重新安装依赖
pnpm install

# 重新构建
pnpm run build
```

---

## 性能基准

### 预期性能指标

| 测试项 | 响应时间 | 成功率 | 备注 |
|--------|---------|--------|------|
| 基础对话 | < 2s | > 99% | 非流式响应 |
| 流式首字 | < 500ms | > 98% | 首个chunk |
| MCP工具调用 | < 3s | > 95% | 单工具调用 |
| 多服务器协同 | < 5s | > 90% | 3个服务器 |

### 性能测试脚本

```typescript
async function performanceBenchmark() {
  const client = new OpenAICompatibleClient({
    apiKey: process.env.BIGMODEL_API_KEY!,
  });

  const iterations = 10;
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    
    await client.chatCompletion({
      model: 'glm-4',
      messages: [{ role: 'user', content: '性能测试' }],
      max_tokens: 100,
    });

    results.push(Date.now() - start);
  }

  const avgTime = results.reduce((a, b) => a + b) / iterations;
  const minTime = Math.min(...results);
  const maxTime = Math.max(...results);

  console.log(`📊 性能基准测试结果:`);
  console.log(`   平均响应时间: ${avgTime.toFixed(0)}ms`);
  console.log(`   最快响应: ${minTime}ms`);
  console.log(`   最慢响应: ${maxTime}ms`);
}
```

---

## 总结

通过本文档的测试流程，您可以：

1. ✅ 验证AI交互链路的完整性和稳定性
2. ✅ 测试MCP协议的多服务器协同能力
3. ✅ 识别和解决常见的技术问题
4. ✅ 建立性能基准和监控指标

### 下一步行动

- [ ] 执行完整的测试套件
- [ ] 记录测试结果和性能数据
- [ ] 根据测试结果优化配置
- [ ] 建立持续集成测试流程

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
