import os
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from config import Settings
from crud import (
    create_chat,
    create_identity,
    create_message,
    create_post,
    get_feed,
    get_liked_post_ids,
    get_messages,
    get_notifications,
    get_user_by_private,
    get_user_by_public,
    get_user_chats,
    toggle_like,
)
from database import Base, engine, get_session
from schemas import (
    ChatCreate,
    IdentityCreateResponse,
    IdentityRecoverResponse,
    MessageCreate,
    MessageResponse,
    NotificationResponse,
    PostCreate,
    PostResponse,
)
from utils import get_avatar_choices
from terminal import router as terminal_router
from websocket_manager import manager

settings = Settings()

app = FastAPI(title=settings.PROJECT_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

project_dir = Path(__file__).resolve().parents[1]
frontend_dir = project_dir / "frontend"
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/", include_in_schema=False)
async def docs_redirect():
    root_index = project_dir / "index.html"
    if root_index.exists():
        return FileResponse(root_index)
    fallback_index = frontend_dir / "index.html"
    if fallback_index.exists():
        return FileResponse(fallback_index)
    raise HTTPException(status_code=404, detail="Frontend not found")


@app.get("/index.html", include_in_schema=False)
async def serve_index():
    root_index = project_dir / "index.html"
    if root_index.exists():
        return FileResponse(root_index)
    raise HTTPException(status_code=404, detail="Index not found")


@app.get("/styles.css", include_in_schema=False)
async def serve_styles():
    style_path = project_dir / "styles.css"
    if style_path.exists():
        return FileResponse(style_path, media_type="text/css")
    raise HTTPException(status_code=404, detail="Stylesheet not found")


@app.get("/script.js", include_in_schema=False)
async def serve_script():
    script_path = project_dir / "script.js"
    if script_path.exists():
        return FileResponse(script_path, media_type="application/javascript")
    raise HTTPException(status_code=404, detail="Script not found")


@app.get("/logo.jpeg", include_in_schema=False)
async def serve_logo():
    logo_path = project_dir / "logo.jpeg"
    if logo_path.exists():
        return FileResponse(logo_path, media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Logo not found")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.get("/api/avatars")
async def avatars():
    return get_avatar_choices()


@app.post("/api/identity", response_model=IdentityCreateResponse)
async def create_identity_endpoint(avatar: str, session: AsyncSession = Depends(get_session)):
    try:
        identity = await create_identity(session, avatar)
        return IdentityCreateResponse(
            public_id=identity.public_id,
            private_id=identity.private_id,
            alias=identity.alias,
            avatar=identity.avatar,
            created_at=identity.created_at,
        )
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/identity/recover", response_model=IdentityRecoverResponse)
async def recover_identity(payload: dict, session: AsyncSession = Depends(get_session)):
    private_id = (payload.get("private_id") or "").strip()
    if not private_id:
        raise HTTPException(status_code=400, detail="private_id is required")
    user = await get_user_by_private(session, private_id)
    if not user:
        raise HTTPException(status_code=404, detail="Identity not found. Check your private key.")
    return IdentityRecoverResponse(
        public_id=user.public_id,
        private_id=user.private_id,
        alias=user.alias,
        avatar=user.avatar,
        created_at=user.created_at,
    )


@app.get("/api/user/{public_id}")
async def get_user(public_id: str, session: AsyncSession = Depends(get_session)):
    user = await get_user_by_public(session, public_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "public_id": user.public_id,
        "alias": user.alias,
        "avatar": user.avatar,
        "created_at": user.created_at,
    }


@app.get("/api/feed", response_model=list[PostResponse])
async def feed(viewer_public_id: str = "", session: AsyncSession = Depends(get_session)):
    posts = await get_feed(session)
    liked_ids = await get_liked_post_ids(session, viewer_public_id) if viewer_public_id else set()
    return [
        PostResponse(
            id=post.id,
            author_public_id=post.author.public_id,
            author_alias=post.author.alias,
            author_avatar=post.author.avatar,
            content=post.content,
            color=post.color,
            likes=post.likes,
            comments=post.comments,
            reposts=post.reposts,
            created_at=post.created_at,
            liked=post.id in liked_ids,
        )
        for post in posts
    ]


@app.post("/api/posts", response_model=PostResponse)
async def post_message(payload: PostCreate, session: AsyncSession = Depends(get_session)):
    try:
        post = await create_post(session, payload.author_public_id, payload.content, payload.color)
        return PostResponse(
            id=post.id,
            author_public_id=post.author.public_id,
            author_alias=post.author.alias,
            author_avatar=post.author.avatar,
            content=post.content,
            color=post.color,
            likes=post.likes,
            comments=post.comments,
            reposts=post.reposts,
            created_at=post.created_at,
            liked=False,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/api/posts/{post_id}/like")
async def like_post(post_id: int, payload: dict, session: AsyncSession = Depends(get_session)):
    public_id = (payload.get("public_id") or "").strip()
    if not public_id:
        raise HTTPException(status_code=400, detail="public_id required")
    try:
        post, liked = await toggle_like(session, post_id, public_id)
        return {"likes": post.likes, "liked": liked}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/api/chats")
async def open_chat(payload: ChatCreate, session: AsyncSession = Depends(get_session)):
    try:
        chat = await create_chat(session, payload.sender_public_id, payload.recipient_public_id)
        return {"chat_id": chat.id, "created_at": chat.created_at}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get("/api/chats/{public_id}")
async def chats_for_user(public_id: str, session: AsyncSession = Depends(get_session)):
    chats = await get_user_chats(session, public_id)
    result = []
    for chat in chats:
        result.append({
            "chat_id": chat.id,
            "user_a_public_id": chat.user_a.public_id,
            "user_b_public_id": chat.user_b.public_id,
            "user_a_avatar": chat.user_a.avatar,
            "user_b_avatar": chat.user_b.avatar,
            "user_a_alias": chat.user_a.alias,
            "user_b_alias": chat.user_b.alias,
            "created_at": chat.created_at,
            "active": chat.active,
        })
    return result


@app.get("/api/messages/{chat_id}", response_model=list[MessageResponse])
async def fetch_messages(chat_id: int, session: AsyncSession = Depends(get_session)):
    messages = await get_messages(session, chat_id)
    return [
        MessageResponse(
            id=message.id,
            chat_id=message.chat_id,
            sender_public_id=message.sender.public_id,
            recipient_public_id=message.recipient.public_id,
            content=message.content,
            created_at=message.created_at,
        )
        for message in messages
    ]


@app.post("/api/messages", response_model=MessageResponse)
async def send_message(payload: MessageCreate, session: AsyncSession = Depends(get_session)):
    try:
        message = await create_message(
            session,
            payload.chat_id,
            payload.sender_public_id,
            payload.recipient_public_id,
            payload.content,
        )
        msg_data = {
            "type": "message",
            "id": message.id,
            "chat_id": message.chat_id,
            "sender_public_id": message.sender.public_id,
            "recipient_public_id": message.recipient.public_id,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
        }
        await manager.broadcast_to_pair(
            message.sender.public_id,
            message.recipient.public_id,
            msg_data,
        )
        return MessageResponse(
            id=message.id,
            chat_id=message.chat_id,
            sender_public_id=message.sender.public_id,
            recipient_public_id=message.recipient.public_id,
            content=message.content,
            created_at=message.created_at,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.websocket("/ws/{public_id}")
async def websocket_endpoint(websocket: WebSocket, public_id: str, session: AsyncSession = Depends(get_session)):
    await manager.connect(websocket, public_id)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            if msg_type == "message":
                try:
                    message = await create_message(
                        session,
                        data["chat_id"],
                        data["sender_public_id"],
                        data["recipient_public_id"],
                        data["content"],
                    )
                    out = {
                        "type": "message",
                        "id": message.id,
                        "chat_id": message.chat_id,
                        "sender_public_id": message.sender.public_id,
                        "recipient_public_id": message.recipient.public_id,
                        "content": message.content,
                        "created_at": message.created_at.isoformat(),
                    }
                    await manager.broadcast_to_pair(
                        message.sender.public_id,
                        message.recipient.public_id,
                        out,
                    )
                except Exception as e:
                    await websocket.send_json({"type": "error", "message": str(e)})
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(public_id)


app.include_router(terminal_router, prefix="/api")


@app.get("/api/notifications/{public_id}", response_model=list[NotificationResponse])
async def notifications(public_id: str, session: AsyncSession = Depends(get_session)):
    notifications = await get_notifications(session, public_id)
    return [
        NotificationResponse(
            id=notification.id,
            category=notification.category,
            message=notification.message,
            read=notification.read,
            created_at=notification.created_at,
        )
        for notification in notifications
    ]
