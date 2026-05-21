import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password, remember);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />

      <div className="login-logo">
        <div className="login-logo-icon" />
        <div>
          <div className="login-logo-title">
            <span className="keyed">KEYED</span>
            <span className="sep">|</span>
            <span className="vault">ENTERPRISE VAULT</span>
          </div>
          <div className="login-logo-sub">Secure access to your digital fortress</div>
        </div>
      </div>

      <div className="login-card">
        <div className="login-title">Sign in to your vault</div>

        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            fontSize: '12px', color: 'var(--red)', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            ❌ {error}
          </div>
        )}

        <div className="input-group">
          <div className="input-label">Email Address</div>
          <div className="input-icon-wrap">
            <input
              className="input-field"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="input-group">
          <div className="input-label">Password</div>
          <div className="input-icon-wrap">
            <input
              className="input-field"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete="current-password"
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              className="show-pw-btn"
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="login-footer-row">
          <label className="remember-row">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Remember me
          </label>
        </div>

        <button
          className="btn btn-lg"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', justifyContent: 'center',
            background: 'linear-gradient(135deg, #5a4fcf, #7c6cf8, #00b8cc)',
            color: '#fff', fontWeight: 700, fontSize: '14px',
            opacity: loading ? 0.75 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? <><span className="spinner" /> Authenticating…</> : 'Access Vault'}
        </button>

        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          Backend: <code>http://localhost:8080</code> · Frontend: <code>http://localhost:5173</code>
        </p>
      </div>
    </div>
  );
}
