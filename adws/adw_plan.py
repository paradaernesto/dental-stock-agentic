#!/usr/bin/env python3
"""
ADW Plan - Create implementation plan for GitHub issue.

Usage:
    python adws/adw_plan.py <issue-number>
"""

import sys
import argparse
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from adw_modules.state import save_state, load_state
from adw_modules.github import fetch_issue
from adw_modules.utils import generate_adw_id, generate_branch_name, classify_issue
from adw_modules.agent import run_slash_command


def parse_spec_from_output(output: str) -> str:
    """Parse spec content from AI output.
    
    Handles both Claude (plain markdown) and Kimi (TextPart format) outputs.
    """
    # Try to find spec content in TextPart format (Kimi)
    # Pattern: TextPart(text='...content...')
    textpart_pattern = r"TextPart\([^)]*text='([^']*)'"
    textparts = re.findall(textpart_pattern, output, re.DOTALL)
    
    if textparts:
        # Combine all TextPart contents
        combined = "\n".join(textparts)
        # Unescape newlines and quotes
        combined = combined.replace('\\n', '\n').replace("\\'", "'")
        if '# Spec' in combined or '**ADW ID:**' in combined:
            return combined
    
    # Try to find content between markdown code blocks
    codeblock_pattern = r'```markdown\n(.*?)\n```'
    codeblocks = re.findall(codeblock_pattern, output, re.DOTALL)
    if codeblocks:
        for block in codeblocks:
            if '# Spec' in block or '**ADW ID:**' in block:
                return block
    
    # Look for spec header and extract from there (Claude format)
    lines = output.split('\n')
    spec_lines = []
    in_spec = False
    
    for line in lines:
        # Start capturing when we see the spec header
        if line.startswith('# Spec') or line.startswith('**ADW ID:**'):
            in_spec = True
        # Stop at patterns that indicate end of spec or start of metadata
        if in_spec:
            if any(marker in line for marker in ['TurnBegin(', 'StepBegin(', 'ToolCall(', 'ThinkPart(', 'StatusUpdate(']):
                break
            if line.startswith('The spec is saved') or line.startswith('This spec'):
                break
            spec_lines.append(line)
    
    if spec_lines and len(spec_lines) > 5:
        return '\n'.join(spec_lines)
    
    # If no spec found, return empty string
    return ""


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
    
    # Ensure directories exist
    Path(spec_file).parent.mkdir(parents=True, exist_ok=True)
    Path(f"agents/{adw_id}/planner").mkdir(parents=True, exist_ok=True)
    
    print("🤖 Generating spec with AI...")
    
    # Build prompt for spec generation
    spec_prompt = f"""Create a detailed implementation spec for this GitHub issue.

Issue Title: {issue_title}
Issue Description: {issue_body or "_No description provided_"}
Issue Type: {issue_class}
Issue Number: #{args.issue_number}
ADW ID: {adw_id}

IMPORTANT: Return ONLY the spec content in markdown format. Do not add any introduction, summary, or explanation before or after the spec.

Start directly with:

# Spec {spec_number:03d}: {issue_title}

**ADW ID:** {adw_id}  
**Issue:** #{args.issue_number}  
**Type:** {issue_class}  
**Status:** 🔄 In Progress

## Overview

Describe what needs to be built (2-3 sentences based on the issue).

## Requirements

- [REQ-1] Specific functional requirement from the issue
- [REQ-2] Technical requirement
- [REQ-3] Data/validation requirement

## Implementation Plan

- [ ] Analyze the codebase and understand current structure
- [ ] Design the solution
- [ ] Implement the core functionality
- [ ] Add tests
- [ ] Update documentation

## Files to Modify

- `path/to/file.ts` - Description of changes needed

## Acceptance Criteria

- [ ] Specific testable criteria 1
- [ ] Specific testable criteria 2
- [ ] Specific testable criteria 3

## Notes

Any technical considerations or dependencies.
"""
    
    success, spec_content = run_slash_command(
        "Generate a detailed implementation spec:",
        [spec_prompt],
        output_file=f"agents/{adw_id}/planner/raw_output.txt"
    )
    
    spec_parsed = ""
    if success and spec_content:
        # Parse the output to extract the spec
        spec_parsed = parse_spec_from_output(spec_content)
        
        if spec_parsed and '# Spec' in spec_parsed:
            spec_content = spec_parsed
            print(f"✅ Generated detailed spec")
        else:
            print(f"⚠️  AI output didn't contain valid spec format")
            success = False
    else:
        print(f"⚠️  AI spec generation failed")
        success = False
    
    if not success or not spec_parsed:
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
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
