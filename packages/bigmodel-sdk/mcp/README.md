# BigModel-Z.ai SDK - MCP 集成

> Model Context Protocol (MCP) 服务器完整封装，提供文件系统、数据库、搜索、Docker、GitHub 和 YYC3-CN 集成

## 📦 MCP 服务器列表

### 1. MCPFileSystemServer - 文件系统服务器
- **功能**：文件读写、目录列表、文件搜索
- **NPM 包**：@modelcontextprotocol/server-filesystem
- **配置**：允许访问的目录列表

### 2. MCPPostgreSQLServer - PostgreSQL 数据库服务器
- **功能**：数据库查询、表管理、数据操作
- **NPM 包**：@modelcontextprotocol/server-postgres
- **配置**：PostgreSQL 连接字符串

### 3. MCPBraveSearchServer - Brave 搜索服务器
- **功能**：网络搜索、结果获取
- **NPM 包**：@modelcontextprotocol/server-brave-search
- **配置**：Brave API Key

### 4. MCPDockerServer - Docker 容器服务器
- **功能**：容器管理、镜像管理
- **NPM 包**：modelcontextprotocol/server-docker
- **配置**：Docker 主机地址

### 5. MCPGitHubServer - GitHub 仓库服务器
- **功能**：仓库管理、Issue 管理、PR 管理
- **NPM 包**：@modelcontextprotocol/server-github
- **配置**：GitHub Personal Access Token

### 6. YYC3CNServer - YYC3-CN 增强版服务器
- **功能**：UI 分析、代码审查、AI 提示词优化、功能生成、本地化检查、智能编程、协同编程
- **配置**：YYC3-CN 服务器路径
- **工具数量**：20 个（5 个原有工具 + 9 个智能编程工具 + 6 个协同编程工具）

## 🚀 快速开始

### 安装

```bash
npm install @bigmodel-z/sdk
```

### 基础使用

```typescript
import { MCPManager } from '@bigmodel-z/sdk'

// 初始化 MCP 管理器
const mcpManager = new MCPManager({
  fileSystem: '/path/to/your/directory',
  postgresql: 'postgresql://user:password@host:5432/database',
  braveSearch: 'your-brave-api-key',
  docker: 'unix:///var/run/docker.sock',
  github: 'your-github-pat',
  yyc3cn: {
    serverPath: '/path/to/yyc3-cn-mcp-server.js',
    mode: 'development',
    version: 'latest',
  },
})

// 连接所有服务器
await mcpManager.connectAll()

// 使用文件系统
const fileSystem = mcpManager.getFileSystem()
const content = await fileSystem.readFile('/path/to/file.txt')

// 使用 PostgreSQL
const postgres = mcpManager.getPostgreSQL()
const rows = await postgres.executeQuery('SELECT * FROM users')

// 使用 Brave 搜索
const braveSearch = mcpManager.getBraveSearch()
const results = await braveSearch.search('BigModel-Z.ai SDK')

// 使用 Docker
const docker = mcpManager.getDocker()
const containers = await docker.listContainers()

// 使用 GitHub
const github = mcpManager.getGitHub()
const repos = await github.listRepositories()

// 使用 YYC3-CN
const yyc3cn = mcpManager.getYYC3CN()
const uiAnalysis = await yyc3cn.uiAnalysis({
  imagePath: '/path/to/screenshot.png',
  analysisType: 'ux_design',
})

// 断开所有连接
await mcpManager.disconnectAll()
```

## 📚 详细文档

### MCPFileSystemServer

```typescript
import { MCPFileSystemServer } from '@bigmodel-z/sdk'

// 创建文件系统服务器
const fileSystem = new MCPFileSystemServer('/path/to/your/directory')

// 读取文件
const content = await fileSystem.readFile('/path/to/file.txt')

// 读取多个文件
const files = await fileSystem.readMultipleFiles([
  '/path/to/file1.txt',
  '/path/to/file2.txt',
])

// 列出目录
const fileList = await fileSystem.listDirectory('/path/to/directory', false)

// 列出允许的目录
const allowedDirs = await fileSystem.listAllowedDirectories()

// 写入文件
await fileSystem.writeFile('/path/to/file.txt', 'Hello, World!')

// 创建目录
await fileSystem.createDirectory('/path/to/new/directory')

// 搜索文件
const results = await fileSystem.searchFiles(
  '/path/to/search',
  '*.ts',
  ['node_modules', '.git'],
)

// 获取文件信息
const fileInfo = await fileSystem.getFileInfo('/path/to/file.txt')
```

