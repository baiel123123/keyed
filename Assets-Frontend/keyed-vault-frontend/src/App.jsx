import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar.jsx';
import TopBar from './components/layout/TopBar.jsx';
import Dashboard from './components/views/Dashboard.jsx';
import ProtectAsset from './components/views/ProtectAsset.jsx';
import Ledger from './components/views/Ledger.jsx';
import Network from './components/views/Network.jsx';
import Settings from './components/views/Settings.jsx';
import Profile from './components/views/Profile.jsx';
import Login from './components/views/Login.jsx';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="view-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workspace" element={<ProtectAsset />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/network" element={<Network />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}