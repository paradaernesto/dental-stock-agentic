"""State management for ADW."""

import json
import os
from pathlib import Path
from typing import Optional
from .data_types import ADWStateData


def get_state_path(adw_id: str) -> Path:
    """Get path to state file."""
    return Path(f"agents/{adw_id}/adw_state.json")


def save_state(state: ADWStateData) -> None:
    """Save state to file."""
    state_path = get_state_path(state.adw_id)
    state_path.parent.mkdir(parents=True, exist_ok=True)
    with open(state_path, "w") as f:
        json.dump(state.model_dump(), f, indent=2)


def load_state(adw_id: str) -> Optional[ADWStateData]:
    """Load state from file."""
    state_path = get_state_path(adw_id)
    if not state_path.exists():
        return None
    with open(state_path) as f:
        data = json.load(f)
        return ADWStateData(**data)


def generate_adw_id() -> str:
    """Generate unique ADW ID."""
    import uuid
    return uuid.uuid4().hex[:8]
