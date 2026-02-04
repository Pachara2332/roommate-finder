
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// Re-initialize locally to avoid circular deps or just import from lib (but lib might have different purpose)
// Better to reuse the client from lib/r2.ts if exported, but looking at lib/r2.ts, it doesn't export the client instance directly (it's internal).
// So I'll just instantiate a new one or export it from r2.ts. 
// Let's modify r2.ts to export the client first? 
// Actually, I'll just copy the config here to be safe and self-contained for now, or better, export it from r2.ts in next step.
// For this step, let's assume I'll export `R2` from `lib/r2.ts`.

import { R2, R2_BUCKET_NAME } from '@/lib/r2';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');

  if (!path) {
    return new NextResponse('Missing path', { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
    });

    const response = await R2.send(command);

    if (!response.Body) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Read stream to buffer for reliable delivery in Next.js
    const byteArray = await response.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);

    const headers = new Headers();
    if (response.ContentType) {
      headers.set('Content-Type', response.ContentType);
    }
    headers.set('Content-Length', buffer.length.toString());
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(buffer, {
        headers,
        status: 200
    });

  } catch (error: any) {
    console.error('Image Proxy Error:', error);
    if (error.name === 'NoSuchKey') {
        return new NextResponse('Image not found', { status: 404 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
