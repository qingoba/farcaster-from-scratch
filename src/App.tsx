import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi';
import { FarcasterProvider } from './components/FarcasterProvider';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { ExploreTab } from './components/ExploreTab';
import { NewTab } from './components/NewTab';
import { MineTab } from './components/MineTab';
import { BottomNav } from './components/BottomNav';
import { UserMenu } from './components/UserMenu';
import './styles/App.css';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { activeTab, showGiftClaimAnimation } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'explore':
        return <ExploreTab />;
      case 'new':
        return <NewTab />;
      case 'mine':
        return <MineTab />;
      default:
        return <ExploreTab />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderActiveTab()}
      </main>
      <BottomNav />
      <UserMenu />
      
      {/* 全屏礼物打开动画 */}
      {showGiftClaimAnimation && (
        <div className="gift-animation-overlay">
          <div className="gift-animation-container">
            <div className="gift-box">
              <div className="gift-box-lid">
                <div className="gift-bow">🎀</div>
              </div>
              <div className="gift-box-base"></div>
              <div className="gift-sparkles">
                <div className="sparkle-particle">✨</div>
                <div className="sparkle-particle">💫</div>
                <div className="sparkle-particle">⭐</div>
                <div className="sparkle-particle">✨</div>
                <div className="sparkle-particle">💎</div>
                <div className="sparkle-particle">🎉</div>
              </div>
            </div>
            <div className="gift-success-text">🎁 Gift Claimed! 🎁</div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
