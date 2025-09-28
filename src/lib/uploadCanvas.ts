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

      setMintStatus('📤 Step 2: Preparing image for upload…')

      try {
        const formData = new FormData()
        formData.append('file', blob, 'canvas.png') 

        setMintStatus('📤 Step 3: Sending image to /api/upload…')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const raw = await res.text()
        let data: any = {}

        try {
          data = raw ? JSON.parse(raw) : {}
        } catch (parseErr) {
          setMintStatus(`❌ Step 3 failed: Invalid JSON → ${raw}`)
          return reject('Invalid JSON response')
        }

        
        if (!res.ok) {
          setMintStatus(
            `❌ Step 3 failed [${data.stage || 'unknown'}]: ${data.error || 'Upload failed'} → ${data.debug || ''}`
          )
          return reject(data.error || 'Upload failed')
        }

        if (!data.url) {
          setMintStatus(`❌ Step 3 failed: No URL returned, stage: ${data.stage || 'unknown'}`)
          return reject('No URL returned')
        }

        setMintStatus(`✅ Step 3 success [${data.stage}]: Image uploaded → ${data.url}`)
        resolve(data.url)
      } catch (err: any) {
        const message =
          typeof err === 'string'
            ? err
            : err?.message || JSON.stringify(err) || 'Upload error'
        setMintStatus(`❌ Step 3 error: ${message}`)
        reject(message)
      }
    }, 'image/png', 0.8)
  })
}
