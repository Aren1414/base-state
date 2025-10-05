import React from "react";
import { minikitConfig } from "../../../minikit.config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`;

  const cfg = (minikitConfig as any).miniapp;

  const embed = {
    version: cfg.version ?? "1",
    imageUrl,
    button: {
      title: "Launch Mini App",
      action: {
        type: "launch_miniapp",
        name: cfg.name,
        url: `${cfg.homeUrl}/share/${id}`,
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
    },
    other: {
      "fc:miniapp": JSON.stringify(embed),
      "fc:frame": JSON.stringify(embed),
    },
  };
}

// صفحه اصلی
export default async function SharePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`;
  const cfg = (minikitConfig as any).miniapp;

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      <h1>{cfg.name} — Shared NFT</h1>
      <p>This is the preview of your minted NFT card 👇</p>
      <img
        src={imageUrl}
        alt="Minted NFT"
        style={{ maxWidth: "400px", borderRadius: "12px" }}
      />
    </main>
  );
}
