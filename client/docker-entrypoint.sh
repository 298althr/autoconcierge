#!/bin/sh
set -e

# Ensure node_modules are present (happens if anonymous volume is empty)
if [ ! -f "/app/node_modules/.bin/next" ]; then
  echo "📦 node_modules missing in volume, installing..."
  npm install
fi

# Clean potentially stale artifacts inside the container filesystem
if [ -d ".next" ]; then
  echo "🧹 Cleaning .next..."
  rm -rf .next/* .next/.[!.]* 2>/dev/null || true
fi

echo "🚀 Starting Next.js..."
exec "$@"
