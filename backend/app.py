import os
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
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
    get_messages,
    get_notifications,
    get_user_by_public,
    get_user_chats,
)
from database import Base, engine, get_session
from schemas import (
    ChatCreate,
    IdentityCreateResponse,
    MessageCreate,
    MessageResponse,
    NotificationResponse,
    PostCreate,
    PostResponse,
)
from utils import get_avatar_choices
from terminal import router as terminal_router


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
async def feed(session: AsyncSession = Depends(get_session)):
    posts = await get_feed(session)
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
        )
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
    return [
        {
            "chat_id": chat.id,
            "participant_ids": [chat.user_a_id, chat.user_b_id],
            "created_at": chat.created_at,
            "active": chat.active,
        }
        for chat in chats
    ]


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
