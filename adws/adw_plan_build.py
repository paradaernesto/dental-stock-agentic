#!/usr/bin/env python3
"""
ADW Plan + Build - Combined workflow.

Usage:
    python adws/adw_plan_build.py <issue-number>
"""

import sys
import subprocess
import argparse
import os
from pathlib import Path


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
    print("[DEBUG] Running: python3 adws/adw_plan.py", args.issue_number)
    result = subprocess.run(
        ["python3", "adws/adw_plan.py", str(args.issue_number)],
        capture_output=False
    )
    print(f"[DEBUG] Plan finished with return code: {result.returncode}")
    
    if result.returncode != 0:
        print("\n❌ Planning failed")
        return 1
    print("[DEBUG] Plan completed successfully")
    
    # Get ADW ID from output or find latest
    # For simplicity, we'll list agents directory
    import os
    from pathlib import Path
    agents_dir = Path("agents")
    print(f"\n🔍 Looking for ADW ID in {agents_dir.absolute()}...")
    if agents_dir.exists():
        adw_ids = sorted([d.name for d in agents_dir.iterdir() if d.is_dir()])
        print(f"   Found agents: {adw_ids}")
        if adw_ids:
            adw_id = adw_ids[-1]
            print(f"   Using ADW ID: {adw_id}")
        else:
            print("\n❌ Could not find ADW ID")
            return 1
    else:
        print(f"\n❌ No agents directory found at {agents_dir.absolute()}")
        return 1
    
    # Step 2: Build
    print("\n🔨 PHASE 2: BUILD")
    print("-" * 40)
    print(f"[DEBUG] Running: python3 adws/adw_build.py {args.issue_number} {adw_id}")
    print(f"[DEBUG] Current directory: {os.getcwd()}")
    print(f"[DEBUG] Checking if adw_build.py exists: {Path('adws/adw_build.py').exists()}")
    result = subprocess.run(
        ["python3", "adws/adw_build.py", str(args.issue_number), adw_id],
        capture_output=False
    )
    print(f"[DEBUG] Build finished with return code: {result.returncode}")
    
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
