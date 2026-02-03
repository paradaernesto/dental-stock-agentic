#!/usr/bin/env python3
"""
ADW Review - Review implementation against spec.

Usage:
    python adws/adw_review.py <issue-number> <adw-id>
"""

import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from adw_modules.state import load_state
from adw_modules.agent import run_slash_command


def main():
    parser = argparse.ArgumentParser(description="ADW Review - Review implementation")
    parser.add_argument("issue_number", type=int, help="GitHub issue number")
    parser.add_argument("adw_id", help="ADW ID")
    args = parser.parse_args()
    
    print(f"🔹 ADW ID: {args.adw_id}")
    
    # Load state
    state = load_state(args.adw_id)
    if not state:
        print(f"❌ No state found for {args.adw_id}")
        return 1
    
    print(f"📄 Spec: {state.plan_file}")
    
    # Run review command
    print("🤖 Running reviewer...")
    success, output = run_slash_command(
        "/review",
        [args.adw_id, state.plan_file, "reviewer"],
        output_file=f"agents/{args.adw_id}/reviewer/raw_output.txt"
    )
    
    if success:
        print("✅ Review complete")
        print("\n📋 Next Steps:")
        print(f"  1. Check results in agents/{args.adw_id}/reviewer/")
        print(f"  2. Create PR: python adws/adw_pr.py {args.issue_number} {args.adw_id}")
    else:
        print("⚠️  Review found issues")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
