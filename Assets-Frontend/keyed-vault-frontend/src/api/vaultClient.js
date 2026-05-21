import { apiFetch, parseModelResponse } from './httpClient.js';

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
  const res = await fetch(`${BASE}/ledger`);
  if (!res.ok) throw new Error(`Ledger fetch failed: ${res.status}`);
  return res.json();
}

export async function processAsset(file, authorId) {
  const form = new FormData();
  form.append('file', file);
  form.append('authorId', authorId);
  const res = await fetch(`${BASE}/process`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Process failed: ${res.status}`);
  return res.json();
}