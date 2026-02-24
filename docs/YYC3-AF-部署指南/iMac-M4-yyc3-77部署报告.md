# YYC³ AI Family - iMac M4 (yyc3-77) 部署报告

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

**文档版本**: 1.0.0
**部署日期**: 2026-02-22
**部署状态**: ✅ 完成
**节点角色**: 辅助推理节点 / 可视化节点

---

## 📋 目录

1. [硬件配置](#1-硬件配置)
2. [网络配置](#2-网络配置)
3. [Ollama 部署](#3-ollama-部署)
4. [模型部署](#4-模型部署)
5. [智能体映射](#5-智能体映射)
6. [连接验证](#6-连接验证)
7. [运维指南](#7-运维指南)

---

## 1. 硬件配置

### 1.1 设备信息

| 项目 | 配置 |
|------|------|
| **设备型号** | iMac (Mac16,3) |
| **芯片** | Apple M4 |
| **CPU 核心** | 10 核 (4P + 6E) |
| **内存** | 32 GB |
| **存储** | 926 GB SSD |
| **序列号** | FKFX0FNM94 |

### 1.2 存储状态

| 挂载点 | 大小 | 已用 | 可用 |
|--------|------|------|------|
| / (系统) | 926 GB | 11 GB | 631 GB |
| /System/Volumes/Data | 926 GB | 287 GB | 618 GB |
| /Volumes/Max-DevCache | 1.1 TB | 15 GB | 1.1 TB |
| /Volumes/Max-PG_data | 745 GB | 258 GB | 487 GB |
| /Volumes/YYCC-Active | (同系统盘) | - | - |

### 1.3 外接存储

| 卷名 | 用途 | 状态 |
|------|------|------|
| Max-DevCache | 开发缓存 | ✅ 已挂载 |
| Max-PG_data | 数据库数据 (权限受限) | ⚠️ 只读 |
| YYCC-Active | 活跃项目 | ✅ 可用 |

---

## 2. 网络配置

### 2.1 IP 地址

| 接口 | IP 地址 | 说明 |
|------|---------|------|
| **en0** | 192.168.3.77 | 主 IP (固定) |
| en1 | 192.168.3.167 | 备用 IP |
| en1 | 192.168.3.76 | 备用 IP |
| utun6 | 10.8.0.3 | VPN 隧道 |

### 2.2 SSH 配置

```bash
# SSH 别名配置 (~/.ssh/config)
Host yyc3-77
    HostName 192.168.3.77
    User my
    IdentityFile ~/.ssh/yyc3_ed25519
    Port 22
```

### 2.3 连接方式

```bash
# 方式 1: 使用别名
ssh yyc3-77

# 方式 2: 直接连接
ssh my@192.168.3.77 -i ~/.ssh/yyc3_ed25519
```

---

## 3. Ollama 部署

### 3.1 安装信息

| 项目 | 信息 |
|------|------|
| **Ollama 版本** | 0.16.3 |
| **安装方式** | 官方安装脚本 |
| **应用路径** | /Applications/Ollama.app |
| **命令路径** | ~/.local/bin/ollama |
| **模型存储** | ~/.ollama/models |

### 3.2 配置步骤

```bash
# 1. 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. 配置命令行链接
mkdir -p ~/.local/bin
ln -sf /Applications/Ollama.app/Contents/Resources/ollama ~/.local/bin/ollama

# 3. 配置 PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 4. 启动服务
open /Applications/Ollama.app
```

### 3.3 服务验证

```bash
# 检查版本
~/.local/bin/ollama --version
# 输出: ollama version is 0.16.3

# 检查 API
curl http://localhost:11434/api/version
# 输出: {"version":"0.16.3"}

# 查看模型
~/.local/bin/ollama list
```

---

## 4. 模型部署

### 4.1 已部署模型

| 模型 | 参数量 | 大小 | 用途 | 状态 |
|------|--------|------|------|------|
| **glm4:9b** | 9B | 5.5 GB | Pivot 智能体 (核心协调) | ✅ |
| **phi3:mini** | 3.8B | 2.2 GB | Sentinel 智能体 (安全哨兵) | ✅ |
| **codegeex4:latest** | 9.4B | 5.5 GB | Bole 智能体 (代码评估) | ✅ |
| phi3:14b | 14B | 7.9 GB | Sentinel 备用 | ✅ |
| llama3:latest | 8B | 4.7 GB | 通用对话 | ✅ |
| codellama:latest | 7B | 3.8 GB | 代码生成 | ✅ |
| mixtral:latest | 47B | 26 GB | 大模型推理 | ✅ |

### 4.2 模型存储

```bash
# 存储位置
~/.ollama/models/
├── blobs/          # 模型权重文件
└── manifests/      # 模型清单

# 存储大小
du -sh ~/.ollama/models
# 输出: 52G
```

### 4.3 模型管理命令

```bash
# 拉取模型
~/.local/bin/ollama pull <model_name>

# 删除模型
~/.local/bin/ollama rm <model_name>

# 运行模型
~/.local/bin/ollama run <model_name>

# 查看模型信息
~/.local/bin/ollama show <model_name>
```

---

## 5. 智能体映射

### 5.1 智能体分配

| 智能体 | 角色 | 主模型 | 备用模型 | 部署位置 |
|--------|------|--------|----------|----------|
| **Navigator** | 领航员 | ChatGLM3-6B | Qwen2.5-7B | M4 Max |
| **Thinker** | 思想家 | DeepSeek-V3 | CodeGeeX4-9B | API + M4 Max |
| **Prophet** | 先知 | Qwen2.5-7B | DeepSeek-V3 | M4 Max |
| **Bole** | 伯乐 | CodeGeeX4-9B | Qwen2.5-7B | **iMac M4** ✅ |
| **Sentinel** | 哨兵 | Phi-3-mini | Phi-3-14B | **iMac M4** ✅ |
| **Pivot** | 天枢 | GLM4-9B | Qwen2.5-7B | **iMac M4** ✅ |
| **Grandmaster** | 宗师 | DeepSeek-V3 | Qwen2.5-14B | API + M4 Max |

### 5.2 iMac 负责的智能体

#### Bole (知遇·伯乐) - 代码评估

```bash
# 主模型: codegeex4:latest
# 用途: 模型评估与优选匹配
# API: http://192.168.3.77:11434

curl http://192.168.3.77:11434/api/generate -d '{
  "model": "codegeex4:latest",
  "prompt": "评估这段代码的质量"
}'
```

#### Sentinel (卫安·哨兵) - 安全防护

```bash
# 主模型: phi3:mini
# 用途: 安全边界防护与审计
# API: http://192.168.3.77:11434

curl http://192.168.3.77:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "检查输入安全性"
}'
```

#### Pivot (元启·天枢) - 核心协调

```bash
# 主模型: glm4:9b
# 用途: 核心状态管理与上下文
# API: http://192.168.3.77:11434

curl http://192.168.3.77:11434/api/generate -d '{
  "model": "glm4:9b",
  "prompt": "协调任务分配"
}'
```

---

## 6. 连接验证

### 6.1 本地验证 (在 iMac 上)

```bash
# 1. 检查 Ollama 服务
curl http://localhost:11434/api/version

# 2. 检查模型列表
~/.local/bin/ollama list

# 3. 测试模型推理
~/.local/bin/ollama run phi3:mini "你好"

# 4. 检查存储空间
df -h ~
du -sh ~/.ollama/models
```

### 6.2 远程验证 (从 M4 Max)

```bash
# 1. SSH 连接测试
ssh yyc3-77 "uname -a"

# 2. Ollama API 测试
curl http://192.168.3.77:11434/api/tags

# 3. 模型推理测试
curl http://192.168.3.77:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "测试",
  "stream": false
}'

# 4. 端口检测
nc -zv 192.168.3.77 11434
```

### 6.3 连接信息汇总

| 服务 | 地址 | 端口 | 状态 |
|------|------|------|------|
| SSH | 192.168.3.77 | 22 | ✅ |
| Ollama API | 192.168.3.77 | 11434 | ✅ |

---

## 7. 运维指南

### 7.1 服务管理

```bash
# 启动 Ollama
open /Applications/Ollama.app

# 停止 Ollama
pkill -f Ollama

# 重启 Ollama
pkill -f Ollama && sleep 2 && open /Applications/Ollama.app

# 检查服务状态
ps aux | grep -i ollama
curl http://localhost:11434/api/version
```

### 7.2 日志查看

```bash
# Ollama 日志
tail -f ~/.ollama/logs/server.log

# 系统日志
log show --predicate 'process == "ollama"' --last 1h
```

### 7.3 存储管理

```bash
# 查看模型存储
du -sh ~/.ollama/models
du -sh ~/.ollama/models/blobs

# 清理未使用的模型
~/.local/bin/ollama rm <unused_model>

# 检查磁盘空间
df -h ~
```

### 7.4 性能监控

```bash
# CPU 使用
top -l 1 | grep "CPU usage"

# 内存使用
vm_stat | head -5

# GPU 使用 (Apple Silicon)
sudo powermetrics --samplers gpu_power -i 1000 -n 1
```

### 7.5 故障排查

#### 问题 1: Ollama 服务未启动

```bash
# 检查进程
ps aux | grep ollama

# 手动启动
open /Applications/Ollama.app

# 检查端口
lsof -i :11434
```

#### 问题 2: 模型加载失败

```bash
# 检查模型完整性
~/.local/bin/ollama list

# 重新拉取模型
~/.local/bin/ollama pull <model_name>

# 检查存储空间
df -h ~/.ollama
```

#### 问题 3: API 无法访问

```bash
# 检查服务绑定
lsof -i :11434

# 检查防火墙
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 设置环境变量允许外部访问
launchctl setenv OLLAMA_HOST "0.0.0.0:11434"
```

---

## 附录

### A. 快速命令参考

```bash
# SSH 连接
ssh yyc3-77

# Ollama 命令
~/.local/bin/ollama list          # 查看模型
~/.local/bin/ollama pull <model>  # 拉取模型
~/.local/bin/ollama run <model>   # 运行模型
~/.local/bin/ollama rm <model>    # 删除模型

# API 调用
curl http://192.168.3.77:11434/api/tags
curl http://192.168.3.77:11434/api/generate -d '{"model":"phi3:mini","prompt":"test"}'
```

### B. 环境变量

```bash
# Ollama 配置
OLLAMA_HOST=0.0.0.0:11434        # 允许外部访问
OLLAMA_MODELS=~/.ollama/models   # 模型存储路径
OLLAMA_ORIGINS=*                 # CORS 配置
```

### C. 相关文档

- [L01-基础设施层完整部署报告.md](./L01-基础设施层完整部署报告.md)
- [7大智能体模型选型与部署规划.md](./7大智能体模型选型与部署规划.md)
- [服务连接配置手册.md](./服务连接配置手册.md)

---

<div align="center">

**YYC³ AI Family**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元**

**亦师亦友亦伯乐；一言一语一协同**

---

*文档版本: 1.0.0*
*最后更新: 2026-02-22*
*作者: YYC³ Team*

</div>
