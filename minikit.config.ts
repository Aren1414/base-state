const rawUrl =
  process.env.NEXT_PUBLIC_URL ||
  process.env.VERCEL_URL ||
  "base-state.vercel.app";

export const CANONICAL_DOMAIN = rawUrl.replace(/^https?:\/\//, "");

export const ROOT_URL = rawUrl.startsWith("http")
  ? rawUrl
  : `https://${rawUrl}`;

export const minikitConfig = {
  
  accountAssociation": {
    "header": "eyJmaWQiOjM4NDQyOCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEQwNjlDM2UwRTIzZjQ0M2Q1QTMwNEUzM0Y0OGNGQkQ4MmQwMEI3MkEifQ",
    "payload": "eyJkb21haW4iOiJCYXNlLXN0YXRlLnZlcmNlbC5hcHAifQ",
    "signature": "fdM8sWRjavMRmLBSFGFgU6Ordcf+ULckfSGXfju289R8Z2n/VqFGRvlfZBLKOnGFkV4UD0i4Fabhz6u25u1vQxs="
  },
  miniapp: {
    version: "1",
    name: "BaseState",
    subtitle: "Base Wallet Insights",
    description: "Track, mint, and share your Base identity NFT.",
    screenshotUrls: [`${ROOT_URL}/screenshot.png?v=8`],
    iconUrl: `${ROOT_URL}/icon.png?v=8`,
    splashImageUrl: `${ROOT_URL}/splash.png?v=8`,
    splashBackgroundColor: "#0a0f2c",
    homeUrl: ROOT_URL,
    canonicalDomain: CANONICAL_DOMAIN,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["utility"],
    heroImageUrl: `${ROOT_URL}/hero.png?v=8`,
    tagline: "Mint your Base identity card",
    ogTitle: "Base State Card",
    ogDescription: "Mint your personalized Base State NFT",
    ogImageUrl: `${ROOT_URL}/hero.png?v=8`,
    noindex: false,
    requiredChains: ["eip155:8453"],
    requiredCapabilities: ["actions.ready", "actions.signIn"]
  },
  baseBuilder: {
    ownerAddress: "0xB46043D161bDE18Ef6974217a686f381B1E91138"
  }
} as const;
