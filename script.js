const menuToggle = document.getElementById('menuToggle');
const siteNav = document.getElementById('siteNav');
const demoGhostId = document.getElementById('demoGhostId');
const ghostIdValue = document.getElementById('ghostIdValue');
const contactForm = document.getElementById('contactForm');
const loginOverlay = document.getElementById('loginOverlay');
const identityKeyValue = document.getElementById('identityKeyValue');
const continueButton = document.getElementById('continueButton');
const copyIdentity = document.getElementById('copyIdentity');
const appShell = document.getElementById('appShell');
const manualIdentityInput = document.getElementById('manualIdentityInput');
const useExistingIdentityButton = document.getElementById('useExistingIdentity');
const accountPublicKey = document.getElementById('accountPublicKey');
const addFriendButton = document.getElementById('addFriendButton');
const chatListElement = document.getElementById('chatList');
const chatTabs = document.querySelectorAll('.chat-tab');
const chatView = document.getElementById('chatView');
const ghosttimeView = document.getElementById('ghosttimeView');
const accountView = document.getElementById('accountView');
const chatDetailPanel = document.getElementById('chatDetailPanel');
const messageInputArea = document.getElementById('messageInputArea');
const searchActionRow = document.querySelector('.search-action-row');
const appTopbar = document.querySelector('.app-topbar');
const backToChatListButton = document.getElementById('backToChatListButton');
const chatDetailTitle = document.getElementById('chatDetailTitle');
const chatDetailSubtitle = document.getElementById('chatDetailSubtitle');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const appSidebar = document.querySelector('.app-sidebar');
const sidebarIcons = document.querySelectorAll('.sidebar-icon');
const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
const gtPostText = document.getElementById('gtPostText');
const gtPostList = document.getElementById('gtPostList');
const publishGtPostButton = document.getElementById('publishGtPost');
const terminalView = document.getElementById('terminalView');
const terminalOutput = document.getElementById('terminalOutput');
const terminalInput = document.getElementById('terminalInput');
const terminalClear = document.getElementById('terminalClear');
const copySecurityIdentity = document.getElementById('copySecurityIdentity');
const securityIdentityKey = document.getElementById('securityIdentityKey');

// Profile drawer elements
const sidebarProfileBtn = document.getElementById('sidebarProfileBtn');
const topbarProfileBtn = document.getElementById('topbarProfileBtn');
const mobileProfileBtn = document.getElementById('mobileProfileBtn');
const profileDrawer = document.getElementById('profileDrawer');
const profileDrawerOverlay = document.getElementById('profileDrawerOverlay');
const profileDrawerClose = document.getElementById('profileDrawerClose');
const profileDisplayAlias = document.getElementById('profileDisplayAlias');
const profilePublicKeyDisplay = document.getElementById('profilePublicKeyDisplay');
const profileIdentityDisplay = document.getElementById('profileIdentityDisplay');
const profileKeyToggle = document.getElementById('profileKeyToggle');
const profileKeyCopy = document.getElementById('profileKeyCopy');
const profileLogoutBtn = document.getElementById('profileLogoutBtn');

// All avatar elements
const sidebarAvatar = document.getElementById('sidebarAvatar');
const sidebarAvatarInitials = document.getElementById('sidebarAvatarInitials');
const sidebarPhoto = document.getElementById('sidebarPhoto');
const topbarAvatar = document.getElementById('topbarAvatar');
const topbarAvatarInitials = document.getElementById('topbarAvatarInitials');
const topbarPhoto = document.getElementById('topbarPhoto');
const mobileNavAvatar = document.getElementById('mobileNavAvatar');
const mobileNavAvatarInitials = document.getElementById('mobileNavAvatarInitials');
const mobileNavPhoto = document.getElementById('mobileNavPhoto');
const profileDrawerAvatar = document.getElementById('profileDrawerAvatar');
const profileDrawerAvatarInitials = document.getElementById('profileDrawerAvatarInitials');
const profileDrawerPhoto = document.getElementById('profileDrawerPhoto');

// Upload controls
const avatarUploadBtn = document.getElementById('avatarUploadBtn');
const avatarRemoveBtn = document.getElementById('avatarRemoveBtn');
const avatarFileInput = document.getElementById('avatarFileInput');
const avatarUploadHint = document.getElementById('avatarUploadHint');

let profileKeyRevealed = false;

const AVATAR_PHOTO_KEY = 'ghostAvatarPhoto';

let activeFilter = 'all';
let activeChatId = null;
let chatSearchQuery = '';

const chatData = [
  {
    id: 'chat-1',
    name: 'Cipher Nexus',
    publicKey: '#ghost-ciphernexus-1042-E',
    lastMessage: 'Ready for GhostTime?',
    time: '2m',
    unread: 3,
    category: 'chat',
    messages: [
      { sender: 'friend', text: 'Ready for GhostTime?', time: '2m ago' }
    ]
  },
  {
    id: 'chat-2',
    name: 'Shadow Echo',
    publicKey: '#ghost-shadowecho-1945-E',
    lastMessage: 'Can we verify identity?',
    time: '10m',
    unread: 1,
    category: 'request',
    messages: [
      { sender: 'friend', text: 'Can we verify identity?', time: '10m ago' }
    ]
  },
  {
    id: 'chat-3',
    name: 'Phantom Drift',
    publicKey: '#ghost-phantomdrift-2054-E',
    lastMessage: 'Your key looks good.',
    time: '1h',
    unread: 0,
    category: 'chat',
    messages: [
      { sender: 'friend', text: 'Your key looks good.', time: '1h ago' }
    ]
  }
];

const gtPosts = [
  {
    id: 'post-1',
    publisher: 'Cipher Nexus',
    publisherId: 'publisher-1',
    content: 'GhostTime is where text-only status updates live. No images, no voice, just secure writing.',
    time: '12m ago',
    views: 128,
    likes: 24
  },
  {
    id: 'post-2',
    publisher: 'System',
    publisherId: 'publisher-2',
    content: 'Your Ghost identity is the only thing you share. Keep it private, keep it strong.',
    time: '1h ago',
    views: 96,
    likes: 34
  }
];

