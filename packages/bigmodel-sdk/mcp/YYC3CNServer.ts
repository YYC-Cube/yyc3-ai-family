// ============================================================
// BigModel-Z.ai SDK - YYC3-CN 增强服务器
// YYC3-CN 专用 MCP 服务器封装
// ============================================================

import { MCPClient } from './MCPClient';

export interface YYC3CNConfig {
  serverPath: string;
  mode?: 'development' | 'production';
  version?: string;
}

export interface UIAnalysisRequest {
  imagePath: string;
  analysisType: 'ux_design' | 'performance' | 'chinese_localization' | 'feature_suggestions';
}

export interface CodeReviewRequest {
  codePath: string;
  focus: 'ai_integration' | 'performance' | 'security' | 'chinese_nlp' | 'mobile_optimization';
}

export interface AIPromptOptimizerRequest {
  promptText: string;
  optimizationGoal: 'accuracy' | 'response_speed' | 'user_experience' | 'chinese_understanding';
}

export interface FeatureGeneratorRequest {
  featureDescription: string;
  targetPlatform: 'ios' | 'android' | 'web' | 'desktop' | 'all';
}

export interface LocalizationCheckerRequest {
  textContent: string;
  checkType: 'grammar' | 'terminology' | 'user_friendly' | 'cultural_adaptation';
}

export interface APIGeneratorRequest {
  apiSpec: string;
  framework: 'express' | 'fastapi' | 'spring-boot' | 'gin' | 'laravel';
}

export interface DatabaseDesignerRequest {
  businessRequirement: string;
  databaseType: 'mysql' | 'postgresql' | 'mongodb' | 'sqlite';
}

export interface ComponentBuilderRequest {
  componentDescription: string;
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs';
}

export interface TestGeneratorRequest {
  sourceCode: string;
  testFramework: 'jest' | 'pytest' | 'junit' | 'mocha' | 'vitest';
}

export interface DeploymentConfigRequest {
  environment: 'development' | 'staging' | 'production';
  platform: 'docker' | 'kubernetes' | 'serverless';
}

export interface PerformanceAnalyzerRequest {
  targetUrl: string;
  metrics: string[];
}

export interface DocumentationBuilderRequest {
  projectPath: string;
  outputFormat: 'markdown' | 'html' | 'pdf';
}

export interface CodeRefactorRequest {
  codePath: string;
  refactorType: 'extract_method' | 'rename' | 'optimize_imports' | 'modernize';
}

export interface EnhancedCodeReviewRequest {
  codeDiff: string;
  reviewFocus: string[];
}

export interface CollaborationWorkspaceRequest {
  projectName: string;
  teamMembers: string[];
}

export interface RealtimeCollabRequest {
  sessionId: string;
  participants: string[];
}

export interface CodeReviewSessionRequest {
  repository: string;
  pullRequest: number;
}

export interface TeamCodingRequest {
  teamId: string;
  taskDescription: string;
}

export interface PairProgrammingRequest {
  driver: string;
  navigator: string;
  taskDescription: string;
}

export interface ConflictResolverRequest {
  filePath: string;
  conflictMarkers: string[];
}

export class YYC3CNServer extends MCPClient {
  constructor(config: YYC3CNConfig) {
    super({
      command: 'node',
      args: [config.serverPath],
      env: {
        NODE_ENV: config.mode || 'development',
        YYC3_CN_VERSION: config.version || 'latest',
      },
    });
  }
}

export default YYC3CNServer;
