import { minikitConfig } from "../../../minikit.config";

export default async function Head({ params }: { params: { id: string } }) {
  const { id } = params;
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`;

  const cfg = (minikitConfig as any).miniapp;

  const embed = {
    version: cfg.version ?? "1",
    imageUrl,
    button: {
      title: "View Minted Card",
      action: {
        type: "launch_miniapp",
        name: cfg.name,
        
        url: cfg.homeUrl,
        splashImageUrl: cfg.splashImageUrl,
        splashBackgroundColor: cfg.splashBackgroundColor,
      },
    },
  };

  return (
    <>
      <title>{cfg.name} — Shared NFT</title>
      <meta name="description" content={cfg.ogDescription ?? cfg.description} />

      <meta name="fc:miniapp" content={JSON.stringify(embed)} />
      <meta name="fc:frame" content={JSON.stringify(embed)} />

      <meta property="og:title" content={`${cfg.name} — Shared NFT`} />
      <meta property="og:description" content={cfg.ogDescription ?? cfg.description} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
