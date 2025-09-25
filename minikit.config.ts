const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL?.startsWith("http") ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`);

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  frame: {
    version: "1",
    name: "base-state",
    subtitle: "Track wallet activity",
    description: "Log your ping and view wallet stats",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["wallet", "analytics", "base"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Live wallet stats on Base",
    ogTitle: "BaseState Mini App",
    ogDescription: "Track your wallet activity and ping history",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    buttons: ["Log activity and show wallet stats"], 
  },
} as const;
