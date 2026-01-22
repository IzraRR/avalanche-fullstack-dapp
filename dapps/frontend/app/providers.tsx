'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

// Get WalletConnect Project ID from environment
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn(
    '⚠️ NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set. WalletConnect may not work properly.'
  );
}

const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
    walletConnect({
      projectId: walletConnectProjectId || '',
    }),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}