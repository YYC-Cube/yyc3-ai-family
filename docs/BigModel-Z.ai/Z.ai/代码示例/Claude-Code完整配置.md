# Claude Code 完整配置示例

## 环境变量配置

### macOS/Linux

在 `~/.zshrc` 或 `~/.bashrc` 中添加：

```bash
export ANTHROPIC_AUTH_TOKEN="your_api_key_here"
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
export API_TIMEOUT_MS="3000000"
```

执行生效：
```bash
source ~/.zshrc
```

### Windows PowerShell

在 PowerShell Profile 中添加：

```powershell
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'your_api_key_here', 'User')
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_BASE_URL', 'https://open.bigmodel.cn/api/anthropic', 'User')
```

## 配置文件 ~/.claude/settings.json

### 基础配置

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_api_key_here",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000"
  }
}
```

### 完整配置（包含 MCP 和模型映射）

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_api_key_here",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5",
    "API_TIMEOUT_MS": "3000000"
  },
  "mcpServers": {
    "zai-vision-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/vision_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key_here"
      }
    },
    "zai-search-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/search_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key_here"
      }
    },
    "zai-reader-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/reader_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key_here"
      }
    },
    "zai-zread-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/zread_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key_here"
      }
    }
  },
  "preferences": {
    "autoAccept": false,
    "language": "zh-CN"
  }
}
```

## Rules 配置

### 编码规范 Rule

创建文件 `~/.claude/rules/coding-standards.md`：

```markdown
# 编码规范 Rule

## 命名规范
- 变量名使用 camelCase
- 常量名使用 UPPER_SNAKE_CASE
- 类名使用 PascalCase
- 函数名使用 camelCase

## 代码风格
- 遵循项目现有的代码风格
- 添加必要的注释
- 保持函数简洁（单函数不超过 50 行）
- 避免过度嵌套（嵌套层级不超过 3 层）

## 错误处理
- 所有外部调用必须添加错误处理
- 使用适当的异常类型
- 提供有意义的错误消息

## 测试要求
- 为新功能编写单元测试
- 测试覆盖率不低于 80%
- 包含边界情况测试
```

### 性能优化 Rule

创建文件 `~/.claude/rules/performance-optimization.md`：

```markdown
# 性能优化 Rule

## 通用原则
1. 避免不必要的循环嵌套
2. 使用适当的数据结构
3. 考虑时间复杂度
4. 及时释放资源

## Python 特定
1. 使用列表推导式代替 map/filter
2. 使用生成器处理大数据
3. 避免在循环中重复计算
4. 使用内置函数（sum, max, min 等）

## JavaScript 特定
1. 避免频繁的 DOM 操作
2. 使用事件委托
3. 考虑使用 Web Worker
4. 合理使用 async/await
```

## 使用示例

### 基础对话

```bash
claude
```

在 Claude Code 中输入：

```
你好，请介绍一下自己
```

### 代码生成

```
请帮我生成一个 Python 的快速排序函数

要求：
1. 函数名为 quick_sort
2. 输入参数为列表 arr
3. 返回排序后的列表
4. 包含错误处理
5. 添加必要的注释
```

### 使用 MCP

#### 视觉理解 MCP

```
请分析这个截图 [上传图片]
```

#### 联网搜索 MCP

```
请搜索 React 18 的最新文档
```

#### 网页读取 MCP

```
请读取 https://example.com 的内容
```

#### 开源仓库 MCP

```
请查看 facebook/react 仓库的结构
```

## 验证配置

### 检查环境变量

```bash
echo $ANTHROPIC_AUTH_TOKEN
echo $ANTHROPIC_BASE_URL
```

### 检查配置文件

```bash
cat ~/.claude/settings.json
```

### 检查 Claude Code 版本

```bash
claude --version
```

### 测试连接

运行 Claude Code 并输入：

```
你好
```

如果正常回复，说明配置成功。

## 常见问题

### 401 Unauthorized

检查：
1. API Key 是否正确
2. 环境变量是否设置
3. 配置文件是否正确

### 模型不显示

检查：
1. 配置文件格式是否正确
2. 是否订阅了 Coding Plan
3. 是否设置了模型映射

### MCP 不可用

检查：
1. MCP URL 是否正确
2. API Key 是否正确
3. 网络连接是否正常

## 相关链接

- [Claude Code 官方文档](../BigModel/编码套餐/开发工具/Claude-Code.md)
- [开发工具配置](../开发工具配置.md)
- [MCP 服务器配置](../MCP服务器配置.md)
