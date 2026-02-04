import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

// Define schema for creating conversation
const createConversationSchema = z.object({
  receiverId: z.string(),
  listingId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        listing: {
            select: {
                id: true,
                title: true,
                images: {
                    take: 1,
                    select: { imageUrl: true }
                }
            }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Transform data to be friendlier (e.g. identify "other user")
    const formattedConversations = conversations.map((conv: any) => {
        const otherParticipant = conv.participants.find((p: any) => p.userId !== user.id);
        const lastMessage = conv.messages[0];
        const unreadCount = 0; // TODO: Calculate unread count based on lastReadAt

        return {
            id: conv.id,
            listing: conv.listing,
            otherUser: otherParticipant?.user,
            lastMessage: lastMessage,
            updatedAt: conv.updatedAt,
            lastMessageAt: conv.lastMessageAt
        };
    });

    return NextResponse.json({ success: true, data: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { receiverId, listingId } = createConversationSchema.parse(body);

    if (receiverId === user.id) {
        return NextResponse.json({ success: false, error: 'Cannot chat with yourself' }, { status: 400 });
    }

    // Check if conversation already exists (for 1-on-1, ideally unique per pair + listing)
    // If listingId is provided, check for specific conversation
    // If no listingId, check for general conversation
    
    // Complex query: find conversation where both users are participants AND listingId matches
    const existingConversations = await prisma.conversation.findMany({
        where: {
            AND: [
                { participants: { some: { userId: user.id } } },
                { participants: { some: { userId: receiverId } } },
                listingId ? { listingId } : {}
            ]
        }
    });

    if (existingConversations.length > 0) {
        return NextResponse.json({ success: true, data: existingConversations[0] });
    }

    // Create new
    const conversation = await prisma.conversation.create({
        data: {
            listingId,
            participants: {
                create: [
                    { userId: user.id },
                    { userId: receiverId }
                ]
            }
        }
    });

    return NextResponse.json({ success: true, data: conversation });

  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create conversation' }, { status: 500 });
  }
}
