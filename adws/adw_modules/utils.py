"""Utility functions."""

import re
import random
import string
import unicodedata
from typing import Optional


def generate_adw_id() -> str:
    """Generate 8-character ADW ID."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


def slugify(text: str) -> str:
    """Convert text to URL slug (ASCII only for Git branch names)."""
    # Normalize Unicode to ASCII (remove accents)
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')[:30]


def generate_branch_name(issue_number: int, title: str, issue_class: str) -> str:
    """Generate branch name from issue."""
    # Map issue class to prefix
    prefix_map = {
        "/feature": "feat",
        "/bug": "fix", 
        "/chore": "chore"
    }
    prefix = prefix_map.get(issue_class, "feat")
    
    # Generate slug
    slug = slugify(title)
    
    return f"{prefix}-{issue_number}-{slug}"


def classify_issue(title: str, body: str, labels: list) -> str:
    """Classify issue type."""
    text = (title + " " + body).lower()
    
    # Check labels first
    for label in labels:
        # Handle both Pydantic models and dicts
        if hasattr(label, 'name'):
            label_name = label.name.lower()
        else:
            label_name = label.get("name", "").lower() if isinstance(label, dict) else str(label).lower()
        if "bug" in label_name:
            return "/bug"
        if "feature" in label_name:
            return "/feature"
        if "chore" in label_name:
            return "/chore"
    
    # Check text
    if "bug" in text or "fix" in text or "error" in text:
        return "/bug"
    if "chore" in text or "refactor" in text or "config" in text:
        return "/chore"
    
    return "/feature"


def find_spec_files():
    """Find all spec files in specs/ directory."""
    import os
    from pathlib import Path
    
    specs_dir = Path("specs")
    if not specs_dir.exists():
        return []
    
    return sorted([f for f in specs_dir.glob("*.md") if f.is_file()])
