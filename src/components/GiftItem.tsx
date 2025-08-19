import React from 'react';
import { Gift } from '../types';
import { canUserClaimGift } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface GiftItemProps {
  gift: Gift;
  showClaimButton?: boolean;
}

export const GiftItem: React.FC<GiftItemProps> = ({ gift, showClaimButton = false }) => {
  const { user } = useApp();
  
  const canClaim = user && canUserClaimGift(gift, user.address);
  
  const formatAddress = (address: string) => {
    if (address === 'everyone') return 'Everyone';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="gift-item">
      <div className="gift-content">
        <h3 className="gift-title">{gift.title}</h3>
        <div className="gift-details">
          <div className="gift-info">
            <span className="gift-from">From: {formatAddress(gift.from)}</span>
            <span className="gift-to">To: {formatAddress(gift.to)}</span>
            <span className="gift-amount">{gift.amount} ETH</span>
            {gift.limit && (
              <span className="gift-limit">Limit: {gift.claimed}/{gift.limit}</span>
            )}
          </div>
          <p className="gift-description">{gift.description}</p>
        </div>
        {showClaimButton && canClaim && (
          <button className="claim-button">Claim Gift</button>
        )}
      </div>
      <div className="gift-nft">
        <img src={gift.nftImage} alt="Gift NFT" />
      </div>
    </div>
  );
};
