#!/bin/bash
# Run act with environment variables from .env

set -e

# Load .env file if it exists
if [ -f .env ]; then
  echo "Loading .env..."
  export $(cat .env | grep -v '^#' | xargs)
fi

# Default to local workflow (no token needed for external actions)
WORKFLOW="${1:-.github/workflows/ci-local.yml}"

echo "Running act with workflow: $WORKFLOW"
act -W "$WORKFLOW" "${@:2}"
