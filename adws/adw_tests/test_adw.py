#!/usr/bin/env python3
"""Tests for ADW system."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from adw_modules.utils import generate_adw_id, slugify, generate_branch_name, classify_issue


def test_generate_adw_id():
    """Test ADW ID generation."""
    adw_id = generate_adw_id()
    assert len(adw_id) == 8
    assert adw_id.isalnum()
    print("✅ test_generate_adw_id passed")


def test_slugify():
    """Test slug generation."""
    assert slugify("Hello World") == "hello-world"
    assert slugify("Feature: Add User Auth") == "feature-add-user-auth"
    print("✅ test_slugify passed")


def test_generate_branch_name():
    """Test branch name generation."""
    name = generate_branch_name(123, "Add User Auth", "/feature")
    assert name.startswith("feat-123-")
    
    name = generate_branch_name(456, "Fix Login Bug", "/bug")
    assert name.startswith("fix-456-")
    print("✅ test_generate_branch_name passed")


def test_classify_issue():
    """Test issue classification."""
    assert classify_issue("Bug in login", "", []) == "/bug"
    assert classify_issue("Add feature", "", []) == "/feature"
    assert classify_issue("Update deps", "chore: update", []) == "/chore"
    print("✅ test_classify_issue passed")


def main():
    """Run all tests."""
    print("Running ADW tests...\n")
    
    test_generate_adw_id()
    test_slugify()
    test_generate_branch_name()
    test_classify_issue()
    
    print("\n✅ All tests passed!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
