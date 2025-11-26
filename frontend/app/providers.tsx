"use client";

import type { ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";
import { MetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { MetaMaskEthersSignerProvider } from "@/hooks/metamask/useMetaMaskEthersSigner";

// Local Hardhat network
const localhost = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
} as const;

// Sepolia testnet
const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
} as const;

// Use a local-only config for RainbowKit to avoid external API calls
const config = getDefaultConfig({
  appName: "Encrypted Study Tracker",
  projectId: "your-project-id", // Use a valid project ID or disable analytics
  chains: [localhost, sepolia],
  ssr: true,
  // Disable analytics and other external features for local development
  appDescription: "Encrypted Study Tracker - Local Development",
  appUrl: "http://localhost:3000", // Match the actual server port
  appIcon: "http://localhost:3000/study-tracker-logo.svg", // Full URL for icon
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <MetaMaskProvider>
      <MetaMaskEthersSignerProvider initialMockChains={{
        31337: "http://localhost:8545", // Enable mock for local development
        11155111: undefined // Sepolia mainnet (no mock needed)
      }}>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
      </MetaMaskEthersSignerProvider>
    </MetaMaskProvider>
  );
}
