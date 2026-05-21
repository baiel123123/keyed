const BASE = '/api/local';

/* ── Auth token helpers ──────────────────────────────────────────── */
export function getToken() {
  return localStorage.getItem('keyed_jwt')
      || sessionStorage.getItem('keyed_jwt')
      || null;
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ── Ledger ──────────────────────────────────────────────────────── */
export async function fetchLedger() {
  const res = await fetch(`${BASE}/ledger`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Ledger fetch failed: ${res.status}`);
  return res.json();
}

/* ── Process / Harden asset ─────────────────────────────────────── */
export async function processAsset(file, authorId) {
  const form = new FormData();
  form.append('file', file);
  form.append('authorId', authorId);

  const token = getToken();
  const res = await fetch(`${BASE}/process`, {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Process failed: ${res.status}`);
  return res.json();
}

/* ── File retrieval URL (used by Ledger preview & download) ─────── */
// Returns the URL to fetch a raw file by its SHA-256 hash.
// Backend should respond with the file bytes + correct Content-Type header.
// Expected endpoint: GET /api/local/file/{hash}
export function getFileUrl(hash) {
  return `${BASE}/file/${hash}`;
}
/* ── Authentication ──────────────────────────────────────────────── */

export async function login(email, password) {
  const res = await fetch('/api/auth/login', { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Login failed: ${res.status}`);
  }
  
  return res.json();
}

export async function fetchProfile() {
  const res = await fetch('/api/auth/profile', { // Убедитесь, что у вас именно такой URL для профиля
    headers: authHeaders(),
  });
  
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}