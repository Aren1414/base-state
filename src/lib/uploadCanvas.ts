export async function uploadCanvas(
  canvas: HTMLCanvasElement,
  setMintStatus: (msg: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    setMintStatus('🧪 Converting canvas to blob…')

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setMintStatus('❌ Canvas is empty')
        return reject('Canvas is empty')
      }

      setMintStatus('📤 Sending image to /api/upload…')

      const formData = new FormData()
      formData.append('file', blob, 'canvas.png')

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          setMintStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`)
          return reject(data.error || 'Upload failed')
        }

        setMintStatus(`✅ Image uploaded: ${data.url}`)
        resolve(data.url)
      } catch (err: any) {
        setMintStatus(`❌ Upload error: ${err.message || 'Unknown error'}`)
        reject(err.message || 'Upload error')
      }
    }, 'image/png', 0.8)
  })
}