const gtComments = {
  'post-1': [
    { author: 'Echo', text: 'This is exactly the vibe I needed today.', time: '2m ago' },
    { author: 'NightPulse', text: 'Love the edgy minimalism.', time: '10m ago' }
  ],
  'post-2': [
    { author: 'Phantom', text: 'Keeping keys private is everything.', time: '5m ago' }
  ]
};

const DEVICE_STORAGE_KEY = 'ghostDeviceId';
const PUBLIC_STORAGE_KEY = 'ghostPublicKey';
const PRIVATE_STORAGE_KEY = 'ghostPrivateKey';
const IDENTITY_STORAGE_KEY = 'ghostIdentityKey';

// ─── Notification data ────────────────────────────────────────
const notifications = [
  { id: 'n1', icon: '🔐', text: 'Your identity key was used to start a new session.', time: '2m ago', unread: true, section: 'security' },
  { id: 'n2', icon: '💬', text: 'Cipher Nexus sent you a new message.', time: '8m ago', unread: true, section: null },
  { id: 'n3', icon: '📝', text: 'New post on GhostTime from Shadow Echo.', time: '20m ago', unread: true, section: null },
  { id: 'n4', icon: '🛡️', text: 'Ghost mode is active — your location is hidden.', time: '1h ago', unread: false, section: 'security' },
  { id: 'n5', icon: '⚡', text: 'GhostTunn relay connected successfully.', time: '2h ago', unread: false, section: 'architecture' },
];

// ─── Notification DOM refs ────────────────────────────────────
const notifBell = document.getElementById('notifBell');
const notifBadge = document.getElementById('notifBadge');
const notifDropdown = document.getElementById('notifDropdown');
const notifList = document.getElementById('notifList');
const notifClearAll = document.getElementById('notifClearAll');
let notifOpen = false;

menuToggle?.addEventListener('click', () => {
  siteNav?.classList.toggle('active');
});

function randomCodeName() {
  const prefixes = ['spirit', 'nova', 'shadow', 'oracle', 'phantom', 'vector', 'spectre', 'cipher', 'echo', 'pulse'];
  const suffixes = ['blade', 'drift', 'flux', 'pulse', 'spark', 'vortex', 'rune', 'wave', 'flare', 'shade'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}${suffix}`;
}

function generatePublicKey() {
  const codeName = randomCodeName();
  const digits = String(Math.floor(Math.random() * 9000) + 1000);
  return `#ghost-${codeName}-${digits}-E`;
}

function generatePrivateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '@Ghost-';
  for (let i = 0; i < 7; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

function generateIdentityKey(publicKey, privateKey) {
  const rawPrivate = privateKey.replace(/^@Ghost-/, '');
  return `${publicKey} ${rawPrivate}`;
}

function generateDeviceId() {
  if (window.crypto && typeof crypto.randomUUID === 'function') {
    return `device-${crypto.randomUUID()}`;
  }
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'device-';
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function parseManualIdentity(value) {
  const trimmed = value.trim();
  const publicMatch = trimmed.match(/#ghost-[A-Za-z0-9]+-[0-9]{4}-E/);
  if (!publicMatch) return null;

  const remainder = trimmed.slice(publicMatch.index + publicMatch[0].length).trim();
  const privateMatch = remainder.match(/@Ghost-[A-Za-z0-9]{7}/);
  if (privateMatch) {
    return { publicKey: publicMatch[0], privateKey: privateMatch[0] };
  }
  const rawMatch = remainder.match(/[A-Za-z0-9]{7}/);
  if (rawMatch) {
    return { publicKey: publicMatch[0], privateKey: `@Ghost-${rawMatch[0]}` };
  }
  return null;
}

function updateLoginKeys() {
  const publicKey = generatePublicKey();
  const privateKey = generatePrivateKey();
  const identityKey = generateIdentityKey(publicKey, privateKey);

  if (identityKeyValue) identityKeyValue.textContent = identityKey;
  if (ghostIdValue) ghostIdValue.textContent = `Ghost ID: ${publicKey}`;

  // Store in data attributes for use by continueButton
  if (identityKeyValue) {
    identityKeyValue.dataset.publicKey = publicKey;
    identityKeyValue.dataset.privateKey = privateKey;
  }

  // Update security section identity key
  if (securityIdentityKey) securityIdentityKey.textContent = identityKey;

  return { publicKey, privateKey, identityKey };
}

function generateAvatarColor(publicKey) {
  const hash = Array.from(publicKey).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const secondary = (hue + 50) % 360;
  const tertiary = (hue + 110) % 360;
  return `radial-gradient(circle at 20% 20%, hsl(${hue}, 85%, 60%), hsl(${secondary}, 75%, 50%) 55%, hsl(${tertiary}, 65%, 40%))`;
}

function extractAliasFromKey(publicKey) {
  // e.g. #ghost-ciphernexus-1042-E → "Ciphernexus"
  const match = publicKey.match(/#ghost-([a-z]+)-\d{4}-E/i);
  if (!match) return 'Ghost';
  const raw = match[1];
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getAvatarInitials(publicKey) {
  const alias = extractAliasFromKey(publicKey);
  // Take first two chars of alias as initials
  return alias.slice(0, 2).toUpperCase();
}

function applyPhotoToAllAvatars(dataUrl) {
  const photoEls = [sidebarPhoto, topbarPhoto, mobileNavPhoto, profileDrawerPhoto];
  const initialsEls = [sidebarAvatarInitials, topbarAvatarInitials, mobileNavAvatarInitials, profileDrawerAvatarInitials];

  photoEls.forEach((img) => {
    if (!img) return;
    img.src = dataUrl;
    img.classList.remove('hidden');
  });
  initialsEls.forEach((el) => { if (el) el.classList.add('hidden'); });

  // Show remove button, hide hint
  if (avatarRemoveBtn) avatarRemoveBtn.classList.remove('hidden');
  if (avatarUploadHint) avatarUploadHint.textContent = 'Tap 📷 to change · ✕ to remove';
}

function clearPhotoFromAllAvatars() {
  const photoEls = [sidebarPhoto, topbarPhoto, mobileNavPhoto, profileDrawerPhoto];
  const initialsEls = [sidebarAvatarInitials, topbarAvatarInitials, mobileNavAvatarInitials, profileDrawerAvatarInitials];

  photoEls.forEach((img) => {
    if (!img) return;
    img.src = '';
    img.classList.add('hidden');
  });
  initialsEls.forEach((el) => { if (el) el.classList.remove('hidden'); });

  if (avatarRemoveBtn) avatarRemoveBtn.classList.add('hidden');
  if (avatarUploadHint) avatarUploadHint.textContent = 'Tap 📷 to set a photo';
}

function applyAvatar(publicKey) {
  const gradient = generateAvatarColor(publicKey);
  const initials = getAvatarInitials(publicKey);
  const alias = extractAliasFromKey(publicKey);

  // Apply gradient + initials to all circles
  const circles = [sidebarAvatar, topbarAvatar, mobileNavAvatar, profileDrawerAvatar];
  const initialsEls = [sidebarAvatarInitials, topbarAvatarInitials, mobileNavAvatarInitials, profileDrawerAvatarInitials];

  circles.forEach((el) => { if (el) el.style.background = gradient; });
  initialsEls.forEach((el) => {
    if (el) {
      el.textContent = initials;
      el.classList.remove('hidden');
    }
  });

  // If a saved photo exists, layer it on top of the gradient
  const savedPhoto = localStorage.getItem(AVATAR_PHOTO_KEY);
  if (savedPhoto) {
    applyPhotoToAllAvatars(savedPhoto);
  } else {
    clearPhotoFromAllAvatars();
  }

  // Update profile drawer info
  if (profileDisplayAlias) profileDisplayAlias.textContent = alias;
  if (profilePublicKeyDisplay) profilePublicKeyDisplay.textContent = publicKey;

  // Keep identity key masked by default
  profileKeyRevealed = false;
  if (profileIdentityDisplay) profileIdentityDisplay.textContent = '••••••••••••••••••••';
  if (profileIdentityDisplay) profileIdentityDisplay.classList.remove('revealed');
}

function resizeAndStorePhoto(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Resize to max 256×256 to keep localStorage size small
      const MAX = 256;
      const canvas = document.createElement('canvas');
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      localStorage.setItem(AVATAR_PHOTO_KEY, dataUrl);
      applyPhotoToAllAvatars(dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveIdentityToStorage(publicKey, privateKey, identityKey) {
  const existingDeviceId = localStorage.getItem(DEVICE_STORAGE_KEY) || generateDeviceId();
  localStorage.setItem(DEVICE_STORAGE_KEY, existingDeviceId);
  localStorage.setItem(PUBLIC_STORAGE_KEY, publicKey);
  localStorage.setItem(PRIVATE_STORAGE_KEY, privateKey);
  localStorage.setItem(IDENTITY_STORAGE_KEY, identityKey);
}

function loadAppWithKeys(publicKey, privateKey) {
  const identityKey = generateIdentityKey(publicKey, privateKey);
  if (accountPublicKey) accountPublicKey.textContent = publicKey;
  if (ghostIdValue) ghostIdValue.textContent = `Ghost ID: ${publicKey}`;
  if (identityKeyValue) identityKeyValue.textContent = identityKey;
  if (securityIdentityKey) securityIdentityKey.textContent = identityKey;
  applyAvatar(publicKey);
}

function showAppScreen() {
  document.querySelectorAll('main > section').forEach((section) => {
    if (section.id === 'appShell') {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });
  if (appShell) appShell.classList.remove('hidden');
  if (loginOverlay) {
    loginOverlay.classList.remove('active');
    loginOverlay.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('no-scroll');
  switchAppView('chat');
  renderChatList();
}

function getChatList() {
  return chatData.filter((chat) => {
    if (activeFilter === 'unread' && chat.unread <= 0) return false;
    if (activeFilter === 'requests' && chat.category !== 'request') return false;
    const query = chatSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return [chat.name, chat.publicKey, chat.lastMessage].some((value) =>
      value.toLowerCase().includes(query)
    );
  });
}

function openChatDetail(chatId) {
  activeChatId = chatId;
  renderChatDetail();

  if (messageInputArea) {
    messageInputArea.classList.remove('hidden');
    messageInputArea.classList.remove('compact');
    messageInputArea.removeAttribute('data-mode');
  }

  if (window.innerWidth < 980) {
    chatDetailPanel?.classList.add('show');
    chatListElement?.classList.add('hidden');
  } else {
    chatDetailPanel?.classList.remove('hidden');
  }
}

function closeChatDetail() {
  if (window.innerWidth < 980) {
    chatDetailPanel?.classList.remove('show');
    chatListElement?.classList.remove('hidden');
  } else {
    chatDetailPanel?.classList.add('hidden');
  }
}

function renderChatList() {
  if (!chatListElement) return;
  const filteredChats = getChatList();
  if (filteredChats.length === 0) {
    chatListElement.innerHTML = '<div class="chat-empty">No chats or requests match your search.</div>';
    return;
  }

  chatListElement.innerHTML = filteredChats
    .map((chat) => {
      const activeClass = chat.id === activeChatId ? ' active' : '';
      const avatarColor = generateAvatarColor(chat.publicKey);
      const badge = chat.unread > 0 ? `<span class="chat-item-badge">${chat.unread}</span>` : '';
      const avatarText = chat.name.slice(0, 2).toUpperCase();
      return `
        <button class="chat-item${activeClass}" data-chat-id="${chat.id}">
          <div class="chat-avatar" style="background: ${avatarColor}">${avatarText}</div>
          <div class="chat-item-content">
            <div class="chat-item-header">
              <h4>${chat.name}</h4>
              <span class="chat-item-time">${chat.time}</span>
            </div>
            <p class="chat-item-message">${chat.lastMessage}</p>
          </div>
          ${badge}
        </button>
      `;
    })
    .join('');

  chatListElement.querySelectorAll('.chat-item').forEach((item) => {
    item.addEventListener('click', () => {
      openChatDetail(item.dataset.chatId);
    });
  });

  if (!activeChatId && filteredChats.length > 0) {
    activeChatId = filteredChats[0].id;
    renderChatDetail();
  }
}

function renderChatDetail() {
  if (!chatDetailTitle || !chatDetailSubtitle || !messagesContainer) return;
  const chat = chatData.find((item) => item.id === activeChatId);
  if (!chat) {
    chatDetailTitle.textContent = 'Select a conversation';
    chatDetailSubtitle.textContent = 'Messages, requests, and friend chats appear here.';
    messagesContainer.innerHTML = '<div class="chat-empty">Choose a chat from the left or add a friend to start.</div>';
    return;
  }

  chatDetailTitle.textContent = chat.name;
  chatDetailSubtitle.textContent = chat.publicKey;
  chat.unread = 0;

  messagesContainer.innerHTML = chat.messages
    .map((message) => {
      const direction = message.sender === 'me' ? 'outgoing' : 'incoming';
      return `
        <div class="message-row">
          <div class="message-bubble ${direction}">
            ${message.text}
            <div class="message-footer">${message.time}</div>
          </div>
        </div>
      `;
    })
    .join('');

  renderChatList();
}

function switchAppView(view) {
  if (chatView) chatView.classList.toggle('hidden', view !== 'chat');
  if (ghosttimeView) ghosttimeView.classList.toggle('hidden', view !== 'ghosttime');
  if (terminalView) terminalView.classList.toggle('hidden', view !== 'terminal');
  if (accountView) accountView.classList.toggle('hidden', view !== 'account');

  sidebarIcons.forEach((icon) => {
    icon.classList.toggle('active', icon.dataset.view === view);
  });

  mobileNavBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  if (view === 'ghosttime') {
    renderGtPosts();
    // Close any open detail panel so we see the feed
    if (chatDetailPanel) chatDetailPanel.classList.add('hidden');
    chatDetailPanel?.classList.remove('show');
  }

  if (searchActionRow) searchActionRow.classList.toggle('hidden', view !== 'chat');
  if (addFriendButton) addFriendButton.classList.toggle('hidden', view !== 'chat');
  if (appTopbar) appTopbar.classList.toggle('hidden', view !== 'chat');

  if (view === 'terminal' && terminalInput) {
    terminalInput.focus();
  }

  // Hide the message input when switching views
  if (messageInputArea) messageInputArea.classList.add('hidden');
}

function renderGtPosts() {
  if (!gtPostList) return;
  gtPostList.innerHTML = gtPosts
    .map((post) => `
      <div class="gt-post-card" data-post-id="${post.id}" data-publisher-id="${post.publisherId}">
        <div class="gt-post-header">
          <strong>${post.publisher}</strong>
          <span class="message-footer">${post.time}</span>
        </div>
        <p>${post.content}</p>
        <div class="gt-post-actions">
          <button class="btn btn-secondary view-post-button" data-post-id="${post.id}">View</button>
        </div>
      </div>
    `).join('');

  gtPostList.querySelectorAll('.view-post-button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openGtPostDetail(btn.dataset.postId);
    });
  });
  gtPostList.querySelectorAll('.gt-post-card').forEach((card) => {
    card.addEventListener('click', () => {
      openGtPostDetail(card.dataset.postId);
    });
  });
}

function renderComments(postId) {
  const comments = gtComments[postId] || [];
  const container = document.getElementById(`gtComments-${postId}`);
  if (!container) return;
  container.innerHTML = comments.map(c => `
    <div class="gt-comment">
      <div class="gt-comment-author">${c.author}</div>
      <div class="gt-comment-text">${c.text}</div>
      <div class="gt-comment-time">${c.time}</div>
    </div>
  `).join('');
}

function openGtPostDetail(postId) {
  const post = gtPosts.find(p => p.id === postId);
  if (!post) return;

  post.views = (post.views || 0) + 1;

  if (chatDetailTitle) chatDetailTitle.textContent = post.publisher;
  if (chatDetailSubtitle) chatDetailSubtitle.textContent = 'GhostTime';

  const publisherPosts = gtPosts.filter(p => p.publisherId === post.publisherId && p.id !== post.id);

  if (messagesContainer) {
    messagesContainer.innerHTML = `
      <div class="gt-detail-main">
        <div class="gt-post-card gt-post-detail-card">
          <div class="gt-post-header"><strong>${post.publisher}</strong> <span class="message-footer">${post.time}</span></div>
          <p>${post.content}</p>
          <div class="gt-post-stats">
            <button class="btn btn-secondary gt-stat-button" data-action="views">👁 ${post.views}</button>
            <button class="btn btn-secondary gt-stat-button" data-action="comments">💬 ${(gtComments[post.id] || []).length}</button>
            <button class="btn btn-secondary gt-stat-button gt-like-button" data-action="likes">❤️ ${post.likes}</button>
          </div>
          <div class="gt-comments-dropdown hidden" id="gtCommentsDropdown-${post.id}">
            <div class="gt-comments" id="gtComments-${post.id}"></div>
            <div class="gt-add-comment-box">
              <input type="text" class="gt-comment-input" data-post-id="${post.id}" placeholder="Add a comment..." />
              <button class="btn btn-primary gt-comment-send" data-post-id="${post.id}">Send</button>
            </div>
          </div>
        </div>
        <h3>More from ${post.publisher}</h3>
        <div class="publisher-posts">
          ${publisherPosts.map(p => `<div class="gt-post-card small" data-post-id="${p.id}"><p>${p.content}</p><div class="message-footer">${p.time}</div></div>`).join('')}
        </div>
      </div>
    `;

    if (chatDetailPanel) chatDetailPanel.classList.remove('hidden');
    if (window.innerWidth < 980) chatDetailPanel?.classList.add('show');

    // Never show the outer message input area on GhostTime posts — comments are inline
    if (messageInputArea) messageInputArea.classList.add('hidden');

    renderComments(post.id);

    const buttons = messagesContainer.querySelectorAll('.gt-stat-button');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'likes') {
          post.likes += 1;
          button.innerHTML = `❤️ ${post.likes}`;
        }
        if (action === 'comments') {
          const dropdown = document.getElementById(`gtCommentsDropdown-${postId}`);
          if (dropdown) dropdown.classList.toggle('hidden');
        }
      });
    });

    const commentSendBtn = messagesContainer.querySelector(`.gt-comment-send[data-post-id="${postId}"]`);
    const commentInput = messagesContainer.querySelector(`.gt-comment-input[data-post-id="${postId}"]`);
    if (commentSendBtn && commentInput) {
      const sendComment = () => {
        const text = commentInput.value.trim();
        if (!text) return;
        gtComments[postId] = gtComments[postId] || [];
        gtComments[postId].push({ author: 'You', text, time: 'Just now' });
        commentInput.value = '';
        renderComments(postId);
        const commentsBtn = messagesContainer.querySelector(`.gt-stat-button[data-action="comments"]`);
        if (commentsBtn) commentsBtn.innerHTML = `💬 ${(gtComments[postId] || []).length}`;
      };
      commentSendBtn.addEventListener('click', sendComment);
      commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); }
      });
    }

    const smalls = messagesContainer.querySelectorAll('.publisher-posts .gt-post-card.small');
    smalls.forEach(s => s.addEventListener('click', () => openGtPostDetail(s.dataset.postId)));
  }
}

