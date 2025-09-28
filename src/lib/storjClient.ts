import { S3Client } from '@aws-sdk/client-s3'

const accessKey = process.env.STORJ_ACCESS_KEY
const secretKey = process.env.STORJ_SECRET_KEY
const endpoint = process.env.STORJ_ENDPOINT
const bucket = process.env.STORJ_BUCKET

if (!accessKey || !secretKey || !endpoint || !bucket) {
  throw new Error(
    `❌ Missing STORJ environment variables. Check that STORJ_ACCESS_KEY, STORJ_SECRET_KEY, STORJ_ENDPOINT, and STORJ_BUCKET are set.`
  )
}

export const storjBucket = bucket

export const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  forcePathStyle: true,
})
