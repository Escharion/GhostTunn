const screens = {
  splash: document.getElementById('splashScreen'),
  welcome: document.getElementById('welcomeScreen'),
  identity: document.getElementById('identityScreen'),
  app: document.getElementById('appShell'),
};

const publicIdValue = document.getElementById('publicIdValue');
const privateIdValue = document.getElementById('privateIdValue');
const avatarGrid = document.getElementById('avatarGrid');
const saveIdentityButton = document.getElementById('saveIdentity');
const welcomeContinue = document.getElementById('welcomeContinue');
const identityBack = document.getElementById('identityBack');
const postForm = document.getElementById('postForm');
const postInput = document.getElementById('postInput');
const charCount = document.getElementById('charCount');
const feedList = document.getElementById('feedList');
const chatList = document.getElementById('chatList');
const idConnections = document.getElementById('idConnections');
const notificationsList = document.getElementById('notificationsList');
const accountPublicId = document.getElementById('accountPublicId');
const accountPrivateId = document.getElementById('accountPrivateId');
const accountAvatar = document.getElementById('accountAvatar');
const accountJoined = document.getElementById('accountJoined');
const accountPosts = document.getElementById('accountPosts');
const accountConnections = document.getElementById('accountConnections');
const revealPrivate = document.getElementById('revealPrivate');
const resetIdentity = document.getElementById('resetIdentity');
const navItems = Array.from(document.querySelectorAll('.nav-item'));
const views = Array.from(document.querySelectorAll('.content-view'));
const globalSearch = document.getElementById('globalSearch');

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
  chats: [],
  ids: [],
  notifications: [],
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
  accountPosts.textContent = String(state.feed.filter(post => post.author === state.publicId).length || state.feed.length);
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
    const posts = await apiFetch('/api/feed');
    if (Array.isArray(posts)) {
      state.feed = posts.map(mapBackendPost);
      renderFeed();
      updateAccountSummary();
      return;
    }
  } catch (error) {
    console.warn('Feed API unavailable:', error.message);
  }
  if (!state.feed.length) {
    state.feed = [
      {
        id: 1,
        author: '@Ghost-Echo-502',
        avatar: '👻',
        alias: 'Echo',
        time: '10:32 PM',
        content: 'The future belongs to builders.',
      },
    ];
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
      avatar: state.avatar.split(' ')[0],
      alias: state.alias,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
    };
  }
}

function renderFeed() {
  feedList.innerHTML = '';
  state.feed.forEach(post => {
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
        <span class="action-pill">❤ Like</span>
        <span class="action-pill">💬 Comment</span>
        <span class="action-pill">🔄 Repost</span>
      </div>
    `;
    feedList.appendChild(item);
  });
}

function renderChats() {
  chatList.innerHTML = '';
  state.chats.forEach(chat => {
    const item = document.createElement('article');
    item.className = 'chat-card';
    item.innerHTML = `
      <header>
        <div class="profile">
          <span class="profile-avatar">${chat.avatar}</span>
          <div class="profile-label"><strong>${chat.publicId}</strong><small>${chat.lastMessage}</small></div>
        </div>
        <span class="timestamp">${chat.time}</span>
      </header>
    `;
    chatList.appendChild(item);
  });
}

function renderConnections() {
  idConnections.innerHTML = '';
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

function bindEvents() {
  welcomeContinue.addEventListener('click', () => {
    showScreen('identity');
  });

  identityBack.addEventListener('click', () => {
    showScreen('welcome');
  });

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
    const length = postInput.value.length;
    charCount.textContent = `${length} / 280`;
  });

  revealPrivate.addEventListener('click', () => {
    accountPrivateId.textContent = state.privateId;
  });

  resetIdentity.addEventListener('click', () => {
    localStorage.removeItem('ghosttunnIdentity');
    window.location.reload();
  });

  navItems.forEach(item => item.addEventListener('click', () => showView(item.dataset.target)));

  globalSearch.addEventListener('input', () => {
    const query = globalSearch.value.toLowerCase();
    if (!query) {
      renderFeed();
      return;
    }
    const filtered = state.feed.filter(post => post.content.toLowerCase().includes(query) || post.author.toLowerCase().includes(query));
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
          <span class="action-pill">❤ Like</span>
          <span class="action-pill">💬 Comment</span>
          <span class="action-pill">🔄 Repost</span>
        </div>
      `;
      feedList.appendChild(item);
    });
  });
}

async function initializeApp(identity) {
  state.publicId = identity.publicId;
  state.privateId = identity.privateId;
  state.alias = identity.alias;
  state.avatar = identity.avatar;
  state.selectedAvatar = { symbol: identity.avatar.split(' ')[0], name: identity.avatar.split(' ').slice(1).join(' ') };
  accountPublicId.textContent = state.publicId;
  accountPrivateId.textContent = 'Private ID hidden';
  accountAvatar.textContent = identity.avatar.split(' ')[0];
  accountJoined.textContent = new Date(identity.joinedAt).toLocaleDateString();
  showScreen('app');
  showView('homeView');
  await loadUserProfile();
  await loadFeed();
  await loadNotifications();
  renderChats();
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
