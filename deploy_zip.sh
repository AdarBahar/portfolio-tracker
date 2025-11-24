#!/usr/bin/env bash
set -euo pipefail

# Deployment bundle script for Portfolio Tracker / FantasyBroker
#
# This script creates a production deployment zip with the structure:
#
# - backend
#    - public
#    - src
#    - tmp
#    .env.example
#    openapi.json
#    package.json
# - scripts
#    - tradeRoom
#       <trade room modules>
#    <all frontend js scripts>
# - styles
#    <all frontend css files>
# index.html
# login.html
# trade-room.html
#
# Usage (from repo root):
#   ./deploy_zip.sh
#
# Output:
#   dist/deploy/portfolio-tracker-deploy.zip

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
OUT_DIR="$ROOT_DIR/dist/deploy"
TMP_DIR="$OUT_DIR/tmp_package"
ZIP_NAME="portfolio-tracker-deploy.zip"
ZIP_PATH="$OUT_DIR/$ZIP_NAME"

mkdir -p "$OUT_DIR"
rm -rf "$TMP_DIR"

echo "[deploy_zip] Running backend build..."
(cd "$BACKEND_DIR" && npm run build)

echo "[deploy_zip] Assembling deployment directory structure..."

# Create backend structure
mkdir -p "$TMP_DIR/backend/public" "$TMP_DIR/backend/src" "$TMP_DIR/backend/tmp"

# Copy backend artifacts from backend/dist
cp "$BACKEND_DIR/dist/openapi.json" "$TMP_DIR/backend/openapi.json"
cp "$BACKEND_DIR/dist/package.json" "$TMP_DIR/backend/package.json"
cp "$BACKEND_DIR/dist/.env.example" "$TMP_DIR/backend/.env.example"
cp -R "$BACKEND_DIR/dist/src/"* "$TMP_DIR/backend/src/"

# Frontend scripts and styles
mkdir -p "$TMP_DIR/scripts" "$TMP_DIR/styles"

# Copy frontend scripts, excluding development-only files
for file in "$ROOT_DIR"/scripts/*.js; do
    filename=$(basename "$file")
    # Exclude config.local.js and config.local.example.js (development only)
    if [[ "$filename" != "config.local.js" && "$filename" != "config.local.example.js" ]]; then
        cp "$file" "$TMP_DIR/scripts/"
    fi
done

cp "$ROOT_DIR"/styles/*.css "$TMP_DIR/styles/"

# Trade room scripts (modular structure)
mkdir -p "$TMP_DIR/scripts/tradeRoom"
cp "$ROOT_DIR"/scripts/tradeRoom/*.js "$TMP_DIR/scripts/tradeRoom/"

# HTML entry points
cp "$ROOT_DIR/index.html" "$TMP_DIR/index.html"
cp "$ROOT_DIR/login.html" "$TMP_DIR/login.html"
cp "$ROOT_DIR/trade-room.html" "$TMP_DIR/trade-room.html"

# Ensure HTML files have 644 permissions inside the archive
chmod 644 "$TMP_DIR/index.html"
chmod 644 "$TMP_DIR/login.html"
chmod 644 "$TMP_DIR/trade-room.html"

# Create zip archive
(
  cd "$TMP_DIR" && \
  zip -r "$ZIP_PATH" .
)

echo "[deploy_zip] Created deployment archive at: $ZIP_PATH"

