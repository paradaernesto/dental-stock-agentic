"""Claude Code agent integration - now supports multiple providers."""

from typing import Optional, Tuple
from .providers import get_provider


def run_slash_command(
    command: str,
    args: list,
    working_dir: Optional[str] = None,
    output_file: Optional[str] = None
) -> Tuple[bool, str]:
    """Run an AI command using the configured provider.
    
    Args:
        command: Slash command (e.g., "/implement", "/classify_issue")
        args: Arguments for the command
        working_dir: Working directory
        output_file: File to save output
        
    Returns:
        (success, output)
    """
    provider = get_provider()
    return provider.run_command(command, args, working_dir, output_file)
