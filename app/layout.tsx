import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "../minikit.config";
import { RootProvider } from "./rootProvider";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import FrameReady from "./components/FrameReady";
import WalletCheck from "./components/WalletCheck";
import "./globals.css";
import React from "react";

/**
 * Generate site-level metadata and Farcaster embed (fc:miniapp / fc:frame).
 * We support both `miniapp` (new) and `frame` (legacy) keys in minikitConfig.
 */
export async function generateMetadata(): Promise<Metadata> {
  // support both shapes (miniapp preferred)
  const cfg = (minikitConfig as any).miniapp ?? (minikitConfig as any).frame ?? {};

  // ensure we produce a full https URL if possible
  const maybeEnsureHttps = (u: string | undefined) => {
    if (!u) return undefined;
    return u.startsWith("http") ? u : `https://${u.replace(/^\/+/, "")}`;
  };

  const imageUrl =
    maybeEnsureHttps(cfg.ogImageUrl) ||
    maybeEnsureHttps(cfg.heroImageUrl) ||
    maybeEnsureHttps(cfg.splashImageUrl) ||
    (cfg.homeUrl ? `${maybeEnsureHttps(cfg.homeUrl)}/embed.png` : undefined) ||
    "";

  const embed = {
    version: cfg.version ?? "1",
    imageUrl,
    button: {
      title: "Launch Mini App",
      action: {
        type: cfg.homeUrl ? "launch_miniapp" : "launch_frame",
        name: cfg.name ?? "Mini App",
        url: maybeEnsureHttps(cfg.homeUrl) ?? "/",
        splashImageUrl: maybeEnsureHttps(cfg.splashImageUrl),
        splashBackgroundColor: cfg.splashBackgroundColor ?? "#000000",
      },
    },
  };

  return {
    title: cfg.ogTitle ?? cfg.name ?? "Mini App",
    description: cfg.ogDescription ?? cfg.description ?? "",
    openGraph: {
      title: cfg.ogTitle ?? cfg.name,
      description: cfg.ogDescription ?? cfg.description,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 800,
            },
          ]
        : undefined,
    },
    other: {
      // fc:miniapp is the canonical embed per spec; fc:frame kept for backwards compat.
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
