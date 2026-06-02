import random
from datetime import datetime

ALIASES = [
    "Nova",
    "Echo",
    "Raven",
    "Shadow",
    "Cipher",
    "Atlas",
    "Specter",
    "Ember",
    "Flux",
    "Vapor",
    "Lumen",
    "Zenith",
]

AVATAR_CHOICES = [
    {"name": "Amber Trail", "symbol": "⛰️", "description": "Abstract mountain road"},
    {"name": "Neon Ghost", "symbol": "👻", "description": "Digital ghost symbol"},
    {"name": "Midnight Owl", "symbol": "🦉", "description": "Nocturnal guide"},
    {"name": "Golden Circuit", "symbol": "⚡", "description": "Electric pathway"},
    {"name": "Lunar Wave", "symbol": "🌙", "description": "Soft lunar glow"},
    {"name": "Silent Arrow", "symbol": "🏹", "description": "Stealth motion"},
]


def generate_public_id(alias: str = None) -> str:
    alias = alias or random.choice(ALIASES)
    digits = random.randint(100, 999)
    return f"@Ghost-{alias}-{digits}"


def generate_private_id() -> str:
    variable = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=3))
    date_segment = datetime.utcnow().strftime("%d%m")
    return f"#ghost-{variable}-{date_segment}-E"


def get_avatar_choices():
    return AVATAR_CHOICES
