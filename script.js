// ═══════════════════════════════════════════════════════════════
//  GhostTunn — script.js
//  Main client-side JavaScript for the GhostTunn privacy platform.
//
//  STRUCTURE OF THIS FILE:
//  1.  Splash screen dismiss
//  2.  DOM element references (constants)
//  3.  App state variables
//  4.  Demo chat data
//  5.  localStorage keys + init helpers
//  6.  Key generation (public/private/identity keys)
//  7.  Avatar helpers (colour, initials, photo)
//  8.  App view switching (sidebar / mobile nav)
//  9.  Chat list & chat detail rendering
//  10. GhostTime (social post feed)
//  11. Login overlay logic + identity management
//  12. Notification bell
//  13. Profile drawer (settings, keys, avatar upload)
//  14. Terminal / @ghost root-mode command system
//  15. Event listeners (navigation, search, send, etc.)
// ═══════════════════════════════════════════════════════════════


// ─── 1. SPLASH SCREEN DISMISS ────────────────────────────────
// The splash overlay (#ghostSplash) shows the logo on first load.
// After 2.2 s we fade it out, then delete it from the DOM entirely
// so it doesn't block interaction with the page underneath.
(function ghostSplashDismiss() {
  const splash = document.getElementById('ghostSplash');
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add('fade-out');           // triggers CSS opacity → 0 transition
    setTimeout(() => splash.remove(), 10000);    // remove after transition finishes
  }, 10000);
})();


// ─── 2. DOM ELEMENT REFERENCES ───────────────────────────────
// We grab every interactive element we need once at startup and
// store them in constants.  This is faster than calling
// getElementById/querySelector repeatedly inside event handlers.

// ── Landing-page & login elements ────────────────────────────
const menuToggle          = document.getElementById('menuToggle');       // hamburger ≡ button
const siteNav             = document.getElementById('siteNav');          // nav links bar
const demoGhostId         = document.getElementById('demoGhostId');      // "Start" hero button
const ghostIdValue        = document.getElementById('ghostIdValue');     // hero Ghost ID display
const contactForm         = document.getElementById('contactForm');      // footer contact form
const loginOverlay        = document.getElementById('loginOverlay');     // full-screen identity dialog
const identityKeyValue    = document.getElementById('identityKeyValue'); // combined key text (login overlay)
const continueButton      = document.getElementById('continueButton');   // "Continue" in login overlay
const copyIdentity        = document.getElementById('copyIdentity');     // copy full identity key
const appShell            = document.getElementById('appShell');         // the main app section (hidden until logged in)
const manualIdentityInput = document.getElementById('manualIdentityInput'); // paste-existing-key input
const useExistingIdentityButton = document.getElementById('useExistingIdentity'); // restore identity button

// ── App-shell utility elements ────────────────────────────────
const accountPublicKey    = document.getElementById('accountPublicKey'); // account tab public key display
const addFriendButton     = document.getElementById('addFriendButton');  // "+" add-contact button
const chatListElement     = document.getElementById('chatList');         // scrollable conversation list
const chatTabs            = document.querySelectorAll('.chat-tab');      // All / Unread / Requests buttons
const chatView            = document.getElementById('chatView');         // chat list view panel
const ghosttimeView       = document.getElementById('ghosttimeView');    // social feed panel
const accountView         = document.getElementById('accountView');      // account settings panel
const chatDetailPanel     = document.getElementById('chatDetailPanel'); // sliding conversation detail panel
const messageInputArea    = document.getElementById('messageInputArea');// compose bar (hidden until chat opens)
const searchActionRow     = document.querySelector('.search-action-row');// search + add-friend row
const appTopbar           = document.querySelector('.app-topbar');       // mobile top bar
const backToChatListButton = document.getElementById('backToChatListButton'); // ← back in chat detail
const chatDetailTitle     = document.getElementById('chatDetailTitle'); // contact name in chat header
const chatDetailSubtitle  = document.getElementById('chatDetailSubtitle'); // online status / public key
const messagesContainer   = document.getElementById('messagesContainer'); // scrollable bubble list
const messageInput        = document.getElementById('messageInput');    // message text field
const sendButton          = document.getElementById('sendButton');      // send button
const appSidebar          = document.querySelector('.app-sidebar');     // left icon sidebar
const sidebarIcons        = document.querySelectorAll('.sidebar-icon'); // each sidebar navigation icon
const mobileNavBtns       = document.querySelectorAll('.mobile-nav-btn'); // bottom-nav buttons on mobile

// ── GhostTime (social feed) elements ─────────────────────────
const gtPostText          = document.getElementById('gtPostText');      // post textarea
const gtPostList          = document.getElementById('gtPostList');      // rendered post list
const publishGtPostButton = document.getElementById('publishGtPost');  // publish button

