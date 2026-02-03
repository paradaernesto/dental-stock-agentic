#!/usr/bin/env python3
"""
ADW Plan + Build - Combined workflow.

Usage:
    python adws/adw_plan_build.py <issue-number>
"""

import sys
import subprocess
import argparse


def main():
    parser = argparse.ArgumentParser(description="ADW Plan + Build")
    parser.add_argument("issue_number", type=int, help="GitHub issue number")
    args = parser.parse_args()
    
    print("=" * 60)
    print("ADW Plan + Build Workflow")
    print("=" * 60)
    
    # Step 1: Plan
    print("\n📋 PHASE 1: PLAN")
    print("-" * 40)
    result = subprocess.run(
        ["python", "adws/adw_plan.py", str(args.issue_number)],
        capture_output=False
    )
    
    if result.returncode != 0:
        print("\n❌ Planning failed")
        return 1
    
    # Get ADW ID from output or find latest
    # For simplicity, we'll list agents directory
    import os
    from pathlib import Path
    agents_dir = Path("agents")
    if agents_dir.exists():
        adw_ids = sorted([d.name for d in agents_dir.iterdir() if d.is_dir()])
        if adw_ids:
            adw_id = adw_ids[-1]
        else:
            print("\n❌ Could not find ADW ID")
            return 1
    else:
        print("\n❌ No agents directory found")
        return 1
    
    # Step 2: Build
    print("\n🔨 PHASE 2: BUILD")
    print("-" * 40)
    result = subprocess.run(
        ["python", "adws/adw_build.py", str(args.issue_number), adw_id],
        capture_output=False
    )
    
    if result.returncode != 0:
        print("\n❌ Build failed")
        return 1
    
    print("\n" + "=" * 60)
    print("✅ Plan + Build complete!")
    print(f"🆔 ADW ID: {adw_id}")
    print("=" * 60)
    print("\n📋 Next Steps:")
    print(f"  1. Test: python adws/adw_test.py {args.issue_number} {adw_id}")
    print(f"  2. Review: python adws/adw_review.py {args.issue_number} {adw_id}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
