export async function uploadCanvas(
  canvas: HTMLCanvasElement,
  setMintStatus: (msg: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    setMintStatus('🧪 Step 1: Converting canvas to blob…');

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setMintStatus('❌ Step 1 failed: Canvas is empty');
        return reject('Canvas is empty');
      }

      try {
        setMintStatus('📤 Step 2: Requesting presigned URL from server…');

        const apiUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/api/upload';
        const res = await fetch(apiUrl, { method: 'GET' });
        const raw = await res.text();

        // Show raw server response for debugging (will be visible in UI via setMintStatus)
        if (!res.ok) {
          // try parse JSON if possible
          try {
            const parsed = JSON.parse(raw);
            setMintStatus(`❌ Step 2 failed: ${parsed.error || 'error'} → ${parsed.debug || ''}`);
            return reject(parsed.error || 'Failed to get presigned URL');
          } catch {
            setMintStatus(`❌ Step 2 failed: Server returned non-JSON → ${raw.slice(0, 400)}`);
            return reject('Invalid JSON from server');
          }
        }

        let data: any;
        try {
          data = JSON.parse(raw);
        } catch (e) {
          setMintStatus(`❌ Step 2 failed: Expected JSON but got → ${raw.slice(0, 400)}`);
          return reject('Invalid JSON from server');
        }

        if (!data.url) {
          setMintStatus(`❌ Step 2 failed: presigned URL missing → ${JSON.stringify(data).slice(0, 400)}`);
          return reject('No presigned URL');
        }

        setMintStatus('📤 Step 3: Uploading blob to presigned URL (PUT)…');

        const uploadRes = await fetch(data.url, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'image/png',
          },
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          setMintStatus(`❌ Step 3 failed: upload response code ${uploadRes.status} → ${errText.slice(0,400)}`);
          return reject('Upload failed');
        }

        setMintStatus(`✅ Step 3 success: uploaded → ${data.url}`);
        resolve(data.url);
      } catch (err: unknown) {
        let message = 'Unknown client error';
        if (err instanceof Error) message = err.message;
        setMintStatus(`❌ Client error: ${message}`);
        reject(message);
      }
    }, 'image/png', 0.9);
  });
}
