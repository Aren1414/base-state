import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const accessKey = process.env.STORJ_ACCESS_KEY!
const secretKey = process.env.STORJ_SECRET_KEY!
const endpoint = process.env.STORJ_ENDPOINT!
const bucket = process.env.STORJ_BUCKET!

const STORJ_SHARE_ID = "jwehpt5oybcnyzdpzgkvbodeireq"
const PUBLIC_GATEWAY = "https://link.storjshare.io/raw"

const s3 = new S3Client({
  region: "us-east-1",
  endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  forcePathStyle: true,
})

export async function POST() {
  try {
    const fileName = `mint_${Date.now()}.png`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      ContentType: "image/png",
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })
    const downloadUrl = `${PUBLIC_GATEWAY}/${STORJ_SHARE_ID}/${bucket}/${fileName}`

    return NextResponse.json({
      uploadUrl,
      downloadUrl,
      fileName,
    })
  } catch (error) {
    console.error("❌ Storj Upload Error:", error)
    return NextResponse.json(
      { error: "Failed to create presigned URL" },
      { status: 500 }
    )
  }
}
