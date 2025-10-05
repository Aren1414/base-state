const rawUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || "base-state.vercel.app";
const ROOT_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  frame: {
    version: "1",
    name: "base-state",
    subtitle: "",
    description: "Your onchain identity card powered by Base & Farcaster.",
    screenshotUrls: [`${ROOT_URL}/hero.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["nft", "identity", "base", "farcaster"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Mint your BaseState NFT in one tap.",
    ogTitle: "BaseState NFT",
    ogDescription: "Mint and share your BaseState NFT Card instantly.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
