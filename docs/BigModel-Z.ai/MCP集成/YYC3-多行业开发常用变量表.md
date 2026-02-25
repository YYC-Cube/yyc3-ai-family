# 项目开发常用变量表

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|DEPLOY_METHOD|compose|部署方式选择|项目配置|docker --version|高|可选compose/k8s/systemd|
|SSH_DEPLOY|true|是否SSH部署|项目配置|ssh -T user@host|高|compose方式需SSH|

### 3.2 SSH部署配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|SSH_HOST|dev.example.com|远程主机地址|服务器配置|ping dev.example.com|高|域名或IP|
|SSH_PORT|22|SSH端口|服务器配置|ssh -p 22 user@host|高|默认22，可修改|
|SSH_USER|ubuntu|SSH用户名|服务器配置|ssh user@host|高|需有部署权限|
|SSH_KEY|-----BEGIN...|SSH私钥|GitHub Secrets|-|高|安全存储|

## 4. 环境矩阵配置

### 4.1 开发环境配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|ENV_NAME|dev|环境名称|CI/CD配置|-|高|环境标识|
|DEV_SSH_HOST|dev.example.com|开发环境主机|服务器配置|ping dev.example.com|高| |
|DEV_SSH_PORT|22|开发环境SSH端口|服务器配置|ssh -p 22 user@host|高| |
|DEV_SSH_USER|ubuntu|开发环境SSH用户|服务器配置|ssh user@host|高| |
|DEV_REMOTE_DIR|/opt/yanyu|远程项目目录|服务器配置|ls -la /opt/yanyu|高| |
|DEV_COMPOSE_FILE|/opt/yanyu/docker-compose.yml|Compose文件路径|服务器配置|ls -la /opt/yanyu/docker-compose.yml|高| |
|DEV_DOMAIN|dev.yanyu.example.com|开发环境域名|DNS配置|nslookup dev.yanyu.example.com|中| |
|DEV_TLS|false|是否启用TLS|服务器配置|curl -I <https://domain|高|开发环境通常禁用|>
|DEV_ENV_FILE|NODE_ENV=production...|环境变量内容|CI/CD配置|-|高| |
|DEV_GHCR_PAT_NEEDED|false|是否需要GHCR PAT|CI/CD配置|-|高|开发环境通常不需要|

### 4.2 预发布环境配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|ENV_NAME|staging|环境名称|CI/CD配置|-|高| |
|STAGING_SSH_HOST|staging.example.com|预发布环境主机|服务器配置|ping staging.example.com|高| |
|STAGING_SSH_PORT|22|预发布环境SSH端口|服务器配置|ssh -p 22 user@host|高| |
|STAGING_SSH_USER|ubuntu|预发布环境SSH用户|服务器配置|ssh user@host|高| |
|STAGING_REMOTE_DIR|/opt/yanyu|远程项目目录|服务器配置|ls -la /opt/yanyu|高| |
|STAGING_COMPOSE_FILE|/opt/yanyu/docker-compose.yml|Compose文件路径|服务器配置|ls -la /opt/yanyu/docker-compose.yml|高| |
|STAGING_DOMAIN|staging.yanyu.example.com|预发布环境域名|DNS配置|nslookup staging.yanyu.example.com|中| |
|STAGING_TLS|true|是否启用TLS|服务器配置|curl -I <https://domain|高|预发布环境应启用|>
|STAGING_ENV_FILE|""|环境变量内容|CI/CD配置|-|高|通常使用服务器.env文件|
|STAGING_GHCR_PAT_NEEDED|true|是否需要GHCR PAT|CI/CD配置|-|高|预发布环境需要|

