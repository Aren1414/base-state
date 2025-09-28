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

      setMintStatus('📤 Step 2: Requesting presigned URL…');

      try {
        const res = await fetch('/api/upload');
        const data = await res.json();

        if (!res.ok || !data.url) {
          setMintStatus(`❌ Step 2 failed: ${data.error || 'Failed to get presigned URL'}`);
          return reject(data.error || 'Failed to get presigned URL');
        }

        const formData = new FormData();
        formData.append('file', blob, data.fileName);

        setMintStatus('📤 Step 3: Uploading image to Storj…');

        const uploadRes = await fetch(data.url, {
          method: 'PUT',
          body: formData,
        });

        if (!uploadRes.ok) {
          setMintStatus(`❌ Step 3 failed: Upload failed`);
          return reject('Upload failed');
        }

        setMintStatus(`✅ Step 3 success: Image uploaded → ${data.url}`);
        resolve(data.url);
      } catch (err: any) {
        const message =
          typeof err === 'string'
            ? err
            : err?.message || JSON.stringify(err) || 'Upload error';
        setMintStatus(`❌ Step 2 error: ${message}`);
        reject(message);
      }
    }, 'image/png', 0.8);
  });
}
