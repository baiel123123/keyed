import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_PRIMARY = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="nav-icon">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    to: '/workspace',
    label: 'Protect Asset',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="nav-icon">
        <path d="M8 1.5L2 4v4c0 3 2.5 5.5 6 6 3.5-.5 6-3 6-6V4L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/ledger',
    label: 'Immutable Ledger',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="nav-icon">
        <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/network',
    label: 'Global Network',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="nav-icon">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const NAV_BOTTOM = [
  {
    to: '/profile',
    label: 'My Profile',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="nav-icon">
        <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Vault Configuration',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="nav-icon">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const ArrowIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="nav-arrow">
    <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
        <div className="logo-icon" />
        <div className="logo-text">
          <span className="logo-title">KEYED</span>
          <span className="logo-sub">Enterprise Vault</span>
        </div>
      </NavLink>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {NAV_PRIMARY.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {icon}
            {label}
            <ArrowIcon />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="nav-section-label">Account</div>
        {NAV_BOTTOM.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {icon}
            {label}
            <ArrowIcon />
          </NavLink>
        ))}

        <button
          className="nav-link"
          onClick={() => window.location.reload()}
          style={{ color: 'var(--text-muted)' }}
        >
          <svg viewBox="0 0 16 16" fill="none" className="nav-icon">
            <path d="M2.5 8C2.5 4.96 4.96 2.5 8 2.5c1.6 0 3.04.67 4.07 1.75M13.5 8c0 3.04-2.46 5.5-5.5 5.5-1.6 0-3.04-.67-4.07-1.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M11.5 1.5v2.75H8.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}