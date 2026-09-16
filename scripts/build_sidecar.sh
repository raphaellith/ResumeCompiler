#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PYINSTALLER="${PYINSTALLER:-venv/bin/pyinstaller}"

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) TARGET_TRIPLE="aarch64-apple-darwin" ;;
  Darwin-x86_64) TARGET_TRIPLE="x86_64-apple-darwin" ;;
  *)
    echo "Unsupported platform: $(uname -s)-$(uname -m)" >&2
    exit 1
    ;;
esac

"$PYINSTALLER" --onefile --console --name backend \
  --add-data "backend/model/resources/template.tex:backend/model/resources/" \
  --collect-submodules uvicorn \
  backend/run.py

mkdir -p frontend/resumecompiler/src-tauri/binaries
cp dist/backend "frontend/resumecompiler/src-tauri/binaries/backend-${TARGET_TRIPLE}"

echo "Staged sidecar at frontend/resumecompiler/src-tauri/binaries/backend-${TARGET_TRIPLE}"