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
  ton,
  tonTestnet,
} from "@reown/appkit/networks";

import type { AppKitNetwork } from "@reown/appkit/networks";

import { BitcoinAdapter } from "@reown/appkit-adapter-bitcoin";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { TonAdapter } from "@reown/appkit-adapter-ton";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";

export { projectId };

// ─────────────────────────────────────────────
// Bitcoin
// ─────────────────────────────────────────────

export const bitcoinNetworks: [
  AppKitNetwork,
  ...AppKitNetwork[]
] = [
  bitcoin,
  bitcoinTestnet,
];

// ─────────────────────────────────────────────
// EVM
// ─────────────────────────────────────────────

export const evmNetworks: [
  AppKitNetwork,
  ...AppKitNetwork[]
] = [
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

// ─────────────────────────────────────────────
// Solana
// ─────────────────────────────────────────────

export const solanaNetworks: [
  AppKitNetwork,
  ...AppKitNetwork[]
] = [
  solana,
  solanaDevnet,
];

// ─────────────────────────────────────────────
// TON
// ─────────────────────────────────────────────

export const tonNetworks: [
  AppKitNetwork,
  ...AppKitNetwork[]
] = [
  ton,
  tonTestnet,
];

// ─────────────────────────────────────────────
// All networks
// ─────────────────────────────────────────────

export const networks: AppKitNetwork[] = [
  ...bitcoinNetworks,
  ...evmNetworks,
  ...solanaNetworks,
  ...tonNetworks,
];

// ─────────────────────────────────────────────
// Adapters
// ─────────────────────────────────────────────

export const bitcoinAdapter = new BitcoinAdapter();

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: evmNetworks,
  ssr: true,
});

export const solanaAdapter = new SolanaAdapter();

export const tonAdapter = new TonAdapter({
  projectId,
});