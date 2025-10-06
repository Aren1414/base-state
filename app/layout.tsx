import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "../minikit.config";
import { RootProvider } from "./rootProvider";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import FrameReady from "./components/FrameReady";
import WalletCheck from "./components/WalletCheck";
import "./globals.css";
import React from "react";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  // allow share page to provide its own metadata (page-level meta)
  if (params?.id) return {};

  const cfg = (minikitConfig as any).miniapp ?? {};
  const ensureHttps = (u?: string) =>
    !u ? undefined : u.startsWith("http") ? u : `https://${u.replace(/^\/+/, "")}`;

  // prefer platform canonicalLink (if you configured it in minikit.config)
  const canonicalCandidate = ensureHttps(cfg.canonicalLink ?? cfg.homeUrl);

  const imageUrl =
    ensureHttps(cfg.ogImageUrl) ||
    ensureHttps(cfg.heroImageUrl) ||
    ensureHttps(cfg.splashImageUrl) ||
    `${ensureHttps(cfg.homeUrl)}/embed.png`;

  const embed = {
    version: cfg.version ?? "1",
    imageUrl,
    button: {
      title: "Launch Mini App",
      action: {
        type: "launch_miniapp",
        name: cfg.name,
        // <-- USE canonicalCandidate to avoid Base appending /share/:id
        url: canonicalCandidate ?? ensureHttps(cfg.homeUrl),
        splashImageUrl: ensureHttps(cfg.splashImageUrl),
        splashBackgroundColor: cfg.splashBackgroundColor ?? "#000000",
      },
    },
  };

  return {
    title: cfg.ogTitle ?? cfg.name,
    description: cfg.ogDescription ?? cfg.description,
    openGraph: {
      title: cfg.ogTitle ?? cfg.name,
      description: cfg.ogDescription ?? cfg.description,
      images: [imageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(embed),
      "fc:frame": JSON.stringify(embed),
    },
  };
}

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ variable: "--font-source-code-pro", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
