import { withValidManifest } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  const manifest = withValidManifest(minikitConfig);

  return Response.json({
    ...manifest,
    miniapp: {
      ...manifest.miniapp,
      noindex: false, 
      canonicalDomain: minikitConfig.miniapp.canonicalDomain,
      requiredChains: minikitConfig.miniapp.requiredChains,
      requiredCapabilities: minikitConfig.miniapp.requiredCapabilities
    },
    baseBuilder: minikitConfig.baseBuilder
  });
}
