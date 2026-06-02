from __future__ import annotations

import re
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

PUBLIC_ID_PATTERN = re.compile(r"^#ghost-([A-Za-z0-9]+)-(\d{4})-E$", re.IGNORECASE)


class TerminalRequest(BaseModel):
    command: str
    public_id: Optional[str] = None


class TerminalResponse(BaseModel):
    output: List[str]
    clear: bool = False
    status: str = "ok"


def parse_public_id(public_id: str) -> tuple[str, str, str]:
    public_id = (public_id or "").strip()
    match = PUBLIC_ID_PATTERN.match(public_id)
    if not match:
        return public_id or "#ghost-0001-XXXX", "unknown", "0000"
    return public_id, match.group(1), match.group(2)


def build_help_output() -> List[str]:
    return [
        "Identity & Account: ghost, ghost whoami, ghost profile, ghost id, ghost publicid, ghost status, ghost logout, ghost delete-account",
        "Contacts: ghost connect @user, ghost disconnect @user, ghost contacts, ghost block @user, ghost blocked",
        "Messaging: ghost chat @user, ghost send @user, ghost inbox, ghost reply, ghost unread",
        "Privacy: ghost privacy, ghost lock, ghost panic, ghost security, ghost audit",
        "Files: ghost upload, ghost download, ghost share file, ghost files, ghost backup, ghost sync",
        "System: ghost version, ghost update, ghost clear, ghost theme, ghost stats"
    ]


@router.post("/terminal", response_model=TerminalResponse)
async def terminal_command(request: TerminalRequest) -> TerminalResponse:
    command = request.command.strip()
    normalized = command.lower()
    public_id, code_name, id_fragment = parse_public_id(request.public_id or "")

    if normalized == "ghost help":
        return TerminalResponse(output=build_help_output())

    if normalized in {"ghost", "ghost whoami"}:
        return TerminalResponse(
            output=[
                "Role: admin runner",
                f"Code name: {code_name}",
                f"Full public ID: {public_id}",
                "Type ghost profile for full personal detail."
            ]
        )

    if normalized == "ghost profile":
        identity_token = f"{public_id} {public_id[-7:]}" if public_id.startswith("#ghost-") else "unknown"
        return TerminalResponse(
            output=[
                f"Full ID: {public_id}",
                "Role: admin runner",
                f"Code name: {code_name}",
                f"Identifier fragment: {id_fragment}",
                f"Identity token: {identity_token}"
            ]
        )

    if normalized in {"ghost id", "ghost publicid"}:
        return TerminalResponse(output=[f"Public ID: {public_id}"])

    if normalized.startswith("ghost status set"):
        status = command[15:].strip() or "available"
        return TerminalResponse(output=[f"Status updated to: {status}"])

    if normalized == "ghost status":
        return TerminalResponse(output=["Current status: online."])

    if normalized.startswith("ghost connect ") or normalized.startswith("ghost disconnect "):
        target = command.split(" ", 2)[2] if len(command.split(" ", 2)) > 2 else "unknown user"
        return TerminalResponse(output=[f"Connection operation queued for {target}."])

    if normalized == "ghost inbox":
        return TerminalResponse(output=["Inbox: 3 unread messages from trusted contacts."])

    if normalized == "ghost panic":
        return TerminalResponse(output=[
            "Emergency lock engaged.",
            "Notifications disabled.",
            "Hidden chats activated.",
            "All other sessions logged out.",
            "Authentication required to resume."
        ])

    if normalized == "ghost clear":
        return TerminalResponse(output=[], clear=True)

    return TerminalResponse(output=[f"Unknown command: {command}. Type ghost help for a command list."], status="error")
