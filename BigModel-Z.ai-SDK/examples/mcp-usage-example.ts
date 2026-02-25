// ============================================================
// BigModel-Z.ai SDK - MCP 使用示例
// 展示如何使用各种 MCP 服务器
// ============================================================

import { MCPManager } from './mcp/MCPManager';

async function main() {
  console.log('=== BigModel-Z.ai SDK MCP 示例 ===\n');

  // ============================================================
  // 示例1：初始化 MCP 管理器
  // ============================================================
  console.log('1. 初始化 MCP 管理器');
  const mcpManager = new MCPManager({
    fileSystem: '/path/to/your/directory',
    postgresql: 'postgresql://username:password@host:5432/database',
    braveSearch: 'your-brave-api-key-here',
    docker: 'unix:///var/run/docker.sock',
    github: 'your-github-pat-here',
  });

  console.log('已配置的 MCP 服务器:', mcpManager.listServers());
  console.log('');

  // ============================================================
  // 示例2：连接所有 MCP 服务器
  // ============================================================
  console.log('2. 连接所有 MCP 服务器');
  await mcpManager.connectAll();
  console.log('所有 MCP 服务器已连接\n');

  // ============================================================
  // 示例3：文件系统操作
  // ============================================================
  console.log('3. 文件系统操作示例');
  try {
    const fileSystem = mcpManager.getFileSystem();

    if (fileSystem) {
      // 读取文件
      const content = await fileSystem.readFile('/path/to/your/directory/README.md');

      console.log('文件内容（前100字符）:', content.substring(0, 100) + '...');

      // 列出目录
      const files = await fileSystem.listDirectory('/path/to/your/directory', false);

      console.log('目录文件数:', files.length);

      // 列出允许的目录
      const allowedDirs = await fileSystem.listAllowedDirectories();

      console.log('允许的目录:', allowedDirs);
    }
  } catch (error) {
    console.error('文件系统操作失败:', error);
  }

  // ============================================================
  // 示例4：PostgreSQL 数据库操作
  // ============================================================
  console.log('\n4. PostgreSQL 数据库操作示例');
  try {
    const postgres = mcpManager.getPostgreSQL();

    if (postgres) {
      // 列出所有表
      const tables = await postgres.listTables();

      console.log('数据库表:', tables);

      // 执行查询
      const rows = await postgres.executeQuery('SELECT * FROM users LIMIT 5');

      console.log('查询结果（前5行）:', rows.length, '行');

      // 获取数据库信息
      const dbInfo = await postgres.getDatabaseInfo();

      console.log('数据库信息:', dbInfo);
    }
  } catch (error) {
    console.error('数据库操作失败:', error);
  }

  // ============================================================
  // 示例5：Brave 搜索
  // ============================================================
  console.log('\n5. Brave 搜索示例');
  try {
    const braveSearch = mcpManager.getBraveSearch();

    if (braveSearch) {
      // 执行搜索
      const results = await braveSearch.search('BigModel-Z.ai SDK', 5);

      console.log('搜索结果:', results.length, '条');
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     ${result.url}`);
        console.log(`     ${result.snippet}`);
      });
    }
  } catch (error) {
    console.error('搜索失败:', error);
  }

  // ============================================================
  // 示例6：Docker 容器管理
  // ============================================================
  console.log('\n6. Docker 容器管理示例');
  try {
    const docker = mcpManager.getDocker();

    if (docker) {
      // 列出所有容器
      const containers = await docker.listContainers(true);

      console.log('Docker 容器:', containers.length, '个');
      containers.forEach(container => {
        console.log(`  - ${container.name} (${container.status})`);
      });

      // 列出所有镜像
      const images = await docker.listImages();

      console.log('Docker 镜像:', images.length, '个');
    }
  } catch (error) {
    console.error('Docker 操作失败:', error);
  }

  // ============================================================
  // 示例7：GitHub 仓库管理
  // ============================================================
  console.log('\n7. GitHub 仓库管理示例');
  try {
    const github = mcpManager.getGitHub();

    if (github) {
      // 列出所有仓库
      const repos = await github.listRepositories();

      console.log('GitHub 仓库:', repos.length, '个');
      repos.slice(0, 5).forEach(repo => {
        console.log(`  - ${repo.full_name} (${repo.stars} stars)`);
      });

      // 获取特定仓库信息
      if (repos.length > 0) {
        const repo = await github.getRepository(
          repos[0].full_name.split('/')[0],
          repos[0].full_name.split('/')[1],
        );

        console.log('仓库详情:', repo.name, '-', repo.description);
      }

      // 列出 Issues
      if (repos.length > 0) {
        const issues = await github.listIssues(
          repos[0].full_name.split('/')[0],
          repos[0].full_name.split('/')[1],
          'open',
        );

        console.log('开放 Issues:', issues.length, '个');
      }
    }
  } catch (error) {
    console.error('GitHub 操作失败:', error);
  }

  // ============================================================
  // 示例8：列出所有工具
  // ============================================================
  console.log('\n8. 列出所有 MCP 工具');
  try {
    const allTools = await mcpManager.listAllTools();

    for (const [serverName, tools] of allTools.entries()) {
      console.log(`${serverName}:`, tools.length, '个工具');
      tools.slice(0, 3).forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });
    }
  } catch (error) {
    console.error('列出工具失败:', error);
  }

  // ============================================================
  // 示例9：列出所有资源
  // ============================================================
  console.log('\n9. 列出所有 MCP 资源');
  try {
    const allResources = await mcpManager.listAllResources();

    for (const [serverName, resources] of allResources.entries()) {
      console.log(`${serverName}:`, resources.length, '个资源');
    }
  } catch (error) {
    console.error('列出资源失败:', error);
  }

  // ============================================================
  // 示例10：断开所有连接
  // ============================================================
  console.log('\n10. 断开所有 MCP 服务器连接');
  await mcpManager.disconnectAll();
  console.log('所有 MCP 服务器已断开');

  console.log('\n=== 示例完成 ===');
}

main().catch(console.error);
