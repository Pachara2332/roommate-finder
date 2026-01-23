export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  occupation?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface ListingWithUser {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  locationProvince: string;
  locationDistrict: string;
  locationAddress: string;
  rentPrice: number;
  deposit?: number | null;
  availableFrom: Date;
  roomType: string;
  numRoommatesWanted?: number | null;
  totalRooms: number;
  totalBathrooms: number;
  sizeSqm?: number | null;
  furnished: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  status: string;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string;
    profileImage?: string | null;
  };
  images: {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    order: number;
  }[];
  _count?: {
    favorites: number;
  };
}