'use client';
import { useWalletClient } from 'wagmi';
import { useEffect } from 'react';

export default function WalletCheck() {
  const { data: walletClient } = useWalletClient();
  useEffect(() => {
    if (!walletClient) {
      console.warn("⚠️ Wallet not ready — Farcaster may not restore signer after refresh");
    }
  }, [walletClient]);
  return null;
}
