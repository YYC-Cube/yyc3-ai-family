# 🔍 MCP服务器状态检查方法

## 📊 MCP服务器状态检查方法

我已经为您创建了一个完整的状态检查脚本并运行了。以下是确定MCP服务器现状的多种方法：

### ✅ 方法1: 使用自动化状态检查脚本（推荐）

```bash
# 运行状态检查脚本
/Users/yanyu/yyc3-claude/automation-scripts/check-mcp-status.sh
```

**当前检查结果**：

- 📱 Claude Desktop: 未运行
- 📄 配置文件: ✅ 正常（已配置8个MCP服务器）
- 🔧 自定义服务器: ✅ 已构建（28KB）
- 🟢 Node.js: ⚠️ 版本v20.19.5（建议升级到v24+）
- 📦 npm/npx: ✅ 正常
- 🐳 Docker: ✅ 正常运行
- 🔐 环境变量: ✅ 全部配置完成
- 🌐 网络连接: ✅ 数据库可达
- 📝 日志: ⚠️ 最近有20个错误
- ⚙️ MCP进程: ✅ 发现3个相关进程

**系统健康度: 80%** ✅ 状态良好

---

### ✅ 方法2: 在Claude Desktop中查看

1. **启动Claude Desktop**

   ```bash
   open -a Claude
   ```

2. **查看MCP服务器列表**
   - 打开Claude Desktop
   - 点击设置（齿轮图标）
   - 找到"MCP Servers"或"Model Context Protocol"部分
   - 查看已配置的服务器及其状态

3. **测试服务器连接**
   - 在Claude聊天中输入测试请求
   - 例如："使用文件系统工具列出当前目录"
   - 观察是否成功调用MCP工具

---

### ✅ 方法3: 查看日志文件

```bash
# 查看Claude主日志
tail -100 ~/Library/Logs/Claude/main.log

# 查看MCP相关日志
grep -i "mcp" ~/Library/Logs/Claude/main.log | tail -50

# 查看错误日志
grep -i "error" ~/Library/Logs/Claude/main.log | tail -20

# 查看特定服务器日志
ls -la ~/Library/Logs/Claude/ | grep mcp
```

---

### ✅ 方法4: 手动测试各个服务器

#### 测试claude-prompts服务器

```bash
# 直接运行服务器测试
cd /Users/yanyu/yyc3-claude/claude-prompts-mcp/server
node dist/index.js --help

# 测试MCP协议连接
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js
```

#### 测试GitHub服务器

```bash
# 测试GitHub令牌
curl -H "Authorization: token $(grep GITHUB_PERSONAL_ACCESS_TOKEN /Users/yanyu/yyc3-claude/.env.mcp | cut -d'=' -f2)" \
  https://api.github.com/user
```

#### 测试数据库连接

```bash
# 测试PostgreSQL连接
PGPASSWORD=$(grep DATABASE_URL /Users/yanyu/yyc3-claude/.env.mcp | cut -d'=' -f2 | cut -d':' -f3) \
  psql -h 192.168.3.45 -U yyc3_33 -d yyc3_mcp -c "SELECT version();"
```

#### 测试Brave搜索

```bash
# 测试Brave API
curl -X GET "https://api.search.brave.com/res/v1/web/search?q=test" \
  -H "Accept: application/json" \
  -H "X-Subscription-Token: $(grep BRAVE_API_KEY /Users/yanyu/yyc3-claude/.env.mcp | cut -d'=' -f2)"
```

---

### ✅ 方法5: 检查进程状态

```bash
# 查看所有MCP相关进程
ps aux | grep -E "(mcp|claude-prompts)" | grep -v grep

# 查看Claude进程
ps aux | grep -i claude | grep -v grep

# 查看Node.js进程
ps aux | grep node | grep -v grep

# 实时监控进程
watch -n 2 'ps aux | grep -E "(mcp|claude)" | grep -v grep'
```

---

### ✅ 方法6: 验证配置文件

```bash
# 查看配置文件内容
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# 验证JSON格式
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python3 -m json.tool > /dev/null && echo "JSON格式正确" || echo "JSON格式错误"

# 统计配置的服务器数量
python3 -c "import json; config=json.load(open('$HOME/Library/Application Support/Claude/claude_desktop_config.json')); print(f'已配置 {len(config.get(\"mcpServers\", {}))} 个MCP服务器')"
```

---

### 📋 当前状态总结

根据检查结果，您的MCP服务器配置如下：

| 服务器名称 | 类型 | 状态 | 说明 |
|-----------|------|------|------|
| yyc3-cn-assistant | 本地 | ✅ 配置完成 | 中文助手服务器 |
| claude-prompts | 本地 | ✅ 已构建 | 提示词管理服务器 |
| mcp-github-yyc3 | NPX | ✅ 配置完成 | GitHub集成 |
| mcp-filesystem | NPX | ✅ 配置完成 | 文件系统访问 |
| mcp-brave-search | NPX | ✅ 配置完成 | 网络搜索 |
| mcp-postgres | NPX | ✅ 配置完成 | 数据库访问 |
| mcp-docker | Docker | ✅ 配置完成 | Docker管理 |
| (其他) | - | ✅ 配置完成 | 共8个服务器 |

---

### 🔧 建议的下一步操作

1. **启动Claude Desktop**

   ```bash
   open -a Claude
   ```

2. **在Claude中验证MCP服务器**
   - 打开设置 → MCP Servers
   - 确认所有服务器显示为"已连接"状态

3. **测试MCP功能**
   - 在Claude中输入："列出当前目录的文件"
   - 验证文件系统工具是否正常工作

4. **查看日志（如有问题）**

   ```bash
   tail -f ~/Library/Logs/Claude/main.log
   ```

5. **定期运行状态检查**

   ```bash
   # 可以设置定时任务
   crontab -e
   # 添加: 0 */6 * * * /Users/yanyu/yyc3-claude/automation-scripts/check-mcp-status.sh >> /tmp/mcp-status.log 2>&1
   ```

---

### 📚 相关文档

- [MCP服务器完整操作指导文档](file:///Users/yanyu/yyc3-claude/automation-scripts/MCP-SERVERS-OPERATION-GUIDE.md)
- [自动化脚本使用指南](file:///Users/yanyu/yyc3-claude/automation-scripts/AUTOMATION-SCRIPTS-GUIDE.md)
