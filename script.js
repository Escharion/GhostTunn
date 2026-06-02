const menuToggle = document.getElementById('menuToggle');
const siteNav = document.getElementById('siteNav');
const demoGhostId = document.getElementById('demoGhostId');
const ghostIdValue = document.getElementById('ghostIdValue');
const contactForm = document.getElementById('contactForm');
const loginOverlay = document.getElementById('loginOverlay');
const publicKeyValue = document.getElementById('publicKeyValue');
const privateKeyValue = document.getElementById('privateKeyValue');
const identityKeyValue = document.getElementById('identityKeyValue');
const continueButton = document.getElementById('continueButton');
const copyPublic = document.getElementById('copyPublic');
const copyPrivate = document.getElementById('copyPrivate');
const copyIdentity = document.getElementById('copyIdentity');
const loginTabs = document.querySelectorAll('.login-tab');
const appShell = document.getElementById('appShell');
const manualIdentityInput = document.getElementById('manualIdentityInput');
const useExistingIdentityButton = document.getElementById('useExistingIdentity');
const accountPublicKey = document.getElementById('accountPublicKey');
const profileAvatar = document.getElementById('profileAvatar');
const addFriendButton = document.getElementById('addFriendButton');
const chatListElement = document.getElementById('chatList');
const chatTabs = document.querySelectorAll('.chat-tab');
const chatView = document.getElementById('chatView');
const ghosttimeView = document.getElementById('ghosttimeView');
const accountView = document.getElementById('accountView');
const chatDetailPanel = document.getElementById('chatDetailPanel');
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
const gtPostText = document.getElementById('gtPostText');
const gtPostList = document.getElementById('gtPostList');
const publishGtPostButton = document.getElementById('publishGtPost');
const privacySettingsBtn = document.getElementById('privacySettingsBtn');
const privacyPanel = document.getElementById('privacyPanel');
const privacyBackBtn = document.getElementById('privacyBackBtn');
const terminalView = document.getElementById('terminalView');
const terminalOutput = document.getElementById('terminalOutput');
const terminalInput = document.getElementById('terminalInput');
const terminalClear = document.getElementById('terminalClear');
const copySecurityPublic = document.getElementById('copySecurityPublic');
const copySecurityPrivate = document.getElementById('copySecurityPrivate');
const copySecurityIdentity = document.getElementById('copySecurityIdentity');
const copyRegistrationKey = document.getElementById('copyRegistrationKey');
const securityPublicKey = document.getElementById('securityPublicKey');
const securityPrivateKey = document.getElementById('securityPrivateKey');
const securityIdentityKey = document.getElementById('securityIdentityKey');
const registrationKey = document.getElementById('registrationKey');

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
    return {
      publicKey: publicMatch[0],
      privateKey: privateMatch[0],
    };
  }

  const rawMatch = remainder.match(/[A-Za-z0-9]{7}/);
  if (rawMatch) {
    return {
      publicKey: publicMatch[0],
      privateKey: `@Ghost-${rawMatch[0]}`,
    };
  }

  return null;
}

function updateLoginKeys() {
  const publicKey = generatePublicKey();
  const privateKey = generatePrivateKey();
  const identityKey = generateIdentityKey(publicKey, privateKey);

  if (publicKeyValue) publicKeyValue.textContent = publicKey;
  if (privateKeyValue) privateKeyValue.textContent = privateKey;
  if (identityKeyValue) identityKeyValue.textContent = identityKey;
  if (ghostIdValue) ghostIdValue.textContent = `Ghost ID: ${publicKey}`;
  return { publicKey, privateKey, identityKey };
}

function setActiveTab(tabName) {
  loginTabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  document.querySelectorAll('.tab-panel').forEach((panel) => {
    const isActive = panel.id === `${tabName}Tab`;
    panel.classList.toggle('active', isActive);
  });
}

function generateAvatarColor(publicKey) {
  const hash = Array.from(publicKey).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const secondary = (hue + 50) % 360;
  const tertiary = (hue + 110) % 360;
  return `radial-gradient(circle at 20% 20%, hsl(${hue}, 85%, 60%), transparent 20%), radial-gradient(circle at 80% 30%, hsl(${secondary}, 75%, 60%), transparent 18%), radial-gradient(circle at 50% 70%, hsl(${tertiary}, 65%, 55%), transparent 24%)`;
}

