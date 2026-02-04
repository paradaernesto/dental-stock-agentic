#!/usr/bin/env python3
"""
ADW Plan - Create implementation plan for GitHub issue.

Usage:
    python adws/adw_plan.py <issue-number>
"""

import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from adw_modules.state import save_state, load_state
from adw_modules.github import fetch_issue
from adw_modules.utils import generate_adw_id, generate_branch_name, classify_issue
from adw_modules.agent import run_slash_command


def main():
    parser = argparse.ArgumentParser(description="ADW Plan - Create implementation plan")
    parser.add_argument("issue_number", type=int, help="GitHub issue number")
    parser.add_argument("--adw-id", help="Existing ADW ID (optional)")
    args = parser.parse_args()
    
    # Generate or use ADW ID
    adw_id = args.adw_id or generate_adw_id()
    print(f"🔹 ADW ID: {adw_id}")
    
    # Fetch issue
    print(f"📥 Fetching issue #{args.issue_number}...")
    issue = fetch_issue(args.issue_number)
    
    if not issue:
        print("❌ Could not fetch issue. Continuing with minimal info.")
        issue_title = f"Issue {args.issue_number}"
        issue_body = ""
        issue_labels = []
    else:
        issue_title = issue.title
        issue_body = issue.body
        issue_labels = issue.labels
        print(f"✅ Found: {issue_title}")
    
    # Classify issue
    issue_class = classify_issue(issue_title, issue_body, issue_labels)
    print(f"🏷️  Classified as: {issue_class}")
    
    # Generate branch name
    branch_name = generate_branch_name(args.issue_number, issue_title, issue_class)
    print(f"🌿 Branch: {branch_name}")
    
    # Create spec file path
    spec_number = len(list(Path("specs").glob("*.md"))) + 1 if Path("specs").exists() else 1
    spec_file = f"specs/{spec_number:03d}-{branch_name}.md"
    print(f"📝 Spec: {spec_file}")
    
    # Create initial spec content
    Path(spec_file).parent.mkdir(parents=True, exist_ok=True)
    spec_content = f"""# Spec {spec_number:03d}: {issue_title}

**ADW ID:** {adw_id}  
**Issue:** #{args.issue_number}  
**Type:** {issue_class}  
**Status:** 🔄 In Progress

## Overview

{issue_body or "_No description provided_"}

## Implementation Plan

- [ ] Analyze requirements
- [ ] Design solution
- [ ] Implement changes
- [ ] Add tests
- [ ] Update documentation

## Acceptance Criteria

- [ ] Feature works as specified
- [ ] Tests pass
- [ ] Code reviewed
- [ ] Documentation updated

## Notes

_Any additional notes or context_
"""
    
    with open(spec_file, "w") as f:
        f.write(spec_content)
    
    print(f"✅ Created spec: {spec_file}")
    
    # Run slash command to expand plan
    print("🤖 Running planner...")
    success, output = run_slash_command(
        "/classify_issue",
        [issue_title, issue_body],
        output_file=f"agents/{adw_id}/planner/raw_output.txt"
    )
    
    if not success:
        print(f"⚠️  Planner command failed (non-critical)")
        print(f"   Output: {output[:500] if output else 'No output'}")
        # Don't fail the whole planning - we already have a basic spec
    
    # Save state
    state = {
        "adw_id": adw_id,
        "issue_number": str(args.issue_number),
        "branch_name": branch_name,
        "plan_file": spec_file,
        "issue_class": issue_class
    }
    
    from adw_modules.data_types import ADWStateData
    save_state(ADWStateData(**state))
    print(f"💾 State saved to agents/{adw_id}/adw_state.json")
    
    # Next steps
    print("\n📋 Next Steps:")
    print(f"  1. Edit spec: {spec_file}")
    print(f"  2. Create branch: git checkout -b {branch_name}")
    print(f"  3. Build: python adws/adw_build.py {args.issue_number} {adw_id}")
    
    # Return success - basic spec was created even if Claude command failed
    return 0


if __name__ == "__main__":
    sys.exit(main())
