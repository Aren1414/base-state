import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3, storjBucket } from '../../../lib/storjClient'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `BaseStateCard_${Date.now()}.png`

    const command = new PutObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
      Body: buffer,
      ContentType: file.type || 'image/png',
      ACL: 'public-read',
    })

    await s3.send(command)

    return NextResponse.json({
      url: `${process.env.STORJ_ENDPOINT}/${storjBucket}/${fileName}`,
    })
  } catch (err) {
    console.error('Upload failed:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
