import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

const region = process.env.AWS_REGION || 'ap-south-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Initialize AWS S3 Client if credentials exist
const s3Client = (accessKeyId && secretAccessKey)
  ? new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

/**
 * Uploads an image buffer to AWS S3 (or generates a base64 fallback if S3 keys are not configured).
 * @param buffer - File buffer from Multer
 * @param originalName - Original filename (e.g. avatar.png)
 * @param mimeType - File MIME type (e.g. image/png)
 * @param userId - User UUID for unique key naming
 * @returns Public image URL
 */
export async function uploadImageToS3(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string
): Promise<string> {
  const fileExt = path.extname(originalName) || '.png';
  const fileName = `avatars/${userId}-${Date.now()}${fileExt}`;

  // If S3 is configured, upload to AWS
  if (s3Client && bucketName) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    // Return public S3 URL
    return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
  }

  // Graceful Fallback for local development when S3 credentials aren't set in .env
  console.warn('[AWS S3 Service] AWS credentials or AWS_S3_BUCKET_NAME missing in .env — using Data URI fallback for development.');
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}
