import { createPublicClient, http, parseAbiItem, getAddress } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { Gift } from '../types';
import presentAbi from '../abi/raw/Present.abi.json';
import { nftService } from './nftService';

const PRESENT_CONTRACT_ADDRESS = '0x5Ee00E5BA73d7ab2fe0B1d9aDa12212CB7ae28f0';
const BLOCKS_PER_BATCH = 1000000;
const ONE_WEEK_BLOCKS = 2000000; // Arbitrum ~200w blocks per week

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http('/api/rpc') // Use Vite proxy
});

interface WrapPresentEvent {
  presentId: string;
  sender: string;
  blockNumber: bigint;
  transactionHash: string;
}

interface PresentData {
  sender: string;
  recipients: string[];
  content: Array<{ tokens: string; amounts: bigint }>;
  title: string;
  description: string;
  status: number;
  expiryAt: bigint;
  distType: number;
  claimLimit: bigint;
  claimedCount: bigint;
}

export class BlockchainService {
  
  // Get current block number
  private async getCurrentBlock(): Promise<bigint> {
    const blockNumber = await publicClient.getBlockNumber();
    console.log(`📊 Current block number: ${blockNumber}`);
    return blockNumber;
  }

  // Fetch WrapPresentTest events in batches
  private async fetchWrapPresentEvents(): Promise<WrapPresentEvent[]> {
    console.log('🔍 Starting to fetch WrapPresent events...');
    
    const currentBlock = await this.getCurrentBlock();
    const fromBlock = currentBlock - BigInt(ONE_WEEK_BLOCKS);
    
    console.log(`📅 Searching blocks from ${fromBlock} to ${currentBlock}`);
    console.log(`📊 Total blocks to search: ${currentBlock - fromBlock}`);
    
    const batches: Promise<WrapPresentEvent[]>[] = [];
    let batchCount = 0;
    
    // Create parallel batch requests
    for (let start = fromBlock; start < currentBlock; start += BigInt(BLOCKS_PER_BATCH)) {
      const end = start + BigInt(BLOCKS_PER_BATCH) > currentBlock 
        ? currentBlock 
        : start + BigInt(BLOCKS_PER_BATCH);
      
      batchCount++;
      batches.push(this.fetchEventsBatch(start, end, batchCount));
    }
    
    console.log(`🚀 Created ${batchCount} parallel batches of ${BLOCKS_PER_BATCH} blocks each`);
    
    // Execute all batches in parallel
    console.log('⏳ Executing all batches in parallel...');
    const results = await Promise.all(batches);
    const allEvents = results.flat();
    
    console.log(`✅ Found total ${allEvents.length} WrapPresent events`);
    console.log(`📋 Events breakdown:`, results.map((batch, i) => `Batch ${i+1}: ${batch.length} events`));
    
    return allEvents;
  }

  // Fetch events for a specific block range
  private async fetchEventsBatch(fromBlock: bigint, toBlock: bigint, batchNumber: number): Promise<WrapPresentEvent[]> {
    try {
      console.log(`🔎 Batch ${batchNumber}: Searching blocks ${fromBlock} to ${toBlock}`);
      
      const logs = await publicClient.getLogs({
        address: getAddress(PRESENT_CONTRACT_ADDRESS),
        event: parseAbiItem('event WrapPresent(bytes32 indexed presentId, address sender)'),
        fromBlock,
        toBlock
      });

      console.log(`✅ Batch ${batchNumber}: Found ${logs.length} events`);

      return logs.map(log => ({
        presentId: log.topics[1] as string,
        sender: log.args.sender as string,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash
      }));
    } catch (error) {
      console.error(`❌ Batch ${batchNumber}: Error fetching events for blocks ${fromBlock}-${toBlock}:`, error);
      return [];
    }
  }

