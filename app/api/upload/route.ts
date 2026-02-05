import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';
import { getUserFromToken } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Token ไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'กรุณาเลือกไฟล์รูปภาพ' },
        { status: 400 }
      );
    }

    // Validate files
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'ไฟล์ต้องมีขนาดไม่เกิน 5MB' },
          { status: 400 }
        );
      }
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'รองรับเฉพาะไฟล์ JPEG, PNG, WebP, GIF' },
          { status: 400 }
        );
      }
    }

    // Upload files
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToR2(buffer, file.name, file.type);

      if (!result.success || !result.url) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: result.error || 'อัพโหลดไฟล์ล้มเหลว' },
          { status: 500 }
        );
      }

      uploadedUrls.push(result.url);
    }

    return NextResponse.json<ApiResponse<{ urls: string[] }>>({
      success: true,
      data: { urls: uploadedUrls },
      message: `อัพโหลดสำเร็จ ${uploadedUrls.length} ไฟล์`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