### MCPPostgreSQLServer

```typescript
import { MCPPostgreSQLServer } from '@bigmodel-z/sdk'

// 创建 PostgreSQL 服务器
const postgres = new MCPPostgreSQLServer(
  'postgresql://user:password@host:5432/database',
)

// 执行查询
const rows = await postgres.executeQuery('SELECT * FROM users LIMIT 10')

// 列出所有表
const tables = await postgres.listTables()

// 描述表结构
const tableInfo = await postgres.describeTable('users')

// 获取表模式
const schema = await postgres.getTableSchema('users')

// 列出所有数据库
const databases = await postgres.listDatabases()

// 获取数据库信息
const dbInfo = await postgres.getDatabaseInfo()

// 创建表
await postgres.createTable('new_table', [
  { name: 'id', type: 'SERIAL', primary_key: true },
  { name: 'name', type: 'VARCHAR(255)' },
])

// 插入数据
await postgres.insertData('users', { name: 'John', email: 'john@example.com' })

// 更新数据
await postgres.updateData('users', { id: 1 }, { name: 'Jane' })

// 删除数据
await postgres.deleteData('users', { id: 1 })
```

### MCPBraveSearchServer

```typescript
import { MCPBraveSearchServer } from '@bigmodel-z/sdk'

// 创建 Brave 搜索服务器
const braveSearch = new MCPBraveSearchServer('your-brave-api-key')

// 执行搜索
const results = await braveSearch.search('BigModel-Z.ai SDK', 10)

// 带偏移量的搜索
const results = await braveSearch.searchWithOffset(
  'BigModel-Z.ai SDK',
  10,
  20,
)

// 结果格式
interface SearchResult {
  title: string,
  url: string,
  snippet: string,
  publishedDate?: string,
}
```

### MCPDockerServer

```typescript
import { MCPDockerServer } from '@bigmodel-z/sdk'

// 创建 Docker 服务器
const docker = new MCPDockerServer('unix:///var/run/docker.sock')

// 列出所有容器
const containers = await docker.listContainers(true)

// 获取容器信息
const containerInfo = await docker.getContainerInfo('container-id')

// 启动容器
await docker.startContainer('container-id')

// 停止容器
await docker.stopContainer('container-id')

// 重启容器
await docker.restartContainer('container-id')

// 删除容器
await docker.removeContainer('container-id')

// 列出所有镜像
const images = await docker.listImages()

// 拉取镜像
await docker.pullImage('nginx:latest')

// 容器信息格式
interface ContainerInfo {
  id: string,
  name: string,
  image: string,
  status: string,
  ports: string[],
}
```

### MCPGitHubServer

```typescript
import { MCPGitHubServer } from '@bigmodel-z/sdk'

// 创建 GitHub 服务器
const github = new MCPGitHubServer('your-github-pat')

// 列出所有仓库
const repos = await github.listRepositories()

// 获取仓库信息
const repo = await github.getRepository('owner', 'repo-name')

// 列出 Issues
const issues = await github.listIssues('owner', 'repo-name', 'open')

// 获取 Issue 详情
const issue = await github.getIssue('owner', 'repo-name', 123)

// 创建 Issue
const newIssue = await github.createIssue(
  'owner',
  'repo-name',
  'Issue Title',
  'Issue description',
)

// 列出 Pull Requests
const prs = await github.listPullRequests('owner', 'repo-name', 'open')

// 获取 PR 详情
const pr = await github.getPullRequest('owner', 'repo-name', 456)

// 获取文件内容
const content = await github.getFileContent('owner', 'repo-name', 'README.md', 'main')

// 创建仓库
const newRepo = await github.createRepository('new-repo', 'Description', false)
```

### YYC3CNServer - YYC3-CN 增强版服务器

