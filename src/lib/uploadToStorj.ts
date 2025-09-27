import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const accessKey = process.env.STORJ_ACCESS_KEY!
const secretKey = process.env.STORJ_SECRET_KEY!
const endpoint = process.env.STORJ_ENDPOINT!
const bucket = process.env.STORJ_BUCKET!

const s3 = new S3Client({
  region: 'us-east-1', // Storj doesn’t care about region, but AWS SDK requires it
  endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  forcePathStyle: true,
})

export async function uploadToStorj(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob>(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/png', 0.8)
  )

  const buffer = await blob.arrayBuffer()
  const fileName = `BaseStateCard_${Date.now()}.png`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: Buffer.from(buffer),
    ContentType: 'image/png',
    ACL: 'public-read',
  })

  await s3.send(command)

  return `${endpoint}/${bucket}/${fileName}`
    }
