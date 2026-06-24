// Shared utilities and state management
const API_BASE = '/api';

// ─── Auth State ───
const Auth = {
  getToken: () => localStorage.getItem('styleai_token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('styleai_user')); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem('styleai_token'),
  setSession: (token, user) => {
    localStorage.setItem('styleai_token', token);
    localStorage.setItem('styleai_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('styleai_token');
    localStorage.removeItem('styleai_user');
  },
  headers: () => {
    const token = localStorage.getItem('styleai_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }
};

// ─── API Client ───
const API = {
  async post(endpoint, data, multipart = false) {
    const opts = {
      method: 'POST',
      headers: multipart ? { 'Authorization': `Bearer ${Auth.getToken() || ''}` } : Auth.headers(),
      body: multipart ? data : JSON.stringify(data)
    };
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
    return json;
  },
  async get(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, { headers: Auth.headers() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed');
    return json;
  }
};

// ─── Toast Notifications ───
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '💡'}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Navbar Logic ───
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
    mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  updateNavAuth();
}

function updateNavAuth() {
  const user = Auth.getUser();
  const authLinks = document.querySelectorAll('.nav-auth-link');
  const userLinks = document.querySelectorAll('.nav-user-link');
  const userNames = document.querySelectorAll('.nav-username');

  authLinks.forEach(el => el.classList.toggle('hidden', Auth.isLoggedIn()));
  userLinks.forEach(el => el.classList.toggle('hidden', !Auth.isLoggedIn()));
  userNames.forEach(el => { if (user) el.textContent = user.name.split(' ')[0]; });
}

// ─── Intersection Observer for animations ───
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${el.dataset.delay ? el.dataset.delay * 0.1 : 0}s, transform 0.5s ease ${el.dataset.delay ? el.dataset.delay * 0.1 : 0}s`;
    observer.observe(el);
  });
}

// ─── Loading Overlay ───
function showLoading(text = 'Thinking...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="spinner"></div>
      <p id="loading-text">${text}</p>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('loading-text').textContent = text;
    overlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ─── Logout ───
function logout() {
  Auth.clearSession();
  showToast('Logged out successfully', 'success');
  setTimeout(() => window.location.href = 'index.html', 500);
}

// ─── Save item shortcut ───
async function saveItem(item, btn) {
  if (!Auth.isLoggedIn()) {
    showToast('Sign in to save items to your wardrobe', 'info');
    setTimeout(() => window.location.href = 'account.html', 1500);
    return;
  }
  try {
    btn.disabled = true;
    const result = await API.post('/user/save-item', { item });
    btn.textContent = result.saved ? '❤️ Saved' : '🤍 Save';
    showToast(result.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

// ─── Color swatch renderer ───
function renderColorSwatches(colors) {
  if (!colors?.length) return '';
  return `<div class="color-swatch">${colors.map(c => `<div class="color-dot" style="background:${c}" title="${c}"></div>`).join('')}</div>`;
}

// ─── Stars renderer ───
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return `<span class="stars">${'★'.repeat(full)}${half ? '½' : ''}${'☆'.repeat(empty)}</span>`;
}

// ─── Store results in sessionStorage for results page ───
function storeResults(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

function getResults(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}

// ─── Demo Mode Banner ───
async function checkDemoMode() {
  try {
    const data = await API.get('/demo/status');
    if (!data.hasApiKey) {
      const banner = document.createElement('div');
      banner.id = 'demo-banner';
      banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9998;background:linear-gradient(90deg,#f59e0b,#d97706);color:#0a0a00;padding:10px 20px;text-align:center;font-size:0.85rem;font-weight:600;display:flex;align-items:center;justify-content:center;gap:12px;';
      banner.innerHTML = `
        <span>🎭 Demo Mode — Add your <code style="background:rgba(0,0,0,0.15);padding:2px 6px;border-radius:4px;">ANTHROPIC_API_KEY</code> to .env for live AI</span>
        <button onclick="document.getElementById('demo-banner').remove()" style="background:rgba(0,0,0,0.2);border:none;color:inherit;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:700;">✕</button>
      `;
      document.body.appendChild(banner);
      // shift toast container above banner
      const toastEl = document.getElementById('toast-container');
      if (toastEl) toastEl.style.bottom = '52px';
    }
  } catch {}
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAnimations();
  checkDemoMode();
});

window.Auth = Auth;
window.API = API;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.logout = logout;
window.saveItem = saveItem;
window.renderColorSwatches = renderColorSwatches;
window.renderStars = renderStars;
window.storeResults = storeResults;
window.getResults = getResults;
