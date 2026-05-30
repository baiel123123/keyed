import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { processAsset } from '../../api/vaultClient.js';
import { useToast } from '../ui/ToastContainer.jsx';
import AssetModal from '../ui/AssetModal.jsx';

function fileIcon(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf')                                    return { icon: '📄', cls: 'file-icon-pdf'  };
  if (['doc','docx'].includes(ext))                     return { icon: '📝', cls: 'file-icon-doc'  };
  if (['zip','rar','gz'].includes(ext))                 return { icon: '📦', cls: 'file-icon-zip'  };
  if (['png','jpg','jpeg','gif','webp'].includes(ext))  return { icon: '🖼️', cls: 'file-icon-img'  };
  if (['mp4','mov','avi','mkv'].includes(ext))          return { icon: '🎬', cls: 'file-icon-vid'  };
  if (['py','js','java','ts','go','rs'].includes(ext))  return { icon: '💻', cls: 'file-icon-code' };
  return                                                { icon: '📁', cls: 'file-icon-misc' };
}

function formatSize(bytes) {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + ' GB';
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + ' MB';
  if (bytes >= 1024)      return (bytes / 1024).toFixed(0)      + ' KB';
  return bytes + ' B';
}

const STATUS_META = {
  processing: { label: 'Processing', dot: 'dot-orange', canClick: false },
  hardened:   { label: 'Hardened',   dot: 'dot-green',  canClick: true  },
  failed:     { label: 'Failed',     dot: 'dot-red',    canClick: false },
};

export default function ProtectAsset() {
  const { user } = useAuth();
  const AUTHOR_ID = user?.ownerId ?? user?.username ?? 'USR-UNKNOWN';
  const toast = useToast();

  const [assets, setAssets] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [modal, setModal] = useState(null);
  const fileInputRef = useRef(null);

  const startProcessing = useCallback(async (file) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAssets(prev => [...prev, {
      id, name: file.name, size: formatSize(file.size),
      status: 'processing', hash: null,
    }]);

    try {
      const data = await processAsset(file, AUTHOR_ID);

      // Извлекаем хэш в зависимости от структуры ответа бэкенда
      const hash = data.payload?.assetHash || data.payload?.fileHash || null;

      if (hash) {
        setAssets(prev =>
            prev.map(a => a.id === id ? { ...a, status: 'hardened', hash } : a)
        );
        toast.success(`Asset hardened: ${file.name}`);
      } else {
        throw new Error(data.message || 'Processing failed');
      }
    } catch (err) {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'failed' } : a));

      const msg = err.message || 'Unknown error';
      if (msg.toLowerCase().includes('identical') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
        toast.error(`Duplicate detected: ${file.name}`);
      } else {
        toast.error(`Failed: ${msg}`);
      }
      console.error('Processing Error:', err);
    }
  }, [AUTHOR_ID, toast]);

  const handleFiles = useCallback((files) => {
    Array.from(files).forEach(f => startProcessing(f));
  }, [startProcessing]);

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const removeAsset = (id) => setAssets(prev => prev.filter(a => a.id !== id));
  const openModal = (asset) => { if (asset.status === 'hardened') setModal(asset); };

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

        <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
        />

        {/* Drop Zone */}
        <div
            className={`drop-zone ${dragging ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
          <div className="drop-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 18V6M9 11l5-5 5 5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 22v1.5A2.5 2.5 0 006.5 26h15a2.5 2.5 0 002.5-2.5V22" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
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
              <div style={{ padding:'48px 24px', textAlign:'center', color:'var(--text-muted)', fontSize:'13px' }}>
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
                  const meta = STATUS_META[asset.status] || STATUS_META.processing;
                  const fi = fileIcon(asset.name);
                  return (
                      <tr
                          key={asset.id}
                          onClick={() => openModal(asset)}
                          style={{ cursor: meta.canClick ? 'pointer' : 'default' }}
                          title={meta.canClick ? 'Click to view details' : ''}
                      >
                        <td>
                          {asset.status === 'hardened'   && <span className="badge badge-green"><span className="badge-dot"/>Hardened</span>}
                          {asset.status === 'processing' && <span className="badge badge-orange"><span className="spinner" style={{ width:'8px',height:'8px',borderWidth:'1.5px' }}/>Processing</span>}
                          {asset.status === 'failed'     && <span className="badge badge-red"><span className="badge-dot"/>Failed</span>}
                        </td>
                        <td>
                          <div className="filename">
                            <span className={`file-icon ${fi.cls}`}>{fi.icon}</span>
                            <span style={{ marginLeft: 6 }}>{asset.name}</span>
                          </div>
                        </td>
                        <td>
                          {asset.status === 'hardened' && asset.hash
                              ? <span className="mono" style={{ fontSize:11, color:'var(--accent)' }}>{asset.hash.slice(0, 36)}…</span>
                              : asset.status === 'processing'
                                  ? <span className="mono-muted">Computing…</span>
                                  : <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>
                          }
                        </td>
                        <td><span className="mono-muted">{asset.size}</span></td>
                        <td>
                          <button
                              onClick={e => { e.stopPropagation(); removeAsset(asset.id); }}
                              style={{
                                background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)',
                                fontSize:'18px', padding:'2px 6px', borderRadius:'4px', transition:'var(--transition)'
                              }}
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

        {/* Detail modal */}
        {modal && <AssetModal asset={modal} onClose={() => setModal(null)} />}
      </div>
  );
}