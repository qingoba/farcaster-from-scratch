// Hardcoded ENS-like mapping for display purposes
const ADDRESS_TO_ENS: Record<string, string> = {
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045': 'vitalik.eth',
  // Add more mappings as needed
};

export const getDisplayName = (address: string): string => {
  return ADDRESS_TO_ENS[address] || address;
};

export const formatAddress = (address: string): string => {
  const ensName = ADDRESS_TO_ENS[address];
  if (ensName) {
    return ensName;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
