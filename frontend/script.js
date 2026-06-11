const screens = {
  splash: document.getElementById('splashScreen'),
  welcome: document.getElementById('welcomeScreen'),
  recover: document.getElementById('recoverScreen'),
  identity: document.getElementById('identityScreen'),
  app: document.getElementById('appShell'),
};

const publicIdValue = document.getElementById('publicIdValue');
const privateIdValue = document.getElementById('privateIdValue');
const avatarGrid = document.getElementById('avatarGrid');
const saveIdentityButton = document.getElementById('saveIdentity');
const welcomeContinue = document.getElementById('welcomeContinue');
const welcomeRecover = document.getElementById('welcomeRecover');
const identityBack = document.getElementById('identityBack');
const recoverBack = document.getElementById('recoverBack');
const recoverSubmit = document.getElementById('recoverSubmit');
const recoverKeyInput = document.getElementById('recoverKeyInput');
const recoverError = document.getElementById('recoverError');
const postForm = document.getElementById('postForm');
const postInput = document.getElementById('postInput');
const charCount = document.getElementById('charCount');
const feedList = document.getElementById('feedList');
const chatList = document.getElementById('chatList');
const newChatInput = document.getElementById('newChatInput');
const newChatBtn = document.getElementById('newChatBtn');
const idConnections = document.getElementById('idConnections');
const notificationsList = document.getElementById('notificationsList');
const accountPublicId = document.getElementById('accountPublicId');
const accountPrivateId = document.getElementById('accountPrivateId');
const accountAvatar = document.getElementById('accountAvatar');
const accountJoined = document.getElementById('accountJoined');
const accountPosts = document.getElementById('accountPosts');
const accountConnections = document.getElementById('accountConnections');
const revealPrivate = document.getElementById('revealPrivate');
const copyPrivate = document.getElementById('copyPrivate');
const resetIdentity = document.getElementById('resetIdentity');
const navItems = Array.from(document.querySelectorAll('.nav-item'));
const views = Array.from(document.querySelectorAll('.content-view'));
const globalSearch = document.getElementById('globalSearch');

const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');

const chatRoomOverlay = document.getElementById('chatRoomOverlay');
const chatBackBtn = document.getElementById('chatBackBtn');
const chatRoomMessages = document.getElementById('chatRoomMessages');
const chatRoomInput = document.getElementById('chatRoomInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatRoomAvatar = document.getElementById('chatRoomAvatar');
const chatRoomName = document.getElementById('chatRoomName');
const chatRoomStatus = document.getElementById('chatRoomStatus');

const defaultAvatarOptions = [
  { name: 'Amber Trail', symbol: '⛰️' },
  { name: 'Neon Ghost', symbol: '👻' },
  { name: 'Midnight Owl', symbol: '🦉' },
  { name: 'Golden Circuit', symbol: '⚡' },
  { name: 'Lunar Wave', symbol: '🌙' },
  { name: 'Silent Arrow', symbol: '🏹' },
];

const state = {
  publicId: null,
  privateId: null,
  avatar: null,
  alias: null,
  selectedAvatar: null,
  feed: [],
  likedPostIds: new Set(),
  chats: [],
  ids: [],
  notifications: [],
  activeChatId: null,
  activeChatRecipientPublicId: null,
  activeChatRecipientAlias: null,
  activeChatRecipientAvatar: '👻',
  ws: null,
  wsReconnectTimer: null,
  unreadCounts: {},
  typingHideTimer: null,
  typingSendTimer: null,
  vault: [],
  market: [],
  myStore: null,
  onlineUsers: new Set(),
  terminalTheme: 'default',
  marketProductImageUrl: null,
  wsPingStart: null,
};

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

function generatePublicId() {
  const aliases = ['Nova', 'Echo', 'Raven', 'Shadow', 'Cipher', 'Atlas', 'Specter', 'Ember', 'Flux', 'Vapor', 'Lumen', 'Zenith'];
  const alias = aliases[Math.floor(Math.random() * aliases.length)];
  const digits = Math.floor(Math.random() * 900) + 100;
  state.publicId = `@Ghost-${alias}-${digits}`;
  state.alias = alias;
  publicIdValue.textContent = state.publicId;
}

function generatePrivateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const variable = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  const dateSegment = new Date().toISOString().slice(5, 10).replace('-', '');
  state.privateId = `#ghost-${variable}-${dateSegment}-E`;
  privateIdValue.textContent = state.privateId;
}

function renderAvatarOptions(list = defaultAvatarOptions) {
  avatarGrid.innerHTML = '';
  list.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'avatar-option';
    button.innerHTML = `<div class="symbol">${option.symbol}</div><strong>${option.name}</strong>`;
    button.addEventListener('click', () => selectAvatar(option));
    avatarGrid.appendChild(button);
  });
}

function selectAvatar(option) {
  state.selectedAvatar = option;
  state.avatar = `${option.symbol} ${option.name}`;
  saveIdentityButton.removeAttribute('disabled');
  document.querySelectorAll('.avatar-option').forEach(node => {
    node.classList.toggle('selected', node.textContent.includes(option.name));
  });
}

function saveIdentityLocally() {
  if (!state.publicId || !state.privateId || !state.selectedAvatar) return;
  const identity = {
    publicId: state.publicId,
    privateId: state.privateId,
    alias: state.alias,
    avatar: state.avatar,
    joinedAt: new Date().toISOString(),
  };
  localStorage.setItem('ghosttunnIdentity', JSON.stringify(identity));
  initializeApp(identity);
}