// ── Terminal elements ─────────────────────────────────────────
const terminalView   = document.getElementById('terminalView');   // the terminal view panel
const terminalOutput = document.getElementById('terminalOutput'); // terminal line output area
const terminalInput  = document.getElementById('terminalInput');  // the single-line command input
const terminalClear  = document.getElementById('terminalClear');  // "clear" button

// ── Security section elements (landing page) ──────────────────
const copySecurityIdentity = document.getElementById('copySecurityIdentity'); // copy identity in security section
const securityIdentityKey  = document.getElementById('securityIdentityKey');  // identity key display in security section

// ── Profile drawer elements ───────────────────────────────────
// The profile drawer slides in from the right.  It is opened via
// the avatar icon in the sidebar, topbar (mobile), or mobile nav.
const sidebarProfileBtn     = document.getElementById('sidebarProfileBtn');
const topbarProfileBtn      = document.getElementById('topbarProfileBtn');
const mobileProfileBtn      = document.getElementById('mobileProfileBtn');
const profileDrawer         = document.getElementById('profileDrawer');
const profileDrawerOverlay  = document.getElementById('profileDrawerOverlay');
const profileDrawerClose    = document.getElementById('profileDrawerClose');
const profileDisplayAlias   = document.getElementById('profileDisplayAlias');   // alias text in drawer header
const profilePublicKeyDisplay = document.getElementById('profilePublicKeyDisplay'); // sub-title public key
const profileIdentityDisplay  = document.getElementById('profileIdentityDisplay'); // masked combined key
const profileKeyToggle        = document.getElementById('profileKeyToggle');  // 👁 show/hide full identity
const profileKeyCopy          = document.getElementById('profileKeyCopy');    // copy full identity key
const profileLogoutBtn        = document.getElementById('profileLogoutBtn');  // sign-out button

// ── Avatar elements ───────────────────────────────────────────
// The same avatar appears in three places: sidebar (desktop),
// topbar (mobile), and the profile drawer.  All three are kept
// in sync whenever the user changes their photo or identity.
const sidebarAvatar           = document.getElementById('sidebarAvatar');
const sidebarAvatarInitials   = document.getElementById('sidebarAvatarInitials');
const sidebarPhoto            = document.getElementById('sidebarPhoto');
const topbarAvatar            = document.getElementById('topbarAvatar');
const topbarAvatarInitials    = document.getElementById('topbarAvatarInitials');
const topbarPhoto             = document.getElementById('topbarPhoto');
const mobileNavAvatar         = document.getElementById('mobileNavAvatar');
const mobileNavAvatarInitials = document.getElementById('mobileNavAvatarInitials');
const mobileNavPhoto          = document.getElementById('mobileNavPhoto');
const profileDrawerAvatar         = document.getElementById('profileDrawerAvatar');
const profileDrawerAvatarInitials = document.getElementById('profileDrawerAvatarInitials');
const profileDrawerPhoto          = document.getElementById('profileDrawerPhoto');

// ── Avatar upload controls ────────────────────────────────────
const avatarUploadBtn = document.getElementById('avatarUploadBtn'); // 📷 camera button
const avatarRemoveBtn = document.getElementById('avatarRemoveBtn'); // ✕ remove button
const avatarFileInput = document.getElementById('avatarFileInput'); // hidden <input type="file">
const avatarUploadHint = document.getElementById('avatarUploadHint'); // "Tap 📷" hint text


// ─── 3. APP STATE VARIABLES ──────────────────────────────────
// These `let` variables hold runtime state that changes as the
// user interacts.  They are purposely module-level (not inside
// functions) so all functions in this file can read/write them.

let profileKeyRevealed = false; // tracks whether the full identity key is visible in the drawer


// ─── 4. STORAGE KEYS ─────────────────────────────────────────
// We use localStorage to persist the user's identity and photo
// between page reloads.  These keys are the localStorage property
// names — keep them stable across updates or old data is lost.

const AVATAR_PHOTO_KEY = 'ghostAvatarPhoto'; // base64 JPEG of the user's profile photo


// ─── 5. CHAT / UI STATE ──────────────────────────────────────
let activeFilter    = 'all';  // current chat-list filter: 'all' | 'unread' | 'requests'
let activeChatId    = null;   // id of the currently open conversation (null = none)
let chatSearchQuery = '';     // current text in the search bar

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

// ─── 6. LOCALSTORAGE KEY NAMES ───────────────────────────────
// All identity data lives in localStorage — nothing is sent to a
// server.  If these key names change, existing users lose their
// stored identity, so treat them as a stable public API.
const DEVICE_STORAGE_KEY   = 'ghostDeviceId';    // unique device ID (generated once per device)
const PUBLIC_STORAGE_KEY   = 'ghostPublicKey';   // e.g. #ghost-ciphernexus-1042-E
const PRIVATE_STORAGE_KEY  = 'ghostPrivateKey';  // e.g. @Ghost-Abc1234
const IDENTITY_STORAGE_KEY = 'ghostIdentityKey'; // combined: publicKey + " " + rawPrivate

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

