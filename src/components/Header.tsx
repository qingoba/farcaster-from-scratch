import React from 'react';
import { useAccount } from 'wagmi';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { setShowUserMenu } = useApp();
  const { address, isConnected } = useAccount();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-3)}`;
  };

  return (
    <header className="header">
      <h1 className="app-title">🎁 Gift Box</h1>
      <button 
        className="user-info-button"
        onClick={() => setShowUserMenu(true)}
      >
        <div className="user-avatar-small">👤</div>
        <span className="user-status">
          {isConnected && address ? formatAddress(address) : 'Not Connected'}
        </span>
      </button>
    </header>
  );
};
