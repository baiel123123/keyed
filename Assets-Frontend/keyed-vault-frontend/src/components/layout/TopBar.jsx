import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const TITLES = {
  '/': 'Dashboard',
  '/workspace': 'Protect Asset',
  '/ledger': 'Immutable Ledger',
  '/network': 'Global Network',
  '/settings': 'Vault Configuration',
  '/profile': 'My Profile',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { profile, logout } = useAuth();
  const pageTitle = TITLES[pathname] ?? 'Enterprise Vault';

  const initials = (profile?.displayName || profile?.email || 'U')
    .split(/\s+/)
    .map(s => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <span style={{
        position: 'absolute',
        left: '28px',
        fontSize: '10px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {pageTitle}
      </span>

      <div className="topbar-user" style={{ marginLeft: 'auto', gap: 12, display: 'flex', alignItems: 'center' }}>
        <span className="mono-muted" style={{ fontSize: 11 }}>{profile?.authorId}</span>
        <div className="user-avatar">{initials}</div>
        <span className="user-name">{profile?.displayName || profile?.email}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
