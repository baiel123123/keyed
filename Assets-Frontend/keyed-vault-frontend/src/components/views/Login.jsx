import { useState } from 'react';
import SignUp from './SignUp.jsx';

export default function Login({ onLogin }) {
  const [view,     setView]     = useState('login'); // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  if (view === 'signup') {
    return <SignUp onSwitch={() => setView('login')} />;
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Store JWT based on "Remember me" preference
      if (remember) {
        localStorage.setItem('keyed_jwt', data.payload.token);
      } else {
        sessionStorage.setItem('keyed_jwt', data.payload.token);
      }

      // Pass full payload up to App.jsx (token, user info, etc.)
      onLogin(data.payload);

    } catch {
      setError('Cannot reach server. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />

      {/* Logo */}
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

      {/* Card */}
      <div className="login-card">
        <div className="login-title">Sign in to your vault</div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            fontSize: '12px', color: 'var(--red)', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" stroke="var(--red)" strokeWidth="1.2"/>
              <path d="M6 3.5V6.5" stroke="var(--red)" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="6" cy="8.5" r=".7" fill="var(--red)"/>
            </svg>
            {error}
          </div>
        )}

        {/* Email */}
        <div className="input-group">
          <div className="input-label">Email Address</div>
          <div className="input-icon-wrap">
            <svg className="input-icon-left" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
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

        {/* Password */}
        <div className="input-group">
          <div className="input-label">Password</div>
          <div className="input-icon-wrap">
            <svg className="input-icon-left" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
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
              {showPw ? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1 7.5C1 7.5 3.5 3 7.5 3s6.5 4.5 6.5 4.5-2.5 4.5-6.5 4.5S1 7.5 1 7.5z"
                    stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 2l11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1 7.5C1 7.5 3.5 3 7.5 3s6.5 4.5 6.5 4.5-2.5 4.5-6.5 4.5S1 7.5 1 7.5z"
                    stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="login-footer-row">
          <label className="remember-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <span className="forgot-link">Forgot password?</span>
        </div>

        {/* Submit */}
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

        {/* Switch to Sign Up */}
        <div className="login-register">
          Don&apos;t have an account?{' '}
          <span
            className="register-link"
            onClick={() => { setError(''); setView('signup'); }}
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}