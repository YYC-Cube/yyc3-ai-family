# BigModel-Z.ai SDK

> 完整的 BigModel-Z.ai API TypeScript/JavaScript SDK

## 📦 安装

```bash
npm install @bigmodel-z/sdk
# 或
yarn add @bigmodel-z/sdk
# 或
pnpm add @bigmodel-z/sdk
```

## 🎯 功能特性

### 核心 API
- ✅ 对话 API - 助手对话、流式对话
- ✅ 文件管理 API - 文件上传、删除、解析
- ✅ 知识库 API - 知识库创建、文档上传、检索
- ✅ 多模态 API - 图像生成、语音合成、视频生成

### MCP 集成
- ✅ 文件系统服务器 - 文件读写、目录列表、文件搜索
- ✅ PostgreSQL 服务器 - 数据库查询、表管理、数据操作
- ✅ Brave 搜索服务器 - 网络搜索、结果获取
- ✅ Docker 服务器 - 容器管理、镜像管理
- ✅ GitHub 服务器 - 仓库管理、Issue 管理、PR 管理
- ✅ YYC3-CN 服务器 - UI 分析、代码审查、AI 提示词优化、智能编程、协同编程（20 个工具）

### React Hooks
- ✅ useBigModel - 基础 SDK Hook
- ✅ useChat - 对话功能 Hook
- ✅ useChatStream - 流式对话 Hook
- ✅ useAssistants - 助手管理 Hook
- ✅ useFiles - 文件管理 Hook
- ✅ useKnowledgeBase - 知识库管理 Hook

## 🚀 快速开始

### 基础使用

```typescript
import { BigModelSDK } from '@bigmodel-z/sdk'

const sdk = BigModelSDK.create({
  apiKey: 'your-api-key',
})

// 助手对话
const response = await sdk.client.chat(
  '65940acff94777010aa6b796',
  [
    { role: 'user', content: '你好，我是清言，超开心遇见你！😺' },
  ],
)

console.log(response.choices[0].message.content)
```

### 流式对话

```typescript
const stream = await sdk.client.chatStream(
  '65940acff94777010aa6b796',
  [
    { role: 'user', content: '介绍一下你自己' },
  ],
)

for await (const chunk of stream) {
  process.stdout.write(chunk)
}
```

### 助手管理

```typescript
// 获取助手列表
const assistants = await sdk.assistants.listAssistants()

// 获取特定助手
const assistant = await sdk.assistants.getAssistant('65940acff94777010aa6b796')

// 获取对话历史
const conversations = await sdk.assistants.listConversations('65940acff94777010aa6b796')

// 获取对话消息
const messages = await sdk.assistants.getConversationHistory('conversation-id')
```

### 文件管理

```typescript
// 上传文件
const file = await sdk.files.uploadFile(fileObject)

// 获取文件列表
const files = await sdk.files.listFiles()

// 获取文件内容
const content = await sdk.files.getFileContent('file-id')

// 解析文件
const result = await sdk.files.parseFile('file-id')

// 网络搜索
const searchResults = await sdk.files.webSearch('搜索关键词')

// 网页阅读
const webpageContent = await sdk.files.webRead('https://example.com')
```

### 知识库管理

```typescript
// 创建知识库
const kb = await sdk.knowledge.createKnowledgeBase(
  '我的知识库',
  '用于存储项目相关文档',
)

// 上传文档到知识库
const doc = await sdk.knowledge.uploadDocument(kb.id, fileObject)

// 从URL上传文档
const doc = await sdk.knowledge.uploadDocumentFromUrl(kb.id, 'https://example.com/doc.pdf')

// 搜索知识库
const results = await sdk.knowledge.search(kb.id, {
  query: '搜索关键词',
  top_k: 5,
})

// 重新向量化
await sdk.knowledge.revectorize(kb.id, doc.id)

// 获取使用量
const usage = await sdk.knowledge.getUsage(kb.id)
```

### 多模态功能

```typescript
// 图像生成
const image = await sdk.multimodal.generateImage({
  model: 'cogview-3-flash',
  prompt: '一只可爱的猫咪',
  size: '1024x1024',
})

// 文本转语音
const audio = await sdk.multimodal.textToSpeech({
  model: 'glm-4v-flash',
  input: '你好，世界',
  voice: 'alloy',
  speed: 1.0,
})

// 语音转文本
const transcription = await sdk.multimodal.speechToText({
  model: 'glm-asr',
  audio: audioFile,
  language: 'zh',
})

// 视频生成
const video = await sdk.multimodal.generateVideo({
  model: 'cogvideox-2',
  prompt: '日落时分的海滩',
  duration: 5,
  aspect_ratio: '16:9',
})

// 获取音色列表
const voices = await sdk.multimodal.listVoices()

// 获取模型列表
const imageModels = await sdk.multimodal.listImageModels()
const videoModels = await sdk.multimodal.listVideoModels()
```

### MCP 集成功能

