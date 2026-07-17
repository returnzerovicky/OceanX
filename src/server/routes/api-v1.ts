import express, { Request, Response, NextFunction } from 'express';
import { 
  AuthService, 
  UserService, 
  ProductService, 
  CartService, 
  OrderService, 
  CheckoutService, 
  PaymentService, 
  ShippingService, 
  CouponService, 
  ReviewService, 
  SearchService, 
  AdminService, 
  AIService, 
  DisputeService, 
  EscrowService,
  AnalyticsService
} from '../services/index';
import { productRepository } from '../repositories/product.repository';
import { userRepository } from '../repositories/user.repository';
import { orderRepository } from '../repositories/order.repository';
import { db } from '../db';
import { getSemanticSearchFilters } from '../gemini';
import { matchesSearch } from '../utils';

const router = express.Router();

// Initialize Services
const authService = new AuthService();
const userService = new UserService();
const productService = new ProductService();
const cartService = new CartService();
const orderService = new OrderService();
const checkoutService = new CheckoutService();
const paymentService = new PaymentService();
const shippingService = new ShippingService();
const couponService = new CouponService();
const reviewService = new ReviewService();
const searchService = new SearchService();
const adminService = new AdminService();
const aiService = new AIService();
const disputeService = new DisputeService();
const escrowService = new EscrowService();
const analyticsService = new AnalyticsService();

// ============================================================================
// MIDDLEWARES: SECURITY & COMPLIANCE
// ============================================================================

// Simple Rate Limiter
const ipRequestCounts: Map<string, { count: number; resetTime: number }> = new Map();
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const limit = 120;      // 120 requests per minute

  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const rate = ipRequestCounts.get(ip)!;
  if (now > rate.resetTime) {
    rate.count = 1;
    rate.resetTime = now + windowMs;
    return next();
  }

  rate.count++;
  if (rate.count > limit) {
    return res.status(429).json({ 
      error: 'Too Many Requests', 
      message: 'Rate limit exceeded. Please wait before executing more transactions.' 
    });
  }
  next();
}

