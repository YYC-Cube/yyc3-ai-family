#!/bin/bash
set -e

# M4 Max专属配置（根据你的内存调整，建议内存≥32GB）
GITLAB_MEMORY="16GB"  # 分配给GitLab的内存（M4 Max建议16-32GB）
GITLAB_CPU="8"        # 分配CPU核心数（M4 Max建议8-12核）
GITLAB_DATA_DIR="$HOME/gitlab-m4max"  # 数据存储目录（确保有≥64GB空间）

# 1. 创建数据目录
mkdir -p ${GITLAB_DATA_DIR}/{config,logs,data}

# 2. 停止并删除旧容器（若存在）
docker stop gitlab-m4max || true
docker rm gitlab-m4max || true

# 3. 启动GitLab CE（arm64原生镜像）
echo "启动GitLab CE（M4 Max优化版）..."
docker run --detach \
  --name gitlab-m4max \
  --hostname gitlab.local \
  --publish 8443:443 --publish 8080:80 --publish 2222:22 \
  --restart always \
  --memory ${GITLAB_MEMORY} \
  --cpus ${GITLAB_CPU} \
  --volume ${GITLAB_DATA_DIR}/config:/etc/gitlab \
  --volume ${GITLAB_DATA_DIR}/logs:/var/log/gitlab \
  --volume ${GITLAB_DATA_DIR}/data:/var/opt/gitlab \
  --platform linux/arm64 \  # 强制使用arm64镜像（适配M4 Max）
  --env GITLAB_OMNIBUS_CONFIG="
    # M4 Max性能优化配置
    puma['worker_processes'] = 8;  # 适配M4 Max多核
    postgresql['shared_buffers'] = '4GB';  # 内存的1/4
    sidekiq['concurrency'] = 32;  # 提升并行任务处理能力
    gitlab_rails['gitlab_shell_ssh_port'] = 2222;  # 避免端口冲突
    nginx['listen_port'] = 80;
  " \
  gitlab/gitlab-ce:latest

# 4. 提示信息
echo -e "\nGitLab容器启动成功！"
echo "  - 访问地址：http://localhost:8080"
echo "  - 初始密码路径：${GITLAB_DATA_DIR}/config/initial_root_password"
echo "  - 查看日志：docker logs -f gitlab-m4max"
echo -e "\n⚠️  首次启动需等待5-10分钟（M4 Max），请耐心等待！"
