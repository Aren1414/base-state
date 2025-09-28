'use client'

import { useSearchParams } from 'next/navigation'
import { Helmet } from 'react-helmet'

export default function ShareHead() {
  const searchParams = useSearchParams()
  const imageUrl = searchParams.get('image') || 'https://base-state.vercel.app/embed.png'

  return (
    <Helmet>
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
    </Helmet>
  )
}
