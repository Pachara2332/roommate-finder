import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validations';
import type { ApiResponse, UserProfile } from '@/types';

// GET /api/users - Get current user profile (same as /api/auth/me)
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
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Update current user profile
export async function PATCH(req: NextRequest) {
  try {
    const token = getAuthToken(req);

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่พบ token การยืนยันตัวตน' },
        { status: 401 }
      );
    }

    const currentUser = await getUserFromToken(token);

    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        fullName: validatedData.fullName,
        phone: validatedData.phone,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
        gender: validatedData.gender,
        occupation: validatedData.occupation,
        bio: validatedData.bio,
        profileImage: validatedData.profileImage,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        occupation: true,
        bio: true,
        profileImage: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json<ApiResponse<UserProfile>>({
      success: true,
      data: updatedUser,
      message: 'อัพเดทโปรไฟล์สำเร็จ',
    });
  } catch (error: any) {
    console.error('Update user error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์' },
      { status: 500 }
    );
  }
}