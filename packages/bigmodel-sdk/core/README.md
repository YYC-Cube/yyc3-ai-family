# Core 模块使用指南

> BigModel-Z.ai SDK 核心模块详细使用说明、技巧指南和错误解决

## 📚 目录

- [BigModelClient](#bigmodelclient)
- [OpenAICompatibleClient](#openaicompatibleclient)
- [AssistantManager](#assistantmanager)
- [FileManager](#filemanager)
- [KnowledgeBaseManager](#knowledgebasemanager)
- [MultiModalManager](#multimodalmanager)

---

## BigModelClient

### 📖 使用说明

BigModelClient 是 BigModel-Z.ai 的核心客户端，提供基础的 API 调用功能。

#### 基础配置

```typescript
import { BigModelClient } from '@bigmodel-z/sdk'

const client = new BigModelClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://open.bigmodel.cn/api/',
  timeout: 30000,
})
```

#### 助手对话

```typescript
const response = await client.chat(
  '65940acff94777010aa6b796',
  [
    { role: 'user', content: '你好，我是清言，超开心遇见你！😺' },
  ],
)

console.log(response.choices[0].message.content)
```

#### 流式对话

```typescript
const stream = await client.chatStream(
  '65940acff94777010aa6b796',
  [
    { role: 'user', content: '介绍一下你自己' },
  ],
)

for await (const chunk of stream) {
  process.stdout.write(chunk)
}
```

### 💡 技巧指南

#### 1. 超时设置

根据网络环境和请求复杂度调整超时时间：

```typescript
const client = new BigModelClient({
  apiKey: 'your-api-key',
  timeout: 60000, // 网络较慢时增加超时时间
})
```

#### 2. 错误重试

实现指数退避重试机制：

```typescript
async function chatWithRetry(
  client: BigModelClient,
  assistantId: string,
  messages: any[],
  maxRetries = 3,
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.chat(assistantId, messages)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      const delay = Math.pow(2, i) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

#### 3. 消息缓存

缓存常用对话上下文以提高响应速度：

```typescript
const messageCache = new Map<string, any[]>()

async function getCachedResponse(key: string) {
  if (messageCache.has(key)) {
    return messageCache.get(key)
  }
  const response = await client.chat(assistantId, messages)
  messageCache.set(key, messages)
  return response
}
```

### ❌ 常见错误及解决

#### 错误 1: API request failed: 401 Unauthorized

**原因：** API Key 无效或已过期

**解决方法：**
1. 检查 API Key 是否正确
2. 确认 API Key 未过期
3. 重新生成 API Key

```typescript
try {
  const response = await client.chat(assistantId, messages)
} catch (error) {
  if (error.message.includes('401')) {
    console.error('API Key 无效，请检查并更新')
  }
}
```

#### 错误 2: API request failed: 429 Too Many Requests

**原因：** 请求频率超限

**解决方法：**
1. 实现请求限流
2. 增加请求间隔
3. 使用多个 API Key 轮询

```typescript
class RateLimiter {
  private lastRequestTime = 0
  private minInterval = 1000 // 1 秒

  async wait() {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime
    if (elapsed < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - elapsed)
      )
    }
    this.lastRequestTime = Date.now()
  }
}

const limiter = new RateLimiter()
await limiter.wait()
const response = await client.chat(assistantId, messages)
```

#### 错误 3: API request failed: timeout

**原因：** 请求超时

**解决方法：**
1. 增加超时时间
2. 检查网络连接
3. 优化请求内容

```typescript
const client = new BigModelClient({
  apiKey: 'your-api-key',
  timeout: 60000, // 增加到 60 秒
})
```

---

## OpenAICompatibleClient

### 📖 使用说明

OpenAICompatibleClient 提供 OpenAI API 兼容的接口，支持无缝迁移。

#### 基础配置

```typescript
import { OpenAICompatibleClient } from '@bigmodel-z/sdk'

const client = new OpenAICompatibleClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
  model: 'glm-4',
})
```

#### 对话补全

```typescript
const response = await client.chatCompletion({
  model: 'glm-4',
  messages: [
    { role: 'system', content: '你是一个有用的助手。' },
    { role: 'user', content: '你好！' },
  ],
  temperature: 0.7,
  max_tokens: 1000,
})
```

#### 流式对话

```typescript
for await (const chunk of client.chatCompletionStream({
  model: 'glm-4',
  messages: [{ role: 'user', content: '请介绍一下你自己' }],
})) {
  const content = chunk.choices[0].delta.content
  if (content) {
    process.stdout.write(content)
  }
}
```

### 💡 技巧指南

#### 1. 模型选择

根据任务类型选择合适的模型：

```typescript
const models = {
  'glm-4': '通用对话',
  'glm-4-plus': '增强对话',
  'glm-4-flash': '快速响应',
  'glm-3-turbo': '经济高效',
}

function selectModel(task: string): string {
  if (task.includes('快速')) return 'glm-4-flash'
  if (task.includes('复杂')) return 'glm-4-plus'
  return 'glm-4'
}
```

#### 2. 参数调优

根据任务需求调整参数：

```typescript
const config = {
  creative: { temperature: 0.9, top_p: 0.9 },
  balanced: { temperature: 0.7, top_p: 0.7 },
  precise: { temperature: 0.3, top_p: 0.3 },
}

const response = await client.chatCompletion({
  model: 'glm-4',
  messages,
  ...config.balanced,
})
```

#### 3. 流式处理优化

使用缓冲区提高流式处理效率：

```typescript
async function processStreamWithBuffer(
  stream: AsyncGenerator<ChatCompletionChunk>,
) {
  const buffer: string[] = []
  let bufferSize = 0
  const maxBufferSize = 1000

  for await (const chunk of stream) {
    const content = chunk.choices[0].delta.content
    if (content) {
      buffer.push(content)
      bufferSize += content.length

      if (bufferSize >= maxBufferSize) {
        process.stdout.write(buffer.join(''))
        buffer.length = 0
        bufferSize = 0
      }
    }
  }

  if (buffer.length > 0) {
    process.stdout.write(buffer.join(''))
  }
}
```

### ❌ 常见错误及解决

#### 错误 1: Failed to parse chunk

**原因：** 流式响应解析失败

**解决方法：**
1. 检查响应格式
2. 添加错误处理
3. 使用缓冲区处理

```typescript
for await (const chunk of stream) {
  try {
    const content = chunk.choices[0].delta.content
    if (content) {
      process.stdout.write(content)
    }
  } catch (error) {
    console.error('解析失败，跳过此 chunk:', error)
  }
}
```

#### 错误 2: Response body is not readable

**原因：** 响应体不可读

**解决方法：**
1. 检查响应状态
2. 验证响应头
3. 添加错误恢复

```typescript
const response = await fetch(url, options)

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`)
}

const reader = response.body?.getReader()
if (!reader) {
  throw new Error('响应体不可读，请检查 API 配置')
}
```

---

## AssistantManager

### 📖 使用说明

AssistantManager 提供助手管理功能。

#### 列出助手

```typescript
const assistants = await client.listAssistants()
console.log('可用助手:', assistants)
```

#### 创建对话

```typescript
const conversation = await client.createConversation(
  '65940acff94777010aa6b796',
  '新对话',
)
```

### 💡 技巧指南

#### 1. 助手选择

根据任务类型选择合适的助手：

```typescript
function selectAssistant(task: string): string {
  const assistants = {
    coding: '65940acff94777010aa6b796',
    writing: '65940acff94777010aa6b797',
    analysis: '65940acff94777010aa6b798',
  }
  return assistants[task] || assistants.coding
}
```

### ❌ 常见错误及解决

#### 错误 1: Assistant not found

**原因：** 助手 ID 不存在

**解决方法：**
1. 检查助手 ID
2. 列出可用助手
3. 使用正确的助手 ID

```typescript
const assistants = await client.listAssistants()
const validIds = assistants.map(a => a.id)
if (!validIds.includes(assistantId)) {
  throw new Error(`助手 ID ${assistantId} 不存在`)
}
```

---

## FileManager

### 📖 使用说明

FileManager 提供文件管理功能。

#### 上传文件

```typescript
const file = await client.uploadFile('/path/to/file.txt')
console.log('文件 ID:', file.id)
```

#### 解析文件

```typescript
const parsed = await client.parseFile(fileId)
console.log('解析结果:', parsed)
```

### 💡 技巧指南

#### 1. 文件类型检测

自动检测文件类型：

```typescript
function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const types = {
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'json': 'application/json',
  }
  return types[ext || 'application/octet-stream']
}
```

### ❌ 常见错误及解决

#### 错误 1: File too large

**原因：** 文件超过大小限制

**解决方法：**
1. 检查文件大小
2. 压缩文件
3. 分割大文件

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const stats = await fs.stat(filePath)

if (stats.size > MAX_FILE_SIZE) {
  throw new Error('文件过大，请压缩或分割')
}
```

---

## KnowledgeBaseManager

### 📖 使用说明

KnowledgeBaseManager 提供知识库管理功能。

#### 创建知识库

```typescript
const kb = await client.createKnowledgeBase({
  name: '我的知识库',
  description: '项目相关文档',
})
```

#### 上传文档

```typescript
const doc = await client.uploadDocument(kb.id, '/path/to/doc.pdf')
console.log('文档 ID:', doc.id)
```

### 💡 技巧指南

#### 1. 文档分类

使用标签分类文档：

```typescript
const tags = {
  api: ['文档', '接口', 'API'],
  tutorial: ['教程', '指南', '学习'],
  reference: ['参考', '手册', '文档'],
}

function categorizeDocument(filename: string): string[] {
  const lowerName = filename.toLowerCase()
  for (const [category, keywords] of Object.entries(tags)) {
    if (keywords.some(kw => lowerName.includes(kw))) {
      return tags[category]
    }
  }
  return tags.reference
}
```

### ❌ 常见错误及解决

#### 错误 1: Document parsing failed

**原因：** 文档解析失败

**解决方法：**
1. 检查文件格式
2. 转换文件格式
3. 使用支持的格式

```typescript
const supportedFormats = ['pdf', 'txt', 'md', 'json']
const ext = filename.split('.').pop()?.toLowerCase()

if (!supportedFormats.includes(ext)) {
  throw new Error(`不支持的文件格式: ${ext}`)
}
```

---

## MultiModalManager

### 📖 使用说明

MultiModalManager 提供多模态功能（图像、语音、视频）。

#### 图像生成

```typescript
const image = await client.generateImage({
  model: 'cogview-3-flash',
  prompt: '一只可爱的猫咪',
  size: '1024x1024',
})
```

#### 文本转语音

```typescript
const audio = await client.textToSpeech({
  model: 'glm-4v-flash',
  input: '你好，世界',
  voice: 'alloy',
  speed: 1.0,
})
```

### 💡 技巧指南

#### 1. 提示词优化

优化图像生成提示词：

```typescript
function optimizePrompt(prompt: string): string {
  const modifiers = [
    'high quality',
    'detailed',
    'professional',
  ]
  return `${prompt}, ${modifiers.join(', ')}`
}
```

### ❌ 常见错误及解决

#### 错误 1: Model not available

**原因：** 模型不可用

**解决方法：**
1. 检查模型名称
2. 列出可用模型
3. 使用支持的模型

```typescript
const availableModels = {
  image: ['cogview-3-flash', 'cogview-3'],
  audio: ['glm-4v-flash'],
  video: ['cogvideox-2'],
}

function validateModel(type: string, model: string): boolean {
  return availableModels[type].includes(model)
}
```

---

## 📋 最佳实践

### 1. 错误处理

始终使用 try-catch 处理错误：

```typescript
try {
  const response = await client.chat(assistantId, messages)
} catch (error) {
  console.error('请求失败:', error)
  // 根据错误类型采取不同的恢复策略
}
```

### 2. 资源清理

及时清理资源：

```typescript
const cleanup = () => {
  // 清理缓存
  messageCache.clear()
  // 关闭连接
  // 释放资源
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
```

### 3. 日志记录

记录详细的日志：

```typescript
const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, error: any) => 
    console.error(`[ERROR] ${msg}`, error),
  debug: (msg: string) => 
    console.debug(`[DEBUG] ${msg}`),
}

logger.info('开始请求...')
const response = await client.chat(assistantId, messages)
logger.info('请求完成')
```

### 4. 配置管理

使用配置文件管理配置：

```typescript
import config from './config.json'

const client = new BigModelClient({
  apiKey: config.apiKey,
  baseUrl: config.baseUrl,
  timeout: config.timeout,
})
```

---

## 🔗 相关文档

- [BigModel-Z.ai SDK README](../README.md)
- [MCP 集成文档](../mcp/README.md)
- [示例代码](../examples/README.md)
- [OpenAI 兼容文档](../examples/openai-compatible-example.ts)
