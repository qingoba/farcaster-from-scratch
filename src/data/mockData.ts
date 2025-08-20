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

// Historic mock data with multiple recipients
export const mockHistoricGifts: Gift[] = [
  {
    id: '4',
    title: '🎊 Team Celebration Bonus',
    from: '0xCompany123456789abcdef',
    to: '0xEmployee1234567890ab',
    recipients: [
      '0xEmployee1234567890ab',
      '0xEmployee2345678901bc', 
      '0xEmployee3456789012cd',
      '0xEmployee4567890123de',
      '0xEmployee5678901234ef'
    ],
    amount: '2.5',
    description: 'Great work on the Q4 project launch!',
    claimed: 5,
    isClaimed: true,
    nftImage: 'https://placehold.co/80x80.png?text=🎊',
    createdAt: Date.now() - 86400000
  },
  {
    id: '5', 
    title: '🎁 Wedding Gift',
    from: '0xFriend123456789abcdef',
    to: '0xCouple1234567890abc',
    recipients: [
      '0xCouple1234567890abc',
      '0xCouple2345678901bcd'
    ],
    amount: '0.8',
    description: 'Congratulations on your wedding!',
    claimed: 2,
    isClaimed: true,
    nftImage: 'https://placehold.co/80x80.png?text=💒',
    createdAt: Date.now() - 172800000
  },
  {
    id: '6',
    title: '🏅 Hackathon Prize',
    from: '0xOrganizer123456789ab',
    to: '0xWinner1234567890abc',
    recipients: [
      '0xWinner1234567890abc'
    ],
    amount: '1.5',
    description: 'First place in the DeFi category!',
    claimed: 1,
    isClaimed: true,
    nftImage: 'https://placehold.co/80x80.png?text=🏅',
    createdAt: Date.now() - 259200000
  },
  {
    id: '7',
    title: '🎓 Graduation Gift Pool',
    from: '0xFamily123456789abcdef',
    to: '0xGraduate123456789ab',
    recipients: [
      '0xGraduate123456789ab',
      '0xSibling1234567890abc',
      '0xCousin12345678901bcd',
      '0xFriend12345678901cde',
      '0xClassmate123456789de',
      '0xTeacher123456789abef',
      '0xMentor1234567890abcf'
    ],
    amount: '3.2',
    description: 'Congratulations on graduating with honors!',
    claimed: 7,
    isClaimed: true,
    nftImage: 'https://placehold.co/80x80.png?text=🎓',
    createdAt: Date.now() - 345600000
  }
];

export const canUserClaimGift = (gift: Gift, userAddress: string): boolean => {
  if (gift.isClaimed) return false;
  if (gift.to === 'everyone') {
    return gift.limit ? gift.claimed < gift.limit : true;
  }
  if (gift.recipients && gift.recipients.length > 0) {
    return gift.recipients.includes(userAddress);
  }
  return gift.to === userAddress;
};
