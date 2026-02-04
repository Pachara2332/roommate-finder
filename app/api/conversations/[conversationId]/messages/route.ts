import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth'; // Ensure this path is correct
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  params: { params: Promise<{ conversationId: string }> }
) {
  try {
    const token = getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params.params;
    const { conversationId } = await resolvedParams;

    const body = await req.json();
    const { content } = sendMessageSchema.parse(body);

    // Verify participation
    const participant = await prisma.conversationParticipant.findUnique({
        where: {
            conversationId_userId: {
                conversationId,
                userId: user.id
            }
        }
    });

    if (!participant) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Create message
    const message = await prisma.message.create({
        data: {
            conversationId,
            senderId: user.id,
            content,
        },
        include: {
            sender: {
                select: { id: true, fullName: true, profileImage: true }
            }
        }
    });

    // Update conversation
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
    });

    // TODO: Emit socket event if server instance available via some pub/sub (Redis)
    // For single server (this demo), we rely on client to emit or socket connection directly.
    // Ideally this endpoint is a fallback or for external integration.
    // If we want real-time from here, we need a way to talk to socket.io.
    // Without strict requirement, we skip backend emission here (client sends via socket preferred).

    return NextResponse.json({ success: true, data: message });

  } catch (error) {
    console.error('Send message API error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
