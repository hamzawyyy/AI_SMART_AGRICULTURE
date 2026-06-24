export type CropGrade = 'A' | 'B' | 'C';
export type MarketTarget = 'eu' | 'gulf' | 'local' | 'any';

export interface Listing {
  id: string;
  farmerId: string;
  cropName: string;
  cropNameEn: string;
  cropEmoji: string;
  farmerName: string;
  farmerNameEn: string;
  location: string;
  locationEn: string;
  grade: CropGrade;
  marketTarget: MarketTarget;
  quantity: number;
  pricePerKg: number;
  totalPrice: number;
  qualityScore: number;
  exportApproved: boolean;
  description: string;
  descriptionEn: string;
  harvestDate: string;
  expiryDate: string;
  status: 'available' | 'reserved' | 'sold';
  createdAt: string;
}

export interface Order {
  id: string;
  listingId: string;
  cropName: string;
  cropNameEn: string;
  cropEmoji: string;
  farmerName: string;
  farmerNameEn: string;
  buyerName: string;
  buyerRole: string;
  grade: CropGrade;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface CreateListingPayload {
  cropName: string;
  cropNameEn: string;
  cropEmoji: string;
  grade: CropGrade;
  marketTarget: MarketTarget;
  quantity: number;
  pricePerKg: number;
  description: string;
  descriptionEn: string;
  harvestDate: string;
  expiryDate: string;
  exportApproved: boolean;
}

export interface ListingsFilter {
  page?: number;
  limit?: number;
  search?: string;
  grade?: 'all' | CropGrade;
  marketTarget?: 'all' | MarketTarget;
  crop?: string;
  farmerId?: string;
}

export interface MarketStats {
  totalListings: number;
  totalVolume: number;
  totalValue: number;
  avgQualityScore: number;
  gradeAPercent: number;
  exportReadyPercent: number;
  totalOrders: number;
  pendingOrders: number;
}

// ── Mock Data ─────────────────────────────────────────────────
let mockListings: Listing[] = [
  {
    id: '1', farmerId: 'farmer-1',
    cropName: 'طماطم', cropNameEn: 'Tomatoes', cropEmoji: '🍅',
    farmerName: 'أحمد محمد', farmerNameEn: 'Ahmed Mohamed',
    location: 'الإسكندرية', locationEn: 'Alexandria',
    grade: 'A', marketTarget: 'eu', quantity: 500, pricePerKg: 12, totalPrice: 6000,
    qualityScore: 92, exportApproved: true,
    description: 'طماطم عالية الجودة مصنّفة بالذكاء الاصطناعي',
    descriptionEn: 'High quality AI-graded tomatoes',
    harvestDate: '2026-06-01', expiryDate: '2026-07-15',
    status: 'available', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '2', farmerId: 'farmer-2',
    cropName: 'برتقال', cropNameEn: 'Oranges', cropEmoji: '🍊',
    farmerName: 'محمد علي', farmerNameEn: 'Mohamed Ali',
    location: 'الفيوم', locationEn: 'Fayoum',
    grade: 'A', marketTarget: 'gulf', quantity: 1200, pricePerKg: 8, totalPrice: 9600,
    qualityScore: 89, exportApproved: true,
    description: 'برتقال فالنسيا ناضج ومعبأ',
    descriptionEn: 'Ripe and packed Valencia oranges',
    harvestDate: '2026-05-20', expiryDate: '2026-07-10',
    status: 'available', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '3', farmerId: 'farmer-1',
    cropName: 'فراولة', cropNameEn: 'Strawberry', cropEmoji: '🍓',
    farmerName: 'أحمد محمد', farmerNameEn: 'Ahmed Mohamed',
    location: 'الإسكندرية', locationEn: 'Alexandria',
    grade: 'B', marketTarget: 'local', quantity: 300, pricePerKg: 20, totalPrice: 6000,
    qualityScore: 76, exportApproved: false,
    description: 'فراولة طازجة للسوق المحلي',
    descriptionEn: 'Fresh strawberries for local market',
    harvestDate: '2026-06-10', expiryDate: '2026-06-25',
    status: 'available', createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: '4', farmerId: 'farmer-3',
    cropName: 'قمح', cropNameEn: 'Wheat', cropEmoji: '🌾',
    farmerName: 'خالد إبراهيم', farmerNameEn: 'Khaled Ibrahim',
    location: 'المنيا', locationEn: 'Minya',
    grade: 'A', marketTarget: 'any', quantity: 5000, pricePerKg: 4, totalPrice: 20000,
    qualityScore: 95, exportApproved: true,
    description: 'قمح صلب عالي البروتين',
    descriptionEn: 'High-protein hard wheat',
    harvestDate: '2026-06-05', expiryDate: '2026-09-01',
    status: 'available', createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: '5', farmerId: 'farmer-2',
    cropName: 'بطاطس', cropNameEn: 'Potatoes', cropEmoji: '🥔',
    farmerName: 'محمد علي', farmerNameEn: 'Mohamed Ali',
    location: 'الفيوم', locationEn: 'Fayoum',
    grade: 'B', marketTarget: 'local', quantity: 800, pricePerKg: 6, totalPrice: 4800,
    qualityScore: 81, exportApproved: false,
    description: 'بطاطس منتجة محلياً بجودة عالية',
    descriptionEn: 'Locally grown high-quality potatoes',
    harvestDate: '2026-05-28', expiryDate: '2026-08-01',
    status: 'available', createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '6', farmerId: 'farmer-3',
    cropName: 'خيار', cropNameEn: 'Cucumber', cropEmoji: '🥒',
    farmerName: 'خالد إبراهيم', farmerNameEn: 'Khaled Ibrahim',
    location: 'المنيا', locationEn: 'Minya',
    grade: 'A', marketTarget: 'eu', quantity: 400, pricePerKg: 9, totalPrice: 3600,
    qualityScore: 90, exportApproved: true,
    description: 'خيار هولندي معتمد للتصدير',
    descriptionEn: 'Dutch-type cucumber certified for export',
    harvestDate: '2026-06-12', expiryDate: '2026-07-05',
    status: 'available', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

let mockOrders: Order[] = [
  {
    id: 'ord-1', listingId: '1',
    cropName: 'طماطم', cropNameEn: 'Tomatoes', cropEmoji: '🍅',
    farmerName: 'أحمد محمد', farmerNameEn: 'Ahmed Mohamed',
    buyerName: 'شركة النيل للتجارة', buyerRole: 'trader',
    grade: 'A', quantity: 200, totalPrice: 2400,
    status: 'confirmed', createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ord-2', listingId: '4',
    cropName: 'قمح', cropNameEn: 'Wheat', cropEmoji: '🌾',
    farmerName: 'خالد إبراهيم', farmerNameEn: 'Khaled Ibrahim',
    buyerName: 'مجموعة الصادرات المصرية', buyerRole: 'exporter',
    grade: 'A', quantity: 1000, totalPrice: 4000,
    status: 'shipped', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// ── API ───────────────────────────────────────────────────────
export const marketplaceApi = {
  async getListings(filter: ListingsFilter) {
    let items = [...mockListings];

    // Filter by farmerId (for farmer's own listings)
    if (filter.farmerId) {
      items = items.filter(l => l.farmerId === filter.farmerId);
    }

    // Search
    if (filter.search) {
      const s = filter.search.toLowerCase();
      items = items.filter(l =>
        l.cropName.includes(filter.search!) ||
        l.cropNameEn.toLowerCase().includes(s) ||
        l.farmerName.includes(filter.search!) ||
        l.farmerNameEn.toLowerCase().includes(s)
      );
    }

    // Grade filter
    if (filter.grade && filter.grade !== 'all') {
      items = items.filter(l => l.grade === filter.grade);
    }

    // Market target filter
    if (filter.marketTarget && filter.marketTarget !== 'all') {
      items = items.filter(l => l.marketTarget === filter.marketTarget);
    }

    // Crop filter
    if (filter.crop) {
      const c = filter.crop.toLowerCase();
      items = items.filter(l => l.cropNameEn.toLowerCase().includes(c) || l.cropName.includes(filter.crop!));
    }

    const total = items.length;
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 6;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return {
      success: true,
      data: { items: paged, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getStats() {
    const available = mockListings.filter(l => l.status === 'available');
    const stats: MarketStats = {
      totalListings: available.length,
      totalVolume: available.reduce((s, l) => s + l.quantity, 0),
      totalValue: available.reduce((s, l) => s + l.totalPrice, 0),
      avgQualityScore: Math.round(available.reduce((s, l) => s + l.qualityScore, 0) / (available.length || 1)),
      gradeAPercent: Math.round((available.filter(l => l.grade === 'A').length / (available.length || 1)) * 100),
      exportReadyPercent: Math.round((available.filter(l => l.exportApproved).length / (available.length || 1)) * 100),
      totalOrders: mockOrders.length,
      pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
    };
    return { success: true, data: stats };
  },

  async getMyOrders(buyerRole?: string) {
    return { success: true, data: mockOrders };
  },

  async getAllOrders() {
    return { success: true, data: mockOrders };
  },

  async getFarmerOrders(farmerId: string) {
    // Orders on the farmer's own listings
    const farmerListingIds = mockListings.filter(l => l.farmerId === farmerId).map(l => l.id);
    const orders = mockOrders.filter(o => farmerListingIds.includes(o.listingId));
    return { success: true, data: orders };
  },

  async createOrder({ listingId, quantity, buyerName, buyerRole }: {
    listingId: string; quantity: number; buyerName: string; buyerRole: string;
  }) {
    const listing = mockListings.find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');
    const order: Order = {
      id: `ord-${Date.now()}`,
      listingId,
      cropName: listing.cropName,
      cropNameEn: listing.cropNameEn,
      cropEmoji: listing.cropEmoji,
      farmerName: listing.farmerName,
      farmerNameEn: listing.farmerNameEn,
      buyerName,
      buyerRole,
      grade: listing.grade,
      quantity,
      totalPrice: quantity * listing.pricePerKg,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    mockOrders.unshift(order);
    if (quantity >= listing.quantity) {
      const idx = mockListings.findIndex(l => l.id === listingId);
      if (idx !== -1) mockListings[idx] = { ...mockListings[idx], status: 'sold' };
    }
    return { success: true, data: order };
  },

  async createListing(payload: CreateListingPayload, farmerId: string, farmerName: string, farmerNameEn: string) {
    const newListing: Listing = {
      id: `lst-${Date.now()}`,
      farmerId,
      ...payload,
      location: 'الإسكندرية',
      locationEn: 'Alexandria',
      farmerName,
      farmerNameEn,
      totalPrice: payload.quantity * payload.pricePerKg,
      qualityScore: Math.floor(70 + Math.random() * 25), // Simulated AI score
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    mockListings.unshift(newListing);
    return { success: true, data: newListing };
  },

  async deleteListing(listingId: string) {
    mockListings = mockListings.filter(l => l.id !== listingId);
    return { success: true, data: null };
  },

  async updateListingStatus(listingId: string, status: 'available' | 'reserved' | 'sold') {
    const idx = mockListings.findIndex(l => l.id === listingId);
    if (idx !== -1) mockListings[idx] = { ...mockListings[idx], status };
    return { success: true, data: mockListings[idx] };
  },
};
