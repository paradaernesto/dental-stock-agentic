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
    # Build the prompt
    args_str = " ".join(args)
    full_command = f"{command} {args_str}".strip()
    
    # Run claude code
    claude_path = os.getenv("CLAUDE_CODE_PATH", "claude")
    
    cmd_parts = [claude_path, "-p", full_command]
    
    print(f"   [DEBUG] Running: {' '.join(cmd_parts)}")
    
    try:
        result = subprocess.run(
            cmd_parts,
            cwd=working_dir,
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout for CI
        )
        
        output = result.stdout + result.stderr
        
        print(f"   [DEBUG] Return code: {result.returncode}")
        print(f"   [DEBUG] Output: {output[:200] if output else 'No output'}...")
        
        if output_file:
            Path(output_file).parent.mkdir(parents=True, exist_ok=True)
            with open(output_file, "w") as f:
                f.write(output)
        
        return result.returncode == 0, output
        
    except subprocess.TimeoutExpired:
        print(f"   [DEBUG] Command timed out after 120s")
        return False, "Command timed out"
    except Exception as e:
        print(f"   [DEBUG] Exception: {e}")
        return False, str(e)
