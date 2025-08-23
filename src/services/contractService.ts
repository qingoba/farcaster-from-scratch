import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NewGiftForm } from '../types';
import presentAbi from '../Present.abi';
import { ETH_TOKEN } from './tokens';

const PRESENT_CONTRACT_ADDRESS = '0x8cED4381845b1fB450C8D2279ed4c888A38fC08d';

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

    // Distribution type: 1 = equal split, 3 = random split
    let distributionType = formData.distributionType === 'equal' ? 1 : 3;

    if (recipients.length != 0 && formData.distributionType === 'equal') {
      distributionType = 2;
    }
      

    // Calculate claim limit
    const claimLimit = parseInt(formData.shares);

    // Call wrapPresent contract function
    writeContract({
      address: PRESENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: presentAbi,
      functionName: 'wrapPresent',
      args: [
        recipients,
        formData.title,
        formData.description,
        content,
        distributionType,
        BigInt(claimLimit)
      ],
      value: ethAmount, // Send ETH if needed
      gas: 500000n, // 500k gas limit
      gasPrice: 100000000n, // 0.1 gwei
    });
  };

  const claimGift = async (presentId: string) => {
    // Call unwrapPresent contract function
    writeContract({
      address: PRESENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: presentAbi,
      functionName: 'claimPresent',
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
