import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import type { ApiResponse, AuthResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        fullName: validatedData.fullName,
        phone: validatedData.phone,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        gender: validatedData.gender,
        occupation: validatedData.occupation,
        bio: validatedData.bio,
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

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: { user, token },
        message: 'สมัครสมาชิกสำเร็จ',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    );
  }
}