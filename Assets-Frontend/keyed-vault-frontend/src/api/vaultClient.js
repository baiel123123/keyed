import { apiFetch, parseModelResponse } from './httpClient.js';

const BASE = '/api/local';

export async function fetchLedger() {
  const res = await apiFetch(`${BASE}/ledger`);
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    throw new Error(`Ledger fetch failed: ${res.status}`);
  }
  return res.json();
}

export async function processAsset(file) {
  const form = new FormData();
  form.append('file', file);

  const res = await apiFetch(`${BASE}/process`, { method: 'POST', body: form });
  const data = await parseModelResponse(res);
  const asset = data.payload || {};
  return {
    success: true,
    hash: asset.assetHash,
    message: data.message,
    asset,
  };
}

export async function login(email, password) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseModelResponse(res);
}

export async function register({ email, password, displayName }) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  });
  return parseModelResponse(res);
}

export async function fetchProfile() {
  const res = await apiFetch('/api/auth/me');
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Profile fetch failed: ${res.status}`);
  }
  return res.json();
}
