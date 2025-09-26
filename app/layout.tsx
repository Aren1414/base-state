import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    other: {
      "fc:frame": JSON.stringify({
        version: minikitConfig.frame.version,
        imageUrl: minikitConfig.frame.heroImageUrl,
        button: {
          title: "Launch Mini App",
          action: {
            type: "launch_frame",
            name: minikitConfig.frame.name,
            url: minikitConfig.frame.homeUrl,
            splashImageUrl: minikitConfig.frame.splashImageUrl,
            splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
          },
        },
      }),
    },
  };
}

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ variable: "--font-source-code-pro", subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RootProvider>
      <html lang="en">
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          <SafeArea>
            <FrameReady />
            <WalletCheck />
            {children}
          </SafeArea>
        </body>
      </html>
    </RootProvider>
  );
}


'use client';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useEffect } from 'react';

function FrameReady() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);
  return null;
}


'use client';
import { useWalletClient } from 'wagmi';
import { useEffect } from 'react';

function WalletCheck() {
  const { data: walletClient } = useWalletClient();
  useEffect(() => {
    if (!walletClient) {
      console.warn("⚠️ Wallet not ready — Farcaster may not restore signer after refresh");
      // Optional: trigger fallback signer or show connect button
    }
  }, [walletClient]);
  return null;
}
