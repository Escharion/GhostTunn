from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AvatarChoice(BaseModel):
    name: str
    symbol: str
    description: Optional[str] = None


class IdentityCreateResponse(BaseModel):
    public_id: str
    private_id: str
    alias: str
    avatar: str
    created_at: datetime


class PostCreate(BaseModel):
    author_public_id: str
    content: str = Field(..., min_length=1, max_length=280)
    color: Optional[str] = Field(default="ghost-white")


class PostResponse(BaseModel):
    id: int
    author_public_id: str
    author_alias: str
    author_avatar: str
    content: str
    color: str
    likes: int
    comments: int
    reposts: int
    created_at: datetime

    class Config:
        orm_mode = True


class ChatCreate(BaseModel):
    sender_public_id: str
    recipient_public_id: str


class MessageCreate(BaseModel):
    chat_id: int
    sender_public_id: str
    recipient_public_id: str
    content: str = Field(..., min_length=1, max_length=1000)


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender_public_id: str
    recipient_public_id: str
    content: str
    created_at: datetime

    class Config:
        orm_mode = True


class NotificationResponse(BaseModel):
    id: int
    category: str
    message: str
    read: bool
    created_at: datetime

    class Config:
        orm_mode = True
