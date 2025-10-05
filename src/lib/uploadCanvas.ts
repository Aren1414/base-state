export async function uploadCanvas(
  canvas: HTMLCanvasElement,
  setMintStatus: (msg: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("❌ Canvas is empty")
        setMintStatus("❌ Canvas is empty")
        return reject("Canvas is empty")
      }

      try {
        setMintStatus("⏳ Requesting upload URL…")

        const res = await fetch("/api/upload", { method: "POST" })

        if (!res.ok) {
          console.error("❌ Upload API failed:", res.statusText)
          setMintStatus("❌ Upload API failed")
          return reject("Upload API failed")
        }

        let data: {
          uploadUrl?: string
          downloadUrl?: string
          fileName?: string
          error?: string
        }

        try {
          data = await res.json()
        } catch (jsonErr) {
          console.error("❌ Failed to parse JSON:", jsonErr)
          setMintStatus("❌ Invalid response from upload API")
          return reject("Invalid response from upload API")
        }

        if (!data.uploadUrl || !data.downloadUrl) {
          console.error("❌ Missing URLs in response:", data)
          setMintStatus("❌ Failed to get presigned URL")
          return reject(data.error || "Failed to get presigned URL")
        }

        setMintStatus("⏫ Uploading image to Storj…")

        const uploadRes = await fetch(data.uploadUrl, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": "image/png" },
        })

        if (!uploadRes.ok) {
          console.error("❌ Upload failed:", uploadRes.statusText)
          setMintStatus("❌ Upload failed")
          return reject("Upload failed")
        }

        setMintStatus("✅ Uploaded to Storj successfully")
        resolve(data.downloadUrl)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown upload error"
        console.error("❌ UploadCanvas error:", message)
        setMintStatus("❌ Upload error")
        reject(message)
      }
    }, "image/png", 0.9)
  })
}

export function getRawUrl(presignedUrl: string): string {
  try {
    const url = new URL(presignedUrl)
    url.search = ""
    return url.toString()
  } catch {
    return presignedUrl
  }
}
