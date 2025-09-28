import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import formidable, { File, Fields, Files } from 'formidable'
import fs from 'fs'
import { storjBucket, s3 } from '../../../lib/storjClient'

export const config = {
  api: {
    bodyParser: false, 
  },
}

export async function POST(req: Request) {
  const form = new formidable.IncomingForm()
  
  return new Promise((resolve) => {
    form.parse(req as any, async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
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

      const file = files.file as File
      if (!file) {
        return resolve(
          new Response(JSON.stringify({ error: 'No file uploaded' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      }

      const fileStream = fs.createReadStream(file.filepath)
      const fileName = `BaseStateCard_${Date.now()}.png`

      const command = new PutObjectCommand({
        Bucket: storjBucket,
        Key: fileName,
        Body: fileStream,
        ContentType: file.mimetype || 'image/png',
      })

      try {
        await s3.send(command)

        
        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 * 365 })

        resolve(
          new Response(JSON.stringify({ url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      } catch (uploadErr: any) {
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
