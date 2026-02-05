import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import type { ApiResponse, AuthResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
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

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(validatedData.password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'เข้าสู่ระบบสำเร็จ',
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}