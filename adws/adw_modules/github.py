"""GitHub API operations."""

import os
import requests
from typing import Optional, List
from .data_types import GitHubIssue, GitHubComment, GitHubUser, GitHubLabel


def get_repo_url() -> str:
    """Get GitHub repo URL from environment."""
    return os.getenv("GITHUB_REPO_URL", "")


def get_token() -> str:
    """Get GitHub token."""
    return os.getenv("GITHUB_PAT") or os.getenv("GITHUB_TOKEN", "")


def parse_repo(repo_url: str) -> tuple:
    """Parse owner/repo from URL."""
    parts = repo_url.replace("https://github.com/", "").split("/")
    return parts[0], parts[1]


def fetch_issue(issue_number: int) -> Optional[GitHubIssue]:
    """Fetch issue from GitHub API."""
    token = get_token()
    if not token:
        print("Warning: No GitHub token found")
        return None
    
    repo_url = get_repo_url()
    if not repo_url:
        print("Warning: No GITHUB_REPO_URL set")
        return None
    
    owner, repo = parse_repo(repo_url)
    url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching issue: {response.status_code}")
        return None
    
    data = response.json()
    
    # Parse labels
    labels = [GitHubLabel(name=l["name"], color=l["color"]) for l in data.get("labels", [])]
    
    # Parse user
    user_data = data.get("user", {})
    author = GitHubUser(login=user_data.get("login", ""))
    
    return GitHubIssue(
        number=data["number"],
        title=data["title"],
        body=data.get("body", ""),
        state=data["state"],
        author=author,
        labels=labels,
        comments=[],  # Would need separate API call
        created_at=data["created_at"],
        updated_at=data["updated_at"],
        url=data["html_url"]
    )


def create_pull_request(branch: str, title: str, body: str) -> Optional[str]:
    """Create pull request."""
    token = get_token()
    if not token:
        return None
    
    repo_url = get_repo_url()
    owner, repo = parse_repo(repo_url)
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    data = {
        "title": title,
        "body": body,
        "head": branch,
        "base": "main"
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 201:
        return response.json()["html_url"]
    else:
        print(f"Error creating PR: {response.status_code}")
        return None


def post_comment(issue_number: int, body: str) -> bool:
    """Post comment to issue."""
    token = get_token()
    if not token:
        return False
    
    repo_url = get_repo_url()
    owner, repo = parse_repo(repo_url)
    url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    response = requests.post(url, headers=headers, json={"body": body})
    return response.status_code == 201
