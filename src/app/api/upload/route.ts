import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3, storjBucket } from '../../../lib/storjClient'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return new Response(JSON.stringify({
        error: 'No file uploaded',
        debug: 'formData.get("file") returned null',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `BaseStateCard_${Date.now()}.png`

    const command = new PutObjectCommand({
      Bucket: storjBucket,
      Key: fileName,
      Body: buffer,
      ContentType: file.type || 'image/png',
    })

    await s3.send(command)

    const url = `${process.env.STORJ_ENDPOINT}/${storjBucket}/${fileName}`

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error("❌ Upload error:", err)  

    return new Response(JSON.stringify({
      error: 'Upload failed',
      debug: err?.message || JSON.stringify(err),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
