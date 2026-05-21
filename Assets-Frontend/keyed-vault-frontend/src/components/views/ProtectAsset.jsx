import React, { useState, useRef, useCallback } from 'react';
import { processAsset } from '../../api/vaultClient.js';

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { icon: '📄', cls: 'file-icon-pdf' };
  if (['doc', 'docx'].includes(ext)) return { icon: '📝', cls: 'file-icon-doc' };
  if (['zip', 'rar', 'gz'].includes(ext)) return { icon: '📦', cls: 'file-icon-zip' };
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
      const response = await processAsset(file);
      setAssets(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'hardened', hash: response.hash } : a)
      );
      showToast(response.message || `Asset hardened: ${file.name}`, 'success');
    } catch (err) {
      setAssets(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'failed', hash: null } : a)
      );
      showToast(err.message || 'Upload failed', 'error');
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
      <div className="view-header-row">
        <div className="view-header">
          <h1 className="view-title">Local Hardening Workspace</h1>
          <p className="view-subtitle">Upload and harden your digital assets with cryptographic DNA hashing</p>
        </div>
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
          Harden New Asset
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      <div
        className={`drop-zone${dragging ? ' dragging' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="drop-title">Drop files here or click to upload</div>
        <div className="drop-sub">Supports images, video, PDF and more — up to 50 MB</div>
      </div>

      <div className="table-wrapper">
        <div className="table-header-bar">
          <div className="table-header-title">
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
                    <td>
                      {asset.status === 'hardened' && (
                        <span className="badge badge-green">Hardened</span>
                      )}
                      {asset.status === 'processing' && (
                        <span className="badge badge-orange">Processing</span>
                      )}
                      {asset.status === 'failed' && (
                        <span className="badge badge-red">Failed</span>
                      )}
                    </td>
                    <td>
                      <div className="filename">
                        <span className={`file-icon ${fi.cls}`}>{fi.icon}</span>
                        {asset.name}
                      </div>
                    </td>
                    <td>
                      {asset.hash ? (
                        <div className="hash-cell">
                          <span className="mono">{asset.hash}</span>
                          <button className="copy-btn" type="button" onClick={() => copyHash(asset.hash)}>Copy</button>
                        </div>
                      ) : (
                        <span className="mono-muted">—</span>
                      )}
                    </td>
                    <td><span className="mono-muted">{asset.size}</span></td>
                    <td>
                      <button type="button" onClick={() => removeAsset(asset.id)}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}
