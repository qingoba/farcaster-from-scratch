import { useAccount, useBalance } from 'wagmi';
import { Token, TokenBalance } from '../types';
import { ETH_TOKEN } from './tokens';

export const useTokenBalance = (token: Token): TokenBalance | null => {
  const { address } = useAccount();
  
  const { data: balance } = useBalance({
    address: address,
    token: token.address === ETH_TOKEN.address ? undefined : token.address as `0x${string}`,
  });

  if (!balance) return null;

  return {
    token,
    balance: balance.value.toString(),
    formatted: `${parseFloat(balance.formatted).toFixed(6)} ${balance.symbol}`
  };
};
