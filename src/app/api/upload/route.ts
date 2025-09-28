import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const runtime = 'nodejs' // force Node runtime on Vercel; ensures no Edge fs/network surprises

const ACCESS_KEY = process.env.STORJ_ACCESS_KEY
const SECRET_KEY = process.env.STORJ_SECRET_KEY
const ENDPOINT = process.env.STORJ_ENDPOINT
const BUCKET = process.env.STORJ_BUCKET

function jsonResponse(payload: any, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: ENDPOINT || '',
  credentials: {
    accessKeyId: ACCESS_KEY || '',
    secretAccessKey: SECRET_KEY || '',
  },
  forcePathStyle: true,
})

export async function GET(req: Request) {
  // runtime env sanity check
  if (!ACCESS_KEY || !SECRET_KEY || !ENDPOINT || !BUCKET) {
    return jsonResponse(
      {
        error: 'Missing STORJ env variables',
        stage: 'env',
        debug: {
          ACCESS_KEY: !!ACCESS_KEY,
          SECRET_KEY: !!SECRET_KEY,
          ENDPOINT: !!ENDPOINT,
          BUCKET: !!BUCKET,
        },
      },
      500
    )
  }

  const fileName = `BaseStateCard_${Date.now()}.png`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
    ContentType: 'image/png',
  })

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 * 365 }) // 1 year
    return jsonResponse({ url, fileName, stage: 'presigned_generated' }, 200)
  } catch (err: unknown) {
    let debug = 'Unknown error'
    if (err instanceof Error) debug = err.message
    return jsonResponse({ error: 'Failed to generate presigned URL', stage: 'presign_error', debug }, 500)
  }
}

// safety: other methods -> JSON response (avoid HTML 405)
export async function POST() {
  return jsonResponse({ error: 'Use GET to request presigned URL', stage: 'method_not_allowed' }, 405)
}
