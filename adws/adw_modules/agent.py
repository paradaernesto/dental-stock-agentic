"""Claude Code agent integration."""

import subprocess
import os
from pathlib import Path
from typing import Optional


def run_slash_command(
    command: str,
    args: list,
    working_dir: Optional[str] = None,
    output_file: Optional[str] = None
) -> tuple[bool, str]:
    """Run a Claude Code slash command.
    
    Args:
        command: Slash command (e.g., "/feature")
        args: Arguments for the command
        working_dir: Working directory
        output_file: File to save output
        
    Returns:
        (success, output)
    """
    # Run claude code
    claude_path = os.getenv("CLAUDE_CODE_PATH", "claude")
    
    # Build input based on command type
    if command == "/classify_issue":
        # classify_issue expects arguments via $ARGUMENTS (stdin)
        issue_title = args[0] if len(args) > 0 else ""
        issue_body = args[1] if len(args) > 1 else ""
        input_text = f"Title: {issue_title}\nBody: {issue_body}"
    elif command == "/implement":
        # implement expects spec_file and task_id as separate args
        input_text = "\n".join(args)
    else:
        # Generic: join all args
        input_text = "\n".join(args)
    
    cmd_parts = [claude_path, "-p", "--dangerously-skip-permissions", command]
    
    print(f"   [DEBUG] Running: {' '.join(cmd_parts)}")
    print(f"   [DEBUG] Input: {input_text[:100]}...")
    
    try:
        result = subprocess.run(
            cmd_parts,
            cwd=working_dir,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout
            input=input_text
        )
        
        output = result.stdout + result.stderr
        
        print(f"   [DEBUG] Return code: {result.returncode}")
        print(f"   [DEBUG] Output: {output[:300] if output else 'No output'}...")
        
        if output_file:
            Path(output_file).parent.mkdir(parents=True, exist_ok=True)
            with open(output_file, "w") as f:
                f.write(output)
        
        return result.returncode == 0, output
        
    except subprocess.TimeoutExpired:
        print(f"   [DEBUG] Command timed out after 300s")
        return False, "Command timed out"
    except Exception as e:
        print(f"   [DEBUG] Exception: {e}")
        return False, str(e)
