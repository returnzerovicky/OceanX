import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Review, Order, AuditLog, UserSession, Coupon } from '../types';
import { parseTruncatedJsonArray } from './utils';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_salt_ocean').digest('hex');
}

export function getDeterministicUnsplashImage(id: string, name: string, category: string, subcategory?: string): string {
  let hash = 0;
  const str = id + name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);

  const cat = (category || 'Electronics').toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  const n = name.toLowerCase();

  const phones = [
    '1511707171634-5f897ff02aa9', '1598327105666-5b89351aff97', '1580910051074-3eb694886505',
    '1565849904461-04a58ad377e0', '1512941937669-90a1b58e7e9c', '1546054454-aa26e2b734c7',
    '1573148195900-7845dcb9b127', '1533228893-a40a8269a96e'
  ];
  const laptops = [
    '1496181130204-755241524eab', '1531297484001-80022131f5a1', '1588872657578-7efd1f1555ed',
    '1603302576837-37561b2e2302', '1484788984921-03950022c9ef', '1541807084-5c52b6b3adef',
    '1516321318423-f06f85e504b3'
  ];
  const audio = [
    '1505740420928-5e560c06d30e', '1546435770-e3e92650044e', '1487215078519-e21cc028cb29',
    '1545454675-3531b543be5d', '1618384887929-16ec33fab9ef'
  ];
  const wear = [
    '1523275335684-37898b6baf30', '1508685096489-7aacd43bd3b1', '1579586337278-3befd40fd17a',
    '1434494878577-86c23bcb06b9'
  ];
  const men = [
    '1488161628813-04466f872be2', '1492562080023-ab3db95bfbce', '1534030347209-467a5b0ad3e6',
    '1507679799987-c73779587ccf', '1490114538077-0a7f8cb498b1'
  ];
  const women = [
    '1509631179647-0177331693ae', '1494790108377-be9c29b29330', '1524504388940-b1c1722653e1',
    '1515886657613-9f3515b0c78f', '1485462537746-965f33f7f6a7'
  ];
  const shoes = [
    '1549298916-b41d501d3772', '1606107557195-0e29a4b5b4aa', '1542291026-7eec264c27ff',
    '1595950653106-6c9ebd614d3a', '1608231387042-66d1773070a5'
  ];
  const beauty = [
    '1596462502278-27bfdc403348', '1522335789203-aabd1fc54bc9', '1612817288484-6f916006741a',
    '1608248597481-496100c80836'
  ];
  const home = [
    '1556911220-e15b29be8c8f', '1584622650111-993a426fbf0a', '1558002038-1055907df827',
    '1507089947368-19c1da9775ae'
  ];
  const books = [
    '1544947950-fa07a98d237f', '1506880018603-83d5b814b5a6', '1512820790803-83ca734da794'
  ];
  const toys = [
    '1534447677768-be436bb09401', '1558060370-d644479cb3f0', '1566577134-75a53e449648'
  ];
  const generic = [
    '1505740420928-5e560c06d30e', '1523275335684-37898b6baf30', '1496181130204-755241524eab'
  ];

  let list = generic;
  if (cat.includes('mobile') || cat.includes('phone') || n.includes('phone') || n.includes('mobile')) list = phones;
  else if (cat.includes('laptop') || n.includes('laptop') || n.includes('macbook')) list = laptops;
  else if (cat.includes('audio') || sub.includes('audio') || cat.includes('speaker') || cat.includes('headphone') || n.includes('speaker') || n.includes('audio') || n.includes('sound') || n.includes('headphone') || n.includes('bud')) list = audio;
  else if (cat.includes('wear') || sub.includes('wear') || cat.includes('watch') || cat.includes('sport') || n.includes('watch') || n.includes('gps')) list = wear;
  else if (cat.includes('men') && cat.includes('fashion')) list = men;
  else if (cat.includes('women') && cat.includes('fashion')) list = women;
  else if (cat.includes('shoe') || n.includes('shoe') || n.includes('boot')) list = shoes;
  else if (cat.includes('beauty') || cat.includes('cosmetic') || n.includes('cream') || n.includes('serum') || n.includes('shampoo')) list = beauty;
  else if (cat.includes('kitchen') || cat.includes('home') || cat.includes('furniture') || n.includes('chair') || n.includes('table') || n.includes('desk') || n.includes('shelf') || n.includes('lamp')) list = home;
  else if (cat.includes('book') || n.includes('book') || n.includes('novel') || n.includes('guide')) list = books;
  else if (cat.includes('toy') || cat.includes('kid') || n.includes('lego') || n.includes('game') || n.includes('doll')) list = toys;

  const photoId = list[index % list.length];
  return `https://images.unsplash.com/photo-${photoId}?w=800&auto=format&fit=crop&q=80`;
}

