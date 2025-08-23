import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterProfile {
  avatar?: string;
  displayName?: string;
  username?: string;
}

export const useFarcasterProfile = () => {
  const [profile, setProfile] = useState<FarcasterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get user context from Farcaster SDK
        const context = await sdk.context;
        if (context?.user) {
          setProfile({
            avatar: context.user.pfpUrl,
            displayName: context.user.displayName,
            username: context.user.username
          });
        }
      } catch (error) {
        console.log('Failed to get Farcaster profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading };
};
