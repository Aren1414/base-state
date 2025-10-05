import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(
  props: Promise<{ params: { id: string }; searchParams?: { image?: string | string[] } }>
): Promise<Metadata> {
  const { searchParams } = await props
  const image = Array.isArray(searchParams?.image)
    ? searchParams.image[0]
    : searchParams?.image
  const imageUrl = image || "https://base-state.vercel.app/embed.png"

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
        url: "https://base-state.vercel.app",
        title: "BaseState NFT",
        image: imageUrl,
      }),
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl,
        buttons: [
          {
            title: "Open in Mini App",
            action: {
              type: "launch_frame",
              name: "base-state",
              url: "https://base-state.vercel.app",
            },
          },
        ],
      }),
    },
  }
}

export default function SharePage({
  searchParams,
}: {
  searchParams?: { image?: string | string[] }
}) {
  const image = Array.isArray(searchParams?.image)
    ? searchParams.image[0]
    : searchParams?.image
  const imageUrl = image || "https://base-state.vercel.app/embed.png"

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
