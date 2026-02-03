#!/usr/bin/env python3
"""
ADW Test - Run test suite.

Usage:
    python adws/adw_test.py <issue-number> <adw-id>
"""

import sys
import argparse
import subprocess
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from adw_modules.state import load_state


def run_test(name: str, command: str, purpose: str) -> dict:
    """Run a single test."""
    print(f"  ▶️  {name}...", end=" ")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        passed = result.returncode == 0
        
        if passed:
            print("✅")
            return {
                "test_name": name,
                "passed": True,
                "execution_command": command,
                "test_purpose": purpose
            }
        else:
            print("❌")
            return {
                "test_name": name,
                "passed": False,
                "execution_command": command,
                "test_purpose": purpose,
                "error": result.stderr[:500] if result.stderr else "Test failed"
            }
            
    except subprocess.TimeoutExpired:
        print("⏱️")
        return {
            "test_name": name,
            "passed": False,
            "execution_command": command,
            "test_purpose": purpose,
            "error": "Test timed out after 5 minutes"
        }
    except Exception as e:
        print(f"💥 {e}")
        return {
            "test_name": name,
            "passed": False,
            "execution_command": command,
            "test_purpose": purpose,
            "error": str(e)
        }


def main():
    parser = argparse.ArgumentParser(description="ADW Test - Run test suite")
    parser.add_argument("issue_number", type=int, help="GitHub issue number")
    parser.add_argument("adw_id", help="ADW ID")
    args = parser.parse_args()
    
    print(f"🔹 ADW ID: {args.adw_id}")
    
    # Load state
    state = load_state(args.adw_id)
    if not state:
        print(f"❌ No state found for {args.adw_id}")
        return 1
    
    print("🧪 Running test suite...\n")
    
    # Define tests
    tests = [
        ("TypeScript Check", "pnpm tsc --noEmit", "Validate TypeScript types"),
        ("Lint Check", "pnpm lint", "Check code quality"),
        ("Unit Tests", "pnpm test", "Run unit tests"),
        ("Build Test", "pnpm build", "Verify production build"),
    ]
    
    results = []
    for name, command, purpose in tests:
        result = run_test(name, command, purpose)
        results.append(result)
        
        # Stop on first failure
        if not result["passed"]:
            print(f"\n⛔ Stopping: {name} failed")
            break
    
    # Save results
    results_file = f"agents/{args.adw_id}/test_results.json"
    Path(results_file).parent.mkdir(parents=True, exist_ok=True)
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2)
    
    # Summary
    passed = sum(1 for r in results if r["passed"])
    total = len(results)
    print(f"\n📊 Results: {passed}/{total} passed")
    
    if passed == total:
        print("\n📋 Next Steps:")
        print(f"  1. Review: python adws/adw_review.py {args.issue_number} {args.adw_id}")
        return 0
    else:
        print("\n⚠️  Fix failing tests before continuing")
        return 1


if __name__ == "__main__":
    sys.exit(main())
