import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import formidable from 'formidable'
import { s3, storjBucket } from '../../../lib/storjClient'

export const config = {
  api: {
    bodyParser: false, 
  },
}

export async function POST(req: Request) {
  const form = new formidable.IncomingForm()

  return new Promise((resolve) => {
    form.parse(req as any, async (err: any, fields: any, files: any) => {
      if (err) {
        console.error("❌ Form parse error:", err)
        return resolve(
          new Response(JSON.stringify({
            error: 'Form parse error',
            debug: err.message
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      }

      const file = files.file
      if (!file) {
        return resolve(
          new Response(JSON.stringify({ error: 'No file uploaded' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      }

      try {
        
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const fileName = `BaseStateCard_${Date.now()}.png`

        const command = new PutObjectCommand({
          Bucket: storjBucket,
          Key: fileName,
          Body: buffer,
          ContentType: file.mimetype || 'image/png',
        })

        await s3.send(command)

        
        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 * 365 })

        resolve(
          new Response(JSON.stringify({ url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      } catch (uploadErr: any) {
        console.error("❌ Upload error:", uploadErr)
        resolve(
          new Response(JSON.stringify({
            error: 'Upload failed',
            debug: uploadErr.message
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      }
    })
  })
}
