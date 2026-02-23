#!/bin/sh
set -e

HASH_FILE=node_modules/.package-hash
CURRENT_HASH=$(md5sum package.json | awk '{print $1}')

if [ ! -f node_modules/.bin/next ] || [ "$(cat $HASH_FILE 2>/dev/null)" != "$CURRENT_HASH" ]; then
  echo "📦 Installing dependencies (Linux native)..."
  npm install --include=optional
  echo "$CURRENT_HASH" > "$HASH_FILE"
  echo "✅ Dependencies installed."
else
  echo "✅ Dependencies up to date."
fi

exec "$@"
