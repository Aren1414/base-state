import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { storjBucket, s3Client } from '@lib/storjClient'

export const runtime = 'nodejs'

const PUBLIC_GATEWAY = 'https://gateway.storjshare.io' 

export async function GET() {
  try {
    const fileName = `BaseStateCard_${Date.now()}.png`

    
    const putCommand = new PutObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
      ContentType: 'image/png',
    })
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 })

    
    const downloadUrl = `${PUBLIC_GATEWAY}/${storjBucket}/${fileName}`

    return new Response(
      JSON.stringify({ uploadUrl, downloadUrl, fileName }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Failed to generate upload URL', debug: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
