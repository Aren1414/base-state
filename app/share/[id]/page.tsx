import React from "react";
import { minikitConfig } from "../../../minikit.config";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  const cfg = (minikitConfig as any).miniapp;

  const ensureHttps = (u?: string) => {
    if (!u) return u;
    return u.startsWith("http") ? u : `https://${u.replace(/^\/+/, "")}`;
  };

  const appHome = ensureHttps(cfg.canonicalLink ?? cfg.homeUrl);
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`;

  const embed = {
    version: cfg.version ?? "1",
    imageUrl,
    button: {
      title: "Launch Mini App",
      action: {
        type: "launch_miniapp",
        name: cfg.name,
        url: appHome,
        splashImageUrl: cfg.splashImageUrl,
        splashBackgroundColor: cfg.splashBackgroundColor,
      },
    },
  };

  return {
    title: `${cfg.name} — Shared NFT`,
    description: cfg.ogDescription ?? cfg.description,
    openGraph: {
      title: cfg.ogTitle ?? cfg.name,
      description: cfg.ogDescription ?? cfg.description,
      images: [imageUrl],
      url: `${appHome}/share/${id}`,
    },
    other: {
      "fc:miniapp": JSON.stringify(embed),
      "fc:frame": JSON.stringify(embed),
    },
  };
}

export default function SharePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cfg = (minikitConfig as any).miniapp;
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`;

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      <h1>{cfg.name} — Shared NFT</h1>
      <p>This is the preview of your minted NFT card 👇</p>
      <img
        src={imageUrl}
        alt="Minted NFT"
        style={{
          maxWidth: "400px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}
      />
    </main>
  );
}
