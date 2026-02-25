# 1. 创建脚本文件（命名为gitlab-m4max-install.sh）
cat > gitlab-m4max-install.sh << 'EOF'
#!/bin/bash
set -e  # 遇到错误立即退出

# 检查是否为Apple Silicon（M4 Max）
if [ "$(uname -m)" != "arm64" ]; then
    echo "错误：此脚本仅适用于Apple Silicon（M4 Max/arm64）架构！"
    exit 1
fi

# 步骤1：安装Homebrew（若未安装）
echo "===== 1. 检查/安装Homebrew ====="
if ! command -v brew &> /dev/null; then
    echo "正在安装Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # 自动配置Homebrew环境变量（Apple Silicon专属）
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "Homebrew已安装，跳过"
fi

# 步骤2：安装Git（arm64原生）
echo -e "\n===== 2. 安装/更新Git（arm64） ====="
brew install git || brew upgrade git
git --version
echo "Git安装路径：$(which git)"

# 步骤3：安装glab（GitLab CLI，arm64原生）
echo -e "\n===== 3. 安装/更新glab（GitLab CLI） ====="
brew install glab || brew upgrade glab
glab --version

# 步骤4：安装GitLab Runner（arm64原生）
echo -e "\n===== 4. 安装GitLab Runner（arm64） ====="
sudo curl --output /usr/local/bin/gitlab-runner \
  "https://s3.dualstack.us-east-1.amazonaws.com/gitlab-runner-downloads/latest/binaries/gitlab-runner-darwin-arm64"
sudo chmod +x /usr/local/bin/gitlab-runner

# 验证Runner架构
echo "GitLab Runner架构验证："
file /usr/local/bin/gitlab-runner | grep -q "arm64" && echo "✅ Runner为arm64原生版本" || echo "❌ Runner架构异常"

# 配置Runner为用户级服务（避免sudo权限问题）
echo -e "\n===== 5. 配置GitLab Runner服务 ====="
mkdir -p ~/gitlab-runner
gitlab-runner install --user $(whoami) --working-directory ~/gitlab-runner
gitlab-runner start
gitlab-runner status || echo "Runner服务启动完成（可手动执行 gitlab-runner start 确认）"

# 安装完成提示
echo -e "\n===== 安装完成！====="
echo "1. Git版本：$(git --version)"
echo "2. glab版本：$(glab --version | head -n1)"
echo "3. GitLab Runner版本：$(gitlab-runner --version | head -n1)"
echo -e "\n下一步操作："
echo "  - 配置glab：glab auth login"
echo "  - 注册Runner：gitlab-runner register（需GitLab项目的注册令牌）"
EOF

# 2. 赋予脚本执行权限并运行
chmod +x gitlab-m4max-install.sh
./gitlab-m4max-install.sh
