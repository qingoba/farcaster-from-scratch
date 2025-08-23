import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NewGiftForm } from '../types';
import presentAbi from '../Present.abi';
import { ETH_TOKEN } from './tokens';

const PRESENT_CONTRACT_ADDRESS = '0x62f213eC55Ac62b9b9C0660CEa72fF86C2ddcB70';

export interface SendGiftParams {
  recipients: string[];
  content: Array<{ tokens: string; amounts: bigint }>;
  title: string;
  description: string;
}

export const useGiftTransaction = () => {
  const { writeContract, isPending, data: hash, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const sendGift = async (formData: NewGiftForm) => {
    // Prepare recipients array
    const recipients = formData.recipientType === 'everyone' ? [] : formData.recipients.filter(r => r.trim());
    
    // Calculate total ETH value needed
    const ethAmount = formData.token.address === ETH_TOKEN.address ? parseEther(formData.amount) : 0n;
    
    // Prepare content array
    const content = [{
      tokens: formData.token.address as `0x${string}`,
      amounts: formData.token.address === ETH_TOKEN.address 
        ? ethAmount 
        : BigInt(parseFloat(formData.amount) * Math.pow(10, formData.token.decimals))
    }];

    // Call wrapPresentTest contract function
    writeContract({
      address: PRESENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: presentAbi,
      functionName: 'wrapPresentTest',
      args: [recipients, formData.title, formData.description, content],
      value: ethAmount, // Send ETH if needed
    });
  };

  const claimGift = async (presentId: string) => {
    // Call unwrapPresentTest contract function
    writeContract({
      address: PRESENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: presentAbi,
      functionName: 'unwrapPresentTest',
      args: [presentId as `0x${string}`],
    });
  };

  return {
    sendGift,
    claimGift,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error
  };
};
