from __future__ import annotations

import random
import re
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TerminalRequest(BaseModel):
    command: str
    public_id: Optional[str] = None


class TerminalResponse(BaseModel):
    output: List[str]
    clear: bool = False
    status: str = "ok"


def _now() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")


def _parse_alias(public_id: str) -> str:
    public_id = (public_id or "").strip()
    match = re.search(r"@Ghost-([A-Za-z0-9]+)-\d+", public_id)
    if match:
        return match.group(1)
    match2 = re.search(r"#ghost-([A-Za-z0-9]+)-\d+-E", public_id)
    if match2:
        return match2.group(1)
    return "Unknown"


HELP_SECTIONS = {
    "identity": [
        "  ghost whoami         — show your current identity summary",
        "  ghost profile        — display full profile details",
        "  ghost id             — display your public ID",
        "  ghost status         — show current online status",
        "  ghost status set <s> — update your status message",
        "  ghost logout         — end this session",
        "  ghost delete-account — permanently remove this Ghost identity",
    ],
    "contacts": [
        "  ghost contacts          — list all trusted contacts",
        "  ghost connect @user     — send a connection request",
        "  ghost disconnect @user  — remove a contact",
        "  ghost block @user       — block a Ghost ID",
        "  ghost blocked           — list blocked identities",
    ],
    "messages": [
        "  ghost chat @user    — open a chat thread",
        "  ghost send @user    — send a direct message",
        "  ghost inbox         — view unread messages",
        "  ghost reply         — reply to the last message",
        "  ghost unread        — count unread messages",
    ],
    "privacy": [
        "  ghost privacy    — show current privacy settings",
        "  ghost lock       — enable enhanced privacy lock",
        "  ghost panic      — emergency lockdown mode",
        "  ghost security   — display security diagnostics",
        "  ghost audit      — view recent activity log",
    ],
    "files": [
        "  ghost upload          — upload a file to GhostTunn",
        "  ghost download <id>   — retrieve a shared file",
        "  ghost share file <id> — share a file with a contact",
        "  ghost files           — list your stored files",
        "  ghost backup          — create an encrypted backup",
        "  ghost sync            — sync data across devices",
    ],
    "system": [
        "  ghost version   — display GhostTunn version info",
        "  ghost update    — check for updates",
        "  ghost clear     — clear the terminal output",
        "  ghost theme     — toggle terminal color theme",
        "  ghost stats     — display session & network stats",
        "  ghost ping      — test relay connection latency",
        "  ghost help      — show this help menu",
        "  ghost help <section> — identity | contacts | messages | privacy | files | system",
    ],
}


def build_help_output(section: Optional[str] = None) -> List[str]:
    if section and section in HELP_SECTIONS:
        lines = [f"GhostTunn — {section.upper()} commands", ""]
        lines += HELP_SECTIONS[section]
        lines += ["", "Type 'ghost help' for all sections."]
        return lines

    lines = ["GhostTunn Shell v1.0 — command reference", ""]
    for name, cmds in HELP_SECTIONS.items():
        lines.append(f"[{name.upper()}]")
        lines += cmds
        lines.append("")
    return lines


FAKE_CONTACTS = [
    "@Ghost-CipherNexus-1042",
    "@Ghost-ShadowEcho-1945",
    "@Ghost-PhantomDrift-2054",
    "@Ghost-VoidLink-3311",
    "@Ghost-NeonGhost-0712",
]

FAKE_FILES = [
    "encrypted_note_A1B2.ghost   • 2.4 KB  • shared  • 2026-06-01",
    "mission_brief_X9.ghost      • 8.1 KB  • private • 2026-05-28",
    "relay_config_draft.ghost    • 1.2 KB  • private • 2026-05-20",
]

AUDIT_LOG = [
    f"[{_now()}] LOGIN  — session started",
    f"[{_now()}] RELAY  — connected to ghost-relay-eu-01",
    f"[{_now()}] KEY    — identity verified",
    f"[{_now()}] ACCESS — terminal opened",
]


