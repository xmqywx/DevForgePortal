#!/bin/bash
# DevForge Portal 发布脚本
# 用法: bash deploy.sh
#
# 规则:
# 1. 本地 rsync 源码（排除 node_modules/.next/.git/.env.local/devforge.db）
# 2. 服务器 npm install + build + pm2 restart
# 3. 不动 nginx 配置（certbot SSL 会丢）
# 4. 不动 devforge.db（用户数据会丢）
# 5. 同步项目数据到服务器

set -e

SERVER="root@106.54.19.137"
REMOTE_DIR="/opt/devforge-portal"
DEVFORGE_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_DEVFORGE="/Users/ying/Documents/DevForge"

echo ""
echo "  ⚡ DevForge Portal Deploy"
echo "  ─────────────────────────"
echo ""

# Step 1: rsync source code (exclude dangerous files)
echo "  [1/4] Syncing source code..."
rsync -avz \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude .env.local \
  --exclude devforge.db \
  --exclude .DS_Store \
  -e ssh \
  "$DEVFORGE_DIR/" "$SERVER:$REMOTE_DIR/" \
  | tail -1

# Step 2: Backup DB + install + build + restart
echo "  [2/5] Backing up server DB..."
ssh "$SERVER" "cp $REMOTE_DIR/devforge.db $REMOTE_DIR/devforge.db.bak 2>/dev/null && echo '  DB backed up' || echo '  No DB to backup'"

echo "  [3/5] Building on server..."
ssh "$SERVER" "cd $REMOTE_DIR && \
  npm install --silent 2>&1 | tail -1 && \
  rm -rf .next && \
  npm run build 2>&1 | tail -2 && \
  pm2 restart devforge-portal 2>/dev/null && \
  pm2 restart devforge-ws 2>/dev/null && \
  echo '  Build OK'"

# Verify DB not corrupted after build
echo "  Verifying DB integrity..."
ssh "$SERVER" "sqlite3 $REMOTE_DIR/devforge.db 'SELECT COUNT(*) FROM feedback' 2>/dev/null | xargs -I{} echo '  Feedback: {} rows'"

# Step 4: Sync project data (push)
echo "  [4/5] Syncing data..."
cd "$LOCAL_DEVFORGE"
if [ -f "scripts/sync.ts" ]; then
  npx tsx scripts/sync.ts push 2>&1 | grep -E "Push result|Sync complete|error"
else
  echo "  Sync script not found, skipping"
fi

# Step 5: Verify
echo "  [5/5] Verifying..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://forge.wdao.chat)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ https://forge.wdao.chat — 200 OK"
else
  echo "  ❌ https://forge.wdao.chat — HTTP $HTTP_CODE"
fi

echo ""
echo "  Deploy complete!"
echo ""
