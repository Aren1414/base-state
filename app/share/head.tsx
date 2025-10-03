export default function Head({ searchParams }: { searchParams: { image?: string | string[] } }) {
  const imageParam = Array.isArray(searchParams?.image) ? searchParams.image[0] : searchParams?.image
  const imageUrl = imageParam || "https://base-state.vercel.app/embed.png"

  return (
    <>
      <title>My Minted NFT</title>
      <meta name="description" content="Check out my freshly minted BaseState NFT card!" />

      {/* ✅ Farcaster Mini App Embed */}
      <meta
        name="fc:miniapp"
        content={JSON.stringify({
          version: "1",
          imageUrl,
          button: {
            title: "🎉 View My NFT",
            action: {
              type: "launch_miniapp",
              url: `https://base-state.vercel.app/share?image=${encodeURIComponent(imageUrl)}`,
              name: "BaseState",
              splashImageUrl: "https://base-state.vercel.app/logo.png",
              splashBackgroundColor: "#000000"
            }
          }
        })}
      />

      {/* ✅ Optional Farcaster Frame */}
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
                url: `https://base-state.vercel.app/share?image=${encodeURIComponent(imageUrl)}`
              }
            }
          ]
        })}
      />

      {/* ✅ OG fallback */}
      <meta property="og:title" content="My Minted NFT" />
      <meta property="og:description" content="Check out my freshly minted BaseState NFT card!" />
      <meta property="og:image" content={imageUrl} />
    </>
  )
}
