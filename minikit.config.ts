// minikit.config.ts
// ensure a fully-qualified https root URL
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
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    // <-- IMPORTANT: بعد از انتشار، این مقدار را با canonical رسمی پلتفرم جایگزین کن:
    // e.g. "https://farcaster.xyz/miniapps/<APP_ID>/<APP_SLUG>"
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
