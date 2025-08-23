import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Gift } from '../types';
import { canUserClaimGift } from '../data/mockData';
import { useGiftTransaction } from '../services/contractService';

interface GiftItemProps {
  gift: Gift;
  showClaimButton?: boolean;
}

export const GiftItem: React.FC<GiftItemProps> = ({ gift, showClaimButton = false }) => {
  const { address } = useAccount();
  const [showRecipients, setShowRecipients] = useState(false);
  const [showGiftAnimation, setShowGiftAnimation] = useState(false);
  const { claimGift, isPending, isConfirming, isConfirmed, hash, error } = useGiftTransaction();
  
  const canClaim = address && canUserClaimGift(gift, address);
  
  const formatAddress = (addr: string) => {
    if (addr === 'everyone') return 'Everyone';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTransactionHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatRecipients = () => {
    if (gift.to === 'everyone') return 'Everyone';
    if (!gift.recipients || gift.recipients.length <= 1) {
      return formatAddress(gift.to);
    }
    const remaining = gift.recipients.length - 1;
    return (
      <span 
        className="recipients-clickable" 
        onClick={() => setShowRecipients(true)}
      >
        {formatAddress(gift.recipients[0])} and {remaining} more
      </span>
    );
  };

  const handleClaimGift = async () => {
    if (!canClaim) return;
    
    // 显示3D礼物打开动画
    setShowGiftAnimation(true);
    
    // 2.5秒后隐藏动画
    setTimeout(() => {
      setShowGiftAnimation(false);
    }, 2500);
    
    await claimGift(gift.id);
  };

  return (
    <div className="gift-item">
      <div className="gift-content">
        <h3 className="gift-title">{gift.title}</h3>
        <div className="gift-details">
          <div className="gift-info">
            <span className="gift-from">From: {formatAddress(gift.from)}</span>
            <span className="gift-to">To: {formatRecipients()}</span>
            <span className="gift-amount">{gift.amount} ETH</span>
            <span className="gift-limit">Claimed: {gift.claimed}/{gift.limit}</span>
          </div>
          <p className="gift-description">{gift.description}</p>
        </div>
        
        {showClaimButton && canClaim && (
          <div className="claim-section">
            <button 
              className="claim-button"
              onClick={handleClaimGift}
              disabled={isPending || isConfirming || isConfirmed}
            >
              {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : isConfirmed ? 'Claimed' : 'Claim Gift'}
            </button>
            
            {hash && (
              <div className="claim-status">
                <p>Transaction: {hash}</p>
                {isConfirming && <p>Claiming gift...</p>}
                {isConfirmed && <p className="success">Gift claimed successfully!</p>}
              </div>
            )}
            
            {error && (
              <div className="claim-error">
                Error: {error.message}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="gift-nft">
        <img src={gift.nftImage} alt="Gift NFT" />
      </div>
      
      {showRecipients && gift.recipients && gift.recipients.length > 1 && (
        <div className="recipients-modal" onClick={() => setShowRecipients(false)}>
          <div className="recipients-content" onClick={e => e.stopPropagation()}>
            <h4>Recipients ({gift.recipients.length})</h4>
            <div className="recipients-list">
              {gift.recipients.map((recipient, index) => (
                <div key={index} className="recipient-item">
                  {formatAddress(recipient)}
                </div>
              ))}
            </div>
            <button onClick={() => setShowRecipients(false)}>Close</button>
          </div>
        </div>
      )}
      
      {/* 3D礼物打开动画 */}
      {showGiftAnimation && (
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