### 4.3 生产环境配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|ENV_NAME|prod|环境名称|CI/CD配置|-|高| |
|PROD_SSH_HOST|prod.example.com|生产环境主机|服务器配置|ping prod.example.com|高| |
|PROD_SSH_PORT|22|生产环境SSH端口|服务器配置|ssh -p 22 user@host|高| |
|PROD_SSH_USER|ubuntu|生产环境SSH用户|服务器配置|ssh user@host|高| |
|PROD_REMOTE_DIR|/opt/yanyu|远程项目目录|服务器配置|ls -la /opt/yanyu|高| |
|PROD_COMPOSE_FILE|/opt/yanyu/docker-compose.yml|Compose文件路径|服务器配置|ls -la /opt/yanyu/docker-compose.yml|高| |
|PROD_DOMAIN|yanyu.example.com|生产环境域名|DNS配置|nslookup yanyu.example.com|高| |
|PROD_TLS|true|是否启用TLS|服务器配置|curl -I <https://domain|高|生产环境必须启用|>
|PROD_ENV_FILE|""|环境变量内容|CI/CD配置|-|高|通常使用服务器.env文件|
|PROD_GHCR_PAT_NEEDED|true|是否需要GHCR PAT|CI/CD配置|-|高|生产环境需要|

## 5. 数据库、缓存与迁移配置

### 5.1 数据库配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|DATABASE_TYPE|postgres|数据库类型|项目依赖|psql --version|高|可选postgres/mysql/mongo等|
|DATABASE_URL|postgresql://user:pass@host:port/db|数据库连接字符串|项目配置|echo $DATABASE_URL|高|不同数据库格式不同|
|MIGRATE_COMMAND|npm run migrate|数据库迁移命令|package.json|npm run migrate|高|同步数据库结构|

### 5.2 缓存配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|CACHE_TYPE|redis|缓存系统类型|项目依赖|redis-cli --version|高|可选redis/memcached等|
|REDIS_URL|redis://localhost:6379|Redis连接字符串|项目配置|echo $REDIS_URL|高|缓存系统连接|

### 5.3 数据库迁移

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|MIGRATE_COMMAND|npm run migrate|数据库迁移命令|package.json|npm run migrate|高|同步数据库结构|
|SEED_COMMAND|""|种子数据命令|package.json|npm run seed|中|初始化数据|

## 6. 版本、发布和回滚策略配置

### 6.1 版本控制

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|VERSIONING|semver|版本控制方案|CI/CD配置|npm version --help|高|推荐SemVer|
|TAG_FORMAT|vMAJOR.MINOR.PATCH|标签格式|CI/CD配置|git tag|高|符合SemVer规范|

### 6.2 发布触发

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|ON_MAIN_PUSH|true|主分支推送触发|CI/CD配置|git push origin main|高|自动部署到开发环境|
|ON_TAG|true|标签创建触发|CI/CD配置|git tag v1.0.0|高|触发发布流程|
|MANUAL_DISPATCH|true|手动触发|CI/CD配置|GitHub UI|高|允许手动触发|

### 6.3 回滚策略

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|ROLLBACK_KEEP_LAST|5|保留最近版本数|CI/CD配置|docker images | grep app|高|便于回滚|
|ROLLBACK_METHOD|compose|回滚方式|CI/CD配置|docker compose down/up|高|compose/k8s/systemd|

## 7. 质量门禁与通知配置

### 7.1 质量门禁

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|COVERAGE_REQUIRED|false|是否要求测试覆盖率|CI/CD配置|npm run test -- --coverage|中|建议启用|
|SONAR_ENABLED|false|是否启用SonarQube|CI/CD配置|sonar-scanner -v|中|可选|
|SONAR_TOKEN|sonar_token|SonarQube令牌|GitHub Secrets|-|中|安全存储|

### 7.2 通知配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|SLACK_ENABLED|false|是否启用Slack通知|CI/CD配置|-|中|可选|
|SLACK_WEBHOOK|<https://hooks.slack.com/...|Slack> Webhook URL|GitHub Secrets|-|中|安全存储|

