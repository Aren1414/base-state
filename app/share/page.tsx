import { Metadata } from "next"

export const dynamic = "force-dynamic"

type PageProps = {
  params: { [key: string]: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: PageProps
): Promise<Metadata> {
  const image = Array.isArray(searchParams?.image)
    ? searchParams?.image[0]
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
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl,
        buttons: [
          {
            title: "View in Mini App",
            action: {
              type: "launch_frame",
              name: "base-state",
              url: "https://base-state.vercel.app",
            },
          },
        ],
      }),
      "fc:miniapp": JSON.stringify({
        url: "https://base-state.vercel.app",
        title: "BaseState NFT",
        image: imageUrl,
      }),
    },
  }
}

export default async function SharePage({ searchParams }: PageProps) {
  const image = Array.isArray(searchParams?.image)
    ? searchParams?.image[0]
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
