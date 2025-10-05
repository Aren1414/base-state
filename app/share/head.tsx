export default function Head({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const image = Array.isArray(searchParams?.image)
    ? searchParams.image[0]
    : searchParams?.image
  const imageUrl = image?.startsWith("http")
    ? image
    : "https://base-state.vercel.app/embed.png"

  return (
    <>
      <title>My Minted NFT</title>
      <meta name="description" content="Check out my freshly minted BaseState NFT card!" />

      {/* ✅ Farcaster Mini App Embed */}
      <meta
        name="fc:miniapp"
        content={JSON.stringify({
          url: "https://base-state.vercel.app",
          title: "BaseState NFT",
          image: imageUrl,
        })}
      />

      {/* ✅ Farcaster Frame */}
      <meta
        name="fc:frame"
        content={JSON.stringify({
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
        })}
      />

      {/* ✅ OpenGraph fallback */}
      <meta property="og:title" content="My Minted NFT" />
      <meta property="og:description" content="Check out my freshly minted BaseState NFT card!" />
      <meta property="og:image" content={imageUrl} />
    </>
  )
}
