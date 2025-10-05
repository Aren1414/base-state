import { Metadata } from "next";
import { minikitConfig } from "../../../minikit.config";

export const dynamic = "force-static"; 

interface ShareParams {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: ShareParams;
}): Promise<Metadata> {
  const id = params.id;
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`;

  // ساخت json برای fc:miniapp طبق مستندات
  const miniappEmbed = {
    version: "1",
    imageUrl,
    button: {
      title: "Launch Mini App",
      action: {
        type: "launch_miniapp",
        url: `${minikitConfig.frame.homeUrl}/share/${id}`,
        name: minikitConfig.frame.name,
        splashImageUrl: minikitConfig.frame.splashImageUrl,
        splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
      },
    },
  };

  return {
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    openGraph: {
      title: minikitConfig.frame.name,
      description: minikitConfig.frame.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800, 
        },
      ],
    },
    other: {
      "fc:miniapp": JSON.stringify(miniappEmbed),
      "fc:frame": JSON.stringify(miniappEmbed), 
    },
  };
}

export default function SharePage({
  params,
}: {
  params: ShareParams;
}) {
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${params.id}.png`;

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      <h1>Shared NFT</h1>
      <p>This is the preview of your minted NFT card 👇</p>
      <img
        src={imageUrl}
        alt="Minted NFT"
        style={{ maxWidth: "400px", borderRadius: "12px" }}
      />
    </main>
  );
}
