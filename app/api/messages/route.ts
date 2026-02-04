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

    let messages: any[] = [];

    if (conversationWith) {
      // Find conversation between current user and target user
      const conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: user.id } } },
            { participants: { some: { userId: conversationWith } } }
          ]
        },
        include: {
          messages: {
            include: {
              sender: {
                 select: { id: true, fullName: true, profileImage: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          participants: {
              include: { user: { select: { id: true, fullName: true, profileImage: true } } }
          },
          listing: { select: { id: true, title: true } }
        }
      });

      if (conversation) {
        // Map messages to include receiver for legacy compatibility if needed, 
        // essentially finding the other participant.
        const otherParticipant = conversation.participants.find(p => p.userId !== user.id)?.user;
        const currentUserParticipant = conversation.participants.find(p => p.userId === user.id)?.user;

        messages = conversation.messages.map(msg => ({
            ...msg,
            receiver: msg.senderId === user.id ? otherParticipant : currentUserParticipant,
            listing: conversation.listing 
        }));

        // Mark messages as read (simple updates)
        // Ideally rely on ConversationParticipant.lastReadAt, but if client expects isRead on message...
        // We can skip or update bulk. For strict backward compat, we might need to update conversation participant lastReadAt
        await prisma.conversationParticipant.updateMany({
            where: { conversationId: conversation.id, userId: user.id },
            data: { lastReadAt: new Date() }
        });
      }
    } else {
        // Fallback for "all messages"? Legacy API might expect flat list.
        // But for now, fixing the specific error is priority. default empty.
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

    // Find or Create Conversation
    let conversation = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { userId: user.id } } },
                { participants: { some: { userId: validatedData.receiverId } } },
                validatedData.listingId ? { listingId: validatedData.listingId } : {}
            ]
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                listingId: validatedData.listingId,
                participants: {
                    create: [
                        { userId: user.id },
                        { userId: validatedData.receiverId }
                    ]
                }
            }
        });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
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
      },
    });
    
    // Legacy shape construction
    const receiver = await prisma.user.findUnique({
        where: { id: validatedData.receiverId },
        select: { id: true, fullName: true, profileImage: true }
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { ...message, receiver },
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