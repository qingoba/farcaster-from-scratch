import { Gift, User } from '../types';

export const mockUser: User = {
  address: '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c',
  username: 'alice.eth',
  avatar: 'https://placehold.co/40x40.png?text=A'
};

export const mockGifts: Gift[] = [
  {
    id: '1',
    title: '🎉 Happy Birthday Gift!',
    from: '0x123...abc',
    to: 'everyone',
    amount: '0.5',
    description: 'Celebrating another year of awesome!',
    limit: 10,
    claimed: 3,
    isClaimed: false,
    nftImage: 'https://placehold.co/80x80.png?text=🎂',
    createdAt: Date.now() - 3600000
  },
  {
    id: '2',
    title: '💝 Thank You Gift',
    from: '0x456...def',
    to: '0x789...ghi',
    amount: '0.2',
    description: 'Thanks for all your help!',
    claimed: 0,
    isClaimed: false,
    nftImage: 'https://placehold.co/80x80.png?text=💝',
    createdAt: Date.now() - 7200000
  },
  {
    id: '3',
    title: '🏆 Achievement Reward',
    from: '0xabc...123',
    to: 'everyone',
    amount: '1.0',
    description: 'Congratulations on your milestone!',
    limit: 5,
    claimed: 5,
    isClaimed: true,
    nftImage: 'https://placehold.co/80x80.png?text=🏆',
    createdAt: Date.now() - 10800000
  }
];

export const canUserClaimGift = (gift: Gift, userAddress: string): boolean => {
  if (gift.isClaimed) return false;
  if (gift.to === 'everyone') {
    return gift.limit ? gift.claimed < gift.limit : true;
  }
  return gift.to === userAddress;
};
