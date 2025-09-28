import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { storjBucket, s3 } from '@lib/storjClient'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const fileName = `BaseStateCard_${Date.now()}.png`

    const command = new PutObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
      ContentType: 'image/png',
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 }) // 1 ساعت معتبر

    return new Response(
      JSON.stringify({ url, fileName }),
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
