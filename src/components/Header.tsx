import React from 'react';
import { useAccount } from 'wagmi';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { setShowUserMenu } = useApp();
  const { address, isConnected } = useAccount();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="header">
      <h1 className="app-title">🎁 Gift Box</h1>
      <button 
        className="user-avatar-button"
        onClick={() => setShowUserMenu(true)}
      >
        {isConnected && address ? (
          <div className="user-avatar-placeholder">
            {formatAddress(address)}
          </div>
        ) : (
          <div className="user-avatar-placeholder">👤</div>
        )}
      </button>
    </header>
  );
};
