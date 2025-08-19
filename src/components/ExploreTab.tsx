import React from 'react';
import { useApp } from '../context/AppContext';
import { GiftItem } from './GiftItem';

export const ExploreTab: React.FC = () => {
  const { exploreMode, setExploreMode, gifts } = useApp();
  
  const filteredGifts = gifts
    .filter(gift => exploreMode === 'live' ? !gift.isClaimed : gift.isClaimed)
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 50);

  return (
    <div className="explore-tab">
      <div className="explore-header">
        <div className="mode-switch">
          <button 
            className={exploreMode === 'live' ? 'active' : ''}
            onClick={() => setExploreMode('live')}
          >
            Live
          </button>
          <button 
            className={exploreMode === 'historic' ? 'active' : ''}
            onClick={() => setExploreMode('historic')}
          >
            Historic
          </button>
        </div>
      </div>
      
      <div className="gifts-list">
        {filteredGifts.map(gift => (
          <GiftItem 
            key={gift.id} 
            gift={gift} 
            showClaimButton={exploreMode === 'live'} 
          />
        ))}
      </div>
    </div>
  );
};