function handlePublishGtPost() {
  if (!gtPostText) return;
  const content = gtPostText.value.trim();
  if (!content) return;
  const storedPublicKey = localStorage.getItem(PUBLIC_STORAGE_KEY) || '';
  const alias = storedPublicKey ? storedPublicKey.replace(/#ghost-/, '').split('-')[0] : 'You';
  gtPosts.unshift({
    id: `post-${Date.now()}`,
    publisher: alias || 'You',
    publisherId: 'publisher-me',
    content,
    time: 'Just now',
    views: 0,
    likes: 0
  });
  gtPostText.value = '';
  renderGtPosts();
}

function handleSearchInput(event) {
  chatSearchQuery = event.target.value || '';
  renderChatList();
}

function handleAddFriend() {
  const input = prompt('Add a friend by public key or name:');
  if (!input) return;
  const publicKey = input.trim().startsWith('#ghost-') ? input.trim() : `#ghost-${input.replace(/\s+/g, '').toLowerCase()}-0000-E`;
  const newChat = {
    id: `chat-${Date.now()}`,
    name: input.trim().split(' ')[0] || 'New Friend',
    publicKey,
    lastMessage: 'Friend request sent.',
    time: 'Now',
    unread: 0,
    category: 'request',
    messages: [{ sender: 'friend', text: 'Please accept my chat request.', time: 'Now' }]
  };
  chatData.unshift(newChat);
  activeFilter = 'requests';
  renderChatList();
}

function handleSendMessage() {
  if (!messageInput) return;
  const text = messageInput.value.trim();
  if (!text) return;
  if (!activeChatId) return;
  const chat = chatData.find((item) => item.id === activeChatId);
  if (!chat) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  chat.messages.push({ sender: 'me', text, time });
  chat.lastMessage = text;
  chat.time = 'Now';
  messageInput.value = '';
  renderChatDetail();
  renderChatList();
}

function initializeApp() {
  const storedDeviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
  const storedPublicKey = localStorage.getItem(PUBLIC_STORAGE_KEY);
  const storedPrivateKey = localStorage.getItem(PRIVATE_STORAGE_KEY);

  if (storedDeviceId && storedPublicKey && storedPrivateKey) {
    loadAppWithKeys(storedPublicKey, storedPrivateKey);
    showAppScreen();
  }
}

function showLoginOverlay() {
  if (!loginOverlay) return;
  updateLoginKeys();
  loginOverlay.classList.add('active');
  loginOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function handleManualIdentity() {
  if (!manualIdentityInput) return;
  const parsed = parseManualIdentity(manualIdentityInput.value);
  if (!parsed) {
    alert('Please paste a valid identity string that includes your public key and the private key phrase.');
    return;
  }
  const { publicKey, privateKey } = parsed;
  const identityKey = generateIdentityKey(publicKey, privateKey);
  if (identityKeyValue) identityKeyValue.textContent = identityKey;
  saveIdentityToStorage(publicKey, privateKey, identityKey);
  loadAppWithKeys(publicKey, privateKey);
  showAppScreen();
}

function copyText(text) {
  if (!navigator.clipboard) {
    alert('Clipboard API is unavailable in this browser.');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  }).catch(() => {
    alert('Unable to copy the key.');
  });
}

if (demoGhostId) {
  demoGhostId.addEventListener('click', showLoginOverlay);
}

if (copyIdentity) {
  copyIdentity.addEventListener('click', () => {
    if (identityKeyValue) copyText(identityKeyValue.textContent || '');
  });
}

if (copySecurityIdentity) {
  copySecurityIdentity.addEventListener('click', () => {
    if (securityIdentityKey) copyText(securityIdentityKey.textContent || '');
  });
}

if (continueButton) {
  continueButton.addEventListener('click', () => {
    if (!identityKeyValue) return;
    const identityKey = identityKeyValue.textContent.trim();
    if (!identityKey || identityKey.includes('...')) {
      alert('No identity key generated yet. Please wait a moment.');
      return;
    }
    const publicKey = identityKeyValue.dataset.publicKey || '';
    const privateKey = identityKeyValue.dataset.privateKey || '';
    if (!publicKey || !privateKey) {
      alert('Identity generation error. Please refresh and try again.');
      return;
    }
    saveIdentityToStorage(publicKey, privateKey, identityKey);
    loadAppWithKeys(publicKey, privateKey);
    showAppScreen();
  });
}

if (useExistingIdentityButton) {
  useExistingIdentityButton.addEventListener('click', handleManualIdentity);
}

if (addFriendButton) {
  addFriendButton.addEventListener('click', handleAddFriend);
}

chatTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeFilter = tab.dataset.filter || 'all';
    chatTabs.forEach((item) => item.classList.toggle('active', item === tab));
    renderChatList();
  });
});

