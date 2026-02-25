// ============================================================
// BigModel-Z.ai SDK - YYC3-CN MCP 服务器
// YYC3-CN 增强版 MCP 服务器封装
// ============================================================

import { MCPClient, MCPServerConfig } from './MCPClient';

export interface YYC3CNConfig {
  serverPath: string,
  mode?: 'development' | 'production',
  version?: string,
}

export interface UIAnalysisRequest {
  imagePath: string,
  analysisType?: 'ux_design' | 'performance' | 'chinese_localization' | 'feature_suggestions',
  appVersion?: string,
}

export interface CodeReviewRequest {
  codePath: string,
  language?: 'javascript' | 'typescript' | 'python' | 'swift' | 'kotlin' | 'java',
  focus?: 'ai_integration' | 'performance' | 'security' | 'chinese_nlp' | 'mobile_optimization',
}

export interface AIPromptOptimizerRequest {
  promptText: string,
  optimizationGoal?: 'accuracy' | 'response_speed' | 'user_experience' | 'chinese_understanding' | 'domain_specific',
  context?: string,
}

export interface FeatureGeneratorRequest {
  featureDescription: string,
  targetPlatform?: 'ios' | 'android' | 'web' | 'desktop' | 'all',
  complexity?: 'simple' | 'medium' | 'complex',
}

export interface LocalizationCheckerRequest {
  textContent: string,
  checkType?: 'grammar' | 'terminology' | 'user_friendly' | 'cultural_adaptation' | 'technical_accuracy',
  targetAudience?: 'general_users' | 'technical_users' | 'business_users' | 'students',
}

export interface APIGeneratorRequest {
  apiSpec: string,
  framework?: 'express' | 'fastapi' | 'spring-boot' | 'gin' | 'laravel',
  generateDocs?: boolean,
}

export interface DatabaseDesignerRequest {
  businessRequirement: string,
  databaseType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlite',
  generateMigration?: boolean,
}

export interface ComponentBuilderRequest {
  componentDescription: string,
  framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs',
  styling?: 'css' | 'scss' | 'tailwind' | 'styled-components',
}

export interface TestGeneratorRequest {
  sourceCode: string,
  testFramework?: 'jest' | 'pytest' | 'junit' | 'mocha' | 'vitest',
  testType?: 'unit' | 'integration' | 'e2e' | 'performance',
}

export interface DeploymentConfigRequest {
  projectName: string,
  targetEnvironment?: 'development' | 'staging' | 'production',
  deploymentType?: 'docker' | 'kubernetes' | 'serverless',
}

export interface PerformanceAnalyzerRequest {
  codePath: string,
  analysisDepth?: 'quick' | 'standard' | 'deep',
}

export interface DocumentationBuilderRequest {
  codePath: string,
  documentationType?: 'api' | 'readme' | 'architecture' | 'deployment',
}

export interface CodeRefactorRequest {
  codePath: string,
  refactorType?: 'performance' | 'readability' | 'maintainability' | 'best_practices',
}

export interface EnhancedCodeReviewRequest {
  codeDiff: string,
  reviewFocus?: ('security' | 'performance' | 'maintainability' | 'best_practices' | 'testing' | 'ai_optimization')[],
}

export interface CollaborationWorkspaceRequest {
  projectName: string,
  teamMembers: string[],
  collaborationType?: 'pair_programming' | 'team_review' | 'mob_programming' | 'async_collaboration',
  workspaceConfig?: any,
}

export interface RealtimeCollabRequest {
  sessionId: string,
  action: 'join' | 'leave' | 'sync' | 'message',
  data?: any,
}

export interface CodeReviewSessionRequest {
  sessionId: string,
  action: 'create' | 'join' | 'submit_review' | 'close',
  reviewData?: any,
}

export interface TeamCodingRequest {
  projectId: string,
  action: 'create' | 'update' | 'assign' | 'complete',
  taskData?: any,
}

export interface PairProgrammingRequest {
  sessionId: string,
  role: 'driver' | 'navigator',
  codeChanges?: any,
}

