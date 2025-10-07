import { minikitConfig } from "../../../minikit.config";

export default function Head({ params }: { params: { id: string } }) {
  const { id } = params;
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

  return (
    <>
      <link rel="canonical" href={`${canonical}/share/${id}`} />
      <meta property="og:url" content={`${canonical}/share/${id}`} />
      <meta name="twitter:url" content={`${canonical}/share/${id}`} />

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
