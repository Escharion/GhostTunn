from __future__ import annotations

import json
from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    @property
    def online_ids(self) -> Set[str]:
        return set(self.active.keys())

    async def connect(self, websocket: WebSocket, public_id: str):
        await websocket.accept()
        self.active[public_id] = websocket
        await self._broadcast_presence(public_id, "online")

    def disconnect(self, public_id: str):
        self.active.pop(public_id, None)
        import asyncio
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(self._broadcast_presence(public_id, "offline"))

    async def _broadcast_presence(self, public_id: str, status: str):
        payload = json.dumps({"type": "presence", "public_id": public_id, "status": status})
        dead = []
        for pid, ws in list(self.active.items()):
            if pid != public_id:
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead.append(pid)
        for pid in dead:
            self.active.pop(pid, None)

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