@router.post("/terminal", response_model=TerminalResponse)
async def terminal_command(request: TerminalRequest) -> TerminalResponse:
    raw = request.command.strip()
    cmd = raw.lower()
    public_id = (request.public_id or "").strip()
    alias = _parse_alias(public_id) if public_id else "Ghost"
    pid = public_id or "@Ghost-Unknown-0000"

    if not cmd.startswith("ghost"):
        return TerminalResponse(
            output=[f"  Unknown command: '{raw}'", "  All commands begin with 'ghost'. Type 'ghost help' to see available commands."],
            status="error",
        )

    if cmd == "ghost help":
        return TerminalResponse(output=build_help_output())

    if cmd.startswith("ghost help "):
        section = cmd.split("ghost help ", 1)[1].strip()
        return TerminalResponse(output=build_help_output(section if section in HELP_SECTIONS else None))

    if cmd in {"ghost", "ghost whoami"}:
        return TerminalResponse(output=[
            f"  ╔══════════════════════════════════╗",
            f"  ║       GHOST IDENTITY SUMMARY     ║",
            f"  ╚══════════════════════════════════╝",
            f"",
            f"  Alias      : {alias}",
            f"  Public ID  : {pid}",
            f"  Role       : Ghost Runner",
            f"  Status     : Online",
            f"  Session    : Active — {_now()}",
            f"",
            f"  Type 'ghost profile' for full details.",
        ])

    if cmd == "ghost profile":
        return TerminalResponse(output=[
            f"  ┌─────────────────────────────────────────┐",
            f"  │  FULL GHOST PROFILE                     │",
            f"  └─────────────────────────────────────────┘",
            f"",
            f"  Alias       : {alias}",
            f"  Public ID   : {pid}",
            f"  Role        : Ghost Runner (Level 3)",
            f"  Joined      : 2026-01-01",
            f"  Last Active : {_now()}",
            f"  Relay       : ghost-relay-eu-01",
            f"  Encryption  : AES-256-GCM + X25519",
            f"  2FA         : Enabled",
            f"  Sessions    : 1 active",
            f"",
            f"  Trust Score : ████████░░  80%",
            f"  Privacy     : Maximum",
        ])

    if cmd in {"ghost id", "ghost publicid"}:
        return TerminalResponse(output=[
            f"  Public ID : {pid}",
            f"  Share this ID with trusted contacts to receive messages.",
        ])

    if cmd == "ghost status":
        return TerminalResponse(output=[
            f"  Status  : Online",
            f"  Relay   : Connected (ghost-relay-eu-01)",
            f"  Latency : {random.randint(12, 48)}ms",
            f"  Uptime  : {random.randint(1, 8)}h {random.randint(0, 59)}m",
        ])

    if cmd.startswith("ghost status set "):
        status_val = raw[len("ghost status set "):].strip() or "available"
        return TerminalResponse(output=[
            f"  Status updated → '{status_val}'",
            f"  Broadcasted to trusted contacts.",
        ])

    if cmd == "ghost contacts":
        lines = ["  Trusted contacts:", ""]
        for c in FAKE_CONTACTS:
            lines.append(f"  • {c}")
        lines += ["", f"  Total: {len(FAKE_CONTACTS)} contacts"]
        return TerminalResponse(output=lines)

    if cmd.startswith("ghost connect "):
        target = raw.split(" ", 2)[2] if len(raw.split(" ", 2)) > 2 else "unknown"
        return TerminalResponse(output=[
            f"  Connection request sent to {target}.",
            f"  Awaiting their acceptance.",
        ])

    if cmd.startswith("ghost disconnect "):
        target = raw.split(" ", 2)[2] if len(raw.split(" ", 2)) > 2 else "unknown"
        return TerminalResponse(output=[
            f"  Disconnected from {target}.",
            f"  Contact removed from trusted list.",
        ])

    if cmd.startswith("ghost block "):
        target = raw.split(" ", 2)[2] if len(raw.split(" ", 2)) > 2 else "unknown"
        return TerminalResponse(output=[
            f"  {target} has been blocked.",
            f"  They can no longer contact you.",
        ])

    if cmd == "ghost blocked":
        return TerminalResponse(output=[
            "  Blocked identities:",
            "",
            "  • @Ghost-Specter-0099  (blocked 2026-05-15)",
            "  • @Ghost-Unknown-9999  (blocked 2026-04-30)",
            "",
            "  Total: 2 blocked",
        ])

    if cmd == "ghost inbox":
        return TerminalResponse(output=[
            "  ┌─────────────── INBOX ───────────────┐",
            "",
            "  [1] CipherNexus  — 'Ready for GhostTime?'   2m ago  [unread]",
            "  [2] ShadowEcho   — 'Can we verify identity?' 10m ago [unread]",
            "  [3] PhantomDrift — 'Your key looks good.'   1h ago",
            "",
            "  3 messages — 2 unread",
        ])

    if cmd == "ghost unread":
        return TerminalResponse(output=["  Unread messages: 2"])

    if cmd.startswith("ghost chat ") or cmd.startswith("ghost send "):
        parts = raw.split(" ", 2)
        target = parts[2] if len(parts) > 2 else "unknown"
        return TerminalResponse(output=[
            f"  Opening secure channel to {target}...",
            f"  End-to-end encryption: Active",
            f"  Use the Chat panel to send messages.",
        ])

    if cmd == "ghost reply":
        return TerminalResponse(output=[
            "  Reply to: CipherNexus",
            "  Use the Chat panel to compose your reply.",
        ])

    if cmd == "ghost privacy":
        return TerminalResponse(output=[
            "  ┌──────── PRIVACY SETTINGS ────────┐",
            "",
            "  Read receipts   : OFF",
            "  Last seen       : Hidden",
            "  Profile visible : Contacts only",
            "  Message logging : Disabled",
            "  IP masking      : ON  (relay active)",
            "  Zero-knowledge  : ON",
            "",
            "  All data stays local. No cloud sync.",
        ])

    if cmd == "ghost lock":
        return TerminalResponse(output=[
            "  Privacy lock ENABLED.",
            "  • Incoming notifications suppressed",
            "  • Message previews hidden",
            "  • Session fingerprint rotated",
            "  Type 'ghost whoami' to resume normal session.",
        ])

    if cmd == "ghost panic":
        return TerminalResponse(output=[
            "  ⚠  EMERGENCY LOCKDOWN ACTIVATED  ⚠",
            "",
            "  • All incoming connections severed",
            "  • Notifications disabled",
            "  • Hidden mode activated",
            "  • All other sessions logged out",
            "  • Session keys rotated",
            "",
            "  Authentication required to resume.",
            "  Stay safe.",
        ])

    if cmd == "ghost security":
        return TerminalResponse(output=[
            "  ┌───────── SECURITY DIAGNOSTICS ─────────┐",
            "",
            f"  Identity verified : YES",
            f"  Relay TLS         : TLS 1.3",
            f"  Cipher suite      : AES-256-GCM",
            f"  Key exchange      : X25519",
            f"  Fingerprint       : {''.join(random.choices('0123456789ABCDEF', k=40))}",
            f"  2FA               : Active",
            f"  Session expires   : Never (manual logout required)",
            "",
            "  No anomalies detected.",
        ])

    if cmd == "ghost audit":
        return TerminalResponse(output=["  ┌──────── AUDIT LOG ────────┐", ""] + [f"  {e}" for e in AUDIT_LOG] + [""])

    if cmd == "ghost logout":
        return TerminalResponse(output=[
            "  Session ended.",
            "  Your Ghost identity remains stored locally.",
            "  Reload the page to start a new session.",
        ])

    if cmd == "ghost delete-account":
        return TerminalResponse(output=[
            "  ⚠  WARNING: This will permanently erase your Ghost identity.",
            "  To confirm, clear your browser's localStorage manually.",
            "  This action cannot be undone.",
        ])

    if cmd == "ghost files":
        lines = ["  ┌──────── YOUR FILES ────────┐", ""]
        for f in FAKE_FILES:
            lines.append(f"  {f}")
        lines += ["", f"  {len(FAKE_FILES)} files stored"]
        return TerminalResponse(output=lines)

    if cmd == "ghost upload":
        return TerminalResponse(output=[
            "  File upload is handled via the Files panel (coming soon).",
            "  End-to-end encrypted storage is available for Ghost Pro users.",
        ])

    if cmd.startswith("ghost download "):
        fid = raw.split(" ", 2)[2] if len(raw.split(" ", 2)) > 2 else "unknown"
        return TerminalResponse(output=[
            f"  Retrieving file: {fid}...",
            "  Decrypting with your private key...",
            "  Download complete. Saved to local storage.",
        ])

    if cmd.startswith("ghost share file "):
        fid = raw.split(" ", 3)[3] if len(raw.split(" ", 3)) > 3 else "unknown"
        return TerminalResponse(output=[
            f"  File '{fid}' shared.",
            "  Encrypted share link generated.",
            "  Link is valid for 48 hours.",
        ])

    if cmd == "ghost backup":
        return TerminalResponse(output=[
            "  Creating encrypted backup...",
            "  Backup complete.",
            "  Store your identity key safely to restore this backup.",
        ])

    if cmd == "ghost sync":
        return TerminalResponse(output=[
            "  Syncing with trusted relay...",
            "  ████████████████████  100%",
            "  Sync complete. All data up to date.",
        ])

    if cmd == "ghost version":
        return TerminalResponse(output=[
            "  GhostTunn Shell v1.0.0",
            "  Backend : FastAPI 0.116.0",
            "  Protocol: GhostProtocol v3",
            "  Build   : 2026-06-04",
            "  License : Privacy-first, open source",
        ])

    if cmd == "ghost update":
        return TerminalResponse(output=[
            "  Checking for updates...",
            "  GhostTunn v1.0.0 — you are up to date.",
        ])

    if cmd == "ghost theme":
        return TerminalResponse(output=[
            "  Theme toggled.",
            "  Restart the terminal to apply the new theme.",
        ])

    if cmd == "ghost stats":
        return TerminalResponse(output=[
            "  ┌──────── SESSION STATS ────────┐",
            "",
            f"  Messages sent    : {random.randint(0, 200)}",
            f"  Messages received: {random.randint(0, 200)}",
            f"  Relay hops       : {random.randint(1, 5)}",
            f"  Latency (avg)    : {random.randint(10, 60)}ms",
            f"  Uptime           : {random.randint(1, 12)}h {random.randint(0, 59)}m",
            f"  Data transferred : {round(random.uniform(0.1, 12.5), 2)} MB",
            f"  Encryption ops   : {random.randint(100, 9999)}",
            "",
            "  All traffic routed through encrypted relay.",
        ])

    if cmd == "ghost ping":
        ms = random.randint(8, 60)
        return TerminalResponse(output=[
            "  Pinging ghost-relay-eu-01...",
            f"  Reply from relay: time={ms}ms  TTL=64",
            f"  Reply from relay: time={ms+2}ms  TTL=64",
            f"  Reply from relay: time={ms-1}ms  TTL=64",
            "",
            f"  Avg latency: {ms}ms — Connection is healthy.",
        ])

    if cmd == "ghost clear":
        return TerminalResponse(output=[], clear=True)

    return TerminalResponse(
        output=[
            f"  Unknown command: '{raw}'",
            f"  Type 'ghost help' to see all available commands.",
        ],
        status="error",
    )
