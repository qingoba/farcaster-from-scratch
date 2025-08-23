import React from 'react';
import { useApp } from '../context/AppContext';
import { GiftItem } from './GiftItem';

export const ExploreTab: React.FC = () => {
  const { exploreMode, setExploreMode, gifts, loading, refreshGifts } = useApp();
  
  const filteredGifts = gifts
    .filter(gift => {
      if (exploreMode === 'live') {
        // Live: show active gifts (status === 0) that user hasn't claimed
        return gift.status === 0 && !gift.isClaimed;
      } else {
        // Historic: show claimed gifts or inactive gifts
        return gift.isClaimed || gift.status !== 0;
      }
    })
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
        <button 
          className="refresh-button"
          onClick={refreshGifts}
          disabled={loading}
        >
          {loading ? '🔄' : '↻'} Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">🔄</div>
          <p>Loading gifts from blockchain...</p>
        </div>
      ) : (
        <div className="gifts-list">
          {filteredGifts.map(gift => (
            <GiftItem 
              key={gift.id} 
              gift={gift} 
              showClaimButton={exploreMode === 'live'} 
            />
          ))}
          {filteredGifts.length === 0 && (
            <div className="empty-state">
              No {exploreMode} gifts found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
