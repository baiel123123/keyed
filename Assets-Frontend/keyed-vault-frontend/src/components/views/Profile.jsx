import { useAuth } from '../../context/AuthContext.jsx';

const RECENT = [
  { icon:'🔒', name:'Hardened asset',  sub:'Q4_Annual_Report.pdf',    time:'2 min ago'  },
  { icon:'📋', name:'Ledger synced',   sub:'42 entries committed',     time:'14 min ago' },
  { icon:'🔑', name:'Login',           sub:'Chrome — New York, US',    time:'1 hr ago'   },
  { icon:'🔒', name:'Asset hardened',  sub:'contract_v3_signed.docx',  time:'3 hr ago'   },
  { icon:'👤', name:'Profile updated', sub:'Email address changed',    time:'2 days ago' },
];

function initials(name) {
  if (!name) return 'JD';
  return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('');
}

export default function Profile() {
  const { user } = useAuth();

  const fullName = user?.fullName  ?? 'John Doe';
  const username = user?.username  ?? 'john_doe';
  const email    = user?.email     ?? 'john.doe@acmecorp.com';
  const phone    = user?.phone     ?? '—';
  const org      = user?.organization ?? 'Acme Corporation';
  const role     = user?.role      ?? 'Vault Administrator';
  const ownerId  = user?.ownerId   ?? 'USR-0xA3F7C2';
  const vaultKey = user?.vaultKey  ?? 'vk_7f3a2c8b…e4d1';
  const since    = user?.memberSince ?? 'January 15, 2026';
  const bio      = user?.bio       ?? 'Enterprise security specialist focused on digital asset protection and compliance.';

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">My Profile</h1>
      </div>

      <div className="profile-grid">
        {/* ── Left ── */}
        <div className="profile-left">

          {/* Avatar card */}
          <div className="profile-card">
            <div className="profile-avatar">
              {initials(fullName)}
              <span className="avatar-camera">📷</span>
            </div>
            <div className="profile-name">{fullName}</div>
            <div className="profile-role">{role}</div>
            <div className="profile-org">{org}</div>
            <div className="profile-stats">
              {[['42','Assets'],['42','Ledger Entries']].map(([v,l]) => (
                <div key={l}>
                  <div className="profile-stat-val">{v}</div>
                  <div className="profile-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vault Identity */}
          <div className="vault-identity-card">
            <div className="widget-title" style={{ marginBottom:16 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5L2 4v4c0 3 2.5 5.5 6 6 3.5-.5 6-3 6-6V4L8 1.5z"
                  stroke="var(--accent)" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
              Vault Identity
            </div>
            {[
              ['Owner ID',     ownerId,  true ],
              ['Vault Key',    vaultKey, true ],
              ['Member Since', since,    false],
            ].map(([k,v,m]) => (
              <div className="identity-item" key={k}>
                <div className="identity-key">{k}</div>
                <div className={m ? 'identity-value' : 'identity-value-plain'}>{v}</div>
              </div>
            ))}
          </div>

          {/* Security */}
          <div className="security-card">
            <div className="widget-title" style={{ marginBottom:14 }}>🔒 Security Status</div>
            {[
              { label:'Email verified',   dot:'sec-dot-green',  action:null           },
              { label:'2FA enabled',      dot:'sec-dot-orange', action:'Action needed' },
              { label:'Recovery key set', dot:'sec-dot-green',  action:null           },
              { label:'Vault encrypted',  dot:'sec-dot-green',  action:null           },
            ].map(({ label,dot,action }) => (
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

        {/* ── Right ── */}
        <div className="profile-right">

          {/* Personal Info */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">👤 Personal Information</div>
              <button className="edit-btn">✎ Edit</button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-key">First Name</div>
                <div className="info-val">{fullName.split(' ')[0] || '—'}</div>
              </div>
              <div className="info-item">
                <div className="info-key">Last Name</div>
                <div className="info-val">{fullName.split(' ').slice(1).join(' ') || '—'}</div>
              </div>
              <div className="info-item info-item-full">
                <div className="info-key">✉ Email Address</div>
                <div className="info-val">{email}</div>
              </div>
              <div className="info-item">
                <div className="info-key">📱 Phone</div>
                <div className="info-val">{phone}</div>
              </div>
              <div className="info-item">
                <div className="info-key">Username</div>
                <div className="info-val" style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>@{username}</div>
              </div>
              <div className="info-item">
                <div className="info-key">Organization</div>
                <div className="info-val">{org}</div>
              </div>
              <div className="info-item">
                <div className="info-key">Role</div>
                <div className="info-val">{role}</div>
              </div>
              <div className="info-item info-item-full">
                <div className="info-key">Bio</div>
                <div className="info-bio">{bio}</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <div className="activity-header">
              <div className="activity-title">⚡ Recent Activity</div>
            </div>
            <div className="activity-list">
              {RECENT.map((a,i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-left">
                    <div style={{ width:30, height:30, borderRadius:8, background:'var(--bg-input)',
                      border:'1px solid var(--border)', display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:14, flexShrink:0 }}>{a.icon}</div>
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