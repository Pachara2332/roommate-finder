import { create } from 'zustand';

interface Listing {
  id: string;
  title: string;
  description: string;
  locationProvince: string;
  locationDistrict: string;
  rentPrice: number;
  roomType: string;
  images: string[];
  user: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
}

interface ListingFilters {
  locationProvince: string;
  minPrice: string;
  maxPrice: string;
  roomType: string;
  furnished: boolean;
}

interface ListingState {
  listings: Listing[];
  currentListing: Listing | null;
  filters: ListingFilters;
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  
  // Actions
  setListings: (listings: Listing[]) => void;
  setCurrentListing: (listing: Listing | null) => void;
  setFilters: (filters: Partial<ListingFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setTotalCount: (count: number) => void;
  setCurrentPage: (page: number) => void;
  addListing: (listing: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  removeListing: (id: string) => void;
}

const defaultFilters: ListingFilters = {
  locationProvince: '',
  minPrice: '',
  maxPrice: '',
  roomType: '',
  furnished: false,
};

export const useListingStore = create<ListingState>((set) => ({
  listings: [],
  currentListing: null,
  filters: defaultFilters,
  isLoading: false,
  totalCount: 0,
  currentPage: 1,

  setListings: (listings) => set({ listings }),
  
  setCurrentListing: (listing) => set({ currentListing: listing }),
  
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setTotalCount: (count) => set({ totalCount: count }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  addListing: (listing) => set((state) => ({ 
    listings: [listing, ...state.listings] 
  })),
  
  updateListing: (id, updates) => set((state) => ({
    listings: state.listings.map((l) => 
      l.id === id ? { ...l, ...updates } : l
    ),
  })),
  
  removeListing: (id) => set((state) => ({
    listings: state.listings.filter((l) => l.id !== id),
  })),
}));
