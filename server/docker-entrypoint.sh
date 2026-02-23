#!/bin/sh
# Entrypoint script: ensures node_modules are installed before starting.
# Named volumes start empty, so we check for a key marker file to decide
# whether to run npm install.

set -e

# Check if a key binary (nodemon) exists — if not, run npm install
if [ ! -f "/app/node_modules/.bin/nodemon" ]; then
  echo "📦 Installing dependencies (node_modules is empty)..."
  npm install --legacy-peer-deps
  echo "✅ Dependencies installed."
fi

echo "🚀 Starting server..."
exec "$@"