const DB_FILE = path.join(process.cwd(), 'nexus_db.json');

// Default initial state
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Ocean SoundWave ANC Pro',
    description: 'Experience pure sonic bliss with industry-leading Active Noise Cancellation, custom-tuned high-excursion drivers, and up to 45 hours of immersive playback. Designed with breathable memory-foam earcups and a lightweight carbon-fiber reinforced headband.',
    price: 299.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    category: 'Electronics',
    subcategory: 'Audio',
    stock: 45,
    brand: 'Ocean',
    variants: {
      colors: ['Charcoal Black', 'Platinum Silver', 'Midnight Navy'],
      sizes: ['Standard']
    },
    specifications: {
      'Driver Size': '40mm Dynamic',
      'ANC Depth': '42dB',
      'Battery Life': 'Up to 45 Hours',
      'Bluetooth Version': '5.3',
      'Charging Port': 'USB-C Fast Charge'
    },
    sellerId: 'sell-1',
    reviewsCount: 3
  },
  {
    id: 'prod-2',
    name: 'Ocean Ascent GPS Sport Watch',
    description: 'The ultimate adventure companion. Features a dual-frequency multi-satellite GPS, real-time biometrics suite (heart rate, SpO2, HRV), and an ultra-bright Always-On AMOLED sapphire-glass display housed in a grade-5 aerospace titanium casing.',
    price: 349.99,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    category: 'Electronics',
    subcategory: 'Wearables',
    stock: 28,
    brand: 'Ocean',
    variants: {
      colors: ['Titanium Grey', 'Forest Green', 'Volcanic Amber'],
      sizes: ['41mm', '45mm']
    },
    specifications: {
      'Case Material': 'Grade-5 Titanium',
      'Display': '1.43" AMOLED (466x466)',
      'Water Resistance': '100m (10 ATM)',
      'GPS Type': 'Dual-Band L1+L5 GNSS',
      'Battery Life': '14 Days Smartwatch / 30h GPS'
    },
    sellerId: 'sell-1',
    reviewsCount: 2
  },
  {
    id: 'prod-3',
    name: 'Ocean Tactile Pro Keyboard',
    description: 'Engineered for competitive gamers and typing purists. Houses ultra-responsive hot-swappable tactile linear switches, double-shot PBT keycaps with crisp shine-through, and individual per-key addressable RGB backlighting backed by an aircraft-grade aluminum top plate.',
    price: 159.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
    category: 'Electronics',
    subcategory: 'Computers',
    stock: 15,
    brand: 'Ocean',
    variants: {
      colors: ['Ghost White', 'Crimson Red', 'Classic Slate'],
      sizes: ['Tenkeyless (80%)', 'Full Size (100%)']
    },
    specifications: {
      'Switch Type': 'Hot-swappable Linear Tactile',
      'Keycap Material': 'Double-shot PBT',
      'Polling Rate': '1000Hz',
      'Connectivity': 'Detachable USB-C',
      'Software': 'OceanEngine Custom Mapping'
    },
    sellerId: 'sell-2',
    reviewsCount: 2
  },
  {
    id: 'prod-4',
    name: 'Ocean Prism 3-in-1 Charging Dock',
    description: 'Elevate your workspace charging experience. Simultaneously charge your phone, smartwatch, and wireless earbuds with precision magnetic alignment. Crafted with solid premium walnut base and high-quality anodized aluminum stalks.',
    price: 89.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800&auto=format&fit=crop&q=80',
    category: 'Accessories',
    subcategory: 'Chargers',
    stock: 60,
    brand: 'Ocean',
    variants: {
      colors: ['Walnut/Silver', 'Oak/Space Grey', 'Full Obsidian'],
      sizes: ['Standard']
    },
    specifications: {
      'Wireless Output': '15W Phone / 5W Watch / 5W Buds',
      'Input Power': '30W USB-C PD (Adapter included)',
      'Magnets': 'N52 Neodymium',
      'Dimensions': '14cm x 10cm x 12cm',
      'Material': 'Anodized Aluminum & Natural Walnut'
    },
    sellerId: 'sell-2',
    reviewsCount: 1
  },
  {
    id: 'prod-5',
    name: 'Ocean Oasis Smart Herb Garden',
    description: 'Fresh organic greens, culinary herbs, and mini vegetables grown in your kitchen all year round. Complete with a self-watering root basin, oxygenating water circulation pump, and a high-performance full-spectrum 24W LED smart growing light.',
    price: 129.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
    category: 'Home & Kitchen',
    subcategory: 'Gardening',
    stock: 12,
    brand: 'Ocean',
    variants: {
      colors: ['Sage Green', 'Glossy White', 'Matte Black'],
      sizes: ['6-Pod', '9-Pod Large']
    },
    specifications: {
      'Water Capacity': '3.5 Liters',
      'LED Spectrum': 'Optimal Red/Blue/White (24W)',
      'Pump Cycle': 'Auto 30 min on/30 min off',
      'Pods Count': '6 Growing Pods',
      'Height Range': 'Extendable arm up to 18 inches'
    },
    sellerId: 'sell-3',
    reviewsCount: 1
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userName: 'Verified Purchaser',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Absolutely stunning audio fidelity. The ANC isolates everything around me in a crowded coffee shop. The memory foam is incredibly comfy for long flights.',
    date: '2026-06-28',
    verified: true,
    sentiment: 'positive',
    isFake: false
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userName: 'J. Carter',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'The sound profile is fantastic, very balanced bass. However, the travel case is a bit bulky. Still, highly recommended!',
    date: '2026-07-02',
    verified: true,
    sentiment: 'positive',
    isFake: false
  },
  {
    id: 'rev-3',
    productId: 'prod-1',
    userName: 'Verified Buyer',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Excellent, buy it now! Wonderful quality, best battery life ever, zero noise leaks, lightweight. A total game changer.',
    date: '2026-07-05',
    verified: true,
    sentiment: 'positive',
    isFake: false
  },
  {
    id: 'rev-4',
    productId: 'prod-2',
    userName: 'M. Sterling',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Insanely robust build quality. Took it on a rugged 4-day hike and the titanium bezel handled minor drops and scrapes without a mark. GPS tracks beautifully!',
    date: '2026-07-01',
    verified: true,
    sentiment: 'positive',
    isFake: false
  },
  {
    id: 'rev-5',
    productId: 'prod-2',
    userName: 'S. Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'Outstanding smartwatch with full wellness analytics. Only downside is the proprietary charging connector. Would have preferred universal QI wireless charging.',
    date: '2026-07-04',
    verified: false,
    sentiment: 'neutral',
    isFake: false
  },
  {
    id: 'rev-6',
    productId: 'prod-3',
    userName: 'T. Chen',
    userAvatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'This keyboard feels and sounds incredible right out of the box. Key travel is exceptionally clean, no pinging sounds from the plate, highly responsive.',
    date: '2026-06-25',
    verified: true,
    sentiment: 'positive',
    isFake: false
  },
  {
    id: 'rev-7',
    productId: 'prod-3',
    userName: 'V. Miller',
    userAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    rating: 1,
    comment: 'Best keyboard in the entire world! Totally revolutionized my gaming setup. Fast typing speed, extremely beautiful colors, love the wood look.',
    date: '2026-07-10',
    verified: false,
    sentiment: 'positive',
    isFake: true
  },
  {
    id: 'rev-8',
    productId: 'prod-4',
    userName: 'E. Watson',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'Really smart-looking magnetic dock. Keeps my nightstand totally cord-free. The solid wood block feels dense and premium. Charging speed is standard.',
    date: '2026-07-08',
    verified: true,
    sentiment: 'positive',
    isFake: false
  },
  {
    id: 'rev-9',
    productId: 'prod-5',
    userName: 'K. Sen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'My sweet basil exploded with growth within just three weeks! The system alerts you exactly when the water level is low. Perfect for hands-off indoor gardening.',
    date: '2026-07-09',
    verified: true,
    sentiment: 'positive',
    isFake: false
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'OCEAN15',
    discountType: 'percentage',
    value: 15,
    minSpend: 150,
    description: 'Get 15% off on orders above $150!'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    value: 10,
    minSpend: 50,
    description: 'Save $10 off shipping/delivery for orders over $50!'
  },
  {
    code: 'WELCOME',
    discountType: 'fixed',
    value: 20,
    minSpend: 100,
    description: 'Get $20 flat off as a welcome reward on premium technology purchases!'
  }
];

