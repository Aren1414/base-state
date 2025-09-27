export async function uploadToStorj(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png', 0.8))
  const formData = new FormData()
  formData.append('file', blob, 'BaseStateCard.png')

  const res = await fetch('https://gateway.storjshare.io/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STORJ_API_KEY!}`
    },
    body: formData
  })

  const json = await res.json()
  return json.url 
}
