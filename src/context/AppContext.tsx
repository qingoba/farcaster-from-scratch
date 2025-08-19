import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { TabType, ExploreMode, MineTab, Gift } from '../types';
import { mockGifts } from '../data/mockData';

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
  
  // UI State
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [exploreMode, setExploreMode] = useState<ExploreMode>('live');
  const [mineTab, setMineTab] = useState<MineTab>('claimable');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const value: AppContextType = {
    activeTab,
    setActiveTab,
    exploreMode,
    setExploreMode,
    mineTab,
    setMineTab,
    gifts: mockGifts,
    showUserMenu,
    setShowUserMenu
  };

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
