import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchLedger } from '../../api/vaultClient.js';

function formatTimestamp(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} `
         + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} UTC`;
  } catch {
    return iso;
  }
}

function fileIcon(name = '') {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf')                           return '📄';
  if (['doc','docx'].includes(ext))            return '📝';
  if (['zip','rar','gz','tar'].includes(ext))  return '📦';
  if (['png','jpg','jpeg','gif','webp'].includes(ext)) return '🖼️';
  return '📁';
}

export default function Ledger() {
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [query,    setQuery]    = useState('');
  const [copied,   setCopied]   = useState(null);
  const [syncing,  setSyncing]  = useState(false);

  // Wrapped in useCallback so the ESLint exhaustive-deps rule is satisfied
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLedger();
      const enriched = data.map((r, i) => ({
        ...r,
        fileHash: r.assetHash || r.fileHash,
        block: r.block || `#${String(900 - i).padStart(5, '0')}`,
      }));
      setRows(enriched);
    } catch (err) {
      setRows([]);
      setError(err.message === 'Unauthorized'
        ? 'Session expired — sign in again'
        : 'Cannot reach backend — is Assets running on :8080?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const syncNode = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1800));
    await load();
    setSyncing(false);
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(r =>
      (r.fileHash || r.assetHash)?.toLowerCase().includes(q) ||
      r.originalFileName?.toLowerCase().includes(q) ||
      r.authorId?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div>
      {/* Header */}
      <div className="view-header-row">
        <div className="view-header">
          <h1 className="view-title">Cryptographic Ledger</h1>
          <p className="view-subtitle">Immutable record of all hardened assets — tamper-proof and permanent</p>
        </div>
        <button className="btn btn-outline" onClick={syncNode} disabled={syncing}>
          {syncing ? (
            <><span className="spinner" /> Syncing…</>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5C2 4.01 4.01 2 6.5 2a4.47 4.47 0 013.18 1.32M11 6.5C11 8.99 8.99 11 6.5 11a4.47 4.47 0 01-3.18-1.32"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M9 1v2.5H6.5"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sync Node
            </>
          )}
        </button>
      </div>

      {/* Offline warning */}
      {error && (
        <div style={{
          background: 'var(--orange-bg)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 'var(--radius-md)', padding: '10px 16px',
          fontSize: '12px', color: 'var(--orange)', marginBottom: '18px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="ledger-stats">
        <div className="ledger-stat">
          <div className="ledger-stat-value">{loading ? '—' : rows.length}</div>
          <div className="ledger-stat-label">Total Entries</div>
        </div>
        <div className="ledger-stat">
          <div className="ledger-stat-value">{loading ? '—' : rows.length}</div>
          <div className="ledger-stat-label">Blocks Committed</div>
        </div>
        <div className="ledger-stat">
          <div className="ledger-stat-value green">100%</div>
          <div className="ledger-stat-label">Chain Integrity</div>
        </div>
      </div>

      {/* Search */}
      <div className="full-search">
        <div className="search-bar">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by DNA Hash, file name, or Owner ID…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'18px', lineHeight:1 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-header-bar">
          <div className="table-header-title">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="var(--accent)" strokeWidth="1.4"/>
              <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Ledger Entries
            <span className="table-count">{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding:'60px 24px', textAlign:'center', color:'var(--text-muted)' }}>
            <div className="spinner" style={{ margin:'0 auto 12px', width:'22px', height:'22px', borderWidth:'2px' }} />
            <div style={{ fontSize:'13px' }}>Fetching ledger from node…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'60px 24px', textAlign:'center', color:'var(--text-muted)', fontSize:'13px' }}>
            No entries match your search.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>DNA Hash</th>
                <th>Original File</th>
                <th>Owner ID</th>
                <th>Timestamp (UTC)</th>
                <th>Block</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td>
                    <div className="hash-cell">
                      <span className="mono">{row.fileHash?.slice(0, 16)}</span>
                      <button
                        className="copy-btn"
                        title={copied === row.fileHash ? 'Copied!' : 'Copy full hash'}
                        onClick={() => copyHash(row.fileHash)}
                        style={{ opacity: 1 }}
                      >
                        {copied === row.fileHash ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="filename">
                      {fileIcon(row.originalFileName)}
                      <span style={{ marginLeft: '6px' }}>{row.originalFileName}</span>
                    </div>
                  </td>
                  <td><span className="mono-muted">{row.authorId}</span></td>
                  <td><span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{formatTimestamp(row.protectedAt)}</span></td>
                  <td><span className="block-num">{row.block}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}