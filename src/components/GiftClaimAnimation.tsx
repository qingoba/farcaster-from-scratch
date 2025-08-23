import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface GiftClaimAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const GiftClaimAnimation: React.FC<GiftClaimAnimationProps> = ({
  isVisible,
  onComplete
}) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 加载动画数据
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/gift-claim-animation.json');
        const data = await response.json();
        setAnimationData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load animation:', error);
        setLoading(false);
      }
    };

    if (isVisible) {
      loadAnimation();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && !loading && animationData) {
      // 4秒后自动完成动画
      const timer = setTimeout(() => {
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, loading, animationData, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="gift-claim-animation-overlay">
      <div className="gift-claim-animation-container">
        {loading ? (
          <div className="animation-loading">
            <div className="loading-spinner">🔄</div>
            <p>Loading animation...</p>
          </div>
        ) : animationData ? (
          <>
            <Lottie
              animationData={animationData}
              loop={false}
              autoplay={true}
              style={{
                width: '300px',
                height: '300px',
              }}
              onComplete={() => {
                // 动画播放完成后的回调
                setTimeout(() => {
                  onComplete?.();
                }, 1000);
              }}
            />
            <div className="gift-success-text">🎁 Gift Claimed! 🎁</div>
          </>
        ) : (
          <div className="animation-error">
            <p>Failed to load animation</p>
            <div className="fallback-animation">🎁✨</div>
          </div>
        )}
      </div>
    </div>
  );
};
