export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SharePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const imageParam = Array.isArray(sp?.image) ? sp.image[0] : sp?.image
  const imageUrl = imageParam
    ? `https://base-state.vercel.app/api/image?src=${encodeURIComponent(imageParam)}`
    : "https://base-state.vercel.app/embed.png"

  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#000",
      color: "#fff",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "24px",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>Shared NFT</h1>
      <p style={{ fontSize: "14px", marginBottom: "20px", color: "#ccc" }}>
        This is the preview of your minted NFT card 👇
      </p>
      <img
        src={imageUrl}
        alt="Minted NFT"
        style={{
          maxWidth: "400px",
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,255,255,0.3)",
          marginBottom: "24px"
        }}
      />
      <a
        href={`https://warpcast.com/~/compose?text=📸 Just minted my BaseState NFT card!&embeds[]=https://base-state.vercel.app/share?image=${encodeURIComponent(imageParam || "")}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#00f0ff",
          color: "#000",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
          boxShadow: "0 0 6px rgba(0,255,255,0.5)"
        }}
      >
        Share in Farcaster 🚀
      </a>
    </main>
  )
}
