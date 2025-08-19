import React from 'react';
import { useApp } from '../context/AppContext';

export const UserMenu: React.FC = () => {
  const { user, showUserMenu, setShowUserMenu } = useApp();
  
  if (!showUserMenu) return null;

  const handleDisconnect = () => {
    // TODO: Implement wallet disconnect
    console.log('Disconnecting wallet');
    setShowUserMenu(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)}>
      <div className="user-menu" onClick={e => e.stopPropagation()}>
        {user ? (
          <>
            <div className="user-info">
              <img src={user.avatar} alt="Avatar" className="user-avatar-large" />
              <div className="user-details">
                <div className="username">{user.username}</div>
                <div className="address">{formatAddress(user.address)}</div>
              </div>
            </div>
            <button className="disconnect-button" onClick={handleDisconnect}>
              Disconnect Wallet
            </button>
          </>
        ) : (
          <button className="connect-button">
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};
