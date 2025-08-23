import React, { useEffect } from 'react';
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
import sdk from '@farcaster/miniapp-sdk';
import './styles/App.css';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  // Ensure ready() is called when app content is fully rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      sdk.actions.ready().catch((err) => {
        console.log('Ready already called or error:', err);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
