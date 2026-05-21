import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastContainer.jsx';
import Sidebar       from './components/layout/Sidebar.jsx';
import TopBar        from './components/layout/TopBar.jsx';
import Dashboard     from './components/views/Dashboard.jsx';
import ProtectAsset  from './components/views/ProtectAsset.jsx';
import Ledger        from './components/views/Ledger.jsx';
import GlobalNetwork from './components/views/GlobalNetwork.jsx';
import Settings      from './components/views/Settings.jsx';
import Profile       from './components/views/Profile.jsx';
import Login         from './components/views/Login.jsx';

export default function App() {
  // payload = { token, user: { fullName, email, username, … } }
  // or simply `true` from older mock paths
  const [payload, setPayload] = useState(null);

  const handleLogin = (data) => {
    // data may be the full payload object or just true (mock login)
    setPayload(data ?? true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('keyed_jwt');
    sessionStorage.removeItem('keyed_jwt');
    setPayload(null);
  };

  if (!payload) {
    return (
      <ToastProvider>
        <Login onLogin={handleLogin} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar onSignOut={handleSignOut} />
        <div className="main-content">
          <TopBar user={payload?.user ?? null} />
          <div className="view-container">
            <Routes>
              <Route path="/"          element={<Dashboard />}     />
              <Route path="/workspace" element={<ProtectAsset />}  />
              <Route path="/ledger"    element={<Ledger />}        />
              <Route path="/network"   element={<GlobalNetwork />} />
              <Route path="/settings"  element={<Settings />}      />
              <Route path="/profile"   element={<Profile user={payload?.user ?? null} />} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}