import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  fullName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  occupation: z.string().optional(),
  bio: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณาใส่รหัสผ่าน'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  occupation: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
});

// Listing Schemas
export const createListingSchema = z.object({
  type: z.enum(['SEEKING_ROOMMATE', 'OFFERING_ROOM']),
  title: z.string().min(10, 'หัวข้อต้องมีอย่างน้อย 10 ตัวอักษร'),
  description: z.string().min(50, 'รายละเอียดต้องมีอย่างน้อย 50 ตัวอักษร'),
  locationProvince: z.string().min(1, 'กรุณาระบุจังหวัด'),
  locationDistrict: z.string().min(1, 'กรุณาระบุเขต/อำเภอ'),
  locationAddress: z.string().min(10, 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร'),
  rentPrice: z.number().min(0, 'ค่าเช่าต้องมากกว่า 0'),
  deposit: z.number().optional(),
  availableFrom: z.string(),
  roomType: z.enum(['PRIVATE', 'SHARED']),
  numRoommatesWanted: z.number().optional(),
  totalRooms: z.number().min(1, 'จำนวนห้องต้องมากกว่า 0'),
  totalBathrooms: z.number().min(1, 'จำนวนห้องน้ำต้องมากกว่า 0'),
  sizeSqm: z.number().optional(),
  furnished: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
});

export const updateListingSchema = createListingSchema.partial();

export const listingQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  type: z.enum(['SEEKING_ROOMMATE', 'OFFERING_ROOM']).optional(),
  locationProvince: z.string().optional(),
  locationDistrict: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  roomType: z.enum(['PRIVATE', 'SHARED']).optional(),
  furnished: z.string().optional(),
  petsAllowed: z.string().optional(),
  smokingAllowed: z.string().optional(),
  sortBy: z.enum(['createdAt', 'rentPrice', 'viewsCount']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Message Schema
export const sendMessageSchema = z.object({
  receiverId: z.string(),
  listingId: z.string().optional(),
  content: z.string().min(1, 'กรุณาใส่ข้อความ').max(2000, 'ข้อความยาวเกินไป'),
});

// Preference Schema
export const updatePreferenceSchema = z.object({
  minAge: z.number().min(18).max(100).optional(),
  maxAge: z.number().min(18).max(100).optional(),
  preferredGender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  cleanlinessLevel: z.number().min(1).max(5).optional(),
  noiseLevel: z.number().min(1).max(5).optional(),
  guestsAllowed: z.boolean().optional(),
  workSchedule: z.string().optional(),
  interests: z.array(z.string()).optional(),
  dealBreakers: z.array(z.string()).optional(),
});

// Review Schema
export const createReviewSchema = z.object({
  reviewedUserId: z.string(),
  listingId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingQueryInput = z.infer<typeof listingQuerySchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;