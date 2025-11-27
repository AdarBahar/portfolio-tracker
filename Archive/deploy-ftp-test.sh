#!/usr/bin/env bash

# Simple FTP deployment test script
# - Loads credentials from backend/.env.deployment
# - Connects via FTP
# - Uploads a single test file to verify connectivity

set -euo pipefail

# Resolve paths relative to this script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.deployment"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found."
  echo "Create backend/.env.deployment with FTP_* variables before running this script."
  exit 1
fi

# Load deployment environment variables (FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_REMOTE_DIR, ...)
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

: "${FTP_HOST:?FTP_HOST is required in .env.deployment}"
: "${FTP_USER:?FTP_USER is required in .env.deployment}"
: "${FTP_PASSWORD:?FTP_PASSWORD is required in .env.deployment}"
: "${FTP_REMOTE_DIR:?FTP_REMOTE_DIR is required in .env.deployment}"

TEST_LOCAL_FILE="$SCRIPT_DIR/BUILD.md"
TEST_REMOTE_FILE="deploy-test.txt"

if [ ! -f "$TEST_LOCAL_FILE" ]; then
  echo "ERROR: Test file $TEST_LOCAL_FILE does not exist."
  echo "Make sure backend/BUILD.md exists or change TEST_LOCAL_FILE in the script."
  exit 1
fi

echo "Connecting to FTP server $FTP_HOST ..."
echo "Uploading $TEST_LOCAL_FILE to $FTP_REMOTE_DIR/$TEST_REMOTE_FILE ..."

ftp -inv "$FTP_HOST" <<EOF
user $FTP_USER $FTP_PASSWORD
binary
cd $FTP_REMOTE_DIR
put "$TEST_LOCAL_FILE" "$TEST_REMOTE_FILE"
bye
EOF

echo "FTP upload test completed. Check $FTP_REMOTE_DIR/$TEST_REMOTE_FILE on the server."

