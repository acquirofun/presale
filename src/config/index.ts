// src/config/index.ts
import {
  bitcoin,
  bitcoinTestnet,
  mainnet,
  arbitrum,
  polygon,
  optimism,
  base,
  bsc,
  avalanche,
  sepolia,
  arbitrumSepolia,
  polygonAmoy,
  optimismSepolia,
  baseSepolia,
  solana,
  solanaDevnet,
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { BitcoinAdapter } from "@reown/appkit-adapter-bitcoin";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

export const bitcoinNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  bitcoin,
  bitcoinTestnet,
];

// Comprehensive list of major EVM Mainnets and Testnets
export const evmNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  arbitrum,
  polygon,
  optimism,
  base,
  bsc,
  avalanche,
  sepolia,
  arbitrumSepolia,
  polygonAmoy,
  optimismSepolia,
  baseSepolia,
];

export const solanaNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  solana,
  solanaDevnet,
];

export const networks = [
  ...bitcoinNetworks,
  ...evmNetworks,
  ...solanaNetworks,
];

// Set up Adapters
export const bitcoinAdapter = new BitcoinAdapter();

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: evmNetworks,
  ssr: true,
});

export const solanaAdapter = new SolanaAdapter({
  projectId,
  networks: solanaNetworks,
  ssr: true,
});