// src/context/index.tsx
"use client";

import {
  bitcoinAdapter,
  bitcoinNetworks,
  evmNetworks,
  solanaAdapter,
  solanaNetworks,
  projectId,
  wagmiAdapter,
} from "@/config";

import { createAppKit } from "@reown/appkit/react";
import React, { useState, type ReactNode } from "react";
import type { AppKitNetwork } from "@reown/appkit/networks";

import {
  DefaultSIWX,
  LocalStorage,
} from "@reown/appkit-siwx";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { WagmiProvider } from "wagmi";

// Combine all networks
const allNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  ...evmNetworks,
  ...bitcoinNetworks,
  ...solanaNetworks,
];

// AppKit metadata
const metadata = {
  name: "PointSwap",
  description: "PointSwap presale",

  // IMPORTANT:
  // Change this to your actual website URL in production.
  url: "https://github.com/0xonerb/next-reown-appkit-ssr",

  icons: [
    "https://avatars.githubusercontent.com/u/179229932",
  ],
};

// Create AppKit once at module level
export const modal = createAppKit({
  adapters: [
    bitcoinAdapter,
    wagmiAdapter,
    solanaAdapter,
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

  // TEMPORARY DIAGNOSTIC:
  // Use Reown's built-in browser LocalStorage.
  // This removes Supabase from the SIWX process.
  siwx: new DefaultSIWX({
    storage: new LocalStorage({
      key: "@appkit/siwx",
    }),
  }),
});

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
