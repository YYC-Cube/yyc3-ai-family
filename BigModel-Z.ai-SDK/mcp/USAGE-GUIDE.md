# MCP 集成使用指南

> BigModel-Z.ai SDK MCP（Model Context Protocol）集成详细使用说明、技巧指南和错误解决

## 📚 目录

- [MCP 概述](#mcp-概述)
- [MCPManager](#mcpmanager)
- [MCPFileSystemServer](#mcpfilesystemserver)
- [MCPPostgreSQLServer](#mcppostgresqlserver)
- [MCPBraveSearchServer](#mcpbravesearchserver)
- [MCPDockerServer](#mcpdockerserver)
- [MCPGitHubServer](#mcpgithubserver)
- [YYC3CNServer](#yyc3cnserver)
- [常见问题](#常见问题)

---

## MCP 概述

### 什么是 MCP？

MCP（Model Context Protocol）是一个开放协议，用于在 AI 应用程序和外部系统之间建立标准化的连接。BigModel-Z.ai SDK 集成了多个 MCP 服务器，提供了丰富的功能扩展。

### 可用的 MCP 服务器

1. **MCPFileSystemServer** - 文件系统操作
2. **MCPPostgreSQLServer** - PostgreSQL 数据库操作
3. **MCPBraveSearchServer** - Brave 搜索
4. **MCPDockerServer** - Docker 容器管理
5. **MCPGitHubServer** - GitHub 仓库管理
6. **YYC3CNServer** - YYC3-CN 增强版 AI 辅助开发

### 安装依赖

```bash
# 安装文件系统服务器
npm install @modelcontextprotocol/server-filesystem

# 安装 PostgreSQL 服务器
npm install @modelcontextprotocol/server-postgres

# 安装 Brave 搜索服务器
npm install @modelcontextprotocol/server-brave-search

# 安装 GitHub 服务器
npm install @modelcontextprotocol/server-github

# Docker 服务器使用 Docker CLI，无需额外安装
```

---

## MCPManager

### 📖 使用说明

MCPManager 是统一的 MCP 服务器管理器，可以同时管理多个 MCP 服务器。

#### 基础配置

```typescript
import { MCPManager } from '@bigmodel-z/sdk'

const mcpManager = new MCPManager({
  fileSystem: '/path/to/your/directory',
  postgresql: 'postgresql://username:password@host:5432/database',
  braveSearch: 'your-brave-api-key',
  docker: 'unix:///var/run/docker.sock',
  github: 'your-github-pat',
  yyc3cn: {
    serverPath: '/path/to/yyc3-cn-mcp-server.js',
    mode: 'development',
    version: 'latest',
  },
})
```

#### 连接所有服务器

```typescript
await mcpManager.connectAll()
console.log('所有 MCP 服务器已连接')
```

#### 获取特定服务器

```typescript
const fileSystem = mcpManager.getFileSystem()
const postgres = mcpManager.getPostgreSQL()
const braveSearch = mcpManager.getBraveSearch()
const docker = mcpManager.getDocker()
const github = mcpManager.getGitHub()
const yyc3cn = mcpManager.getYYC3CN()
```

#### 断开所有连接

```typescript
await mcpManager.disconnectAll()
console.log('所有 MCP 服务器已断开')
```

### 💡 技巧指南

#### 1. 选择性连接

只连接需要的服务器：

```typescript
const mcpManager = new MCPManager({
  fileSystem: '/path/to/directory',
  postgresql: 'postgresql://user:password@host:5432/database',
})

// 只连接文件系统
await mcpManager.connect('filesystem')

// 或连接多个
await mcpManager.connectMultiple(['filesystem', 'postgresql'])
```

#### 2. 连接状态监控

监控服务器连接状态：

```typescript
class MCPMonitor {
  private manager: MCPManager
  private status: Map<string, boolean> = new Map()

  constructor(manager: MCPManager) {
    this.manager = manager
    this.startMonitoring()
  }

  private startMonitoring() {
    setInterval(async () => {
      const servers = this.manager.listServers()
      for (const server of servers) {
        try {
          const info = await this.manager.getServerInfo(server)
          this.status.set(server, true)
        } catch {
          this.status.set(server, false)
        }
      }
      console.log('服务器状态:', Object.fromEntries(this.status))
    }, 30000) // 每 30 秒检查一次
  }

  getStatus(server: string): boolean {
    return this.status.get(server) || false
  }
}

const monitor = new MCPMonitor(mcpManager)
```

#### 3. 自动重连

实现自动重连机制：

```typescript
class AutoReconnectManager {
  private manager: MCPManager
  private reconnectAttempts = new Map<string, number>()
  private maxAttempts = 3

  constructor(manager: MCPManager) {
    this.manager = manager
  }

  async connectWithRetry(server: string): Promise<boolean> {
    const attempts = this.reconnectAttempts.get(server) || 0
    if (attempts >= this.maxAttempts) {
      console.error(`服务器 ${server} 重连次数超限`)
      return false
    }

    try {
      await this.manager.connect(server)
      this.reconnectAttempts.set(server, 0)
      return true
    } catch (error) {
      this.reconnectAttempts.set(server, attempts + 1)
      const delay = Math.pow(2, attempts) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.connectWithRetry(server)
    }
  }
}
```

### ❌ 常见错误及解决

#### 错误 1: Server not found

**原因：** 服务器名称错误

**解决方法：**
```typescript
const servers = mcpManager.listServers()
console.log('可用服务器:', servers)

// 使用正确的服务器名称
await mcpManager.connect('filesystem') // 而不是 'fileSystem'
```

#### 错误 2: Connection timeout

**原因：** 连接超时

**解决方法：**
```typescript
const mcpManager = new MCPManager({
  fileSystem: '/path/to/directory',
  postgresql: 'postgresql://user:password@host:5432/database',
  timeout: 60000, // 增加超时时间到 60 秒
})
```

#### 错误 3: Multiple connections

**原因：** 重复连接

**解决方法：**
```typescript
// 检查连接状态
const servers = mcpManager.listServers()
const connected = await Promise.all(
  servers.map(async server => {
    try {
      await mcpManager.getServerInfo(server)
      return server
    } catch {
      return null
    }
  })
)

console.log('已连接的服务器:', connected.filter(Boolean))

// 只连接未连接的服务器
for (const server of servers) {
  if (!connected.includes(server)) {
    await mcpManager.connect(server)
  }
}
```

---

## MCPFileSystemServer

### 📖 使用说明

MCPFileSystemServer 提供文件系统操作功能。

#### 基础配置

```typescript
import { MCPFileSystemServer } from '@bigmodel-z/sdk'

const fileSystem = new MCPFileSystemServer('/path/to/your/directory')
await fileSystem.connect()
```

#### 读取文件

```typescript
const content = await fileSystem.readFile('/path/to/file.txt')
console.log(content)
```

#### 读取多个文件

```typescript
const files = await fileSystem.readMultipleFiles([
  '/path/to/file1.txt',
  '/path/to/file2.txt',
  '/path/to/file3.txt',
])
console.log(files)
```

#### 列出目录

```typescript
const fileList = await fileSystem.listDirectory('/path/to/directory', false)
console.log(fileList)
```

#### 写入文件

```typescript
await fileSystem.writeFile('/path/to/file.txt', 'Hello, World!')
```

#### 创建目录

```typescript
await fileSystem.createDirectory('/path/to/new/directory')
```

#### 搜索文件

```typescript
const results = await fileSystem.searchFiles(
  '/path/to/search',
  '*.ts',
  ['node_modules', '.git'],
)
console.log(results)
```

#### 获取文件信息

```typescript
const fileInfo = await fileSystem.getFileInfo('/path/to/file.txt')
console.log(fileInfo)
```

### 💡 技巧指南

#### 1. 批量文件操作

批量处理文件：

```typescript
async function batchProcessFiles(
  fileSystem: MCPFileSystemServer,
  directory: string,
  pattern: string,
  processor: (content: string) => string,
): Promise<void> {
  const files = await fileSystem.searchFiles(directory, pattern)
  
  for (const file of files) {
    const content = await fileSystem.readFile(file)
    const processed = processor(content)
    await fileSystem.writeFile(file, processed)
    console.log(`处理完成: ${file}`)
  }
}

// 使用示例
await batchProcessFiles(
  fileSystem,
  '/path/to/project',
  '*.ts',
  content => content.replace(/console\.log/g, 'logger.info'),
)
```

#### 2. 文件监控

监控文件变化：

```typescript
class FileWatcher {
  private fileSystem: MCPFileSystemServer
  private cache: Map<string, string> = new Map()
  private interval: NodeJS.Timeout

  constructor(fileSystem: MCPFileSystemServer, interval = 5000) {
    this.fileSystem = fileSystem
    this.interval = setInterval(() => this.checkChanges(), interval)
  }

  private async checkChanges() {
    for (const [path, cachedContent] of this.cache) {
      try {
        const currentContent = await this.fileSystem.readFile(path)
        if (currentContent !== cachedContent) {
          console.log(`文件已更改: ${path}`)
          this.cache.set(path, currentContent)
        }
      } catch (error) {
        console.error(`检查文件失败: ${path}`, error)
      }
    }
  }

  watch(path: string) {
    this.fileSystem.readFile(path).then(content => {
      this.cache.set(path, content)
    })
  }

  stop() {
    clearInterval(this.interval)
  }
}

const watcher = new FileWatcher(fileSystem)
watcher.watch('/path/to/file.txt')
```

#### 3. 文件备份

自动备份文件：

```typescript
async function backupFile(
  fileSystem: MCPFileSystemServer,
  filePath: string,
  backupDir: string,
): Promise<void> {
  const content = await fileSystem.readFile(filePath)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `${backupDir}/${filePath.split('/').pop()}.${timestamp}.bak`
  
  await fileSystem.createDirectory(backupDir)
  await fileSystem.writeFile(backupPath, content)
  console.log(`备份完成: ${backupPath}`)
}
```

### ❌ 常见错误及解决

#### 错误 1: Permission denied

**原因：** 文件权限不足

**解决方法：**
```typescript
// 检查文件权限
const fileInfo = await fileSystem.getFileInfo('/path/to/file')
console.log('文件权限:', fileInfo.permissions)

// 使用有权限的目录
const fileSystem = new MCPFileSystemServer('/path/to/allowed/directory')
```

#### 错误 2: File not found

**原因：** 文件不存在

**解决方法：**
```typescript
// 检查文件是否存在
const fileList = await fileSystem.listDirectory('/path/to/directory', false)
const fileExists = fileList.some(file => 
  file.path === '/path/to/file.txt'
)

if (!fileExists) {
  console.error('文件不存在')
  return
}

const content = await fileSystem.readFile('/path/to/file.txt')
```

#### 错误 3: Directory not allowed

**原因：** 目录不在允许的列表中

**解决方法：**
```typescript
// 列出允许的目录
const allowedDirs = await fileSystem.listAllowedDirectories()
console.log('允许的目录:', allowedDirs)

// 使用允许的目录
const fileSystem = new MCPFileSystemServer(allowedDirs[0])
```

---

## MCPPostgreSQLServer

### 📖 使用说明

MCPPostgreSQLServer 提供 PostgreSQL 数据库操作功能。

#### 基础配置

```typescript
import { MCPPostgreSQLServer } from '@bigmodel-z/sdk'

const postgres = new MCPPostgreSQLServer(
  'postgresql://username:password@host:5432/database'
)
await postgres.connect()
```

#### 执行查询

```typescript
const rows = await postgres.executeQuery('SELECT * FROM users')
console.log(rows)
```

#### 列出所有表

```typescript
const tables = await postgres.listTables()
console.log(tables)
```

#### 描述表结构

```typescript
const schema = await postgres.describeTable('users')
console.log(schema)
```

#### 创建表

```typescript
await postgres.createTable('users', {
  id: 'SERIAL PRIMARY KEY',
  name: 'VARCHAR(255) NOT NULL',
  email: 'VARCHAR(255) UNIQUE',
})
```

#### 插入数据

```typescript
await postgres.insertData('users', {
  name: 'John Doe',
  email: 'john@example.com',
})
```

### 💡 技巧指南

#### 1. 查询构建器

构建安全的查询：

```typescript
class QueryBuilder {
  private table: string
  private conditions: string[] = []
  private params: any[] = []

  constructor(table: string) {
    this.table = table
  }

  where(column: string, operator: string, value: any): this {
    this.conditions.push(`${column} ${operator} $${this.params.length + 1}`)
    this.params.push(value)
    return this
  }

  async execute(postgres: MCPPostgreSQLServer): Promise<any[]> {
    const query = `SELECT * FROM ${this.table}`
      + (this.conditions.length ? ` WHERE ${this.conditions.join(' AND ')}` : '')
      + ';'
    return await postgres.executeQuery(query, this.params)
  }
}

// 使用示例
const builder = new QueryBuilder('users')
  .where('age', '>', 18)
  .where('status', '=', 'active')

const results = await builder.execute(postgres)
```

#### 2. 事务处理

实现事务支持：

```typescript
async function executeTransaction(
  postgres: MCPPostgreSQLServer,
  operations: Array<() => Promise<void>>,
): Promise<void> {
  try {
    await postgres.executeQuery('BEGIN;')
    
    for (const operation of operations) {
      await operation()
    }
    
    await postgres.executeQuery('COMMIT;')
  } catch (error) {
    await postgres.executeQuery('ROLLBACK;')
    throw error
  }
}

// 使用示例
await executeTransaction(postgres, [
  async () => {
    await postgres.insertData('users', { name: 'Alice' })
  },
  async () => {
    await postgres.insertData('logs', { action: 'create_user' })
  },
])
```

#### 3. 连接池

实现连接池：

```typescript
class ConnectionPool {
  private connections: MCPPostgreSQLServer[] = []
  private maxConnections = 5
  private activeConnections = 0

  async getConnection(): Promise<MCPPostgreSQLServer> {
    if (this.connections.length > 0) {
      return this.connections.pop()!
    }
    
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++
      return new MCPPostgreSQLServer(connectionString)
    }
    
    throw new Error('连接池已满')
  }

  releaseConnection(connection: MCPPostgreSQLServer): void {
    this.connections.push(connection)
  }
}
```

### ❌ 常见错误及解决

#### 错误 1: Connection refused

**原因：** 数据库未启动或连接信息错误

**解决方法：**
```typescript
// 检查连接字符串
const connectionString = 'postgresql://username:password@host:5432/database'

// 测试连接
try {
  const postgres = new MCPPostgreSQLServer(connectionString)
  await postgres.connect()
  console.log('连接成功')
} catch (error) {
  console.error('连接失败:', error.message)
  console.log('请检查:')
  console.log('1. 数据库是否启动')
  console.log('2. 主机地址是否正确')
  console.log('3. 端口是否正确')
  console.log('4. 用户名和密码是否正确')
  console.log('5. 数据库名称是否正确')
}
```

#### 错误 2: Table does not exist

**原因：** 表不存在

**解决方法：**
```typescript
// 列出所有表
const tables = await postgres.listTables()
console.log('可用的表:', tables)

// 检查表是否存在
if (!tables.includes('users')) {
  console.error('表 users 不存在')
  // 创建表
  await postgres.createTable('users', {
    id: 'SERIAL PRIMARY KEY',
    name: 'VARCHAR(255) NOT NULL',
  })
}
```

#### 错误 3: Syntax error

**原因：** SQL 语法错误

**解决方法：**
```typescript
// 使用参数化查询防止 SQL 注入
async function safeQuery(
  postgres: MCPPostgreSQLServer,
  query: string,
  params: any[] = [],
): Promise<any[]> {
  try {
    return await postgres.executeQuery(query, params)
  } catch (error) {
    console.error('查询失败:', error.message)
    console.log('查询:', query)
    console.log('参数:', params)
    throw error
  }
}

// 使用示例
const results = await safeQuery(
  postgres,
  'SELECT * FROM users WHERE name = $1',
  ['John Doe'],
)
```

---

## MCPBraveSearchServer

### 📖 使用说明

MCPBraveSearchServer 提供 Brave 搜索功能。

#### 基础配置

```typescript
import { MCPBraveSearchServer } from '@bigmodel-z/sdk'

const braveSearch = new MCPBraveSearchServer('your-brave-api-key')
await braveSearch.connect()
```

#### 执行搜索

```typescript
const results = await braveSearch.search('BigModel-Z.ai SDK')
console.log(results)
```

#### 带偏移量的搜索

```typescript
const results = await braveSearch.searchWithOffset(
  'BigModel-Z.ai SDK',
  10, // offset
)
console.log(results)
```

### 💡 技巧指南

#### 1. 搜索结果缓存

缓存搜索结果：

```typescript
class SearchCache {
  private cache: Map<string, { results: any; timestamp: number }> = new Map()
  private ttl = 3600000 // 1 小时

  async search(
    braveSearch: MCPBraveSearchServer,
    query: string,
  ): Promise<any> {
    const cached = this.cache.get(query)
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      console.log('使用缓存的搜索结果')
      return cached.results
    }

    const results = await braveSearch.search(query)
    this.cache.set(query, { results, timestamp: Date.now() })
    return results
  }
}

const cache = new SearchCache()
const results = await cache.search(braveSearch, 'BigModel-Z.ai SDK')
```

#### 2. 搜索结果过滤

过滤搜索结果：

```typescript
function filterResults(results: any[], filters: {
  domain?: string
  keywords?: string[]
}): any[] {
  return results.filter(result => {
    if (filters.domain && !result.url.includes(filters.domain)) {
      return false
    }
    if (filters.keywords) {
      const hasKeyword = filters.keywords.some(keyword =>
        result.title.toLowerCase().includes(keyword.toLowerCase()) ||
        result.snippet.toLowerCase().includes(keyword.toLowerCase())
      )
      if (!hasKeyword) {
        return false
      }
    }
    return true
  })
}

// 使用示例
const results = await braveSearch.search('TypeScript')
const filtered = filterResults(results, {
  domain: 'github.com',
  keywords: ['tutorial', 'guide'],
})
```

#### 3. 批量搜索

批量执行搜索：

```typescript
async function batchSearch(
  braveSearch: MCPBraveSearchServer,
  queries: string[],
  delay = 1000,
): Promise<Map<string, any>> {
  const results = new Map<string, any>()

  for (const query of queries) {
    try {
      const result = await braveSearch.search(query)
      results.set(query, result)
      console.log(`搜索完成: ${query}`)
    } catch (error) {
      console.error(`搜索失败: ${query}`, error)
    }
    
    // 避免请求过于频繁
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return results
}

// 使用示例
const results = await batchSearch(braveSearch, [
  'TypeScript',
  'React',
  'Node.js',
])
```

### ❌ 常见错误及解决

#### 错误 1: Invalid API key

**原因：** API Key 无效

**解决方法：**
```typescript
// 验证 API Key
function validateApiKey(apiKey: string): boolean {
  return apiKey.length > 0 && !apiKey.includes('your-brave-api-key')
}

const apiKey = 'your-brave-api-key'
if (!validateApiKey(apiKey)) {
  console.error('无效的 API Key')
  console.log('请访问 https://brave.com/search/api/ 获取 API Key')
  return
}

const braveSearch = new MCPBraveSearchServer(apiKey)
```

#### 错误 2: Rate limit exceeded

**原因：** 请求频率超限

**解决方法：**
```typescript
class RateLimitedSearch {
  private lastRequestTime = 0
  private minInterval = 1000 // 1 秒

  async search(
    braveSearch: MCPBraveSearchServer,
    query: string,
  ): Promise<any> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime

    if (elapsed < this.minInterval) {
      const waitTime = this.minInterval - elapsed
      console.log(`等待 ${waitTime}ms 以避免超限`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
    return await braveSearch.search(query)
  }
}

const limitedSearch = new RateLimitedSearch()
const results = await limitedSearch.search(braveSearch, 'BigModel-Z.ai SDK')
```

#### 错误 3: No results found

**原因：** 搜索无结果

**解决方法：**
```typescript
async function searchWithFallback(
  braveSearch: MCPBraveSearchServer,
  query: string,
  maxRetries = 3,
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    const results = await braveSearch.search(query)
    
    if (results.length > 0) {
      return results
    }
    
    console.log(`搜索无结果，尝试 ${i + 1}/${maxRetries}`)
    
    // 尝试不同的查询
    const alternativeQueries = [
      query,
      query.split(' ').join('+'),
      query.toLowerCase(),
    ]
    
    if (i < alternativeQueries.length - 1) {
      const altResults = await braveSearch.search(alternativeQueries[i + 1])
      if (altResults.length > 0) {
        return altResults
      }
    }
  }
  
  console.warn('所有搜索尝试均无结果')
  return []
}
```

---

## MCPDockerServer

### 📖 使用说明

MCPDockerServer 提供 Docker 容器管理功能。

#### 基础配置

```typescript
import { MCPDockerServer } from '@bigmodel-z/sdk'

const docker = new MCPDockerServer('unix:///var/run/docker.sock')
await docker.connect()
```

#### 列出容器

```typescript
const containers = await docker.listContainers()
console.log(containers)
```

#### 启动容器

```typescript
await docker.startContainer('container-id')
```

#### 停止容器

```typescript
await docker.stopContainer('container-id')
```

#### 删除容器

```typescript
await docker.removeContainer('container-id')
```

### 💡 技巧指南

#### 1. 容器监控

监控容器状态：

```typescript
class ContainerMonitor {
  private docker: MCPDockerServer
  private interval: NodeJS.Timeout

  constructor(docker: MCPDockerServer, interval = 5000) {
    this.docker = docker
    this.interval = setInterval(() => this.checkContainers(), interval)
  }

  private async checkContainers() {
    const containers = await this.docker.listContainers()
    
    for (const container of containers) {
      const status = container.state
      if (status !== 'running') {
        console.warn(`容器 ${container.name} 状态异常: ${status}`)
      }
    }
  }

  stop() {
    clearInterval(this.interval)
  }
}

const monitor = new ContainerMonitor(docker)
```

#### 2. 批量操作

批量管理容器：

```typescript
async function batchContainerOperation(
  docker: MCPDockerServer,
  containerIds: string[],
  operation: 'start' | 'stop' | 'remove',
): Promise<void> {
  const results = await Promise.allSettled(
    containerIds.map(id => {
      switch (operation) {
        case 'start':
          return docker.startContainer(id)
        case 'stop':
          return docker.stopContainer(id)
        case 'remove':
          return docker.removeContainer(id)
      }
    })
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`容器 ${containerIds[index]} ${operation} 失败:`, result.reason)
    }
  })
}

// 使用示例
await batchContainerOperation(docker, ['id1', 'id2', 'id3'], 'stop')
```

#### 3. 容器日志

收集容器日志：

```typescript
async function collectContainerLogs(
  docker: MCPDockerServer,
  containerId: string,
  tail = 100,
): Promise<string> {
  try {
    const logs = await docker.getContainerLogs(containerId, tail)
    return logs
  } catch (error) {
    console.error('获取日志失败:', error)
    return ''
  }
}
```

### ❌ 常见错误及解决

#### 错误 1: Cannot connect to Docker daemon

**原因：** Docker 未启动或 socket 路径错误

**解决方法：**
```typescript
// 检查 Docker 是否运行
import { exec } from 'child_process'

function checkDockerStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('docker ps', (error) => {
      resolve(!error)
    })
  })
}

const isRunning = await checkDockerStatus()
if (!isRunning) {
  console.error('Docker 未运行，请先启动 Docker')
  return
}

const docker = new MCPDockerServer('unix:///var/run/docker.sock')
```

#### 错误 2: Container not found

**原因：** 容器不存在

**解决方法：**
```typescript
// 列出所有容器
const containers = await docker.listContainers()
const containerIds = containers.map(c => c.id)

if (!containerIds.includes('container-id')) {
  console.error('容器不存在')
  console.log('可用的容器:', containerIds)
  return
}

await docker.startContainer('container-id')
```

#### 错误 3: Permission denied

**原因：** 权限不足

**解决方法：**
```typescript
// 将用户添加到 docker 组
// sudo usermod -aG docker $USER

// 或使用 sudo 运行
const docker = new MCPDockerServer('unix:///var/run/docker.sock')
```

---

## MCPGitHubServer

### 📖 使用说明

MCPGitHubServer 提供 GitHub 仓库管理功能。

#### 基础配置

```typescript
import { MCPGitHubServer } from '@bigmodel-z/sdk'

const github = new MCPGitHubServer('your-github-pat')
await github.connect()
```

#### 列出仓库

```typescript
const repos = await github.listRepositories()
console.log(repos)
```

#### 获取仓库信息

```typescript
const repoInfo = await github.getRepositoryInfo('owner', 'repo')
console.log(repoInfo)
```

#### 创建仓库

```typescript
await github.createRepository({
  name: 'new-repo',
  description: 'New repository',
  private: false,
})
```

### 💡 技巧指南

#### 1. 仓库同步

同步多个仓库：

```typescript
async function syncRepositories(
  github: MCPGitHubServer,
  repoConfigs: Array<{ owner: string; repo: string }>,
): Promise<void> {
  for (const config of repoConfigs) {
    try {
      const info = await github.getRepositoryInfo(config.owner, config.repo)
      console.log(`同步完成: ${config.owner}/${config.repo}`)
    } catch (error) {
      console.error(`同步失败: ${config.owner}/${config.repo}`, error)
    }
  }
}

// 使用示例
await syncRepositories(github, [
  { owner: 'user1', repo: 'repo1' },
  { owner: 'user2', repo: 'repo2' },
])
```

#### 2. 批量操作

批量执行 GitHub 操作：

```typescript
async function batchGitHubOperation<T>(
  github: MCPGitHubServer,
  operations: Array<() => Promise<T>>,
): Promise<Array<{ success: boolean; result?: T; error?: any }>> {
  const results = await Promise.allSettled(operations)
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, result: result.value }
    } else {
      return { success: false, error: result.reason }
    }
  })
}

// 使用示例
const results = await batchGitHubOperation(github, [
  () => github.getRepositoryInfo('owner', 'repo1'),
  () => github.getRepositoryInfo('owner', 'repo2'),
  () => github.listRepositories(),
])
```

### ❌ 常见错误及解决

#### 错误 1: Bad credentials

**原因：** PAT 无效或已过期

**解决方法：**
```typescript
// 验证 PAT
function validatePAT(pat: string): boolean {
  return pat.startsWith('github_pat_') && pat.length > 50
}

const pat = 'your-github-pat'
if (!validatePAT(pat)) {
  console.error('无效的 GitHub PAT')
  console.log('请访问 https://github.com/settings/tokens 生成新的 PAT')
  return
}

const github = new MCPGitHubServer(pat)
```

#### 错误 2: Repository not found

**原因：** 仓库不存在或无权限访问

**解决方法：**
```typescript
// 列出可访问的仓库
const repos = await github.listRepositories()
console.log('可访问的仓库:', repos.map(r => r.full_name))

// 检查仓库是否存在
const repoExists = repos.some(r => r.full_name === 'owner/repo')
if (!repoExists) {
  console.error('仓库不存在或无权限访问')
  return
}

const info = await github.getRepositoryInfo('owner', 'repo')
```

#### 错误 3: Rate limit exceeded

**原因：** 请求频率超限

**解决方法：**
```typescript
class RateLimitedGitHub {
  private github: MCPGitHubServer
  private lastRequestTime = 0
  private minInterval = 1000

  constructor(github: MCPGitHubServer) {
    this.github = github
  }

  async request<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime

    if (elapsed < this.minInterval) {
      const waitTime = this.minInterval - elapsed
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
    return await fn()
  }
}

const limitedGitHub = new RateLimitedGitHub(github)
const repos = await limitedGitHub.request(() => github.listRepositories())
```

---

## YYC3CNServer

### 📖 使用说明

YYC3CNServer 是 YYC3-CN 增强版 MCP 服务器，提供 20 个 AI 辅助开发工具。

#### 基础配置

```typescript
import { YYC3CNServer } from '@bigmodel-z/sdk'

const yyc3cn = new YYC3CNServer({
  serverPath: '/path/to/yyc3-cn-mcp-server.js',
  mode: 'development',
  version: 'latest',
})
await yyc3cn.connect()
```

#### 应用界面分析

```typescript
const result = await yyc3cn.uiAnalysis({
  imagePath: '/path/to/screenshot.png',
  analysisType: 'ux_design',
  appVersion: 'latest',
})
console.log(result)
```

#### 代码审查

```typescript
const result = await yyc3cn.codeReview({
  codePath: '/path/to/code.ts',
  language: 'typescript',
  focus: 'ai_integration',
})
console.log(result)
```

### 💡 技巧指南

#### 1. 工具选择器

根据任务类型选择合适的工具：

```typescript
function selectTool(task: string): string {
  const tools = {
    ui: 'uiAnalysis',
    code: 'codeReview',
    prompt: 'aiPromptOptimizer',
    feature: 'featureGenerator',
    localization: 'localizationChecker',
    api: 'apiGenerator',
    database: 'databaseDesigner',
    component: 'componentBuilder',
    test: 'testGenerator',
    review: 'enhancedCodeReview',
    collaboration: 'collaborationWorkspace',
    performance: 'performanceAnalyzer',
    docs: 'documentationBuilder',
    refactor: 'codeRefactor',
    session: 'codeReviewSession',
    project: 'teamCoding',
    pair: 'pairProgramming',
    conflict: 'conflictResolver',
  }
  return tools[task] || tools.code
}

// 使用示例
const tool = selectTool('ui')
const result = await yyc3cn[tool]({ /* params */ })
```

#### 2. 批量代码审查

批量审查多个文件：

```typescript
async function batchCodeReview(
  yyc3cn: YYC3CNServer,
  files: string[],
  language: string,
  focus: string,
): Promise<Map<string, any>> {
  const results = new Map<string, any>()
  
  for (const file of files) {
    try {
      const result = await yyc3cn.codeReview({
        codePath: file,
        language,
        focus,
      })
      results.set(file, result)
      console.log(`审查完成: ${file}`)
    } catch (error) {
      console.error(`审查失败: ${file}`, error)
    }
  }
  
  return results
}

// 使用示例
const results = await batchCodeReview(
  yyc3cn,
  ['/path/to/file1.ts', '/path/to/file2.ts'],
  'typescript',
  'ai_integration',
)
```

### ❌ 常见错误及解决

#### 错误 1: Server not found

**原因：** 服务器路径错误

**解决方法：**
```typescript
import fs from 'fs'

const serverPath = '/path/to/yyc3-cn-mcp-server.js'

if (!fs.existsSync(serverPath)) {
  console.error('YYC3-CN 服务器文件不存在:', serverPath)
  console.log('请检查路径是否正确')
  return
}

const yyc3cn = new YYC3CNServer({
  serverPath,
  mode: 'development',
  version: 'latest',
})
```

#### 错误 2: Tool not found

**原因：** 工具名称错误

**解决方法：**
```typescript
// 列出所有可用工具
const tools = await yyc3cn.listAllTools()
console.log('可用工具:', tools.map(t => t.name))

// 使用正确的工具名称
const result = await yyc3cn.uiAnalysis({
  imagePath: '/path/to/screenshot.png',
  analysisType: 'ux_design',
})
```

#### 错误 3: Invalid parameter

**原因：** 参数格式错误

**解决方法：**
```typescript
// 参数验证
function validateParams(params: any, schema: any): boolean {
  for (const key in schema) {
    if (!(key in params)) {
      throw new Error(`缺少必需参数: ${key}`)
    }
    if (typeof params[key] !== schema[key]) {
      throw new Error(`参数类型错误: ${key} 应为 ${schema[key]}`)
    }
  }
  return true
}

// 使用示例
validateParams(params, {
  imagePath: 'string',
  analysisType: 'string',
  appVersion: 'string',
})

const result = await yyc3cn.uiAnalysis(params)
```

---

## 常见问题

### Q1: 如何选择合适的 MCP 服务器？

**A:** 根据需求选择：
- 文件操作 → MCPFileSystemServer
- 数据库操作 → MCPPostgreSQLServer
- 网络搜索 → MCPBraveSearchServer
- 容器管理 → MCPDockerServer
- 代码托管 → MCPGitHubServer
- AI 辅助开发 → YYC3CNServer

### Q2: 如何处理连接失败？

**A:** 实现重试机制：
```typescript
async function connectWithRetry(
  server: MCPClient,
  maxRetries = 3,
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await server.connect()
      return
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      )
    }
  }
}
```

### Q3: 如何监控 MCP 服务器状态？

**A:** 使用 MCPManager 的状态监控：
```typescript
class MCPMonitor {
  private manager: MCPManager
  private status: Map<string, boolean> = new Map()

  constructor(manager: MCPManager) {
    this.manager = manager
    this.startMonitoring()
  }

  private async startMonitoring() {
    setInterval(async () => {
      const servers = this.manager.listServers()
      for (const server of servers) {
        try {
          await this.manager.getServerInfo(server)
          this.status.set(server, true)
        } catch {
          this.status.set(server, false)
        }
      }
    }, 30000)
  }
}
```

### Q4: 如何优化 MCP 服务器性能？

**A:** 使用以下优化策略：
1. **连接池** - 复用连接
2. **批量操作** - 减少请求次数
3. **缓存** - 缓存常用结果
4. **异步处理** - 使用异步操作
5. **限流** - 避免请求过于频繁

### Q5: 如何调试 MCP 服务器？

**A:** 使用日志记录：
```typescript
class MCPDebugger {
  private log: Array<{ timestamp: number; server: string; action: string; data: any }> = []

  logAction(server: string, action: string, data: any): void {
    this.log.push({
      timestamp: Date.now(),
      server,
      action,
      data,
    })
    console.log(`[${server}] ${action}:`, data)
  }

  getLog(): any[] {
    return this.log
  }

  exportLog(): string {
    return JSON.stringify(this.log, null, 2)
  }
}

const debugger = new MCPDebugger()
debugger.logAction('filesystem', 'readFile', { path: '/path/to/file' })
```

---

## 🔗 相关文档

- [BigModel-Z.ai SDK README](../README.md)
- [Core 模块文档](../core/README.md)
- [Examples 使用指南](../examples/README.md)
- [Hooks 使用指南](../hooks/README.md)
