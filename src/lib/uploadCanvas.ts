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
        setMintStatus('📤 Step 2: Requesting presigned URL from server…')

        const apiUrl = `${window.location.origin}/api/upload`
        const res = await fetch(apiUrl, { method: 'GET' })
        const raw = await res.text()

        let data: any
        try {
          data = JSON.parse(raw)
        } catch {
          setMintStatus(`❌ Step 2 failed: Invalid JSON → ${raw.slice(0, 400)}`)
          return reject('Invalid JSON from server')
        }

        if (!res.ok || !data.url) {
          setMintStatus(`❌ Step 2 failed: ${data.error || 'Failed to get presigned URL'} → ${data.debug || ''}`)
          return reject(data.error || 'Failed to get presigned URL')
        }

        setMintStatus('📤 Step 3: Uploading blob to presigned URL (PUT)…')

        const uploadRes = await fetch(data.url, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': 'image/png' },
        })

        if (!uploadRes.ok) {
          const errText = await uploadRes.text()
          setMintStatus(`❌ Step 3 failed: upload response ${uploadRes.status} → ${errText.slice(0, 400)}`)
          return reject('Upload failed')
        }

        setMintStatus(`✅ Step 3 success: uploaded → ${data.url}`)
        resolve(data.url)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown client error'
        setMintStatus(`❌ Client error: ${message}`)
        reject(message)
      }
    }, 'image/png', 0.9)
  })
}
