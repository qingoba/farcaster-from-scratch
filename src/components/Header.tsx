import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { setShowUserMenu } = useApp();

  return (
    <header className="header">
      <h1 className="app-title">Gift Box</h1>
      <button 
        className="user-info-button"
        onClick={() => setShowUserMenu(true)}
      >
        <div className="user-avatar-small">👤</div>
      </button>
    </header>
  );
};
