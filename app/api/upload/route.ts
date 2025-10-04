import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { storjBucket, s3Client } from "@lib/storjClient"

export const runtime = "nodejs"

const PUBLIC_GATEWAY = "https://link.storjshare.io"

export async function GET() {
  try {
    const fileName = `BaseStateCard_${Date.now()}.png`

    const putCommand = new PutObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
      ContentType: "image/png",
    })
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 600 })

    const getCommand = new GetObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
    })
    const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 60 * 60 * 24 * 7 })

    const sharePrefix = process.env.STORJ_SHARE_PREFIX
    let publicUrl: string | undefined = undefined
    if (sharePrefix) {
      publicUrl = `${PUBLIC_GATEWAY}/s/${sharePrefix}/${storjBucket}/${fileName}`
    }

    return new Response(
      JSON.stringify({ uploadUrl, downloadUrl, publicUrl, fileName }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: "Failed to generate URL", debug: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
