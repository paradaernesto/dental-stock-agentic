#!/bin/bash
# Test ADW issue-triggered workflow locally with act
# Usage: ./scripts/act-issues.sh [issue_number]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎭 ADW Issue Workflow - Local Test${NC}"
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo -e "${YELLOW}⚠️  act not found. Install it first:${NC}"
    echo "   brew install act"
    exit 1
fi

# Load .env file if it exists
if [ -f .env ]; then
    echo -e "${GREEN}Loading .env...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
    # Alias ANTHROPIC_API_KEY if only CLAUDE_API_KEY is set
    if [ -z "$ANTHROPIC_API_KEY" ] && [ -n "$CLAUDE_API_KEY" ]; then
        export ANTHROPIC_API_KEY="$CLAUDE_API_KEY"
    fi
fi

# Check required secrets
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  ANTHROPIC_API_KEY not set${NC}"
    echo "Add it to .env or export it:"
    echo "   export ANTHROPIC_API_KEY=sk-ant-..."
    exit 1
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  GITHUB_TOKEN not set${NC}"
    echo "Add it to .env or export it:"
    echo "   export GITHUB_TOKEN=ghp_..."
    exit 1
fi

# Issue number (optional, for context)
ISSUE_NUM="${1:-1}"

echo -e "${GREEN}Testing with issue #$ISSUE_NUM${NC}"
echo ""

# Run the workflow with event payload
act workflow_dispatch \
    -W .github/workflows/issue-triggered.yml \
    -s GITHUB_TOKEN="$GITHUB_TOKEN" \
    -s ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    -e <(echo '{
        "issue": {
            "number": '$ISSUE_NUM',
            "title": "Test issue for ADW",
            "body": "This is a test issue to validate the ADW workflow",
            "labels": [{"name": "adw"}]
        }
    }') \
    --container-architecture linux/amd64
