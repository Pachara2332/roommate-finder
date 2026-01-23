import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { sendMessageSchema } from '@/lib/validations';
import type { ApiResponse } from '@/types';

// GET /api/messages - Get all messages for current user
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

    const { searchParams } = new URL(req.url);
    const conversationWith = searchParams.get('conversationWith');

    let messages;

    if (conversationWith) {
      // Get messages between current user and specific user
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: conversationWith },
            { senderId: conversationWith, receiverId: user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: conversationWith,
          receiverId: user.id,
          isRead: false,
        },
        data: { isRead: true },
      });
    } else {
      // Get all conversations (group by user)
      messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อความ' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a message
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const validatedData = sendMessageSchema.parse(body);

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: validatedData.receiverId },
    });

    if (!receiver) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่พบผู้รับ' },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: validatedData.receiverId,
        listingId: validatedData.listingId,
        content: validatedData.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: message,
        message: 'ส่งข้อความสำเร็จ',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Send message error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการส่งข้อความ' },
      { status: 500 }
    );
  }
}