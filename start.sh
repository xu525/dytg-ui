#!/bin/bash

# 代理管理系统 - 完整启动脚本
# 功能：
# 1. 检测云端是否有最新版本并自动更新
# 2. 本地更改后自动同步到云端
# 3. 启动HTTP服务器

set -e

cd /workspace

echo "=========================================="
echo "  代理管理系统 - 智能启动脚本"
echo "=========================================="
echo ""

# 检测云端更新
echo "🔍 检查云端是否有最新版本..."
git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo ""
    echo "⚠️  发现云端有更新！"
    echo "   本地版本: ${LOCAL:0:7}"
    echo "   云端版本: ${REMOTE:0:7}"
    echo ""
    
    # 在CI环境中自动更新，非CI环境提示用户
    if [ "$CI" = "true" ]; then
        echo "📥 CI环境：自动从云端拉取最新代码..."
        git pull origin main
        if [ $? -eq 0 ]; then
            echo "✅ 更新成功！"
        else
            echo "❌ 更新失败，保留本地版本"
        fi
    else
        # 交互模式
        echo "是否更新到云端最新版本？"
        echo "  1) 是，更新到最新版本"
        echo "  2) 否，继续使用本地版本"
        echo ""
        read -p "请输入选项 (1/2): " choice
        
        case $choice in
            1)
                echo ""
                echo "📥 正在从云端拉取最新代码..."
                git pull origin main
                if [ $? -eq 0 ]; then
                    echo "✅ 更新成功！"
                else
                    echo "❌ 更新失败，保留本地版本"
                fi
                ;;
            2)
                echo "📝 继续使用本地版本"
                ;;
            *)
                echo "⚠️ 无效选项，继续使用本地版本"
                ;;
        esac
    fi
else
    echo "✅ 云端已是最新版本"
fi

echo ""
echo "🔄 检查本地是否有未提交的更改..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现本地有未提交的更改"
    echo ""
    
    # 显示更改的文件
    echo "更改的文件："
    git status --short
    echo ""
    
    # 自动提交并推送
    echo "📤 自动同步到云端..."
    git add -A
    git commit -m "更新: $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ 同步成功！"
    else
        echo "❌ 同步失败"
    fi
else
    echo "✅ 本地已是最新状态，无需同步"
fi

echo ""
echo "=========================================="
echo "🚀 启动代理管理系统..."
echo "=========================================="
echo ""

# 停止已存在的服务器
echo "🔄 清理旧进程..."
pkill -f "python3 -m http.server" 2>/dev/null || true
sleep 1

# 启动HTTP服务器
echo "🌐 启动HTTP服务器 (端口 8080)..."
python3 -m http.server 8080 > /dev/null 2>&1 &
SERVER_PID=$!

sleep 2

# 验证服务器是否启动成功
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
    echo ""
    echo "=========================================="
    echo "✅ 代理管理系统启动成功！"
    echo "=========================================="
    echo ""
    echo "🌐 访问地址: http://localhost:8080/"
    echo "📋 进程ID: $SERVER_PID"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    
    # 保持脚本运行
    wait $SERVER_PID
else
    echo "❌ 服务器启动失败"
    exit 1
fi