const INITIAL_USER_SESSIONS: UserSession[] = [
  {
    id: 'usr-1',
    name: 'Customer',
    email: 'vicky.b1902@gmail.com',
    role: 'Customer',
    walletBalance: 10000.00,
    rewardCoins: 50,
    password: hashPassword('ocean123'),
    isOnboarded: true,
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    country: 'United States',
    city: 'Seattle',
    address: '123 Pine St',
    interests: ['Electronics', 'Home', 'Luxury']
  },
  {
    id: 'usr-2',
    name: 'Merchant Partner',
    email: 'partner@ocean.com',
    role: 'Seller',
    walletBalance: 2500.00,
    rewardCoins: 100,
    password: hashPassword('ocean123'),
    isOnboarded: true,
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    country: 'United States',
    city: 'San Francisco',
    address: '456 Market St',
    interests: ['Electronics', 'Automotive']
  },
  {
    id: 'usr-3',
    name: 'Warehouse Operator',
    email: 'warehouse@ocean.com',
    role: 'Warehouse',
    walletBalance: 50.00,
    rewardCoins: 10,
    password: hashPassword('ocean123'),
    isOnboarded: true,
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    country: 'United States',
    city: 'Chicago',
    address: '789 Logistics Dr'
  },
  {
    id: 'usr-4',
    name: 'Delivery Agent',
    email: 'delivery@ocean.com',
    role: 'Delivery',
    walletBalance: 120.00,
    rewardCoins: 25,
    password: hashPassword('ocean123'),
    isOnboarded: true,
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    country: 'United States',
    city: 'New York',
    address: '101 Delivery Blvd'
  },
  {
    id: 'usr-5',
    name: 'Global Admin',
    email: 'admin@ocean.com',
    role: 'Admin',
    walletBalance: 50000.00,
    rewardCoins: 500,
    password: hashPassword('ocean123'),
    isOnboarded: true,
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80',
    country: 'United States',
    city: 'Seattle',
    address: 'Ocean Headquarters'
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'Platform initialized',
    user: 'System',
    role: 'Admin',
    timestamp: '2026-07-12T09:00:00Z',
    status: 'Success',
    ip: '127.0.0.1'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-984321',
    userId: 'usr-1',
    items: [
      {
        productId: 'prod-1',
        name: 'Ocean SoundWave ANC Pro',
        price: 299.99,
        quantity: 1,
        selectedColor: 'Platinum Silver',
        selectedSize: 'Standard',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
      }
    ],
    total: 299.99,
    status: 'Delivered',
    timeline: [
      { status: 'Pending', timestamp: '2026-07-10T14:30:00Z', description: 'Order created, awaiting validation.' },
      { status: 'Confirmed', timestamp: '2026-07-10T14:32:15Z', description: 'Payment captured securely.' },
      { status: 'Processing', timestamp: '2026-07-10T16:00:00Z', description: 'Fulfillment initiated in central logistics facility.' },
      { status: 'Shipped', timestamp: '2026-07-11T09:12:00Z', description: 'Package handed over to carrier service.' },
      { status: 'Delivered', timestamp: '2026-07-12T11:00:00Z', description: 'Package signed and delivered to porch.' }
    ],
    shippingAddress: '123 Pine St, Seattle, WA 98101',
    createdAt: '2026-07-10T14:30:00Z'
  }
];

