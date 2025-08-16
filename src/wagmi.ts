import { farcasterFrame, farcasterMiniApp } from "@farcaster/frame-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base, mainnet, arbitrumSepolia } from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";

const projectId = "3fbb6bba6f1de962d911bb5b5c9dba88";

export const config = createConfig({
  chains: [base, mainnet, arbitrumSepolia],
  connectors: [farcasterFrame(), farcasterMiniApp(), metaMask(), walletConnect({projectId})],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
