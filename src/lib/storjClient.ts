import { S3Client } from '@aws-sdk/client-s3'

const accessKey = process.env.STORJ_ACCESSKEY!
const secretKey = process.env.STORJ_SECRETKEY!
const endpoint = process.env.STORJ_ENDPOINT!
const bucket = process.env.STORJ_BUCKET!

if (!bucket) {
  throw new Error('❌ STORJ_BUCKET is missing in environment variables')
}

export const storjBucket = bucket

export const s3 = new S3Client({
  region: 'us-east-1',
  endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  forcePathStyle: true,
})
