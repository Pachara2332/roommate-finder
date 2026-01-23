import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import type { ApiResponse } from '@/types';

// GET /api/favorites - Get all favorites for current user
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

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true,
              },
            },
            images: {
              orderBy: { order: 'asc' },
            },
            _count: {
              select: { favorites: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงรายการโปรด' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add listing to favorites
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
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'กรุณาระบุ ID ของประกาศ' },
        { status: 400 }
      );
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่พบประกาศนี้' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'คุณได้บันทึกประกาศนี้แล้ว' },
        { status: 400 }
      );
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        listingId: listingId,
      },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true,
              },
            },
            images: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: favorite,
        message: 'บันทึกประกาศสำเร็จ',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกประกาศ' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove listing from favorites
export async function DELETE(req: NextRequest) {
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
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'กรุณาระบุ ID ของประกาศ' },
        { status: 400 }
      );
    }

    // Check if favorite exists
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่พบรายการนี้ในรายการโปรด' },
        { status: 404 }
      );
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'ลบออกจากรายการโปรดสำเร็จ',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบรายการโปรด' },
      { status: 500 }
    );
  }
}