### 7.3 审批配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|USE_GITHUB_ENVIRONMENTS|true|是否使用GitHub环境|CI/CD配置|-|高|强烈推荐|
|DEV_APPROVERS|[]|开发环境审批者|GitHub配置|-|高|开发环境通常不需要|
|STAGING_APPROVERS|["owner1"]|预发布环境审批者|GitHub配置|-|高|至少一人|
|PROD_APPROVERS|["owner1","owner2"]|生产环境审批者|GitHub配置|-|高|多人审批更安全|

## 8. 运行器和权限配置

### 8.1 运行器配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|SELF_HOSTED_RUNNER|false|是否使用自托管Runner|CI/CD配置|gh run list|中|默认使用GitHub托管|
|RUNNER_LABELS|[]|Runner标签|CI/CD配置|gh run list --json labels|中|选择特定运行器|
|CONCURRENCY_LIMIT|2|并发任务限制|CI/CD配置|gh run list --limit 10|中|避免资源竞争|

### 8.2 权限配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|PACKAGES_WRITE|true|包仓库写入权限|CI/CD配置|gh package list|高|推送GHCR镜像需要|
|ENVIRONMENTS|true|环境保护权限|CI/CD配置|-|高|部署到环境需要|

### 8.3 远程主机配置

|变量名|示例值|功能作用|获取途径|Mac终端命令|必须性|备注|
|DOCKER_INSTALLED|true|是否安装Docker|服务器配置|docker --version|高|部署基础|
|DOCKER_COMPOSE_INSTALLED|true|是否安装Docker Compose|服务器配置|docker compose version|高|部署基础|

## 9. GitHub Actions工作流实现

### 9.1 CI流程 (.github/workflows/ci.yml)

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: package-lock.json
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run lint
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
```

### 9.2 部署流程 (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'dev'
        type: choice
        options:
        - dev
        - staging
        - prod
  push:
    branches: [ main ]
    paths-ignore:
      - 'docs/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'dev' }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: package-lock.json
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run lint
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Log in to Container Registry
      if: github.event_name != 'pull_request'
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ghcr.io/yy-nexus/yanyu-cloud-cube-app
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
          
    - name: Build and push Docker image
      if: github.event_name != 'pull_request'
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        
    - name: Deploy to ${{ github.event.inputs.environment || 'dev' }}
      if: github.event_name != 'pull_request'
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.${{ matrix.env }}_SSH_HOST }}
        username: ${{ secrets.${{ matrix.env }}_SSH_USER }}
        key: ${{ secrets.${{ matrix.env }}_SSH_KEY }}
        port: ${{ secrets.${{ matrix.env }}_SSH_PORT || 22 }}
        script: |
          cd ${{ secrets.${{ matrix.env }}_REMOTE_PROJECT_DIR }}
          
          # Pull the latest image
          docker pull ghcr.io/yy-nexus/yanyu-cloud-cube-app:latest
          
          # Stop current service if exists
          docker compose down
          
          # Start the new service
          docker compose up -d
          
          # Wait for the service to be healthy
          for i in {1..30}; do
            if curl -f http://localhost:${{ secrets.${{ matrix.env }}_PORT || 3000 }}/health; then
              echo "Service is healthy"
              break
            fi
            echo "Waiting for service to be healthy... ($i/30)"
            sleep 5
          done
          
          if [ $i -eq 30 ]; then
            echo "Service did not become healthy"
            exit 1
          fi

  # Define environments for different deployment targets
  env:
    dev:
      SSH_HOST: ${{ secrets.DEV_SSH_HOST }}
      SSH_USER: ${{ secrets.DEV_SSH_USER }}
      SSH_KEY: ${{ secrets.DEV_SSH_KEY }}
      SSH_PORT: ${{ secrets.DEV_SSH_PORT }}
      REMOTE_PROJECT_DIR: ${{ secrets.DEV_REMOTE_PROJECT_DIR }}
      PORT: ${{ secrets.DEV_PORT }}
    staging:
      SSH_HOST: ${{ secrets.STAGING_SSH_HOST }}
      SSH_USER: ${{ secrets.STAGING_SSH_USER }}
      SSH_KEY: ${{ secrets.STAGING_SSH_KEY }}
      SSH_PORT: ${{ secrets.STAGING_SSH_PORT }}
      REMOTE_PROJECT_DIR: ${{ secrets.STAGING_REMOTE_PROJECT_DIR }}
      PORT: ${{ secrets.STAGING_PORT }}
    prod:
      SSH_HOST: ${{ secrets.PROD_SSH_HOST }}
      SSH_USER: ${{ secrets.PROD_SSH_USER }}
      SSH_KEY: ${{ secrets.PROD_SSH_KEY }}
      SSH_PORT: ${{ secrets.PROD_SSH_PORT }}
      REMOTE_PROJECT_DIR: ${{ secrets.PROD_REMOTE_PROJECT_DIR }}
      PORT: ${{ secrets.PROD_PORT }}
```

