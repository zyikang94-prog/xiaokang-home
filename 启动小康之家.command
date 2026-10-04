#!/bin/bash
# 「小康之家」本地启动脚本（双击即可运行）
cd "$(dirname "$0")"
PORT=27153
URL="http://localhost:$PORT/"

# 若服务已在运行，直接打开浏览器
if lsof -i :$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  open "$URL"
  exit 0
fi

# 检查 Node.js
if ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display dialog "未检测到 Node.js，npm 命令不可用。\n请先安装 Node.js（官网 nodejs.org），再运行本程序。" buttons {"知道了"} defaultButton 1'
  exit 1
fi

# 首次运行自动安装依赖
if [ ! -d node_modules ]; then
  echo "正在安装依赖，仅首次运行需要……"
  npm install
fi

# 延迟 2 秒后自动打开浏览器
( sleep 2; open "$URL" ) &

# 启动服务（关闭此窗口即停止服务）
echo "「小康之家」正在启动，浏览器会自动打开……"
npm run dev -- --port $PORT --strictPort
