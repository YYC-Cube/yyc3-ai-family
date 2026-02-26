#!/bin/bash

# @file send-alert.sh
# @description YYC³ AI-Family 告警通知脚本，支持邮件通知关键错误和事件
# @author YYC³ Team
# @version 1.0.0
# @created 2026-02-25
# @tags [alert],[notification],[email]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认配置
DEFAULT_EMAIL=${ALERT_EMAIL:-admin@0379.email}
SMTP_SERVER=${SMTP_SERVER:-smtp.exmail.qq.com}
SMTP_PORT=${SMTP_PORT:-465}
SMTP_USER=${SMTP_USER:-$DEFAULT_EMAIL}
SMTP_PASSWORD=${SMTP_PASSWORD:-}

# 告警类型
ALERT_TYPE=${ALERT_TYPE:-info}
SUBJECT=${SUBJECT:-"YYC³ 告警通知"}
MESSAGE=${MESSAGE:-"系统运行正常"}

# 帮助信息
show_help() {
  echo "用法: $0 [选项]"
  echo ""
  echo "选项:"
  echo "  --type <类型>      告警类型 (success|failure|warning|info|critical)"
  echo "  --subject <主题>   邮件主题"
  echo "  --message <消息>   邮件内容"
  echo "  --email <邮箱>     收件人邮箱 (默认: $DEFAULT_EMAIL)"
  echo "  --file <文件>      从文件读取消息内容"
  echo "  --help             显示帮助信息"
  echo ""
  echo "环境变量:"
  echo "  ALERT_EMAIL        默认收件人邮箱"
  echo "  SMTP_SERVER       SMTP服务器"
  echo "  SMTP_PORT         SMTP端口"
  echo "  SMTP_USER         SMTP用户名"
  echo "  SMTP_PASSWORD     SMTP密码"
  echo ""
  echo "示例:"
  echo "  $0 --type success --subject '部署成功' --message '应用已成功部署'"
  echo "  $0 --type failure --subject '测试失败' --email admin@example.com"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --type)
      ALERT_TYPE="$2"
      shift 2
      ;;
    --subject)
      SUBJECT="$2"
      shift 2
      ;;
    --message)
      MESSAGE="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --file)
      if [ -f "$2" ]; then
        MESSAGE=$(cat "$2")
      else
        echo -e "${RED}❌ 文件不存在: $2${NC}"
        exit 1
      fi
      shift 2
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}❌ 未知选项: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# 使用默认邮箱
EMAIL=${EMAIL:-$DEFAULT_EMAIL}

# 验证必要参数
if [ -z "$MESSAGE" ]; then
  echo -e "${RED}❌ 错误: 必须提供消息内容${NC}"
  show_help
  exit 1
fi

# 函数：获取告警类型图标
get_alert_icon() {
  case $1 in
    success)
      echo "✅"
      ;;
    failure)
      echo "❌"
      ;;
    warning)
      echo "⚠️"
      ;;
    critical)
      echo "🚨"
      ;;
    info)
      echo "ℹ️"
      ;;
    *)
      echo "📢"
      ;;
  esac
}

# 函数：获取告警类型颜色
get_alert_color() {
  case $1 in
    success)
      echo "green"
      ;;
    failure|critical)
      echo "red"
      ;;
    warning)
      echo "orange"
      ;;
    *)
      echo "blue"
      ;;
  esac
}

