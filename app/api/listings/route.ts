import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { createListingSchema, listingQuerySchema } from '@/lib/validations';
import type { ApiResponse, PaginatedResponse, ListingWithUser } from '@/types';

// GET /api/listings - Get all listings with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryObject = Object.fromEntries(searchParams.entries());
    const query = listingQuerySchema.parse(queryObject);

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { status: 'ACTIVE' };

    if (query.type) where.type = query.type;
    if (query.locationProvince) where.locationProvince = query.locationProvince;
    if (query.locationDistrict) where.locationDistrict = query.locationDistrict;
    if (query.roomType) where.roomType = query.roomType;
    if (query.furnished !== undefined) where.furnished = query.furnished === 'true';
    if (query.petsAllowed !== undefined) where.petsAllowed = query.petsAllowed === 'true';
    if (query.smokingAllowed !== undefined) where.smokingAllowed = query.smokingAllowed === 'true';

    if (query.minPrice || query.maxPrice) {
      where.rentPrice = {};
      if (query.minPrice) where.rentPrice.gte = parseInt(query.minPrice);
      if (query.maxPrice) where.rentPrice.lte = parseInt(query.maxPrice);
    }

    // Build order by
    const orderBy: any = {};
    orderBy[query.sortBy] = query.order;

    // Get listings with pagination
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      }),
      prisma.listing.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<ApiResponse<PaginatedResponse<ListingWithUser>>>({
      success: true,
      data: {
        items: listings,
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Get listings error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประกาศ' },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create new listing
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
    const validatedData = createListingSchema.parse(body);

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        userId: user.id,
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        locationProvince: validatedData.locationProvince,
        locationDistrict: validatedData.locationDistrict,
        locationAddress: validatedData.locationAddress,
        rentPrice: validatedData.rentPrice,
        deposit: validatedData.deposit,
        availableFrom: new Date(validatedData.availableFrom),
        roomType: validatedData.roomType,
        numRoommatesWanted: validatedData.numRoommatesWanted,
        totalRooms: validatedData.totalRooms,
        totalBathrooms: validatedData.totalBathrooms,
        sizeSqm: validatedData.sizeSqm,
        furnished: validatedData.furnished,
        petsAllowed: validatedData.petsAllowed,
        smokingAllowed: validatedData.smokingAllowed,
        amenities: validatedData.amenities || [],
        images: validatedData.images ? {
          create: validatedData.images.map((url, index) => ({
            imageUrl: url,
            isPrimary: index === 0,
            order: index
          }))
        } : undefined,
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

    return NextResponse.json<ApiResponse<ListingWithUser>>(
      {
        success: true,
        data: listing,
        message: 'สร้างประกาศสำเร็จ',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create listing error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: `เกิดข้อผิดพลาดในการสร้างประกาศ: ${error.message}` },
      { status: 500 }
    );
  }
}