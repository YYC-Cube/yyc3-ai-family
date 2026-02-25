# Examples 使用指南

> BigModel-Z.ai SDK 示例代码详细说明、技巧指南和错误解决

## 📚 目录

- [快速开始](#快速开始)
- [基础示例](#基础示例)
- [MCP 使用示例](#mcp-使用示例)
- [YYC3-CN 使用示例](#yyc3-cn-使用示例)
- [OpenAI 兼容示例](#openai-兼容示例)
- [常见问题](#常见问题)

---

## 快速开始

### 前置要求

1. **Node.js**: >= 16.0.0
2. **TypeScript**: >= 4.5.0
3. **API Key**: 从 BigModel-Z.ai 获取有效的 API Key

### 安装依赖

```bash
# 安装 SDK
npm install @bigmodel-z/sdk

# 或使用 pnpm
pnpm install @bigmodel-z/sdk

# 或使用 yarn
yarn add @bigmodel-z/sdk
```

### 配置环境变量

创建 `.env` 文件：

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置
nano .env
```

### 运行示例

```bash
# 编译 TypeScript
npx tsc

# 运行基础示例
node examples/usage-example.js

# 运行 MCP 示例
node examples/mcp-usage-example.js

# 运行 YYC3-CN 示例
node examples/yyc3cn-usage-example.js

# 运行 OpenAI 兼容示例
node examples/openai-compatible-example.js
```

---

## 基础示例

### 📖 使用说明

[usage-example.ts](./usage-example.ts) 展示了 SDK 的基础功能使用。

#### 主要功能

1. **助手对话** - 与 AI 助手进行对话
2. **流式对话** - 实时流式响应
3. **助手管理** - 列出和管理助手
4. **对话管理** - 创建和管理对话
5. **文件操作** - 上传和解析文件
6. **知识库操作** - 创建和管理知识库
7. **多模态功能** - 图像生成、语音合成等

#### 运行示例

```bash
# 编译
npx tsc examples/usage-example.ts

# 运行
node examples/usage-example.js
```

### 💡 技巧指南

#### 1. 环境变量管理

使用 `dotenv` 加载环境变量：

```typescript
import dotenv from 'dotenv'

dotenv.config()

const client = new BigModelClient({
  apiKey: process.env.BIGMODEL_API_KEY,
  baseUrl: process.env.BIGMODEL_BASE_URL,
})
```

#### 2. 日志记录

添加详细的日志记录：

```typescript
const logger = {
  info: (msg: string) => console.log(`[INFO] ${new Date().toISOString()} ${msg}`),
  error: (msg: string, error: any) => 
    console.error(`[ERROR] ${new Date().toISOString()} ${msg}`, error),
}

logger.info('开始对话...')
const response = await client.chat(assistantId, messages)
logger.info('对话完成')
```

#### 3. 错误处理

实现完善的错误处理：

```typescript
async function safeChat(assistantId: string, messages: any[]) {
  try {
    const response = await client.chat(assistantId, messages)
    return { success: true, data: response }
  } catch (error) {
    logger.error('对话失败', error)
    return { success: false, error }
  }
}
```

### ❌ 常见错误及解决

#### 错误 1: Cannot find module '@bigmodel-z/sdk'

**原因：** SDK 未安装

**解决方法：**
```bash
npm install @bigmodel-z/sdk
```

#### 错误 2: BIGMODEL_API_KEY is not defined

**原因：** 环境变量未设置

**解决方法：**
```bash
# 创建 .env 文件
echo "BIGMODEL_API_KEY=your-api-key" > .env

# 或在命令行中设置
export BIGMODEL_API_KEY=your-api-key
```

#### 错误 3: API request failed: 401 Unauthorized

**原因：** API Key 无效

**解决方法：**
1. 检查 API Key 是否正确
2. 确认 API Key 未过期
3. 重新生成 API Key

---

## MCP 使用示例

### 📖 使用说明

[mcp-usage-example.ts](./mcp-usage-example.ts) 展示了如何使用 MCP（Model Context Protocol）服务器。

#### 主要功能

1. **文件系统操作** - 读写文件、列出目录
2. **PostgreSQL 操作** - 数据库查询、表管理
3. **Brave 搜索** - 网络搜索
4. **Docker 操作** - 容器管理
5. **GitHub 操作** - 仓库管理
6. **YYC3-CN 操作** - AI 辅助开发

#### 运行示例

```bash
# 编译
npx tsc examples/mcp-usage-example.ts

# 运行
node examples/mcp-usage-example.js
```

### 💡 技巧指南

#### 1. MCP 服务器配置

使用配置文件管理 MCP 服务器：

```typescript
import mcpConfig from './mcp-config.json'

const mcpManager = new MCPManager(mcpConfig)
```

#### 2. 连接池管理

实现连接池以提高性能：

```typescript
class MCPConnectionPool {
  private connections: Map<string, MCPClient> = new Map()
  private maxConnections = 5

  async getConnection(name: string): Promise<MCPClient> {
    if (this.connections.has(name)) {
      return this.connections.get(name)!
    }
    if (this.connections.size >= this.maxConnections) {
      throw new Error('连接池已满')
    }
    const connection = await this.createConnection(name)
    this.connections.set(name, connection)
    return connection
  }
}
```

#### 3. 批量操作

使用批量操作提高效率：

```typescript
async function batchReadFiles(
  fileSystem: MCPFileSystemServer,
  paths: string[],
): Promise<Map<string, string>> {
  const results = new Map<string, string>()
  const promises = paths.map(async (path) => {
    try {
      const content = await fileSystem.readFile(path)
      results.set(path, content)
    } catch (error) {
      console.error(`读取文件失败: ${path}`, error)
    }
  })
  await Promise.all(promises)
  return results
}
```

### ❌ 常见错误及解决

#### 错误 1: MCP server not found

**原因：** MCP 服务器未安装

**解决方法：**
```bash
# 安装文件系统服务器
npm install @modelcontextprotocol/server-filesystem

# 安装 PostgreSQL 服务器
npm install @modelcontextprotocol/server-postgres

# 安装 Brave 搜索服务器
npm install @modelcontextprotocol/server-brave-search
```

#### 错误 2: Connection refused

**原因：** MCP 服务器未启动

**解决方法：**
```typescript
// 检查服务器状态
const serverInfo = await mcpManager.getServerInfo('filesystem')
console.log('服务器状态:', serverInfo)

// 重启服务器
await mcpManager.disconnectAll()
await mcpManager.connectAll()
```

#### 错误 3: Permission denied

**原因：** 文件系统权限不足

**解决方法：**
```typescript
// 使用有权限的目录
const fileSystem = new MCPFileSystemServer('/path/to/allowed/directory')

// 或检查目录权限
const stats = await fs.stat('/path/to/directory')
console.log('目录权限:', stats.mode)
```

---

## YYC3-CN 使用示例

### 📖 使用说明

[yyc3cn-usage-example.ts](./yyc3cn-usage-example.ts) 展示了如何使用 YYC3-CN 增强版 MCP 服务器。

#### 主要功能（20 个工具）

1. **UI 分析** - 应用界面分析
2. **代码审查** - 代码质量审查
3. **AI 提示词优化** - 提示词优化
4. **功能生成器** - 新功能设计
5. **本地化检查** - 中文本地化质量检查
6. **API 生成器** - RESTful API 自动生成
7. **数据库设计器** - 数据库结构设计
8. **UI 组件构建器** - 前端组件自动生成
9. **测试用例生成器** - 自动化测试代码生成
10. **增强代码审查** - 全面的代码质量审查
11. **协作工作空间** - 团队编程协作环境管理
12. **性能分析器** - 代码性能分析
13. **文档构建器** - 技术文档自动生成
14. **代码重构** - 代码重构建议
15. **代码审查会话** - 代码审查会话管理
16. **团队编程项目** - 团队编程项目管理
17. **结对编程** - 结对编程辅助
18. **代码冲突解决** - 代码冲突解决

#### 运行示例

```bash
# 编译
npx tsc examples/yyc3cn-usage-example.ts

# 运行
node examples/yyc3cn-usage-example.js
```

### 💡 技巧指南

#### 1. 工具选择

根据任务类型选择合适的工具：

```typescript
function selectTool(task: string): string {
  const tools = {
    ui: 'uiAnalysis',
    code: 'codeReview',
    prompt: 'aiPromptOptimizer',
    feature: 'featureGenerator',
    localization: 'localizationChecker',
    api: 'apiGenerator',
    database: 'databaseDesigner',
    component: 'componentBuilder',
    test: 'testGenerator',
    review: 'enhancedCodeReview',
    collaboration: 'collaborationWorkspace',
    performance: 'performanceAnalyzer',
    docs: 'documentationBuilder',
    refactor: 'codeRefactor',
    session: 'codeReviewSession',
    project: 'teamCoding',
    pair: 'pairProgramming',
    conflict: 'conflictResolver',
  }
  return tools[task] || tools.code
}
```

#### 2. 结果缓存

缓存常用工具的结果：

```typescript
const toolCache = new Map<string, any>()

async function cachedToolCall(
  yyc3cn: YYC3CNServer,
  toolName: string,
  params: any,
): Promise<any> {
  const cacheKey = `${toolName}:${JSON.stringify(params)}`
  
  if (toolCache.has(cacheKey)) {
    return toolCache.get(cacheKey)
  }
  
  const result = await yyc3cn[toolName](params)
  toolCache.set(cacheKey, result)
  
  return result
}
```

#### 3. 批量处理

批量处理多个文件：

```typescript
async function batchCodeReview(
  yyc3cn: YYC3CNServer,
  files: string[],
): Promise<Map<string, any>> {
  const results = new Map<string, any>()
  
  for (const file of files) {
    try {
      const result = await yyc3cn.codeReview({
        codePath: file,
        language: 'typescript',
        focus: 'ai_integration',
      })
      results.set(file, result)
    } catch (error) {
      console.error(`代码审查失败: ${file}`, error)
    }
  }
  
  return results
}
```

### ❌ 常见错误及解决

#### 错误 1: YYC3-CN server not found

**原因：** YYC3-CN 服务器路径错误

**解决方法：**
```typescript
// 检查服务器路径
const fs = require('fs')
const path = '/path/to/yyc3-cn-mcp-server.js'

if (!fs.existsSync(path)) {
  throw new Error(`YYC3-CN 服务器文件不存在: ${path}`)
}

const yyc3cn = new YYC3CNServer({
  serverPath: path,
  mode: 'development',
  version: 'latest',
})
```

#### 错误 2: Tool not found

**原因：** 工具名称错误

**解决方法：**
```typescript
// 列出所有可用工具
const tools = await yyc3cn.listAllTools()
console.log('可用工具:', tools.map(t => t.name))

// 使用正确的工具名称
const result = await yyc3cn.uiAnalysis({
  imagePath: '/path/to/screenshot.png',
  analysisType: 'ux_design',
})
```

#### 错误 3: Invalid parameter

**原因：** 参数格式错误

**解决方法：**
```typescript
// 检查参数格式
function validateParams(params: any, schema: any): boolean {
  for (const key in schema) {
    if (!(key in params)) {
      throw new Error(`缺少必需参数: ${key}`)
    }
    if (typeof params[key] !== schema[key]) {
      throw new Error(`参数类型错误: ${key} 应为 ${schema[key]}`)
    }
  }
  return true
}

// 使用参数验证
validateParams(params, {
  imagePath: 'string',
  analysisType: 'string',
  appVersion: 'string',
})

const result = await yyc3cn.uiAnalysis(params)
```

---

## OpenAI 兼容示例

### 📖 使用说明

[openai-compatible-example.ts](./openai-compatible-example.ts) 展示了如何使用 OpenAI 兼容的 API。

#### 主要功能

1. **基础对话** - OpenAI 格式的对话补全
2. **流式对话** - 实时流式响应
3. **配置管理** - 动态配置管理
4. **模型选择** - 支持多种模型

#### 运行示例

```bash
# 编译
npx tsc examples/openai-compatible-example.ts

# 运行
node examples/openai-compatible-example.js
```

### 💡 技巧指南

#### 1. 模型选择

根据任务类型选择合适的模型：

```typescript
const models = {
  creative: 'glm-4',
  fast: 'glm-4-flash',
  enhanced: 'glm-4-plus',
  efficient: 'glm-3-turbo',
}

function selectModel(task: string): string {
  if (task.includes('快速')) return models.fast
  if (task.includes('复杂')) return models.enhanced
  if (task.includes('经济')) return models.efficient
  return models.creative
}
```

#### 2. 参数调优

根据任务需求调整参数：

```typescript
const presets = {
  creative: { temperature: 0.9, top_p: 0.9, max_tokens: 2000 },
  balanced: { temperature: 0.7, top_p: 0.7, max_tokens: 1000 },
  precise: { temperature: 0.3, top_p: 0.3, max_tokens: 500 },
}

const response = await client.chatCompletion({
  model: 'glm-4',
  messages,
  ...presets.balanced,
})
```

#### 3. 流式处理优化

使用缓冲区提高流式处理效率：

```typescript
async function processStreamWithBuffer(
  stream: AsyncGenerator<ChatCompletionChunk>,
  bufferSize = 1000,
): Promise<string> {
  const buffer: string[] = []
  let currentSize = 0
  const fullResponse: string[] = []

  for await (const chunk of stream) {
    const content = chunk.choices[0].delta.content
    if (content) {
      buffer.push(content)
      currentSize += content.length

      if (currentSize >= bufferSize) {
        const text = buffer.join('')
        process.stdout.write(text)
        fullResponse.push(text)
        buffer.length = 0
        currentSize = 0
      }
    }
  }

  if (buffer.length > 0) {
    const text = buffer.join('')
    process.stdout.write(text)
    fullResponse.push(text)
  }

  return fullResponse.join('')
}
```

### ❌ 常见错误及解决

#### 错误 1: Invalid API key

**原因：** API Key 无效

**解决方法：**
```typescript
// 验证 API Key
function validateApiKey(apiKey: string): boolean {
  return apiKey.length > 0 && apiKey.startsWith('sk-')
}

const apiKey = process.env.OPENAI_API_KEY
if (!validateApiKey(apiKey)) {
  throw new Error('无效的 API Key')
}

const client = new OpenAICompatibleClient({ apiKey })
```

#### 错误 2: Model not found

**原因：** 模型名称错误

**解决方法：**
```typescript
// 列出可用模型
const availableModels = [
  'glm-4',
  'glm-4-plus',
  'glm-4-flash',
  'glm-3-turbo',
]

function validateModel(model: string): boolean {
  return availableModels.includes(model)
}

const model = 'glm-4'
if (!validateModel(model)) {
  throw new Error(`不支持的模型: ${model}`)
}

const response = await client.chatCompletion({ model, messages })
```

#### 错误 3: Stream processing failed

**原因：** 流式处理失败

**解决方法：**
```typescript
// 添加错误处理
async function safeStreamProcess(
  stream: AsyncGenerator<ChatCompletionChunk>,
): Promise<string> {
  const chunks: string[] = []
  
  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0].delta.content
      if (content) {
        chunks.push(content)
        process.stdout.write(content)
      }
    }
  } catch (error) {
    console.error('流式处理失败:', error)
    throw error
  }
  
  return chunks.join('')
}
```

---

## 常见问题

### Q1: 如何获取 API Key？

**A:** 访问 [BigModel-Z.ai](https://open.bigmodel.cn/) 注册账号，在控制台中创建 API Key。

### Q2: 如何处理大文件？

**A:** 使用分块上传或压缩文件：

```typescript
async function uploadLargeFile(
  client: BigModelClient,
  filePath: string,
  chunkSize = 5 * 1024 * 1024, // 5MB
): Promise<void> {
  const stats = await fs.stat(filePath)
  const chunks = Math.ceil(stats.size / chunkSize)

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, stats.size)
    const chunk = fs.createReadStream(filePath, { start, end })
    
    await client.uploadFile(chunk)
    console.log(`上传进度: ${i + 1}/${chunks}`)
  }
}
```

### Q3: 如何实现重试机制？

**A:** 实现指数退避重试：

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('重试失败')
}
```

### Q4: 如何监控 API 使用量？

**A:** 记录每次请求的使用量：

```typescript
class UsageMonitor {
  private totalTokens = 0
  private requestCount = 0

  track(response: any) {
    this.totalTokens += response.usage?.total_tokens || 0
    this.requestCount++
  }

  getStats() {
    return {
      totalTokens: this.totalTokens,
      requestCount: this.requestCount,
      avgTokens: this.totalTokens / this.requestCount,
    }
  }
}

const monitor = new UsageMonitor()
const response = await client.chat(assistantId, messages)
monitor.track(response)
console.log('使用量统计:', monitor.getStats())
```

### Q5: 如何优化性能？

**A:** 使用以下优化策略：

1. **缓存** - 缓存常用响应
2. **批量操作** - 批量处理请求
3. **连接池** - 复用连接
4. **异步处理** - 使用异步操作
5. **压缩** - 压缩大文件

```typescript
// 缓存示例
const cache = new Map<string, any>()

async function cachedChat(
  key: string,
  fn: () => Promise<any>,
): Promise<any> {
  if (cache.has(key)) {
    return cache.get(key)
  }
  const result = await fn()
  cache.set(key, result)
  return result
}
```

---

## 🔗 相关文档

- [BigModel-Z.ai SDK README](../README.md)
- [Core 模块文档](../core/README.md)
- [MCP 集成文档](../mcp/README.md)
- [Hooks 使用指南](../hooks/README.md)