const chatSearchInput = document.getElementById('chatSearchInput');
if (chatSearchInput) {
  chatSearchInput.addEventListener('input', handleSearchInput);
}

if (sendButton) {
  sendButton.addEventListener('click', handleSendMessage);
}

if (messageInput) {
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });
}

sidebarIcons.forEach((icon) => {
  icon.addEventListener('click', () => {
    switchAppView(icon.dataset.view);
  });
});

mobileNavBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    switchAppView(btn.dataset.view);
  });
});

if (backToChatListButton) {
  backToChatListButton.addEventListener('click', closeChatDetail);
}

if (publishGtPostButton) {
  publishGtPostButton.addEventListener('click', handlePublishGtPost);
}

if (terminalClear) {
  terminalClear.addEventListener('click', () => {
    if (terminalOutput) terminalOutput.innerHTML = '';
    terminalRootAuthenticated = false;
    terminalAwaitingAlias = false;
    terminalPendingCmd = null;
    setBldMode(false);
    if (terminalInput) {
      terminalInput.type = 'text';
      terminalInput.placeholder = 'ghost help';
    }
  });
}

const bldExitBtn = document.getElementById('bldExitBtn');
if (bldExitBtn) {
  bldExitBtn.addEventListener('click', () => {
    setBldMode(false);
    appendTerminalLine('  BLD MODE deactivated via exit button.', 'output');
    appendTerminalLine('', 'output');
  });
}

