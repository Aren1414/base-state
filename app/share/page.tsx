'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SharePageWrapper() {
  return (
    <Suspense fallback={<p>Loading preview…</p>}>
      <SharePage />
    </Suspense>
  )
}

function SharePage() {
  const searchParams = useSearchParams()
  const imageUrl = searchParams.get('image') || 'https://base-state.vercel.app/embed.png'

  return (
    <>
      <Head imageUrl={imageUrl} />
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

function Head({ imageUrl }: { imageUrl: string }) {
  return (
    <>
      <title>My Minted NFT</title>
      <meta name="fc:frame" content={JSON.stringify({
        version: "next",
        imageUrl,
        button: {
          title: "View in Mini App",
          action: {
            type: "launch_frame",
            name: "base-state",
            url: "https://base-state.vercel.app"
          }
        }
      })} />
      <meta property="og:title" content="My Minted NFT" />
      <meta property="og:description" content="Check out my freshly minted BaseState NFT card!" />
      <meta property="og:image" content={imageUrl} />
    </>
  )
}
