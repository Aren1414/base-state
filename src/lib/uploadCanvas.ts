export async function uploadCanvas(
  canvas: HTMLCanvasElement
): Promise<{ fileName: string; downloadUrl: string }> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject('Canvas is empty')

      try {
        const apiUrl = `${window.location.origin}/api/upload`
        const res = await fetch(apiUrl, { method: 'GET' })
        const raw = await res.text()

        let data: any
        try {
          data = JSON.parse(raw)
        } catch {
          return reject('Invalid JSON from server')
        }

        if (!res.ok || !data.url || !data.fileName) {
          return reject('Failed to get presigned URL')
        }

        
        const uploadRes = await fetch(data.url, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': 'image/png' },
        })

        if (!uploadRes.ok) return reject('Upload failed')

        
        const SHARE_ID = 'jxfrnll6xmowipbfjfhb2xxcrm6q' 
        const downloadUrl = `https://link.storjshare.io/raw/${SHARE_ID}/wallet-cards/${data.fileName}`

        resolve({ fileName: data.fileName, downloadUrl })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        reject(message)
      }
    }, 'image/png', 0.9)
  })
}
