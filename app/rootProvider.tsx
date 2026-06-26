'use client';

import { ReactNode } from 'react';
import {
  createConfig,
  http,
  WagmiProvider,
} from 'wagmi';
import { base } from 'wagmi/chains';

import {
  injected,
  coinbaseWallet,
} from 'wagmi/connectors';

import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import '@coinbase/onchainkit/styles.css';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected(), // Base App (in-app browser)
    coinbaseWallet({ appName: 'BaseState' }), // Coinbase Wallet
    farcasterMiniApp(), // Farcaster Mini App
  ],
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          miniKit={{ enabled: true, autoConnect: true }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