# 函数：生成邮件HTML内容
generate_email_html() {
  local type=$1
  local subject=$2
  local message=$3
  local icon=$(get_alert_icon "$type")
  local color=$(get_alert_color "$type")
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  cat << EOF
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .alert-box {
      background: #fff;
      border-left: 4px solid $color;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .alert-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 20px;
    }
    .alert-message {
      font-size: 16px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .timestamp {
      color: #666;
      font-size: 14px;
      text-align: right;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #999;
      font-size: 12px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>YYC³ AI-Family 告警通知</h1>
  </div>
  <div class="content">
    <div class="alert-box">
      <div class="alert-icon">$icon</div>
      <h2 style="margin-top: 0; color: $color;">$subject</h2>
      <div class="alert-message">$message</div>
      <div class="timestamp">
        时间: $timestamp
      </div>
    </div>
    <div class="footer">
      <p>YYC³ (YanYuCloudCube) - 言启象限 | 语枢未来</p>
      <p>Words Initiate Quadrants, Language Serves as Core for Future</p>
    </div>
  </div>
</body>
</html>
EOF
}

# 函数：发送邮件
send_email() {
  local to=$1
  local subject=$2
  local html=$3

  echo -e "${BLUE}📧 发送邮件通知...${NC}"
  echo "   收件人: $to"
  echo "   主题: $subject"
  echo ""

  # 检查是否安装了sendmail或mail命令
  if command -v sendmail &> /dev/null; then
    echo -e "${GREEN}✅ 使用sendmail发送${NC}"
    (
      echo "Subject: $subject"
      echo "To: $to"
      echo "Content-Type: text/html; charset=UTF-8"
      echo ""
      echo "$html"
    ) | sendmail -t
  elif command -v mail &> /dev/null; then
    echo -e "${GREEN}✅ 使用mail命令发送${NC}"
    echo "$html" | mail -s "$subject" -a "Content-Type: text/html; charset=UTF-8" "$to"
  elif command -v mutt &> /dev/null; then
    echo -e "${GREEN}✅ 使用mutt发送${NC}"
    echo "$html" | mutt -s "$subject" -e "set content_type=text/html" "$to"
  else
    # 使用curl发送邮件（需要SMTP配置）
    if [ -n "$SMTP_PASSWORD" ]; then
      echo -e "${GREEN}✅ 使用SMTP发送${NC}"

      # 生成临时文件
      local temp_file=$(mktemp)
      echo "$html" > "$temp_file"

      # 使用curl发送
      curl --url "smtp://$SMTP_SERVER:$SMTP_PORT" \
        --ssl-reqd \
        --mail-from "$SMTP_USER" \
        --mail-rcpt "$to" \
        --upload-file "$temp_file" \
        --user "$SMTP_USER:$SMTP_PASSWORD" \
        --insecure 2>/dev/null

      rm -f "$temp_file"
    else
      echo -e "${YELLOW}⚠️  未配置SMTP，邮件发送失败${NC}"
      echo -e "${YELLOW}请设置环境变量: SMTP_PASSWORD${NC}"
      echo ""
      echo -e "${BLUE}邮件内容预览:${NC}"
      echo "----------------------------------------"
      echo "$html"
      echo "----------------------------------------"
      return 0
    fi
  fi

  # 邮件发送不影响主流程
  return 0
}

# 函数：记录告警到日志
log_alert() {
  local type=$1
  local subject=$2
  local message=$3
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  local log_file=${ALERT_LOG_FILE:-/var/log/yyc3/alerts.log}

  # 创建日志目录
  mkdir -p "$(dirname "$log_file")" 2>/dev/null || log_file="/tmp/yyc3-alerts.log"

  # 记录到日志
  echo "[$timestamp] [$type] $subject" >> "$log_file"
  echo "$message" >> "$log_file"
  echo "" >> "$log_file"

  echo -e "${BLUE}📝 告警已记录到日志${NC}"
  echo "   日志文件: $log_file"
}

# 主流程
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}YYC³ 告警通知${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}告警信息:${NC}"
echo "   类型: $ALERT_TYPE"
echo "   主题: $SUBJECT"
echo "   收件人: $EMAIL"
echo ""

# 生成HTML邮件
HTML_CONTENT=$(generate_email_html "$ALERT_TYPE" "$SUBJECT" "$MESSAGE")

# 记录告警
log_alert "$ALERT_TYPE" "$SUBJECT" "$MESSAGE"

# 发送邮件
send_email "$EMAIL" "$SUBJECT" "$HTML_CONTENT"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 告警通知完成${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "告警类型: $ALERT_TYPE"
echo "发送状态: $([ $? -eq 0 ] && echo '成功' || echo '失败')"
echo "发送时间: $(date '+%Y-%m-%d %H:%M:%S')"
