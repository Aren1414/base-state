import React from "react";
import { minikitConfig } from "../../../minikit.config";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cfg = (minikitConfig as any).miniapp;

  const ensureHttps = (u?: string) =>
    !u ? undefined : u.startsWith("http") ? u : `https://${u.replace(/^\/+/, "")}`;

  const appHome = ensureHttps(cfg.homeUrl);
  const canonical = ensureHttps(cfg.canonicalLink ?? cfg.homeUrl);
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`;

  const embed = {
    version: cfg.version ?? "1",
    imageUrl,
    button: {
      title: "Launch Mini App",
      action: {
        type: "launch_frame",
        name: cfg.name,
        url: appHome,
        splashImageUrl: cfg.splashImageUrl,
        splashBackgroundColor: cfg.splashBackgroundColor,
      },
    },
    app: {
      canonical,
    },
  };

  return {
    title: `${cfg.name} — Shared NFT`,
    description: cfg.ogDescription ?? cfg.description,
    openGraph: {
      title: cfg.ogTitle ?? cfg.name,
      description: cfg.ogDescription ?? cfg.description,
      images: [imageUrl],
      url: `${canonical}/share/${id}`,
    },
    other: {
      "fc:miniapp": JSON.stringify(embed),
      "fc:frame": JSON.stringify(embed),
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cfg = (minikitConfig as any).miniapp;
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`;

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
