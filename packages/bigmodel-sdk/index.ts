// ============================================================
// BigModel-Z.ai SDK - 统一导出
// ============================================================

export { BigModelClient } from './core/BigModelClient';
export type {
  BigModelConfig,
  AssistantMessage,
  AssistantResponse,
  StreamChunk,
} from './core/BigModelClient';

export { OpenAICompatibleClient } from './core/OpenAICompatibleClient';
export type {
  OpenAICompatibleConfig,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from './core/OpenAICompatibleClient';

export { AssistantManager } from './core/AssistantManager';
export type {
  Assistant,
  AssistantListResponse,
  Conversation,
  ConversationListResponse,
  Message,
  ConversationHistoryResponse,
} from './core/AssistantManager';

export { FileManager } from './core/FileManager';
export type {
  FileInfo,
  FileListResponse,
  FileContentResponse,
  ParsedResult,
  ParseResultResponse,
} from './core/FileManager';

export { KnowledgeBaseManager } from './core/KnowledgeBaseManager';
export type {
  KnowledgeBase,
  KnowledgeBaseListResponse,
  Document,
  DocumentListResponse,
  SearchQuery,
  SearchResult,
  SearchResponse,
} from './core/KnowledgeBaseManager';

export { MultiModalManager } from './core/MultiModalManager';
export type {
  ImageGenerationRequest,
  ImageGenerationResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
  SpeechToTextRequest,
  SpeechToTextResponse,
  VideoGenerationRequest,
  VideoGenerationResponse,
} from './core/MultiModalManager';

export { MCPClient } from './mcp/MCPClient';
export type {
  MCPServerConfig,
  MCPTool,
  MCPResource,
  MCPMessage,
  MCPResponse,
} from './mcp/MCPClient';

export { MCPFileSystemServer } from './mcp/MCPFileSystemServer';
export type { FileSystemConfig } from './mcp/MCPFileSystemServer';

export { MCPPostgreSQLServer } from './mcp/MCPPostgreSQLServer';
export type { PostgreSQLConfig } from './mcp/MCPPostgreSQLServer';

export { MCPBraveSearchServer } from './mcp/MCPBraveSearchServer';
export type { BraveSearchConfig, SearchResult as BraveSearchResult } from './mcp/MCPBraveSearchServer';

export { MCPDockerServer } from './mcp/MCPDockerServer';
export type { DockerConfig, ContainerInfo } from './mcp/MCPDockerServer';

export { MCPGitHubServer } from './mcp/MCPGitHubServer';
export type { GitHubConfig, Repository, Issue, PullRequest } from './mcp/MCPGitHubServer';

export { MCPManager } from './mcp/MCPManager';
export type { MCPManagerConfig } from './mcp/MCPManager';

export { YYC3CNServer } from './mcp/YYC3CNServer';
export type {
  YYC3CNConfig,
  UIAnalysisRequest,
  CodeReviewRequest,
  AIPromptOptimizerRequest,
  FeatureGeneratorRequest,
  LocalizationCheckerRequest,
  APIGeneratorRequest,
  DatabaseDesignerRequest,
  ComponentBuilderRequest,
  TestGeneratorRequest,
  DeploymentConfigRequest,
  PerformanceAnalyzerRequest,
  DocumentationBuilderRequest,
  CodeRefactorRequest,
  EnhancedCodeReviewRequest,
  CollaborationWorkspaceRequest,
  RealtimeCollabRequest,
  CodeReviewSessionRequest,
  TeamCodingRequest,
  PairProgrammingRequest,
  ConflictResolverRequest,
} from './mcp/YYC3CNServer';

export { default as BigModelSDK } from './BigModelSDK';
