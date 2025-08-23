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
  status: number; // 0 = ACTIVE, 1 = CLAIMED, 2 = EXPIRED, etc.
  nftImage: string;
  createdAt: number;
}

export interface User {
  address: string;
  username: string;
  avatar: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface NewGiftForm {
  title: string;
  recipientType: 'specific' | 'everyone';
  recipients: string[];
  token: Token;
  amount: string;
  description: string;
  shares: string;
  distributionType: 'equal' | 'random';
}

export interface TokenBalance {
  token: Token;
  balance: string;
  formatted: string;
}

export type TabType = 'explore' | 'new' | 'mine';
export type ExploreMode = 'live' | 'historic';
export type MineTab = 'claimable' | 'received' | 'sent';
