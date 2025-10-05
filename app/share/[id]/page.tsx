import { Metadata, ResolvingMetadata } from "next"
import { minikitConfig } from "../../../minikit.config"

export const dynamic = "force-dynamic"


interface SharePageProps {
  params: { id: string }
}

export async function generateMetadata(
  { params }: SharePageProps,
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${params.id}.png`

  return {
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    openGraph: {
      title: minikitConfig.frame.name,
      description: minikitConfig.frame.description,
      images: [imageUrl],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: minikitConfig.frame.version,
        imageUrl,
        button: {
          title: "Launch Mini App",
          action: {
            type: "launch_frame",
            name: minikitConfig.frame.name,
            url: minikitConfig.frame.homeUrl,
            splashImageUrl: minikitConfig.frame.splashImageUrl,
            splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
          },
        },
      }),
      "fc:miniapp": JSON.stringify({
        version: minikitConfig.frame.version,
        imageUrl,
        button: {
          title: "Launch Mini App",
          action: {
            type: "launch_miniapp",
            name: minikitConfig.frame.name,
            url: minikitConfig.frame.homeUrl,
            splashImageUrl: minikitConfig.frame.splashImageUrl,
            splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
          },
        },
      }),
    },
  }
}

export default function SharePage({ params }: SharePageProps) {
  const imageUrl = `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${params.id}.png`

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
  )
}
