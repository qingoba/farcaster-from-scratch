import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NewGiftForm } from '../types';
import presentAbi from '../Present.abi';
import { ETH_TOKEN } from './tokens';

const PRESENT_CONTRACT_ADDRESS = '0x3B3cF7ee8dbCDDd8B8451e38269D982F351ca3db';

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

    // Call wrapPresent contract function
    writeContract({
      address: PRESENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: presentAbi,
      functionName: 'wrapPresent',
      args: [recipients, content],
      value: ethAmount, // Send ETH if needed
    });
  };

  return {
    sendGift,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error
  };
};
