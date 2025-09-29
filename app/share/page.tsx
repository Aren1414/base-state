import { Metadata } from "next"

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams?: { [key: string]: string | undefined }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const imageUrl = searchParams?.image || "https://base-state.vercel.app/embed.png"

  return {
    title: "Shared NFT",
    openGraph: {
      title: "My Minted NFT",
      description: "Check out my freshly minted BaseState NFT card!",
      images: [imageUrl],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl,
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
  }
}

export default function SharePage({ searchParams }: PageProps) {
  const imageUrl = searchParams?.image || "https://base-state.vercel.app/embed.png"

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
