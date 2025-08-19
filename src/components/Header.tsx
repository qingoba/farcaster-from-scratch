import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { user, setShowUserMenu } = useApp();

  return (
    <header className="header">
      <h1 className="app-title">🎁 Gift Box</h1>
      <button 
        className="user-avatar-button"
        onClick={() => setShowUserMenu(true)}
      >
        {user ? (
          <img src={user.avatar} alt="User Avatar" className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">👤</div>
        )}
      </button>
    </header>
  );
};
