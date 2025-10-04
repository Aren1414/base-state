export async function uploadCanvas(
  canvas: HTMLCanvasElement,
  setMintStatus: (msg: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject("Canvas is empty")

      try {
        const apiUrl = `${window.location.origin}/api/upload`
        const res = await fetch(apiUrl)
        const data: { uploadUrl?: string; downloadUrl?: string; publicUrl?: string; error?: string } = await res.json()

        if (!res.ok || !data.uploadUrl || (!data.downloadUrl && !data.publicUrl)) {
          return reject(data.error || "Failed to get upload info")
        }

        setMintStatus("Uploading…")
        const uploadRes = await fetch(data.uploadUrl, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": "image/png" },
        })
        if (!uploadRes.ok) return reject("Upload failed")

        const finalUrl = data.publicUrl || data.downloadUrl!
        setMintStatus("Upload complete")
        resolve(finalUrl)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown client error"
        reject(message)
      }
    }, "image/png", 0.9)
  })
}

export function getRawUrl(presignedUrl: string) {
  try {
    const url = new URL(presignedUrl)
    url.search = ""
    return url.toString().replace("/s/", "/raw/").replace("/d/", "/raw/")
  } catch {
    return presignedUrl
  }
}
