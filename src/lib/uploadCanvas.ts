export async function uploadCanvas(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject('Canvas is empty')

      const formData = new FormData()
      formData.append('file', blob, 'canvas.png')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) return reject(data.error)
      resolve(data.url)
    }, 'image/png', 0.8)
  })
}
