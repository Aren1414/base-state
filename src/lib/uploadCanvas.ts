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

      try {
        setMintStatus('📤 Step 2: Sending image to /api/upload…')

        const apiUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/api/upload`
            : '/api/upload'

        const formData = new FormData()
        formData.append('file', blob, 'canvas.png')

        const res = await fetch(apiUrl, { method: 'POST', body: formData })
        const raw = await res.text()

        let data: any = {}
        try {
          data = raw ? JSON.parse(raw) : {}
        } catch {
          setMintStatus(`❌ Step 2 failed: Invalid JSON → ${raw.slice(0, 400)}`)
          return reject('Invalid JSON from server')
        }

        if (!res.ok) {
          setMintStatus(`❌ Step 2 failed: ${data.error || 'Upload failed'} → ${data.debug || ''}`)
          return reject(data.error || 'Upload failed')
        }

        if (!data.url) {
          setMintStatus(`❌ Step 2 failed: No URL returned → ${JSON.stringify(data).slice(0,400)}`)
          return reject('No URL returned')
        }

        setMintStatus(`✅ Step 2 success: Image uploaded → ${data.url}`)
        resolve(data.url)
      } catch (err: unknown) {
        let message = 'Unknown client error'
        if (err instanceof Error) message = err.message
        setMintStatus(`❌ Client error: ${message}`)
        reject(message)
      }
    }, 'image/png', 0.9)
  })
}
