import { useLocation } from 'react-router-dom';

// Maps routes to human-readable page titles shown in the top bar
const TITLES = {
  '/':          'Dashboard',
  '/workspace': 'Protect Asset',
  '/ledger':    'Immutable Ledger',
  '/network':   'Global Network',
  '/settings':  'Vault Configuration',
  '/profile':   'My Profile',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const pageTitle = TITLES[pathname] ?? 'Enterprise Vault';

  return (
    <header className="topbar">
      {/* Current page title on the left */}
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

      {/* Right side: notifications + user */}
      <div className="topbar-notification">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 2a5.5 5.5 0 0 1 5.5 5.5c0 2.5.8 3.8 1.5 4.5H2c.7-.7 1.5-2 1.5-4.5A5.5 5.5 0 0 1 9 2z"
            stroke="currentColor" strokeWidth="1.4"
          />
          <path
            d="M7 14.5a2 2 0 0 0 4 0"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
          />
        </svg>
        <span className="notif-dot" />
      </div>

      <div className="topbar-user">
        <div className="user-avatar">JD</div>
        <span className="user-name">John Doe</span>
      </div>
    </header>
  );
}