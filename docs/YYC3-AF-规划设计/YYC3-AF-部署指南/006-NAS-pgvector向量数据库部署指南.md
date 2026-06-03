# YYC³ AI Family - NAS 向量数据库部署指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

**文档版本**: 1.0.0
**部署日期**: 2026-02-22
**部署环境**: NAS 铁威马 F4-423 (Docker)
**部署状态**: ✅ 完成

---

## 📋 目录

1. [部署背景](#1-部署背景)
2. [技术选型](#2-技术选型)
3. [部署过程](#3-部署过程)
4. [数据库初始化](#4-数据库初始化)
5. [连接验证](#5-连接验证)
6. [使用指南](#6-使用指南)
7. [性能优化](#7-性能优化)
8. [运维指南](#8-运维指南)

---

## 1. 部署背景

### 1.1 需求分析

YYC³ AI Family 的 L02 数据存储层需要向量数据库支持以下功能：

- **知识库检索**: Grandmaster 智能体的知识存储与检索
- **语义搜索**: 基于向量相似度的文档搜索
- **嵌入存储**: Nomic-Embed-Text 生成的向量存储
- **RAG 支持**: 检索增强生成的基础设施

### 1.2 现有数据库资源

NAS 已有以下数据库服务：

| 数据库 | 版本 | 端口 | 用途 |
|--------|------|------|------|
| PostgreSQL 13 | 13 | 5032 | 系统服务 (勿动) |
| PostgreSQL 14 (okm) | 14.15 | 5432 | 业务数据库 |
| MySQL | 8.x | 3306 | 业务数据库 |

### 1.3 问题发现

尝试在 NAS 原生 PostgreSQL 14 上安装 pgvector 扩展时发现：

```bash
# 编译 pgvector 失败
make CC=gcc
# fatal error: postgres.h: No such file or directory
```

**原因**: NAS 的 PostgreSQL 安装缺少开发头文件 (嵌入式系统常见问题)

**解决方案**: 使用 Docker 部署独立的 PostgreSQL + pgvector 容器

---

## 2. 技术选型

### 2.1 方案对比

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **编译安装 pgvector** | 原生集成 | 缺少头文件 | ❌ 不可行 |
| **Docker pgvector/pgvector** | 开箱即用 | 独立容器 | ✅ 采用 |
| **Qdrant** | 专业向量库 | 资源占用高 | 备选 |
| **Chroma** | 轻量级 | 功能有限 | 备选 |
| **Milvus** | 大规模 | 复杂度高 | 备选 |

### 2.2 最终方案

**选择**: Docker 部署 `pgvector/pgvector:pg14`

**理由**:
- ✅ 开箱即用，无需编译
- ✅ 与现有 PostgreSQL 生态兼容
- ✅ 支持 IVFFlat 和 HNSW 索引
- ✅ 支持余弦相似度、欧氏距离、内积
- ✅ 活跃的社区支持

### 2.3 版本信息

| 组件 | 版本 |
|------|------|
| PostgreSQL | 14.21 |
| pgvector | 0.8.1 |
| Docker 镜像 | pgvector/pgvector:pg14 |

---

## 3. 部署过程

### 3.1 环境准备

```bash
# SSH 连接 NAS
ssh -p 9557 YYC@192.168.3.45

# 创建数据目录
mkdir -p /Volume1/docker/yyc3/pgvector-data

# 检查 Docker 状态
/Volume2/@apps/DockerEngine/dockerd/bin/docker ps
```

### 3.2 拉取镜像

```bash
# 拉取 pgvector 镜像
/Volume2/@apps/DockerEngine/dockerd/bin/docker pull pgvector/pgvector:pg14
```

**输出**:
```
20b48890dc6f: Pull complete
34bdf2abb5e8: Pull complete
0348dc1d44f5: Pull complete
...
Status: Downloaded newer image for pgvector/pgvector:pg14
docker.io/pgvector/pgvector:pg14
```

### 3.3 启动容器

```bash
# 启动 pgvector 容器
/Volume2/@apps/DockerEngine/dockerd/bin/docker run -d \
  --name yyc3-pgvector \
  --restart unless-stopped \
  -e POSTGRES_USER=yyc3 \
  -e POSTGRES_PASSWORD=yyc3_vector_2026 \
  -e POSTGRES_DB=yyc3_vectors \
  -p 5434:5432 \
  -v /Volume1/docker/yyc3/pgvector-data:/var/lib/postgresql/data \
  pgvector/pgvector:pg14
```

**参数说明**:

| 参数 | 说明 |
|------|------|
| `--name yyc3-pgvector` | 容器名称 |
| `--restart unless-stopped` | 自动重启策略 |
| `-e POSTGRES_USER=yyc3` | 数据库用户 |
| `-e POSTGRES_PASSWORD=yyc3_vector_2026` | 数据库密码 |
| `-e POSTGRES_DB=yyc3_vectors` | 数据库名称 |
| `-p 5434:5432` | 端口映射 (避免与现有 PG 冲突) |
| `-v ...` | 数据持久化 |

### 3.4 验证容器状态

```bash
# 查看容器状态
/Volume2/@apps/DockerEngine/dockerd/bin/docker ps | grep pgvector
```

**输出**:
```
1e2f83b4a1cc   pgvector/pgvector:pg14   "docker-entrypoint.s…"   10 seconds ago   Up 5 seconds    0.0.0.0:5434->5432/tcp
```

### 3.5 查看容器日志

```bash
# 查看启动日志
/Volume2/@apps/DockerEngine/dockerd/bin/docker logs yyc3-pgvector
```

**输出**:
```
PostgreSQL init process complete; ready for start up.
2026-02-22 07:23:16.374 UTC [1] LOG:  starting PostgreSQL 14.21
2026-02-22 07:23:16.374 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2026-02-22 07:23:16.571 UTC [1] LOG:  database system is ready to accept connections
```

---

## 4. 数据库初始化

### 4.1 启用 pgvector 扩展

```bash
# 进入容器执行 SQL
/Volume2/@apps/DockerEngine/dockerd/bin/docker exec yyc3-pgvector psql -U yyc3 -d yyc3_vectors -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**输出**:
```
CREATE EXTENSION
```

### 4.2 验证扩展安装

```bash
# 查看已安装扩展
/Volume2/@apps/DockerEngine/dockerd/bin/docker exec yyc3-pgvector psql -U yyc3 -d yyc3_vectors -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

**输出**:
```
 extname | extversion 
---------+------------
 vector  | 0.8.1
(1 row)
```

### 4.3 创建向量表

```sql
-- 文档向量表
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(768),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 对话向量表
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64),
    role VARCHAR(16),
    content TEXT,
    embedding vector(768),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 知识库向量表
CREATE TABLE IF NOT EXISTS knowledge_base (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    embedding vector(768),
    source VARCHAR(256),
    category VARCHAR(64),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.4 创建向量索引

```sql
-- IVFFlat 索引 (适合中等规模数据)
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS conversations_embedding_idx 
ON conversations USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
ON knowledge_base USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- HNSW 索引 (适合大规模数据，更高性能)
CREATE INDEX IF NOT EXISTS documents_embedding_hnsw_idx 
ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### 4.5 插入测试数据

```sql
-- 插入测试文档
INSERT INTO documents (content, embedding, metadata) VALUES 
('YYC³ AI Family 是一个智能工作生态系统', array_fill(0.1, ARRAY[768])::vector(768), '{"category": "intro", "lang": "zh"}'),
('CodeGeeX4 是智谱授权的代码生成模型', array_fill(0.2, ARRAY[768])::vector(768), '{"category": "model", "lang": "zh"}'),
('PostgreSQL pgvector 支持向量相似度搜索', array_fill(0.3, ARRAY[768])::vector(768), '{"category": "tech", "lang": "zh"}'),
('Nomic-Embed-Text 是文本嵌入模型', array_fill(0.15, ARRAY[768])::vector(768), '{"category": "model", "lang": "zh"}'),
('Grandmaster 智能体负责知识库构建', array_fill(0.25, ARRAY[768])::vector(768), '{"category": "agent", "lang": "zh"}');
```

---

## 5. 连接验证

### 5.1 从 NAS 本地连接

```bash
# NAS 本地连接
/Volume2/@apps/DockerEngine/dockerd/bin/docker exec yyc3-pgvector psql -U yyc3 -d yyc3_vectors
```

### 5.2 从 M4 Max 远程连接

```bash
# 使用 psql 连接
PGPASSWORD=yyc3_vector_2026 psql -h 192.168.3.45 -p 5434 -U yyc3 -d yyc3_vectors

# 验证连接
SELECT 'Vector DB Ready!' as status;
```

**输出**:
```
      status      
------------------
 Vector DB Ready!
(1 row)
```

### 5.3 验证向量功能

```sql
-- 查看表结构
\d documents

-- 查询数据
SELECT id, content, metadata FROM documents;

-- 向量相似度搜索
SELECT id, content, 
       1 - (embedding <=> array_fill(0.15, ARRAY[768])::vector(768)) as similarity 
FROM documents 
ORDER BY embedding <=> array_fill(0.15, ARRAY[768])::vector(768) 
LIMIT 3;
```

**输出**:
```
 id |                content                 | similarity 
----+----------------------------------------+------------
  1 | YYC³ AI Family 是一个智能工作生态系统  |          1
  4 | Nomic-Embed-Text 是文本嵌入模型        |          1
  2 | CodeGeeX4 是智谱授权的代码生成模型     |          1
(3 rows)
```

---

## 6. 使用指南

### 6.1 连接字符串

```bash
# PostgreSQL 连接字符串
postgresql://yyc3:yyc3_vector_2026@192.168.3.45:5434/yyc3_vectors

# Node.js 连接
const { Pool } = require('pg');
const pool = new Pool({
  host: '192.168.3.45',
  port: 5434,
  database: 'yyc3_vectors',
  user: 'yyc3',
  password: 'yyc3_vector_2026',
});
```

### 6.2 向量操作示例

#### 插入向量

```sql
-- 插入文档和向量
INSERT INTO documents (content, embedding, metadata)
VALUES ('新的文档内容', '[0.1, 0.2, 0.3, ...]'::vector(768), '{"category": "test"}');
```

#### 相似度搜索

```sql
-- 余弦相似度搜索 (距离越小越相似)
SELECT id, content, 
       1 - (embedding <=> query_vector) as cosine_similarity
FROM documents
ORDER BY embedding <=> query_vector
LIMIT 5;

-- 欧氏距离搜索
SELECT id, content,
       embedding <-> query_vector as euclidean_distance
FROM documents
ORDER BY embedding <-> query_vector
LIMIT 5;

-- 内积搜索
SELECT id, content,
       embedding <#> query_vector as inner_product
FROM documents
ORDER BY embedding <#> query_vector DESC
LIMIT 5;
```

#### 带过滤条件的搜索

```sql
-- 按类别过滤
SELECT id, content, metadata,
       1 - (embedding <=> query_vector) as similarity
FROM documents
WHERE metadata->>'category' = 'tech'
ORDER BY embedding <=> query_vector
LIMIT 5;

-- 按时间范围过滤
SELECT id, content,
       1 - (embedding <=> query_vector) as similarity
FROM documents
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY embedding <=> query_vector
LIMIT 5;
```

### 6.3 与 Ollama 集成

```typescript
// 生成嵌入向量并存储
import ollama from 'ollama';
import { Pool } from 'pg';

const pool = new Pool({
  host: '192.168.3.45',
  port: 5434,
  database: 'yyc3_vectors',
  user: 'yyc3',
  password: 'yyc3_vector_2026',
});

async function embedAndStore(content: string, metadata: object) {
  // 生成嵌入向量
  const response = await ollama.embeddings({
    model: 'nomic-embed-text',
    prompt: content,
  });
  
  // 存储到数据库
  await pool.query(
    'INSERT INTO documents (content, embedding, metadata) VALUES ($1, $2, $3)',
    [content, response.embedding, metadata]
  );
}

async function searchSimilar(query: string, limit: number = 5) {
  // 生成查询向量
  const response = await ollama.embeddings({
    model: 'nomic-embed-text',
    prompt: query,
  });
  
  // 相似度搜索
  const result = await pool.query(`
    SELECT id, content, metadata,
           1 - (embedding <=> $1) as similarity
    FROM documents
    ORDER BY embedding <=> $1
    LIMIT $2
  `, [response.embedding, limit]);
  
  return result.rows;
}
```

---

## 7. 性能优化

### 7.1 索引选择

| 索引类型 | 适用场景 | 特点 |
|----------|----------|------|
| **IVFFlat** | 中等规模 (< 100万) | 构建快，内存占用低 |
| **HNSW** | 大规模 (> 100万) | 查询快，内存占用高 |
| **无索引** | 小规模 (< 10万) | 精确搜索，速度慢 |

### 7.2 IVFFlat 参数调优

```sql
-- lists 参数：聚类中心数量
-- 建议：sqrt(行数) 到 行数/1000 之间
CREATE INDEX documents_embedding_idx 
ON documents USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);  -- 适合 10,000-100,000 行

-- 查询时指定探测的聚类数量
SET ivfflat.probes = 10;  -- 默认为 1，增大可提高召回率
```

### 7.3 HNSW 参数调优

```sql
-- m 参数：每个节点的最大连接数
-- ef_construction 参数：构建时的候选列表大小
CREATE INDEX documents_embedding_hnsw_idx 
ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);  -- 默认值

-- 查询时设置 ef
SET hnsw.ef_search = 100;  -- 默认为 40，增大可提高召回率
```

### 7.4 内存配置

```sql
-- 查看当前配置
SHOW shared_buffers;
SHOW work_mem;

-- 建议配置 (在 postgresql.conf 中)
shared_buffers = 256MB
work_mem = 64MB
maintenance_work_mem = 256MB
```

### 7.5 批量插入优化

```sql
-- 批量插入时临时禁用索引
DROP INDEX documents_embedding_idx;

-- 批量插入
INSERT INTO documents (content, embedding, metadata)
SELECT content, embedding, metadata
FROM temp_documents;

-- 重建索引
CREATE INDEX documents_embedding_idx 
ON documents USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

---

## 8. 运维指南

### 8.1 容器管理

```bash
# 查看容器状态
docker ps | grep pgvector

# 查看容器日志
docker logs yyc3-pgvector

# 重启容器
docker restart yyc3-pgvector

# 停止容器
docker stop yyc3-pgvector

# 启动容器
docker start yyc3-pgvector

# 进入容器
docker exec -it yyc3-pgvector bash
```

### 8.2 数据备份

```bash
# 全量备份
docker exec yyc3-pgvector pg_dump -U yyc3 yyc3_vectors > backup_$(date +%Y%m%d).sql

# 压缩备份
docker exec yyc3-pgvector pg_dump -U yyc3 yyc3_vectors | gzip > backup_$(date +%Y%m%d).sql.gz

# 备份到 NAS
docker exec yyc3-pgvector pg_dump -U yyc3 yyc3_vectors > /Volume1/backup/pgvector_$(date +%Y%m%d).sql
```

### 8.3 数据恢复

```bash
# 恢复数据库
cat backup_20260222.sql | docker exec -i yyc3-pgvector psql -U yyc3 yyc3_vectors

# 恢复压缩备份
gunzip -c backup_20260222.sql.gz | docker exec -i yyc3-pgvector psql -U yyc3 yyc3_vectors
```

### 8.4 监控脚本

```bash
#!/bin/bash
# 文件: /Users/yanyu/YYC3-Mac-Max/Family-π³/scripts/monitor-pgvector.sh

echo "=== YYC³ pgvector 监控 ==="
echo ""

# 检查容器状态
echo "📦 容器状态:"
docker ps | grep pgvector || echo "❌ 容器未运行"

echo ""
echo "📊 数据库统计:"
PGPASSWORD=yyc3_vector_2026 psql -h 192.168.3.45 -p 5434 -U yyc3 -d yyc3_vectors -c "
SELECT 
  schemaname,
  relname as table_name,
  n_live_tup as row_count,
  pg_size_pretty(pg_total_relation_size(relid)) as size
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
"

echo ""
echo "🔍 索引状态:"
PGPASSWORD=yyc3_vector_2026 psql -h 192.168.3.45 -p 5434 -U yyc3 -d yyc3_vectors -c "
SELECT 
  indexrelname as index_name,
  relname as table_name,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE indexrelname LIKE '%embedding%';
"

echo ""
echo "✅ 监控完成"
```

### 8.5 定期维护

```sql
-- 分析表统计信息
ANALYZE documents;

-- 清理死元组
VACUUM documents;

-- 完整清理 (会锁表)
VACUUM FULL documents;

-- 重建索引
REINDEX INDEX documents_embedding_idx;
```

### 8.6 故障排查

#### 连接失败

```bash
# 检查容器状态
docker ps | grep pgvector

# 检查端口
ss -tlnp | grep 5434

# 检查日志
docker logs yyc3-pgvector --tail 50
```

#### 性能问题

```sql
-- 查看慢查询
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 查看索引使用情况
SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE relname = 'documents';

-- 查看表膨胀
SELECT relname, n_dead_tup, n_live_tup
FROM pg_stat_user_tables
WHERE relname = 'documents';
```

---

## 附录

### A. 连接信息汇总

| 配置项 | 值 |
|--------|-----|
| 主机 | 192.168.3.45 |
| 端口 | 5434 |
| 数据库 | yyc3_vectors |
| 用户 | yyc3 |
| 密码 | yyc3_vector_2026 |
| 连接字符串 | `postgresql://yyc3:yyc3_vector_2026@192.168.3.45:5434/yyc3_vectors` |

### B. 表结构汇总

```sql
-- documents 表
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(768),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- conversations 表
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64),
    role VARCHAR(16),
    content TEXT,
    embedding vector(768),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- knowledge_base 表
CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    embedding vector(768),
    source VARCHAR(256),
    category VARCHAR(64),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### C. 常用 SQL 命令

```sql
-- 查看扩展
SELECT * FROM pg_extension;

-- 查看表大小
SELECT pg_size_pretty(pg_total_relation_size('documents'));

-- 查看索引
\di

-- 查看向量维度
SELECT array_length(embedding, 1) FROM documents LIMIT 1;

-- 计算相似度
SELECT 
  id,
  content,
  1 - (embedding <=> '[0.1,0.2,...]'::vector(768)) as cosine_similarity,
  embedding <-> '[0.1,0.2,...]'::vector(768) as euclidean_distance,
  embedding <#> '[0.1,0.2,...]'::vector(768) as inner_product
FROM documents
ORDER BY embedding <=> '[0.1,0.2,...]'::vector(768)
LIMIT 5;
```

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
