import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.STORJ_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY!,
    secretAccessKey: process.env.STORJ_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function GET() {
  const fileName = `BaseStateCard_${Date.now()}.png`;

  const command = new PutObjectCommand({
    Bucket: process.env.STORJ_BUCKET!,
    Key: fileName,
    ContentType: 'image/png',
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 * 365 });
    return new Response(JSON.stringify({ url, fileName }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate presigned URL', debug: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
