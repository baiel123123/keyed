const RECENT = [
  { icon: '🔒', name: 'Hardened asset',   sub: 'Q4_Annual_Report.pdf',       time: '2 min ago'   },
  { icon: '📋', name: 'Ledger synced',    sub: '42 entries committed',        time: '14 min ago'  },
  { icon: '🔑', name: 'Login',            sub: 'Chrome — New York, US',       time: '1 hr ago'    },
  { icon: '🔒', name: 'Asset hardened',   sub: 'contract_v3_signed.docx',     time: '3 hr ago'    },
  { icon: '👤', name: 'Profile updated',  sub: 'Email address changed',       time: '2 days ago'  },
];

export default function Profile() {
  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">My Profile</h1>
      </div>

      <div className="profile-grid">
        {/* ── Left column ── */}
        <div className="profile-left">

          {/* Avatar card */}
          <div className="profile-card">
            <div className="profile-avatar">
              JD
              <span className="avatar-camera">📷</span>
            </div>
            <div className="profile-name">John Doe</div>
            <div className="profile-role">Vault Administrator</div>
            <div className="profile-org">Acme Corporation</div>
            <div className="profile-stats">
              <div>
                <div className="profile-stat-val">42</div>
                <div className="profile-stat-label">Assets</div>
              </div>
              <div>
                <div className="profile-stat-val">42</div>
                <div className="profile-stat-label">Ledger Entries</div>
              </div>
            </div>
          </div>

          {/* Vault Identity */}
          <div className="vault-identity-card">
            <div className="widget-title" style={{ marginBottom: '16px' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5L2 4v4c0 3 2.5 5.5 6 6 3.5-.5 6-3 6-6V4L8 1.5z"
                  stroke="var(--accent)" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
              Vault Identity
            </div>
            <div className="identity-item">
              <div className="identity-key">Owner ID</div>
              <div className="identity-value">USR-0xA3F7C2</div>
            </div>
            <div className="identity-item">
              <div className="identity-key">Vault Key</div>
              <div className="identity-value">vk_7f3a2c8b…e4d1</div>
            </div>
            <div className="identity-item">
              <div className="identity-key">Member Since</div>
              <div className="identity-value-plain">January 15, 2026</div>
            </div>
          </div>

          {/* Security Status */}
          <div className="security-card">
            <div className="widget-title" style={{ marginBottom: '14px' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="var(--accent)" strokeWidth="1.4"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Security Status
            </div>
            {[
              { label: 'Email verified',   dot: 'sec-dot-green',  action: null             },
              { label: '2FA enabled',      dot: 'sec-dot-orange', action: 'Action needed'  },
              { label: 'Recovery key set', dot: 'sec-dot-green',  action: null             },
              { label: 'Vault encrypted',  dot: 'sec-dot-green',  action: null             },
            ].map(({ label, dot, action }) => (
              <div className="security-item" key={label}>
                <div className="security-left">
                  <span className={`sec-dot ${dot}`} />
                  <span className="security-label">{label}</span>
                </div>
                {action && <span className="action-needed">{action}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="profile-right">

          {/* Personal Information */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="3" stroke="var(--accent)" strokeWidth="1.4"/>
                  <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Personal Information
              </div>
              <button className="edit-btn">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                Edit
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-key">First Name</div>
                <div className="info-val">John</div>
              </div>
              <div className="info-item">
                <div className="info-key">Last Name</div>
                <div className="info-val">Doe</div>
              </div>
              <div className="info-item info-item-full">
                <div className="info-key">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <rect x="0.5" y="2" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M0.5 4l4.5 2.5L9.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  Email Address
                </div>
                <div className="info-val">john.doe@acmecorp.com</div>
              </div>
              <div className="info-item">
                <div className="info-key">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  Organization
                </div>
                <div className="info-val">Acme Corporation</div>
              </div>
              <div className="info-item">
                <div className="info-key">Role</div>
                <div className="info-val">Vault Administrator</div>
              </div>
              <div className="info-item info-item-full">
                <div className="info-key">Bio</div>
                <div className="info-bio">
                  Enterprise security specialist focused on digital asset protection and compliance.
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <div className="activity-header">
              <div className="activity-title">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v6l3 2" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7" cy="7" r="6" stroke="var(--accent)" strokeWidth="1.3"/>
                </svg>
                Recent Activity
              </div>
            </div>
            <div className="activity-list">
              {RECENT.map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-left">
                    <div style={{
                      width: 30, height: 30, borderRadius: '8px',
                      background: 'var(--bg-input)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', flexShrink: 0,
                    }}>
                      {a.icon}
                    </div>
                    <div className="activity-info">
                      <div className="activity-name">{a.name}</div>
                      <div className="activity-file">{a.sub}</div>
                    </div>
                  </div>
                  <span className="activity-time">🕐 {a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}