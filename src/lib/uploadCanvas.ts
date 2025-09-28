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
        setMintStatus('📤 Step 2: Requesting presigned URL…');
        const res = await fetch('/api/upload'); // GET
        const text = await res.text();

        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          setMintStatus(`❌ Step 2 failed: Expected JSON but got → ${text}`);
          return reject('Invalid JSON from server');
        }

        if (!res.ok || !data.url) {
          setMintStatus(`❌ Step 2 failed: ${data.error || 'Failed to get presigned URL'} → ${data.debug || ''}`);
          return reject(data.error || 'Failed to get presigned URL');
        }

        setMintStatus('📤 Step 3: Uploading canvas to Storj…');

        const uploadRes = await fetch(data.url, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'image/png',
          },
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          setMintStatus(`❌ Step 3 failed: Upload failed → ${errorText}`);
          return reject('Upload failed');
        }

        setMintStatus(`✅ Step 3 success: Image uploaded → ${data.url}`);
        resolve(data.url);
      } catch (err: unknown) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        setMintStatus(`❌ Step failed: ${message}`);
        reject(message);
      }
    }, 'image/png', 0.8);
  });
}
