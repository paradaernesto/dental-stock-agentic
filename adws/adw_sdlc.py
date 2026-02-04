#!/usr/bin/env python3
"""
ADW SDLC - Complete Software Development Life Cycle.

Usage:
    python adws/adw_sdlc.py <issue-number>
"""

import sys
import subprocess
import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="ADW SDLC - Complete workflow")
    parser.add_argument("issue_number", type=int, help="GitHub issue number")
    parser.add_argument("--skip-test", action="store_true", help="Skip test phase")
    parser.add_argument("--skip-review", action="store_true", help="Skip review phase")
    args = parser.parse_args()
    
    print("=" * 60)
    print("ADW SDLC - Complete Workflow")
    print("=" * 60)
    
    # Step 1: Plan
    print("\n📋 PHASE 1: PLAN")
    print("-" * 40)
    result = subprocess.run(
        ["python3", "adws/adw_plan.py", str(args.issue_number)],
        capture_output=False
    )
    
    if result.returncode != 0:
        print("\n❌ Planning failed")
        return 1
    
    # Get ADW ID
    agents_dir = Path("agents")
    adw_ids = sorted([d.name for d in agents_dir.iterdir() if d.is_dir()]) if agents_dir.exists() else []
    if not adw_ids:
        print("\n❌ Could not find ADW ID")
        return 1
    adw_id = adw_ids[-1]
    
    # Step 2: Build
    print("\n🔨 PHASE 2: BUILD")
    print("-" * 40)
    result = subprocess.run(
        ["python3", "adws/adw_build.py", str(args.issue_number), adw_id],
        capture_output=False
    )
    
    if result.returncode != 0:
        print("\n❌ Build failed")
        return 1
    
    # Step 3: Test (optional)
    if not args.skip_test:
        print("\n🧪 PHASE 3: TEST")
        print("-" * 40)
        result = subprocess.run(
            ["python3", "adws/adw_test.py", str(args.issue_number), adw_id],
            capture_output=False
        )
        
        if result.returncode != 0:
            print("\n❌ Tests failed")
            return 1
    else:
        print("\n⏭️  PHASE 3: TEST (skipped)")
    
    # Step 4: Review (optional)
    if not args.skip_review:
        print("\n👁️  PHASE 4: REVIEW")
        print("-" * 40)
        result = subprocess.run(
            ["python3", "adws/adw_review.py", str(args.issue_number), adw_id],
            capture_output=False
        )
        
        if result.returncode != 0:
            print("\n⚠️  Review found issues")
    else:
        print("\n⏭️  PHASE 4: REVIEW (skipped)")
    
    # Step 5: PR
    print("\n📝 PHASE 5: PULL REQUEST")
    print("-" * 40)
    result = subprocess.run(
        ["python3", "adws/adw_pr.py", str(args.issue_number), adw_id],
        capture_output=False
    )
    
    print("\n" + "=" * 60)
    print("✅ SDLC Complete!")
    print(f"🆔 ADW ID: {adw_id}")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
