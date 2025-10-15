const rawUrl =
  process.env.NEXT_PUBLIC_URL ||
  process.env.VERCEL_URL ||
  "base-state.vercel.app";

export const CANONICAL_DOMAIN = rawUrl.replace(/^https?:\/\//, "");

export const ROOT_URL = rawUrl.startsWith("http")
  ? rawUrl
  : `https://${rawUrl}`;

export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjM4NDQyOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDcyNWJBQjMyMTFiNTg1NDk2OTBkNzNiYjc1OWI1QjBkRmQzZWVBOTYifQ",
    payload: "eyJkb21haW4iOiJiYXNlLXN0YXRlLnZlcmNlbC5hcHAifQ",
    signature: "i6ZhmnIIkucensAFu5OQLmjHkaG9keiCtjafY7vfggJIZ4q75nNAlWJo3fB3FxboI+hqHkoDa+Q6kkextlT3vxs="
  },
  miniapp: {
    version: "1",
    name: "BaseState",
    subtitle: "Base Wallet Insights",
    description: "Track, mint, and share your Base identity NFT.",
    screenshotUrls: [`${ROOT_URL}/screenshot.png?v=3`],
    iconUrl: `${ROOT_URL}/icon.png?v=3`,
    splashImageUrl: `${ROOT_URL}/splash.png?v=3`,
    splashBackgroundColor: "#0a0f2c",
    homeUrl: ROOT_URL,
    canonicalDomain: CANONICAL_DOMAIN,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["utility"],
    heroImageUrl: `${ROOT_URL}/hero.png?v=3`,
    tagline: "Mint your Base identity card",
    ogTitle: "Base State Card",
    ogDescription: "Mint your personalized Base State NFT",
    ogImageUrl: `${ROOT_URL}/hero.png?v=3`,
    noindex: false,
    requiredChains: ["eip155:8453"],
    requiredCapabilities: ["actions.ready", "actions.signIn"]
  },
  baseBuilder: {
    ownerAddress: "0xB46043D161bDE18Ef6974217a686f381B1E91138"
  }
} as const;
