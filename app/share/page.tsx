export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SharePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const imageParam = Array.isArray(sp?.image) ? sp.image[0] : sp?.image
  const imageUrl = imageParam || "https://base-state.vercel.app/embed.png"

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      <h1>Shared NFT</h1>
      <p>This is the preview of your minted NFT card 👇</p>
      <img
        src={imageUrl}
        alt="Minted NFT"
        style={{ maxWidth: "400px", borderRadius: "12px" }}
      />
      <br />
      <a
        href={`https://warpcast.com/~/compose?text=Check out my NFT&embeds[]=https://base-state.vercel.app/share?image=${encodeURIComponent(imageUrl)}`}
        target="_blank"
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#8247e5",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold"
        }}
      >
        Share in Farcaster 🚀
      </a>
    </main>
  )
}
