import { useReadContract } from 'wagmi';
import { Token } from '../types';

// Static token list for known tokens
export const KNOWN_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000', // ETH
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18
  },
  {
    address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // USDC on Arbitrum Sepolia
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  }
];

// ERC20 ABI for token metadata
const ERC20_ABI = [
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }]
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }]
  }
] as const;

// Hook to fetch token metadata dynamically
export const useTokenInfo = (tokenAddress: string): Token | null => {
  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
  });

  const { data: name } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'name',
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  if (!symbol || !name || decimals === undefined) return null;

  return {
    address: tokenAddress,
    symbol: symbol as string,
    name: name as string,
    decimals: decimals as number
  };
};

// Get all supported tokens (static + dynamic)
export const SUPPORTED_TOKENS = KNOWN_TOKENS;

export const getTokenByAddress = (address: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(token => token.address.toLowerCase() === address.toLowerCase());
};

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(token => token.symbol === symbol);
};

export const ETH_TOKEN = SUPPORTED_TOKENS[0];

// Add a new token dynamically (for future use)
export const addToken = (token: Token): void => {
  const exists = getTokenByAddress(token.address);
  if (!exists) {
    SUPPORTED_TOKENS.push(token);
  }
};
