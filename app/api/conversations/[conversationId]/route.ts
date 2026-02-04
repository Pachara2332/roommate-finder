import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  params: { params: Promise<{ conversationId: string }> } // Correct params type for Next.js 15
) {
  try {
    const token = getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params.params; // Next.js 15 params are promises? Actually in App router they are props. 
    // Wait, proper signature: { params }: { params: Promise<{ conversationId: string }> } for dynamic routes in newer Next.js versions.
    // Or plain params depending on version. The user is on v15? 
    // Checking previous file `app/listings/[listingId]/page.tsx`:
    // `export default function ListingDetailPage({ params }: { params: Promise<{ listingId: string }> })`
    // So yes, params is a Promise.
    
    // BUT for API routes (Route Handlers), the signature is:
    // export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> })
    
    const { conversationId } = await resolvedParams;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
            include: { user: { select: { id: true, fullName: true, profileImage: true } } }
        },
        listing: {
            select: { id: true, title: true, rentPrice: true, locationDistrict: true, locationProvince: true, images: { take: 1 } }
        },
        messages: {
            orderBy: { createdAt: 'desc' },
            take: 50
        }
      }
    });

    if (!conversation) {
        return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    // Check participation
    const isParticipant = conversation.participants.some(p => p.userId === user.id);
    if (!isParticipant) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { ...conversation, messages: conversation.messages.reverse() } });

  } catch (error) {
    console.error('Get conversation detail error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
