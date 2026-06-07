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
    chatList.innerHTML = '<p class="empty-state">No chats yet. Start one above.</p>';
    return;
  }
  state.chats.forEach(chat => {
    const otherId = chat.user_a_id === state.publicId ? chat.user_b_id : chat.user_b_id;
    const item = document.createElement('article');
    item.className = 'chat-card';
    item.innerHTML = `
      <header>
        <div class="profile">
          <span class="profile-avatar">👻</span>
          <div class="profile-label">
            <strong>Chat #${chat.chat_id}</strong>
            <small>Tap to open</small>
          </div>
        </div>
        <span class="timestamp">${new Date(chat.created_at).toLocaleDateString()}</span>
      </header>
    `;
    item.addEventListener('click', () => openChatRoom(chat.chat_id, null, null, '👻'));
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
    messages.forEach(msg => appendChatMessage(msg.sender_public_id, msg.content, msg.created_at));
  } catch (err) {
    console.warn('Could not load messages:', err.message);
  }
  scrollChatToBottom();
  chatRoomInput.focus();
}

function closeChatRoom() {
  chatRoomOverlay.classList.add('hidden');
  document.body.classList.remove('chat-open');
  state.activeChatId = null;
}

function appendChatMessage(senderPublicId, content, createdAt) {
  const isMine = senderPublicId === state.publicId;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${isMine ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`;
  const time = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  bubble.innerHTML = `<span class="bubble-text">${escapeHtml(content)}</span><span class="bubble-time">${time}</span>`;
  chatRoomMessages.appendChild(bubble);
}

function scrollChatToBottom() {
  chatRoomMessages.scrollTop = chatRoomMessages.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendChatMessage() {
  const content = chatRoomInput.value.trim();
  if (!content || !state.activeChatId) return;
  chatRoomInput.value = '';
  chatRoomInput.style.height = 'auto';

  const optimistic = { sender_public_id: state.publicId, content, created_at: new Date().toISOString() };
  appendChatMessage(optimistic.sender_public_id, optimistic.content, optimistic.created_at);
  scrollChatToBottom();

  if (state.ws && state.ws.readyState === WebSocket.OPEN && state.activeChatRecipientPublicId) {
    state.ws.send(JSON.stringify({
      type: 'message',
      chat_id: state.activeChatId,
      sender_public_id: state.publicId,
      recipient_public_id: state.activeChatRecipientPublicId,
      content,
    }));
  } else {
    try {
      await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: state.activeChatId,
          sender_public_id: state.publicId,
          recipient_public_id: state.activeChatRecipientPublicId || state.publicId,
          content,
        }),
      });
    } catch (err) {
      console.warn('Message send failed:', err.message);
    }
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

// ── WebSocket ──────────────────────────────────────────────────────────────

function connectWebSocket() {
  if (!state.publicId) return;
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${protocol}://${location.host}/ws/${encodeURIComponent(state.publicId)}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WS connected');
    state.ws = ws;
    if (state.wsReconnectTimer) {
      clearTimeout(state.wsReconnectTimer);
      state.wsReconnectTimer = null;
    }
    ws.send(JSON.stringify({ type: 'ping' }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        if (state.activeChatId === data.chat_id && data.sender_public_id !== state.publicId) {
          appendChatMessage(data.sender_public_id, data.content, data.created_at);
          scrollChatToBottom();
        }
      }
    } catch (e) {
      console.warn('WS parse error:', e);
    }
  };

  ws.onclose = () => {
    state.ws = null;
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

  try {
    const result = await apiFetch('/api/terminal', {
      method: 'POST',
      body: JSON.stringify({ command: cmd, public_id: state.publicId }),
    });

    if (result.clear) {
      terminalOutput.innerHTML = '';
    }

    if (result.output && result.output.length > 0) {
      await printTerminalLines(result.output, 28);
    }

    if (result.status === 'bld_active') {
      terminalInput.placeholder = '@ghost send <id> <message>';
    } else if (result.status === 'bld_exit') {
      terminalInput.placeholder = 'ghost help';
    }
  } catch (err) {
    appendTerminalLine(`  Error: ${err.message}`, 'terminal-line--error');
  } finally {
    terminalInput.disabled = false;
    terminalInput.focus();
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
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

function startApp() {
  loadAvatarOptions();
  generatePublicId();
  generatePrivateId();
  bindEvents();

  const identity = loadIdentity();
  if (identity) {
    initializeApp(identity);
    return;
  }

  showScreen('splash');
  setTimeout(() => showScreen('welcome'), 2200);
}

startApp();
