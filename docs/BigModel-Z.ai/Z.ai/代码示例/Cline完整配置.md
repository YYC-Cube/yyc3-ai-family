# Cline 完整配置示例

## VS Code 配置

### settings.json 配置

在 VS Code 中打开设置 (Cmd+, 或 Ctrl+,)，搜索 "cline"，或者直接编辑 settings.json：

```json
{
  "cline.mcpServers": {
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
  "cline.apiProvider": "Z AI",
  "cline.zaiEntrypoint": "China Coding Plan (https://open.bigmodel.cn/api/coding/paas/v4)",
  "cline.zaiApiKey": "your_api_key_here",
  "cline.model": "glm-5",
  "cline.temperature": 0.6,
  "cline.maxTokens": 4096,
  "cline.autoAccept": false
}
```

### workspace settings.json

在项目根目录创建 `.vscode/settings.json`：

```json
{
  "cline.mcpServers": {
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
  "cline.apiProvider": "Z AI",
  "cline.zaiEntrypoint": "China Coding Plan (https://open.bigmodel.cn/api/coding/paas/v4)",
  "cline.zaiApiKey": "your_api_key_here",
  "cline.model": "glm-5"
}
```

## 使用 Cline

### 打开 Cline

1. 在 VS Code 中按 `Cmd+Shift+P` (macOS) 或 `Ctrl+Shift+P` (Windows/Linux)
2. 输入 "Cline" 选择 "Cline: Open Cline"
3. 或点击 VS Code 右侧的 Cline 图标

### 配置 Cline

首次打开 Cline 时，需要进行配置：

1. **API Provider**: 选择 "Z AI"
2. **Z AI Entrypoint**: 选择 "China Coding Plan"
3. **API Key**: 输入您的 API Key
4. **Model**: 选择 "glm-5" 或其他模型

## 使用示例

### 基础对话

在 Cline 中输入：

```
你好，请介绍一下自己
```

### 代码生成

```
请帮我生成一个 JavaScript 的快速排序函数

要求：
1. 函数名为 quickSort
2. 输入参数为数组 arr
3. 返回排序后的数组
4. 包含错误处理
5. 添加必要的注释
```

### 项目分析

```
请帮我分析这个项目的结构

重点关注：
1. 项目架构
2. 主要模块
3. 技术栈
4. 潜在的改进点
```

### 使用 MCP

#### 视觉理解 MCP

```
请分析这个截图 [上传图片]
```

#### 联网搜索 MCP

```
请搜索 Vue 3 的最新文档
```

#### 网页读取 MCP

```
请读取 https://example.com 的内容
```

#### 开源仓库 MCP

```
请查看 vuejs/core 仓库的结构
```

## 提示词模板

### 创建新功能

```
请帮我创建一个 [功能名称]

需求：
1. [需求1]
2. [需求2]
3. [需求3]

技术要求：
- 使用 [技术栈]
- 遵循 [编码规范]
- 包含错误处理
- 添加单元测试

请提供：
1. 实现代码
2. 使用说明
3. 测试用例
```

### 代码审查

```
请帮我审查这段代码

代码：
[代码片段]

审查重点：
1. 代码质量
2. 潜在的 bug
3. 性能问题
4. 最佳实践
```

### 调试错误

```
我遇到了一个错误

错误信息：
[错误堆栈]

代码：
[相关代码]

请帮我：
1. 分析错误原因
2. 提供修复方案
3. 解释修复原理
```

## 高级功能

### 自动执行任务

在 settings.json 中设置：

```json
{
  "cline.autoAccept": true
}
```

这样 Cline 会自动执行部分操作（需要谨慎使用）。

### 自定义模型

```json
{
  "cline.model": "glm-4.7"
}
```

可以根据任务复杂度切换模型：
- **简单任务**: `glm-4.5-air`
- **通用任务**: `glm-4.7`
- **复杂任务**: `glm-5`

### 温度设置

```json
{
  "cline.temperature": 0.6
}
```

- **低温度 (0.2-0.4)**: 更确定的输出
- **中温度 (0.6-0.8)**: 平衡创造性和确定性
- **高温度 (0.8-1.0)**: 更有创造性的输出

## 故障排除

### 401 Unauthorized

检查：
1. API Key 是否正确
2. API Key 是否在 settings.json 中正确配置
3. 订阅状态是否正常

### MCP 不显示

检查：
1. MCP 配置是否正确
2. 网络连接是否正常
3. 重启 VS Code

### 生成速度慢

检查：
1. 网络连接
2. 是否在高峰期
3. 任务复杂度

### 配置不生效

检查：
1. settings.json 格式是否正确
2. 是否在正确的位置（workspace 或 user settings）
3. 重启 VS Code

## 最佳实践

### 1. 使用 workspace settings

在项目根目录创建 `.vscode/settings.json`，这样配置会跟随项目：

```json
{
  "cline.apiProvider": "Z AI",
  "cline.zaiApiKey": "your_api_key_here",
  "cline.model": "glm-5"
}
```

### 2. 合理选择模型

- **代码补全**: `glm-4.5-air`
- **日常开发**: `glm-4.7`
- **架构设计**: `glm-5`

### 3. 有效使用 MCP

- **分析截图**: 视觉理解 MCP
- **技术查询**: 联网搜索 MCP
- **网页抓取**: 网页读取 MCP
- **代码学习**: 开源仓库 MCP

### 4. 编写清晰的提示词

```
请帮我 [明确任务]

具体要求：
1. [要求1]
2. [要求2]
3. [要求3]

期望输出：
[输出格式]
```

## 相关链接

- [Cline 官方文档](../BigModel/编码套餐/开发工具/Cline.md)
- [开发工具配置](../开发工具配置.md)
- [MCP 服务器配置](../MCP服务器配置.md)
- [最佳实践](../最佳实践.md)
