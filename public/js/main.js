// ---- Dark mode ----
function initTheme() {
  const saved = localStorage.getItem('exam_theme');
  const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeButton(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('exam_theme', next);
  updateThemeButton(next);
}

function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀ Light' : '● Dark';
}

// ---- Level name -> CSS class slug (e.g. "Level 1" -> "level-1") ----
function levelSlug(level) {
  if (!level) return '';
  return level.toLowerCase().replace(/\s+/g, '-');
}

// ---- Device ID (persists per-browser, used for the device-lock rule) ----
function getDeviceId() {
  let id = localStorage.getItem('exam_device_id');
  if (!id) {
    id = 'dev_' + crypto.randomUUID();
    localStorage.setItem('exam_device_id', id);
  }
  return id;
}

// ---- API helper ----
async function apiCall(path, options = {}) {
  const res = await fetch('/api/' + path, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Something went wrong.');
    err.code = data.error;
    err.status = res.status;
    throw err;
  }
  return data;
}

document.addEventListener('DOMContentLoaded', initTheme);
