export default function Head({ params, searchParams }: any) {
  const image = Array.isArray(searchParams?.image)
    ? searchParams.image[0]
    : searchParams?.image

  const imageUrl = image || "https://base-state.vercel.app/embed.png"

  return (
    <>
      <title>My Minted NFT</title>
      <meta name="description" content="Check out my freshly minted BaseState NFT card!" />

      {/* ✅ Miniapp Embed */}
      <meta
        name="fc:miniapp"
        content={JSON.stringify({
          url: "https://base-state.vercel.app",
          title: "BaseState NFT",
          image: imageUrl,
        })}
      />

      {/* ✅ Optional: Frame for action button */}
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

      {/* ✅ OG fallback */}
      <meta property="og:title" content="My Minted NFT" />
      <meta property="og:description" content="Check out my freshly minted BaseState NFT card!" />
      <meta property="og:image" content={imageUrl} />
    </>
  )
}
