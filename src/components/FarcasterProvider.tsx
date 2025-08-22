import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import sdk from '@farcaster/miniapp-sdk';
import type { Context } from '@farcaster/miniapp-sdk';

interface FarcasterContextValue {
  context: Context.MiniAppContext | undefined;
  isLoading: boolean;
  isSDKLoaded: boolean;
  isEthProviderAvailable: boolean;
  actions: typeof sdk.actions | undefined;
  haptics: typeof sdk.haptics | undefined;
}

const FarcasterContext = createContext<FarcasterContextValue | undefined>(undefined);

export function useFarcaster() {
  const context = useContext(FarcasterContext);
  if (context === undefined) {
    throw new Error('useFarcaster must be used within a FarcasterProvider');
  }
  return context;
}

interface FarcasterProviderProps {
  children: ReactNode;
}

export function FarcasterProvider({ children }: FarcasterProviderProps) {
  // Call sdk.actions.ready() immediately on mount
  useEffect(() => {
    sdk.actions.ready().catch(console.error);
  }, []);

  const farcasterContextQuery = useQuery({
    queryKey: ['farcaster-context'],
    queryFn: async () => {
      const context = await sdk.context;
      try {
        await sdk.actions.ready();
        return { context, isReady: true };
      } catch (err) {
        console.error('SDK initialization error:', err);
      }
      return { context, isReady: false };
    },
  });

  const isReady = farcasterContextQuery.data?.isReady ?? false;

  return (
    <FarcasterContext.Provider
      value={{
        context: farcasterContextQuery.data?.context,
        actions: sdk.actions,
        haptics: sdk.haptics,
        isLoading: farcasterContextQuery.isPending,
        isSDKLoaded: isReady && Boolean(farcasterContextQuery.data?.context),
        isEthProviderAvailable: Boolean(sdk.wallet.ethProvider),
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}