```typescript
import { YYC3CNServer } from '@bigmodel-z/sdk'

// 创建 YYC3-CN 服务器
const yyc3cn = new YYC3CNServer({
  serverPath: '/Users/yanyu/www/API文档/YYC3-CN/代码/yyc3-cn-mcp-server.js',
  mode: 'development',
  version: 'latest',
})

// 连接服务器
await yyc3cn.connect()

// 应用界面分析
const uiAnalysis = await yyc3cn.uiAnalysis({
  imagePath: '/path/to/screenshot.png',
  analysisType: 'ux_design',
  appVersion: 'latest',
})

// 代码审查
const codeReview = await yyc3cn.codeReview({
  codePath: '/path/to/code.ts',
  language: 'typescript',
  focus: 'ai_integration',
})

// AI 提示词优化
const promptOptimizer = await yyc3cn.aiPromptOptimizer({
  promptText: '帮我写一个 React 组件',
  optimizationGoal: 'chinese_understanding',
  context: '用于 YYC3-CN 项目',
})

// 新功能生成
const featureGenerator = await yyc3cn.featureGenerator({
  featureDescription: '为 YYC3-CN 添加实时协作功能',
  targetPlatform: 'web',
  complexity: 'complex',
})

// 中文本地化检查
const localizationChecker = await yyc3cn.localizationChecker({
  textContent: '欢迎使用 YYC3-CN 智能工作平台',
  checkType: 'user_friendly',
  targetAudience: 'general_users',
})

// API 接口生成
const apiGenerator = await yyc3cn.apiGenerator({
  apiSpec: '用户管理 API，包括用户注册、登录、信息修改、密码重置等功能',
  framework: 'express',
  generateDocs: true,
})

// 数据库结构设计
const databaseDesigner = await yyc3cn.databaseDesigner({
  businessRequirement: '设计一个用户权限管理系统，包括用户、角色、权限三个实体',
  databaseType: 'postgresql',
  generateMigration: true,
})

// UI 组件构建
const componentBuilder = await yyc3cn.componentBuilder({
  componentDescription: '一个可拖拽的仪表盘布局组件，支持网格布局和自由布局切换',
  framework: 'react',
  styling: 'tailwind',
})

// 测试用例生成
const testGenerator = await yyc3cn.testGenerator({
  sourceCode: 'export function add(a: number, b: number): number { return a + b }',
  testFramework: 'jest',
  testType: 'unit',
})

// 部署配置生成
const deploymentConfig = await yyc3cn.deploymentConfig({
  projectName: 'yyc3-cn-platform',
  targetEnvironment: 'production',
  deploymentType: 'docker',
})

// 性能分析
const performanceAnalyzer = await yyc3cn.performanceAnalyzer({
  codePath: '/path/to/code.ts',
  analysisDepth: 'standard',
})

// 技术文档构建
const documentationBuilder = await yyc3cn.documentationBuilder({
  codePath: '/path/to/code.ts',
  documentationType: 'api',
})

// 代码重构
const codeRefactor = await yyc3cn.codeRefactor({
  codePath: '/path/to/code.ts',
  refactorType: 'performance',
})

// 增强代码审查
const enhancedCodeReview = await yyc3cn.enhancedCodeReview({
  codeDiff: 'diff --git a/src/example.ts b/src/example.ts ...',
  reviewFocus: ['security', 'performance', 'best_practices'],
})

// 团队协作工作空间
const collaborationWorkspace = await yyc3cn.collaborationWorkspace({
  projectName: 'YYC3-CN Platform',
  teamMembers: ['user1@example.com', 'user2@example.com'],
  collaborationType: 'pair_programming',
})

// 实时协同编程
const realtimeCollab = await yyc3cn.realtimeCollab({
  sessionId: 'session-123',
  action: 'join',
  data: { userId: 'user1', userName: 'Developer 1' },
})

// 代码审查会话
const codeReviewSession = await yyc3cn.codeReviewSession({
  sessionId: 'review-session-123',
  action: 'create',
  reviewData: { codePath: '/path/to/code.ts', reviewers: ['user1@example.com'] },
})

// 团队编程项目
const teamCoding = await yyc3cn.teamCoding({
  projectId: 'project-123',
  action: 'create',
  taskData: { taskName: '实现用户认证功能', assignee: 'user1@example.com' },
})

// 结对编程
const pairProgramming = await yyc3cn.pairProgramming({
  sessionId: 'pair-session-123',
  role: 'driver',
  codeChanges: { filePath: '/path/to/code.ts', changes: '添加新的功能' },
})

// 代码冲突解决
const conflictResolver = await yyc3cn.conflictResolver({
  conflictFile: '/path/to/code.ts',
  conflictType: 'merge',
  resolutionStrategy: 'manual',
})

// 断开连接
await yyc3cn.disconnect()
```