export interface ConflictResolverRequest {
  conflictFile: string,
  conflictType: 'merge' | 'rebase' | 'cherry_pick',
  resolutionStrategy?: 'manual' | 'auto' | 'hybrid',
}

export class YYC3CNServer extends MCPClient {
  constructor(config: YYC3CNConfig) {
    const mcpConfig: MCPServerConfig = {
      command: 'node',
      args: [config.serverPath],
      env: {
        NODE_ENV: config.mode || 'development',
        YYC3_CN_VERSION: config.version || 'latest',
        NODE_OPTIONS: '--max-old-space-size=512',
      },
      timeout: 30000,
    };

    super(mcpConfig);
  }

  async uiAnalysis(request: UIAnalysisRequest): Promise<any> {
    return this.callTool('yyc3_ui_analysis', request);
  }

  async codeReview(request: CodeReviewRequest): Promise<any> {
    return this.callTool('yyc3_code_review', request);
  }

  async aiPromptOptimizer(request: AIPromptOptimizerRequest): Promise<any> {
    return this.callTool('yyc3_ai_prompt_optimizer', request);
  }

  async featureGenerator(request: FeatureGeneratorRequest): Promise<any> {
    return this.callTool('yyc3_feature_generator', request);
  }

  async localizationChecker(request: LocalizationCheckerRequest): Promise<any> {
    return this.callTool('yyc3_localization_checker', request);
  }

  async apiGenerator(request: APIGeneratorRequest): Promise<any> {
    return this.callTool('yyc3_api_generator', request);
  }

  async databaseDesigner(request: DatabaseDesignerRequest): Promise<any> {
    return this.callTool('yyc3_database_designer', request);
  }

  async componentBuilder(request: ComponentBuilderRequest): Promise<any> {
    return this.callTool('yyc3_component_builder', request);
  }

  async testGenerator(request: TestGeneratorRequest): Promise<any> {
    return this.callTool('yyc3_test_generator', request);
  }

  async deploymentConfig(request: DeploymentConfigRequest): Promise<any> {
    return this.callTool('yyc3_deployment_config', request);
  }

  async performanceAnalyzer(request: PerformanceAnalyzerRequest): Promise<any> {
    return this.callTool('yyc3_performance_analyzer', request);
  }

  async documentationBuilder(request: DocumentationBuilderRequest): Promise<any> {
    return this.callTool('yyc3_documentation_builder', request);
  }

  async codeRefactor(request: CodeRefactorRequest): Promise<any> {
    return this.callTool('yyc3_code_refactor', request);
  }

  async enhancedCodeReview(request: EnhancedCodeReviewRequest): Promise<any> {
    return this.callTool('yyc3_code_review_enhanced', request);
  }

  async collaborationWorkspace(request: CollaborationWorkspaceRequest): Promise<any> {
    return this.callTool('yyc3_collaboration_workspace', request);
  }

  async realtimeCollab(request: RealtimeCollabRequest): Promise<any> {
    return this.callTool('yyc3_realtime_collab', request);
  }

  async codeReviewSession(request: CodeReviewSessionRequest): Promise<any> {
    return this.callTool('yyc3_code_review_session', request);
  }

  async teamCoding(request: TeamCodingRequest): Promise<any> {
    return this.callTool('yyc3_team_coding', request);
  }

  async pairProgramming(request: PairProgrammingRequest): Promise<any> {
    return this.callTool('yyc3_pair_programming', request);
  }

  async conflictResolver(request: ConflictResolverRequest): Promise<any> {
    return this.callTool('yyc3_conflict_resolver', request);
  }

  async listAllTools(): Promise<any[]> {
    const response = await this.listTools();

    return response;
  }

  async getServerInfo(): Promise<YYC3CNConfig> {
    const config = this.getConfig();

    return {
      serverPath: config.args?.[0] || '',
      mode: config.env?.NODE_ENV as 'development' | 'production',
      version: config.env?.YYC3_CN_VERSION || 'latest',
    };
  }
}

export default YYC3CNServer;
