from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.models import Chat, Message, Notification, Post, PostLike, User
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


async def get_user_by_private(session: AsyncSession, private_id: str):
    result = await session.execute(select(User).where(User.private_id == private_id))
    return result.scalars().first()


async def get_user_posts(session: AsyncSession, public_id: str):
    stmt = (
        select(Post)
        .join(User)
        .where(User.public_id == public_id)
        .options(selectinload(Post.author))
        .order_by(Post.created_at.desc())
    )
    result = await session.execute(stmt)
    return result.scalars().all()


async def get_feed(session: AsyncSession, limit: int = 20):
    stmt = (
        select(Post)
        .options(selectinload(Post.author))
        .order_by(Post.created_at.desc())
        .limit(limit)
    )
    result = await session.execute(stmt)
    return result.scalars().all()


async def create_post(session: AsyncSession, author_public_id: str, content: str, color: str = "ghost-white"):
    user = await get_user_by_public(session, author_public_id)
    if not user:
        raise ValueError("Sender not found")
    post = Post(author_id=user.id, content=content, color=color)
    session.add(post)
    await session.commit()
    stmt = select(Post).where(Post.id == post.id).options(selectinload(Post.author))
    result = await session.execute(stmt)
    return result.scalars().first()


async def toggle_like(session: AsyncSession, post_id: int, public_id: str):
    user = await get_user_by_public(session, public_id)
    if not user:
        raise ValueError("User not found")
    post = await session.get(Post, post_id)
    if not post:
        raise ValueError("Post not found")

    existing = (await session.execute(
        select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user.id)
    )).scalars().first()

    if existing:
        await session.delete(existing)
        post.likes = max(0, post.likes - 1)
        liked = False
    else:
        session.add(PostLike(post_id=post_id, user_id=user.id))
        post.likes = post.likes + 1
        liked = True

    await session.commit()
    await session.refresh(post)
    return post, liked


async def get_liked_post_ids(session: AsyncSession, public_id: str):
    user = await get_user_by_public(session, public_id)
    if not user:
        return set()
    result = await session.execute(select(PostLike.post_id).where(PostLike.user_id == user.id))
    return set(result.scalars().all())


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
    stmt = (
        select(Chat)
        .where((Chat.user_a_id == user.id) | (Chat.user_b_id == user.id))
        .options(selectinload(Chat.user_a), selectinload(Chat.user_b))
        .order_by(Chat.created_at.desc())
    )
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
    stmt = (
        select(Message)
        .where(Message.id == message.id)
        .options(selectinload(Message.sender), selectinload(Message.recipient))
    )
    result = await session.execute(stmt)
    return result.scalars().first()


async def get_messages(session: AsyncSession, chat_id: int, limit: int = 100):
    stmt = (
        select(Message)
        .where(Message.chat_id == chat_id)
        .options(selectinload(Message.sender), selectinload(Message.recipient))
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    result = await session.execute(stmt)
    return result.scalars().all()


async def get_vault_files(session: AsyncSession, public_id: str):
    user = await get_user_by_public(session, public_id)
    if not user:
        return []
    from models import VaultFile
    stmt = select(VaultFile).where(VaultFile.owner_id == user.id).order_by(VaultFile.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()


async def create_vault_file(session: AsyncSession, public_id: str, filename: str, original_name: str, mime_type: str, size: int):
    from models import VaultFile
    user = await get_user_by_public(session, public_id)
    if not user:
        raise ValueError("User not found")
    vf = VaultFile(owner_id=user.id, filename=filename, original_name=original_name, mime_type=mime_type, size=size)
    session.add(vf)
    await session.commit()
    await session.refresh(vf)
    return vf


async def delete_vault_file(session: AsyncSession, file_id: int, public_id: str):
    from models import VaultFile
    user = await get_user_by_public(session, public_id)
    if not user:
        raise ValueError("User not found")
    vf = await session.get(VaultFile, file_id)
    if not vf or vf.owner_id != user.id:
        raise ValueError("File not found or not yours")
    await session.delete(vf)
    await session.commit()
    return vf


async def get_stores(session: AsyncSession):
    from models import Store
    from sqlalchemy.orm import selectinload as sil
    stmt = select(Store).options(sil(Store.owner), sil(Store.products)).order_by(Store.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()


async def get_my_store(session: AsyncSession, public_id: str):
    from models import Store
    from sqlalchemy.orm import selectinload as sil
    user = await get_user_by_public(session, public_id)
    if not user:
        return None
    stmt = select(Store).where(Store.owner_id == user.id).options(sil(Store.owner), sil(Store.products)).limit(1)
    result = await session.execute(stmt)
    return result.scalars().first()


async def create_store(session: AsyncSession, public_id: str, name: str, description: str, logo_url: str, whatsapp_link: str, facebook_link: str):
    from models import Store
    user = await get_user_by_public(session, public_id)
    if not user:
        raise ValueError("User not found")
    store = Store(owner_id=user.id, name=name, description=description, logo_url=logo_url,
                  whatsapp_link=whatsapp_link, facebook_link=facebook_link)
    session.add(store)
    await session.commit()
    from sqlalchemy.orm import selectinload as sil
    stmt = select(Store).where(Store.id == store.id).options(sil(Store.owner), sil(Store.products))
    result = await session.execute(stmt)
    return result.scalars().first()


async def add_product(session: AsyncSession, store_id: int, name: str, description: str, image_url: str):
    from models import Product, Store
    from sqlalchemy.orm import selectinload as sil
    store = await session.get(Store, store_id)
    if not store:
        raise ValueError("Store not found")
    product = Product(store_id=store_id, name=name, description=description, image_url=image_url)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


async def mark_messages_read(session: AsyncSession, chat_id: int, reader_public_id: str):
    reader = await get_user_by_public(session, reader_public_id)
    if not reader:
        return []
    stmt = (
        select(Message)
        .where(Message.chat_id == chat_id, Message.recipient_id == reader.id, Message.read == False)
        .options(selectinload(Message.sender), selectinload(Message.recipient))
    )
    result = await session.execute(stmt)
    messages = result.scalars().all()
    for msg in messages:
        msg.read = True
    await session.commit()
    return messages


async def get_notifications(session: AsyncSession, public_id: str):
    user = await get_user_by_public(session, public_id)
    if not user:
        return []
    stmt = select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()
