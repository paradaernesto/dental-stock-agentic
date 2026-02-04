"""AI Provider implementations for Claude and Kimi."""

import os
import subprocess
from pathlib import Path
from typing import Optional, Tuple
from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Abstract base class for AI providers."""
    
    @abstractmethod
    def run_command(
        self,
        command: str,
        args: list,
        working_dir: Optional[str] = None,
        output_file: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Run an AI command.
        
        Args:
            command: The command to run (e.g., "/implement", "classify")
            args: Arguments for the command
            working_dir: Working directory
            output_file: File to save output
            
        Returns:
            (success, output)
        """
        pass
    
    @abstractmethod
    def get_binary_path(self) -> str:
        """Get the path to the AI CLI binary."""
        pass


class ClaudeProvider(AIProvider):
    """Claude Code CLI provider."""
    
    def get_binary_path(self) -> str:
        return os.getenv("CLAUDE_CODE_PATH", "claude")
    
    def run_command(
        self,
        command: str,
        args: list,
        working_dir: Optional[str] = None,
        output_file: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Run a Claude Code slash command."""
        claude_path = self.get_binary_path()
        
        # Build input based on command type
        if command == "/classify_issue":
            issue_title = args[0] if len(args) > 0 else ""
            issue_body = args[1] if len(args) > 1 else ""
            input_text = f"Title: {issue_title}\nBody: {issue_body}"
        elif command == "/implement":
            spec_file = args[0] if len(args) > 0 else ""
            adw_id = args[1] if len(args) > 1 else ""
            input_text = f"{spec_file}\n{adw_id}"
        else:
            input_text = "\n".join(args)
        
        cmd_parts = [claude_path, "-p", "--dangerously-skip-permissions", command]
        
        return self._execute(cmd_parts, input_text, working_dir, output_file)
    
    def _execute(
        self,
        cmd_parts: list,
        input_text: str,
        working_dir: Optional[str],
        output_file: Optional[str]
    ) -> Tuple[bool, str]:
        """Execute the command."""
        is_ci = os.getenv("CI", "").lower() == "true"
        
        try:
            if is_ci:
                print(f"   [Running Claude command: {cmd_parts[3]}]")
                process = subprocess.Popen(
                    cmd_parts,
                    cwd=working_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    stdin=subprocess.PIPE
                )
                
                if input_text:
                    process.stdin.write(input_text)
                    process.stdin.close()
                
                output_lines = []
                for line in process.stdout:
                    line = line.rstrip()
                    output_lines.append(line)
                    print(f"   {line}")
                
                process.wait(timeout=600)
                output = "\n".join(output_lines)
                
                if output_file:
                    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
                    with open(output_file, "w") as f:
                        f.write(output)
                
                return process.returncode == 0, output
            else:
                result = subprocess.run(
                    cmd_parts,
                    cwd=working_dir,
                    capture_output=True,
                    text=True,
                    timeout=300,
                    input=input_text
                )
                
                output = result.stdout + result.stderr
                
                if output_file:
                    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
                    with open(output_file, "w") as f:
                        f.write(output)
                
                return result.returncode == 0, output
                
        except subprocess.TimeoutExpired:
            return False, "Command timed out"
        except Exception as e:
            return False, str(e)


class KimiProvider(AIProvider):
    """Kimi Code CLI provider."""
    
    def get_binary_path(self) -> str:
        return os.getenv("KIMI_CODE_PATH", "kimi")
    
    def run_command(
        self,
        command: str,
        args: list,
        working_dir: Optional[str] = None,
        output_file: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Run a Kimi command by interpolating the prompt template."""
        kimi_path = self.get_binary_path()
        
        # Interpolate the command template with arguments
        prompt = self._interpolate_command(command, args)
        
        # Build command with appropriate flags
        # --print: non-interactive mode (auto-approves all actions like --yolo)
        # --thinking: enables reasoning mode for better planning/analysis
        cmd_parts = [kimi_path, "-p", prompt, "--print", "--thinking"]
        
        # For implementation commands, we could skip --thinking for speed
        # but keeping it ensures better code quality
        
        success, output = self._execute(cmd_parts, working_dir, output_file)
        
        # Parse Kimi's output format to extract useful text
        if success:
            output = self._parse_kimi_output(output)
        
        return success, output
    
    def _parse_kimi_output(self, output: str) -> str:
        """Parse Kimi's output format to extract useful text content.
        
        Kimi outputs have format like:
        TextPart(type='text', text='Actual content here')
        The text may contain analysis followed by the actual spec.
        """
        import re
        
        # Extract the text from TextPart
        # Pattern matches: TextPart( type='text', text='...content...' )
        pattern = r"TextPart\(\s*type='text',\s*text='([\s\S]*?)'\s*\)"
        matches = re.findall(pattern, output)
        
        if matches:
            # Get the last TextPart
            text = matches[-1]
            # Unescape escaped quotes and newlines
            text = text.replace("\\'", "'").replace('\\n', '\n')
            
            # The spec starts at '# Spec' - find and extract from there
            spec_start = text.find('# Spec')
            if spec_start != -1:
                return text[spec_start:]
            
            return text
        
        # Fallback: try to find spec directly in output
        spec_start = output.find('# Spec')
        if spec_start != -1:
            return output[spec_start:]
        
        return output
    
    def _interpolate_command(self, command: str, args: list) -> str:
        """Interpolate command template with arguments."""
        
        if command == "/classify_issue":
            # Simulate classify_issue command
            issue_title = args[0] if len(args) > 0 else ""
            issue_body = args[1] if len(args) > 1 else ""
            
            return f"""You are a GitHub issue classifier. Based on the issue below, classify it as ONE of: /chore, /bug, /feature, /patch, or 0 if none apply.

Classification rules:
- /chore: maintenance, refactoring, config, docs
- /bug: bug fixes, errors
- /feature: new features
- /patch: quick patches
- 0: none of the above

Respond ONLY with the classification (e.g., "/feature"), nothing else.

Issue Title: {issue_title}
Issue Description: {issue_body}

Classification:"""

        elif command == "/implement":
            # Simulate implement command
            spec_file = args[0] if len(args) > 0 else ""
            task_id = args[1] if len(args) > 1 else ""
            
            # Read spec content if file exists
            spec_content = ""
            try:
                with open(spec_file, 'r') as f:
                    spec_content = f.read()
            except:
                spec_content = f"[Could not read spec file: {spec_file}]"
            
            return f"""You are an expert software developer. Implement the following specification.

Task ID: {task_id}

## Specification
{spec_content}

## Instructions
1. Read and understand the spec above
2. Identify the scope of implementation
3. Make focused, minimal changes to the codebase
4. Ensure tests pass after implementation
5. Follow existing code conventions

Implement the changes now. After implementing:
- Run tests to verify
- Provide a summary of changes made
- List files modified/created"""

        elif command == "/feature":
            # Simulate feature command
            return f"""You are implementing a new feature. {args[0] if args else ""}

Follow these steps:
1. Read the requirements
2. Plan the implementation
3. Write clean, maintainable code
4. Add tests
5. Update documentation if needed"""

        elif command == "/fix":
            # Fix command - receives error log and fixes the code
            error_log = args[0] if len(args) > 0 else ""
            
            return f"""You are an expert developer. Fix the following errors in the codebase.

## Error Log
```
{error_log}
```

## Instructions
1. Carefully analyze the error log
2. Identify the root cause
3. Make minimal, focused fixes
4. Follow existing code patterns
5. Do NOT add explanatory comments - just fix the code

After fixing, regenerate Prisma client if schema changed:
- Run `pnpm db:generate`

Fix the errors now."""

        else:
            # Generic fallback - just pass the command and args as prompt
            args_str = " ".join(args)
            return f"{command} {args_str}".strip()
    
    def _execute(
        self,
        cmd_parts: list,
        working_dir: Optional[str],
        output_file: Optional[str]
    ) -> Tuple[bool, str]:
        """Execute the Kimi command."""
        is_ci = os.getenv("CI", "").lower() == "true"
        
        try:
            if is_ci:
                print(f"   [Running Kimi command: {cmd_parts[0]}]")
                process = subprocess.Popen(
                    cmd_parts,
                    cwd=working_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True
                )
                
                output_lines = []
                for line in process.stdout:
                    line = line.rstrip()
                    output_lines.append(line)
                    print(f"   {line}")
                
                process.wait(timeout=600)
                output = "\n".join(output_lines)
                
                if output_file:
                    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
                    with open(output_file, "w") as f:
                        f.write(output)
                
                return process.returncode == 0, output
            else:
                result = subprocess.run(
                    cmd_parts,
                    cwd=working_dir,
                    capture_output=True,
                    text=True,
                    timeout=300
                )
                
                output = result.stdout + result.stderr
                
                if output_file:
                    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
                    with open(output_file, "w") as f:
                        f.write(output)
                
                return result.returncode == 0, output
                
        except subprocess.TimeoutExpired:
            return False, "Command timed out"
        except Exception as e:
            return False, str(e)


def get_provider() -> AIProvider:
    """Get the configured AI provider."""
    provider_name = os.getenv("AI_PROVIDER", "claude").lower()
    
    if provider_name == "kimi":
        return KimiProvider()
    elif provider_name == "claude":
        return ClaudeProvider()
    else:
        # Default to Claude for backward compatibility
        print(f"   [WARNING] Unknown AI_PROVIDER '{provider_name}', using Claude")
        return ClaudeProvider()
