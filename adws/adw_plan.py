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
    
    # Generate spec using Claude
    Path(spec_file).parent.mkdir(parents=True, exist_ok=True)
    
    print("🤖 Generating spec with AI...")
    
    # Build prompt for spec generation - IMPORTANT: Return ONLY the spec, no explanations
    spec_prompt = f"""Create a detailed implementation spec for this GitHub issue.

Issue Title: {issue_title}
Issue Description: {issue_body or "_No description provided_"}
Issue Type: {issue_class}
Issue Number: #{args.issue_number}
ADW ID: {adw_id}

IMPORTANT: Return ONLY the spec content in the exact format below. Do not add any introduction, summary, or explanation. Start directly with the spec.

# Spec {spec_number:03d}: {issue_title}

**ADW ID:** {adw_id}  
**Issue:** #{args.issue_number}  
**Type:** {issue_class}  
**Status:** 🔄 In Progress

## Overview

[2-3 sentences describing what needs to be built]

## Requirements

- [REQ-1] [Specific functional requirement]
- [REQ-2] [Technical requirement]
- [REQ-3] [Data/validation requirement]

## Implementation Plan

- [ ] [Specific actionable task 1]
- [ ] [Specific actionable task 2]
- [ ] [Specific actionable task 3]
- [ ] [Testing task]
- [ ] [Documentation task]

## Files to Modify

- `[file path]` - [What needs to change]
- `[file path]` - [What needs to change]

## Acceptance Criteria

- [ ] [Specific testable criteria 1]
- [ ] [Specific testable criteria 2]
- [ ] [Specific testable criteria 3]

## Notes

[Any technical considerations, dependencies, or future enhancements]
"""
    
    success, spec_content = run_slash_command(
        "Generate a detailed implementation spec:",
        [spec_prompt],
        output_file=f"agents/{adw_id}/planner/raw_output.txt"
    )
    
    if success and spec_content:
        # Clean up the output to extract just the spec
        lines = spec_content.split('\n')
        spec_lines = []
        in_spec = False
        for line in lines:
            # Start capturing when we see the spec header
            if line.startswith('# Spec') or line.startswith('**ADW ID:**'):
                in_spec = True
            # Stop at certain patterns that indicate end of spec
            if in_spec and line.startswith('The spec is saved') or line.startswith('This spec'):
                break
            if in_spec:
                spec_lines.append(line)
        
        # If we found spec content, use it; otherwise use fallback
        if spec_lines and len(spec_lines) > 5:
            spec_content = '\n'.join(spec_lines)
            print(f"✅ Generated detailed spec: {spec_file}")
        else:
            print(f"⚠️  AI output didn't contain valid spec format, using basic template")
            success = False
    else:
        print(f"⚠️  AI spec generation failed, using basic template")
    
    if not success or not spec_lines or len(spec_lines) <= 5:
        # Fallback to basic spec
        print(f"⚠️  Using basic template for spec")
        spec_content = f"""# Spec {spec_number:03d}: {issue_title}

**ADW ID:** {adw_id}  
**Issue:** #{args.issue_number}  
**Type:** {issue_class}  
**Status:** 🔄 In Progress

## Overview

{issue_body or "_No description provided_"}

## Requirements

- [REQ-1] Define requirements based on issue description

## Implementation Plan

- [ ] Analyze requirements
- [ ] Design solution
- [ ] Implement changes
- [ ] Add tests
- [ ] Update documentation

## Files to Modify

- TBD

## Acceptance Criteria

- [ ] Feature works as specified in the issue
- [ ] Tests pass
- [ ] Code reviewed

## Notes

_Generated by ADW_
"""
    
    with open(spec_file, "w") as f:
        f.write(spec_content)
    
    print(f"💾 Saved spec: {spec_file}")
    
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
