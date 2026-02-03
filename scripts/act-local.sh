#!/bin/bash
# Run GitHub Actions locally with act
# Usage: ./scripts/act-local.sh [command]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎭 GitHub Actions Local Runner${NC}"
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo -e "${YELLOW}⚠️  act not found. Install it first:${NC}"
    echo "   brew install act"
    echo "   or: curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    exit 1
fi

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not running. Start Docker first.${NC}"
    exit 1
fi

# Default: run full CI
case "${1:-run}" in
    run|"")
        echo -e "${GREEN}▶️  Running full CI workflow...${NC}"
        echo ""
        act --container-architecture linux/amd64
        ;;
    list|ls|l)
        echo -e "${GREEN}📋 Available jobs:${NC}"
        act -l
        ;;
    test|t)
        echo -e "${GREEN}🧪 Running test job only...${NC}"
        act -j test --container-architecture linux/amd64
        ;;
    dry-run|dry|d)
        echo -e "${GREEN}🔍 Dry run (no execution)...${NC}"
        act -n
        ;;
    verbose|v)
        echo -e "${GREEN}🔊 Verbose mode...${NC}"
        act -v --container-architecture linux/amd64
        ;;
    help|h)
        echo "Usage: ./scripts/act-local.sh [command]"
        echo ""
        echo "Commands:"
        echo "  run       Run full CI (default)"
        echo "  list      List available jobs"
        echo "  test      Run only the test job"
        echo "  dry-run   Show what would run without executing"
        echo "  verbose   Run with verbose output"
        echo "  help      Show this help"
        echo ""
        echo "Examples:"
        echo "  ./scripts/act-local.sh"
        echo "  ./scripts/act-local.sh test"
        echo "  ./scripts/act-local.sh list"
        ;;
    *)
        echo -e "${YELLOW}Unknown command: $1${NC}"
        echo "Run './scripts/act-local.sh help' for usage"
        exit 1
        ;;
esac
