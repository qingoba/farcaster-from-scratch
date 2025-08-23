import { Gift } from '../types';
import { blockchainService } from './blockchain';
import { mockGifts, mockHistoricGifts } from '../data/mockData';

export class GiftService {
  private liveGiftsCache: Gift[] = [];
  private historicGiftsCache: Gift[] = [];
  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Check if cache is still valid
  private isCacheValid(): boolean {
    const isValid = Date.now() - this.lastFetchTime < this.CACHE_DURATION;
    console.log(`🗄️ Cache valid: ${isValid} (age: ${Math.round((Date.now() - this.lastFetchTime) / 1000)}s)`);
    return isValid;
  }

  // Fetch live gifts (unclaimed)
  async getLiveGifts(userAddress?: string): Promise<Gift[]> {
    console.log('🔴 GiftService.getLiveGifts() called');
    
    if (this.liveGiftsCache.length > 0 && this.isCacheValid()) {
      console.log(`✅ Using cached live gifts: ${this.liveGiftsCache.length} items`);
      return this.liveGiftsCache;
    }

    try {
      console.log('🌐 Fetching live gifts from blockchain...');
      const gifts = await blockchainService.fetchLiveGifts(userAddress);
      
      console.log(`📥 Received ${gifts.length} live gifts from blockchain`);
      
      this.liveGiftsCache = gifts;
      this.lastFetchTime = Date.now();
      
      return gifts;
    } catch (error) {
      console.error('💥 Failed to fetch live gifts, using mock data:', error);
      const mockLiveGifts = mockGifts.filter(gift => !gift.isClaimed);
      console.log(`🎭 Using ${mockLiveGifts.length} mock live gifts`);
      return mockLiveGifts;
    }
  }

  // Fetch historic gifts (claimed)
  async getHistoricGifts(userAddress?: string): Promise<Gift[]> {
    console.log('🟡 GiftService.getHistoricGifts() called');
    
    if (this.historicGiftsCache.length > 0 && this.isCacheValid()) {
      console.log(`✅ Using cached historic gifts: ${this.historicGiftsCache.length} items`);
      return this.historicGiftsCache;
    }

    try {
      console.log('🌐 Fetching historic gifts from blockchain...');
      const gifts = await blockchainService.fetchHistoricGifts(userAddress);
      
      console.log(`📥 Received ${gifts.length} historic gifts from blockchain`);
      
      this.historicGiftsCache = gifts;
      this.lastFetchTime = Date.now();
      
      return gifts;
    } catch (error) {
      console.error('💥 Failed to fetch historic gifts, using mock data:', error);
      console.log(`📥 Using ${mockHistoricGifts.length} mock historic gifts`);
      return mockHistoricGifts;
    }
  }

  // Get all gifts (live + historic)
  async getAllGifts(userAddress?: string): Promise<Gift[]> {
    console.log('🔵 GiftService.getAllGifts() called');
    
    const [liveGifts, historicGifts] = await Promise.all([
      this.getLiveGifts(userAddress),
      this.getHistoricGifts(userAddress)
    ]);
    
    const totalGifts = [...liveGifts, ...historicGifts];
    console.log(`📊 Total gifts: ${totalGifts.length} (Live: ${liveGifts.length}, Historic: ${historicGifts.length})`);
    
    return totalGifts;
  }

  // Clear cache (useful for manual refresh)
  clearCache(): void {
    console.log('🗑️ Clearing gift cache');
    this.liveGiftsCache = [];
    this.historicGiftsCache = [];
    this.lastFetchTime = 0;
  }

  // Get gifts for a specific user
  async getUserGifts(userAddress: string): Promise<{
    claimable: Gift[];
    received: Gift[];
    sent: Gift[];
  }> {
    console.log(`👤 Getting gifts for user: ${userAddress}`);
    const allGifts = await this.getAllGifts();
    
    const result = {
      claimable: allGifts.filter(gift => 
        !gift.isClaimed && (
          gift.to === userAddress || 
          (gift.to === 'everyone' && gift.limit && gift.claimed < gift.limit) ||
          (gift.recipients && gift.recipients.includes(userAddress))
        )
      ),
      received: allGifts.filter(gift => 
        gift.isClaimed && (
          gift.to === userAddress || 
          gift.to === 'everyone' ||
          (gift.recipients && gift.recipients.includes(userAddress))
        )
      ),
      sent: allGifts.filter(gift => gift.from === userAddress)
    };

    console.log(`👤 User gifts:`, {
      claimable: result.claimable.length,
      received: result.received.length,
      sent: result.sent.length
    });

    return result;
  }
}

export const giftService = new GiftService();
