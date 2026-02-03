"""Data types for ADW system."""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from enum import Enum


IssueClassSlashCommand = Literal["/chore", "/bug", "/feature"]


class GitHubUser(BaseModel):
    """GitHub user model."""
    login: str
    name: Optional[str] = None


class GitHubLabel(BaseModel):
    """GitHub label model."""
    name: str
    color: str


class GitHubComment(BaseModel):
    """GitHub comment model."""
    author: GitHubUser
    body: str
    created_at: datetime


class GitHubIssue(BaseModel):
    """GitHub issue model."""
    number: int
    title: str
    body: str
    state: str
    author: GitHubUser
    labels: List[GitHubLabel] = []
    comments: List[GitHubComment] = []
    created_at: datetime
    updated_at: datetime
    url: str


class TestResult(BaseModel):
    """Test result."""
    test_name: str
    passed: bool
    execution_command: str
    test_purpose: str
    error: Optional[str] = None


class ReviewIssue(BaseModel):
    """Review issue."""
    review_issue_number: int
    issue_description: str
    issue_resolution: str
    issue_severity: Literal["skippable", "tech_debt", "blocker"]


class ReviewResult(BaseModel):
    """Review result."""
    success: bool
    review_summary: str
    review_issues: List[ReviewIssue] = []


class ADWStateData(BaseModel):
    """ADW state."""
    adw_id: str
    issue_number: Optional[str] = None
    branch_name: Optional[str] = None
    plan_file: Optional[str] = None
    issue_class: Optional[IssueClassSlashCommand] = None
