#!/usr/bin/env python3
"""
ADW Fix - Auto-fix implementation errors.

Usage:
    python adws/adw_fix.py <error-log-file>
"""

import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from adw_modules.agent import run_slash_command
from adw_modules.state import load_state, save_state


def main():
    parser = argparse.ArgumentParser(description="ADW Fix - Auto-fix errors")
    parser.add_argument("error_file", help="File containing error output")
    parser.add_argument("--adw-id", help="ADW ID for context")
    args = parser.parse_args()
    
    print("🔧 ADW Auto-Fix")
    print("=" * 60)
    
    # Read error log
    try:
        with open(args.error_file, 'r') as f:
            error_output = f.read()
    except Exception as e:
        print(f"❌ Could not read error file: {e}")
        return 1
    
    if not error_output.strip():
        print("⚠️ No error output to fix")
        return 0
    
    print("📋 Error Output:")
    print("-" * 40)
    print(error_output[:2000])  # Limit output length
    print("-" * 40)
    
    # Build prompt for fixing
    fix_prompt = f"""You are an expert developer. Fix the following build errors in the codebase.

## Error Output
```
{error_output[:3000]}
```

## Instructions
1. Analyze the error carefully
2. Find and fix the root cause in the codebase
3. Make minimal, focused changes
4. Ensure the fix follows the existing code patterns
5. Do NOT add comments explaining the fix - just fix it

Common fixes:
- TypeScript errors: Add proper types or fix imports
- Prisma errors: Regenerate client with `pnpm db:generate`
- Missing dependencies: Install with `pnpm add`
- Syntax errors: Fix the code directly

## Run
Fix the errors now. After fixing:
- Run `pnpm db:generate` if Prisma schema changed
- Verify with `pnpm typecheck`
- Do NOT run full build or tests (that will be done separately)

Start fixing now."""
    
    print("🤖 Asking AI to fix errors...")
    success, output = run_slash_command(
        "/fix",
        [fix_prompt],
        output_file=f"agents/{args.adw_id}/fixer/raw_output.txt" if args.adw_id else None
    )
    
    if success:
        print("✅ AI attempted to fix errors")
        print("\n📋 AI Response:")
        print(output[:1000] if output else "No output")
        return 0
    else:
        print("❌ AI fix attempt failed")
        print(output[:500] if output else "No output")
        return 1


if __name__ == "__main__":
    sys.exit(main())
