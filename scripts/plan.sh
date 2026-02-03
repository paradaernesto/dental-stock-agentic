#!/bin/bash

# plan.sh - Validate a specification file
#
# Usage: ./scripts/plan.sh <path-to-spec>
# Example: ./scripts/plan.sh specs/001-supply-crud.md

set -e

SPEC_FILE="$1"

if [ -z "$SPEC_FILE" ]; then
    echo "❌ Error: No spec file provided"
    echo "Usage: ./scripts/plan.sh <path-to-spec>"
    echo "Example: ./scripts/plan.sh specs/001-my-feature.md"
    exit 1
fi

if [ ! -f "$SPEC_FILE" ]; then
    echo "❌ Error: Spec file not found: $SPEC_FILE"
    exit 1
fi

echo "📋 Validating spec: $SPEC_FILE"
echo ""

# Check for required sections
REQUIRED_SECTIONS=("Overview" "Deliverables" "Implementation Steps")
MISSING=0

for section in "${REQUIRED_SECTIONS[@]}"; do
    if grep -q "^##.*$section" "$SPEC_FILE"; then
        echo "  ✅ Found section: $section"
    else
        echo "  ⚠️  Missing recommended section: $section"
        MISSING=$((MISSING + 1))
    fi
done

echo ""
echo "📊 Spec Statistics:"
echo "  Lines: $(wc -l < "$SPEC_FILE")"
echo "  Checkboxes: $(grep -c '\- \[\s*\]' "$SPEC_FILE" || true)"
echo "  Completed: $(grep -c '\- \[x\]' "$SPEC_FILE" || true)"

echo ""
if [ $MISSING -eq 0 ]; then
    echo "✅ Spec validation passed"
else
    echo "⚠️  Spec has $MISSING warnings (not critical)"
fi

echo ""
echo "💡 Next steps:"
echo "  1. Review the spec: cat $SPEC_FILE"
echo "  2. Create a branch: git checkout -b feat/$(basename "$SPEC_FILE" .md)"
echo "  3. Implement following the spec"
echo "  4. Test: pnpm test"
echo "  5. Commit and push"
