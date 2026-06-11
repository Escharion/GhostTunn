"""Top-level ASGI entrypoint for easier local dev.

This module re-exports the FastAPI `app` from `backend.app` so you can
run `uvicorn app:app` from the repository root.
"""
from backend.app import app  # re-export for uvicorn
