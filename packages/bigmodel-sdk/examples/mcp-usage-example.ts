// ============================================================
// BigModel-Z.ai SDK - MCP 使用示例
// 展示如何使用各种 MCP 服务器
// ============================================================

/* eslint-disable no-console */

import { MCPManager, MCPClient } from '../index';

async function main() {
  console.log('=== BigModel-Z.ai SDK MCP 示例 ===\n');

  // ============================================================
  // 示例1：初始化 MCP 管理器
  // ============================================================
  console.log('1. 初始化 MCP 管理器');
  const mcpManager = new MCPManager({
    servers: {
      fileSystem: {
        command: 'node',
        args: ['/path/to/mcp-filesystem-server.js'],
      },
      postgresql: {
        command: 'node',
        args: ['/path/to/mcp-postgres-server.js'],
      },
      braveSearch: {
        command: 'node',
        args: ['/path/to/mcp-brave-search-server.js'],
      },
      docker: {
        command: 'node',
        args: ['/path/to/mcp-docker-server.js'],
      },
      github: {
        command: 'node',
        args: ['/path/to/mcp-github-server.js'],
      },
    },
  });

  const serverNames = ['fileSystem', 'postgresql', 'braveSearch', 'docker', 'github'];
  console.log('已配置的 MCP 服务器:', serverNames);
  console.log('');

  // ============================================================
  // 示例2：连接所有 MCP 服务器
  // ============================================================
  console.log('2. 连接所有 MCP 服务器');
  await mcpManager.connectAll();
  console.log('所有 MCP 服务器已连接\n');

  // ============================================================
  // 示例3：列出所有工具
  // ============================================================
  console.log('3. 列出所有 MCP 工具');
  try {
    const fsServer = mcpManager.getServer('fileSystem');

    if (fsServer) {
      const tools = await fsServer.listTools();
      console.log(`文件系统服务器工具数量: ${tools.length}`);
      tools.slice(0, 3).forEach((tool: any) => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });
    }
  } catch (error) {
    console.error('列出工具失败:', error);
  }

  // ============================================================
  // 示例4：列出所有资源
  // ============================================================
  console.log('\n4. 列出所有 MCP 资源');
  try {
    const fsServer = mcpManager.getServer('fileSystem');

    if (fsServer) {
      const resources = await fsServer.listResources();
      console.log(`文件系统服务器资源数量: ${resources.length}`);
      resources.slice(0, 3).forEach((resource: any) => {
        console.log(`  - ${resource.name}: ${resource.uri}`);
      });
    }
  } catch (error) {
    console.error('列出资源失败:', error);
  }

  // ============================================================
  // 示例5：断开所有连接
  // ============================================================
  console.log('\n5. 断开所有 MCP 服务器连接');
  await mcpManager.disconnectAll();
  console.log('所有 MCP 服务器已断开');

  console.log('\n=== 示例完成 ===');
}

async function directMCPClientExample() {
  console.log('\n=== 直接使用 MCPClient 示例 ===\n');

  console.log('1. 初始化单个 MCP 服务器');
  const mcpClient = new MCPClient({
    command: 'node',
    args: ['/path/to/mcp-server.js'],
  });

  console.log('2. 连接 MCP 服务器');
  await mcpClient.connect();
  console.log('MCP 服务器已连接\n');

  console.log('3. 列出工具和资源');
  const tools = await mcpClient.listTools();
  const resources = await mcpClient.listResources();

  console.log(`工具数量: ${tools.length}`);
  console.log(`资源数量: ${resources.length}`);

  console.log('\n4. 断开连接');
  await mcpClient.disconnect();
  console.log('MCP 服务器已断开\n');
}

main()
  .then(() => {
    console.log('\n主示例执行完成');

    return directMCPClientExample();
  })
  .then(() => {
    console.log('\n所有示例执行完成');
  })
  .catch(error => {
    console.error('执行失败:', error);
    process.exit(1);
  });
