import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import wrappedNFTAbi from '../abi/code/abi/raw/WrappedPresentNFT.abi.json';
import unwrappedNFTAbi from '../abi/code/abi/raw/UnwrappedPresentNFT.abi.json';

// NFT Contract addresses
const WRAPPED_NFT_ADDRESS = '0x834D49527c710faBAD5f4f737582afABa8EA3CCD';
const UNWRAPPED_NFT_ADDRESS = '0xed96CA9c2df0c395845b7Ed63F159E8389875Dd5';

// Create public client for reading contract data
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http()
});

export class NFTService {
  // Get NFT image for wrapped present (before claiming)
  async getWrappedNFTImage(presentId: string): Promise<string> {
    try {
      console.log(`🖼️ Getting wrapped NFT image for presentId: ${presentId}`);
      
      // Convert presentId to tokenId (assuming 1:1 mapping)
      const tokenId = BigInt(presentId);
      
      // Get tokenURI from wrapped NFT contract
      const tokenURI = await publicClient.readContract({
        address: WRAPPED_NFT_ADDRESS as `0x${string}`,
        abi: wrappedNFTAbi,
        functionName: 'tokenURI',
        args: [tokenId],
      }) as string;
      
      console.log(`📄 Wrapped NFT tokenURI: ${tokenURI}`);
      
      // If tokenURI is a data URI, return it directly
      if (tokenURI.startsWith('data:')) {
        return this.extractImageFromDataURI(tokenURI);
      }
      
      // If tokenURI is an HTTP URL, fetch metadata
      if (tokenURI.startsWith('http')) {
        return await this.fetchImageFromMetadata(tokenURI);
      }
      
      // Fallback to placeholder
      return this.getPlaceholderImage('wrapped');
      
    } catch (error) {
      console.error('💥 Error getting wrapped NFT image:', error);
      return this.getPlaceholderImage('wrapped');
    }
  }
  
  // Get NFT image for unwrapped present (after claiming)
  async getUnwrappedNFTImage(presentId: string): Promise<string> {
    try {
      console.log(`🖼️ Getting unwrapped NFT image for presentId: ${presentId}`);
      
      // Convert presentId to tokenId
      const tokenId = BigInt(presentId);
      
      // Get tokenURI from unwrapped NFT contract
      const tokenURI = await publicClient.readContract({
        address: UNWRAPPED_NFT_ADDRESS as `0x${string}`,
        abi: unwrappedNFTAbi,
        functionName: 'tokenURI',
        args: [tokenId],
      }) as string;
      
      console.log(`📄 Unwrapped NFT tokenURI: ${tokenURI}`);
      
      // If tokenURI is a data URI, return it directly
      if (tokenURI.startsWith('data:')) {
        return this.extractImageFromDataURI(tokenURI);
      }
      
      // If tokenURI is an HTTP URL, fetch metadata
      if (tokenURI.startsWith('http')) {
        return await this.fetchImageFromMetadata(tokenURI);
      }
      
      // Fallback to placeholder
      return this.getPlaceholderImage('unwrapped');
      
    } catch (error) {
      console.error('💥 Error getting unwrapped NFT image:', error);
      return this.getPlaceholderImage('unwrapped');
    }
  }
  
  // Extract image from data URI (base64 encoded JSON)
  private extractImageFromDataURI(dataURI: string): string {
    try {
      if (dataURI.startsWith('data:application/json;base64,')) {
        const base64Data = dataURI.replace('data:application/json;base64,', '');
        const jsonData = JSON.parse(atob(base64Data));
        return jsonData.image || this.getPlaceholderImage('default');
      }
      return dataURI; // Return as-is if it's already an image data URI
    } catch (error) {
      console.error('💥 Error extracting image from data URI:', error);
      return this.getPlaceholderImage('default');
    }
  }
  
  // Fetch image from metadata URL
  private async fetchImageFromMetadata(metadataURL: string): Promise<string> {
    try {
      const response = await fetch(metadataURL);
      const metadata = await response.json();
      return metadata.image || this.getPlaceholderImage('default');
    } catch (error) {
      console.error('💥 Error fetching metadata:', error);
      return this.getPlaceholderImage('default');
    }
  }
  
  // Get placeholder image based on type
  private getPlaceholderImage(type: 'wrapped' | 'unwrapped' | 'default'): string {
    switch (type) {
      case 'wrapped':
        return '/images/wrapped-gift-placeholder.svg';
      case 'unwrapped':
        return '/images/unwrapped-gift-placeholder.svg';
      default:
        return '/images/gift-placeholder.svg';
    }
  }
}

// Export singleton instance
export const nftService = new NFTService();
