
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!; // Kept for reference or alternative use

export const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadImage(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    });

    await R2.send(command);

    // Return the local proxy URL instead of R2 public URL
    // Use the relative path so Next.js handles the host
    return `/api/images/${fileName}`; 
  } catch (error) {
    console.error('R2 Upload Error:', error);
    throw new Error('Failed to upload image to R2');
  }
}
