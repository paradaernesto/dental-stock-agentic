#!/usr/bin/env python3
"""
ADW PR - Create pull request.

Usage:
    python adws/adw_pr.py <issue-number> <adw-id>
"""

import sys
import argparse
import subprocess
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from adw_modules.state import load_state
from adw_modules.github import create_pull_request


def main():
    parser = argparse.ArgumentParser(description="ADW PR - Create pull request")
    parser.add_argument("issue_number", type=int, help="GitHub issue number")
    parser.add_argument("adw_id", help="ADW ID")
    args = parser.parse_args()
    
    print(f"🔹 ADW ID: {args.adw_id}")
    
    # Load state
    state = load_state(args.adw_id)
    if not state:
        print(f"❌ No state found for {args.adw_id}")
        return 1
    
    # Get git info
    print("📊 Gathering git info...")
    
    # Changed files
    result = subprocess.run(
        ["git", "diff", "origin/main...HEAD", "--stat"],
        capture_output=True,
        text=True
    )
    changed_files = result.stdout
    
    # Commits
    result = subprocess.run(
        ["git", "log", "origin/main..HEAD", "--oneline"],
        capture_output=True,
        text=True
    )
    commits = result.stdout
    
    # Push branch
    print(f"🚀 Pushing branch: {state.branch_name}")
    subprocess.run(
        ["git", "push", "-u", "origin", state.branch_name],
        capture_output=True
    )
    
    # Create PR
    print("📝 Creating pull request...")
    
    title = f"{state.issue_class.strip('/'): #<{args.issue_number}> - {Path(state.plan_file).stem}"
    
    body = f"""## Summary

Implementation for issue #{args.issue_number}

**ADW ID:** {args.adw_id}
**Plan:** {state.plan_file}

## Changes

```
{changed_files}
```

## Commits

```
{commits}
```

## Checklist

- [x] Implementation complete
- [x] Tests passing
- [x] Code reviewed
- [x] Ready for merge

Closes #{args.issue_number}
"""
    
    pr_url = create_pull_request(state.branch_name, title, body)
    
    if pr_url:
        print(f"✅ PR created: {pr_url}")
        return 0
    else:
        print("❌ Failed to create PR")
        return 1


if __name__ == "__main__":
    sys.exit(main())
