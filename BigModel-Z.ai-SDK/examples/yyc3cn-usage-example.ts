// ============================================================
// BigModel-Z.ai SDK - YYC3-CN 使用示例
// YYC3-CN 增强版 MCP 服务器使用示例
// ============================================================

import { YYC3CNServer, MCPManager } from '../index';

async function main() {
  console.log('=== BigModel-Z.ai SDK YYC3-CN 示例 ===\n');

  console.log('1. 初始化 YYC3-CN 服务器');
  const yyc3cn = new YYC3CNServer({
    serverPath: '/path/to/yyc3-cn-mcp-server.js',
    mode: 'development',
    version: 'latest',
  });

  console.log('YYC3-CN 服务器已初始化\n');

  console.log('2. 连接 YYC3-CN 服务器');
  await yyc3cn.connect();
  console.log('YYC3-CN 服务器已连接\n');

  console.log('3. 获取服务器信息');
  const serverInfo = await yyc3cn.getServerInfo();

  console.log('服务器信息:', JSON.stringify(serverInfo, null, 2));
  console.log('');

  console.log('4. 列出所有工具');
  const tools = await yyc3cn.listAllTools();

  console.log(`可用工具数量: ${tools.length}`);
  tools.forEach((tool: any, index: number) => {
    console.log(`${index + 1}. ${tool.name}: ${tool.description}`);
  });
  console.log('');

  console.log('5. 示例：应用界面分析');
  try {
    const uiAnalysisResult = await yyc3cn.uiAnalysis({
      imagePath: '/path/to/screenshot.png',
      analysisType: 'ux_design',
      appVersion: 'latest',
    });

    console.log('UI 分析结果:', JSON.stringify(uiAnalysisResult, null, 2));
  } catch (error) {
    console.log('UI 分析失败（可能需要实际的截图文件）:', error);
  }
  console.log('');

  console.log('6. 示例：代码审查');
  try {
    const codeReviewResult = await yyc3cn.codeReview({
      codePath: '/path/to/your/code.ts',
      language: 'typescript',
      focus: 'ai_integration',
    });

    console.log('代码审查结果:', JSON.stringify(codeReviewResult, null, 2));
  } catch (error) {
    console.log('代码审查失败（可能需要实际的代码文件）:', error);
  }
  console.log('');

  console.log('7. 示例：AI 提示词优化');
  try {
    const promptOptimizerResult = await yyc3cn.aiPromptOptimizer({
      promptText: '帮我写一个 React 组件',
      optimizationGoal: 'chinese_understanding',
      context: '用于 YYC3-CN 项目',
    });

    console.log('提示词优化结果:', JSON.stringify(promptOptimizerResult, null, 2));
  } catch (error) {
    console.log('提示词优化失败:', error);
  }
  console.log('');

  console.log('8. 示例：新功能生成');
  try {
    const featureGeneratorResult = await yyc3cn.featureGenerator({
      featureDescription: '为 YYC3-CN 添加实时协作功能',
      targetPlatform: 'web',
      complexity: 'complex',
    });

    console.log('功能生成结果:', JSON.stringify(featureGeneratorResult, null, 2));
  } catch (error) {
    console.log('功能生成失败:', error);
  }
  console.log('');

  console.log('9. 示例：中文本地化检查');
  try {
    const localizationCheckerResult = await yyc3cn.localizationChecker({
      textContent: '欢迎使用 YYC3-CN 智能工作平台',
      checkType: 'user_friendly',
      targetAudience: 'general_users',
    });

    console.log('本地化检查结果:', JSON.stringify(localizationCheckerResult, null, 2));
  } catch (error) {
    console.log('本地化检查失败:', error);
  }
  console.log('');

  console.log('10. 示例：API 接口生成');
  try {
    const apiGeneratorResult = await yyc3cn.apiGenerator({
      apiSpec: '用户管理 API，包括用户注册、登录、信息修改、密码重置等功能',
      framework: 'express',
      generateDocs: true,
    });

    console.log('API 生成结果:', JSON.stringify(apiGeneratorResult, null, 2));
  } catch (error) {
    console.log('API 生成失败:', error);
  }
  console.log('');

  console.log('11. 示例：数据库结构设计');
  try {
    const databaseDesignerResult = await yyc3cn.databaseDesigner({
      businessRequirement: '设计一个用户权限管理系统，包括用户、角色、权限三个实体',
      databaseType: 'postgresql',
      generateMigration: true,
    });

    console.log('数据库设计结果:', JSON.stringify(databaseDesignerResult, null, 2));
  } catch (error) {
    console.log('数据库设计失败:', error);
  }
  console.log('');

  console.log('12. 示例：UI 组件构建');
  try {
    const componentBuilderResult = await yyc3cn.componentBuilder({
      componentDescription: '一个可拖拽的仪表盘布局组件，支持网格布局和自由布局切换',
      framework: 'react',
      styling: 'tailwind',
    });

    console.log('组件构建结果:', JSON.stringify(componentBuilderResult, null, 2));
  } catch (error) {
    console.log('组件构建失败:', error);
  }
  console.log('');

  console.log('13. 示例：测试用例生成');
  try {
    const testGeneratorResult = await yyc3cn.testGenerator({
      sourceCode: `
export function add(a: number, b: number): number {
  return a + b
}
      `,
      testFramework: 'jest',
      testType: 'unit',
    });

    console.log('测试生成结果:', JSON.stringify(testGeneratorResult, null, 2));
  } catch (error) {
    console.log('测试生成失败:', error);
  }
  console.log('');

  console.log('14. 示例：部署配置生成');
  try {
    const deploymentConfigResult = await yyc3cn.deploymentConfig({
      projectName: 'yyc3-cn-platform',
      targetEnvironment: 'production',
      deploymentType: 'docker',
    });

    console.log('部署配置结果:', JSON.stringify(deploymentConfigResult, null, 2));
  } catch (error) {
    console.log('部署配置生成失败:', error);
  }
  console.log('');

  console.log('15. 示例：性能分析');
  try {
    const performanceAnalyzerResult = await yyc3cn.performanceAnalyzer({
      codePath: '/path/to/your/code.ts',
      analysisDepth: 'standard',
    });

    console.log('性能分析结果:', JSON.stringify(performanceAnalyzerResult, null, 2));
  } catch (error) {
    console.log('性能分析失败（可能需要实际的代码文件）:', error);
  }
  console.log('');

  console.log('16. 示例：技术文档构建');
  try {
    const documentationBuilderResult = await yyc3cn.documentationBuilder({
      codePath: '/path/to/your/code.ts',
      documentationType: 'api',
    });

    console.log('文档构建结果:', JSON.stringify(documentationBuilderResult, null, 2));
  } catch (error) {
    console.log('文档构建失败（可能需要实际的代码文件）:', error);
  }
  console.log('');

  console.log('17. 示例：代码重构');
  try {
    const codeRefactorResult = await yyc3cn.codeRefactor({
      codePath: '/path/to/your/code.ts',
      refactorType: 'performance',
    });

    console.log('代码重构结果:', JSON.stringify(codeRefactorResult, null, 2));
  } catch (error) {
    console.log('代码重构失败（可能需要实际的代码文件）:', error);
  }
  console.log('');

  console.log('18. 示例：增强代码审查');
  try {
    const enhancedCodeReviewResult = await yyc3cn.enhancedCodeReview({
      codeDiff: `
diff --git a/src/app/components/example.tsx b/src/app/components/example.tsx
index 1234567..abcdefg 100644
--- a/src/app/components/example.tsx
+++ b/src/app/components/example.tsx
@@ -1,5 +1,10 @@
 export function Example() {
-  return <div>Hello</div>
+  const [count, setCount] = useState(0)
+  return (
+    <div>
+      <button onClick={() => setCount(count + 1)}>{count}</button>
+    </div>
+  )
 }
      `,
      reviewFocus: ['security', 'performance', 'best_practices'],
    });

    console.log('增强代码审查结果:', JSON.stringify(enhancedCodeReviewResult, null, 2));
  } catch (error) {
    console.log('增强代码审查失败:', error);
  }
  console.log('');

  console.log('19. 示例：团队协作工作空间');
  try {
    const collaborationWorkspaceResult = await yyc3cn.collaborationWorkspace({
      projectName: 'YYC3-CN Platform',
      teamMembers: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
      collaborationType: 'pair_programming',
    });

    console.log('协作工作空间结果:', JSON.stringify(collaborationWorkspaceResult, null, 2));
  } catch (error) {
    console.log('协作工作空间创建失败:', error);
  }
  console.log('');

  console.log('20. 示例：实时协同编程');
  try {
    const realtimeCollabResult = await yyc3cn.realtimeCollab({
      sessionId: 'session-123',
      action: 'join',
      data: {
        userId: 'user1',
        userName: 'Developer 1',
      },
    });

    console.log('实时协同编程结果:', JSON.stringify(realtimeCollabResult, null, 2));
  } catch (error) {
    console.log('实时协同编程失败:', error);
  }
  console.log('');

  console.log('21. 示例：代码审查会话');
  try {
    const codeReviewSessionResult = await yyc3cn.codeReviewSession({
      sessionId: 'review-session-123',
      action: 'create',
      reviewData: {
        codePath: '/path/to/your/code.ts',
        reviewers: ['user1@example.com', 'user2@example.com'],
      },
    });

    console.log('代码审查会话结果:', JSON.stringify(codeReviewSessionResult, null, 2));
  } catch (error) {
    console.log('代码审查会话失败:', error);
  }
  console.log('');

  console.log('22. 示例：团队编程项目');
  try {
    const teamCodingResult = await yyc3cn.teamCoding({
      projectId: 'project-123',
      action: 'create',
      taskData: {
        taskName: '实现用户认证功能',
        assignee: 'user1@example.com',
        priority: 'high',
      },
    });

    console.log('团队编程项目结果:', JSON.stringify(teamCodingResult, null, 2));
  } catch (error) {
    console.log('团队编程项目失败:', error);
  }
  console.log('');

  console.log('23. 示例：结对编程');
  try {
    const pairProgrammingResult = await yyc3cn.pairProgramming({
      sessionId: 'pair-session-123',
      role: 'driver',
      codeChanges: {
        filePath: '/path/to/your/code.ts',
        changes: '添加新的功能',
      },
    });

    console.log('结对编程结果:', JSON.stringify(pairProgrammingResult, null, 2));
  } catch (error) {
    console.log('结对编程失败:', error);
  }
  console.log('');

  console.log('24. 示例：代码冲突解决');
  try {
    const conflictResolverResult = await yyc3cn.conflictResolver({
      conflictFile: '/path/to/your/code.ts',
      conflictType: 'merge',
      resolutionStrategy: 'manual',
    });

    console.log('代码冲突解决结果:', JSON.stringify(conflictResolverResult, null, 2));
  } catch (error) {
    console.log('代码冲突解决失败（可能需要实际的冲突文件）:', error);
  }
  console.log('');

  console.log('25. 断开 YYC3-CN 服务器连接');
  await yyc3cn.disconnect();
  console.log('YYC3-CN 服务器已断开连接\n');

  console.log('=== 示例完成 ===');
}

async function exampleWithMCPManager() {
  console.log('\n=== 使用 MCPManager 管理 YYC3-CN 服务器 ===\n');

  const mcpManager = new MCPManager({
    yyc3cn: {
      serverPath: '/path/to/yyc3-cn-mcp-server.js',
      mode: 'development',
      version: 'latest',
    },
  });

  console.log('已配置的 MCP 服务器:', mcpManager.listServers());
  console.log('');

  console.log('连接所有 MCP 服务器');
  await mcpManager.connectAll();
  console.log('所有 MCP 服务器已连接\n');

  const yyc3cn = mcpManager.getYYC3CN();

  if (yyc3cn) {
    console.log('获取 YYC3-CN 服务器成功');

    const serverInfo = await yyc3cn.getServerInfo();

    console.log('服务器信息:', JSON.stringify(serverInfo, null, 2));
  }

  console.log('\n断开所有连接');
  await mcpManager.disconnectAll();
  console.log('所有 MCP 服务器已断开连接\n');
}

main()
  .then(() => {
    console.log('\n主示例执行完成');

    return exampleWithMCPManager();
  })
  .then(() => {
    console.log('\n所有示例执行完成');
  })
  .catch(error => {
    console.error('执行失败:', error);
    process.exit(1);
  });
