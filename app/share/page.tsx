'use client'

import { useSearchParams } from 'next/navigation'

export default function SharePage() {
  const searchParams = useSearchParams()
  const imageUrl = searchParams.get('image') || 'https://base-state.vercel.app/embed.png'

  return (
    <>
      <head>
        <title>My Minted NFT</title>
        <meta
          name="fc:frame"
          content={JSON.stringify({
            version: '1',
            imageUrl,
            button: {
              title: 'View in Mini App',
              action: {
                type: 'launch_frame',
                name: 'base-state',
                url: 'https://base-state.vercel.app',
              },
            },
          })}
        />
        <meta property="og:image" content={imageUrl} />
      </head>

      <main style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Shared NFT</h1>
        <p>This is the preview of your minted NFT card 👇</p>
        <img
          src={imageUrl}
          alt="Minted NFT"
          style={{ maxWidth: '400px', borderRadius: '12px' }}
        />
      </main>
    </>
  )
}