```typescript
import { MCPManager } from '@bigmodel-z/sdk'

// 初始化 MCP 管理器
const mcpManager = new MCPManager({
  fileSystem: '/path/to/your/directory',
  postgresql: 'postgresql://user:password@host:5432/database',
  braveSearch: 'your-brave-api-key',
  docker: 'unix:///var/run/docker.sock',
  github: 'your-github-pat',
})

// 连接所有服务器
await mcpManager.connectAll()

// 文件系统操作
const fileSystem = mcpManager.getFileSystem()
const content = await fileSystem.readFile('/path/to/file.txt')

// PostgreSQL 数据库操作
const postgres = mcpManager.getPostgreSQL()
const rows = await postgres.executeQuery('SELECT * FROM users')

// Brave 搜索
const braveSearch = mcpManager.getBraveSearch()
const results = await braveSearch.search('BigModel-Z.ai SDK')

// Docker 容器管理
const docker = mcpManager.getDocker()
const containers = await docker.listContainers()

// GitHub 仓库管理
const github = mcpManager.getGitHub()
const repos = await github.listRepositories()

// 断开所有连接
await mcpManager.disconnectAll()
```

## 📚️ API 文档

### 助手对话 API

- [助手对话](../../API文档/对话API/助手对话.md)
- [助手列表](../../API文档/对话API/助手列表.md)
- [对话历史](../../API文档/对话API/对话历史.md)
- [智能体对话](../../API文档/对话API/智能体对话.md)
- [异步结果](../../API文档/对话API/异步结果.md)

### 文件管理 API

- [上传文件](../../API文档/文件管理API/上传文件.md)
- [删除文件](../../API文档/文件管理API/删除文件.md)
- [文件内容](../../API文档/文件管理API/文件内容.md)
- [文件列表](../../API文档/文件管理API/文件列表.md)
- [文件解析](../../API文档/文件管理API/文件解析.md)
- [网络搜索](../../API文档/文件管理API/网络搜索.md)
- [网页阅读](../../API文档/文件管理API/网页阅读.md)

### 知识库 API

- [上传URL文档](../../API文档/知识库API/上传URL文档.md)
- [上传文件文档](../../API文档/知识库API/上传文件文档.md)
- [创建知识库](../../API文档/知识库API/创建知识库.md)
- [删除文档](../../API文档/知识库API/删除文档.md)
- [删除知识库](../../API文档/知识库API/删除知识库.md)
- [文档列表](../../API文档/知识库API/文档列表.md)
- [文档详情](../../API文档/知识库API/文档详情.md)
- [知识库使用量](../../API文档/知识库API/知识库使用量.md)
- [知识库列表](../../API文档/知识库API/知识库列表.md)
- [知识库检索](../../API文档/知识库API/知识库检索.md)
- [知识库详情](../../API文档/知识库API/知识库详情.md)
- [编辑知识库](../../API文档/知识库API/编辑知识库.md)
- [解析文档图片](../../API文档/知识库API/解析文档图片.md)
- [重新向量化](../../API文档/知识库API/重新向量化.md)

### 多模态 API

- [图像生成](../../API文档/多模态API/图像生成.md)
- [文本转语音](../../API文档/多模态API/文本转语音.md)
- [语音转文本](../../API文档/多模态API/语音转文本.md)
- [视频生成](../../API文档/多模态API/生成视频(异步).md)
- [音色列表](../../API文档/多模态API/音色列表.md)

### MCP 集成

- [MCP 文档](./mcp/README.md) - 完整的 MCP 服务器文档
- [MCP 使用示例](./examples/mcp-usage-example.ts) - MCP 使用示例代码

## 🔧 配置选项

```typescript
interface BigModelSDKConfig {
  apiKey: string,        // 必需：API密钥
  baseUrl?: string,       // 可选：自定义API基础URL
  timeout?: number,       // 可选：请求超时时间（毫秒），默认30000
}
```

## 🎯 官方助手ID

| 助手名称 | 助手ID | 说明 |
|---------|---------|------|
| ChatGLM（官方） | 65940acff94777010aa6b796 | 嗨~ 我是清言，超开心遇见你！😺 |
| 数据分析（官方） | 65a265419d72d299a9230616 | 分析数据并提供图表化 |
| 复杂流程图（官方） | 664dd7bd5bb3a13ba0f81668 | 五秒钟做一张流程图 |
| 思维导图 MindMap（官方） | 664e0cade018d633146de0d2 | 任何复杂概念秒变脑图 |
| 提示词工程师（官方） | 6654898292788e88ce9e7f4c | 超强结构化提示词专家 |
| AI画图（官方） | 66437ef3d920bdc5c60f338e | 专属绘画伙伴 |
| AI搜索（官方） | 659e54b1b8006379b4b2abd6 | 连接全网内容，精准搜索 |

## 📝 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- 官网：https://bigmodel.cn
- 文档：https://docs.bigmodel.cn
- GitHub：[待添加]