  // Get present details from contract
  private async getPresentDetails(presentId: string): Promise<PresentData | null> {
    try {
      console.log(`📦 Fetching details for present: ${presentId}`);
      
      // Get basic present info
      const presentInfo = await publicClient.readContract({
        address: getAddress(PRESENT_CONTRACT_ADDRESS),
        abi: presentAbi,
        functionName: 'getPresent',
        args: [presentId]
      }) as [string, string, string, number, bigint, number, bigint, bigint];

      // Get recipients separately
      const recipients = await publicClient.readContract({
        address: getAddress(PRESENT_CONTRACT_ADDRESS),
        abi: presentAbi,
        functionName: 'getPresentRecipients',
        args: [presentId]
      }) as string[];

      // Get content separately  
      const content = await publicClient.readContract({
        address: getAddress(PRESENT_CONTRACT_ADDRESS),
        abi: presentAbi,
        functionName: 'getPresentContent',
        args: [presentId]
      }) as Array<{ tokens: string; amounts: bigint }>;

      const [sender, title, description, status, expiryAt, distType, claimLimit, claimedCount] = presentInfo;

      const presentData = {
        sender,
        recipients,
        content,
        title,
        description,
        status,
        expiryAt,
        distType,
        claimLimit,
        claimedCount
      };

      console.log(`✅ Got Present Detail ${presentId.slice(0, 10)}... details:`, {
        title: presentData.title,
        status: presentData.status,
        recipientCount: presentData.recipients.length,
        contentCount: presentData.content.length,
        claimLimit: presentData.claimLimit,
        claimedCount: presentData.claimedCount,
        distType: presentData.distType
      });

      return presentData;
    } catch (error) {
      console.error(`❌ Error fetching present details for ${presentId}:`, error);
      return null;
    }
  }

  // Get NFT image URL from contract
  private async getNFTImage(presentId: string, isClaimed: boolean = false): Promise<string> {
    try {
      if (isClaimed) {
        // Get unwrapped NFT image for claimed gifts
        return await nftService.getUnwrappedNFTImage(presentId);
      } else {
        // Get wrapped NFT image for unclaimed gifts
        return await nftService.getWrappedNFTImage(presentId);
      }
    } catch (error) {
      console.error(`💥 Error getting NFT image for ${presentId}:`, error);
      // Fallback to placeholder
      return isClaimed ? '/images/unwrapped-gift-placeholder.svg' : '/images/wrapped-gift-placeholder.svg';
    }
  }

  // Calculate total ETH value from content
  private calculateTotalValue(content: Array<{ tokens: string; amounts: bigint }>): string {
    const ethContent = content.find(item => 
      item.tokens === '0x0000000000000000000000000000000000000000'
    );
    
    if (ethContent) {
      const value = (Number(ethContent.amounts) / 1e18).toString();
      console.log(`💰 ETH value calculated: ${value} ETH`);
      return value;
    }
    
    console.log(`⚠️ No ETH content found in present`);
    return '0';
  }

