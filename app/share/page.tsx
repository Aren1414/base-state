import { Metadata } from "next"

type Props = {
  searchParams: { image?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const imageUrl =
    searchParams.image ||
    "https://base-state.vercel.app/embed.png" 

  return {
    title: "My Minted NFT",
    description: "Check out my freshly minted BaseState NFT card!",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: imageUrl,
        button: {
          title: "View in Mini App",
          action: {
            type: "launch_frame",
            name: "base-state",
            url: "https://base-state.vercel.app",
          },
        },
      }),
    },
    openGraph: {
      title: "My Minted NFT",
      images: [imageUrl],
    },
  }
}

export default function SharePage({ searchParams }: Props) {
  const imageUrl =
    searchParams.image || "https://base-state.vercel.app/embed.png"

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
