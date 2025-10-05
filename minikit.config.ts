const ROOT_URL = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL;

/**
 * MiniApp configuration object following Farcaster MiniApp spec.
 * @see https://docs.base.org/mini-apps/quickstart/create-new-miniapp
 */
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
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
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
