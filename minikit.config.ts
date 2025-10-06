// ensure we produce a full https URL on Vercel / local envs
const rawUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || "base-state.vercel.app";
export const ROOT_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

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
    // make sure these are full URLs (ROOT_URL built above)
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    // canonicalLink: when you publish the miniapp (hosted manifest / Base/Farcaster dashboard)
    // replace this with the canonical miniapp URL provided by the platform, e.g.:
    // "https://farcaster.xyz/miniapps/<APP_ID>/<APP_SLUG>"
    // Until you have a platform canonical, it will fallback to homeUrl.
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