#### YYC3-CN 工具列表

**原有工具（5 个）：**
1. `yyc3_ui_analysis` - 应用界面分析
2. `yyc3_code_review` - 代码审查
3. `yyc3_ai_prompt_optimizer` - AI 提示词优化
4. `yyc3_feature_generator` - 新功能生成
5. `yyc3_localization_checker` - 中文本地化检查

**智能编程工具（9 个）：**
1. `yyc3_api_generator` - API 接口自动生成器
2. `yyc3_database_designer` - 数据库结构设计器
3. `yyc3_component_builder` - UI 组件构建器
4. `yyc3_test_generator` - 测试用例生成器
5. `yyc3_deployment_config` - 部署配置生成器
6. `yyc3_performance_analyzer` - 代码性能分析器
7. `yyc3_documentation_builder` - 技术文档构建器
8. `yyc3_code_refactor` - 智能代码重构工具
9. `yyc3_code_review_enhanced` - 增强代码审查工具

**协同编程工具（6 个）：**
1. `yyc3_collaboration_workspace` - 团队协作工作空间管理
2. `yyc3_realtime_collab` - 实时协同编程工具
3. `yyc3_code_review_session` - 代码审查会话管理
4. `yyc3_team_coding` - 团队编程项目管理
5. `yyc3_pair_programming` - 结对编程辅助
6. `yyc3_conflict_resolver` - 代码冲突解决

## 🔧 配置说明

### Claude Code 配置

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/directory"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:password@host:5432/database"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    },
    "docker": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-v", "/var/run/docker.sock:/var/run/docker.sock", "modelcontextprotocol/server-docker"],
      "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-pat"
      }
    }
  }
}
```

### Cline 配置

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/directory"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:password@host:5432/database"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    },
    "docker": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-v", "/var/run/docker.sock:/var/run/docker.sock", "modelcontextprotocol/server-docker"],
      "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-pat"
      }
    }
  }
}
```

## 📊 API 参考

### MCPManager

| 方法 | 描述 | 返回类型 |
|------|------|---------|
| `connectAll()` | 连接所有 MCP 服务器 | `Promise<void>` |
| `disconnectAll()` | 断开所有 MCP 服务器 | `Promise<void>` |
| `getServer(name)` | 获取指定服务器 | `MCPClient \| undefined` |
| `getFileSystem()` | 获取文件系统服务器 | `MCPFileSystemServer \| undefined` |
| `getPostgreSQL()` | 获取 PostgreSQL 服务器 | `MCPPostgreSQLServer \| undefined` |
| `getBraveSearch()` | 获取 Brave 搜索服务器 | `MCPBraveSearchServer \| undefined` |
| `getDocker()` | 获取 Docker 服务器 | `MCPDockerServer \| undefined` |
| `getGitHub()` | 获取 GitHub 服务器 | `MCPGitHubServer \| undefined` |
| `listServers()` | 列出所有服务器名称 | `string[]` |
| `listAllTools()` | 列出所有工具 | `Promise<Map<string, any[]>>` |
| `listAllResources()` | 列出所有资源 | `Promise<Map<string, any[]>>` |

## 🔗 相关资源

- [MCP 官方文档](https://modelcontextprotocol.io/)
- [Claude MCP 集成](https://docs.anthropic.com/claude/docs/mcp)
- [BigModel-Z.ai SDK](../README.md)
- [MCP 使用示例](../examples/mcp-usage-example.ts)

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