async function createIdentity() {
  if (!state.selectedAvatar) {
    alert('Please select an avatar before continuing.');
    return;
  }
  const avatarValue = state.avatar;
  try {
    const data = await apiFetch(`/api/identity?avatar=${encodeURIComponent(avatarValue)}`, { method: 'POST' });
    const identity = {
      publicId: data.public_id,
      privateId: data.private_id,
      alias: data.alias,
      avatar: data.avatar,
      joinedAt: new Date(data.created_at).toISOString(),
    };
    localStorage.setItem('ghosttunnIdentity', JSON.stringify(identity));
    await initializeApp(identity);
    return;
  } catch (error) {
    console.warn('Backend unavailable or failed identity creation:', error.message);
    saveIdentityLocally();
  }
}

async function recoverIdentity() {
  const key = recoverKeyInput.value.trim();
  if (!key) {
    recoverError.textContent = 'Please enter your private key.';
    recoverError.classList.remove('hidden');
    return;
  }
  recoverError.classList.add('hidden');
  recoverSubmit.disabled = true;
  recoverSubmit.textContent = 'Recovering...';
  try {
    const data = await apiFetch('/api/identity/recover', {
      method: 'POST',
      body: JSON.stringify({ private_id: key }),
    });
    const identity = {
      publicId: data.public_id,
      privateId: data.private_id,
      alias: data.alias,
      avatar: data.avatar,
      joinedAt: new Date(data.created_at).toISOString(),
    };
    localStorage.setItem('ghosttunnIdentity', JSON.stringify(identity));
    await initializeApp(identity);
  } catch (error) {
    recoverError.textContent = 'Identity not found. Check your private key.';
    recoverError.classList.remove('hidden');
  } finally {
    recoverSubmit.disabled = false;
    recoverSubmit.textContent = 'Recover Identity';
  }
}

function loadIdentity() {
  const raw = localStorage.getItem('ghosttunnIdentity');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function updateAccountSummary() {
  accountPosts.textContent = String(state.feed.filter(post => post.author === state.publicId).length);
  accountConnections.textContent = String(state.ids.length);
}

function mapBackendPost(post) {
  const avatar = post.author_avatar ? post.author_avatar.split(' ')[0] : '👻';
  return {
    id: post.id,
    author: post.author_public_id,
    avatar,
    alias: post.author_alias,
    time: new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    content: post.content,
    likes: post.likes || 0,
    liked: post.liked || false,
  };
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'same-origin',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'API request failed');
  }
  return response.json();
}

async function loadAvatarOptions() {
  try {
    const avatars = await apiFetch('/api/avatars');
    if (Array.isArray(avatars) && avatars.length > 0) {
      renderAvatarOptions(avatars);
      return;
    }
  } catch (error) {
    console.warn('Unable to load avatar options from backend:', error.message);
  }
  renderAvatarOptions(defaultAvatarOptions);
}

async function loadFeed() {
  try {
    const url = state.publicId
      ? `/api/feed?viewer_public_id=${encodeURIComponent(state.publicId)}`
      : '/api/feed';
    const posts = await apiFetch(url);
    if (Array.isArray(posts)) {
      state.feed = posts.map(mapBackendPost);
      state.likedPostIds = new Set(state.feed.filter(p => p.liked).map(p => p.id));
      renderFeed();
      updateAccountSummary();
      return;
    }
  } catch (error) {
    console.warn('Feed API unavailable:', error.message);
  }
  if (!state.feed.length) {
    state.feed = [{
      id: 1, author: '@Ghost-Echo-502', avatar: '👻', alias: 'Echo',
      time: '10:32 PM', content: 'The future belongs to builders.', likes: 0, liked: false,
    }];
    renderFeed();
    updateAccountSummary();
  }
}

async function loadNotifications() {
  try {
    const notifications = await apiFetch(`/api/notifications/${encodeURIComponent(state.publicId)}`);
    if (Array.isArray(notifications)) {
      state.notifications = notifications.map(note => ({
        id: note.id,
        title: note.category,
        message: note.message,
        time: new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      renderNotifications();
      return;
    }
  } catch (error) {
    console.warn('Notifications API unavailable:', error.message);
  }
  if (!state.notifications.length) {
    state.notifications = [
      { id: 1, title: 'New like', message: 'Your post received a new like.', time: '2m ago' },
      { id: 2, title: 'Friend accepted', message: '@Ghost-Shadow-184 accepted your connection.', time: '12m ago' },
    ];
    renderNotifications();
  }
}

async function loadUserProfile() {
  try {
    const profile = await apiFetch(`/api/user/${encodeURIComponent(state.publicId)}`);
    if (profile) {
      state.alias = profile.alias;
      accountPublicId.textContent = profile.public_id;
      accountAvatar.textContent = profile.avatar.split(' ')[0] || '👻';
      accountJoined.textContent = new Date(profile.created_at).toLocaleDateString();
    }
  } catch (error) {
    console.warn('User profile API unavailable:', error.message);
  }
}

async function loadChats() {
  try {
    const chats = await apiFetch(`/api/chats/${encodeURIComponent(state.publicId)}`);
    if (Array.isArray(chats)) {
      state.chats = chats;
      renderChats();
    }
  } catch (error) {
    console.warn('Chats API unavailable:', error.message);
  }
}

async function submitPost(content) {
  try {
    const post = await apiFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ author_public_id: state.publicId, content, color: 'ghost-white' }),
    });
    return mapBackendPost(post);
  } catch (error) {
    console.warn('Post API unavailable, saving locally.', error.message);
    return {
      id: Date.now(),
      author: state.publicId,
      avatar: state.avatar ? state.avatar.split(' ')[0] : '👻',
      alias: state.alias,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
      likes: 0,
      liked: false,
    };
  }
}

