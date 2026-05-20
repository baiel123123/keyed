import React, { useState, useRef, useCallback } from 'react';
import { processAsset } from '../../api/vaultClient.js';

const AUTHOR_ID = 'USR-0xA3F7C2';

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { icon: '📄', cls: 'file-icon-pdf' };
  if (['doc','docx'].includes(ext)) return { icon: '📝', cls: 'file-icon-doc' };
  if (['zip','rar','gz'].includes(ext)) return { icon: '📦', cls: 'file-icon-zip' };
  return { icon: '📁', cls: 'file-icon-misc' };
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 ** 3)).toFixed(1) + ' GB';
  if (bytes >= 1024 * 1024) return (bytes / (1024 ** 2)).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

export default function ProtectAsset() {
  const [assets, setAssets] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const startProcessing = useCallback(async (file) => {
    const id = `${Date.now()}-${Math.random()}`;
    const entry = {
      id,
      name: file.name,
      size: formatSize(file.size),
      status: 'processing',
      hash: null,
    };

    setAssets(prev => [entry, ...prev]);

    try {
      const response = await processAsset(file, AUTHOR_ID);
      if (response.status === 'SUCCESS') {
        setAssets(prev =>
          prev.map(a => a.id === id ? { ...a, status: 'hardened', hash: response.hash } : a)
        );
        showToast(`Asset hardened: ${file.name}`, 'success');
      } else {
        throw new Error(response.message || 'Unknown error');
      }
    } catch (err) {
      setAssets(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'failed', hash: null } : a)
      );
      showToast(`Failed: ${err.message}`, 'error');
    }
  }, []);

  const handleFiles = useCallback((files) => {
    Array.from(files).forEach(f => startProcessing(f));
  }, [startProcessing]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const removeAsset = (id) =>
    setAssets(prev => prev.filter(a => a.id !== id));

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    showToast('Hash copied to clipboard', 'info');
  };

  return (
    <div>
      {/* Header */}
      <div className="view-header-row">
        <div className="view-header">
          <h1 className="view-title">Local Hardening Workspace</h1>
          <p className="view-subtitle">Upload and harden your digital assets with cryptographic DNA hashing</p>
        </div>
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Harden New Asset
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Drop Zone */}
      <div
        className={`drop-zone${dragging ? ' dragging' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="drop-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 15V4M7 8l4-4 4 4" stroke="#7c6cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" stroke="#7c6cf8" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="drop-title">Drop files here or click to upload</div>
        <div className="drop-sub">Supports all file types — up to 5 GB per asset</div>
      </div>

      {/* Assets Table */}
      <div className="table-wrapper">
        <div className="table-header-bar">
          <div className="table-header-title">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L2 4v4c0 3 2.5 5.5 6 6 3.5-.5 6-3 6-6V4L8 1.5z" stroke="var(--accent)" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            Hardened Assets
            <span className="table-count">{assets.length}</span>
          </div>
        </div>

        {assets.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No assets hardened yet. Drop files above to get started.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Asset Name</th>
                <th>DNA Hash</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => {
                const fi = fileIcon(asset.name);
                return (
                  <tr key={asset.id}>
                    {/* Status */}
                    <td>
                      {asset.status === 'hardened' && (
                        <span className="badge badge-green">
                          <span className="badge-dot" />
                          Hardened
                        </span>
                      )}
                      {asset.status === 'processing' && (
                        <span className="badge badge-orange">
                          <span className="spinner" style={{ width: '8px', height: '8px', borderWidth: '1.5px' }} />
                          Processing
                        </span>
                      )}
                      {asset.status === 'failed' && (
                        <span className="badge badge-red">
                          <span className="badge-dot" />
                          Failed
                        </span>
                      )}
                    </td>

                    {/* Asset Name */}
                    <td>
                      <div className="filename">
                        <span className={`file-icon ${fi.cls}`}>{fi.icon}</span>
                        {asset.name}
                      </div>
                    </td>

                    {/* DNA Hash */}
                    <td>
                      {asset.status === 'hardened' && asset.hash ? (
                        <div className="hash-cell">
                          <span className="mono">{asset.hash.slice(0, 36)}…</span>
                          <button className="copy-btn" title="Copy hash" onClick={() => copyHash(asset.hash)}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2"/>
                            </svg>
                          </button>
                        </div>
                      ) : asset.status === 'processing' ? (
                        <span className="mono-muted">Computing…</span>
                      ) : (
                        <span style={{ color: 'var(--red)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Size */}
                    <td>
                      <span className="mono-muted">{asset.size}</span>
                    </td>

                    {/* Action */}
                    <td>
                      <button
                        onClick={() => removeAsset(asset.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: '2px 6px', borderRadius: '4px', transition: 'var(--transition)' }}
                        onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && '✅'}
            {toast.type === 'error'   && '❌'}
            {toast.type === 'info'    && 'ℹ️'}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}