// RBAC Middleware (Role-Based Access Control)
function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Determine active role from simulated session or header
    const authHeader = req.headers.authorization;
    let currentRole = 'Customer';

    // In preview mode, we inspect the global active session or standard session context
    const sessions = userRepository.getAll();
    // Fallback to whichever session is marked active globally (mocked in server.ts)
    const activeSession = sessions.find(s => s.id === (req as any).userId) || sessions[0];
    
    if (activeSession) {
      currentRole = activeSession.role;
    }

    if (!allowedRoles.includes(currentRole)) {
      db.addAuditLog({
        action: `Unauthorized role access attempt to ${req.originalUrl}`,
        user: activeSession?.name || 'Anonymous',
        role: currentRole,
        status: 'Warning',
        ip: req.ip || '127.0.0.1'
      });
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Requires role: [${allowedRoles.join(', ')}]. Current role: ${currentRole}` 
      });
    }
    next();
  };
}

// Input XSS & Injection Sanitization Protection
function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const checkObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        // Basic check for HTML/SQL scripts
        if (/<script|SELECT\s+.*\s+FROM|UNION\s+SELECT|['";]/gi.test(obj[key])) {
          obj[key] = obj[key].replace(/<script.*?>.*?<\/script>/gi, '')
                             .replace(/['"=\-;#]/g, '');
        }
      } else if (typeof obj[key] === 'object') {
        checkObject(obj[key]);
      }
    }
  };

  checkObject(req.body);
  checkObject(req.query);
  next();
}

// Mount common route level filters
router.use(rateLimiter);
router.use(sanitizeInput);

// ============================================================================
// REST ROUTES: AUTH SERVICE
// ============================================================================

router.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email parameter is required.' });

  const authData = authService.authenticate(email);
  if (!authData) return res.status(401).json({ error: 'User with provided email does not exist.' });

  res.json(authData);
});

router.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const sessions = userRepository.getAll();
  const session = sessions.find(s => s.role === role);

  if (session) {
    db.addAuditLog({
      action: `User swapped platform scope to ${role}`,
      user: session.name,
      role: session.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });
    res.json({ success: true, active: session });
  } else {
    res.status(404).json({ error: `Session user with role ${role} not found.` });
  }
});

router.get('/auth/sessions', (req: Request, res: Response) => {
  const sessions = userRepository.getAll();
  res.json({ sessions });
});

// ============================================================================
// REST ROUTES: HOMEPAGE & ENTERPRISE SEARCH
// ============================================================================

const getDynamicSelection = <T>(arr: T[], count = 12): T[] => {
  if (arr.length <= count) return arr;
  // Fisher-Yates but with localized swapping so products don't move too far out of relevance
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};

const FEATURED_SELLERS_POOL = [
  {
    id: 'seller-apex',
    name: 'Apex Digital Labs',
    banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    followersCount: 14200,
    productsCount: 154,
    verified: true
  },
  {
    id: 'seller-nova',
    name: 'Nova Apparel Group',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    followersCount: 8900,
    productsCount: 320,
    verified: true
  },
  {
    id: 'seller-eco',
    name: 'EcoLiving Home Products',
    banner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    followersCount: 5400,
    productsCount: 82,
    verified: true
  },
  {
    id: 'seller-lumina',
    name: 'Lumina Craft & Lighting',
    banner: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    followersCount: 12500,
    productsCount: 110,
    verified: true
  },
  {
    id: 'seller-zenith',
    name: 'Zenith Tech Innovations',
    banner: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    followersCount: 6100,
    productsCount: 95,
    verified: true
  },
  {
    id: 'seller-velvet',
    name: 'Velvet Thread Studio',
    banner: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    followersCount: 9800,
    productsCount: 175,
    verified: true
  }
];

router.get('/home', (req: Request, res: Response) => {
  const products = productRepository.getAll();

  const heroBanners = [
    {
      id: 'banner-1',
      title: 'The Next-Gen Audio Drop',
      subtitle: 'Immersive Active Noise Cancellation and high-fidelity soundscapes.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
      cta: 'Explore Acoustics',
      path: '/category/Electronics'
    },
    {
      id: 'banner-2',
      title: 'Minimalist Wardrobe',
      subtitle: 'Tailored garments crafted with natural, breathable fibers.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
      cta: 'View Apparel',
      path: '/category/Fashion Men'
    },
    {
      id: 'banner-3',
      title: 'Living Space Aesthetics',
      subtitle: 'Architectural home accessories designed for modern living.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80',
      cta: 'Shop Collection',
      path: '/home'
    }
  ];

  const featuredProducts = getDynamicSelection(products.slice(0, 24), 12);

  // Trending (top 24 sorted, randomly select 12 to jitter)
  const trendingPool = [...products]
    .sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0))
    .slice(0, 24);
  const trending = getDynamicSelection(trendingPool, 12);

  // Best Sellers (top 24 sorted, randomly select 12 to jitter)
  const bestSellersPool = [...products]
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
    .slice(0, 24);
  const bestSellers = getDynamicSelection(bestSellersPool, 12);

  // Deals
  const dealsPool = products
    .filter(p => p.price > 45 && p.price < 500)
    .slice(0, 24);
  const deals = getDynamicSelection(dealsPool, 12).map((p, i) => ({
    ...p,
    originalPrice: Math.round(p.price * 1.3),
    discountPercent: 15 + (i * 3) % 25,
    limitedStock: p.stock > 5 ? 3 : p.stock
  }));

  // Collections
  const collections = [
    { id: 'sustainable', name: 'Sustainable Materials', description: 'Eco-friendly, recycled, and organic designs.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80' },
    { id: 'minimal-workspace', name: 'Minimalist Workspaces', description: 'High-efficiency setups for deep focus.', image: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=800&auto=format&fit=crop&q=80' }
  ];

  // Brands (shuffled brands for freshness)
  const brandsPool = [
    { name: 'Sony Direct Store', logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&auto=format&fit=crop&q=80', path: '/brand/Sony' },
    { name: 'Apple Certified Store', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=80', path: '/brand/Sony' },
    { name: 'Nike Store Front', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80', path: '/brand/Nike' },
    { name: 'Aesop Direct Store', logo: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100&auto=format&fit=crop&q=80', path: '/brand/Sony' }
  ];
  const brands = getDynamicSelection(brandsPool, 4);

  // Recently Viewed (default selection of products)
  const recentlyViewed = products.filter(p => ['prod-1', 'prod-2', 'prod-5'].includes(p.id));

  // Recommended (personalized or top products, randomized from the catalog)
  const recommended = getDynamicSelection(products.slice(4, 30), 12);

  // Festival Collection
  const festivalPool = products.filter(p => p.rating >= 4.7);
  const festival = getDynamicSelection(festivalPool, 12);

  // Budget Finds Under $15 (represented as ₹999 on the client)
  const budgetPool = products.filter(p => p.price <= 50);
  const budget = getDynamicSelection(budgetPool, 12);

  // Office Essentials
  const officePool = products.filter(p => p.category === 'Accessories' || p.category === 'Laptops' || p.subcategory?.toLowerCase().includes('work') || p.subcategory?.toLowerCase().includes('desk'));
  const office = getDynamicSelection(officePool, 12);

  // Continue Shopping
  const continueShopping = getDynamicSelection(products.slice(2, 20), 8);

  // Because You Viewed (recommend items in similar category to prod-1, e.g. Electronics)
  const becauseViewedPool = products.filter(p => p.category === 'Electronics');
  const becauseViewed = getDynamicSelection(becauseViewedPool, 8);

  // Flash Sale
  const flashSalePool = products.slice(8, 24);
  const flashSale = getDynamicSelection(flashSalePool, 6).map((p, i) => ({
    ...p,
    originalPrice: Math.round(p.price * 1.4),
    discountPercent: 25 + (i * 4) % 25,
    limitedStock: Math.max(1, p.stock % 4)
  }));

  // New arrivals
  const newArrivalsPool = [...products]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 24);
  const newArrivals = getDynamicSelection(newArrivalsPool, 12);

  // Curated category lists to avoid any potential runtime undefined exceptions in old client code:
  const electronics = getDynamicSelection(products.filter(p => p.category === 'Electronics'), 12);
  const fashion = getDynamicSelection(products.filter(p => p.category === 'Fashion Men' || p.category === 'Fashion Women'), 12);
  const homeKitchen = getDynamicSelection(products.filter(p => p.category === 'Home & Kitchen' || p.category === 'Home'), 12);
  const gaming = getDynamicSelection(products.filter(p => p.category === 'Laptops' || p.subcategory?.toLowerCase() === 'gaming'), 12);
  const beauty = getDynamicSelection(products.filter(p => p.category === 'Beauty'), 12);
  const books = getDynamicSelection(products.filter(p => p.category === 'Books'), 12);
  const toys = getDynamicSelection(products.filter(p => p.category === 'Toys'), 12);
  const sports = getDynamicSelection(products.filter(p => p.category === 'Sports'), 12);

  const categories = [
    { name: 'Mobiles', icon: 'Smartphone', count: 124, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80' },
    { name: 'Laptops', icon: 'Laptop', count: 86, image: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=400&auto=format&fit=crop&q=80' },
    { name: 'Fashion Men', icon: 'Shirt', count: 340, image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&auto=format&fit=crop&q=80' },
    { name: 'Fashion Women', icon: 'Sparkles', count: 420, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80' },
    { name: 'Shoes', icon: 'Footprints', count: 150, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80' },
    { name: 'Watches', icon: 'Watch', count: 95, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&auto=format&fit=crop&q=80' },
    { name: 'Beauty', icon: 'Flame', count: 180, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80' },
    { name: 'Books', icon: 'BookOpen', count: 210, image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80' },
    { name: 'Furniture', icon: 'Home', count: 75, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&auto=format&fit=crop&q=80' },
    { name: 'Kitchen', icon: 'Soup', count: 110, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80' },
    { name: 'Sports', icon: 'Activity', count: 130, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&auto=format&fit=crop&q=80' },
    { name: 'Toys', icon: 'Gamepad2', count: 90, image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&auto=format&fit=crop&q=80' },
    { name: 'Baby', icon: 'Heart', count: 65, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&auto=format&fit=crop&q=80' },
    { name: 'Automotive', icon: 'Car', count: 45, image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=400&auto=format&fit=crop&q=80' },
    { name: 'Pet Supplies', icon: 'Bone', count: 55, image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&auto=format&fit=crop&q=80' }
  ];

  res.json({
    heroBanners,
    featuredProducts,
    trending,
    bestSellers,
    deals,
    todaysDeals: deals, // aligned with schema
    categories, // aligned with schema
    collections,
    brands,
    featuredBrands: brands, // aligned with schema
    featuredSellers: FEATURED_SELLERS_POOL, // aligned with schema
    recentlyViewed,
    recommended,
    festival,
    budget,
    office,
    continueShopping,
    becauseViewed,
    flashSale,
    newArrivals,
    newReleases: newArrivals, // aligned with schema
    // Also provide backward compatibility keys:
    luxury: products.filter(p => p.price > 500).slice(0, 12),
    electronics,
    fashion,
    homeKitchen,
    gaming,
    beauty,
    books,
    toys,
    sports
  });
});

// INDEPENDENT DEDICATED DISCOVERY ENDPOINTS FOR AMAZON-STYLE LAZY LOADING
router.get('/home/deals', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const dealsPool = products.filter(p => p.price > 45 && p.price < 500);
  const deals = getDynamicSelection(dealsPool, 12).map((p, i) => ({
    ...p,
    originalPrice: Math.round(p.price * 1.3),
    discountPercent: 15 + (i * 3) % 25,
    limitedStock: p.stock > 5 ? 3 : p.stock
  }));
  res.json(deals);
});

router.get('/home/trending', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const trendingPool = [...products]
    .sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0))
    .slice(0, 24);
  const trending = getDynamicSelection(trendingPool, 8);
  res.json(trending);
});

router.get('/home/new', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const newArrivalsPool = [...products]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 24);
  const newReleases = getDynamicSelection(newArrivalsPool, 8);
  res.json(newReleases);
});

router.get('/home/bestsellers', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const bestSellersPool = [...products]
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
    .slice(0, 24);
  const bestSellers = getDynamicSelection(bestSellersPool, 8);
  res.json(bestSellers);
});

router.get('/home/recommended', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const recommended = getDynamicSelection(products.slice(4, 30), 10);
  res.json(recommended);
});

router.get('/home/featured-sellers', (req: Request, res: Response) => {
  res.json(FEATURED_SELLERS_POOL.slice(0, 8));
});

router.get('/home/luxury', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const luxuryPool = products.filter(p => p.price > 300 || ['rolex', 'omega', 'gucci', 'prada', 'louis vuitton', 'leica', 'bose', 'apple'].includes(p.brand.toLowerCase()));
  const luxury = getDynamicSelection(luxuryPool, 8);
  res.json(luxury);
});

router.get('/home/budget', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const budgetPool = products.filter(p => p.price <= 50);
  const budget = getDynamicSelection(budgetPool, 8);
  res.json(budget);
});

router.get('/home/under-999', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const underPool = products.filter(p => p.price <= 15);
  const under999 = getDynamicSelection(underPool, 8);
  res.json(under999);
});

router.get('/home/electronics', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const electronics = getDynamicSelection(products.filter(p => p.category === 'Electronics'), 8);
  res.json(electronics);
});

router.get('/home/fashion', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const fashion = getDynamicSelection(products.filter(p => p.category === 'Fashion Men' || p.category === 'Fashion Women'), 8);
  res.json(fashion);
});

router.get('/home/gaming', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const gaming = getDynamicSelection(products.filter(p => p.category === 'Laptops' || p.subcategory?.toLowerCase() === 'gaming' || p.subcategory?.toLowerCase() === 'accessories'), 8);
  res.json(gaming);
});

router.get('/home/books', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const books = getDynamicSelection(products.filter(p => p.category === 'Books'), 8);
  res.json(books);
});

router.get('/home/beauty', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const beauty = getDynamicSelection(products.filter(p => p.category === 'Beauty'), 8);
  res.json(beauty);
});

router.get('/home/home-essentials', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const homeEssentials = getDynamicSelection(products.filter(p => p.category === 'Home & Kitchen' || p.category === 'Home' || p.category === 'Furniture' || p.category === 'Kitchen'), 8);
  res.json(homeEssentials);
});

router.get('/home/toys', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const toys = getDynamicSelection(products.filter(p => p.category === 'Toys' || p.category === 'Baby'), 8);
  res.json(toys);
});

router.get('/home/sports', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const sports = getDynamicSelection(products.filter(p => p.category === 'Sports'), 8);
  res.json(sports);
});

router.get('/home/continue-shopping', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const continueShopping = getDynamicSelection(products.slice(2, 20), 8);
  res.json(continueShopping);
});

router.get('/home/flash-sale', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const flashSalePool = products.slice(8, 24);
  const flashSale = getDynamicSelection(flashSalePool, 6).map((p, i) => ({
    ...p,
    originalPrice: Math.round(p.price * 1.4),
    discountPercent: 25 + (i * 4) % 25,
    limitedStock: Math.max(1, p.stock % 4)
  }));
  res.json(flashSale);
});

router.get('/search', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').trim().toLowerCase();
  const products = productRepository.getAll();

  if (!q) {
    return res.json({
      products: [],
      collections: [],
      brands: [],
      accessories: [],
      cases: [],
      chargers: [],
      relatedSearches: ["audio pro", "running watch", "walnut dock", "smart garden"]
    });
  }

  // Find products that match
  const matchedProducts = products.filter(p => matchesSearch(p, q));

  // Determine brands that match
  const brands = Array.from(new Set(products.map(p => p.brand)))
    .filter(b => b.toLowerCase().includes(q) || q.includes(b.toLowerCase()))
    .map(b => ({
      name: `${b} Certified Store`,
      path: `/brand/${b}`
    }));

  // Determine collections that match
  const allCollections = [
    { id: 'sustainable', name: 'Sustainable Materials', description: 'Eco-friendly, recycled, and organic designs.' },
    { id: 'minimal-workspace', name: 'Minimalist Workspaces', description: 'High-efficiency setups for deep focus.' }
  ];
  const collections = allCollections.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.description.toLowerCase().includes(q) ||
    q.includes(c.id)
  );

  // Determine accessories (subcategory or category contains charger, cable, dock, headphones, cases)
  const accessories = products.filter(p => 
    (p.category === 'Accessories' || 
     p.subcategory?.toLowerCase().includes('charger') ||
     p.subcategory?.toLowerCase().includes('dock') ||
     p.subcategory?.toLowerCase().includes('headphones') ||
     p.subcategory?.toLowerCase().includes('case'))
  );

  const cases = products.filter(p => 
    p.subcategory?.toLowerCase().includes('case') || 
    p.name.toLowerCase().includes('case')
  );

  const chargers = products.filter(p => 
    p.subcategory?.toLowerCase().includes('charger') || 
    p.name.toLowerCase().includes('charger') ||
    p.name.toLowerCase().includes('dock')
  );

  // Generate Related Searches
  const relatedSearches: string[] = [];
  if (q.includes('phone') || q.includes('iphone') || q.includes('mobile')) {
    relatedSearches.push('iphone 15 pro max', 'apple wireless charging dock', 'iphone protective case', 'usb-c fast charger');
  } else if (q.includes('laptop') || q.includes('macbook') || q.includes('pc') || q.includes('computer')) {
    relatedSearches.push('macbook air m3', 'ergonomic workstation keyboard', 'dual-band gnss smart watch', 'hdmi surround soundstage');
  } else if (q.includes('audio') || q.includes('headphone') || q.includes('earbud')) {
    relatedSearches.push('noise cancelling headphones', 'true wireless sport earbuds', 'ocean soundwave anc pro', 'portable wireless speaker');
  } else {
    relatedSearches.push(`${q} accessories`, `${q} deals`, `premium ${q}`, `certified ${q} store`);
  }

  res.json({
    products: matchedProducts,
    collections,
    brands,
    accessories: accessories.slice(0, 5),
    cases: cases.slice(0, 5),
    chargers: chargers.slice(0, 5),
    relatedSearches
  });
});

// ============================================================================
// REST ROUTES: PRODUCT SERVICE (Cursor Pagination, Offset, Filtering, Sorting)
// ============================================================================

router.get('/deals', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const deals = products
    .filter(p => p.price > 45 && p.price < 500)
    .sort(() => 0.5 - Math.random())
    .slice(0, 50)
    .map((p, i) => ({
      ...p,
      originalPrice: Math.round(p.price * 1.3),
      discountPercent: 15 + (i * 3) % 25,
      limitedStock: p.stock > 5 ? 3 : p.stock
    }));
  res.json({ items: deals, total: deals.length });
});

router.get('/trending', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const trending = [...products]
    .sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0))
    .slice(0, 24);
  res.json({ items: trending, total: trending.length });
});

router.get('/best-sellers', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const bestSellers = [...products]
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
    .slice(0, 24);
  res.json({ items: bestSellers, total: bestSellers.length });
});

router.get('/category/:slug', (req: Request, res: Response) => {
  const slug = decodeURIComponent(req.params.slug);
  const products = productRepository.getAll();
  const items = products.filter(p => 
    p.category.toLowerCase() === slug.toLowerCase() || 
    p.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === slug.toLowerCase() ||
    p.category.toLowerCase().replace(/ /g, '-') === slug.toLowerCase()
  );
  res.json({ items, total: items.length });
});

router.get('/collection/:slug', (req: Request, res: Response) => {
  const slug = decodeURIComponent(req.params.slug);
  const products = productRepository.getAll();
  const items = products.filter(p => 
    (p as any).collection && (
      (p as any).collection.toLowerCase() === slug.toLowerCase() || 
      (p as any).collection.toLowerCase().replace(/ /g, '-') === slug.toLowerCase() ||
      (p as any).collection.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === slug.toLowerCase()
    )
  );
  res.json({ items, total: items.length });
});

router.get('/brand/:slug', (req: Request, res: Response) => {
  const slug = decodeURIComponent(req.params.slug);
  const products = productRepository.getAll();
  const items = products.filter(p => p.brand.toLowerCase() === slug.toLowerCase() || p.brand.toLowerCase().replace(/ /g, '-') === slug.toLowerCase());
  res.json({ items, total: items.length });
});

router.get('/seller/:id', (req: Request, res: Response) => {
  const products = productRepository.getAll();
  const items = products.filter(p => p.sellerId === req.params.id);
  res.json({ items, total: items.length });
});

router.get('/products', (req: Request, res: Response) => {
  const { 
    q, 
    search,
    category, 
    subcategory, 
    brand, 
    collection,
    minPrice, 
    maxPrice,
    limit, 
    offset, 
    page,
    cursor, 
    sortBy,
    sort,
    rating,
    section
  } = req.query;

  const resolvedLimit = limit ? parseInt(limit as string) : 20;
  let resolvedOffset = offset ? parseInt(offset as string) : 0;
  if (page) {
    const pageNum = parseInt(page as string);
    if (pageNum > 0) {
      resolvedOffset = (pageNum - 1) * resolvedLimit;
    }
  }

  const queryVal = (search as string) || (q as string);
  const sortVal = (sort as string) || (sortBy as string);

  const filters = {
    query: queryVal,
    category: category as string,
    subcategory: subcategory as string,
    brand: brand as string,
    collection: collection as string,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
  };

  const pagination = {
    limit: resolvedLimit,
    offset: resolvedOffset,
    cursor: cursor as string,
    sortBy: sortVal as any
  };

  let results = productRepository.find(filters, pagination);

  // If section query is provided, compute specialized section list
  if (section) {
    const sec = (section as string).toLowerCase();
    const products = productRepository.getAll();
    let sectionItems = [...products];
    if (sec === 'deals') {
      sectionItems = sectionItems.filter(p => p.price > 40);
    } else if (sec === 'trending') {
      sectionItems.sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0));
    } else if (sec === 'best-sellers') {
      sectionItems.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sec === 'new-releases') {
      sectionItems.sort((a, b) => b.id.localeCompare(a.id));
    }
    
    // Apply standard filters to sectionItems
    if (filters.category && filters.category !== 'All') {
      const lower = filters.category.toLowerCase();
      sectionItems = sectionItems.filter(p => p.category.toLowerCase() === lower);
    }
    if (filters.brand) {
      const lower = filters.brand.toLowerCase();
      sectionItems = sectionItems.filter(p => p.brand.toLowerCase() === lower);
    }
    if (filters.minPrice !== undefined) {
      sectionItems = sectionItems.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      sectionItems = sectionItems.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.query) {
      sectionItems = sectionItems.filter(p => matchesSearch(p, filters.query!));
    }
    const total = sectionItems.length;
    const paginated = sectionItems.slice(resolvedOffset, resolvedOffset + resolvedLimit);
    results = {
      items: paginated,
      total,
      nextCursor: null
    };
  }

  // Filter by rating if specified
  if (rating) {
    const minRating = parseFloat(rating as string);
    results.items = results.items.filter(p => (p.rating || 0) >= minRating);
  }

  res.json(results);
});

router.get('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let p = productRepository.findById(id);
    if (!p) {
      p = productRepository.findBySlug(id);
    }
    if (!p) {
      // Find by matching name slugified just in case
      const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      p = productRepository.getAll().find(x => x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug) || null;
    }
    if (!p) throw new Error(`Product ${id} not found.`);
    res.json(p);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

// ============================================================================
// REST ROUTES: CART SERVICE
// ============================================================================

router.get('/cart/:userId', (req: Request, res: Response) => {
  res.json(cartService.getCart(req.params.userId));
});

router.post('/cart/:userId/add', (req: Request, res: Response) => {
  const { productId, quantity, attributes } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required.' });

  try {
    const cart = cartService.addToCart(req.params.userId, productId, quantity || 1, attributes || {});
    res.json(cart);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ============================================================================
// REST ROUTES: ORDERS SERVICE (Checkout + Payment Abstraction + Order Timeline)
// ============================================================================

router.post('/orders/checkout', (req: Request, res: Response) => {
  const { userId, items, couponCode, shippingAddress, paymentMethod } = req.body;

  if (!userId || !items || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: 'Missing necessary checkout parameters.' });
  }

  try {
    // 1. Calculate and verify price summary
    const summary = checkoutService.calculateSummary(items, couponCode);

    // 2. Validate user wallet balance
    const user = userRepository.findById(userId);
    if (!user) return res.status(404).json({ error: 'User profile not found.' });

    if (user.walletBalance < summary.total) {
      return res.status(400).json({ 
        error: 'Insufficient Balance', 
        message: `Your balance ($${user.walletBalance}) is insufficient for this checkout ($${summary.total}).` 
      });
    }

    // 3. Deduct balance and process payment simulation
    const payResult = paymentService.processPayment(userId, summary.total, paymentMethod || 'wallet');
    userRepository.updateWallet(userId, -summary.total, Math.floor(summary.total * 0.05));

    // 4. Place final split order and allocate escrows
    const finalOrder = orderService.createOrder(userId, summary.items, summary.total, shippingAddress, couponCode);

    // 5. Generate shipment tracking
    shippingService.createShipment(finalOrder.id, shippingAddress);

    // 6. Track event
    analyticsService.track(userId, 'checkout_success', { orderId: finalOrder.id, total: summary.total });

    res.status(201).json({ 
      success: true, 
      order: finalOrder, 
      transactionId: payResult.transactionId 
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/orders/:id/cancel', (req: Request, res: Response) => {
  const { reason } = req.body;
  try {
    const order = orderService.cancelOrder(req.params.id, reason || 'Unspecified');
    res.json({ success: true, order });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ============================================================================
// REST ROUTES: REVIEWS & AI
// ============================================================================

router.post('/reviews/submit', async (req: Request, res: Response) => {
  const { productId, userName, rating, comment } = req.body;
  if (!productId || !userName || !rating || !comment) {
    return res.status(400).json({ error: 'Missing mandatory review fields.' });
  }

  try {
    const r = await reviewService.submitReview(productId, userName, parseInt(rating), comment);
    res.status(201).json(r);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/ai/chat', async (req: Request, res: Response) => {
  const { history, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message query required.' });

  try {
    const text = await aiService.chat(history || [], message);
    res.json({ text });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/ai/reviews-summary/:productId', async (req: Request, res: Response) => {
  try {
    const summary = await aiService.summarizeProductReviews(req.params.productId);
    res.json(summary);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/ai/semantic-search', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query text is required.' });

  try {
    const result = await getSemanticSearchFilters(query);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/ai/camera-analyze', async (req: Request, res: Response) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'Image parameter (base64 string) is required.' });

  try {
    const result = await aiService.analyzeCameraImage(image);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================================================
// REST ROUTES: WALLET ACTIONS
// ============================================================================

router.post('/wallet/add', (req: Request, res: Response) => {
  const sessions = userRepository.getAll();
  const activeSession = sessions[0] || { id: 'vicky-customer' };
  const userId = activeSession.id;
  const { amount } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid positive amount is required.' });
  }
  try {
    const newBalance = userService.addFunds(userId, Number(amount));
    res.json({ success: true, balance: newBalance });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ============================================================================
// REST ROUTES: ADMIN MANAGEMENT & AUDITS
// ============================================================================

router.get('/admin/dashboard', requireRole(['Admin']), (req: Request, res: Response) => {
  res.json(adminService.getPlatformDashboard());
});

router.get('/admin/logs', requireRole(['Admin']), (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

export default router;
export { router as apiV1Router };
