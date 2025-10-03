export default function Head({ searchParams }: { searchParams: { image?: string | string[] } }) {
  const imageParam = Array.isArray(searchParams?.image) ? searchParams.image[0] : searchParams?.image

  if (!imageParam) {
    return (
      <>
        <title>BaseState Mini App</title>
        <meta name="description" content="BaseState NFT viewer" />
      </>
    )
  }

  
  const proxyImageUrl = `https://base-state.vercel.app/api/image?src=${encodeURIComponent(imageParam)}`

  return (
    <>
      <title>My Minted NFT</title>
      <meta name="description" content="Check out my freshly minted BaseState NFT card!" />

      <meta
        name="fc:miniapp"
        content={JSON.stringify({
          version: "1",
          imageUrl: proxyImageUrl,
          button: {
            title: "🎉 View My NFT",
            action: {
              type: "launch_miniapp",
              url: `https://base-state.vercel.app/share?image=${encodeURIComponent(imageParam)}`,
              name: "BaseState",
              splashImageUrl: "https://base-state.vercel.app/logo.png",
              splashBackgroundColor: "#000000"
            }
          }
        })}
      />

      <meta
        name="fc:frame"
        content={JSON.stringify({
          version: "1",
          imageUrl: proxyImageUrl,
          button: {
            title: "🎉 View My NFT",
            action: {
              type: "launch_frame",
              url: `https://base-state.vercel.app/share?image=${encodeURIComponent(imageParam)}`,
              name: "BaseState",
              splashImageUrl: "https://base-state.vercel.app/logo.png",
              splashBackgroundColor: "#000000"
            }
          }
        })}
      />

      <meta property="og:title" content="My Minted NFT" />
      <meta property="og:description" content="Check out my freshly minted BaseState NFT card!" />
      <meta property="og:image" content={proxyImageUrl} />
    </>
  )
}
