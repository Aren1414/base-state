const rawUrl =
  process.env.NEXT_PUBLIC_URL ||
  process.env.VERCEL_URL ||
  "base-state.vercel.app";

export const ROOT_URL = rawUrl.startsWith("http")
  ? rawUrl
  : `https://${rawUrl}`;

export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "BaseState",
    subtitle: "",
    description: "",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0a0f2c",
    homeUrl: ROOT_URL,
    canonicalLink: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: [],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "",
    ogTitle: "Base State Card",
    ogDescription: "Mint your personalized Base State NFT",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