// ─── Terminal root-mode state ─────────────────────────────────
let terminalRootAuthenticated = false;
let terminalAwaitingAlias = false;
let terminalPendingCmd = null;
let terminalBldMode = false;
let terminalLastRecipient = null;

function maskPrivateKey(pk) {
  if (!pk) return '@Ghost-●●●●●●●';
  const raw = pk.replace('@Ghost-', '');
  return `@Ghost-●●●${raw.slice(-3)}`;
}

function appendTerminalLine(text, type = 'output') {
  if (!terminalOutput) return;
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function appendTerminalLines(lines) {
  lines.forEach((line) => appendTerminalLine(line, 'output'));
}

function appendTerminalMessage(direction, senderLabel, senderKey, text, time) {
  if (!terminalOutput) return;
  const div = document.createElement('div');
  div.className = `terminal-msg terminal-msg-${direction}`;
  div.innerHTML = `
    <div class="terminal-msg-meta">
      <span class="tmsg-label">${direction === 'sent' ? '▶ YOU' : '◀ ' + senderLabel}</span>
      <span class="tmsg-key">${senderKey}</span>
      <span class="tmsg-time">${time}</span>
    </div>
    <div class="terminal-msg-body">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  `;
  terminalOutput.appendChild(div);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  // Simulate incoming reply after 2s
  if (direction === 'sent') {
    setTimeout(() => {
      const replies = [
        'Message received. Standing by.',
        'Copy that. Relay confirmed.',
        'Acknowledged. Ghost channel secure.',
        'Got it. Stay dark.',
        'Confirmed. Thread encrypted.',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      appendTerminalMessage('recv', senderLabel, terminalLastRecipient || '#ghost-●●●●-E', reply, t);
    }, 1800 + Math.random() * 1200);
  }
}

function setBldMode(on) {
  terminalBldMode = on;
  const termPanel = document.querySelector('.terminal-panel');
  const bldBanner = document.getElementById('bldBanner');
  const bldExitBtn = document.getElementById('bldExitBtn');
  if (on) {
    document.body.classList.add('terminal-bld-active');
    if (bldBanner) bldBanner.classList.remove('hidden');
    if (bldExitBtn) bldExitBtn.classList.remove('hidden');
    // Also switch to terminal view
    switchAppView('terminal');
    appendTerminalLine('', 'output');
    appendTerminalLine('  ■ BLD terminal is now fullscreen. Type @ghost bld exit to leave.', 'root');
  } else {
    document.body.classList.remove('terminal-bld-active');
    if (bldBanner) bldBanner.classList.add('hidden');
    if (bldExitBtn) bldExitBtn.classList.add('hidden');
  }
}

function initiateRootAuth(cmd) {
  terminalAwaitingAlias = true;
  terminalPendingCmd = cmd;
  if (terminalInput) {
    terminalInput.type = 'password';
    terminalInput.placeholder = 'enter your alias…';
  }
  appendTerminalLine('', 'output');
  appendTerminalLine('  ⚡ ROOT REQUIRED — @ghost command detected', 'warn');
  appendTerminalLine('  Enter your alias (codename) to authenticate:', 'output');
  appendTerminalLine('  Tip: your alias is the codename in your Ghost ID.', 'output');
}

function verifyRootAlias(input) {
  if (terminalInput) {
    terminalInput.type = 'text';
    terminalInput.placeholder = '@ghost help';
  }
  terminalAwaitingAlias = false;

  const storedPub = localStorage.getItem(PUBLIC_STORAGE_KEY) || '';
  const deviceAlias = extractAliasFromKey(storedPub).toLowerCase();
  const entered = input.trim().toLowerCase();

  appendTerminalLine(`  ● ${entered.replace(/./g, '●')}`, 'command');
  appendTerminalLine('', 'output');

  if (!deviceAlias || deviceAlias === 'ghost') {
    appendTerminalLine('  ✗ No identity found on device. Log in first.', 'error');
    terminalPendingCmd = null;
    return;
  }

  if (entered === deviceAlias) {
    terminalRootAuthenticated = true;
    appendTerminalLine(`  ✓ Root access granted — ${deviceAlias} authenticated.`, 'success');
    appendTerminalLine('  @ghost commands active for this session.', 'output');
    appendTerminalLine('', 'output');
    const cmd = terminalPendingCmd;
    terminalPendingCmd = null;
    dispatchAtGhostCommand(cmd);
  } else {
    appendTerminalLine('  ✗ ACCESS DENIED — alias mismatch.', 'error');
    appendTerminalLine('  Authentication failed. Use ghost commands for standard mode.', 'output');
    terminalPendingCmd = null;
  }
}

async function dispatchAtGhostCommand(raw) {
  const storedPriv = localStorage.getItem(PRIVATE_STORAGE_KEY) || '';
  const maskedKey = maskPrivateKey(storedPriv);
  const publicId = localStorage.getItem(PUBLIC_STORAGE_KEY) || '';

  // ── BLD exit (frontend-only) ───────────────────────────────
  const cmdLow = raw.toLowerCase();
  if (cmdLow.includes('bld exit') || cmdLow === '@ghost exit') {
    setBldMode(false);
    appendTerminalLine('  BLD MODE deactivated. Terminal restored.', 'output');
    appendTerminalLine('', 'output');
    return;
  }

  const data = await callTerminalApi(raw, publicId);
  if (!data) return;

  // Handle special statuses
  if (data.status === 'bld_active') {
    appendTerminalLines(data.output);
    appendTerminalLine('', 'output');
    setBldMode(true);
    return;
  }

  if (data.status === 'bld_exit') {
    setBldMode(false);
    appendTerminalLines(data.output);
    appendTerminalLine('', 'output');
    return;
  }

  if (data.status === 'send_msg') {
    // Print the thread header lines first
    if (data.output && data.output.length > 0) appendTerminalLines(data.output);
    // Then render the actual chat message bubble
    const ex = data.extra || {};
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    terminalLastRecipient = ex.target || '';
    appendTerminalMessage('sent', ex.target_alias || 'Unknown', maskedKey, ex.text || '', ts);
    appendTerminalLine('', 'output');
    return;
  }

  if (Array.isArray(data.output) && data.output.length > 0) appendTerminalLines(data.output);
  appendTerminalLine('', 'output');
}

async function callTerminalApi(command, publicId) {
  try {
    const response = await fetch('/api/terminal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, public_id: publicId || undefined }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    appendTerminalLine(`  Error: ${err.message}`, 'error');
    return null;
  }
}

if (terminalInput) {
  terminalInput.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const raw = terminalInput.value.trim();
    if (!raw || !terminalOutput) return;
    terminalInput.value = '';

    // ── Alias verification step ────────────────────────────
    if (terminalAwaitingAlias) {
      verifyRootAlias(raw);
      return;
    }

    const isRoot = raw.startsWith('@ghost');

    // Echo command (mask alias input, show @ghost prompt differently)
    if (isRoot) {
      appendTerminalLine(`@ghost ▶ ${raw.slice(6).trim()}`, 'root-cmd');
    } else {
      appendTerminalLine(`ghost ▶ ${raw}`, 'command');
    }

    if (isRoot) {
      // Root command — require auth first
      if (!terminalRootAuthenticated) {
        initiateRootAuth(raw);
      } else {
        await dispatchAtGhostCommand(raw);
      }
      return;
    }

    // Standard ghost command → backend
    await runTerminalCommand(raw);
  });
}

async function runTerminalCommand(command) {
  const publicId = localStorage.getItem(PUBLIC_STORAGE_KEY) || '';
  const data = await callTerminalApi(command, publicId);
  if (!data) return;

  if (data.clear && terminalOutput) {
    terminalOutput.innerHTML = '';
    terminalRootAuthenticated = false;
    terminalBldMode = false;
    setBldMode(false);
    return;
  }

  if (Array.isArray(data.output) && data.output.length > 0) {
    appendTerminalLines(data.output);
  } else if (data.status === 'error') {
    appendTerminalLine('  Command failed.', 'error');
  }

  appendTerminalLine('', 'output');
}

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const emailInput = contactForm.querySelector('input[type="email"]');
  if (emailInput && emailInput.value) {
    alert(`Thanks! ${emailInput.value} has been added to the GhostTunn updates list.`);
    emailInput.value = '';
  }
});

