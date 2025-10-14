const rawUrl =
  process.env.NEXT_PUBLIC_URL ||
  process.env.VERCEL_URL ||
  "base-state.vercel.app";

export const ROOT_URL = rawUrl.startsWith("http")
  ? rawUrl
  : `https://${rawUrl}`;

const IMAGE_VERSION = "v=2";

export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "base-state",
    subtitle: "",
    description: "",
    screenshotUrls: [`${ROOT_URL}/screenshot.png?${IMAGE_VERSION}`],
    iconUrl: `${ROOT_URL}/icon.png?${IMAGE_VERSION}`,
    splashImageUrl: `${ROOT_URL}/splash.png?${IMAGE_VERSION}`,
    splashBackgroundColor: "#0a0f2c",
    homeUrl: ROOT_URL,
    canonicalLink: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: [],
    heroImageUrl: `${ROOT_URL}/hero.png?${IMAGE_VERSION}`,
    tagline: "",
    ogTitle: "Base State Card",
    ogDescription: "Mint your personalized Base State NFT",
    ogImageUrl: `${ROOT_URL}/hero.png?${IMAGE_VERSION}`,
  },
} as const;
