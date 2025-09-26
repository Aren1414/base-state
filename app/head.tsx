export default function Head() {
  return (
    <>
      <title>BaseState Mini App</title>
      <meta name="fc:frame" content='{
        "version": "next",
        "imageUrl": "https://base-state.vercel.app/embed.png",
        "button": {
          "title": "Check Wallet Stats",
          "action": {
            "type": "launch_frame",
            "name": "base-state",
            "url": "https://base-state.vercel.app"
          }
        }
      }' />
    </>
  )
}
