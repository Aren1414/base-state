import { storjBucket, s3Client } from "./storjClient"

export async function uploadCanvas(
  canvas: HTMLCanvasElement,
  setMintStatus: (msg: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject("❌ Canvas is empty")

      try {
        setMintStatus("⏫ Uploading image to Storj…")

        const res = await fetch("/api/upload", { method: "POST" })

        let data: {
          uploadUrl?: string
          downloadUrl?: string
          fileName?: string
          error?: string
        } = {}

        try {
          data = await res.json()
        } catch (jsonErr) {
          console.error("❌ Failed to parse JSON:", jsonErr)
          return reject("Invalid response from upload API")
        }

        if (!res.ok || !data.uploadUrl || !data.downloadUrl) {
          console.error("Upload init error:", data)
          return reject(data.error || "Failed to get presigned URL")
        }

        const uploadRes = await fetch(data.uploadUrl, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": "image/png" },
        })

        if (!uploadRes.ok) {
          console.error("Upload failed:", uploadRes.statusText)
          return reject("❌ Upload failed")
        }

        setMintStatus("✅ Uploaded to Storj successfully")
        resolve(data.downloadUrl)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown upload error"
        console.error("UploadCanvas error:", message)
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