interface EnterpriseDB {
  products: Product[];
  reviews: Review[];
  orders: Order[];
  auditLogs: AuditLog[];
  userSessions: UserSession[];
  coupons: Coupon[];
}

class DatabaseManager {
  private state: EnterpriseDB;

  constructor() {
    this.state = {
      products: INITIAL_PRODUCTS,
      reviews: INITIAL_REVIEWS,
      orders: INITIAL_ORDERS,
      auditLogs: INITIAL_AUDIT_LOGS,
      userSessions: INITIAL_USER_SESSIONS,
      coupons: INITIAL_COUPONS
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(data);
        
        // Migrate user sessions to ensure all premium enterprise roles are present
        if (!this.state.userSessions) {
          this.state.userSessions = [];
        }
        let updated = false;
        for (const initialUser of INITIAL_USER_SESSIONS) {
          const existing = this.state.userSessions.find(u => u.id === initialUser.id || u.email === initialUser.email);
          if (!existing) {
            this.state.userSessions.push(initialUser);
            updated = true;
          } else {
            if (!existing.password) { existing.password = initialUser.password; updated = true; }
            if (existing.isOnboarded === undefined) { existing.isOnboarded = initialUser.isOnboarded; updated = true; }
            if (!existing.phone && initialUser.phone) { existing.phone = initialUser.phone; updated = true; }
            if (!existing.avatar && initialUser.avatar) { existing.avatar = initialUser.avatar; updated = true; }
            if (!existing.country && initialUser.country) { existing.country = initialUser.country; updated = true; }
            if (!existing.city && initialUser.city) { existing.city = initialUser.city; updated = true; }
            if (!existing.address && initialUser.address) { existing.address = initialUser.address; updated = true; }
            if (!existing.interests && initialUser.interests) { existing.interests = initialUser.interests; updated = true; }
          }
        }
        if (updated) {
          this.save();
        }
      } else {
        this.save();
      }

      // Dynamically load split products and extra reviews if the directory exists
      const productsDir = path.join(process.cwd(), 'products');
      if (fs.existsSync(productsDir)) {
        const productIds = new Set(this.state.products.map(p => p.id));
        const nonProductFiles = new Set([
          'sellers.json',
          'extra_reviews.json',
          'reviews.json',
          'brands.json',
          'categories.json',
          'collections.json',
          'recommendations.json',
          'search-index.json',
          'synonyms.json',
          'warehouse.json',
          'inventory.json',
          'category_landing_pages.json'
        ]);

        try {
          const allFiles = fs.readdirSync(productsDir);
          const productFiles = allFiles.filter(file => file.endsWith('.json') && !nonProductFiles.has(file));

          for (const file of productFiles) {
            const filePath = path.join(productsDir, file);
            try {
              const fileData = fs.readFileSync(filePath, 'utf-8');
              const catProducts = parseTruncatedJsonArray<Product>(fileData);
              if (Array.isArray(catProducts)) {
                for (const p of catProducts) {
                  if (p && p.id && !productIds.has(p.id)) {
                    this.state.products.push(p);
                    productIds.add(p.id);
                  }
                }
              }
            } catch (err) {
              console.error(`Error loading category file ${file}:`, err);
            }
          }
        } catch (dirErr) {
          console.error('Error scanning products directory:', dirErr);
        }

        // Also load extra reviews
        const reviewsPath = path.join(productsDir, 'extra_reviews.json');
        if (fs.existsSync(reviewsPath)) {
          try {
            const reviewsData = fs.readFileSync(reviewsPath, 'utf-8');
            const extraReviews = parseTruncatedJsonArray<Review>(reviewsData);
            const reviewIds = new Set(this.state.reviews.map(r => r.id));
            for (const r of extraReviews) {
              if (!reviewIds.has(r.id)) {
                this.state.reviews.push(r);
                reviewIds.add(r.id);
              }
            }
          } catch (err) {
            console.error('Error loading extra reviews:', err);
          }
        }
      }
    } catch (e) {
      console.error('Error loading database file, using in-memory state:', e);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  public getProducts(): Product[] {
    return this.state.products.map(p => ({
      ...p,
      image: getDeterministicUnsplashImage(p.id, p.name, p.category, p.subcategory)
    }));
  }

  public addProduct(p: Product) {
    this.state.products.push(p);
    this.save();
  }

  public updateProductStock(id: string, newStock: number) {
    const prod = this.state.products.find(x => x.id === id);
    if (prod) {
      prod.stock = Math.max(0, newStock);
      this.save();
    }
  }

  public getReviews(): Review[] {
    return this.state.reviews;
  }

  public addReview(r: Review) {
    this.state.reviews.push(r);
    // Update reviewsCount on the product
    const prod = this.state.products.find(p => p.id === r.productId);
    if (prod) {
      prod.reviewsCount += 1;
      // Recalculate average rating
      const reviews = this.state.reviews.filter(rev => rev.productId === r.productId);
      const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      prod.rating = parseFloat((totalRating / reviews.length).toFixed(1));
    }
    this.save();
  }

  public getOrders(): Order[] {
    return this.state.orders;
  }

  public addOrder(o: Order) {
    this.state.orders.push(o);
    // Deduct stock for each item
    for (const item of o.items) {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
    this.save();
  }

  public updateOrderStatus(orderId: string, status: Order['status'], description: string) {
    const o = this.state.orders.find(x => x.id === orderId);
    if (o) {
      o.status = status;
      o.timeline.push({
        status,
        timestamp: new Date().toISOString(),
        description
      });
      this.save();
    }
  }

  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs.unshift(newLog); // Put new logs first
    this.save();
  }

  public getUserSessions(): UserSession[] {
    return this.state.userSessions;
  }

  public updateUserWallet(userId: string, deltaBalance: number, deltaCoins: number) {
    const user = this.state.userSessions.find(x => x.id === userId);
    if (user) {
      user.walletBalance = parseFloat((user.walletBalance + deltaBalance).toFixed(2));
      user.rewardCoins = Math.max(0, user.rewardCoins + deltaCoins);
      this.save();
    }
  }

  public registerUser(user: Omit<UserSession, 'id' | 'walletBalance' | 'rewardCoins'> & { password?: string }): UserSession {
    const newId = `usr-${Date.now()}`;
    const newUser: UserSession = {
      ...user,
      id: newId,
      walletBalance: 100.00, // standard welcome credit!
      rewardCoins: 10,       // standard welcome coins
      isOnboarded: false,
      failedAttempts: 0,
      loginHistory: []
    };
    this.state.userSessions.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserProfile(userId: string, data: Partial<UserSession>) {
    const user = this.state.userSessions.find(x => x.id === userId);
    if (user) {
      Object.assign(user, data);
      this.save();
      return user;
    }
    return null;
  }

  public getCoupons(): Coupon[] {
    return this.state.coupons;
  }
}

export const db = new DatabaseManager();