// ─── Profile Drawer ───────────────────────────────────────────
function openProfileDrawer() {
  if (!profileDrawer || !profileDrawerOverlay) return;

  // Refresh identity display from storage each time we open
  const storedIdentity = localStorage.getItem(IDENTITY_STORAGE_KEY) || '';
  profileKeyRevealed = false;
  if (profileIdentityDisplay) {
    profileIdentityDisplay.textContent = '••••••••••••••••••••';
    profileIdentityDisplay.classList.remove('revealed');
    profileIdentityDisplay.dataset.full = storedIdentity;
  }

  profileDrawerOverlay.classList.add('open');
  profileDrawerOverlay.setAttribute('aria-hidden', 'false');
  profileDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProfileDrawer() {
  if (!profileDrawer || !profileDrawerOverlay) return;
  profileDrawer.classList.remove('open');
  profileDrawerOverlay.classList.remove('open');
  profileDrawerOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

sidebarProfileBtn?.addEventListener('click', openProfileDrawer);
topbarProfileBtn?.addEventListener('click', openProfileDrawer);
mobileProfileBtn?.addEventListener('click', openProfileDrawer);
profileDrawerClose?.addEventListener('click', closeProfileDrawer);
profileDrawerOverlay?.addEventListener('click', closeProfileDrawer);

profileKeyToggle?.addEventListener('click', () => {
  if (!profileIdentityDisplay) return;
  profileKeyRevealed = !profileKeyRevealed;
  if (profileKeyRevealed) {
    profileIdentityDisplay.textContent = profileIdentityDisplay.dataset.full || '—';
    profileIdentityDisplay.classList.add('revealed');
    profileKeyToggle.textContent = '🙈';
  } else {
    profileIdentityDisplay.textContent = '••••••••••••••••••••';
    profileIdentityDisplay.classList.remove('revealed');
    profileKeyToggle.textContent = '👁';
  }
});

profileKeyCopy?.addEventListener('click', () => {
  const key = profileIdentityDisplay?.dataset.full || '';
  if (!key) return;
  copyText(key);
});

profileLogoutBtn?.addEventListener('click', () => {
  if (!confirm('Sign out? Your identity key will be cleared from this device. Make sure you have it saved before continuing.')) return;
  localStorage.removeItem(DEVICE_STORAGE_KEY);
  localStorage.removeItem(PUBLIC_STORAGE_KEY);
  localStorage.removeItem(PRIVATE_STORAGE_KEY);
  localStorage.removeItem(IDENTITY_STORAGE_KEY);
  localStorage.removeItem(AVATAR_PHOTO_KEY);
  closeProfileDrawer();
  location.reload();
});

// ─── Avatar upload / remove ───────────────────────────────────
avatarUploadBtn?.addEventListener('click', () => {
  avatarFileInput?.click();
});

avatarFileInput?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file (JPG, PNG, GIF, WebP…).');
    return;
  }
  resizeAndStorePhoto(file);
  // Reset input so the same file can be re-selected if needed
  avatarFileInput.value = '';
});

