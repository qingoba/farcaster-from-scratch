import React from 'react';
import { useApp } from '../context/AppContext';
import { useFarcasterProfile } from '../hooks/useFarcasterProfile';

export const Header: React.FC = () => {
  const { setShowUserMenu } = useApp();
  const { profile } = useFarcasterProfile();

  return (
    <header className="header">
      <h1 className="app-title">Gift Box</h1>
      <button 
        className="user-info-button"
        onClick={() => setShowUserMenu(true)}
      >
        <div className="user-avatar-small">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="User Avatar" />
          ) : (
            '👤'
          )}
        </div>
      </button>
    </header>
  );
};