### 9.3 发布流程 (.github/workflows/release.yml)

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag (e.g., v1.0.0)'
        required: true
        type: string

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: package-lock.json
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run lint
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ghcr.io/yy-nexus/yanyu-cloud-cube-app
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
          
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        
    - name: Create GitHub Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref_name }}
        release_name: Release ${{ github.ref_name }}
        body: |
          Changes in this Release
          - Automated release from GitHub Actions
        draft: false
        prerelease: false
```

### 9.4 回滚流程 (.github/workflows/rollback.yml)

```yaml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'dev'
        type: choice
        options:
        - dev
        - staging
        - prod
      version:
        description: 'Version to rollback to (e.g., latest, v1.0.0)'
        required: true
        type: string
        default: 'latest'

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Rollback deployment
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.${{ matrix.env }}_SSH_HOST }}
        username: ${{ secrets.${{ matrix.env }}_SSH_USER }}
        key: ${{ secrets.${{ matrix.env }}_SSH_KEY }}
        port: ${{ secrets.${{ matrix.env }}_SSH_PORT || 22 }}
        script: |
          cd ${{ secrets.${{ matrix.env }}_REMOTE_PROJECT_DIR }}
          
          # Stop current service
          docker compose down
          
          # Pull the specified version
          docker pull ghcr.io/yy-nexus/yanyu-cloud-cube-app:${{ github.event.inputs.version }}
          
          # Start the service with the specified version
          docker compose up -d
          
          # Wait for the service to be healthy
          for i in {1..30}; do
            if curl -f http://localhost:${{ secrets.${{ matrix.env }}_PORT || 3000 }}/health; then
              echo "Service is healthy"
              break
            fi
            echo "Waiting for service to be healthy... ($i/30)"
            sleep 5
          done
          
          if [ $i -eq 30 ]; then
            echo "Service did not become healthy"
            exit 1
          fi

  # Define environments for different deployment targets
  env:
    dev:
      SSH_HOST: ${{ secrets.DEV_SSH_HOST }}
      SSH_USER: ${{ secrets.DEV_SSH_USER }}
      SSH_KEY: ${{ secrets.DEV_SSH_KEY }}
      SSH_PORT: ${{ secrets.DEV_SSH_PORT }}
      REMOTE_PROJECT_DIR: ${{ secrets.DEV_REMOTE_PROJECT_DIR }}
      PORT: ${{ secrets.DEV_PORT }}
    staging:
      SSH_HOST: ${{ secrets.STAGING_SSH_HOST }}
      SSH_USER: ${{ secrets.STAGING_SSH_USER }}
      SSH_KEY: ${{ secrets.STAGING_SSH_KEY }}
      SSH_PORT: ${{ secrets.STAGING_SSH_PORT }}
      REMOTE_PROJECT_DIR: ${{ secrets.STAGING_REMOTE_PROJECT_DIR }}
      PORT: ${{ secrets.STAGING_PORT }}
    prod:
      SSH_HOST: ${{ secrets.PROD_SSH_HOST }}
      SSH_USER: ${{ secrets.PROD_SSH_USER }}
      SSH_KEY: ${{ secrets.PROD_SSH_KEY }}
      SSH_PORT: ${{ secrets.PROD_SSH_PORT }}
      REMOTE_PROJECT_DIR: ${{ secrets.PROD_REMOTE_PROJECT_DIR }}
      PORT: ${{ secrets.PROD_PORT }}
