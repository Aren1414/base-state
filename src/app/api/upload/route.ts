import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import formidable from 'formidable'
import { storjBucket, s3 } from '../../../lib/storjClient'

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
        return resolve(
          new Response(JSON.stringify({
            error: 'Form parse error',
            stage: 'parsing',
            debug: err.message,
            files
          }), { status: 500 })
        )
      }

      const file = files.file
      if (!file) {
        return resolve(
          new Response(JSON.stringify({
            error: 'No file uploaded',
            stage: 'checking file',
            files
          }), { status: 400 })
        )
      }

      try {
        
        let buffer: Buffer
        if (file.arrayBuffer) {
          buffer = Buffer.from(await file.arrayBuffer())
        } else if (file.filepath) {
          // Node.js environment
          const fs = await import('fs')
          buffer = fs.readFileSync(file.filepath)
        } else {
          throw new Error('Cannot read uploaded file')
        }

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
          new Response(JSON.stringify({
            url,
            stage: 'upload success',
          }), { status: 200 })
        )
      } catch (uploadErr: any) {
        resolve(
          new Response(JSON.stringify({
            error: 'Upload failed',
            stage: 'uploading',
            debug: uploadErr.message
          }), { status: 500 })
        )
      }
    })
  })
}
