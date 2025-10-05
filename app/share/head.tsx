export default function Head({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const id = Array.isArray(searchParams?.id) ? searchParams.id[0] : searchParams?.id
  const imageUrl = id?.startsWith("http")
    ? id
    : id
    ? `https://link.storjshare.io/raw/jwehpt5oybcnyzdpzgkvbodeireq/base-state/${id}.png`
    : "https://base-state.vercel.app/embed.png"

  return (
    <>
      <title>My Minted NFT</title>
      <meta name="description" content="Check out my freshly minted BaseState NFT card!" />

      <meta
        name="fc:miniapp"
        content={JSON.stringify({
          version: "1",
          imageUrl,
          button: {
            title: "🪙 View Minted Card",
            action: {
              type: "launch_miniapp",
              url: "https://base-state.vercel.app",
            },
          },
        })}
      />

      <meta property="og:title" content="My Minted NFT" />
      <meta property="og:description" content="Check out my freshly minted BaseState NFT card!" />
      <meta property="og:image" content={imageUrl} />
    </>
  )
}
