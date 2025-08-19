import React from 'react';
import { useApp } from '../context/AppContext';
import { GiftItem } from './GiftItem';
import { canUserClaimGift } from '../data/mockData';

export const MineTab: React.FC = () => {
  const { mineTab, setMineTab, gifts, user } = useApp();
  
  if (!user) return <div>Please connect your wallet</div>;

  const getFilteredGifts = () => {
    switch (mineTab) {
      case 'claimable':
        return gifts.filter(gift => canUserClaimGift(gift, user.address));
      case 'received':
        return gifts.filter(gift => 
          gift.isClaimed && (gift.to === user.address || gift.to === 'everyone')
        );
      case 'sent':
        return gifts.filter(gift => gift.from === user.address);
      default:
        return [];
    }
  };

  const filteredGifts = getFilteredGifts();

  return (
    <div className="mine-tab">
      <div className="mine-header">
        <div className="mine-tabs">
          <button 
            className={mineTab === 'claimable' ? 'active' : ''}
            onClick={() => setMineTab('claimable')}
          >
            Claimable
          </button>
          <button 
            className={mineTab === 'received' ? 'active' : ''}
            onClick={() => setMineTab('received')}
          >
            Received
          </button>
          <button 
            className={mineTab === 'sent' ? 'active' : ''}
            onClick={() => setMineTab('sent')}
          >
            Sent
          </button>
        </div>
      </div>
      
      <div className="gifts-list compact">
        {filteredGifts.map(gift => (
          <GiftItem 
            key={gift.id} 
            gift={gift} 
            showClaimButton={mineTab === 'claimable'} 
          />
        ))}
        {filteredGifts.length === 0 && (
          <div className="empty-state">
            No gifts found
          </div>
        )}
      </div>
    </div>
  );
};
