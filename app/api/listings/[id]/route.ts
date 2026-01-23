import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { updateListingSchema } from '@/lib/validations';
import type { ApiResponse, ListingWithUser } from '@/types';

// GET /api/listings/[id] - Get single listing by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            phone: true,
            bio: true,
            verified: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่พบประกาศนี้' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: params.id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json<ApiResponse<ListingWithUser>>({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประกาศ' },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Update listing
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!existingListing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่พบประกาศนี้' },
        { status: 404 }
      );
    }

    if (existingListing.userId !== user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'คุณไม่มีสิทธิ์แก้ไขประกาศนี้' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateListingSchema.parse(body);

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        locationProvince: validatedData.locationProvince,
        locationDistrict: validatedData.locationDistrict,
        locationAddress: validatedData.locationAddress,
        rentPrice: validatedData.rentPrice,
        deposit: validatedData.deposit,
        availableFrom: validatedData.availableFrom ? new Date(validatedData.availableFrom) : undefined,
        roomType: validatedData.roomType,
        numRoommatesWanted: validatedData.numRoommatesWanted,
        totalRooms: validatedData.totalRooms,
        totalBathrooms: validatedData.totalBathrooms,
        sizeSqm: validatedData.sizeSqm,
        furnished: validatedData.furnished,
        petsAllowed: validatedData.petsAllowed,
        smokingAllowed: validatedData.smokingAllowed,
      },
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
    });

    return NextResponse.json<ApiResponse<ListingWithUser>>({
      success: true,
      data: updatedListing,
      message: 'แก้ไขประกาศสำเร็จ',
    });
  } catch (error: any) {
    console.error('Update listing error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขประกาศ' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete listing
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if listing exists and belongs to user
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ไม่พบประกาศนี้' },
        { status: 404 }
      );
    }

    if (listing.userId !== user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'คุณไม่มีสิทธิ์ลบประกาศนี้' },
        { status: 403 }
      );
    }

    // Delete listing (cascade delete will handle related records)
    await prisma.listing.delete({
      where: { id: params.id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'ลบประกาศสำเร็จ',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบประกาศ' },
      { status: 500 }
    );
  }
}