avatarRemoveBtn?.addEventListener('click', () => {
  localStorage.removeItem(AVATAR_PHOTO_KEY);
  clearPhotoFromAllAvatars();
});

// Close drawer with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (profileDrawer?.classList.contains('open')) closeProfileDrawer();
    if (notifOpen) closeNotifDropdown();
  }
});

// ─── Nav links: scroll to section (even from app shell) ──────
function navigateToSection(sectionId) {
  // If app shell is visible, switch back to landing view first
  const shell = document.getElementById('appShell');
  const isShellVisible = shell && !shell.classList.contains('hidden');

  if (isShellVisible) {
    // Hide app shell, show landing sections
    shell.classList.add('hidden');
    document.querySelectorAll('main > section:not(#appShell)').forEach((s) => s.classList.remove('hidden'));
    document.body.classList.remove('no-scroll');
  }

  // Scroll to target section after a short tick to let DOM settle
  requestAnimationFrame(() => {
    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Close mobile nav if open
  siteNav?.classList.remove('active');
}

// Attach to all nav links
document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToSection(link.dataset.section);
  });
});

// Logo → home
document.querySelector('.brand')?.addEventListener('click', (e) => {
  e.preventDefault();
  navigateToSection('home');
});

// ─── Notifications ────────────────────────────────────────────
function updateBadge() {
  const unreadCount = notifications.filter((n) => n.unread).length;
  if (!notifBadge) return;
  if (unreadCount > 0) {
    notifBadge.textContent = unreadCount;
    notifBadge.classList.remove('hidden');
    notifBell?.setAttribute('aria-label', `Notifications — ${unreadCount} unread`);
  } else {
    notifBadge.classList.add('hidden');
    notifBell?.setAttribute('aria-label', 'Notifications — all read');
  }
}

function renderNotifications() {
  if (!notifList) return;
  if (notifications.length === 0) {
    notifList.innerHTML = '<li class="notif-empty">You\'re all caught up 👻</li>';
    return;
  }
  notifList.innerHTML = notifications.map((n) => `
    <li class="notif-item${n.unread ? ' unread' : ''}" data-id="${n.id}" data-section="${n.section || ''}">
      <div class="notif-item-icon">${n.icon}</div>
      <div class="notif-item-body">
        <p class="notif-item-text">${n.text}</p>
        <span class="notif-item-time">${n.time}</span>
      </div>
      <span class="notif-unread-dot" aria-hidden="true"></span>
    </li>
  `).join('');

  // Click each notification item
  notifList.querySelectorAll('.notif-item').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const section = el.dataset.section;
      const notif = notifications.find((n) => n.id === id);
      if (notif) notif.unread = false;
      el.classList.remove('unread');
      el.querySelector('.notif-unread-dot')?.classList.remove('unread');
      updateBadge();
      closeNotifDropdown();
      if (section) navigateToSection(section);
    });
  });
}

function openNotifDropdown() {
  if (!notifDropdown) return;
  renderNotifications();
  notifDropdown.classList.add('open');
  notifDropdown.setAttribute('aria-hidden', 'false');
  notifBell?.setAttribute('aria-expanded', 'true');
  notifOpen = true;
}

function closeNotifDropdown() {
  if (!notifDropdown) return;
  notifDropdown.classList.remove('open');
  notifDropdown.setAttribute('aria-hidden', 'true');
  notifBell?.setAttribute('aria-expanded', 'false');
  notifOpen = false;
}

notifBell?.addEventListener('click', (e) => {
  e.stopPropagation();
  notifOpen ? closeNotifDropdown() : openNotifDropdown();
});

notifClearAll?.addEventListener('click', () => {
  notifications.forEach((n) => { n.unread = false; });
  renderNotifications();
  updateBadge();
});

// Close notification dropdown on outside click
document.addEventListener('click', (e) => {
  if (notifOpen && notifDropdown && !document.getElementById('notifWrapper')?.contains(e.target)) {
    closeNotifDropdown();
  }
});

// ─── Highlight active nav link on scroll ─────────────────────
const landingSections = ['home', 'features', 'architecture', 'security', 'contact'];
function updateActiveNavLink() {
  const scrollY = window.scrollY + 100;
  let current = 'home';
  landingSections.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  });
  document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}
window.addEventListener('scroll', updateActiveNavLink, { passive: true });

window.addEventListener('DOMContentLoaded', () => {
  updateBadge();
  updateActiveNavLink();
  initializeApp();
});
