"use client";

import {
  bitcoinAdapter,
  bitcoinNetworks,
  evmNetworks,
  solanaAdapter,
  solanaNetworks,
  tonAdapter,
  tonNetworks,
  projectId,
  wagmiAdapter,
} from "@/config";

import { createAppKit } from "@reown/appkit/react";

import React, {
  useState,
  type ReactNode,
} from "react";

import type { AppKitNetwork } from "@reown/appkit/networks";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { WagmiProvider } from "wagmi";

// ─────────────────────────────────────────────
// All supported networks
// ─────────────────────────────────────────────

const allNetworks: [
  AppKitNetwork,
  ...AppKitNetwork[]
] = [
  ...evmNetworks,
  ...bitcoinNetworks,
  ...solanaNetworks,
  ...tonNetworks,
];

// ─────────────────────────────────────────────
// AppKit metadata
// ─────────────────────────────────────────────

const metadata = {
  name: "SwapCredits",
  description: "SwapCredits presale",
  url: "https://www.swapcredits.xyz",
  icons: [
    "/favicon.jpeg",
  ],
};

// ─────────────────────────────────────────────
// Reown AppKit
// ─────────────────────────────────────────────
//
// SIWX is intentionally disabled for now.
// This prevents the TON "The signature is not valid"
// error while we verify TON wallet/payment separately.
//

export const modal = createAppKit({
  adapters: [
    bitcoinAdapter,
    wagmiAdapter,
    solanaAdapter,
    tonAdapter,
  ],

  projectId: projectId || "",

  networks: allNetworks,

  metadata,

  themeMode: "dark",

  features: {
    analytics: true,
    socials: [],
    email: false,
  },
});

// ─────────────────────────────────────────────
// React providers
// ─────────────────────────────────────────────

function ContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () => new QueryClient()
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;