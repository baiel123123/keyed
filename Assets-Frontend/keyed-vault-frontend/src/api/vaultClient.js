const BASE = '/api/local';

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