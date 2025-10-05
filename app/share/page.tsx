import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }: { searchParams: URLSearchParams }): Promise<Metadata> {
  const id = searchParams.get("id")
  const imageUrl = id
    ? `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`
    : "https://base-state.vercel.app/embed.png"

  return {
    title: "My Minted NFT",
    description: "Check out my freshly minted BaseState NFT card!",
    openGraph: {
      title: "My Minted NFT",
      description: "Check out my freshly minted BaseState NFT card!",
      images: [imageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl,
        button: {
          title: "🪙 View Minted Card",
          action: {
            type: "launch_miniapp",
            url: "https://base-state.vercel.app",
          },
        },
      }),
    },
  }
}

export default function SharePage({ searchParams }: { searchParams: URLSearchParams }) {
  const id = searchParams.get("id")
  const imageUrl = id
    ? `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/wallet-cards/${id}.png`
    : "https://base-state.vercel.app/embed.png"

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      <h1>Shared NFT</h1>
      <p>This is the preview of your minted NFT card 👇</p>
      <img src={imageUrl} alt="Minted NFT" style={{ maxWidth: "400px", borderRadius: "12px" }} />
    </main>
  )
}
