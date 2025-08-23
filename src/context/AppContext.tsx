import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TabType, ExploreMode, MineTab, Gift } from '../types';
import { giftService } from '../services/giftService';

interface AppContextType {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  exploreMode: ExploreMode;
  setExploreMode: (mode: ExploreMode) => void;
  mineTab: MineTab;
  setMineTab: (tab: MineTab) => void;
  
  // Data
  gifts: Gift[];
  loading: boolean;
  refreshGifts: () => Promise<void>;
  
  // UI State
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  
  // Global animations
  showGiftClaimAnimation: boolean;
  setShowGiftClaimAnimation: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [exploreMode, setExploreMode] = useState<ExploreMode>('live');
  const [mineTab, setMineTab] = useState<MineTab>('claimable');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGiftClaimAnimation, setShowGiftClaimAnimation] = useState(false);

  // Fetch gifts data
  const fetchGifts = async () => {
    console.log('🚀 AppContext.fetchGifts() called');
    setLoading(true);
    try {
      const allGifts = await giftService.getAllGifts();
      console.log(`📦 AppContext received ${allGifts.length} gifts`);
      setGifts(allGifts);
    } catch (error) {
      console.error('💥 AppContext failed to fetch gifts:', error);
    } finally {
      setLoading(false);
      console.log('✅ AppContext.fetchGifts() completed');
    }
  };

  // Refresh gifts (clear cache and refetch)
  const refreshGifts = async () => {
    console.log('🔄 AppContext.refreshGifts() called');
    giftService.clearCache();
    await fetchGifts();
  };

  // Initial data fetch
  useEffect(() => {
    console.log('🎯 AppContext useEffect triggered - initial data fetch');
    fetchGifts();
  }, []);

  const value: AppContextType = {
    activeTab,
    setActiveTab,
    exploreMode,
    setExploreMode,
    mineTab,
    setMineTab,
    gifts,
    loading,
    refreshGifts,
    showUserMenu,
    setShowUserMenu,
    showGiftClaimAnimation,
    setShowGiftClaimAnimation
  };

  console.log(`📊 AppContext render - gifts: ${gifts.length}, loading: ${loading}`);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
