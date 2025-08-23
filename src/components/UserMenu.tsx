import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { useApp } from '../context/AppContext';
import { useFarcasterProfile } from '../hooks/useFarcasterProfile';

export const UserMenu: React.FC = () => {
  const { showUserMenu, setShowUserMenu } = useApp();
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { profile } = useFarcasterProfile();
  const { switchChain } = useSwitchChain();
  const [showConnectors, setShowConnectors] = useState(false);
  
  if (!showUserMenu) return null;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isCorrectNetwork = chain?.id === arbitrumSepolia.id;

  const handleConnect = (connector: any) => {
    connect({ connector });
    setShowConnectors(false);
    setShowUserMenu(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowUserMenu(false);
  };

  const handleSwitchNetwork = () => {
    switchChain({ chainId: arbitrumSepolia.id });
  };

  return (
    <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)}>
      <div className="user-menu" onClick={e => e.stopPropagation()}>
        {isConnected && address ? (
          <>
            <div className="user-info">
              <div className="user-avatar-large">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="User Avatar" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="user-details">
                <div className="address">{formatAddress(address)}</div>
                <div className="network">
                  Network: {chain?.name || 'Unknown'}
                  {!isCorrectNetwork && (
                    <span className="network-warning"> ⚠️</span>
                  )}
                </div>
              </div>
            </div>
            
            {!isCorrectNetwork && (
              <div className="network-warning-box">
                <p>Please switch to Arbitrum Sepolia network</p>
                <button className="switch-network-button" onClick={handleSwitchNetwork}>
                  Switch to Arbitrum Sepolia
                </button>
              </div>
            )}
            
            <button className="disconnect-button" onClick={handleDisconnect}>
              Disconnect Wallet
            </button>
          </>
        ) : (
          <>
            {showConnectors ? (
              <div className="connectors-list">
                <h3>Choose Wallet</h3>
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    className="connector-button"
                    onClick={() => handleConnect(connector)}
                  >
                    {connector.name}
                  </button>
                ))}
                <button 
                  className="cancel-button"
                  onClick={() => setShowConnectors(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                className="connect-button"
                onClick={() => setShowConnectors(true)}
              >
                Connect Wallet
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
