from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models import Chat, Message, Notification, Post, User
from backend.utils import generate_private_id, generate_public_id


async def create_identity(session: AsyncSession, avatar: str, alias: str | None = None):
    for _ in range(5):
        public_id = generate_public_id(alias)
        private_id = generate_private_id()
        user = User(public_id=public_id, private_id=private_id, alias=public_id.replace("@Ghost-", ""), avatar=avatar)
        session.add(user)
        try:
            await session.commit()
            await session.refresh(user)
            return user
        except IntegrityError:
            await session.rollback()
    raise ValueError("Unable to create a unique Ghost identity at this time.")


async def get_user_by_public(session: AsyncSession, public_id: str):
    result = await session.execute(select(User).where(User.public_id == public_id))
    return result.scalars().first()


async def get_user_posts(session: AsyncSession, public_id: str):
    stmt = select(Post).join(User).where(User.public_id == public_id).order_by(Post.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()


async def get_feed(session: AsyncSession, limit: int = 20):
    stmt = select(Post).order_by(Post.created_at.desc()).limit(limit)
    result = await session.execute(stmt)
    return result.scalars().all()


async def create_post(session: AsyncSession, author_public_id: str, content: str, color: str = "ghost-white"):
    user = await get_user_by_public(session, author_public_id)
    if not user:
        raise ValueError("Sender not found")
    post = Post(author_id=user.id, content=content, color=color)
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return post


async def create_chat(session: AsyncSession, sender_public_id: str, recipient_public_id: str):
    sender = await get_user_by_public(session, sender_public_id)
    recipient = await get_user_by_public(session, recipient_public_id)
    if not sender or not recipient:
        raise ValueError("User not found")
    stmt = select(Chat).where(
        ((Chat.user_a_id == sender.id) & (Chat.user_b_id == recipient.id))
        | ((Chat.user_a_id == recipient.id) & (Chat.user_b_id == sender.id))
    )
    existing = (await session.execute(stmt)).scalars().first()
    if existing:
        return existing
    chat = Chat(user_a_id=sender.id, user_b_id=recipient.id)
    session.add(chat)
    await session.commit()
    await session.refresh(chat)
    return chat


async def get_user_chats(session: AsyncSession, public_id: str):
    user = await get_user_by_public(session, public_id)
    if not user:
        return []
    stmt = select(Chat).where((Chat.user_a_id == user.id) | (Chat.user_b_id == user.id)).order_by(Chat.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()


async def create_message(session: AsyncSession, chat_id: int, sender_public_id: str, recipient_public_id: str, content: str):
    chat = await session.get(Chat, chat_id)
    if not chat:
        raise ValueError("Chat does not exist")
    sender = await get_user_by_public(session, sender_public_id)
    recipient = await get_user_by_public(session, recipient_public_id)
    if not sender or not recipient:
        raise ValueError("User not found")
    message = Message(chat_id=chat.id, sender_id=sender.id, recipient_id=recipient.id, content=content)
    session.add(message)
    await session.commit()
    await session.refresh(message)
    return message


async def get_messages(session: AsyncSession, chat_id: int, limit: int = 100):
    stmt = select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at.asc()).limit(limit)
    result = await session.execute(stmt)
    return result.scalars().all()


async def get_notifications(session: AsyncSession, public_id: str):
    user = await get_user_by_public(session, public_id)
    if not user:
        return []
    stmt = select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()
