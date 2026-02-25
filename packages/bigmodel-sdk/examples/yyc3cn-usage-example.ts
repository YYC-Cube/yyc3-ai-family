// ============================================================
// BigModel-Z.ai SDK - YYC3-CN 使用示例
// YYC3-CN 增强版 MCP 服务器使用示例
// ============================================================

/* eslint-disable no-console */

import { MCPManager, MCPClient, MCPTool } from '../index';

async function main() {
  console.log('=== BigModel-Z.ai SDK YYC3-CN 示例 ===\n');

  console.log('1. 初始化 YYC3-CN 服务器（使用 MCPClient）');
  const yyc3cn = new MCPClient({
    command: 'node',
    args: ['/path/to/yyc3-cn-mcp-server.js'],
    env: {
      NODE_ENV: 'development',
      YYC3_CN_VERSION: 'latest',
    },
  });

  console.log('YYC3-CN 服务器已初始化\n');

  console.log('2. 连接 YYC3-CN 服务器');
  await yyc3cn.connect();
  console.log('YYC3-CN 服务器已连接\n');

  console.log('3. 列出所有工具');
  const tools = await yyc3cn.listTools();

  console.log(`可用工具数量: ${tools.length}`);
  tools.forEach((tool: MCPTool, index: number) => {
    console.log(`${index + 1}. ${tool.name}: ${tool.description}`);
  });
  console.log('');

  console.log('4. 示例：调用 YYC3-CN 工具');
  try {
    const result = await yyc3cn.callTool('yyc3_ui_analysis', {
      imagePath: '/path/to/screenshot.png',
      analysisType: 'ux_design',
      appVersion: 'latest',
    });

    console.log('UI 分析结果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('UI 分析失败（可能需要实际的截图文件）:', error);
  }
  console.log('');

  console.log('5. 示例：代码审查工具');
  try {
    const result = await yyc3cn.callTool('yyc3_code_review', {
      codePath: '/path/to/your/code.ts',
      language: 'typescript',
      focus: 'ai_integration',
    });

    console.log('代码审查结果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('代码审查失败（可能需要实际的代码文件）:', error);
  }
  console.log('');

  console.log('6. 断开 YYC3-CN 服务器连接');
  await yyc3cn.disconnect();
  console.log('YYC3-CN 服务器已断开连接\n');

  console.log('=== 示例完成 ===');
}

async function exampleWithMCPManager() {
  console.log('\n=== 使用 MCPManager 管理 YYC3-CN 服务器 ===\n');

  const mcpManager = new MCPManager({
    servers: {
      yyc3cn: {
        command: 'node',
        args: ['/path/to/yyc3-cn-mcp-server.js'],
        env: {
          NODE_ENV: 'development',
          YYC3_CN_VERSION: 'latest',
        },
      },
    },
  });

  console.log('连接所有 MCP 服务器');
  await mcpManager.connectAll();
  console.log('所有 MCP 服务器已连接\n');

  const yyc3cn = mcpManager.getServer('yyc3cn');

  if (yyc3cn) {
    console.log('获取 YYC3-CN 服务器成功');

    const tools = await yyc3cn.listTools();

    console.log(`可用工具数量: ${tools.length}`);
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