async function handleLike(postId, btn) {
  const post = state.feed.find(p => p.id === postId);
  if (!post) return;

  try {
    const result = await apiFetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ public_id: state.publicId }),
    });
    post.liked = result.liked;
    post.likes = result.likes;
    if (result.liked) {
      state.likedPostIds.add(postId);
    } else {
      state.likedPostIds.delete(postId);
    }
    btn.textContent = `${post.liked ? '❤️' : '🤍'} ${post.likes}`;
    btn.classList.toggle('liked', post.liked);
  } catch (err) {
    console.warn('Like failed:', err.message);
  }
}

function renderFeed() {
  feedList.innerHTML = '';
  state.feed.forEach(post => {
    const item = document.createElement('article');
    item.className = 'feed-item';
    const likedClass = post.liked ? ' liked' : '';
    item.innerHTML = `
      <header>
        <div class="profile">
          <span class="profile-avatar">${post.avatar}</span>
          <div class="profile-label"><strong>${post.author}</strong><small>${post.alias}</small></div>
        </div>
        <span class="timestamp">${post.time}</span>
      </header>
      <p>${post.content}</p>
      <div class="action-row">
        <button class="action-pill action-pill--like${likedClass}" data-post-id="${post.id}">${post.liked ? '❤️' : '🤍'} ${post.likes}</button>
        <span class="action-pill">💬 Comment</span>
        <span class="action-pill">🔄 Repost</span>
      </div>
    `;
    const likeBtn = item.querySelector('.action-pill--like');
    likeBtn.addEventListener('click', () => handleLike(post.id, likeBtn));
    feedList.appendChild(item);
  });
}

function renderChats() {
  chatList.innerHTML = '';
  if (state.chats.length === 0) {
    chatList.innerHTML = '<p class="empty-state">No chats yet. Enter a Ghost ID above to start one.</p>';
    return;
  }
  state.chats.forEach(chat => {
    const isA = chat.user_a_public_id === state.publicId;
    const otherPublicId = isA ? chat.user_b_public_id : chat.user_a_public_id;
    const otherAlias = isA ? chat.user_b_alias : chat.user_a_alias;
    const otherAvatarFull = isA ? chat.user_b_avatar : chat.user_a_avatar;
    const otherAvatar = otherAvatarFull ? otherAvatarFull.split(' ')[0] : '👻';
    const unread = state.unreadCounts[chat.chat_id] || 0;

    const isOnline = state.onlineUsers.has(otherPublicId);
    const item = document.createElement('article');
    item.className = 'chat-card';
    item.innerHTML = `
      <header>
        <div class="profile">
          <div class="profile-avatar-wrap">
            <span class="profile-avatar">${otherAvatar}</span>
            ${isOnline ? '<span class="presence-dot"></span>' : ''}
          </div>
          <div class="profile-label">
            <strong>${otherPublicId}</strong>
            <small>${otherAlias || 'Ghost'}${isOnline ? ' · <span style="color:#4ade80">online</span>' : ''}</small>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="timestamp">${new Date(chat.created_at).toLocaleDateString()}</span>
          ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
        </div>
      </header>
    `;
    item.addEventListener('click', () => {
      state.unreadCounts[chat.chat_id] = 0;
      updateChatBadge();
      openChatRoom(chat.chat_id, otherPublicId, otherAlias, otherAvatar);
    });
    chatList.appendChild(item);
  });
}

function renderConnections() {
  idConnections.innerHTML = '';
  if (state.ids.length === 0) {
    idConnections.innerHTML = '<p class="empty-state">No connections yet.</p>';
    return;
  }
  state.ids.forEach(connection => {
    const card = document.createElement('article');
    card.className = 'id-card';
    card.innerHTML = `
      <div class="profile">
        <span class="profile-avatar">${connection.avatar}</span>
        <div class="profile-label"><strong>${connection.publicId}</strong><small>${connection.status}</small></div>
      </div>
      <div class="action-row">
        <span class="action-pill">Open Chat</span>
        <span class="action-pill">Remove</span>
      </div>
    `;
    idConnections.appendChild(card);
  });
}

function renderNotifications() {
  notificationsList.innerHTML = '';
  if (state.notifications.length === 0) {
    notificationsList.innerHTML = '<p class="empty-state">No notifications yet.</p>';
    return;
  }
  state.notifications.forEach(note => {
    const card = document.createElement('article');
    card.className = 'notification-card';
    card.innerHTML = `
      <div class="profile-label"><strong>${note.title}</strong><small>${note.time}</small></div>
      <p>${note.message}</p>
    `;
    notificationsList.appendChild(card);
  });
}

