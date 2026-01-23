import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import type { ApiResponse, UserProfile } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const token = getAuthToken(req);

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่พบ token การยืนยันตัวตน' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse<UserProfile>>({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    );
  }
}