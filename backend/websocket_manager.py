from __future__ import annotations

import json
from typing import Dict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, public_id: str):
        await websocket.accept()
        self.active[public_id] = websocket

    def disconnect(self, public_id: str):
        self.active.pop(public_id, None)

    async def send_to(self, public_id: str, data: dict):
        ws = self.active.get(public_id)
        if ws:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                self.disconnect(public_id)

    async def broadcast_to_pair(self, id_a: str, id_b: str, data: dict):
        await self.send_to(id_a, data)
        await self.send_to(id_b, data)


manager = ConnectionManager()
