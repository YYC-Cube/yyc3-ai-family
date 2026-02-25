# MCP 服务器配置指南

> GLM Coding Plan 提供四大专属 MCP 服务器，增强您的编程工具能力。

## 什么是 MCP？

MCP (Model Context Protocol) 是一种标准协议，允许 AI 工具访问外部能力和数据源。通过 MCP，您可以：

- 分析项目中的图片和截图
- 联网搜索最新信息
- 读取和解析网页内容
- 访问开源仓库代码

---

## MCP 服务器概览

| MCP 服务器 | 功能 | 适用场景 |
|-----------|------|---------|
| 视觉理解 MCP | 图像分析、截图解读 | UI 设计、错误截图分析 |
| 联网搜索 MCP | 实时搜索、技术文档查找 | 技术查询、文档搜索 |
| 网页读取 MCP | 网页内容提取、结构化解析 | 数据抓取、内容分析 |
| 开源仓库 MCP | GitHub/GitLab 代码访问 | 代码学习、依赖分析 |

---

## 通用配置

### API Key

所有 MCP 服务器使用相同的 API Key：
- 获取地址：https://bigmodel.cn/usercenter/proj-mgmt/apikeys
- 在工具配置中填入即可

### 支持的工具

- Claude Code
- Cline
- OpenCode
- OpenClaw
- TRAE

---

## 详细配置

### 视觉理解 MCP (Vision MCP)

#### 功能

- 分析项目截图和设计稿
- 识别错误信息截图
- 解析 UI 界面图片
- 提取图片中的文本和元素

#### Claude Code 配置

**配置文件 ~/.claude/settings.json**
```json
{
  "mcpServers": {
    "zai-vision-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/vision_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

#### Cline 配置

**VS Code settings.json**
```json
{
  "mcpServers": {
    "zai-vision-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/vision_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

#### OpenCode 配置

**配置文件 ~/.config/opencode/opencode.json**
```json
{
  "mcp": {
    "zai-vision-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/vision_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

[详细文档](../BigModel/编码套餐/MCP服务器/视觉理解MCP.md)

---

### 联网搜索 MCP (Search MCP)

#### 功能

- 实时搜索技术文档
- 查找代码示例和解决方案
- 获取最新的 API 文档
- 搜索 Stack Overflow 和 GitHub

#### Claude Code 配置

**配置文件 ~/.claude/settings.json**
```json
{
  "mcpServers": {
    "zai-search-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/search_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

#### Cline 配置

**VS Code settings.json**
```json
{
  "mcpServers": {
    "zai-search-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/search_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

[详细文档](../BigModel/编码套餐/MCP服务器/联网搜索MCP.md)

---

### 网页读取 MCP (Reader MCP)

#### 功能

- 读取网页内容
- 提取网页结构化数据
- 解析 HTML 内容
- 处理动态网页

#### Claude Code 配置

**配置文件 ~/.claude/settings.json**
```json
{
  "mcpServers": {
    "zai-reader-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/reader_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

#### Cline 配置

**VS Code settings.json**
```json
{
  "mcpServers": {
    "zai-reader-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/reader_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

[详细文档](../BigModel/编码套餐/MCP服务器/网页读取MCP.md)

---

### 开源仓库 MCP (ZRead MCP)

#### 功能

- 访问 GitHub 仓库
- 读取项目文件结构
- 查看代码实现
- 分析依赖关系

#### Claude Code 配置

**配置文件 ~/.claude/settings.json**
```json
{
  "mcpServers": {
    "zai-zread-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/zread_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

#### Cline 配置

**VS Code settings.json**
```json
{
  "mcpServers": {
    "zai-zread-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/zread_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

[详细文档](../BigModel/编码套餐/MCP服务器/开源仓库MCP.md)

---

## 完整配置示例

### Claude Code - 启用所有 MCP

**配置文件 ~/.claude/settings.json**
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5"
  },
  "mcpServers": {
    "zai-vision-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/vision_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    },
    "zai-search-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/search_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    },
    "zai-reader-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/reader_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    },
    "zai-zread-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/zread_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

### Cline - 启用所有 MCP

**VS Code settings.json**
```json
{
  "mcpServers": {
    "zai-vision-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/vision_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    },
    "zai-search-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/search_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    },
    "zai-reader-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/reader_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    },
    "zai-zread-mcp": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/zread_mcp_server/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  },
  "apiProvider": "Z AI",
  "zaiEntrypoint": "China Coding Plan (https://open.bigmodel.cn/api/coding/paas/v4)",
  "zaiApiKey": "your_api_key",
  "model": "glm-5"
}
```

---

## 使用示例

### 视觉理解 MCP 使用

```
用户：帮我分析这个错误截图
[上传 error.png]
AI：通过视觉理解 MCP 分析图片...
```

### 联网搜索 MCP 使用

```
用户：搜索 React 18 的最新文档
AI：通过联网搜索 MCP 查找...
```

### 网页读取 MCP 使用

```
用户：读取 https://example.com 的内容
AI：通过网页读取 MCP 提取内容...
```

### 开源仓库 MCP 使用

```
用户：查看 facebook/react 仓库的结构
AI：通过开源仓库 MCP 访问 GitHub...
```

---

## 故障排除

### MCP 连接失败

**问题**: MCP 服务器无法连接

**解决方案**:
1. 检查 API Key 是否正确
2. 确认网络连接正常
3. 验证 MCP URL 是否正确
4. 查看工具日志获取详细错误

### MCP 功能不可用

**问题**: 配置后 MCP 工具不显示

**解决方案**:
1. 重启工具
2. 检查配置文件格式是否正确
3. 确认工具支持 MCP 协议
4. 查看工具是否加载了 MCP 插件

### 速率限制

**问题**: MCP 调用频繁失败

**解决方案**:
1. 降低调用频率
2. 查看套餐额度使用情况
3. 考虑升级到更高套餐

---

## 最佳实践

### 选择合适的 MCP

- **图片分析** → 视觉理解 MCP
- **技术查询** → 联网搜索 MCP
- **网页抓取** → 网页读取 MCP
- **代码学习** → 开源仓库 MCP

### 优化性能

- 按需启用 MCP，避免全部开启
- 使用缓存减少重复请求
- 合理控制请求频率

### 安全建议

- 不要在公开仓库中提交配置文件
- 定期更换 API Key
- 监控 MCP 使用情况

---

## 相关链接

- [BigModel API 文档](../BigModel/) - 完整 API 文档
- [开发工具配置](./开发工具配置.md) - 工具配置指南
- [最佳实践](./最佳实践.md) - 使用技巧
- [常见问题](./常见问题.md) - FAQ