function showView(viewId) {
  views.forEach(view => view.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');
  navItems.forEach(item => item.classList.toggle('nav-item--active', item.dataset.target === viewId));
}

// ── Chat Room ──────────────────────────────────────────────────────────────

async function openChatRoom(chatId, recipientPublicId, recipientAlias, recipientAvatar) {
  state.activeChatId = chatId;
  state.activeChatRecipientPublicId = recipientPublicId;
  state.activeChatRecipientAlias = recipientAlias || `Chat #${chatId}`;
  state.activeChatRecipientAvatar = recipientAvatar || '👻';

  chatRoomAvatar.textContent = state.activeChatRecipientAvatar;
  chatRoomName.textContent = state.activeChatRecipientAlias;
  chatRoomStatus.textContent = 'Online';
  chatRoomMessages.innerHTML = '';
  chatRoomOverlay.classList.remove('hidden');
  document.body.classList.add('chat-open');

  try {
    const messages = await apiFetch(`/api/messages/${chatId}`);
    messages.forEach(msg => appendChatMessage(msg.sender_public_id, msg.content, msg.created_at, msg.id, msg.read));
  } catch (err) {
    console.warn('Could not load messages:', err.message);
  }
  scrollChatToBottom();
  chatRoomInput.focus();
  setTimeout(markChatRead, 500);
}

function closeChatRoom() {
  chatRoomOverlay.classList.add('hidden');
  document.body.classList.remove('chat-open');
  state.activeChatId = null;
}

function appendChatMessage(senderPublicId, content, createdAt, msgId, read) {
  const isMine = senderPublicId === state.publicId;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${isMine ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`;
  if (msgId) bubble.dataset.msgId = msgId;
  const time = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const tickHtml = isMine
    ? `<span class="bubble-tick ${read ? 'bubble-tick--read' : ''}">
         <svg viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
           <path d="M7 5l3.5 3.5L17 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
       </span>`
    : '';
  bubble.innerHTML = `<span class="bubble-text">${escapeHtml(content)}</span><span class="bubble-meta">${time}${tickHtml}</span>`;
  chatRoomMessages.appendChild(bubble);
}

function markChatRead() {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
  if (!state.activeChatId) return;
  state.ws.send(JSON.stringify({
    type: 'read',
    chat_id: state.activeChatId,
    reader_public_id: state.publicId,
  }));
}

function updateTicksToRead() {
  chatRoomMessages.querySelectorAll('.chat-bubble--mine .bubble-tick').forEach(tick => {
    tick.classList.add('bubble-tick--read');
  });
}

function scrollChatToBottom() {
  chatRoomMessages.scrollTop = chatRoomMessages.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendChatMessage() {
  const content = chatRoomInput.value.trim();
  if (!content || !state.activeChatId || !state.activeChatRecipientPublicId) return;
  chatRoomInput.value = '';
  chatRoomInput.style.height = 'auto';

  const optimistic = { sender_public_id: state.publicId, content, created_at: new Date().toISOString() };
  appendChatMessage(optimistic.sender_public_id, optimistic.content, optimistic.created_at);
  scrollChatToBottom();

  try {
    const saved = await apiFetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        chat_id: state.activeChatId,
        sender_public_id: state.publicId,
        recipient_public_id: state.activeChatRecipientPublicId,
        content,
      }),
    });
    const lastBubble = chatRoomMessages.querySelector('.chat-bubble--mine:last-of-type');
    if (lastBubble) lastBubble.dataset.msgId = saved.id;
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({
        type: 'message',
        id: saved.id,
        chat_id: saved.chat_id,
        sender_public_id: saved.sender_public_id,
        recipient_public_id: saved.recipient_public_id,
        content: saved.content,
        read: false,
        created_at: saved.created_at,
      }));
    }
  } catch (err) {
    console.warn('Message send failed:', err.message);
  }
}

async function startNewChat() {
  const targetId = newChatInput.value.trim();
  if (!targetId) return;
  try {
    const result = await apiFetch('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ sender_public_id: state.publicId, recipient_public_id: targetId }),
    });
    newChatInput.value = '';
    state.activeChatRecipientPublicId = targetId;
    await openChatRoom(result.chat_id, targetId, targetId, '👻');
    await loadChats();
  } catch (err) {
    alert('Could not start chat. Make sure the Ghost ID exists.');
  }
}

// ── Typing indicator ───────────────────────────────────────────────────────

function showTypingIndicator() {
  let el = document.getElementById('typingIndicator');
  if (!el) {
    el = document.createElement('div');
    el.id = 'typingIndicator';
    el.className = 'typing-indicator';
    el.innerHTML = `<span></span><span></span><span></span>`;
    chatRoomMessages.appendChild(el);
  }
  el.classList.remove('hidden');
  scrollChatToBottom();
  clearTimeout(state.typingHideTimer);
  state.typingHideTimer = setTimeout(hideTypingIndicator, 3000);
}

function hideTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.classList.add('hidden');
  clearTimeout(state.typingHideTimer);
  state.typingHideTimer = null;
}

function sendTypingEvent() {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
  if (!state.activeChatId || !state.activeChatRecipientPublicId) return;
  state.ws.send(JSON.stringify({
    type: 'typing',
    chat_id: state.activeChatId,
    sender_public_id: state.publicId,
    recipient_public_id: state.activeChatRecipientPublicId,
  }));
}

// ── WebSocket ──────────────────────────────────────────────────────────────

function updateChatBadge() {
  const total = Object.values(state.unreadCounts).reduce((a, b) => a + b, 0);
  const chatNavItem = document.querySelector('.nav-item[data-target="chatsView"]');
  if (!chatNavItem) return;
  let badge = chatNavItem.querySelector('.nav-badge');
  if (total > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      chatNavItem.appendChild(badge);
    }
    badge.textContent = total;
  } else if (badge) {
    badge.remove();
  }
}

function connectWebSocket() {
  if (!state.publicId) return;
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${protocol}://${location.host}/ws/${encodeURIComponent(state.publicId)}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    state.ws = ws;
    if (state.wsReconnectTimer) {
      clearTimeout(state.wsReconnectTimer);
      state.wsReconnectTimer = null;
    }
    if (chatRoomStatus) chatRoomStatus.textContent = 'Connected';
    ws.send(JSON.stringify({ type: 'ping' }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'message' && data.sender_public_id !== state.publicId) {
        hideTypingIndicator();
        if (state.activeChatId === data.chat_id && !chatRoomOverlay.classList.contains('hidden')) {
          appendChatMessage(data.sender_public_id, data.content, data.created_at, data.id, data.read);
          scrollChatToBottom();
          setTimeout(markChatRead, 300);
        } else {
          state.unreadCounts[data.chat_id] = (state.unreadCounts[data.chat_id] || 0) + 1;
          updateChatBadge();
          renderChats();
        }
      } else if (data.type === 'read') {
        if (state.activeChatId === data.chat_id) {
          updateTicksToRead();
        }
      } else if (data.type === 'typing' && data.sender_public_id !== state.publicId) {
        if (state.activeChatId === data.chat_id && !chatRoomOverlay.classList.contains('hidden')) {
          showTypingIndicator();
        }
      } else if (data.type === 'presence') {
        if (data.status === 'online') {
          state.onlineUsers.add(data.public_id);
        } else {
          state.onlineUsers.delete(data.public_id);
        }
        renderChats();
        if (state.activeChatRecipientPublicId === data.public_id) {
          chatRoomStatus.textContent = data.status === 'online' ? 'Online' : 'Offline';
          chatRoomStatus.style.color = data.status === 'online' ? '#4ade80' : 'var(--muted)';
        }
      } else if (data.type === 'pong') {
        if (state.wsPingStart) {
          const ms = Date.now() - state.wsPingStart;
          state.wsPingStart = null;
          appendTerminalLine(`  Reply from relay: time=${ms}ms  TTL=64`, 'terminal-line--output');
          appendTerminalLine(`  Reply from relay: time=${ms + 1}ms  TTL=64`, 'terminal-line--output');
          appendTerminalLine(`  Reply from relay: time=${ms - 1 > 0 ? ms - 1 : ms}ms  TTL=64`, 'terminal-line--output');
          appendTerminalLine('', 'terminal-line--output');
          appendTerminalLine(`  Avg latency: ${ms}ms — ${ms < 60 ? 'Connection is healthy.' : 'Relay responding.'}`, 'terminal-line--output');
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
          terminalInput.disabled = false;
          terminalInput.focus();
        }
      }
    } catch (e) {
      console.warn('WS parse error:', e);
    }
  };

  ws.onclose = () => {
    state.ws = null;
    if (chatRoomStatus) chatRoomStatus.textContent = 'Reconnecting...';
    state.wsReconnectTimer = setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = () => {
    ws.close();
  };
}

// ── Terminal ───────────────────────────────────────────────────────────────

function appendTerminalLine(text, cls = '') {
  const line = document.createElement('div');
  line.className = `terminal-line${cls ? ' ' + cls : ''}`;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function appendTerminalInput(cmd) {
  const line = document.createElement('div');
  line.className = 'terminal-line terminal-line--input';
  line.innerHTML = `<span class="terminal-prompt-echo">ghost@tunn:~$</span> <span>${escapeHtml(cmd)}</span>`;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

async function printTerminalLines(lines, delayMs = 30) {
  for (const line of lines) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    appendTerminalLine(line, 'terminal-line--output');
  }
}

async function runTerminalCommand(cmd) {
  if (!cmd.trim()) return;
  appendTerminalInput(cmd);
  terminalInput.disabled = true;
  let isWsPing = false;

  try {
    const result = await apiFetch('/api/terminal', {
      method: 'POST',
      body: JSON.stringify({ command: cmd, public_id: state.publicId }),
    });

    if (result.clear) terminalOutput.innerHTML = '';
    if (result.output && result.output.length > 0) await printTerminalLines(result.output, 28);

    if (result.status === 'bld_active') {
      terminalInput.placeholder = '@ghost send <id> <message>';
    } else if (result.status === 'bld_exit') {
      terminalInput.placeholder = 'ghost help';
    } else if (result.status === 'theme') {
      applyTerminalTheme(result.extra.theme);
    } else if (result.status === 'vault_redirect') {
      setTimeout(() => showView('vaultView'), 400);
      loadVault();
    } else if (result.status === 'ws_ping') {
      if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        isWsPing = true;
        state.wsPingStart = Date.now();
        appendTerminalLine('  Pinging ghost-relay-eu-01...', 'terminal-line--output');
        state.ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        appendTerminalLine('  WebSocket not connected — relay unreachable.', 'terminal-line--error');
      }
    }
  } catch (err) {
    appendTerminalLine(`  Error: ${err.message}`, 'terminal-line--error');
  } finally {
    if (!isWsPing) {
      terminalInput.disabled = false;
      terminalInput.focus();
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  }
}

function applyTerminalTheme(theme) {
  const shell = document.getElementById('terminalShell');
  if (!shell) return;
  shell.className = `terminal-shell terminal-theme-${theme}`;
  state.terminalTheme = theme;
}

// ── Event bindings ─────────────────────────────────────────────────────────

function bindEvents() {
  welcomeContinue.addEventListener('click', () => showScreen('identity'));
  welcomeRecover.addEventListener('click', () => {
    recoverKeyInput.value = '';
    recoverError.classList.add('hidden');
    showScreen('recover');
  });

  recoverBack.addEventListener('click', () => showScreen('welcome'));
  recoverSubmit.addEventListener('click', recoverIdentity);
  recoverKeyInput.addEventListener('keydown', e => { if (e.key === 'Enter') recoverIdentity(); });

  identityBack.addEventListener('click', () => showScreen('welcome'));

  saveIdentityButton.addEventListener('click', async () => {
    await createIdentity();
  });

  postForm.addEventListener('submit', async event => {
    event.preventDefault();
    const content = postInput.value.trim();
    if (!content || content.length > 280) return;
    const post = await submitPost(content);
    if (post) {
      state.feed.unshift(post);
      postInput.value = '';
      charCount.textContent = '0 / 280';
      renderFeed();
      updateAccountSummary();
    }
  });

  postInput.addEventListener('input', () => {
    charCount.textContent = `${postInput.value.length} / 280`;
  });

  revealPrivate.addEventListener('click', () => {
    accountPrivateId.textContent = state.privateId;
  });

  copyPrivate.addEventListener('click', () => {
    navigator.clipboard.writeText(state.privateId).then(() => {
      copyPrivate.textContent = 'Copied!';
      setTimeout(() => { copyPrivate.textContent = 'Copy Key'; }, 2000);
    });
  });

  resetIdentity.addEventListener('click', () => {
    if (confirm('Reset identity? This will log you out. Your key still works to recover access.')) {
      localStorage.removeItem('ghosttunnIdentity');
      window.location.reload();
    }
  });

  navItems.forEach(item => item.addEventListener('click', () => {
    showView(item.dataset.target);
    if (item.dataset.target === 'chatsView') loadChats();
    if (item.dataset.target === 'terminalView') terminalInput.focus();
    if (item.dataset.target === 'vaultView') loadVault();
    if (item.dataset.target === 'marketView') loadMarket();
  }));

  globalSearch.addEventListener('input', () => {
    const query = globalSearch.value.toLowerCase();
    if (!query) { renderFeed(); return; }
    const filtered = state.feed.filter(post =>
      post.content.toLowerCase().includes(query) || post.author.toLowerCase().includes(query)
    );
    feedList.innerHTML = '';
    filtered.forEach(post => {
      const item = document.createElement('article');
      item.className = 'feed-item';
      item.innerHTML = `
        <header>
          <div class="profile">
            <span class="profile-avatar">${post.avatar}</span>
            <div class="profile-label"><strong>${post.author}</strong><small>${post.alias}</small></div>
          </div>
          <span class="timestamp">${post.time}</span>
        </header>
        <p>${post.content}</p>
        <div class="action-row">
          <span class="action-pill">🤍 ${post.likes}</span>
          <span class="action-pill">💬 Comment</span>
          <span class="action-pill">🔄 Repost</span>
        </div>
      `;
      feedList.appendChild(item);
    });
  });

  terminalInput.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const cmd = terminalInput.value.trim();
      terminalInput.value = '';
      await runTerminalCommand(cmd);
    }
  });

  chatBackBtn.addEventListener('click', closeChatRoom);

  chatSendBtn.addEventListener('click', sendChatMessage);

  chatRoomInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  chatRoomInput.addEventListener('input', () => {
    chatRoomInput.style.height = 'auto';
    chatRoomInput.style.height = Math.min(chatRoomInput.scrollHeight, 120) + 'px';
    clearTimeout(state.typingSendTimer);
    state.typingSendTimer = setTimeout(sendTypingEvent, 300);
  });

  newChatBtn.addEventListener('click', startNewChat);
  newChatInput.addEventListener('keydown', e => { if (e.key === 'Enter') startNewChat(); });
}

async function initializeApp(identity) {
  state.publicId = identity.publicId;
  state.privateId = identity.privateId;
  state.alias = identity.alias;
  state.avatar = identity.avatar;
  state.selectedAvatar = { symbol: identity.avatar.split(' ')[0], name: identity.avatar.split(' ').slice(1).join(' ') };
  accountPublicId.textContent = state.publicId;
  accountPrivateId.textContent = 'Private ID hidden — tap Reveal';
  accountAvatar.textContent = identity.avatar.split(' ')[0];
  accountJoined.textContent = new Date(identity.joinedAt).toLocaleDateString();
  showScreen('app');
  showView('homeView');
  connectWebSocket();
  await loadUserProfile();
  await loadFeed();
  await loadNotifications();
  await loadChats();
  renderConnections();
}

// ── Vault ──────────────────────────────────────────────────────────────────

async function loadVault() {
  if (!state.publicId) return;
  try {
    const files = await apiFetch(`/api/vault/${encodeURIComponent(state.publicId)}`);
    state.vault = Array.isArray(files) ? files : [];
    renderVault();
  } catch (err) {
    console.warn('Vault load failed:', err.message);
    renderVault();
  }
}

function renderVault() {
  const list = document.getElementById('vaultFileList');
  if (!list) return;
  list.innerHTML = '';
  if (!state.vault.length) {
    list.innerHTML = '<p class="empty-state">No files yet. Upload your first file above.</p>';
    return;
  }
  state.vault.forEach(f => {
    const card = document.createElement('div');
    card.className = 'vault-file-card';
    const icon = fileIcon(f.mime_type, f.original_name);
    const size = formatBytes(f.size);
    const date = f.created_at ? new Date(f.created_at).toLocaleDateString() : '';
    card.innerHTML = `
      <div class="vault-file-icon">${icon}</div>
      <div class="vault-file-info">
        <strong class="vault-file-name">${escapeHtml(f.original_name)}</strong>
        <span class="vault-file-meta">${size} · ${f.mime_type.split('/')[0]} · ${date}</span>
      </div>
      <div class="vault-file-actions">
        <a class="vault-file-btn" href="${f.url}" download="${encodeURIComponent(f.original_name)}" target="_blank">⬇</a>
        <button class="vault-file-btn vault-file-btn--delete" data-id="${f.id}">🗑</button>
      </div>
    `;
    card.querySelector('.vault-file-btn--delete').addEventListener('click', () => deleteVaultFile(f.id));
    list.appendChild(card);
  });
}

function fileIcon(mime, name) {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('audio/')) return '🎵';
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('gzip')) return '📦';
  const ext = (name || '').split('.').pop().toLowerCase();
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  return '📁';
}

function formatBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadVaultFiles(files) {
  if (!files || !files.length) return;
  const bar = document.getElementById('vaultUploadBar');
  const fill = document.getElementById('vaultUploadFill');
  if (bar) bar.classList.remove('hidden');
  let done = 0;
  for (const file of Array.from(files)) {
    const form = new FormData();
    form.append('file', file);
    try {
      const resp = await fetch(`/api/vault/upload?public_id=${encodeURIComponent(state.publicId)}`, {
        method: 'POST',
        body: form,
        credentials: 'same-origin',
      });
      if (!resp.ok) throw new Error(await resp.text());
      const saved = await resp.json();
      state.vault.unshift(saved);
    } catch (err) {
      console.warn('Upload failed:', err.message);
      alert(`Upload failed for "${file.name}": ${err.message}`);
    }
    done++;
    if (fill) fill.style.width = `${Math.round((done / files.length) * 100)}%`;
  }
  renderVault();
  setTimeout(() => {
    if (bar) bar.classList.add('hidden');
    if (fill) fill.style.width = '0%';
  }, 800);
}

async function deleteVaultFile(fileId) {
  if (!confirm('Delete this file? This cannot be undone.')) return;
  try {
    await fetch(`/api/vault/${fileId}?public_id=${encodeURIComponent(state.publicId)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    state.vault = state.vault.filter(f => f.id !== fileId);
    renderVault();
  } catch (err) {
    console.warn('Delete failed:', err.message);
  }
}

// ── Market ─────────────────────────────────────────────────────────────────

async function loadMarket() {
  if (!state.publicId) return;
  try {
    const [all, mine] = await Promise.all([
      apiFetch('/api/market'),
      apiFetch(`/api/market/mine/${encodeURIComponent(state.publicId)}`),
    ]);
    state.market = Array.isArray(all) ? all : [];
    state.myStore = mine || null;
    renderMyStorePanel();
    renderMarket();
  } catch (err) {
    console.warn('Market load failed:', err.message);
    renderMyStorePanel();
    renderMarket();
  }
}

function renderMyStorePanel() {
  const panel = document.getElementById('myStorePanel');
  if (!panel) return;
  if (!state.myStore) {
    panel.innerHTML = `
      <div class="market-create-card">
        <h3>Open Your Store</h3>
        <p style="color:var(--muted);font-size:0.9rem;margin:0 0 1rem">Advertise your products — buyers contact you directly on WhatsApp or Facebook.</p>
        <label class="vault-upload-zone vault-upload-zone--sm" id="storeLogoZone" for="storeLogoInput">
          <div class="vault-upload-icon" style="font-size:1.6rem">🖼️</div>
          <div class="vault-upload-text" style="font-size:0.85rem">Add store logo (optional)</div>
          <input type="file" id="storeLogoInput" accept="image/*" hidden />
        </label>
        <img id="storeLogoPreview" class="market-img-preview hidden" alt="logo preview" />
        <input type="text" id="storeNameInput" class="market-input" placeholder="Store name *" maxlength="64" />
        <textarea id="storeDescInput" class="market-textarea" placeholder="Describe your store (optional)" rows="2"></textarea>
        <input type="text" id="storeWaInput" class="market-input" placeholder="WhatsApp link (https://wa.me/...)" />
        <input type="text" id="storeFbInput" class="market-input" placeholder="Facebook link (https://fb.com/...)" />
        <button class="btn btn-primary" id="createStoreBtn">Create Store</button>
      </div>
    `;
    let storeLogoUrl = '';
    const logoInput = document.getElementById('storeLogoInput');
    const logoPreview = document.getElementById('storeLogoPreview');
    if (logoInput) {
      logoInput.addEventListener('change', async () => {
        const file = logoInput.files[0];
        if (!file) return;
        const form = new FormData();
        form.append('file', file);
        try {
          const resp = await fetch('/api/market/upload', { method: 'POST', body: form, credentials: 'same-origin' });
          const data = await resp.json();
          storeLogoUrl = data.url;
          logoPreview.src = storeLogoUrl;
          logoPreview.classList.remove('hidden');
          document.getElementById('storeLogoZone').querySelector('.vault-upload-text').textContent = file.name;
        } catch (err) { console.warn('Logo upload failed:', err); }
      });
    }
    const createBtn = document.getElementById('createStoreBtn');
    if (createBtn) {
      createBtn.addEventListener('click', async () => {
        const name = (document.getElementById('storeNameInput').value || '').trim();
        if (!name) { alert('Please enter a store name.'); return; }
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';
        try {
          const store = await apiFetch('/api/market/stores', {
            method: 'POST',
            body: JSON.stringify({
              public_id: state.publicId,
              name,
              description: (document.getElementById('storeDescInput').value || '').trim(),
              logo_url: storeLogoUrl,
              whatsapp_link: (document.getElementById('storeWaInput').value || '').trim(),
              facebook_link: (document.getElementById('storeFbInput').value || '').trim(),
            }),
          });
          state.myStore = store;
          state.market.unshift(store);
          renderMyStorePanel();
          renderMarket();
        } catch (err) {
          alert('Could not create store: ' + err.message);
          createBtn.disabled = false;
          createBtn.textContent = 'Create Store';
        }
      });
    }
  } else {
    const s = state.myStore;
    const logoHtml = s.logo_url
      ? `<img src="${s.logo_url}" class="market-store-logo" alt="store logo" />`
      : `<div class="market-store-logo-placeholder">🛒</div>`;
    const linksHtml = [
      s.whatsapp_link ? `<a class="market-contact-btn market-contact-btn--wa" href="${s.whatsapp_link}" target="_blank" rel="noopener">💬 WhatsApp</a>` : '',
      s.facebook_link ? `<a class="market-contact-btn market-contact-btn--fb" href="${s.facebook_link}" target="_blank" rel="noopener">📘 Facebook</a>` : '',
    ].filter(Boolean).join('');
    const productsHtml = s.products && s.products.length
      ? s.products.map(p => renderProductCard(p)).join('')
      : '<p class="empty-state" style="padding:1rem">No products yet. Add your first product below.</p>';
    panel.innerHTML = `
      <div class="market-my-store-card">
        <div class="market-store-header">
          ${logoHtml}
          <div class="market-store-info">
            <h3>${escapeHtml(s.name)}</h3>
            ${s.description ? `<p>${escapeHtml(s.description)}</p>` : ''}
            <div class="market-contact-row">${linksHtml}</div>
          </div>
        </div>
        <div class="market-products-label">Your Products <button class="btn btn-primary market-add-product-btn" id="openAddProduct" style="font-size:0.8rem;padding:0.5rem 1rem">+ Add Product</button></div>
        <div class="market-products-grid">${productsHtml}</div>
      </div>
    `;
    const addBtn = document.getElementById('openAddProduct');
    if (addBtn) addBtn.addEventListener('click', openAddProductModal);
  }
}

function renderProductCard(p) {
  const imgHtml = p.image_url
    ? `<img src="${p.image_url}" class="market-product-img" alt="${escapeHtml(p.name)}" />`
    : `<div class="market-product-img market-product-img--placeholder">📦</div>`;
  return `
    <div class="market-product-card">
      ${imgHtml}
      <div class="market-product-body">
        <strong>${escapeHtml(p.name)}</strong>
        ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ''}
      </div>
    </div>
  `;
}

function renderMarket() {
  const grid = document.getElementById('marketStoreList');
  if (!grid) return;
  const others = state.market.filter(s => s.owner_public_id !== state.publicId);
  grid.innerHTML = '';
  if (!others.length) {
    grid.innerHTML = '<p class="empty-state">No other stores yet. Be the first to open one!</p>';
    return;
  }
  others.forEach(s => {
    const card = document.createElement('div');
    card.className = 'market-store-card';
    const logoHtml = s.logo_url
      ? `<img src="${s.logo_url}" class="market-store-logo" alt="logo" />`
      : `<div class="market-store-logo-placeholder">🛒</div>`;
    const linksHtml = [
      s.whatsapp_link ? `<a class="market-contact-btn market-contact-btn--wa" href="${s.whatsapp_link}" target="_blank" rel="noopener">💬 WhatsApp</a>` : '',
      s.facebook_link ? `<a class="market-contact-btn market-contact-btn--fb" href="${s.facebook_link}" target="_blank" rel="noopener">📘 Facebook</a>` : '',
    ].filter(Boolean).join('');
    const productsHtml = s.products && s.products.length
      ? s.products.map(p => renderProductCard(p)).join('')
      : '';
    card.innerHTML = `
      <div class="market-store-header">
        ${logoHtml}
        <div class="market-store-info">
          <h3>${escapeHtml(s.name)}</h3>
          <small style="color:var(--muted)">${s.owner_alias || s.owner_public_id}</small>
          ${s.description ? `<p>${escapeHtml(s.description)}</p>` : ''}
          <div class="market-contact-row">${linksHtml}</div>
        </div>
      </div>
      ${productsHtml ? `<div class="market-products-grid">${productsHtml}</div>` : ''}
    `;
    grid.appendChild(card);
  });
}

function openAddProductModal() {
  state.marketProductImageUrl = '';
  const modal = document.getElementById('addProductModal');
  if (!modal) return;
  document.getElementById('productNameInput').value = '';
  document.getElementById('productDescInput').value = '';
  document.getElementById('productImgPreview').classList.add('hidden');
  document.getElementById('productImgPreview').src = '';
  modal.classList.remove('hidden');
}

function bindMarketModal() {
  const modal = document.getElementById('addProductModal');
  const closeBtn = document.getElementById('addProductClose');
  const imgInput = document.getElementById('productImgInput');
  const saveBtn = document.getElementById('addProductSaveBtn');
  if (!modal) return;
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
  if (imgInput) {
    imgInput.addEventListener('change', async () => {
      const file = imgInput.files[0];
      if (!file) return;
      const form = new FormData();
      form.append('file', file);
      try {
        const resp = await fetch('/api/market/upload', { method: 'POST', body: form, credentials: 'same-origin' });
        const data = await resp.json();
        state.marketProductImageUrl = data.url;
        const preview = document.getElementById('productImgPreview');
        preview.src = data.url;
        preview.classList.remove('hidden');
        document.getElementById('productImgLabel').querySelector('.vault-upload-text').textContent = file.name;
      } catch (err) { console.warn('Product image upload failed:', err); }
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!state.myStore) return;
      const name = (document.getElementById('productNameInput').value || '').trim();
      if (!name) { alert('Product name is required.'); return; }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      try {
        const product = await apiFetch(`/api/market/stores/${state.myStore.id}/products`, {
          method: 'POST',
          body: JSON.stringify({
            name,
            description: (document.getElementById('productDescInput').value || '').trim(),
            image_url: state.marketProductImageUrl || '',
          }),
        });
        if (!state.myStore.products) state.myStore.products = [];
        state.myStore.products.push(product);
        state.market = state.market.map(s => s.id === state.myStore.id ? state.myStore : s);
        modal.classList.add('hidden');
        renderMyStorePanel();
        renderMarket();
      } catch (err) {
        alert('Could not add product: ' + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Add Product';
      }
    });
  }
}

function startApp() {
  loadAvatarOptions();
  generatePublicId();
  generatePrivateId();
  bindEvents();
  bindVaultEvents();
  bindMarketModal();

  const identity = loadIdentity();
  if (identity) {
    initializeApp(identity);
    return;
  }

  showScreen('splash');
  setTimeout(() => showScreen('welcome'), 2200);
}

function bindVaultEvents() {
  const fileInput = document.getElementById('vaultFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length) {
        uploadVaultFiles(fileInput.files);
        fileInput.value = '';
      }
    });
  }
}

startApp();
