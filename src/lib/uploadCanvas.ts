export async function uploadCanvas(
  canvas: HTMLCanvasElement,
  setMintStatus: (msg: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    setMintStatus('🧪 Step 1: Converting canvas to blob…')

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setMintStatus('❌ Step 1 failed: Canvas is empty')
        return reject('Canvas is empty')
      }

      setMintStatus('📤 Step 2: Sending image to /api/upload…')

      const formData = new FormData()
      formData.append('file', blob, 'canvas.png')

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          setMintStatus(`❌ Step 2 failed: ${data.error || 'Upload failed'}`)
          return reject(data.error || 'Upload failed')
        }

        setMintStatus(`✅ Step 2 success: Image uploaded`)
        resolve(data.url)
      } catch (err: any) {
        const message =
          typeof err === 'string'
            ? err
            : err?.message || JSON.stringify(err) || 'Upload error'
        setMintStatus(`❌ Step 2 error: ${message}`)
        reject(message)
      }
    }, 'image/png', 0.8)
  })
}