```

## 10. Docker部署脚本实现

### 10.1 Dockerfile

```plaintext
# 使用Node.js官方镜像作为基础镜像
FROM node:20-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:20-alpine AS production

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 复制构建产物
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# 更改文件所有者
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["node", "dist/server.js"]
```

### 10.2 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/yy-nexus/yanyu-cloud-cube-app:latest
    container_name: yanyu-cloud-cube-app
    restart: unless-stopped
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - PORT=${PORT:-3000}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "${PORT:-3000}:3000"
    networks:
      - yanyu-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 40s

networks:
  yanyu-network:
    driver: bridge
```

### 10.3 .env.example

```plaintext
# 应用环境
NODE_ENV=production
PORT=3000

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/yanyu_cloud_cube

# Redis
REDIS_URL=redis://localhost:6379

# 日志级别
LOG_LEVEL=info

# JWT密钥
JWT_SECRET=your_jwt_secret_here
```

## 11. 发布与回滚策略实现

### 11.1 发布流程

1. 版本控制：

- 采用语义化版本控制（SemVer），版本格式为vMAJOR.MINOR.PATCH
- 示例：v1.0.0, v1.1.0, v1.0.1

1. 发布触发：

- 推送到main分支：自动触发CI/CD流程，部署到开发环境
- 创建标签：触发发布流程，部署到预发布和生产环境
- 手动触发：可通过GitHub Actions UI手动触发部署

1. 发布流程：

```plaintext
graph TD
  A[代码提交到main分支] --> B[自动CI/CD流程]
  B --> C[构建、测试、镜像构建]
  C --> D[部署到开发环境]
  E[创建版本标签] --> F[触发发布流程]
  F --> G[构建并推送镜像]
  G --> H[创建GitHub Release]
  H --> I[部署到预发布环境]
  I --> J[手动触发部署到生产环境]
```

1. 审批流程：

- 开发环境：无需审批
- 预发布环境：需要owner1审批
- 生产环境：需要owner1和owner2审批

### 11.2 回滚流程

1. 保留版本：

- 保留最近5个版本的镜像
- 可通过docker images | grep app查看可用版本

1. 回滚触发：

- 手动触发回滚流程
- 选择目标环境
- 指定回滚版本（latest或具体版本号）

