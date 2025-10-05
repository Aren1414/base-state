import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { storjBucket, s3Client } from "@lib/storjClient"

export const runtime = "nodejs"

const accessKey = process.env.STORJ_ACCESS_KEY!
const secretKey = process.env.STORJ_SECRET_KEY!
const endpoint = process.env.STORJ_ENDPOINT!
const bucket = process.env.STORJ_BUCKET!

const STORJ_SHARE_ID = "jwehpt5oybcnyzdpzgkvbodeireq"
const PUBLIC_GATEWAY = "https://link.storjshare.io/raw"

export async function GET() {
  try {
    const fileName = `BaseStateCard_${Date.now()}.png`

    
    const putCommand = new PutObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
      ContentType: "image/png",
    })
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 })

    
    const downloadUrl = `${PUBLIC_GATEWAY}/${STORJ_SHARE_ID}/${storjBucket}/${fileName}`

    return new Response(
      JSON.stringify({ uploadUrl, downloadUrl, fileName }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: "Failed to generate upload URL", debug: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
