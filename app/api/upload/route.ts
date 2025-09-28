import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { storjBucket, s3Client } from '@lib/storjClient'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const fileName = `BaseStateCard_${Date.now()}.png`

    
    const putCommand = new PutObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
      ContentType: 'image/png',
    })
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 })

    
    const getCommand = new GetObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
    })
    const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 })

    return new Response(
      JSON.stringify({ uploadUrl, downloadUrl, fileName }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Failed to generate presigned URL', debug: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
