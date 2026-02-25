# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-25

### Added

#### 核心功能
- **BigModelClient** - 基础API客户端，支持同步和流式对话
- **AssistantManager** - 助手管理，包括助手列表、对话历史、对话管理
- **FileManager** - 文件管理，包括文件上传、删除、内容获取、文件解析
- **KnowledgeBaseManager** - 知识库管理，包括知识库创建、文档上传、检索
- **MultiModalManager** - 多模态功能，包括图像生成、语音合成、语音识别、视频生成

#### TypeScript 支持
- 完整的 TypeScript 类型定义
- 类型安全的 API 调用
- 智能代码提示

#### React Hooks
- **useBigModel** - 基础 SDK Hook
- **useChat** - 对话 Hook
- **useChatStream** - 流式对话 Hook
- **useAssistants** - 助手管理 Hook
- **useFiles** - 文件管理 Hook
- **useKnowledgeBase** - 知识库管理 Hook

#### 文档
- 完整的 README 文档
- API 使用示例
- TypeScript 配置文件
- package.json 配置

#### 特性
- 支持同步和流式对话
- 完整的错误处理
- 请求超时配置
- 自定义 API 基础 URL
- 文件上传支持
- 知识库检索
- 多模态 API 支持

### API 端点覆盖

#### 对话 API
- `POST /paas/v4/assistant` - 助手对话
- `GET /paas/v4/assistants` - 助手列表
- `GET /paas/v4/assistants/{id}` - 获取助手
- `GET /paas/v4/assistants/{id}/conversations` - 对话列表
- `GET /paas/v4/conversations/{id}/messages` - 对话历史
- `DELETE /paas/v4/conversations/{id}` - 删除对话
- `POST /paas/v4/conversations` - 创建对话

#### 文件管理 API
- `POST /paas/v4/files/upload` - 上传文件
- `GET /paas/v4/files` - 文件列表
- `GET /paas/v4/files/{id}` - 获取文件
- `GET /paas/v4/files/{id}/content` - 文件内容
- `DELETE /paas/v4/files/{id}` - 删除文件
- `POST /paas/v4/files/{id}/parse` - 解析文件
- `POST /paas/v4/files/{id}/parse/sync` - 同步解析文件
- `POST /paas/v4/files/web-search` - 网络搜索
- `POST /paas/v4/files/web-read` - 网页阅读

#### 知识库 API
- `GET /paas/v4/knowledge-bases` - 知识库列表
- `GET /paas/v4/knowledge-bases/{id}` - 获取知识库
- `POST /paas/v4/knowledge-bases` - 创建知识库
- `PUT /paas/v4/knowledge-bases/{id}` - 更新知识库
- `DELETE /paas/v4/knowledge-bases/{id}` - 删除知识库
- `GET /paas/v4/knowledge-bases/{id}/documents` - 文档列表
- `POST /paas/v4/knowledge-bases/{id}/documents` - 上传文档
- `POST /paas/v4/knowledge-bases/{id}/documents/url` - 从URL上传文档
- `DELETE /paas/v4/knowledge-bases/{id}/documents/{docId}` - 删除文档
- `POST /paas/v4/knowledge-bases/{id}/search` - 搜索知识库
- `POST /paas/v4/knowledge-bases/{id}/documents/{docId}/revectorize` - 重新向量化
- `GET /paas/v4/knowledge-bases/{id}/usage` - 获取使用量

#### 多模态 API
- `POST /api/paas/v4/images/generations` - 图像生成
- `GET /api/paas/v4/images/models` - 图像模型列表
- `POST /api/paas/v4/audio/speech` - 文本转语音
- `GET /api/paas/v4/audio/voices` - 音色列表
- `POST /api/paas/v4/audio/transcriptions` - 语音转文本
- `POST /api/paas/v4/videos/generations` - 视频生成
- `GET /api/paas/v4/videos/models` - 视频模型列表

### 官方助手支持

- ChatGLM（官方）- 65940acff94777010aa6b796
- 数据分析（官方）- 65a265419d72d299a9230616
- 复杂流程图（官方）- 664dd7bd5bb3a13ba0f81668
- 思维导图 MindMap（官方）- 664e0cade018d633146de0d2
- 提示词工程师（官方）- 6654898292788e88ce9e7f4c
- AI画图（官方）- 66437ef3d920bdc5c60f338e
- AI搜索（官方）- 659e54b1b8006379b4b2abd6

### 开发工具

- TypeScript 5.3.0
- ESLint 配置
- Prettier 配置
- Jest 测试框架
- ts-jest TypeScript 预处理器

### 许可证

MIT License
