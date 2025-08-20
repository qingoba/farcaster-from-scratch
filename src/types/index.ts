export interface Gift {
  id: string;
  title: string;
  from: string;
  to: string | 'everyone';
  recipients?: string[];
  amount: string;
  description: string;
  limit?: number;
  claimed: number;
  isClaimed: boolean;
  nftImage: string;
  createdAt: number;
}

export interface User {
  address: string;
  username: string;
  avatar: string;
}

export type TabType = 'explore' | 'new' | 'mine';
export type ExploreMode = 'live' | 'historic';
export type MineTab = 'claimable' | 'received' | 'sent';
