'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
    walletConnect({
      projectId: '3a6154243dd7e4c85ea38cb953333cd7', // 👉 Get from https://cloud.walletconnect.com
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