function applyAvatar(publicKey) {
  if (!profileAvatar) return;
  profileAvatar.style.background = generateAvatarColor(publicKey);
  profileAvatar.textContent = publicKey.slice(7, 9).toUpperCase();
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
  
  // Show message input for chat (remove hidden class, also remove compact class)
  const inputArea = document.querySelector('.message-input-area');
  if (inputArea) {
    inputArea.classList.remove('hidden');
    inputArea.classList.remove('compact');
  }
  
  if (window.innerWidth < 1200) {
    chatDetailPanel?.classList.add('show');
    chatListElement?.classList.add('hidden');
  } else {
    chatDetailPanel?.classList.remove('hidden');
  }
}

function closeChatDetail() {
  if (window.innerWidth < 1200) {
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
    const isActive = icon.dataset.view === view;
    icon.classList.toggle('active', isActive);
  });
  
  if (view === 'ghosttime') {
    renderGtPosts();
  }
  // Only show search / add friend controls when in the chat view
  if (searchActionRow) {
    searchActionRow.classList.toggle('hidden', view !== 'chat');
  }
  if (addFriendButton) {
    addFriendButton.classList.toggle('hidden', view !== 'chat');
  }
  if (appTopbar) {
    appTopbar.classList.toggle('hidden', view !== 'chat');
  }
  if (view === 'terminal' && terminalInput) {
    terminalInput.focus();
  }
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
      const id = btn.dataset.postId;
      openGtPostDetail(id);
    });
  });
  gtPostList.querySelectorAll('.gt-post-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.postId;
      openGtPostDetail(id);
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
  if (chatDetailSubtitle) chatDetailSubtitle.textContent = 'Posts';

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
    
    // Hide message input by default, show compact style when needed
    if (messageInput) messageInput.placeholder = 'Add a comment...';
    if (document.querySelector('.message-input-area')) {
      document.querySelector('.message-input-area').classList.add('hidden');
    }
    
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
          const inputArea = document.querySelector('.message-input-area');
          if (dropdown) {
            dropdown.classList.toggle('hidden');
          }
          if (inputArea) {
            inputArea.classList.toggle('hidden');
            inputArea.classList.add('compact');
            if (!inputArea.classList.contains('hidden')) {
              messageInput?.focus();
              messageInput?.setAttribute('data-post-id', postId);
            }
          }
        }
      });
    });

    // Wire comment send button inside dropdown
    const commentSendBtn = messagesContainer.querySelector(`.gt-comment-send[data-post-id="${postId}"]`);
    const commentInput = messagesContainer.querySelector(`.gt-comment-input[data-post-id="${postId}"]`);
    if (commentSendBtn && commentInput) {
      commentSendBtn.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (!text) return;
        gtComments[postId] = gtComments[postId] || [];
        gtComments[postId].push({ author: 'You', text, time: 'Just now' });
        commentInput.value = '';
        renderComments(postId);
        // update comment count
        const commentsBtn = messagesContainer.querySelector(`.gt-stat-button[data-action="comments"]`);
        if (commentsBtn) commentsBtn.innerHTML = `💬 ${(gtComments[postId] || []).length}`;
      });
      commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          commentSendBtn.click();
        }
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
  gtPosts.unshift({ id: `post-${Date.now()}`, content, time: 'Just now' });
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
  
  // Check if this is a comment on a GT post
  const postId = messageInput.getAttribute('data-post-id');
  if (postId) {
    gtComments[postId] = gtComments[postId] || [];
    gtComments[postId].push({ author: 'You', text, time: 'Just now' });
    messageInput.value = '';
    renderComments(postId);
    // update comment count
    const commentsBtn = document.querySelector(`.gt-stat-button[data-action="comments"]`);
    if (commentsBtn) commentsBtn.innerHTML = `💬 ${(gtComments[postId] || []).length}`;
    messageInput.removeAttribute('data-post-id');
    return;
  }
  
  // Otherwise handle as chat message
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
  console.log('showLoginOverlay called, loginOverlay:', loginOverlay);
  if (!loginOverlay) {
    console.error('loginOverlay element not found');
    return;
  }
  updateLoginKeys();
  setActiveTab('public');
  loginOverlay.classList.add('active');
  loginOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  console.log('Login overlay shown');
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
  if (publicKeyValue) publicKeyValue.textContent = publicKey;
  if (privateKeyValue) privateKeyValue.textContent = privateKey;
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

loginTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    setActiveTab(tab.dataset.tab);
  });
});

if (copyPublic) {
  copyPublic.addEventListener('click', () => {
    if (publicKeyValue) copyText(publicKeyValue.textContent || '');
  });
}

if (copyPrivate) {
  copyPrivate.addEventListener('click', () => {
    if (privateKeyValue) copyText(privateKeyValue.textContent || '');
  });
}

if (copyIdentity) {
  copyIdentity.addEventListener('click', () => {
    if (identityKeyValue) copyText(identityKeyValue.textContent || '');
  });
}

if (copySecurityPublic) {
  copySecurityPublic.addEventListener('click', () => {
    if (securityPublicKey) copyText(securityPublicKey.textContent || '');
  });
}

if (copySecurityPrivate) {
  copySecurityPrivate.addEventListener('click', () => {
    if (securityPrivateKey) copyText(securityPrivateKey.textContent || '');
  });
}

if (copySecurityIdentity) {
  copySecurityIdentity.addEventListener('click', () => {
    if (securityIdentityKey) copyText(securityIdentityKey.textContent || '');
  });
}

if (copyRegistrationKey) {
  copyRegistrationKey.addEventListener('click', () => {
    if (registrationKey) copyText(registrationKey.textContent || '');
  });
}

if (continueButton) {
  continueButton.addEventListener('click', () => {
    if (!publicKeyValue || !privateKeyValue) return;
    const publicKey = publicKeyValue.textContent.trim();
    const privateKey = privateKeyValue.textContent.trim();
    if (!publicKey || !privateKey) {
      alert('No keys are available yet. Please generate or paste your identity before continuing.');
      return;
    }
    const identityKey = generateIdentityKey(publicKey, privateKey);
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

if (backToChatListButton) {
  backToChatListButton.addEventListener('click', closeChatDetail);
}

if (publishGtPostButton) {
  publishGtPostButton.addEventListener('click', handlePublishGtPost);
}

if (privacySettingsBtn) {
  privacySettingsBtn.addEventListener('click', () => {
    if (privacyPanel) {
      privacyPanel.classList.remove('hidden');
      setupPrivacyToggles();
    }
  });
}

if (privacyBackBtn) {
  privacyBackBtn.addEventListener('click', () => {
    if (privacyPanel) privacyPanel.classList.add('hidden');
  });
}

if (terminalClear) {
  terminalClear.addEventListener('click', () => {
    if (terminalOutput) terminalOutput.innerHTML = '';
  });
}

if (terminalInput) {
  terminalInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = terminalInput.value.trim();
      if (!command || !terminalOutput) return;
      appendTerminalLine(`>>> ${command}`, 'command');
      await runTerminalCommand(command);
      terminalInput.value = '';
    }
  });
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

async function runTerminalCommand(command) {
  const publicId = (publicKeyValue?.textContent || accountPublicKey?.textContent || '').trim();
  const payload = {
    command,
    public_id: publicId || undefined,
  };

  try {
    const response = await fetch('/api/terminal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Terminal service error ${response.status}`);
    }

    const data = await response.json();
    if (data.clear && terminalOutput) {
      terminalOutput.innerHTML = '';
    }

    if (Array.isArray(data.output) && data.output.length > 0) {
      appendTerminalLines(data.output);
    } else if (data.status === 'error') {
      appendTerminalLine('Command failed: see backend response.', 'error');
    }
  } catch (error) {
    appendTerminalLine(`Error: ${error.message}`, 'error');
  }
}

function setupPrivacyToggles() {
  const toggleSwitches = document.querySelectorAll('.toggle-switch');
  toggleSwitches.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });
}

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const emailInput = contactForm.querySelector('input[type="email"]');
  if (emailInput && emailInput.value) {
    alert(`Thanks! ${emailInput.value} has been added to the GhostTunn updates list.`);
    emailInput.value = '';
  }
});

window.addEventListener('DOMContentLoaded', initializeApp);
