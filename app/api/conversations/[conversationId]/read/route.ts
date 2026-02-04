import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';

export async function PATCH(
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

    // Update participant lastReadAt
    await prisma.conversationParticipant.update({
        where: {
            conversationId_userId: {
                conversationId,
                userId: user.id
            }
        },
        data: {
            lastReadAt: new Date()
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Mark read API error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