1. 回滚流程：
![图片](https://docimg8.docs.qq.com/image/AgAAJrsBb_dGSbP7C-1G14Giv1SDyg9v.png?w=814&h=1484)

```json
graph TD
  A[触发回滚] --> B[选择环境和版本]
  B --> C[停止当前服务]
  C --> D[拉取指定版本镜像]
  D --> E[启动新版本服务]
  E --> F[健康检查]
  F --> G[验证服务状态]
```

1. 回滚验证：

- 健康检查通过
- 功能测试验证
- 监控指标确认

## 12. 告警与监控集成实现

### 12.1 健康检查

应用已内置健康检查端点（/health），Docker容器也配置了健康检查：

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 40s
```

### 12.2 监控指标

建议使用Prometheus + Grafana进行监控，可收集以下指标：

1. 应用性能指标：

- 请求响应时间
- 请求量（QPS）
- 错误率

1. 系统资源指标：

- CPU使用率
- 内存使用率
- 磁盘I/O
- 网络流量

1. 业务指标：

- 数据库连接数
- Redis缓存命中率
- 活跃用户数

### 12.3 告警规则

基于监控指标设置告警规则：

```yaml
groups:
  - name: application.rules
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate on {{ $labels.instance }}"
        description: "Error rate is {{ $value }} requests per second"
    
    - alert: HighResponseTime
      expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High response time on {{ $labels.instance }}"
        description: "95th percentile response time is {{ $value }} seconds"
    
    - alert: HighCpuUsage
      expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage on {{ $labels.instance }}"
        description: "CPU usage is at {{ $value }}%"
```

### 12.4 告警通知

建议使用Slack、企业微信或飞书等工具接收告警通知：

```yaml
# 示例：Slack通知配置
receivers:
  - name: 'slack-notifications'
    slack_configs:
    - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
      channel: '#alerts'
      title: '{{ .GroupLabels.alertname }}'
      text: '{{ .CommonAnnotations.summary }}'
```

## 13. PR提交指南

### 13.1 文件结构

```plaintext
.github/
└── workflows/
    ├── ci.yml
    ├── deploy.yml
    ├── release.yml
    └── rollback.yml

Dockerfile
docker-compose.yml
.env.example
```

### 13.2 提交步骤

1. 创建新分支：

```bash
git checkout -b feature/ci-cd-setup
```

1. 添加文件：

```bash
git add .github/workflows/
git add Dockerfile
git add docker-compose.yml
git add .env.example
```

1. 提交更改：

```bash
git commit -m "feat: 添加完整的CI/CD和部署配置"
```

1. 推送分支：

```bash
git push origin feature/ci-cd-setup
```

1. 创建PR：

- 在GitHub仓库创建Pull Request
- 确保PR标题清晰描述更改内容
- 在PR描述中说明此PR的目的和影响

### 13.3 Secrets配置

在GitHub仓库中设置以下Secrets：
开发环境：

- DEV_SSH_HOST
- DEV_SSH_USER
- DEV_SSH_KEY
- DEV_SSH_PORT
- DEV_REMOTE_PROJECT_DIR
- DEV_PORT
- DEV_DATABASE_URL
- DEV_REDIS_URL
- DEV_JWT_SECRET
预发布环境：
- STAGING_SSH_HOST
- STAGING_SSH_USER
- STAGING_SSH_KEY
- STAGING_SSH_PORT
- STAGING_REMOTE_PROJECT_DIR
- STAGING_PORT
- STAGING_DATABASE_URL
- STAGING_REDIS_URL
- STAGING_JWT_SECRET
生产环境：
- PROD_SSH_HOST
- PROD_SSH_USER
- PROD_SSH_KEY
- PROD_SSH_PORT
- PROD_REMOTE_PROJECT_DIR
- PROD_PORT
- PROD_DATABASE_URL
- PROD_REDIS_URL
- PROD_JWT_SECRET

### 13.4 环境配置

1. 创建GitHub Environments：

- 在GitHub仓库中创建三个环境：dev、staging、prod
- 为staging环境设置审批者：owner1
- 为prod环境设置审批者：owner1, owner2

1. 服务器准备：

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 创建部署目录
sudo mkdir -p /opt/yanyu
sudo chown -R $USER:$USER /opt/yanyu
```

1. SSH密钥配置：

```bash
# 生成SSH密钥对
ssh-keygen -t ed25519 -C "your_email@example.com"

# 将公钥添加到远程服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote-server
```

### 13.5 注意事项

1. 安全：

- 所有敏感信息必须通过GitHub Secrets管理
- 生产环境数据库密码和JWT密钥必须强密码
- 定期轮换密钥和密码

1. 备份：

- 定期备份生产环境数据
- 保留最近5个版本的镜像用于回滚

1. 监控：

- 确保监控告警系统正常运行
- 定期检查告警规则有效性

1. 文档：

- 维护部署和运维文档
- 记录环境变更和配置调整

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