  // Main function to fetch and process gifts
  async fetchLiveGifts(): Promise<Gift[]> {
    try {
      console.log('🎁 === STARTING LIVE GIFTS FETCH ===');
      
      const events = await this.fetchWrapPresentEvents();
      
      if (events.length === 0) {
        console.log('⚠️ No WrapPresent events found in live gifts, returning empty array');
        return [];
      }
      
      console.log(`🔄 Processing ${events.length} events to get present details...`);
      
      // Get present details for all events in parallel
      const presentPromises = events.map(async (event, index) => {
        console.log(`📦 Processing event ${index + 1}/${events.length}: ${event.presentId}`);
        
        const details = await this.getPresentDetails(event.presentId);
        if (!details) {
          console.log(`❌ Failed to get details for present ${event.presentId}`);
          return null;
        }
        
        // 目前来说, status == 0 表示 active, 暂时只根据状态来考虑
        if (details.status !== 0) {
          console.log(`⏭️ Skipping present ${event.presentId} - status: ${details.status} (not active)`);
          return null;
        }
        
        const nftImage = await this.getNFTImage(event.presentId, false); // Live gifts are not claimed
        const totalValue = this.calculateTotalValue(details.content);
        
        const gift: Gift = {
          id: event.presentId,
          title: details.title || 'Untitled Gift',
          from: details.sender,
          to: details.recipients.length === 0 ? 'everyone' : details.recipients[0],
          recipients: details.recipients,
          amount: totalValue,
          description: details.description || '',
          limit: Number(details.claimLimit),
          claimed: Number(details.claimedCount),
          isClaimed: false,
          nftImage,
          createdAt: Date.now() - Math.random() * 604800000 // Random time within last week
        };

        console.log(`✅ Created gift object:`, {
          id: gift.id.slice(0, 10) + '...',
          title: gift.title,
          amount: gift.amount,
          to: gift.to
        });

        return gift;
      });
      
      const presents = await Promise.all(presentPromises);
      const validPresents = presents.filter(p => p !== null) as Gift[];
      
      console.log(`📊 Valid presents found: ${validPresents.length}`);
      
      // Sort by amount (descending) and take top 50
      const sortedPresents = validPresents
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        .slice(0, 50);
      
      console.log(`🏆 Top presents by value:`, sortedPresents.slice(0, 5).map(p => ({
        title: p.title,
        amount: p.amount + ' ETH'
      })));
      
      console.log(`🎁 === LIVE GIFTS FETCH COMPLETED: ${sortedPresents.length} gifts ===`);
      
      return sortedPresents;
        
    } catch (error) {
      console.error('💥 Critical error in fetchLiveGifts:', error);
      return [];
    }
  }

  // Fetch historic gifts (unwrapped presents)
  async fetchHistoricGifts(): Promise<Gift[]> {
    try {
      console.log('📚 === STARTING HISTORIC GIFTS FETCH ===');
      
      const events = await this.fetchWrapPresentEvents();
      
      if (events.length === 0) {
        console.log('⚠️ No WrapPresent events found in historic gifts, returning empty array');
        return [];
      }
      
      console.log(`🔄 Processing ${events.length} events to get present details...`);
      
      // Get present details for all events in parallel
      const presentPromises = events.map(async (event, index) => {
        console.log(`📦 Processing event ${index + 1}/${events.length}: ${event.presentId}`);
        
        const details = await this.getPresentDetails(event.presentId);
        if (!details) {
          console.log(`❌ Failed to get details for present ${event.presentId}`);
          return null;
        }
        
        // Only include unwrapped, taken back, or expired presents
        if (details.status === 0) {
          console.log(`⏭️ Skipping present ${event.presentId} - status: ${details.status} (still active)`);
          return null;
        }
        
        const nftImage = await this.getNFTImage(event.presentId, true); // Historic gifts are claimed
        const totalValue = this.calculateTotalValue(details.content);
        
        const gift: Gift = {
          id: event.presentId,
          title: details.title || 'Untitled Gift',
          from: details.sender,
          to: details.recipients.length === 0 ? 'everyone' : details.recipients[0],
          recipients: details.recipients,
          amount: totalValue,
          description: details.description || '',
          limit: Number(details.claimLimit),
          claimed: Number(details.claimedCount),
          isClaimed: true,
          nftImage,
          createdAt: Date.now() - Math.random() * 604800000 // Random time within last week
        };

        console.log(`✅ Created historic gift object:`, {
          id: gift.id.slice(0, 10) + '...',
          title: gift.title,
          amount: gift.amount,
          status: details.status
        });

        return gift;
      });
      
      const presents = await Promise.all(presentPromises);
      const validPresents = presents.filter(p => p !== null) as Gift[];
      
      console.log(`📊 Valid historic presents found: ${validPresents.length}`);
      
      // Sort by amount (descending) and take top 50
      const sortedPresents = validPresents
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        .slice(0, 50);
      
      console.log(`📚 === HISTORIC GIFTS FETCH COMPLETED: ${sortedPresents.length} gifts ===`);
      
      return sortedPresents;
        
    } catch (error) {
      console.error('💥 Critical error in fetchHistoricGifts:', error);
      return [];
    }
  }
}

export const blockchainService = new BlockchainService();
