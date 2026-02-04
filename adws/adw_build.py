#!/usr/bin/env python3
"""
ADW Build - Implement from plan.

Usage:
    python adws/adw_build.py <issue-number> <adw-id>
"""

import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from adw_modules.state import load_state, save_state
from adw_modules.agent import run_slash_command


def main():
    print("[DEBUG] adw_build.py started")
    parser = argparse.ArgumentParser(description="ADW Build - Implement from plan")
    parser.add_argument("issue_number", type=int, help="GitHub issue number")
    parser.add_argument("adw_id", help="ADW ID")
    args = parser.parse_args()
    
    print(f"[DEBUG] Arguments: issue_number={args.issue_number}, adw_id={args.adw_id}")
    print(f"🔹 ADW ID: {args.adw_id}")
    
    # Load state
    state = load_state(args.adw_id)
    if not state:
        print(f"❌ No state found for {args.adw_id}")
        return 1
    
    print(f"📄 Plan: {state.plan_file}")
    print(f"🌿 Branch: {state.branch_name}")
    
    # Check we're on the right branch
    import subprocess
    result = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True)
    current_branch = result.stdout.strip()
    
    if current_branch != state.branch_name:
        print(f"⚠️  Switching to branch: {state.branch_name}")
        subprocess.run(["git", "checkout", "-b", state.branch_name], capture_output=True)
    
    # Run implement command
    print("🤖 Running implementor...")
    success, output = run_slash_command(
        "/implement",
        [state.plan_file, args.adw_id],
        output_file=f"agents/{args.adw_id}/implementor/raw_output.txt"
    )
    
    if success:
        print("✅ Implementation complete")
        print("\n📋 Next Steps:")
        print(f"  1. Review changes: git diff")
        print(f"  2. Test: python adws/adw_test.py {args.issue_number} {args.adw_id}")
    else:
        print("❌ Implementation had issues")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