// ─── 7. KEY GENERATION ───────────────────────────────────────
// Ghost IDs are generated entirely in the browser — the server
// never sees them.  The format is:
//   Public  : #ghost-<codename>-<4digits>-E
//   Private : @Ghost-<7 alphanumeric chars>
//   Identity: <publicKey> <raw 7-char private suffix>  (space-separated)

/** Returns a random two-word code name used in the public key. */
function randomCodeName() {
  const prefixes = ['spirit', 'nova', 'shadow', 'oracle', 'phantom', 'vector', 'spectre', 'cipher', 'echo', 'pulse'];
  const suffixes = ['blade', 'drift', 'flux', 'pulse', 'spark', 'vortex', 'rune', 'wave', 'flare', 'shade'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}${suffix}`;
}

/** Generates a unique public address.  Example: #ghost-novablade-3712-E */
function generatePublicKey() {
  const codeName = randomCodeName();
  const digits = String(Math.floor(Math.random() * 9000) + 1000);
  return `#ghost-${codeName}-${digits}-E`;
}

/** Generates a private key.  Example: @Ghost-aB3xYzQ */
function generatePrivateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '@Ghost-';
  for (let i = 0; i < 7; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Combines public + private into one portable identity string.
 * The user pastes this on another device to restore their identity.
 * Format: "#ghost-codename-1234-E aB3xYzQ"
 */
function generateIdentityKey(publicKey, privateKey) {
  const rawPrivate = privateKey.replace(/^@Ghost-/, ''); // strip the prefix — the raw 7 chars are enough
  return `${publicKey} ${rawPrivate}`;
}

/** Generates a per-device UUID used for session tracking (never shared). */
function generateDeviceId() {
  if (window.crypto && typeof crypto.randomUUID === 'function') {
    return `device-${crypto.randomUUID()}`;
  }
  // Fallback for older browsers
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'device-';
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Parses an identity string pasted by the user into its components.
 * Accepts both "@Ghost-Abc1234" and plain "Abc1234" private key formats.
 * Returns { publicKey, privateKey } or null if the string is invalid.
 */
function parseManualIdentity(value) {
  const trimmed = value.trim();
  // The public key must match the Ghost ID pattern exactly
  const publicMatch = trimmed.match(/#ghost-[A-Za-z0-9]+-[0-9]{4}-E/);
  if (!publicMatch) return null;

  const remainder = trimmed.slice(publicMatch.index + publicMatch[0].length).trim();

  // Try to find a full "@Ghost-Xxx" formatted private key first
  const privateMatch = remainder.match(/@Ghost-[A-Za-z0-9]{7}/);
  if (privateMatch) {
    return { publicKey: publicMatch[0], privateKey: privateMatch[0] };
  }

  // Fall back to bare 7-char alphanumeric string
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

  // Populate separated public / private key displays in login overlay
  const loginPubEl = document.getElementById('loginPublicKeyDisplay');
  const loginPrivEl = document.getElementById('loginPrivateKeyDisplay');
  const toggleBtn = document.getElementById('toggleLoginPrivKey');
  if (loginPubEl) loginPubEl.textContent = publicKey;
  if (loginPrivEl) {
    loginPrivEl.textContent = '••••••••••••••••';
    loginPrivEl.dataset.real = privateKey;
    loginPrivEl.classList.add('key-value--hidden');
  }
  if (toggleBtn) toggleBtn.textContent = 'Show';

  // Store in data attributes for use by continueButton
  if (identityKeyValue) {
    identityKeyValue.dataset.publicKey = publicKey;
    identityKeyValue.dataset.privateKey = privateKey;
  }

  // Update security section identity key
  if (securityIdentityKey) securityIdentityKey.textContent = identityKey;

  return { publicKey, privateKey, identityKey };
}

// ─── 8. AVATAR HELPERS ───────────────────────────────────────
// Every user has a coloured avatar circle generated from their
// public key.  The colour is deterministic — the same key always
// produces the same gradient.  If the user uploads a photo, that
// is layered on top.  Three copies of the avatar exist in the DOM
// (sidebar, topbar, profile drawer) and must stay in sync.

/**
 * Derives a deterministic 3-stop radial gradient from a public key.
 * Converts the key string to a numeric hash, maps it to an HSL hue,
 * then creates two additional hues spaced 50° and 110° away.
 */
function generateAvatarColor(publicKey) {
  const hash = Array.from(publicKey).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const secondary = (hue + 50) % 360;
  const tertiary = (hue + 110) % 360;
  return `radial-gradient(circle at 20% 20%, hsl(${hue}, 85%, 60%), hsl(${secondary}, 75%, 50%) 55%, hsl(${tertiary}, 65%, 40%))`;
}

/**
 * Extracts the human-readable alias from a public key string.
 * e.g. "#ghost-ciphernexus-1042-E" → "Ciphernexus"
 * Returns "Ghost" if the key doesn't match the expected pattern.
 */
function extractAliasFromKey(publicKey) {
  const match = publicKey.match(/#ghost-([a-z]+)-\d{4}-E/i);
  if (!match) return 'Ghost';
  const raw = match[1];
  return raw.charAt(0).toUpperCase() + raw.slice(1); // capitalise first letter
}

/**
 * Returns two-letter initials from the alias portion of a public key.
 * Used as the fallback inside the avatar circle when no photo is set.
 */
function getAvatarInitials(publicKey) {
  const alias = extractAliasFromKey(publicKey);
  return alias.slice(0, 2).toUpperCase();
}

/**
 * Shows a photo in every avatar circle across the app and hides
 * the initials fallback.  Also updates the upload hint text.
 */
function applyPhotoToAllAvatars(dataUrl) {
  const photoEls    = [sidebarPhoto, topbarPhoto, mobileNavPhoto, profileDrawerPhoto];
  const initialsEls = [sidebarAvatarInitials, topbarAvatarInitials, mobileNavAvatarInitials, profileDrawerAvatarInitials];

  photoEls.forEach((img) => {
    if (!img) return;
    img.src = dataUrl;
    img.classList.remove('hidden'); // make the <img> visible
  });
  initialsEls.forEach((el) => { if (el) el.classList.add('hidden'); }); // hide text initials

  // Update controls
  if (avatarRemoveBtn) avatarRemoveBtn.classList.remove('hidden');
  if (avatarUploadHint) avatarUploadHint.textContent = 'Tap 📷 to change · ✕ to remove';
}

/**
 * Removes any uploaded photo from all avatar circles and falls
 * back to showing the initials derived from the public key.
 */
function clearPhotoFromAllAvatars() {
  const photoEls    = [sidebarPhoto, topbarPhoto, mobileNavPhoto, profileDrawerPhoto];
  const initialsEls = [sidebarAvatarInitials, topbarAvatarInitials, mobileNavAvatarInitials, profileDrawerAvatarInitials];

  photoEls.forEach((img) => {
    if (!img) return;
    img.src = '';
    img.classList.add('hidden'); // hide the <img>
  });
  initialsEls.forEach((el) => { if (el) el.classList.remove('hidden'); }); // show text initials back

  if (avatarRemoveBtn) avatarRemoveBtn.classList.add('hidden');
  if (avatarUploadHint) avatarUploadHint.textContent = 'Tap 📷 to set a photo';
}

/**
 * Master avatar sync function.  Call this any time the identity
 * changes.  It sets the gradient background on every circle,
 * updates the initials text, and re-applies a saved photo if one
 * exists in localStorage.
 */
function applyAvatar(publicKey) {
  const gradient = generateAvatarColor(publicKey);
  const initials  = getAvatarInitials(publicKey);
  const alias     = extractAliasFromKey(publicKey);

  // Update every avatar circle's background gradient
  const circles     = [sidebarAvatar, topbarAvatar, mobileNavAvatar, profileDrawerAvatar];
  const initialsEls = [sidebarAvatarInitials, topbarAvatarInitials, mobileNavAvatarInitials, profileDrawerAvatarInitials];

  circles.forEach((el) => { if (el) el.style.background = gradient; });
  initialsEls.forEach((el) => {
    if (el) {
      el.textContent = initials;
      el.classList.remove('hidden');
    }
  });

  // Re-apply uploaded photo if one was saved (it overlays the gradient)
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

/**
 * Reads an image File, shrinks it to fit within 256×256, encodes it
 * as JPEG at 88% quality, saves to localStorage, and updates all avatars.
 * We cap size to 256×256 because localStorage has a 5 MB quota.
 */
function resizeAndStorePhoto(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Never upscale — Math.min(…, 1) clamps scale factor to ≤1
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

/**
 * Writes all four identity values to localStorage.
 * The device ID is only generated once — if one already exists we
 * reuse it so the device's identity stays stable across logins.
 */
function saveIdentityToStorage(publicKey, privateKey, identityKey) {
  const existingDeviceId = localStorage.getItem(DEVICE_STORAGE_KEY) || generateDeviceId();
  localStorage.setItem(DEVICE_STORAGE_KEY, existingDeviceId);
  localStorage.setItem(PUBLIC_STORAGE_KEY, publicKey);
  localStorage.setItem(PRIVATE_STORAGE_KEY, privateKey);
  localStorage.setItem(IDENTITY_STORAGE_KEY, identityKey);
}

/**
 * Populates every identity-dependent element in the app with the
 * supplied keys, then applies the avatar.  Called after login or
 * identity restore.
 */
function loadAppWithKeys(publicKey, privateKey) {
  const identityKey = generateIdentityKey(publicKey, privateKey);
  if (accountPublicKey) accountPublicKey.textContent = publicKey;
  if (ghostIdValue) ghostIdValue.textContent = `Ghost ID: ${publicKey}`;
  if (identityKeyValue) identityKeyValue.textContent = identityKey;
  if (securityIdentityKey) securityIdentityKey.textContent = identityKey;
  applyAvatar(publicKey);

  // Populate separate public / private key rows in profile drawer
  const profilePubEl = document.getElementById('profilePubKeyDisplay');
  const profilePrivEl = document.getElementById('profilePrivKeyDisplay');
  if (profilePubEl) profilePubEl.textContent = publicKey;
  if (profilePrivEl) {
    profilePrivEl.textContent = '••••••••••••••';
    profilePrivEl.dataset.real = privateKey;
    profilePrivEl.classList.remove('revealed');
  }
}

// ─── 9. VIEW MANAGEMENT ──────────────────────────────────────

/**
 * Hides the landing page and login overlay; shows the app shell.
 * Called once the user has confirmed their identity.
 */
function showAppScreen() {
  // Hide all top-level <section> tags except #appShell
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
  document.body.classList.remove('no-scroll'); // restore scrolling (was locked during overlay)
  switchAppView('chat'); // always start in the chat view
  renderChatList();
}

// ─── 10. CHAT LIST & DETAIL ──────────────────────────────────

/**
 * Returns the subset of chatData that matches the active filter
 * (all / unread / requests) AND the current search query.
 */
function getChatList() {
  return chatData.filter((chat) => {
    if (activeFilter === 'unread' && chat.unread <= 0) return false;
    if (activeFilter === 'requests' && chat.category !== 'request') return false;
    const query = chatSearchQuery.trim().toLowerCase();
    if (!query) return true;
    // Search across contact name, public key, and last message preview
    return [chat.name, chat.publicKey, chat.lastMessage].some((value) =>
      value.toLowerCase().includes(query)
    );
  });
}

/**
 * Opens a conversation and shows the chat detail panel.
 * On narrow screens (< 980 px) the chat list slides out of view;
 * on wide screens both list and detail panel are visible side-by-side.
 */
function openChatDetail(chatId) {
  activeChatId = chatId;
  renderChatDetail();

  // Reveal the compose bar now that a chat is open
  if (messageInputArea) {
    messageInputArea.classList.remove('hidden');
    messageInputArea.classList.remove('compact');
    messageInputArea.removeAttribute('data-mode');
  }

  if (window.innerWidth < 980) {
    // Mobile: slide the detail panel in and hide the list behind it
    chatDetailPanel?.classList.add('show');
    chatListElement?.classList.add('hidden');
  } else {
    // Desktop: simply unhide the detail panel
    chatDetailPanel?.classList.remove('hidden');
  }
}

/** Closes the chat detail panel and returns to the list (mobile only). */
function closeChatDetail() {
  if (window.innerWidth < 980) {
    chatDetailPanel?.classList.remove('show');
    chatListElement?.classList.remove('hidden');
  } else {
    chatDetailPanel?.classList.add('hidden');
  }
}

/**
 * Builds the chat list HTML from filteredChats and injects it into
 * #chatList.  Unread-badge numbers are shown as coloured chips.
 * Attaches click listeners to open each conversation.
 * Also auto-opens the first chat on desktop if nothing is active.
 */
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

// ─── 11. APP VIEW SWITCHING ──────────────────────────────────

/**
 * Shows the requested view panel and hides all others.
 * Updates the active-state highlight on both sidebar icons and
 * the mobile bottom-nav buttons.
 *
 * @param {string} view - One of 'chat' | 'ghosttime' | 'terminal' | 'account'
 */
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

// ─── 12. GHOSTTIME (SOCIAL FEED) ─────────────────────────────

/**
 * Renders the GhostTime post cards into #gtPostList.
 * Each card shows the publisher, post preview, and a "View" button
 * that opens the full post detail in the chat-detail panel.
 */
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

/** Re-renders the comment list for a given post into its #gtComments-{id} container. */
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

/**
 * Opens the full-detail view of a GhostTime post inside the chat
 * detail panel.  Increments the view counter, renders comments,
 * wires the like / comment toggle buttons, and shows "More from
 * <publisher>" cards at the bottom.
 * Note: the outer .message-input-area is hidden here — GhostTime
 * uses inline comment boxes instead.
 */
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

/**
 * Reads the GhostTime compose textarea, creates a new post object,
 * prepends it to the gtPosts array, clears the textarea, and
 * refreshes the post feed.  The publisher name is derived from the
 * logged-in user's public key alias.
 */
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

// ─── 13. SEARCH & CONTACTS ───────────────────────────────────

/** Updates the search query state and re-renders the filtered chat list. */
function handleSearchInput(event) {
  chatSearchQuery = event.target.value || '';
  renderChatList();
}

/**
 * Prompts the user for a friend's public key or name, synthesises a
 * chat entry, adds it as a contact request, and switches to the
 * Requests filter so the new entry is visible immediately.
 */
function handleAddFriend() {
  const input = prompt('Add a friend by public key or name:');
  if (!input) return;
  // Accept a raw "#ghost-…" key or turn a plain name into a placeholder key
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

// ─── 14. MESSAGING ───────────────────────────────────────────

/**
 * Sends the message currently typed in the compose bar.
 * Appends it to the active chat's message array (client-side only),
 * updates the lastMessage preview in the list, clears the input,
 * and re-renders both the detail and the list panel.
 */
function handleSendMessage() {
  if (!messageInput) return;
  const text = messageInput.value.trim();
  if (!text) return;
  if (!activeChatId) return;
  const chat = chatData.find((item) => item.id === activeChatId);
  if (!chat) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  chat.messages.push({ sender: 'me', text, time }); // add to in-memory array
  chat.lastMessage = text;                           // update list preview
  chat.time = 'Now';
  messageInput.value = '';
  renderChatDetail();
  renderChatList();
}

// ─── 15. APP INITIALISATION ──────────────────────────────────

/**
 * Checks localStorage for an existing identity on page load.
 * If keys are found the user is taken directly into the app
 * without seeing the login overlay again.
 */
function initializeApp() {
  const storedDeviceId  = localStorage.getItem(DEVICE_STORAGE_KEY);
  const storedPublicKey = localStorage.getItem(PUBLIC_STORAGE_KEY);
  const storedPrivateKey = localStorage.getItem(PRIVATE_STORAGE_KEY);

  // All three must exist for the session to be considered valid
  if (storedDeviceId && storedPublicKey && storedPrivateKey) {
    loadAppWithKeys(storedPublicKey, storedPrivateKey);
    showAppScreen();
  }
}

// ─── 16. LOGIN OVERLAY ───────────────────────────────────────

/**
 * Opens the identity/login overlay, generates fresh key proposals,
 * and locks the page scroll behind the modal.
 */
function showLoginOverlay() {
  if (!loginOverlay) return;
  updateLoginKeys(); // generates new public/private/identity keys and populates the UI
  loginOverlay.classList.add('active');
  loginOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll'); // prevent background scroll
}

/**
 * Handles the "Use existing identity" flow.
 * Parses the pasted identity string, saves keys, and enters the app.
 */
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

// ─── 17. CLIPBOARD HELPER ────────────────────────────────────

/**
 * Copies text to the system clipboard using the Clipboard API.
 * Falls back to an alert if the API is unavailable (non-HTTPS).
 */
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

// ── Login overlay: public key copy ───────────────────────────
const copyLoginPubKey = document.getElementById('copyLoginPubKey');
if (copyLoginPubKey) {
  copyLoginPubKey.addEventListener('click', () => {
    const el = document.getElementById('loginPublicKeyDisplay');
    if (el) copyText(el.textContent || '');
  });
}

// ── Login overlay: private key reveal + copy ─────────────────
const toggleLoginPrivKey = document.getElementById('toggleLoginPrivKey');
if (toggleLoginPrivKey) {
  toggleLoginPrivKey.addEventListener('click', () => {
    const el = document.getElementById('loginPrivateKeyDisplay');
    if (!el) return;
    const isHidden = el.textContent.startsWith('•');
    if (isHidden) {
      el.textContent = el.dataset.real || '';
      el.classList.remove('key-value--hidden');
      toggleLoginPrivKey.textContent = 'Hide';
    } else {
      el.textContent = '••••••••••••••••';
      el.classList.add('key-value--hidden');
      toggleLoginPrivKey.textContent = 'Show';
    }
  });
}

const copyLoginPrivKey = document.getElementById('copyLoginPrivKey');
if (copyLoginPrivKey) {
  copyLoginPrivKey.addEventListener('click', () => {
    const el = document.getElementById('loginPrivateKeyDisplay');
    if (el) copyText(el.dataset.real || '');
  });
}

// ── Profile drawer: pub key copy ─────────────────────────────
const profilePubKeyCopy = document.getElementById('profilePubKeyCopy');
if (profilePubKeyCopy) {
  profilePubKeyCopy.addEventListener('click', () => {
    const el = document.getElementById('profilePubKeyDisplay');
    if (el) copyText(el.textContent || '');
  });
}

// ── Profile drawer: private key reveal + copy ────────────────
const profilePrivKeyToggle = document.getElementById('profilePrivKeyToggle');
if (profilePrivKeyToggle) {
  let privRevealed = false;
  profilePrivKeyToggle.addEventListener('click', () => {
    const el = document.getElementById('profilePrivKeyDisplay');
    if (!el) return;
    privRevealed = !privRevealed;
    el.textContent = privRevealed ? (el.dataset.real || '') : '••••••••••••••';
    el.classList.toggle('revealed', privRevealed);
  });
}

const profilePrivKeyCopy = document.getElementById('profilePrivKeyCopy');
if (profilePrivKeyCopy) {
  profilePrivKeyCopy.addEventListener('click', () => {
    const el = document.getElementById('profilePrivKeyDisplay');
    if (el) copyText(el.dataset.real || '');
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

// ─── 18. TERMINAL / @GHOST ROOT SYSTEM ──────────────────────
// The terminal view exposes two command sets:
//   • Standard: "ghost <cmd>" — routed to the FastAPI backend
//   • Root:     "@ghost <cmd>" — privileged; require alias auth first
//
// Root authentication flow:
//   1. User types "@ghost <cmd>"
//   2. Terminal switches input to password mode, asks for the alias
//   3. verifyRootAlias() compares input against extractAliasFromKey(storedPublicKey)
//   4. On success, terminalRootAuthenticated = true and the original command is dispatched
//   5. The flag persists for the current page session (cleared on "ghost clear")
//
// BLD mode: a fullscreen overlay on the terminal activated by "@ghost bld".
// It adds the class "terminal-bld-active" to <body> and shows a sticky banner.

/** Persistent terminal state (lives for the duration of the page session). */
let terminalRootAuthenticated = false; // true once alias auth passes
let terminalAwaitingAlias     = false; // true while waiting for alias input
let terminalPendingCmd        = null;  // the @ghost command stored during auth
let terminalBldMode           = false; // true when BLD fullscreen is active
let terminalLastRecipient     = null;  // public key of the last @ghost send target

/**
 * Masks all but the last 3 chars of a private key for display.
 * e.g. "@Ghost-aB3xYzQ" → "@Ghost-●●●YzQ"
 */
function maskPrivateKey(pk) {
  if (!pk) return '@Ghost-●●●●●●●';
  const raw = pk.replace('@Ghost-', '');
  return `@Ghost-●●●${raw.slice(-3)}`;
}

/**
 * Appends a single line to the terminal output element.
 * @param {string} text  - The line text to show.
 * @param {string} type  - CSS modifier class: 'output'|'command'|'root'|'error'|'warn'|'success'
 */
function appendTerminalLine(text, type = 'output') {
  if (!terminalOutput) return;
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight; // auto-scroll to bottom
}

/** Appends multiple output lines from an array (e.g. a server response). */
function appendTerminalLines(lines) {
  lines.forEach((line) => appendTerminalLine(line, 'output'));
}

/**
 * Renders a styled message bubble in the terminal (sent or received).
 * If direction is 'sent', a simulated reply arrives after ~2 s.
 *
 * @param {'sent'|'recv'} direction
 * @param {string} senderLabel - Display name (alias) of the remote party
 * @param {string} senderKey   - Masked public/private key for the meta row
 * @param {string} text        - The message body
 * @param {string} time        - Formatted time string (HH:MM)
 */
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

/**
 * Activates or deactivates BLD (BlackLight Display) fullscreen mode.
 * When on=true: adds 'terminal-bld-active' to <body>, shows the BLD
 * banner and exit button, and auto-switches to the terminal view.
 * When on=false: reverses all of the above.
 */
function setBldMode(on) {
  terminalBldMode = on;
  const termPanel = document.querySelector('.terminal-panel');
  const bldBanner = document.getElementById('bldBanner');
  const bldExitBtn = document.getElementById('bldExitBtn');
  if (on) {
    document.body.classList.add('terminal-bld-active'); // CSS makes terminal cover full viewport
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

/**
 * Begins the alias-authentication challenge for a root @ghost command.
 * Stores the pending command string, switches the input to password type
 * (so the alias is not visible on screen), and prompts the user.
 */
function initiateRootAuth(cmd) {
  terminalAwaitingAlias = true;
  terminalPendingCmd = cmd;
  if (terminalInput) {
    terminalInput.type = 'password';    // hide alias as it is typed
    terminalInput.placeholder = 'enter your alias…';
  }
  appendTerminalLine('', 'output');
  appendTerminalLine('  ⚡ ROOT REQUIRED — @ghost command detected', 'warn');
  appendTerminalLine('  Enter your alias (codename) to authenticate:', 'output');
  appendTerminalLine('  Tip: your alias is the codename in your Ghost ID.', 'output');
}

/**
 * Validates the alias typed by the user against the alias extracted
 * from the stored public key.  On success, sets terminalRootAuthenticated
 * and dispatches the stored pending command.  On failure, clears the queue.
 */
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

/**
 * Dispatches an authenticated @ghost root command.
 * Handles the "bld exit" shortcut on the frontend, then routes
 * everything else to the backend.  Interprets special status codes
 * returned by the API (bld_active, bld_exit, send_msg) and renders
 * them appropriately in the terminal output.
 *
 * @param {string} raw - The full raw command string the user typed.
 */
async function dispatchAtGhostCommand(raw) {
  const storedPriv = localStorage.getItem(PRIVATE_STORAGE_KEY) || '';
  const maskedKey = maskPrivateKey(storedPriv);
  const publicId = localStorage.getItem(PUBLIC_STORAGE_KEY) || '';

  // ── BLD exit (frontend-only shortcut, no API call needed) ─
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

/**
 * POSTs a terminal command to the FastAPI backend at /api/terminal.
 * Returns the parsed JSON response, or null on failure (error is printed).
 *
 * Request body: { command: string, public_id?: string }
 * Response: { status: string, output: string[], clear?: bool, extra?: object }
 */
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

// ─── 19. PROFILE DRAWER ──────────────────────────────────────
// The profile drawer slides in from the right edge of the screen.
// It shows the user's alias, public key, private key (masked), and
// a combined identity key (masked).  The user can reveal, copy, or
// change their avatar photo from here.

/**
 * Opens the profile drawer.  Re-reads identity from localStorage so
 * the display is always up-to-date even if keys were refreshed.
 * The identity key starts masked (••••) and is only revealed on demand.
 */
function openProfileDrawer() {
  if (!profileDrawer || !profileDrawerOverlay) return;

  // Always pull fresh from storage so the display reflects any changes
  const storedIdentity = localStorage.getItem(IDENTITY_STORAGE_KEY) || '';
  profileKeyRevealed = false;
  if (profileIdentityDisplay) {
    profileIdentityDisplay.textContent = '••••••••••••••••••••'; // masked by default
    profileIdentityDisplay.classList.remove('revealed');
    profileIdentityDisplay.dataset.full = storedIdentity;       // stash real value in data attr
  }

  profileDrawerOverlay.classList.add('open');
  profileDrawerOverlay.setAttribute('aria-hidden', 'false');
  profileDrawer.classList.add('open');
  document.body.style.overflow = 'hidden'; // lock scroll while drawer is open
}

/** Closes the profile drawer and restores page scrolling. */
function closeProfileDrawer() {
  if (!profileDrawer || !profileDrawerOverlay) return;
  profileDrawer.classList.remove('open');
  profileDrawerOverlay.classList.remove('open');
  profileDrawerOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // restore scroll
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

// ─── 20. AVATAR UPLOAD / REMOVE ──────────────────────────────
// The hidden <input type="file"> is triggered programmatically by
// the camera button.  After selection we resize + store the image.

avatarUploadBtn?.addEventListener('click', () => {
  avatarFileInput?.click(); // open the native file picker
});

avatarFileInput?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file (JPG, PNG, GIF, WebP…).');
    return;
  }
  resizeAndStorePhoto(file);
  avatarFileInput.value = ''; // reset so the same file can be re-selected
});

avatarRemoveBtn?.addEventListener('click', () => {
  localStorage.removeItem(AVATAR_PHOTO_KEY); // clear from storage
  clearPhotoFromAllAvatars();                // revert to initials
});

// ─── 21. GLOBAL KEYBOARD SHORTCUTS ───────────────────────────
// Escape closes the profile drawer or notification dropdown.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (profileDrawer?.classList.contains('open')) closeProfileDrawer();
    if (notifOpen) closeNotifDropdown();
  }
});

// ─── 22. NAV LINKS → SECTION SCROLL ─────────────────────────
/**
 * Scrolls to a landing-page section by ID.
 * If the app shell is currently visible, hides it first and
 * restores the landing page sections, then smooth-scrolls.
 */
function navigateToSection(sectionId) {
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

// ─── 23. NOTIFICATIONS ───────────────────────────────────────
// The notification bell shows a badge count of unread items.
// Clicking opens a dropdown list; each item marks itself read on click.

/**
 * Updates the badge number on the notification bell icon.
 * Hides the badge entirely when all notifications are read.
 */
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

/** Renders all notification items into the #notifList element. */
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

// ─── 24. ACTIVE NAV LINK ON SCROLL ───────────────────────────
// As the user scrolls the landing page, we highlight the nav link
// that corresponds to the section currently in view.
const landingSections = ['home', 'features', 'architecture', 'security', 'contact'];

/** Determines which landing section is in view and marks its nav link active. */
function updateActiveNavLink() {
  const scrollY = window.scrollY + 100; // +100 px offset so the link activates slightly before the section top
  let current = 'home';
  landingSections.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  });
  document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}
window.addEventListener('scroll', updateActiveNavLink, { passive: true }); // passive = no janky scroll

// ─── 25. STARTUP ─────────────────────────────────────────────
// DOMContentLoaded fires once the HTML is fully parsed.
// We update the notification badge and run initializeApp() which
// checks localStorage — if keys exist, the user goes straight into
// the app; otherwise the landing page is shown.
window.addEventListener('DOMContentLoaded', () => {
  updateBadge();
  updateActiveNavLink();
  initializeApp();
});
