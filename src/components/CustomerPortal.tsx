import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  ShieldCheck, 
  AlertTriangle,
  Gift,
  HelpCircle,
  Truck,
  Heart,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  CreditCard,
  Plus,
  Minus,
  Award,
  ChevronDown,
  Share2,
  Play,
  Sparkles,
  Filter,
  MessageSquare,
  Search,
  Cpu,
  Eye,
  GitCompare,
  Lock,
  ArrowRight,
  User,
  Compass,
  Shield,
  Key,
  Laptop,
  Bell,
  Mail,
  Info,
  RefreshCw,
  FileText,
  Download,
  Trash2,
  Smartphone,
  Landmark,
  Check,
  History,
  Settings,
  Store,
  Flame
} from 'lucide-react';
import { Product, Review, Order, Coupon, UserSession } from '../types';
import AccountDashboard from './AccountDashboard';
import OrderStatusTracker from './OrderStatusTracker';
import { formatCurrency, formatWeight, formatDimension, getLocalizationDetails } from '../lib/preferences';

export type RouteType = 'home' | 'category' | 'brand' | 'collection' | 'search' | 'new-releases' | 'best-sellers' | 'gifts' | 'product' |
  'trending' | 'deals' | 'luxury' | 'editors-choice' | 'gaming' | 'fashion' | 'electronics' | 'books' | 'toys' | 'sports' | 'home-section' | 'beauty' | 'gift-guide' | 'seasonal' | 'brands' |
  'orders' | 'wallet' | 'wishlist' | 'notifications' | 'seller-portal' | 'admin' | 'support' | 'account' |
  'about' | 'careers' | 'investors' | 'press' | 'privacy' | 'terms' | 'shipping' | 'returns' | 'refund' | 'gift-cards' | 'membership' | 'faq' | 'contact' | 'developer-api' | 'partners' | 'brand-registry' | 'supplier-portal' | 'sustainability' | 'accessibility';

export interface AppRoute {
  type: RouteType;
  value?: string;
}

export const specialRoutes = [
  'orders', 'wallet', 'wishlist', 'notifications', 'seller-portal', 'admin', 'support', 'account',
  'about', 'careers', 'investors', 'press', 'privacy', 'terms', 'shipping', 'returns',
  'refund', 'gift-cards', 'membership', 'faq', 'contact', 'developer-api', 'partners',
  'brand-registry', 'supplier-portal', 'sustainability', 'accessibility'
];

export function parsePathToRoute(path: string, search: string): AppRoute {
  const cleanPath = path.replace(/\/$/, '');
  if (cleanPath === '/new-releases') return { type: 'new-releases' };
  if (cleanPath === '/best-sellers') return { type: 'best-sellers' };
  if (cleanPath === '/gifts') return { type: 'gifts' };
  if (cleanPath === '/trending') return { type: 'trending' };
  if (cleanPath === '/deals') return { type: 'deals' };
  if (cleanPath === '/luxury') return { type: 'luxury' };
  if (cleanPath === '/editors-choice') return { type: 'editors-choice' };
  if (cleanPath === '/gaming') return { type: 'gaming' };
  if (cleanPath === '/fashion') return { type: 'fashion' };
  if (cleanPath === '/electronics') return { type: 'electronics' };
  if (cleanPath === '/books') return { type: 'books' };
  if (cleanPath === '/toys') return { type: 'toys' };
  if (cleanPath === '/sports') return { type: 'sports' };
  if (cleanPath === '/home') return { type: 'home-section' };
  if (cleanPath === '/beauty') return { type: 'beauty' };
  if (cleanPath === '/gift-guide') return { type: 'gift-guide' };
  if (cleanPath === '/seasonal') return { type: 'seasonal' };
  if (cleanPath === '/brands') return { type: 'brands' };

  if (cleanPath === '/orders') return { type: 'orders' };
  if (cleanPath === '/wallet') return { type: 'wallet' };
  if (cleanPath === '/wishlist') return { type: 'wishlist' };
  if (cleanPath === '/account') return { type: 'account' };
  if (cleanPath === '/notifications') return { type: 'notifications' };
  if (cleanPath === '/seller') return { type: 'seller-portal' };
  if (cleanPath === '/admin') return { type: 'admin' };
  if (cleanPath === '/support') return { type: 'support' };
  if (cleanPath === '/about') return { type: 'about' };
  if (cleanPath === '/careers') return { type: 'careers' };
  if (cleanPath === '/investors') return { type: 'investors' };
  if (cleanPath === '/press') return { type: 'press' };
  if (cleanPath === '/privacy') return { type: 'privacy' };
  if (cleanPath === '/terms') return { type: 'terms' };
  if (cleanPath === '/shipping') return { type: 'shipping' };
  if (cleanPath === '/returns') return { type: 'returns' };
  if (cleanPath === '/refund') return { type: 'refund' };
  if (cleanPath === '/gift-cards') return { type: 'gift-cards' };
  if (cleanPath === '/membership') return { type: 'membership' };
  if (cleanPath === '/faq') return { type: 'faq' };
  if (cleanPath === '/contact') return { type: 'contact' };
  if (cleanPath === '/developer-api') return { type: 'developer-api' };
  if (cleanPath === '/partners') return { type: 'partners' };
  if (cleanPath === '/brand-registry') return { type: 'brand-registry' };
  if (cleanPath === '/supplier-portal') return { type: 'supplier-portal' };
  if (cleanPath === '/sustainability') return { type: 'sustainability' };
  if (cleanPath === '/accessibility') return { type: 'accessibility' };

  if (cleanPath.startsWith('/category/')) return { type: 'category', value: decodeURIComponent(cleanPath.substring('/category/'.length)) };
  if (cleanPath.startsWith('/brand/')) return { type: 'brand', value: decodeURIComponent(cleanPath.substring('/brand/'.length)) };
  if (cleanPath.startsWith('/collection/')) return { type: 'collection', value: decodeURIComponent(cleanPath.substring('/collection/'.length)) };
  if (cleanPath.startsWith('/collections/')) return { type: 'collection', value: decodeURIComponent(cleanPath.substring('/collections/'.length)) };
  if (cleanPath.startsWith('/product/')) return { type: 'product', value: decodeURIComponent(cleanPath.substring('/product/'.length)) };
  
  if (cleanPath === '/products') {
    const params = new URLSearchParams(search);
    const cat = params.get('category');
    if (cat) {
      const catLower = cat.toLowerCase();
      let displayCat = cat;
      const categoriesList = ['Mobiles', 'Laptops', 'Fashion Men', 'Fashion Women', 'Kids', 'Shoes', 'Beauty', 'Kitchen', 'Furniture', 'Books', 'Toys', 'Sports', 'Grocery', 'Smart Home', 'Automotive'];
      const matched = categoriesList.find(c => c.toLowerCase() === catLower);
      if (matched) displayCat = matched;
      return { type: 'category', value: displayCat };
    }
    const brnd = params.get('brand');
    if (brnd) {
      return { type: 'brand', value: brnd };
    }
    const coll = params.get('collection');
    if (coll) {
      return { type: 'collection', value: coll };
    }
    const qVal = params.get('q');
    if (qVal) {
      return { type: 'search', value: qVal };
    }
    return { type: 'category', value: 'All' };
  }

  if (cleanPath === '/search') {
    const params = new URLSearchParams(search);
    return { type: 'search', value: params.get('q') || '' };
  }
  return { type: 'home' };
}

export function getRouteTitle(route: AppRoute): string {
  if (route.type === 'search') return `Search Results: "${route.value || ''}"`;
  if (route.value) return route.value;
  
  const titles: Record<string, string> = {
    'new-releases': 'New Releases',
    'best-sellers': 'Best Sellers',
    'trending': 'Trending Now',
    'deals': 'Deals of the Day',
    'luxury': 'Premium Luxury Collection',
    'editors-choice': "Editor's Choice",
    'gaming': 'Gaming Zone',
    'fashion': 'Fashion Collections',
    'electronics': 'Electronics Marketplace',
    'books': 'Curated Books Catalog',
    'toys': 'Kids & Family Toys',
    'sports': 'Sporting Goods & Athletics',
    'home-section': 'Premium Smart Home & Kitchen',
    'beauty': 'Luxury Beauty Products',
    'gift-guide': 'Ocean Gift Guide',
    'gifts': 'Ocean Gift Ideas',
    'seasonal': 'Seasonal Campaigns',
    'brands': 'Top Global Brands'
  };
  return titles[route.type] || 'Curated Listing';
}

export interface PLPHero {
  image: string;
  title: string;
  subtitle: string;
  tagline: string;
}

export function getPLPHeroDetails(route: AppRoute): PLPHero {
  const defaultHero = {
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=1600&auto=format&fit=crop&q=80",
    title: "Ocean Curated Marketplace",
    subtitle: "Discover products meticulously engineered for utility, durability, and modern aesthetics.",
    tagline: "GLOBAL DISCOVERY"
  };

  const catalog: Record<string, PLPHero> = {
    'new-releases': {
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&auto=format&fit=crop&q=80",
      title: "The Next Generation.",
      subtitle: "Be the first to experience our latest arrivals, smart releases, and designer tech drop highlights.",
      tagline: "NEW ARRIVALS"
    },
    'best-sellers': {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
      title: "Global Best Sellers.",
      subtitle: "The most trusted, highly-rated, and widely-adopted products across the entire global ecosystem.",
      tagline: "TOP SELLING"
    },
    'trending': {
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80",
      title: "Trending and Viral.",
      subtitle: "The designs, tech, and styles currently capturing global interest and driving social conversation.",
      tagline: "TRENDING NOW"
    },
    'deals': {
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop&q=80",
      title: "Exclusive Deals & Offers.",
      subtitle: "Limited-time price reductions, campaign exclusives, and member reward values on top-tier items.",
      tagline: "DEALS OF THE DAY"
    },
    'luxury': {
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop&q=80",
      title: "The Premium Luxury Suite.",
      subtitle: "Indulge in absolute luxury, uncompromising materials, and master craftsman engineering.",
      tagline: "PREMIUM LUXURY"
    },
    'editors-choice': {
      image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1600&auto=format&fit=crop&q=80",
      title: "Editor's Choice Curation.",
      subtitle: "Our staff's carefully evaluated collection of the highest quality products on the market today.",
      tagline: "RECOMMENDED BY EDITORS"
    },
    'gaming': {
      image: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=1600&auto=format&fit=crop&q=80",
      title: "The Ultimate Gaming Zone.",
      subtitle: "Experience high-fidelity graphics, ultra-fast refresh rates, and competitive pro ergonomics.",
      tagline: "GAMING GEAR"
    },
    'fashion': {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80",
      title: "Timeless Tailoring.",
      subtitle: "Crafted fashion, breathable materials, and minimal silhouettes for every occasion.",
      tagline: "PREMIUM WEAR"
    },
    'electronics': {
      image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=1600&auto=format&fit=crop&q=80",
      title: "High-Performance Electronics.",
      subtitle: "Next-gen computing, acoustic audio design, and integrated connected systems.",
      tagline: "ADVANCED TECH"
    },
    'books': {
      image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=1600&auto=format&fit=crop&q=80",
      title: "Curated Books & Literature.",
      subtitle: "Explore timeless stories, non-fiction guides, technical records, and high-quality design volumes.",
      tagline: "KNOWLEDGE"
    },
    'toys': {
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80",
      title: "Creative Toys & Games.",
      subtitle: "Stimulate problem-solving and critical thinking with educational, fun, and architectural play builds.",
      tagline: "PLAYTIME"
    },
    'sports': {
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&auto=format&fit=crop&q=80",
      title: "Sports & Athletics.",
      subtitle: "Professional-grade sporting gears, high-end fitness tracking, and robust outdoor adventure equipment.",
      tagline: "ATHLETICS"
    },
    'home-section': {
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=1600&auto=format&fit=crop&q=80",
      title: "Smart Home & Architecture.",
      subtitle: "Integrated oxygen circulars, automated growth botanicals, and high-efficiency modern workspaces.",
      tagline: "INTERIOR DESIGNS"
    },
    'beauty': {
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&auto=format&fit=crop&q=80",
      title: "Pure Botanical Beauty.",
      subtitle: "Clean skincare, essential nutrient blends, and luxury organic beauty rituals designed for wellness.",
      tagline: "WELLNESS BEAUTY"
    },
    'gift-guide': {
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&auto=format&fit=crop&q=80",
      title: "The Ultimate Gift Guide.",
      subtitle: "Carefully selected gift configurations designed to celebrate achievements, milestones, and relationships.",
      tagline: "GIFT INSPIRATIONS"
    },
    'gifts': {
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&auto=format&fit=crop&q=80",
      title: "The Ultimate Gift Guide.",
      subtitle: "Carefully selected gift configurations designed to celebrate achievements, milestones, and relationships.",
      tagline: "GIFT INSPIRATIONS"
    },
    'seasonal': {
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
      title: "Seasonal Collection Drops.",
      subtitle: "Celebrate dynamic transition seasons with limited edition gear, theme palettes, and seasonal campaigns.",
      tagline: "SEASONAL EXCLUSIVES"
    },
    'brands': {
      image: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=1600&auto=format&fit=crop&q=80",
      title: "The World's Leading Brands.",
      subtitle: "Browse premium selections from certified direct merchants, design archives, and local workshops.",
      tagline: "PREMIUM MARQUES"
    }
  };

  if (route.type === 'category' && route.value) {
    const catLower = route.value.toLowerCase();
    if (catLower.includes('electronic')) return catalog['electronics'];
    if (catLower.includes('fashion') || catLower.includes('shoes') || catLower.includes('kid')) return catalog['fashion'];
    if (catLower.includes('book')) return catalog['books'];
    if (catLower.includes('toy')) return catalog['toys'];
    if (catLower.includes('sport')) return catalog['sports'];
    if (catLower.includes('home') || catLower.includes('kitchen') || catLower.includes('furniture')) return catalog['home-section'];
    if (catLower.includes('beauty')) return catalog['beauty'];
  }

  if (route.type === 'brand' && route.value) {
    return {
      image: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=1600&auto=format&fit=crop&q=80",
      title: `Official Brand Store: ${route.value}`,
      subtitle: `Direct verified catalog of products engineered and shipped directly from ${route.value}.`,
      tagline: "VERIFIED BRAND MERCHANT"
    };
  }

  return catalog[route.type] || defaultHero;
}

interface CustomerPortalProps {
  onAddProductToCart: (product: Product) => void;
  cart: { product: Product; quantity: number; selectedColor: string; selectedSize: string }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; quantity: number; selectedColor: string; selectedSize: string }[]>>;
  user: UserSession;
  onRefreshUser: () => void;
  activeProductId: string | null;
  setActiveProductId: (id: string | null) => void;
  searchGlobalQuery: string;
  setSearchGlobalQuery: (q: string) => void;
  searchCategory: string;
  setSelectedCategoryState: (cat: string) => void;
  triggerSearchCount: number;
  onRequireLogin?: () => void;
  onLogout?: () => void;
  deliveryCountry?: string;
  currentLanguageCode?: string;
}

// Module-level helper for lazy loading sections using standard IntersectionObserver
function LazySection({ children, height = '180px' }: { children: React.ReactNode, height?: string }) {
  const [isIntersected, setIsIntersected] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersected(true);
        observer.disconnect();
      }
    }, {
      rootMargin: '120px', // Preload before user scrolls it onto screen
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: isIntersected ? undefined : height }}>
      {isIntersected ? children : (
        <div className="w-full flex items-center justify-center py-12">
          <div className="h-5 w-5 border-2 border-gray-250 border-t-black animate-spin rounded-full" />
        </div>
      )}
    </div>
  );
}

// Modular lazy-loaded, independent API fetching row
function DiscoverySection({
  title,
  subtitle,
  apiUrl,
  viewAllPath,
  renderLayout,
  renderProductCard,
  height = '240px'
}: {
  title: string;
  subtitle: string;
  apiUrl: string;
  viewAllPath: string;
  renderLayout: (data: any[], renderProductCard: any) => React.ReactNode;
  renderProductCard: any;
  height?: string;
}) {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(result => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 text-left py-6 border-t border-gray-100/60 mt-8">
        <div className="space-y-1 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/5"></div>
          <div className="h-3 bg-gray-100 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3 animate-pulse">
              <div className="bg-gray-150 rounded-lg h-32 w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) return null;

  return (
    <div className="flex flex-col gap-5 text-left border-t border-gray-100/60 pt-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-bold tracking-tight text-black uppercase">{title}</h3>
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
        <button 
          onClick={() => {
            window.history.pushState({}, '', viewAllPath);
            window.dispatchEvent(new Event('popstate'));
          }} 
          className="text-xs font-bold text-black hover:underline tracking-wider uppercase cursor-pointer"
        >
          View All →
        </button>
      </div>
      {renderLayout(data, renderProductCard)}
    </div>
  );
}

export default function CustomerPortal({
  onAddProductToCart,
  cart,
  setCart,
  user,
  onRefreshUser,
  activeProductId,
  setActiveProductId,
  searchGlobalQuery,
  setSearchGlobalQuery,
  searchCategory,
  setSelectedCategoryState,
  triggerSearchCount,
  onRequireLogin,
  onLogout = () => {},
  deliveryCountry = 'India',
  currentLanguageCode = 'EN'
}: CustomerPortalProps) {
  // Products and display states
  const [products, setProducts] = useState<Product[]>([]);
  
  // Dynamic Localization Formatters adapt to active user settings!
  const formatUserCurrency = (val: number | string | undefined) => {
    if (val === undefined) return '';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    const resolvedCurrency = user?.currency || getLocalizationDetails(deliveryCountry).currency || 'USD';
    return formatCurrency(num, resolvedCurrency);
  };

  const formatUserWeight = (weightGrams: number) => {
    const isMetric = !['United States', 'US', 'Myanmar', 'Liberia'].includes(user?.country || deliveryCountry || 'United States');
    return formatWeight(weightGrams, isMetric ? 'Metric' : 'Imperial');
  };

  const formatUserDimension = (cm: number) => {
    const isMetric = !['United States', 'US', 'Myanmar', 'Liberia'].includes(user?.country || deliveryCountry || 'United States');
    return formatDimension(cm, isMetric ? 'Metric' : 'Imperial');
  };

  const formatSpecValue = (key: string, value: string) => {
    const k = key.toLowerCase();
    const v = value.trim();
    
    if (k.includes('weight')) {
      const match = v.match(/^([\d.]+)\s*(g|grams|kg|kilograms)?$/i);
      if (match) {
        const num = parseFloat(match[1]);
        const unit = (match[2] || '').toLowerCase();
        let grams = num;
        if (unit === 'kg' || unit === 'kilograms') {
          grams = num * 1000;
        }
        return formatUserWeight(grams);
      }
    }
    
    if (k.includes('dimension') || k.includes('size') || k.includes('height') || k.includes('width') || k.includes('depth')) {
      const cmMatches = v.match(/(\d+(?:\.\d+)?)\s*(?:cm|millimeter|mm|inch|in)?/gi);
      if (cmMatches && (v.includes('cm') || v.includes('mm') || v.includes('inch') || v.includes('in') || v.includes('x'))) {
        const matches = [...v.matchAll(/(\d+(?:\.\d+)?)\s*(cm|mm|inch|in)?/gi)];
        if (matches.length > 0) {
          let replaced = v;
          for (const m of matches) {
            const num = parseFloat(m[1]);
            const unit = m[2]?.toLowerCase() || 'cm';
            let cmValue = num;
            if (unit === 'mm') cmValue = num / 10;
            else if (unit === 'inch' || unit === 'in') cmValue = num * 2.54;
            
            replaced = replaced.replace(m[0], formatUserDimension(cmValue));
          }
          return replaced;
        }
      }
    }
    
    return value;
  };
  const fetchCounterRef = useRef(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Carousel states
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Personalized Homepage states
  const [localRecentSearches, setLocalRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ocean_recent_searches');
      return saved ? JSON.parse(saved) : ["wireless noise", "walnut desk", "acoustics", "minimal style", "mechanical", "leather tray", "usb hub", "led lighting", "wool rug", "espresso cup"];
    } catch {
      return ["wireless noise", "walnut desk", "acoustics", "minimal style", "mechanical", "leather tray", "usb hub", "led lighting", "wool rug", "espresso cup"];
    }
  });
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [dismissedNotifications, setDismissedNotifications] = useState<Record<string, boolean>>({});
  const [fullCatalog, setFullCatalog] = useState<Product[]>([]);

  // Cart & checkout states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Detail Modal & AI states
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('Default');
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [aiSummary, setAiSummary] = useState<{ summary: string; pros: string[]; cons: string[]; grade: string } | null>(null);
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);

  // Review Form states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewAlert, setReviewAlert] = useState<{ isFake: boolean; reason: string } | null>(null);

  // Orders states
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Tab navigation: 'shop' or 'orders'
  const [activeTab, setActiveTab] = useState<'shop' | 'orders'>('shop');

  // Unified Account Dashboard states
  const [activeAccountTab, setActiveAccountTab] = useState('profile');
  const [accountFirstName, setAccountFirstName] = useState('');
  const [accountLastName, setAccountLastName] = useState('');
  const [accountBio, setAccountBio] = useState('');
  const [accountBirthday, setAccountBirthday] = useState('');
  const [accountGender, setAccountGender] = useState('unspecified');
  const [accountLanguage, setAccountLanguage] = useState('English');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [accountCountry, setAccountCountry] = useState('United States');
  const [accountAddress, setAccountAddress] = useState('');
  const [accountTimezone, setAccountTimezone] = useState('UTC');
  const [accountPreferences, setAccountPreferences] = useState({ email: true, sms: false, push: true, promo: false });
  const [accountProfileLoading, setAccountProfileLoading] = useState(false);
  const [accountProfileSuccess, setAccountProfileSuccess] = useState(false);

  // Security and 2FA states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFactorType, setTwoFactorType] = useState('authenticator'); // 'authenticator' | 'sms' | 'email'
  const [show2FAConfig, setShow2FAConfig] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('JBSWY3DPEHPK3PXP'); // Sample authenticator secret
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);

  // Saved Addresses state
  const [savedAddresses, setSavedAddresses] = useState<string[]>([
    '123 Pine Street, Suite 400, Seattle, WA 98101',
    '456 Oak Avenue, Apt 2B, San Francisco, CA 94102'
  ]);
  const [newAddressInput, setNewAddressInput] = useState('');

  // Saved Cards state
  const [savedCards, setSavedCards] = useState<any[]>([
    { id: '1', brand: 'Visa', last4: '4242', expMonth: '12', expYear: '2028', holder: 'Vicky B' },
    { id: '2', brand: 'Mastercard', last4: '8888', expMonth: '08', expYear: '2029', holder: 'Vicky B' }
  ]);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExp, setNewCardExp] = useState('');

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState({
    prime: true,
    newsletter: false,
    dailyDeals: true,
    securityAlerts: true
  });

  // Flash sale countdown timer state (ticks every second)
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 22, seconds: 45 });

  // Dynamic HTML5 routing & discovery states
  const [route, setRoute] = useState<AppRoute>(() => {
    return parsePathToRoute(window.location.pathname, window.location.search);
  });

  const [discoveryData, setDiscoveryData] = useState<any>(null);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [exploreMoreProducts, setExploreMoreProducts] = useState<Product[]>([]);
  const [isLoadingExploreMore, setIsLoadingExploreMore] = useState(false);
  const [followedSellers, setFollowedSellers] = useState<Record<string, boolean>>({});

  const loadExploreMore = () => {
    setIsLoadingExploreMore(true);
    const randomOffset = Math.floor(Math.random() * 80);
    fetch(`/api/v1/products?limit=12&offset=${randomOffset}`)
      .then(res => res.json())
      .then(data => {
        setExploreMoreProducts(data.items || []);
        setIsLoadingExploreMore(false);
      })
      .catch(err => {
        console.error("Error loading explore more:", err);
        setIsLoadingExploreMore(false);
      });
  };

  // PLP Filter state
  const [plpProducts, setPlpProducts] = useState<Product[]>([]);
  const [plpTotal, setPlpTotal] = useState(0);
  const [plpOffset, setPlpOffset] = useState(0);
  const [plpLimit, setPlpLimit] = useState(24);
  const [plpLoading, setPlpLoading] = useState(false);
  
  // Plp sidebar filters state
  const [filterBrand, setFilterBrand] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');



  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    const [pathname, searchStr] = path.split('?');
    const parsed = parsePathToRoute(pathname, searchStr ? `?${searchStr}` : '');
    setRoute(parsed);
    setDetailProduct(null);
    if (parsed.type === 'account') {
      const params = new URLSearchParams(searchStr ? `?${searchStr}` : '');
      const tab = params.get('tab');
      if (tab) {
        setActiveAccountTab(tab);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Special pages and dynamic form states
  const [fundAmount, setFundAmount] = useState('');
  const [walletStatus, setWalletStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [walletErrorMsg, setWalletErrorMsg] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitted, setReturnSubmitted] = useState(false);
  const [sandboxApiKey, setSandboxApiKey] = useState('ocean_live_9f83a2dc71b8e4f20e98');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState<Product[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  // History tracking for "Recently Viewed"
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    if (user && user.id !== 'guest') {
      const nameParts = (user.name || '').trim().split(/\s+/);
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';
      
      setAccountFirstName(first);
      setAccountLastName(last);
      setAccountBio(user.bio || '');
      setAccountBirthday(user.birthday || '');
      setAccountGender(user.gender || 'unspecified');
      setAccountLanguage(user.preferredLanguage || 'English');
      setAccountCurrency(user.currency || 'USD');
      setAccountCountry(user.country || 'United States');
      setAccountAddress(user.address || '');
      setAccountTimezone(user.timezone || 'UTC');
      if (user.communicationPreferences) {
        setAccountPreferences(user.communicationPreferences);
      }
      if (user.loginHistory) {
        setSecurityLogs(user.loginHistory);
      }
    }
  }, [user]);

  // Product Page Advanced states
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(180);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const [compared, setCompared] = useState<Record<string, boolean>>({});
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [bundleChecked, setBundleChecked] = useState<boolean[]>([true, true, true]);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [customFaqs, setCustomFaqs] = useState<Record<string, { q: string; a: string }[]>>({});
  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [reviewStarFilter, setReviewStarFilter] = useState<number | null>(null);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [productPageTab, setProductPageTab] = useState<'desc' | 'specs' | 'reviews' | 'faq'>('desc');
  const [selectedQty, setSelectedQty] = useState(1);

  // Banners for Hero Carousel - beautiful curated high-quality visuals
  const heroBanners = [
    {
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&auto=format&fit=crop&q=80",
      title: "New iPhone Collection",
      subtitle: "Experience the next level of mobile technology with stunning cameras and chips.",
      tagline: "NEXT-GEN MOBILE",
      buttonText: "Shop iPhone Collection",
      path: "/products?collection=iphone"
    },
    {
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=80",
      title: "Back to School Sale",
      subtitle: "Gear up for learning with laptops, backpacks, notebooks, and learning essentials.",
      tagline: "ACADEMIC GEARS",
      buttonText: "Browse Student Deals",
      path: "/products?collection=back-to-school"
    },
    {
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80",
      title: "Gaming Festival",
      subtitle: "Unleash extreme performance with premium gaming setups, consoles, and accessories.",
      tagline: "ULTIMATE GAMING",
      buttonText: "Shop Gaming Zone",
      path: "/products?collection=gaming"
    },
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
      title: "Fashion Week",
      subtitle: "Runway-inspired minimalist styling and tailored silhouettes crafted in breathable fibers.",
      tagline: "HIGH STYLE WEEK",
      buttonText: "Explore Runway Wear",
      path: "/products?collection=fashion-week"
    },
    {
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
      title: "Summer Collection",
      subtitle: "Light fabrics, eye-safe sun wear, and refreshing aesthetics for warm-weather adventures.",
      tagline: "SUMMER DROP",
      buttonText: "Shop Summer Ready",
      path: "/products?collection=summer"
    },
    {
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80",
      title: "Home Makeover",
      subtitle: "Re-envision your spaces with architectural lighting, plush seating, and minimal decor.",
      tagline: "INTERIOR ARCHITECTURE",
      buttonText: "Redesign Your Space",
      path: "/products?collection=home-makeover"
    }
  ];

  const localization = getLocalizationDetails(user?.country || deliveryCountry || 'United States');

  const localizedBanners = [
    ...(localization && localization.festival ? [{
      image: localization.festival.bannerUrl,
      title: localization.festival.name,
      subtitle: localization.festival.description,
      tagline: "FESTIVAL SPECIAL OFFER",
      buttonText: "Shop Celebration Sales"
    }] : []),
    ...heroBanners
  ];

  // Auto-rotate hero banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % localizedBanners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [localizedBanners.length]);

  // Flash Sale Countdown countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDeposit = (amount: number) => {
    setWalletStatus('loading');
    fetch('/api/v1/wallet/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setWalletStatus('success');
        onRefreshUser();
        setFundAmount('');
        setTimeout(() => setWalletStatus('idle'), 3000);
      } else {
        setWalletStatus('error');
        setWalletErrorMsg(data.error || 'Failed to deposit.');
      }
    })
    .catch(() => {
      setWalletStatus('error');
      setWalletErrorMsg('Network error.');
    });
  };

  const renderSpecialPage = () => {
    const t = route.type;
    const isGuest = user?.isGuest || user?.id === 'guest';

    if (isGuest && (t === 'wallet' || t === 'orders' || t === 'account' || t === 'notifications')) {
      return (
        <div className="max-w-md mx-auto py-16 px-6 text-center bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-100/40 my-8 text-left">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-display text-center">Premium Account Required</h3>
          <p className="text-xs text-slate-500 mt-3 max-w-xs mx-auto leading-relaxed text-center">
            You are currently exploring Ocean as a guest. Create an account or sign in to save orders, track deliveries, and top up your digital wallet.
          </p>
          <button
            onClick={onRequireLogin}
            className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3.5 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
          >
            <span>Access / Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (t === 'account' || t === 'wallet' || t === 'orders' || t === 'wishlist' || t === 'notifications') {
      const initialTab = t === 'account' ? activeAccountTab : t;
      return (
        <AccountDashboard 
          user={user} 
          onRefreshUser={onRefreshUser} 
          onLogout={onLogout} 
          onNavigate={navigate}
          initialTab={initialTab}
        />
      );
    }

    // 1. WALLET VIEW
    if (t === 'wallet') {
      return (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
          <div className="bg-neutral-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <CreditCard className="h-64 w-64 -mr-16 -mt-16 text-white" />
            </div>
            <div className="space-y-2 relative z-10 text-left">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Available Balance</span>
              <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tight">${user?.walletBalance?.toFixed(2) || '1000.00'}</h2>
              <p className="text-xs text-neutral-400 font-medium">Ocean Prime Member Credit Node</p>
            </div>
            <div className="space-y-2 relative z-10 text-left">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Loyalty Coins</span>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-mono font-bold">{user?.rewardCoins || 100} COINS</span>
              </div>
              <p className="text-[10px] text-neutral-400">Equivalent to ${(user?.rewardCoins ? (user.rewardCoins * 0.01) : 1.00).toFixed(2)} cash value</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
              <h3 className="font-bold text-lg text-black">Instantly Add Credit Funds</h3>
              <p className="text-xs text-gray-500">Fund your balance instantly using our secure sandbox terminal. Gain a 10% bonus in Loyalty Coins on every deposit.</p>
              
              <div className="grid grid-cols-3 gap-2">
                {[100, 250, 500].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => handleDeposit(amt)}
                    disabled={walletStatus === 'loading'}
                    className="py-2.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-xs font-bold rounded-xl border border-gray-100 text-black transition-all"
                  >
                    +${amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-1">
                <input 
                  type="number"
                  placeholder="Enter custom amount ($)"
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  disabled={walletStatus === 'loading'}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-black"
                />
                <button
                  onClick={() => fundAmount && handleDeposit(Number(fundAmount))}
                  disabled={walletStatus === 'loading' || !fundAmount}
                  className="px-5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                >
                  Deposit
                </button>
              </div>

              {walletStatus === 'loading' && <p className="text-xs text-blue-600 font-bold">Processing sandbox gateway handshakes...</p>}
              {walletStatus === 'success' && <p className="text-xs text-green-600 font-bold">✓ Transaction Successful! Balance updated.</p>}
              {walletStatus === 'error' && <p className="text-xs text-red-600 font-bold">✗ {walletErrorMsg}</p>}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
              <h3 className="font-bold text-lg text-black">Redeem Promo Code or Gift Card</h3>
              <p className="text-xs text-gray-500">Claim coupon multipliers or cash gift cards straight to your account. Enter active credentials below.</p>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Enter promo (e.g. WELCOME50)"
                  value={giftCardCode}
                  onChange={e => setGiftCardCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-black"
                />
                <button
                  onClick={() => {
                    if (giftCardCode === 'WELCOME50' || giftCardCode === 'OCEAN50') {
                      handleDeposit(50);
                      setGiftCardCode('');
                    } else {
                      setWalletStatus('error');
                      setWalletErrorMsg('Invalid promotional code.');
                    }
                  }}
                  className="px-5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Redeem
                </button>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">Sandbox Active promo codes: <code className="font-mono bg-gray-50 px-1 py-0.5 rounded text-black font-semibold">WELCOME50</code> (adds $50), <code className="font-mono bg-gray-50 px-1 py-0.5 rounded text-black font-semibold">OCEAN50</code>.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs text-left">
            <h3 className="font-bold text-base text-black mb-4">Account Ledger Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 text-left">Reference Node</th>
                    <th className="pb-3 text-left">Timestamp</th>
                    <th className="pb-3 text-left">Activity / Action</th>
                    <th className="pb-3 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono">
                  <tr>
                    <td className="py-3 font-semibold text-black">#TX-94819-A</td>
                    <td className="py-3">Just Now</td>
                    <td className="py-3">Sandbox Ledger Update</td>
                    <td className="py-3 text-right text-green-600 font-bold font-sans">+$0.00</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-black">#TX-81729-R</td>
                    <td className="py-3">Initial Provision</td>
                    <td className="py-3">Welcome Credits Allocation</td>
                    <td className="py-3 text-right text-green-600 font-bold font-sans">+$1000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // 2. WISHLIST VIEW
    if (t === 'wishlist') {
      return (
        <div className="max-w-6xl mx-auto py-4 text-left space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              Your Wishlisted Gems
            </h2>
            <span className="text-xs font-mono text-gray-400 font-bold">{wishlistedItems.length} items curated</span>
          </div>

          {isLoadingWishlist ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-xl animate-pulse h-64" />
              ))}
            </div>
          ) : wishlistedItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {wishlistedItems.map(p => {
                const isOutOfStock = p.stock <= 0;
                return (
                  <div 
                    key={p.id}
                    onClick={() => {
                      fetch(`/api/products/${p.id}`)
                        .then(res => res.json())
                        .then(detail => { if (detail && detail.id) handleOpenProductDetails(detail); });
                    }}
                    className="bg-white border border-gray-100 p-4 rounded-xl cursor-pointer hover:border-gray-200 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-full h-36 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2 relative">
                        <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain grayscale-[10%] group-hover:scale-102 transition-all" referrerPolicy="no-referrer" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setWishlisted(prev => ({ ...prev, [p.id]: false }));
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-red-500 rounded-full transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">{p.brand}</span>
                        <h4 className="text-xs font-bold text-gray-900 group-hover:underline truncate mt-0.5">{p.name}</h4>
                        <div className="flex items-center gap-1 mt-1 text-amber-500 text-[10px] font-bold">
                          ★ <span>{p.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs font-bold text-black font-mono">${p.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) onAddProductToCart(p);
                        }}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          isOutOfStock ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-6 max-w-md mx-auto space-y-4">
              <Heart className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-lg text-black">Your wishlist is empty</h3>
              <p className="text-xs text-gray-500">Discover and save items to watch price adjustments, check live stock, or purchase them later.</p>
              <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all">
                Browse Discovery
              </button>
            </div>
          )}
        </div>
      );
    }

    // 3. NOTIFICATIONS VIEW
    if (t === 'notifications') {
      return (
        <div className="max-w-4xl mx-auto py-4 text-left space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-black">Alert Center</h2>
            <p className="text-xs text-gray-500 mt-1">Stay updated with live shipment schedules, priority dispatch notifications, and curator events.</p>
          </div>

          <div className="space-y-4">
            {[
              { id: 1, title: 'Priority Courier Shipment Out for Delivery', body: 'Order #OCN-84920 has departed our domestic automated hub. Est. delivery is today before 5:00 PM.', time: 'Just Now', type: 'shipping', active: true },
              { id: 2, title: '$1,000 Welcome Balance Allocation', body: 'Your digital wallet balance has been successfully funded with $1,000 welcome sandbox credits.', time: '2 Hours Ago', type: 'system', active: false },
              { id: 3, title: 'Ocean Prime Membership Activated', body: 'Thank you for choosing Ocean Prime. Circular logistics, zero carbon courier lanes, and custom support tickets are now enabled.', time: '1 Day Ago', type: 'system', active: false }
            ].map(n => (
              <div key={n.id} className="bg-white border border-gray-100 p-5 rounded-2xl flex items-start gap-4 hover:border-gray-200 transition-all">
                <div className="p-2 bg-neutral-50 rounded-xl">
                  {n.type === 'shipping' ? <Truck className="h-5 w-5 text-neutral-800" /> : <ShieldCheck className="h-5 w-5 text-neutral-800" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-black">{n.title}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. SELLER PORTAL
    if (t === 'seller-portal') {
      return (
        <div className="max-w-4xl mx-auto py-4 text-left space-y-8">
          <div className="bg-neutral-50 border border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest font-mono">B2B Merchant Space</span>
              <h2 className="text-2xl md:text-3xl font-bold text-black font-sans">Become a Certified Ocean Curator</h2>
              <p className="text-xs text-gray-500 max-w-lg leading-relaxed">List designs, custom builds, and curated batches to hundreds of thousands of active digital customers. Zero commission, direct escrow payment lanes, and automated courier tracking handles everything.</p>
            </div>
            <button className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all whitespace-nowrap">
              Apply to Sell
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl">
              <span className="text-xs font-medium text-gray-400">Your Active Listings</span>
              <h4 className="text-2xl font-mono font-bold text-black mt-1">0</h4>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl">
              <span className="text-xs font-medium text-gray-400">Simulated Revenue (GMV)</span>
              <h4 className="text-2xl font-mono font-bold text-black mt-1">$0.00</h4>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl">
              <span className="text-xs font-medium text-gray-400">Escrow Pending Pay</span>
              <h4 className="text-2xl font-mono font-bold text-black mt-1">$0.00</h4>
            </div>
          </div>
        </div>
      );
    }

    // 5. ADMIN VIEW
    if (t === 'admin') {
      return (
        <div className="max-w-4xl mx-auto py-4 text-left space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-black">Control Terminal Panel</h2>
            <p className="text-xs text-gray-500 mt-1">Administrative metrics, automated courier ledgers, and database health indicators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white border border-gray-100 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Service Health</span>
              <span className="text-green-600 font-bold text-sm block mt-1">● ONLINE</span>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Response SLA</span>
              <span className="text-black font-mono font-bold text-sm block mt-1">12ms</span>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Catalog Items</span>
              <span className="text-black font-mono font-bold text-sm block mt-1">18,000+</span>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mock Escrow Reserves</span>
              <span className="text-black font-mono font-bold text-sm block mt-1">$1.48M</span>
            </div>
          </div>
          
          <div className="bg-neutral-900 text-neutral-400 p-5 rounded-2xl font-mono text-xs space-y-2 leading-relaxed">
            <p className="text-green-500 font-bold">--- OCEAN PLATFORM DIAGNOSTICS ---</p>
            <p>[SYSTEM] Boot sequence successfully verified.</p>
            <p>[SYSTEM] PostgreSQL container mapped on port 5432: 100% health index.</p>
            <p>[SYSTEM] Redis key stores initialized: 42 cached listings ready.</p>
            <p>[SYSTEM] AI sentiment scoring engine online via Gemini SDK.</p>
            <p>[SYSTEM] Zero-carbon shipping ledger loaded: 14.2 tons offset recorded.</p>
          </div>
        </div>
      );
    }

    // 6. SUPPORT VIEW
    if (t === 'support' || t === 'faq') {
      const activeFaqs = [
        { q: "How do I trace my live shipment?", a: "Navigate to the Orders & Tracking tab at the top of the interface. Locate your active shipment and click on live tracking to see current container coordinates, route telemetry, and delivery ETA." },
        { q: "Can I pay using cryptocurrencies or direct bank escrow?", a: "Currently, Ocean supports simulated credit balances, wallet debits, and loyalty points. Direct escrow and secure card gateways are fully simulated inside our sandbox." },
        { q: "What is your policy regarding circular returns and carbon offsets?", a: "Every return on Ocean is handled via a carbon-neutral shipping lane. If you initiate a return under our Returns page, we offset the transit footprint automatically and refund 100% of the value back to your wallet." },
        { q: "What happens if an item is damaged or out of stock?", a: "If an item is damaged, our Curator Protection program issues an immediate 100% refund without requiring complex dispute logs. For out of stock items, you can pre-order with premium priority queues." }
      ].filter(f => f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || f.a.toLowerCase().includes(faqSearchQuery.toLowerCase()));

      return (
        <div className="max-w-4xl mx-auto py-4 text-left space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-black font-sans">Ocean Support Hub</h2>
            <p className="text-xs text-gray-500 mt-1">Automated ticketing, instant helpdesk lookups, and direct access to Ocean agents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-base text-black">Register a Support Ticket</h3>
              <p className="text-xs text-gray-500">Need help with an order, wallet balance adjustment, or curator dispute? Fill out the secure form below.</p>
              
              {supportSubmitted ? (
                <div className="bg-green-50 border border-green-100 text-green-800 p-4 rounded-xl text-xs space-y-2">
                  <p className="font-bold">✓ Help Ticket Successfully Dispatched!</p>
                  <p>Thank you, {supportName || 'Vicky'}. Your ticket has been logged in our secure dispatcher with ref ID <strong className="font-mono">#OCN-{Math.floor(Math.random()*90000)+10000}</strong>. An agent will contact you shortly.</p>
                  <button onClick={() => setSupportSubmitted(false)} className="text-[10px] font-bold underline mt-2 block">Create another ticket</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={supportName} 
                    onChange={e => setSupportName(e.target.value)} 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    value={supportEmail} 
                    onChange={e => setSupportEmail(e.target.value)} 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                  <textarea 
                    placeholder="Describe your issue or query details..." 
                    rows={4} 
                    value={supportMessage} 
                    onChange={e => setSupportMessage(e.target.value)} 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                  <button 
                    onClick={() => {
                      if (supportName && supportEmail && supportMessage) setSupportSubmitted(true);
                    }}
                    className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Submit Support Ticket
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-base text-black">Helpdesk FAQ Index</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filter help topics..." 
                  value={faqSearchQuery}
                  onChange={e => setFaqSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {activeFaqs.map((f, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-xl text-xs border border-gray-100">
                    <h5 className="font-bold text-black mb-1">{f.q}</h5>
                    <p className="text-gray-500 leading-relaxed text-[11px]">{f.a}</p>
                  </div>
                ))}
                {activeFaqs.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No matching FAQs found. Type something else or submit a support ticket above.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 7. DEVELOPER API Documentation Playground
    if (t === 'developer-api') {
      return (
        <div className="max-w-4xl mx-auto py-4 text-left space-y-8">
          <div className="border-b border-gray-100 pb-4 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                <Cpu className="h-6 w-6 text-neutral-800" />
                Developer API Platform
              </h2>
              <p className="text-xs text-gray-500 mt-1">Connect your ERP or inventory system directly with our REST APIs.</p>
            </div>
            
            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3">
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Active Sandbox Key</span>
                <code className="text-xs font-bold text-black font-mono">{sandboxApiKey}</code>
              </div>
              <button 
                onClick={() => {
                  setIsGeneratingKey(true);
                  setTimeout(() => {
                    const rand = Array.from({length:16}, () => Math.floor(Math.random()*16).toString(16)).join('');
                    setSandboxApiKey(`ocean_live_${rand}`);
                    setIsGeneratingKey(false);
                  }, 800);
                }}
                disabled={isGeneratingKey}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black text-[10px] font-bold rounded-lg transition-all"
              >
                {isGeneratingKey ? 'Generating...' : 'Regenerate'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-base text-black">Available Platform REST Endpoints</h3>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 font-bold text-[10px] font-mono rounded">GET</span>
                  <code className="text-xs font-mono font-bold text-black">/api/v1/home</code>
                </div>
                <div className="p-4 text-xs space-y-2">
                  <p className="text-gray-500">Fetches compiled curated modules, new deals, recent flash sales and budget picks directly from our repository.</p>
                  <pre className="p-3 bg-neutral-900 text-neutral-300 font-mono text-[10px] rounded-xl overflow-x-auto">
{`{
  "banners": [ ... ],
  "todayDeals": [ ... ],
  "newReleases": [ ... ],
  "trending": [ ... ],
  "bestSellers": [ ... ]
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 font-bold text-[10px] font-mono rounded">GET</span>
                  <code className="text-xs font-mono font-bold text-black">/api/products</code>
                </div>
                <div className="p-4 text-xs space-y-2">
                  <p className="text-gray-500">Query the full inventory. Supports complex pagination filters like categories, brands, price caps and stock ratings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 8. POLICIES: RETURNS, REFUNDS, SHIPPING
    if (t === 'returns' || t === 'refund' || t === 'shipping') {
      return (
        <div className="max-w-4xl mx-auto py-4 text-left space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-black capitalize">Logistics: {t} Policy</h2>
            <p className="text-xs text-gray-500 mt-1">Details about circular transport, domestic automated delivery lines, and direct escrow refunds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed font-sans">
              <p className="font-bold text-black text-sm">Circular Logistics Guarantee</p>
              <p>Ocean operates a 100% circular return system. If you aren't completely pleased with your curated design within 30 days of arrival, we send a priority zero-footprint automated courier to retrieve it at zero cost.</p>
              
              <p className="font-bold text-black text-sm">Escrow Safe Reimbursements</p>
              <p>Refunds are initiated instantly to your wallet. You can use these credits immediately for any other catalog curation or transfer them directly out.</p>

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <p className="font-bold text-black">Fast Shipment Transit Matrix</p>
                <p className="text-[11px]">Priority couriers typically arrive within 12-36 hours across standard domestic nodes. Track your vehicle telemetry live on the Orders & Tracking sheet.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-base text-black">Initiate Circular Return</h3>
              <p className="text-xs text-gray-500 font-medium">Have an item you'd like to return? Submit order verification details below to trigger automated label prints.</p>
              
              {returnSubmitted ? (
                <div className="bg-green-50 border border-green-100 text-green-800 p-4 rounded-xl text-xs space-y-2">
                  <p className="font-bold">✓ Return Authorization Initiated!</p>
                  <p>Our autonomous courier router has logged your return request for Order <strong className="font-mono">{returnOrderId}</strong>. A label has been dispatched to your verified email. Courier ETA: 24 Hours.</p>
                  <button onClick={() => setReturnSubmitted(false)} className="text-[10px] font-bold underline mt-1 block">Submit another return</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Order ID (e.g. #ORD-84192)" 
                    value={returnOrderId}
                    onChange={e => setReturnOrderId(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black font-mono"
                  />
                  <select 
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
                  >
                    <option value="">Select a reason...</option>
                    <option value="aesthetic">Visual design preference mismatch</option>
                    <option value="size">Dimension constraints mismatch</option>
                    <option value="change">No longer required</option>
                  </select>
                  <button 
                    onClick={() => {
                      if (returnOrderId && returnReason) setReturnSubmitted(true);
                    }}
                    className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Initiate Free Return
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 9. GENERAL EDITORIAL COPY PAGES (ABOUT, PRIVACY, TERMS, SUSTAINABILITY, ACCESSIBILITY, MEMBERSHIP, PARTNERS, PRESS, INVESTORS, CAREERS, GIFT-CARDS, BRAND-REGISTRY, SUPPLIER-PORTAL, CONTACT)
    return (
      <div className="max-w-3xl mx-auto py-8 text-left space-y-8 font-sans">
        <div className="space-y-3 text-center md:text-left">
          <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase font-mono">Ocean Global Node</span>
          <h2 className="text-3xl md:text-4xl font-bold text-black font-sans capitalize">{t.replace('-', ' ')}</h2>
          <div className="h-1 w-12 bg-black rounded" />
        </div>

        <div className="text-xs md:text-sm text-neutral-600 leading-relaxed space-y-6">
          <p className="text-black font-bold text-base">A New Paradigm in Curated Commerce</p>
          <p>Ocean represents an evolution of standard online retail. We do not believe in overloading users with endless lists of identical, cheap, unvetted items. Instead, every piece of technology, fashion, audio, or utility on Ocean is individually cataloged, verified, and backed by certified designers.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
            <div className="border-l-2 border-black pl-4">
              <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">Carbon Footprint</span>
              <span className="text-lg font-mono font-bold text-black">0.0% NET ZERO</span>
            </div>
            <div className="border-l-2 border-black pl-4">
              <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">Global Nodes</span>
              <span className="text-lg font-mono font-bold text-black">12 AUTOMATED</span>
            </div>
            <div className="border-l-2 border-black pl-4">
              <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">SLA Index</span>
              <span className="text-lg font-mono font-bold text-black">99.98% SPEED</span>
            </div>
          </div>

          <p>Whether you are checking our <span className="text-black font-semibold">Terms of Service</span>, verifying your <span className="text-black font-semibold">Privacy Charter</span>, auditing our <span className="text-black font-semibold">Accessibility Compliance</span>, or exploring our <span className="text-black font-semibold">Sustainability Framework</span>, we strive to maintain the highest standard of technical and design integrity. All operations are sandboxed and simulated transparently on our Cloud Run container network.</p>
        </div>
      </div>
    );
  };

  const fetchPlpData = (pageRoute: any, offsetVal = 0, append = false) => {
    setPlpLoading(true);
    fetchCounterRef.current += 1;
    const currentFetchId = fetchCounterRef.current;
    let url = `/api/products?paginated=true&limit=${plpLimit}&offset=${offsetVal}&sortBy=${sortBy}`;
    
    if (pageRoute.type === 'category') {
      url += `&category=${encodeURIComponent(pageRoute.value || '')}`;
    } else if (pageRoute.type === 'brand') {
      url += `&brand=${encodeURIComponent(pageRoute.value || '')}`;
    } else if (pageRoute.type === 'collection') {
      url += `&collection=${encodeURIComponent(pageRoute.value || '')}`;
    } else if (pageRoute.type === 'search') {
      url += `&q=${encodeURIComponent(pageRoute.value || '')}`;
    } else if (pageRoute.type === 'new-releases') {
      url += `&newReleases=true`;
    } else if (pageRoute.type === 'best-sellers') {
      url += `&bestSellers=true`;
    } else if (pageRoute.type === 'trending') {
      url += `&trending=true`;
    } else if (pageRoute.type === 'deals') {
      url += `&deals=true`;
    } else if (pageRoute.type === 'luxury') {
      url += `&luxury=true`;
    } else if (pageRoute.type === 'editors-choice') {
      url += `&editorsChoice=true`;
    } else if (pageRoute.type === 'gaming') {
      url += `&category=Laptops`;
    } else if (pageRoute.type === 'fashion') {
      url += `&category=Fashion Women`;
    } else if (pageRoute.type === 'electronics') {
      url += `&category=Electronics`;
    } else if (pageRoute.type === 'books') {
      url += `&category=Books`;
    } else if (pageRoute.type === 'toys') {
      url += `&category=Toys`;
    } else if (pageRoute.type === 'sports') {
      url += `&category=Sports`;
    } else if (pageRoute.type === 'home-section') {
      url += `&category=Home & Kitchen`;
    } else if (pageRoute.type === 'beauty') {
      url += `&category=Beauty`;
    } else if (pageRoute.type === 'gift-guide') {
      url += `&gifts=true`;
    } else if (pageRoute.type === 'gifts') {
      url += `&gifts=true`;
    } else if (pageRoute.type === 'seasonal') {
      url += `&seasonal=true`;
    } else if (pageRoute.type === 'brands') {
      // General brand listing, can be filtered on UI
    }

    if (filterBrand) {
      url += `&brand=${encodeURIComponent(filterBrand)}`;
    }
    if (filterMinPrice) {
      url += `&minPrice=${filterMinPrice}`;
    }
    if (filterMaxPrice) {
      url += `&maxPrice=${filterMaxPrice}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (currentFetchId !== fetchCounterRef.current) {
          return;
        }
        let items: Product[] = data.items || [];
        
        // Client-side sub-filtering
        if (filterRating) {
          items = items.filter(p => p.rating >= filterRating);
        }
        if (filterInStock) {
          items = items.filter(p => p.stock > 0);
        }
        if (filterFreeDelivery) {
          items = items.filter(p => p.price > 100);
        }

        if (append) {
          setPlpProducts(prev => {
            const existingIds = new Set(prev.map(x => x.id));
            const newItems = items.filter(x => !existingIds.has(x.id));
            return [...prev, ...newItems];
          });
        } else {
          setPlpProducts(items);
        }
        setPlpTotal(data.total || items.length);
        setPlpLoading(false);

        // Check if we need to open active PDP
        if (activeProductId && !detailProduct) {
          const matched = items.find((p: Product) => p.id === activeProductId);
          if (matched) {
            handleOpenProductDetails(matched);
          }
        }
      })
      .catch(err => {
        if (currentFetchId !== fetchCounterRef.current) {
          return;
        }
        console.error("Error loading PLP items:", err);
        setPlpLoading(false);
      });
  };

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePathToRoute(window.location.pathname, window.location.search);
      setRoute(parsed);
      setDetailProduct(null);
      if (parsed.type === 'account') {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab) {
          setActiveAccountTab(tab);
        }
      }
    };
    const handleCustomNavigation = (e: Event) => {
      const customEvt = e as CustomEvent;
      const { category } = customEvt.detail || {};
      if (category) {
        const newRoute: AppRoute = { type: 'category', value: category };
        setRoute(newRoute);
        setDetailProduct(null);
        
        // Reset filters
        setFilterBrand('');
        setFilterMinPrice('');
        setFilterMaxPrice('');
        setFilterRating(null);
        setFilterInStock(false);
        setFilterFreeDelivery(false);
        setSortBy('popularity');
        setPlpOffset(0);

        // Forces product re-fetching based on category
        fetchPlpData(newRoute, 0, false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('ocean-category-navigation', handleCustomNavigation);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('ocean-category-navigation', handleCustomNavigation);
    };
  }, []);

  useEffect(() => {
    // Reset filters
    setFilterBrand('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterRating(null);
    setFilterInStock(false);
    setFilterFreeDelivery(false);
    setSortBy('popularity');
    setPlpOffset(0);

    if (route.type === 'home') {
      if (!discoveryData) {
        setIsLoadingDiscovery(true);
        fetch('/api/v1/home')
          .then(res => res.json())
          .then(data => {
            setDiscoveryData(data);
            setIsLoadingDiscovery(false);
          })
          .catch(err => {
            console.error("Error loading discovery:", err);
            setIsLoadingDiscovery(false);
          });
      }
      if (exploreMoreProducts.length === 0) {
        loadExploreMore();
      }
    } else if (specialRoutes.includes(route.type)) {
      if (route.type === 'orders') {
        setActiveTab('orders');
      } else {
        setActiveTab('shop');
      }
    } else {
      setActiveTab('shop');
      if (route.type === 'product' && route.value) {
        fetch(`/api/products/${route.value}`)
          .then(res => res.json())
          .then(prod => {
            if (prod && prod.id) {
              handleOpenProductDetails(prod);
            }
          })
          .catch(err => console.error("Error fetching detail product:", err));
      } else {
        const hasActiveFilters =
          filterBrand !== '' ||
          filterMinPrice !== '' ||
          filterMaxPrice !== '' ||
          filterRating !== null ||
          filterInStock !== false ||
          filterFreeDelivery !== false ||
          sortBy !== 'popularity';

        if (!hasActiveFilters) {
          fetchPlpData(route, 0, false);
        }
      }
    }
  }, [route.type, route.value]);

  useEffect(() => {
    if (route.type === 'wishlist') {
      setIsLoadingWishlist(true);
      fetch('/api/products?limit=100')
        .then(res => res.json())
        .then(data => {
          const items = (data.items || []).filter((p: Product) => wishlisted[p.id]);
          setWishlistedItems(items);
          setIsLoadingWishlist(false);
        })
        .catch(err => {
          console.error("Error loading wishlist:", err);
          setIsLoadingWishlist(false);
        });
    }
  }, [route.type, wishlisted]);

  useEffect(() => {
    if (route.type !== 'home' && route.type !== 'product' && !specialRoutes.includes(route.type)) {
      setPlpOffset(0);
      fetchPlpData(route, 0, false);
    }
  }, [filterBrand, filterMinPrice, filterMaxPrice, filterRating, filterInStock, filterFreeDelivery, sortBy]);

  // Load orders
  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        if (data.length > 0 && !selectedOrder) {
          setSelectedOrder(data[0]);
        }

        // Compute ordered products and active order tracking for Personalized Home
        const itemsList: Product[] = [];
        data.forEach((o: any) => {
          if (o.items) {
            o.items.forEach((item: any) => {
              if (item.product) {
                itemsList.push(item.product);
              }
            });
          }
        });
        const unique = itemsList.filter((p, idx, self) => self.findIndex(t => t.id === p.id) === idx);
        setOrderedProducts(unique);

        const active = data.find((o: any) => o.status !== 'Delivered' && o.status !== 'Cancelled');
        setActiveOrder(active);
      })
      .catch(err => console.error("Error fetching orders:", err));
  };

  // Load full catalog on mount for advanced search/interest filtering
  useEffect(() => {
    fetch('/api/products?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          setFullCatalog(data.items);
        }
      })
      .catch(err => console.error("Error loading full catalog:", err));
  }, []);

  // Update recent searches in real-time
  useEffect(() => {
    if (searchGlobalQuery && searchGlobalQuery.trim().length > 2) {
      const query = searchGlobalQuery.trim();
      setLocalRecentSearches(prev => {
        const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
        const updated = [query, ...filtered].slice(0, 10);
        localStorage.setItem('ocean_recent_searches', JSON.stringify(updated));
        return updated;
      });
    }
  }, [searchGlobalQuery]);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleOpenProductDetails = async (p: Product) => {
    setDetailProduct(p);
    setSelectedColor(p.variants?.colors?.[0] || 'Default');
    setSelectedSize(p.variants?.sizes?.[0] || 'Standard');
    setAiSummary(null);
    setReviewAlert(null);
    setNewComment('');
    setNewRating(5);
    setActiveProductId(p.id);

    // Reset advanced gallery and buy box states
    setActiveGalleryIndex(0);
    setSelectedQty(1);
    setBundleChecked([true, true, true]);
    setFaqSearchQuery('');
    setUserQuestion('');
    setReviewStarFilter(null);
    setProductPageTab('desc');
    setIsVideoPlaying(false);

    // Track recently viewed
    setRecentlyViewed(prev => {
      const filtered = prev.filter(x => x.id !== p.id);
      return [p, ...filtered].slice(0, 5);
    });

    // Get live reviews
    fetch(`/api/products/${p.id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data));

    // Get AI review summary (Pros, Cons, Grade)
    setIsLoadingAiSummary(true);
    try {
      const res = await fetch(`/api/ai/reviews-summary/${p.id}`);
      const summaryData = await res.json();
      setAiSummary(summaryData);
    } catch (e) {
      console.error('AI Summary fetch error:', e);
    } finally {
      setIsLoadingAiSummary(false);
    }
  };

  const handleCloseProductDetails = () => {
    setDetailProduct(null);
    setActiveProductId(null);
  };

  // Cart operations
  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    setAppliedCoupon(null);
    fetch('/api/coupons')
      .then(res => res.json())
      .then((coupons: Coupon[]) => {
        const match = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
        if (match) {
          const subtotal = cart.reduce((acc, c) => acc + (c.product.price * c.quantity), 0);
          if (subtotal < match.minSpend) {
            setCouponError(`Minimum spend of $${match.minSpend} required for this code.`);
          } else {
            setAppliedCoupon(match);
          }
        } else {
          setCouponError('Invalid coupon code. Try OCEAN15');
        }
      });
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, c) => acc + (c.product.price * c.quantity), 0);
  const cartItemCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const couponDiscount = appliedCoupon
    ? (appliedCoupon.discountType === 'percentage'
        ? parseFloat((cartSubtotal * (appliedCoupon.value / 100)).toFixed(2))
        : appliedCoupon.value)
    : 0;
  const shippingFee = cartSubtotal > 100 || cartSubtotal === 0 ? 0 : 5.99;
  const cartTotal = Math.max(0, parseFloat((cartSubtotal - couponDiscount + shippingFee).toFixed(2)));

  // Review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.isGuest || user?.id === 'guest') {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    if (!newComment.trim() || !detailProduct) return;

    try {
      const res = await fetch(`/api/products/${detailProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment
        })
      });

      const data = await res.json();
      if (data.success) {
        setReviews(prev => [...prev, data.review]);
        if (!data.review.isFake) {
          setDetailProduct(prev => {
            if (!prev) return null;
            return { ...prev, reviewsCount: prev.reviewsCount + 1 };
          });
        }

        // Show silent fraud indicator in inline alert
        setReviewAlert({
          isFake: data.review.isFake,
          reason: data.aiFeedback.reason
        });

        setNewComment('');
        onRefreshUser();
      }
    } catch (err) {
      console.error('Review submit failed:', err);
    }
  };

  // Checkout order placement
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!checkoutAddress.trim()) {
      setCheckoutError('Please provide a shipping delivery address.');
      return;
    }
    if (!cardName.trim() || !cardNumber.trim()) {
      setCheckoutError('Please provide valid cardholder payment details.');
      return;
    }

    setCheckoutError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
            image: item.product.image
          })),
          total: cartTotal,
          shippingAddress: checkoutAddress
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || 'Checkout transaction failed.');
      } else {
        setCheckoutSuccess(true);
        setCart([]); // Clear cart
        setAppliedCoupon(null);
        setCouponCode('');
        onRefreshUser();
        
        setTimeout(() => {
          setCheckoutSuccess(false);
          setIsCheckingOut(false);
          setIsCartOpen(false);
          setActiveTab('orders');
        }, 2200);
      }
    } catch (err) {
      setCheckoutError('An issue occurred during checkout verification.');
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedCategoryState(cat);
    if (cat === 'All') {
      navigate('/products');
    } else {
      navigate(`/products?category=${encodeURIComponent(cat.toLowerCase())}`);
    }
  };

  const getBundleAccessories = (p: Product) => {
    if (p.id === 'prod-1') {
      return [
        { name: 'Solid Walnut Headphone Stand', price: 39.99, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80' },
        { name: 'EVA Hard-Shell Protective Travel Case', price: 19.99, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80' }
      ];
    } else if (p.id === 'prod-2') {
      return [
        { name: 'Genuine Leather Link Band', price: 29.99, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=200&auto=format&fit=crop&q=80' },
        { name: 'Magnetic Fast Wireless Charger Dock', price: 14.99, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&auto=format&fit=crop&q=80' }
      ];
    } else if (p.id === 'prod-3') {
      return [
        { name: 'Coiled Aviation USB-C Cable', price: 24.99, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&auto=format&fit=crop&q=80' },
        { name: 'Artisan Resin Esc Keycap (Opal Tide)', price: 12.99, image: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=200&auto=format&fit=crop&q=80' }
      ];
    } else if (p.id === 'prod-4') {
      return [
        { name: 'Heavy-Duty 65W GaN Dual-Port Wall Plug', price: 29.99, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80' },
        { name: 'Magnetic Silicone Cord Organizers (3-Pack)', price: 9.99, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80' }
      ];
    } else {
      return [
        { name: 'Gourmet Herb Seed Pod Kit (9-Pod Pack)', price: 24.99, image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=200&auto=format&fit=crop&q=80' },
        { name: 'Precision Leaf Pruning Shears (Stainless Steel)', price: 11.99, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&auto=format&fit=crop&q=80' }
      ];
    }
  };

  const getSecondaryImage = (imgUrl: string) => {
    if (!imgUrl) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
    if (imgUrl.includes('unsplash.com')) {
      if (imgUrl.includes('photo-1505740420928-5e560c06d30e')) {
        return 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=60';
      }
      if (imgUrl.includes('photo-1483985988355-763728e1935b')) {
        return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=60';
      }
      return imgUrl.replace('q=80', 'q=60&sat=-50');
    }
    return imgUrl;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-black">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= Math.round(rating) ? 'text-black text-sm' : 'text-gray-200 text-sm'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderProductCard = (p: Product, extraBadge?: string, options?: { showClaim?: boolean; showRank?: number; checkoutReadiness?: number; isRecentlyViewed?: boolean }) => {
    const isOutOfStock = p.stock === 0;
    const originalPrice = (p as any).originalPrice || Math.round(p.price * 1.3);
    const discountPercent = (p as any).discountPercent || 15;
    const limitedStock = (p as any).limitedStock || 4;

    return (
      <div
        key={p.id}
        onClick={() => handleOpenProductDetails(p)}
        onMouseEnter={() => setHoveredCardId(p.id)}
        onMouseLeave={() => setHoveredCardId(null)}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-gray-200 transition-all duration-300 cursor-pointer flex flex-col group relative text-left"
      >
        {extraBadge && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded z-20 uppercase tracking-wider">
            {extraBadge}
          </span>
        )}
        {!extraBadge && options?.showRank && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded z-20 uppercase tracking-wider">
            #{options.showRank} Best Seller
          </span>
        )}
        {!extraBadge && !options?.showRank && p.rating >= 4.8 && (
          <span className="absolute top-3 left-3 bg-white border border-gray-250 text-black text-[9px] font-bold px-2.5 py-0.5 rounded-full z-20 uppercase shadow-xs">
            Highly Rated
          </span>
        )}

        <div className="w-full h-[185px] bg-gray-50 overflow-hidden relative border-b border-gray-100 flex items-center justify-center p-4">
          <img
            src={hoveredCardId === p.id ? getSecondaryImage(p.image) : p.image}
            alt={p.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103 grayscale-[8%]"
            referrerPolicy="no-referrer"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="text-[10px] font-extrabold tracking-wider bg-black text-white px-2.5 py-1.5 rounded-lg uppercase">
                Temporarily Sold Out
              </span>
            </div>
          )}

          {/* Action Hover overlay bar */}
          <div className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWishlisted(prev => ({ ...prev, [p.id]: !prev[p.id] }));
              }}
              className={`p-1.5 rounded-full border shadow-sm transition-colors ${
                wishlisted[p.id] ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:text-black'
              }`}
            >
              <Heart className="h-3.5 w-3.5" fill={wishlisted[p.id] ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCompared(prev => ({ ...prev, [p.id]: !prev[p.id] }));
              }}
              className={`p-1.5 rounded-full border shadow-sm transition-colors ${
                compared[p.id] ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:text-black'
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenProductDetails(p);
              }}
              className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-black shadow-sm transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4.5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                {p.brand}
              </span>
              <div className="flex items-center gap-0.5">
                <span className="text-xs font-bold text-black">{p.rating}</span>
                <span className="text-black text-[10px]">★</span>
              </div>
            </div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:underline leading-snug line-clamp-1">
              {p.name}
            </h4>
            <p className="text-[11px] text-gray-400 leading-normal line-clamp-2">
              {p.description}
            </p>

            {/* Checkout Readiness for Continue Shopping */}
            {options?.checkoutReadiness && (
              <div className="space-y-1 pt-1.5">
                <div className="flex justify-between items-center text-[10px] text-emerald-600 font-bold">
                  <span>{options.checkoutReadiness}% Ready to Order</span>
                  <span className="text-gray-400 font-medium">Cart status</span>
                </div>
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${options.checkoutReadiness}%` }}></div>
                </div>
              </div>
            )}

            {/* Stock Progress bar for Today's Deals */}
            {options?.showClaim && (
              <div className="space-y-1 pt-1.5">
                <div className="flex justify-between items-center text-[10px] text-red-600 font-bold">
                  <span>Only {limitedStock} left!</span>
                  <span className="text-gray-400 font-medium">Claimed</span>
                </div>
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col text-left">
              {extraBadge && (
                <span className="text-[10px] text-gray-400 line-through font-mono font-medium leading-none mb-0.5">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs md:text-sm font-bold text-black font-mono">
                ${p.price.toFixed(2)}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) onAddProductToCart(p);
              }}
              disabled={isOutOfStock}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all shadow-xs ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col font-sans">
      
      {/* 
        CUSTOMER VIEW DIRECTORY NAVIGATION BAR
        Prisinte minimalist navigation tabs.
      */}
      <div className="bg-white border-b border-gray-100 py-4 flex flex-col sm:flex-row items-center justify-between select-none px-2 mb-6 gap-4">
        <div className="flex gap-8">
          <button
            onClick={() => { setActiveTab('shop'); handleCloseProductDetails(); }}
            className={`pb-1.5 font-semibold text-xs uppercase tracking-wider transition-all relative ${
              activeTab === 'shop' ? 'text-black border-b border-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            Curated Catalog
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-1.5 font-semibold text-xs uppercase tracking-wider transition-all relative ${
              activeTab === 'orders' ? 'text-black border-b border-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            Orders & Tracking
          </button>
        </div>

        {/* Clean, generic Account Points & Account limits display box */}
        <div className="flex items-center gap-5 text-xs text-gray-500 font-medium bg-gray-50/50 border border-gray-100 rounded-lg px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-normal">Account Balance:</span>
            <span className="font-semibold text-black">${user.walletBalance.toFixed(2)}</span>
          </div>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-normal">Loyalty Points:</span>
            <span className="font-semibold text-black">{user.rewardCoins}</span>
          </div>
        </div>
      </div>

      {/* Button to toggle Cart slide-over hidden programmatically from App.tsx */}
      <button 
        id="cart-sidebar-toggle-btn" 
        className="hidden" 
        onClick={() => setIsCartOpen(true)}
      />

      {/* 1. CATALOG / SHOPPING HOME VIEW */}
      {activeTab === 'shop' && (
        <div className="w-full">
          {!detailProduct ? (
            <div className="flex flex-col gap-10">
              {route.type === 'home' ? (
                /* ========================================= */
                /* DISCOVERY HOME VIEW (CURATED CONTENT ONLY) */
                /* ========================================= */
                <div className="flex flex-col gap-12">
                  {/* ELEGANT HERO PROMOTIONAL BANNER CAROUSEL (WHITE & GRAY AESTHETIC) */}
                  <div className="relative w-full h-[360px] md:h-[460px] bg-gray-100 rounded-2xl overflow-hidden shadow-xs border border-gray-100">
                    {localizedBanners.map((banner, index) => {
                      const isActive = index === currentHeroIndex;
                      return (
                        <div 
                          key={index}
                          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                          }`}
                        >
                          <img 
                            src={banner.image} 
                            alt={banner.title} 
                            className="w-full h-full object-cover grayscale-[15%] opacity-90"
                            referrerPolicy="no-referrer"
                          />
                          {/* Subtle soft white-to-gray overlaying mask */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent flex flex-col justify-center p-8 md:p-16">
                            <div className="max-w-md space-y-3">
                              <span className="text-[10px] text-black font-semibold uppercase tracking-[0.2em] bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md inline-block">
                                {banner.tagline}
                              </span>
                              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black leading-tight">
                                {banner.title}
                              </h1>
                              <p className="text-xs md:text-sm text-gray-500 font-medium">
                                {banner.subtitle}
                              </p>
                              <div className="pt-2">
                                <button 
                                  onClick={() => {
                                    if ((banner as any).path) {
                                      navigate((banner as any).path);
                                    } else if (index === 0 && !localization.festival) {
                                      navigate('/products?category=Electronics');
                                    } else if (index === 1 && !localization.festival) {
                                      navigate('/products?category=Fashion%20Women');
                                    } else {
                                      navigate('/products');
                                    }
                                  }}
                                  className="bg-black text-white hover:bg-gray-800 text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
                                >
                                  {banner.buttonText}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Subtle Pill Dots controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-white/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                      {localizedBanners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentHeroIndex(idx)}
                          className={`h-1.5 w-1.5 rounded-full transition-all ${
                            idx === currentHeroIndex ? 'bg-black w-4' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 15 PREMIUM CATEGORY CARDS */}
                  <div className="flex flex-col gap-4 text-left">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Shop by Category
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {[
                        { id: 'Mobiles', title: 'Mobiles', count: 'Latest Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Laptops', title: 'Laptops', count: 'High-Power Notebooks', image: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Fashion Men', title: 'Fashion Men', count: 'Men’s Apparel', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Fashion Women', title: 'Fashion Women', count: 'Women’s Styling', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Shoes', title: 'Shoes', count: 'Comfort & Athletics', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Watches', title: 'Watches', count: 'Luxury Chronographs', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Beauty', title: 'Beauty', count: 'Clean Skincare', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Books', title: 'Books', count: 'Fascinating Reads', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Furniture', title: 'Furniture', count: 'Designer Comfort', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Kitchen', title: 'Kitchen', count: 'Culinary Hardware', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Sports', title: 'Sports', count: 'Active & Gym Wear', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Toys', title: 'Toys', count: 'Puzzles & Games', image: 'https://images.unsplash.com/photo-1566576912321-d58def7a2a5a?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Baby', title: 'Baby', count: 'Nurture & Clothes', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Automotive', title: 'Automotive', count: 'Console Gadgets', image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=100&auto=format&fit=crop&q=80' },
                        { id: 'Pet Supplies', title: 'Pet Supplies', count: 'Premium Pet Care', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=100&auto=format&fit=crop&q=80' }
                      ].map((cat) => {
                        return (
                          <div
                            key={cat.id}
                            id={`category-card-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => handleCategorySelect(cat.id)}
                            className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 group hover:border-black hover:shadow-xs"
                          >
                            <div className="flex flex-col text-left max-w-[65%]">
                              <span className="text-xs font-bold text-black group-hover:underline leading-snug">{cat.title}</span>
                              <span className="text-[9px] text-gray-400 mt-0.5 font-medium">{cat.count}</span>
                            </div>
                            <img src={cat.image} alt={cat.title} className="w-9 h-9 object-cover rounded-md border border-gray-100 grayscale-[20%]" referrerPolicy="no-referrer" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* FLASH SALE Countdown Alert Banner */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col text-left space-y-1.5 md:max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-widest flex items-center gap-1">
                          <Flame className="h-3 w-3 animate-pulse" /> FLASH EVENT
                        </span>
                        <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-black" /> Offers end in: 
                          <span className="font-mono bg-gray-100 text-black px-1.5 py-0.5 rounded font-bold">
                            {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                          </span>
                        </span>
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-black">
                        Complementary Premium Delivery Event
                      </h2>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Enjoy free priority processing and carbon-offset express logistics courier delivery on all orders exceeding $100. Apply seasonal discount codes for further curations.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-gray-50 p-4.5 rounded-xl border border-gray-100 w-full md:w-auto flex-shrink-0">
                      <div className="text-left">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">PREMIUM BENEFIT</span>
                        <span className="text-sm font-bold text-black block">Free Priority Courier</span>
                        <span className="text-[10px] text-gray-500 block">Orders over $100</span>
                      </div>
                      <Truck className="h-8 w-8 text-black" />
                    </div>
                  </div>

                  {/* CURATED DISCOVERY SECTIONS FROM API */}
                  {isLoadingDiscovery ? (
                    <div className="flex flex-col gap-10 animate-pulse">
                      {[1, 2, 3].map((sec) => (
                        <div key={sec} className="space-y-4">
                          <div className="h-5 bg-gray-100 rounded w-1/4"></div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="h-64 bg-gray-100 rounded-2xl"></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : discoveryData ? (
                    <div className="flex flex-col gap-12">
                      
                      {/* 3. FLASH SALE HIGH URGENCY ROW (Loaded immediately on mount) */}
                      <DiscoverySection
                        title="Flash Sale (selling out fast!)"
                        subtitle="Massive discounts available for a limited time only."
                        apiUrl="/api/v1/home/flash-sale"
                        viewAllPath="/products?section=deals"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {items.slice(0, 6).map((p: Product) => (
                              <div key={p.id} className="relative">
                                {rpc(p, `${(p as any).discountPercent || 35}% Off`, { showClaim: true })}
                                <span className="absolute top-2.5 right-2.5 bg-red-100 text-red-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                  {(p as any).limitedStock ? `${(p as any).limitedStock} left` : '90% claimed'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      />

                      {/* 4. TODAY'S DEALS */}
                      <DiscoverySection
                        title="Today's Deals"
                        subtitle="Curated daily hardware savings and limited time price drops."
                        apiUrl="/api/v1/home/deals"
                        viewAllPath="/products?section=deals"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p, "Deal of Day", { showClaim: true }))}
                          </div>
                        )}
                      />

                      {/* 5. NEW RELEASES */}
                      <DiscoverySection
                        title="New Releases"
                        subtitle="The newest catalog additions and fresh product drops."
                        apiUrl="/api/v1/home/new"
                        viewAllPath="/products?section=new-releases"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {items.slice(0, 10).map((p: Product) => rpc(p, "Just In"))}
                          </div>
                        )}
                      />

                      {/* 6. TRENDING NOW */}
                      <DiscoverySection
                        title="Trending Now"
                        subtitle="Items rising quickly in general user views and interactions."
                        apiUrl="/api/v1/home/trending"
                        viewAllPath="/products?section=trending"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {items.slice(0, 10).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 7. BEST SELLERS */}
                      <DiscoverySection
                        title="Best Sellers"
                        subtitle="Highly sought-after, crowd-verified buyer favorites."
                        apiUrl="/api/v1/home/bestsellers"
                        viewAllPath="/products?section=best-sellers"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {items.slice(0, 10).map((p: Product, idx: number) => rpc(p, undefined, { showRank: idx + 1 }))}
                          </div>
                        )}
                      />

                      {/* 8. RECOMMENDED FOR YOU */}
                      {user && user.id !== 'guest' && (
                        <DiscoverySection
                          title="Recommended For You"
                          subtitle="Personalized highlights aligned with your interests."
                          apiUrl="/api/v1/home/recommended"
                          viewAllPath="/products"
                          renderProductCard={renderProductCard}
                          renderLayout={(items, rpc) => (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {items.slice(0, 10).map((p: Product) => rpc(p, "For You"))}
                            </div>
                          )}
                        />
                      )}

                      {/* 9. POPULAR BRANDS GRID (Static UI Section) */}
                      <div id="home-popular-brands-section" className="flex flex-col gap-5 text-left border-t border-gray-100/60 pt-8">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold tracking-tight text-black uppercase">Popular Brands</h3>
                          <p className="text-xs text-gray-400 font-medium">Discover premium catalog collections from globally verified developers.</p>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-11 gap-3">
                          {['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Bose', "Levi's", 'Puma', 'LG', 'HP', 'Dell'].map((brandName) => (
                            <div
                              key={brandName}
                              id={`brand-logo-${brandName.toLowerCase()}`}
                              onClick={() => navigate(`/products?brand=${encodeURIComponent(brandName)}`)}
                              className="bg-white border border-gray-150 rounded-xl py-3 px-2 flex items-center justify-center cursor-pointer hover:border-black transition-all group"
                            >
                              <span className="text-xs font-extrabold tracking-tight text-black group-hover:underline">{brandName}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 10. CURATED COLLECTIONS (BENTO GRID) (Static UI Section) */}
                      <div id="home-curated-collections-section" className="flex flex-col gap-5 text-left border-t border-gray-100/60 pt-8">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold tracking-tight text-black uppercase">Curated Collections</h3>
                          <p className="text-xs text-gray-400 font-medium">Explore premium design categories and lifestyle setups.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            { title: 'Gaming Setup', query: 'gaming', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&auto=format&fit=crop&q=80', size: 'col-span-1 md:col-span-2' },
                            { title: 'Home Office', query: 'home-office', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&auto=format&fit=crop&q=80', size: 'col-span-1' },
                            { title: 'Minimal Living', query: 'minimal-living', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80', size: 'col-span-1' },
                            { title: 'Travel Essentials', query: 'travel-essentials', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&auto=format&fit=crop&q=80', size: 'col-span-1' },
                            { title: 'Fitness Starter Pack', query: 'fitness', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&auto=format&fit=crop&q=80', size: 'col-span-1' },
                            { title: 'Silent Luxury', query: 'silent-luxury', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&auto=format&fit=crop&q=80', size: 'col-span-1 md:col-span-2' },
                            { title: 'Student Picks', query: 'student-picks', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop&q=80', size: 'col-span-1' },
                            { title: 'Photography', query: 'photography', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=80', size: 'col-span-1' },
                            { title: 'Camping', query: 'camping', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&auto=format&fit=crop&q=80', size: 'col-span-1 md:col-span-2' }
                          ].map((coll, idx) => (
                            <div
                              key={idx}
                              id={`bento-collection-${coll.title.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => navigate(`/products?collection=${coll.query}`)}
                              className={`${coll.size} h-40 rounded-xl overflow-hidden relative cursor-pointer group shadow-xs border border-gray-100`}
                            >
                              <img src={coll.image} alt={coll.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 text-left">
                                <h4 className="text-sm font-extrabold text-white group-hover:underline">{coll.title}</h4>
                                <span className="text-[10px] text-gray-300 font-medium mt-0.5">Explore collection →</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 11. SILENT LUXURY PICKS */}
                      <DiscoverySection
                        title="Silent Luxury Picks"
                        subtitle="Understated, high-end, premium quality craftsmanship."
                        apiUrl="/api/v1/home/luxury"
                        viewAllPath="/products?maxPrice=1000"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p, "Premium"))}
                          </div>
                        )}
                      />

                      {/* 12. BUDGET FRIENDLY FINDS */}
                      <DiscoverySection
                        title="Budget Friendly Finds"
                        subtitle="Quality materials and timeless style without the premium price."
                        apiUrl="/api/v1/home/budget"
                        viewAllPath="/products?maxPrice=50"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p, "Budget Value"))}
                          </div>
                        )}
                      />

                      {/* 13. SUPER SAVER DEALS UNDER $15 */}
                      <DiscoverySection
                        title="Super Saver Deals (Under $15)"
                        subtitle="Exceptional everyday values and minor accessories."
                        apiUrl="/api/v1/home/under-999"
                        viewAllPath="/products?maxPrice=15"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p, "Under $15"))}
                          </div>
                        )}
                      />

                      {/* 14. ELECTRONICS & GADGETS */}
                      <DiscoverySection
                        title="Electronics & Gadgets"
                        subtitle="Next-gen acoustics, computing hardware, and mobile tech."
                        apiUrl="/api/v1/home/electronics"
                        viewAllPath="/category/Electronics"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 15. FASHION & WARDROBE */}
                      <DiscoverySection
                        title="Fashion & Wardrobe"
                        subtitle="Tailored apparel, shoes, and organic cotton basics."
                        apiUrl="/api/v1/home/fashion"
                        viewAllPath="/category/Fashion Men"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 16. GAMING EQUIPMENT */}
                      <DiscoverySection
                        title="Gaming Setup & Tech"
                        subtitle="RGB keyboards, mechanical mice, and elite computing monitors."
                        apiUrl="/api/v1/home/gaming"
                        viewAllPath="/products?collection=gaming"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 17. BOOKS & LITERATURE */}
                      <DiscoverySection
                        title="Books & Literature"
                        subtitle="Curated reading logs, masterwork novels, and biographies."
                        apiUrl="/api/v1/home/books"
                        viewAllPath="/category/Books"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 18. BEAUTY & WELLNESS */}
                      <DiscoverySection
                        title="Beauty & Wellness"
                        subtitle="Scented essential oils, skincare, and facial massage tools."
                        apiUrl="/api/v1/home/beauty"
                        viewAllPath="/category/Beauty"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 19. HOME ESSENTIALS */}
                      <DiscoverySection
                        title="Home & Kitchen Essentials"
                        subtitle="Minimalist storage, furniture designs, and kitchen setups."
                        apiUrl="/api/v1/home/home-essentials"
                        viewAllPath="/category/Home & Kitchen"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 20. TOYS & HOBBIES */}
                      <DiscoverySection
                        title="Toys, Hobbies & Kids"
                        subtitle="Developmental blocks, modular boards, and active play sets."
                        apiUrl="/api/v1/home/toys"
                        viewAllPath="/category/Toys"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 21. SPORTS & OUTDOORS */}
                      <DiscoverySection
                        title="Sports & Outdoors"
                        subtitle="Durable hiking backpacks, water flasks, and resistance mats."
                        apiUrl="/api/v1/home/sports"
                        viewAllPath="/category/Sports"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((p: Product) => rpc(p))}
                          </div>
                        )}
                      />

                      {/* 22. RECENTLY VIEWED ROW */}
                      {recentlyViewed.length > 0 && (
                        <div id="home-recently-viewed-section" className="flex flex-col gap-5 text-left border-t border-gray-100/60 pt-8">
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <h3 className="text-base font-bold tracking-tight text-black uppercase">Recently Viewed</h3>
                              <p className="text-xs text-gray-400 font-medium">Your active history log on Ocean.</p>
                            </div>
                            <button
                              onClick={() => {
                                setRecentlyViewed([]);
                                localStorage.removeItem('ocean_recently_viewed_products');
                              }}
                              className="text-xs font-bold text-red-600 hover:underline tracking-wider uppercase cursor-pointer"
                            >
                              Clear History
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {recentlyViewed.slice(0, 10).map((p: Product) => renderProductCard(p, "History", { isRecentlyViewed: true }))}
                          </div>
                        </div>
                      )}

                      {/* 23. FEATURED SELLERS SECTION */}
                      <DiscoverySection
                        title="Featured Sellers"
                        subtitle="Purchase directly from globally verified, high-rating storefronts."
                        apiUrl="/api/v1/home/featured-sellers"
                        viewAllPath="/products"
                        renderProductCard={renderProductCard}
                        renderLayout={(items, rpc) => (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {items.map((seller: any) => (
                              <div key={seller.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col text-left group">
                                <div className="h-20 bg-gray-50 overflow-hidden relative">
                                  <img src={seller.banner} alt={seller.name} className="w-full h-full object-cover grayscale-[10%]" />
                                  <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase font-sans">Verified</span>
                                </div>
                                <div className="p-4 flex flex-col justify-between flex-1 space-y-4">
                                  <div>
                                    <h4 className="font-bold text-sm text-black leading-snug group-hover:underline">{seller.name}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-semibold text-gray-500 font-sans">
                                      <span>★ {seller.rating} Rating</span>
                                      <span>•</span>
                                      <span>{(seller.followersCount || 2400).toLocaleString()} Followers</span>
                                      <span>•</span>
                                      <span>{(seller.productsCount || 82)} Products</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => navigate(`/products?sellerId=${seller.id}`)}
                                      className="flex-1 bg-black text-white hover:bg-gray-800 text-[10px] font-bold py-2 rounded-lg text-center cursor-pointer"
                                    >
                                      Visit Store
                                    </button>
                                    <button
                                      onClick={() => setFollowedSellers(prev => ({ ...prev, [seller.id]: !prev[seller.id] }))}
                                      className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer ${
                                        followedSellers[seller.id]
                                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                          : 'bg-white border-gray-200 text-gray-700 hover:border-black'
                                      }`}
                                    >
                                      {followedSellers[seller.id] ? "Following" : "Follow"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      />

                      {/* 24. RECENTLY ADDED BRANDS (Static UI section) */}
                      <div id="home-recently-added-brands-section" className="flex flex-col gap-5 text-left border-t border-gray-100/60 pt-8">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold tracking-tight text-black uppercase flex items-center gap-1.5">
                            <Sparkles className="h-4.5 w-4.5 text-black" /> Recently Added Brands
                          </h3>
                          <p className="text-xs text-gray-400 font-medium">The newest direct-to-consumer developers joining our catalog.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                          {[
                            { name: 'Nothing', tagline: 'Transparent tech', year: 'Est. 2024' },
                            { name: 'Dyson', tagline: 'Air Engineering', year: 'Est. 2025' },
                            { name: 'Patagonia', tagline: 'Sustainable outdoor', year: 'Est. 2026' },
                            { name: 'Leica', tagline: 'German Optics', year: 'Est. 2024' },
                            { name: 'Herman Miller', tagline: 'Ergonomic Interior', year: 'Est. 2025' },
                            { name: 'Teenage Engineering', tagline: 'Acoustic Synthesizers', year: 'Est. 2026' }
                          ].map((brand) => (
                            <div
                              key={brand.name}
                              id={`new-brand-card-${brand.name.toLowerCase()}`}
                              onClick={() => navigate(`/products?brand=${encodeURIComponent(brand.name)}`)}
                              className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-black hover:shadow-xs transition-all text-left flex flex-col justify-between h-24 group"
                            >
                              <div>
                                <h4 className="font-bold text-xs text-black group-hover:underline">{brand.name}</h4>
                                <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{brand.tagline}</p>
                              </div>
                              <span className="text-[8px] bg-gray-50 text-gray-400 font-mono self-start px-1.5 py-0.5 rounded">{brand.year}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 25. EXPLORE MORE (INFINITE DISCOVERY BOTTOM GRID) */}
                      <div id="home-explore-more-section" className="flex flex-col gap-6 text-left border-t border-gray-150 pt-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold tracking-tight text-black uppercase flex items-center gap-1.5">
                              <Compass className="h-5 w-5 text-black" /> Explore More (Infinite Discovery)
                            </h3>
                            <p className="text-xs text-gray-400 font-medium">A fresh, randomized snapshot of our massive 18,000 product catalog.</p>
                          </div>
                          <button
                            onClick={loadExploreMore}
                            disabled={isLoadingExploreMore}
                            className="bg-black text-white hover:bg-gray-800 text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 self-start transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingExploreMore ? 'animate-spin' : ''}`} />
                            Refresh Discovery
                          </button>
                        </div>

                        {isLoadingExploreMore ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                              <div key={i} className="h-64 bg-gray-50 rounded-2xl"></div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {exploreMoreProducts.map((p: Product) => renderProductCard(p))}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-2xl py-12 text-center text-gray-400">
                      <AlertTriangle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-semibold">Failed to load curated home discovery.</p>
                    </div>
                  )}
                </div>
              ) : specialRoutes.includes(route.type) ? (
                /* ========================================= */
                /* SPECIAL AUDITED SYSTEM PAGES AND CONTENT  */
                /* ========================================= */
                <div className="flex flex-col gap-6">
                  {renderSpecialPage()}
                </div>
              ) : (
                /* ========================================= */
                /* PRODUCT LISTING PAGE (PLP) FOR LISTINGS    */
                /* ========================================= */
                <div className="flex flex-col gap-6">
                  {/* PLP Dedicated Hero Banner */}
                  {(() => {
                    const hero = getPLPHeroDetails(route);
                    return (
                      <div className="relative w-full h-[180px] md:h-[240px] bg-gray-100 rounded-2xl overflow-hidden shadow-xs border border-gray-100 mb-2">
                        <img 
                          src={hero.image} 
                          alt={hero.title} 
                          className="w-full h-full object-cover grayscale-[15%] opacity-95"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/40 to-transparent flex flex-col justify-center p-6 md:p-12 text-left">
                          <div className="max-w-xl space-y-2">
                            <span className="text-[9px] text-black font-semibold uppercase tracking-[0.2em] bg-white border border-gray-200 px-2 py-0.5 rounded inline-block">
                              {hero.tagline}
                            </span>
                            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-black leading-tight">
                              {hero.title}
                            </h1>
                            <p className="text-[11px] md:text-xs text-gray-500 font-medium max-w-md">
                              {hero.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium select-none pb-2 border-b border-gray-100 text-left">
                    <span className="hover:text-black cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
                    <ChevronRight className="h-3 w-3 text-gray-300" />
                    <span className="text-gray-900 font-bold uppercase tracking-wider">
                      {route.type === 'category' ? `Category` : 
                       route.type === 'brand' ? `Brand` :
                       route.type === 'collection' ? `Collection` :
                       route.type === 'search' ? `Search` : getRouteTitle(route)}
                    </span>
                    {route.value && (
                      <>
                        <ChevronRight className="h-3 w-3 text-gray-300" />
                        <span className="text-gray-900 font-bold truncate max-w-[150px]">{route.value}</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* FILTER SIDEBAR (1 Column) */}
                    <div className={`lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 space-y-6 lg:sticky lg:top-[90px] shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-left z-20 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                          <Filter className="h-4 w-4" /> Filter Catalog
                        </h4>
                        {(filterBrand || filterMinPrice || filterMaxPrice || filterRating || filterInStock || filterFreeDelivery) && (
                          <button
                            onClick={() => {
                              setFilterBrand('');
                              setFilterMinPrice('');
                              setFilterMaxPrice('');
                              setFilterRating(null);
                              setFilterInStock(false);
                              setFilterFreeDelivery(false);
                            }}
                            className="text-[10px] text-red-600 font-bold hover:underline"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Categories filter helper list */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Categories</h5>
                        <div className="flex flex-col gap-1.5 text-xs text-gray-600 font-semibold max-h-40 overflow-y-auto pr-1">
                          {['Mobiles', 'Laptops', 'Fashion Men', 'Fashion Women', 'Kids', 'Shoes', 'Beauty', 'Kitchen', 'Furniture', 'Books', 'Toys', 'Sports', 'Grocery', 'Smart Home', 'Automotive'].map(cat => {
                            const isSel = route.type === 'category' && route.value === cat;
                            return (
                              <button
                                key={cat}
                                onClick={() => {
                                  handleCategorySelect(cat);
                                  setMobileFiltersOpen(false);
                                }}
                                className={`text-left text-gray-600 hover:text-black py-1 transition-all truncate leading-normal shrink-0 ${isSel ? 'text-black font-bold pl-2 border-l-2 border-black' : ''}`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Brand selector */}
                      <div className="space-y-2 pt-2 border-t border-gray-50">
                        <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Brand</h5>
                        <select
                          value={filterBrand}
                          onChange={(e) => setFilterBrand(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                        >
                          <option value="">All Brands</option>
                          {['Ocean', 'Apple', 'Bose', 'Nike', 'Leica', 'Sony', 'Dell', 'Logitech', 'Rolex', 'Gucci'].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      {/* Price selector */}
                      <div className="space-y-2 pt-2 border-t border-gray-50">
                        <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price Range ($)</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filterMinPrice}
                            onChange={(e) => setFilterMinPrice(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-medium text-gray-700 font-mono"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filterMaxPrice}
                            onChange={(e) => setFilterMaxPrice(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-medium text-gray-700 font-mono"
                          />
                        </div>
                      </div>

                      {/* Rating filter */}
                      <div className="space-y-2 pt-2 border-t border-gray-50">
                        <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Customer Rating</h5>
                        <div className="flex flex-col gap-1 text-xs font-medium">
                          {[4.5, 4.0, 3.5].map(rating => {
                            const isSel = filterRating === rating;
                            return (
                              <button
                                key={rating}
                                onClick={() => setFilterRating(isSel ? null : rating)}
                                className={`flex items-center gap-1.5 py-0.5 text-left text-gray-600 hover:text-black transition-all ${isSel ? 'text-black font-bold pl-1 border-l-2 border-black' : ''}`}
                              >
                                <span className="text-black font-bold font-mono">{rating}★</span> & up
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Toggle Checkboxes */}
                      <div className="space-y-2.5 pt-3 border-t border-gray-50 flex flex-col">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 select-none">
                          <input
                            type="checkbox"
                            checked={filterInStock}
                            onChange={(e) => setFilterInStock(e.target.checked)}
                            className="rounded border-gray-350 text-black focus:ring-black h-4 w-4 accent-black cursor-pointer"
                          />
                          <span>In Stock Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 select-none">
                          <input
                            type="checkbox"
                            checked={filterFreeDelivery}
                            onChange={(e) => setFilterFreeDelivery(e.target.checked)}
                            className="rounded border-gray-350 text-black focus:ring-black h-4 w-4 accent-black cursor-pointer"
                          />
                          <span>Complimentary Shipping</span>
                        </label>
                      </div>
                    </div>

                    {/* PLP PRODUCTS CONTENT LISTING (3 Columns) */}
                    <div className="lg:col-span-3 space-y-6">
                      {/* Header toolbar */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-4 shadow-xs text-left">
                        <div className="space-y-0.5">
                          <h2 className="text-base font-bold tracking-tight text-gray-900 leading-snug">
                            {getRouteTitle(route)}
                          </h2>
                          <p className="text-[11px] text-gray-400 font-medium">
                            Showing {plpProducts.length > 0 ? plpOffset + 1 : 0}–{Math.min(plpOffset + plpProducts.length, plpTotal)} of {plpTotal} refined items
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-750 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Filter className="h-3.5 w-3.5 text-gray-500" />
                            {mobileFiltersOpen ? 'Hide Filters' : 'Filters & Categories'}
                          </button>

                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hidden sm:inline">Sort By</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-750 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                          >
                            <option value="popularity">Most Popular</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="newest">New Releases</option>
                          </select>
                        </div>
                      </div>

                      {/* Active filter tags */}
                      {(filterBrand || filterMinPrice || filterMaxPrice || filterRating || filterInStock || filterFreeDelivery) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Active filters:</span>
                          {filterBrand && (
                            <span className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1 font-semibold text-gray-700 flex items-center gap-1">
                              Brand: {filterBrand}
                              <button onClick={() => setFilterBrand('')} className="hover:text-black font-bold p-0.5 ml-1">×</button>
                            </span>
                          )}
                          {filterMinPrice && (
                            <span className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1 font-semibold text-gray-700 flex items-center gap-1 font-mono">
                              Min: ${filterMinPrice}
                              <button onClick={() => setFilterMinPrice('')} className="hover:text-black font-bold p-0.5 ml-1">×</button>
                            </span>
                          )}
                          {filterMaxPrice && (
                            <span className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1 font-semibold text-gray-700 flex items-center gap-1 font-mono">
                              Max: ${filterMaxPrice}
                              <button onClick={() => setFilterMaxPrice('')} className="hover:text-black font-bold p-0.5 ml-1">×</button>
                            </span>
                          )}
                          {filterRating && (
                            <span className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1 font-semibold text-gray-700 flex items-center gap-1 font-mono">
                              Rating: {filterRating}★+
                              <button onClick={() => setFilterRating(null)} className="hover:text-black font-bold p-0.5 ml-1">×</button>
                            </span>
                          )}
                          {filterInStock && (
                            <span className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1 font-semibold text-gray-700 flex items-center gap-1">
                              In Stock Only
                              <button onClick={() => setFilterInStock(false)} className="hover:text-black font-bold p-0.5 ml-1">×</button>
                            </span>
                          )}
                          {filterFreeDelivery && (
                            <span className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1 font-semibold text-gray-700 flex items-center gap-1">
                              Free Shipping
                              <button onClick={() => setFilterFreeDelivery(false)} className="hover:text-black font-bold p-0.5 ml-1">×</button>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Products Grid Content */}
                      {plpLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[1, 2, 3, 4, 5, 6].map((x) => (
                            <div key={x} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 animate-pulse text-left">
                              <div className="bg-gray-100 rounded-xl h-44 w-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                                <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                <div className="h-5 bg-gray-100 rounded w-1/4"></div>
                                <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : plpProducts.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-2xl py-20 text-center text-gray-450">
                          <AlertTriangle className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                          <h4 className="text-sm font-bold text-black mb-1">No matches found in curations</h4>
                          <p className="text-xs max-w-xs mx-auto leading-normal text-gray-500">
                            No products found matching your active filter criteria. Adjust your slider price or choose another brand.
                          </p>
                          <button
                            onClick={() => {
                              setFilterBrand('');
                              setFilterMinPrice('');
                              setFilterMaxPrice('');
                              setFilterRating(null);
                              setFilterInStock(false);
                              setFilterFreeDelivery(false);
                            }}
                            className="mt-4 bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
                          >
                            Reset Filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {plpProducts.map((p) => {
                            const isOutOfStock = p.stock === 0;
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleOpenProductDetails(p)}
                                onMouseEnter={() => setHoveredCardId(p.id)}
                                onMouseLeave={() => setHoveredCardId(null)}
                                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-gray-200 transition-all duration-300 cursor-pointer flex flex-col group relative text-left"
                              >
                                {p.rating >= 4.8 && (
                                  <span className="absolute top-3 left-3 bg-white border border-gray-250 text-black text-[9px] font-bold px-2.5 py-0.5 rounded-full z-20 uppercase shadow-xs">
                                    Highly Rated
                                  </span>
                                )}

                                <div className="w-full h-[200px] bg-gray-50 overflow-hidden relative border-b border-gray-100 flex items-center justify-center p-4">
                                  <img
                                    src={hoveredCardId === p.id ? getSecondaryImage(p.image) : p.image}
                                    alt={p.name}
                                    data-category={p.category}
                                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103 grayscale-[8%]"
                                    referrerPolicy="no-referrer"
                                  />
                                  {isOutOfStock && (
                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                                      <span className="text-xs font-extrabold tracking-wider bg-black text-white px-3 py-1.5 rounded-lg uppercase">
                                        Temporarily Sold Out
                                      </span>
                                    </div>
                                  )}

                                  {/* Quick action Hover overlays */}
                                  <div className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setWishlisted(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                                      }}
                                      className={`p-1.5 rounded-full border shadow-sm transition-colors ${
                                        wishlisted[p.id] ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:text-black'
                                      }`}
                                      title={wishlisted[p.id] ? "Remove from Wishlist" : "Add to Wishlist"}
                                    >
                                      <Heart className="h-3.5 w-3.5" fill={wishlisted[p.id] ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCompared(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                                      }}
                                      className={`p-1.5 rounded-full border shadow-sm transition-colors ${
                                        compared[p.id] ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:text-black'
                                      }`}
                                      title={compared[p.id] ? "Remove from Comparison" : "Compare Specifications"}
                                    >
                                      <GitCompare className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenProductDetails(p);
                                      }}
                                      className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-black shadow-sm transition-colors"
                                      title="Quick View"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(`${window.location.origin}/product/${p.id}`);
                                        setShareToast(true);
                                        setTimeout(() => setShareToast(false), 2000);
                                      }}
                                      className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-black shadow-sm transition-colors"
                                      title="Share Link"
                                    >
                                      <Share2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        {p.brand}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-black">{p.rating}</span>
                                        <span className="text-black text-[10px]">★</span>
                                      </div>
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 group-hover:underline leading-snug line-clamp-1">
                                      {p.name}
                                    </h4>
                                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                                      {p.description}
                                    </p>

                                    {/* Color & size variants preview */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                      {(p.variants?.colors || ['Default']).slice(0, 3).map((col, idx) => (
                                        <span 
                                          key={idx} 
                                          className="h-2.5 w-2.5 rounded-full border border-gray-300 block shadow-xs" 
                                          style={{ backgroundColor: col.toLowerCase() === 'default' ? '#94a3b8' : col.toLowerCase() }} 
                                          title={col}
                                        />
                                      ))}
                                      <span className="text-[9px] text-gray-400 font-bold font-mono uppercase ml-1">
                                        {(p.variants?.sizes || ['Standard']).slice(0, 2).join('/')}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-base font-semibold text-black font-mono">
                                      {formatUserCurrency(p.price)}
                                    </span>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isOutOfStock) onAddProductToCart(p);
                                      }}
                                      disabled={isOutOfStock}
                                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                                        isOutOfStock
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          : 'bg-black text-white hover:bg-gray-800'
                                      }`}
                                    >
                                      Add to Bag
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Pagination Controls */}
                      {plpTotal > plpLimit && (
                        <div className="flex items-center justify-between border-t border-gray-100 pt-6 font-medium">
                          <button
                            onClick={() => {
                              const nextOffset = Math.max(0, plpOffset - plpLimit);
                              setPlpOffset(nextOffset);
                              fetchPlpData(route, nextOffset, false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={plpOffset === 0}
                            className="bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-40 disabled:hover:bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                          >
                            ← Previous Page
                          </button>

                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: Math.min(8, Math.ceil(plpTotal / plpLimit)) }).map((_, pageIdx) => {
                              const targetOffset = pageIdx * plpLimit;
                              const isCurrent = targetOffset === plpOffset;
                              return (
                                <button
                                  key={pageIdx}
                                  onClick={() => {
                                    setPlpOffset(targetOffset);
                                    fetchPlpData(route, targetOffset, false);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className={`h-8 w-8 text-xs font-bold font-mono rounded-lg transition-all ${
                                    isCurrent
                                      ? 'bg-black text-white'
                                      : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700'
                                  }`}
                                >
                                  {pageIdx + 1}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => {
                              const nextOffset = plpOffset + plpLimit;
                              setPlpOffset(nextOffset);
                              fetchPlpData(route, nextOffset, false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={plpOffset + plpLimit >= plpTotal}
                            className="bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-40 disabled:hover:bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                          >
                            Next Page →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CURATED RECENTLY VIEWED ITEMS */}
              {recentlyViewed.length > 0 && (
                <div className="flex flex-col gap-4 text-left border-t border-gray-100 pt-10">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Recently Viewed Items
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {recentlyViewed.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handleOpenProductDetails(p)}
                        className="bg-white border border-gray-100 p-3 rounded-xl cursor-pointer hover:border-gray-300 transition-all text-left flex flex-col gap-2"
                      >
                        <img src={p.image} alt={p.name} className="w-full h-24 object-cover rounded-lg border border-gray-50 grayscale-[10%]" referrerPolicy="no-referrer" />
                        <div>
                          <h5 className="text-xs font-bold text-gray-900 truncate">{p.name}</h5>
                          <span className="text-xs font-semibold text-black font-mono block mt-1">${p.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
      ) : (
        /* ========================================= */
        /* PREMIUM INLINE PRODUCT DETAIL VIEW (PRODUCT PAGE) */
        /* ========================================= */
        <div className="flex flex-col gap-8 animate-fadeIn text-left">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium pb-4 border-b border-gray-100 select-none">
            <span className="hover:text-black cursor-pointer transition-colors" onClick={handleCloseProductDetails}>Home</span>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="hover:text-black cursor-pointer transition-colors" onClick={handleCloseProductDetails}>Curated Collections</span>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="hover:text-black cursor-pointer transition-colors" onClick={() => { handleCategorySelect(detailProduct.category); handleCloseProductDetails(); }}>{detailProduct.category}</span>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="text-gray-900 font-semibold truncate">{detailProduct.name}</span>
          </div>

          {/* Action and Toast Bar */}
          <div className="flex items-center justify-between">
            <button 
              onClick={handleCloseProductDetails}
              className="flex items-center gap-1 text-xs font-bold text-black uppercase tracking-wider hover:underline transition-all select-none"
            >
              ← Back to Curated Catalog
            </button>
            {shareToast && (
              <span className="text-[10px] font-bold bg-black text-white px-3 py-1.5 rounded-lg shadow-sm">
                Copied link to clipboard!
              </span>
            )}
          </div>

          {/* Main Product Frame Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* 1. LEFT GALLERY PANEL (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
              {/* Thumbnails (Vertical layout) */}
              <div className="flex flex-row md:flex-col gap-2 flex-shrink-0 overflow-x-auto select-none">
                {[
                  { type: 'Main', icon: <ShoppingBag className="h-4 w-4" />, label: 'Standard Angle', img: detailProduct.image },
                  { type: 'Lifestyle', icon: <Sparkles className="h-4 w-4" />, label: 'Lifestyle View', img: getBundleAccessories(detailProduct)[0].image },
                  { type: '360°', icon: <Award className="h-4 w-4" />, label: '360° Rotate', img: detailProduct.image },
                  { type: 'Video', icon: <Play className="h-4 w-4" />, label: 'Watch Video', img: getBundleAccessories(detailProduct)[1].image }
                ].map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveGalleryIndex(idx); setIsVideoPlaying(false); }}
                    className={`h-[72px] w-[72px] rounded-xl bg-white border p-1.5 flex flex-col items-center justify-between text-[8px] font-bold transition-all relative ${
                      activeGalleryIndex === idx ? 'border-black ring-1 ring-black' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={thumb.img} alt={thumb.label} className="h-8 w-8 object-contain rounded-md grayscale-[10%]" referrerPolicy="no-referrer" />
                    <span className="text-[7px] text-gray-500 uppercase tracking-widest">{thumb.type}</span>
                  </button>
                ))}
              </div>

              {/* Large Active Stage */}
              <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden relative p-6 h-[460px] flex flex-col items-center justify-center select-none shadow-xs">
                
                {activeGalleryIndex === 0 || activeGalleryIndex === 1 ? (
                  /* Hover Image Zoom view */
                  <div 
                    onMouseMove={(e) => {
                      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - left) / width) * 100;
                      const y = ((e.clientY - top) / height) * 100;
                      setZoomPos({ x, y });
                    }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in"
                  >
                    <img 
                      src={activeGalleryIndex === 0 ? detailProduct.image : getBundleAccessories(detailProduct)[0].image} 
                      alt={detailProduct.name} 
                      style={{
                        transform: isHovering ? 'scale(1.8)' : 'scale(1)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transition: isHovering ? 'none' : 'transform 0.2s ease-out'
                      }}
                      className="max-h-full max-w-full object-contain p-4 grayscale-[5%]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-3 right-3 text-[9px] text-gray-400 font-bold bg-gray-50/80 px-2.5 py-1 rounded-full border border-gray-100 uppercase tracking-wider">
                      Hover to Magnify
                    </span>
                  </div>
                ) : activeGalleryIndex === 2 ? (
                  /* 360° rotation viewer */
                  <div className="w-full h-full flex flex-col items-center justify-between p-4">
                    <span className="text-[9px] bg-black text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      360° Interactive Sphere
                    </span>
                    
                    <div className="relative w-full h-[280px] flex items-center justify-center">
                      <img 
                        src={detailProduct.image} 
                        alt={detailProduct.name}
                        style={{
                          transform: `rotateY(${rotationAngle}deg)`,
                          filter: `hue-rotate(${rotationAngle / 3}deg) grayscale(5%)`
                        }}
                        className="max-h-full max-w-full object-contain p-4 transition-all duration-100"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="w-full max-w-sm space-y-2">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span>Drag Slider to Spin</span>
                        <span className="font-mono">{rotationAngle}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        value={rotationAngle} 
                        onChange={(e) => setRotationAngle(Number(e.target.value))} 
                        className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black" 
                      />
                    </div>
                  </div>
                ) : (
                  /* Premium Simulated Video Player */
                  <div className="w-full h-full flex flex-col items-center justify-center relative bg-gray-50/50 p-6 rounded-xl">
                    {!isVideoPlaying ? (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div 
                          onClick={() => setIsVideoPlaying(true)}
                          className="h-16 w-16 rounded-full bg-black text-white hover:bg-gray-800 flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105"
                        >
                          <Play className="h-6 w-6 ml-1 text-white fill-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Watch Design Assembly Video</h4>
                          <p className="text-[11px] text-gray-500 mt-1 max-w-xs leading-relaxed">
                            Experience a cinematic overview of premium tactile switches, acoustics mechanics, and structural materials.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col justify-between items-center p-4 bg-black text-white rounded-xl overflow-hidden relative">
                        <span className="absolute top-4 left-4 text-[9px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          LIVE LOOPING
                        </span>
                        
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                          {/* Audio Soundwave Simulation */}
                          <div className="flex items-center gap-1 h-14">
                            {[0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0.95, 0.6, 0.3, 0.5, 0.8, 0.4].map((h, i) => (
                              <motion.div 
                                key={i} 
                                animate={{ height: [12, h * 56, 12] }}
                                transition={{ repeat: Infinity, duration: 1 + i * 0.08, ease: 'easeInOut' }}
                                className="w-1 bg-white rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Acoustics & Materials Analysis (0:45)</span>
                        </div>

                        <button 
                          onClick={() => setIsVideoPlaying(false)}
                          className="text-[10px] text-gray-400 hover:text-white font-bold uppercase tracking-wider underline cursor-pointer"
                        >
                          Reset player
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. RIGHT PURCHASE INFO COLUMN (5 Columns) */}
            <div className="lg:col-span-5 space-y-6 bg-white p-6 md:p-8 border border-gray-100 rounded-2xl shadow-xs">
              
              {/* Brand & Title */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] block">
                  {detailProduct.brand} Premium
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-snug">
                  {detailProduct.name}
                </h2>
                
                {/* Stars and Ratings Summary */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-2 py-1 rounded">
                    <span className="text-black font-bold font-mono">{detailProduct.rating}</span>
                    {renderStars(detailProduct.rating)}
                  </div>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={() => { setProductPageTab('reviews'); document.getElementById('product-tabs-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="text-gray-400 hover:text-black font-semibold hover:underline"
                  >
                    {detailProduct.reviewsCount} verified reviews
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={() => { setProductPageTab('faq'); document.getElementById('product-tabs-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="text-gray-400 hover:text-black font-semibold hover:underline"
                  >
                    12 support FAQs
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Pricing Box */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-black font-mono">
                    {formatUserCurrency(detailProduct.price)}
                  </span>
                  <span className="text-xs text-gray-400 line-through font-mono">
                    {formatUserCurrency(detailProduct.price * 1.15)}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Save 15%
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  All taxes included. Interest-free payments of {formatUserCurrency(detailProduct.price / 3)}/mo available at checkout with Ocean Card.
                </p>
              </div>

              {/* Dashboard Coupon Ticket */}
              <div className="border border-dashed border-gray-200 bg-gray-50/50 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="text-left space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">MEMBER BENEFIT</span>
                  <span className="text-xs font-bold text-gray-800 block">Save 15% on your order</span>
                  <span className="text-[10px] text-gray-500 block">Copy & auto-apply coupon code:</span>
                  <span className="text-[10px] font-mono font-bold text-black bg-white px-2 py-0.5 rounded border border-gray-200 inline-block">OCEAN15</span>
                </div>
                <button 
                  onClick={() => {
                    setCouponCode('OCEAN15');
                    handleApplyCoupon();
                    setShareToast(true);
                    setTimeout(() => setShareToast(false), 2000);
                  }}
                  className="bg-black hover:bg-gray-800 text-white font-bold text-[9px] px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider"
                >
                  Apply Code
                </button>
              </div>

              {/* Delivery Estimate Indicators */}
              <div className="space-y-2.5 text-xs bg-gray-50/30 p-4 rounded-xl border border-gray-100">
                <div className="flex items-start gap-2.5">
                  <Truck className="h-4 w-4 text-black mt-0.5" />
                  <div>
                    <span className="text-black font-bold block">FREE Priority Express Courier</span>
                    <span className="text-gray-400 text-[11px] block mt-0.5">
                      Delivery tomorrow, July 13th. Order within <strong className="font-mono text-black font-semibold">{countdown.hours} hrs {countdown.minutes} mins</strong>
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-black" />
                  <span className="text-gray-600 font-semibold text-[11px]">3-Year Ocean Extended Warranty Included</span>
                </div>
              </div>

              {/* Dynamic Stock Indicator */}
              <div className="text-xs">
                {detailProduct.stock < 20 ? (
                  <p className="text-amber-600 font-bold flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="h-4 w-4" /> Only {detailProduct.stock} left in stock - order soon!
                  </p>
                ) : (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> ✓ In Stock, processed within 2 hours.
                  </p>
                )}
              </div>

              {/* Variant selectors (Colors & Sizes) */}
              <div className="space-y-4 pt-1 text-xs">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Select Finish: <strong className="text-black font-semibold">{selectedColor}</strong>
                  </label>
                  <div className="flex gap-2">
                    {(detailProduct.variants?.colors || []).map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          selectedColor === color 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Dimensions Fitting: <strong className="text-black font-semibold">{selectedSize}</strong>
                  </label>
                  <div className="flex gap-2">
                    {(detailProduct.variants?.sizes || []).map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          selectedSize === size 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity and Checkout buttons */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Qty:</span>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1.5 bg-white">
                    <button 
                      onClick={() => setSelectedQty(prev => Math.max(1, prev - 1))}
                      className="p-1 rounded bg-gray-50 hover:bg-gray-150 border border-gray-100"
                    >
                      <Minus className="h-2.5 w-2.5 text-gray-500" />
                    </button>
                    <span className="text-xs font-bold text-gray-800 px-2 font-mono">{selectedQty}</span>
                    <button 
                      onClick={() => setSelectedQty(prev => prev + 1)}
                      className="p-1 rounded bg-gray-50 hover:bg-gray-150 border border-gray-100"
                    >
                      <Plus className="h-2.5 w-2.5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 select-none">
                  <button
                    onClick={() => {
                      if (detailProduct.stock > 0) {
                        for (let i = 0; i < selectedQty; i++) {
                          onAddProductToCart(detailProduct);
                        }
                        setIsCartOpen(true);
                      }
                    }}
                    disabled={detailProduct.stock === 0}
                    className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-150 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Bag
                  </button>
                  
                  <button
                    onClick={() => {
                      if (detailProduct.stock > 0) {
                        for (let i = 0; i < selectedQty; i++) {
                          onAddProductToCart(detailProduct);
                        }
                        setIsCheckingOut(true);
                        setIsCartOpen(true);
                      }
                    }}
                    disabled={detailProduct.stock === 0}
                    className="w-full bg-white border border-black hover:bg-gray-50 text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center"
                  >
                    Instant Buy Now
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 select-none text-xs">
                  {/* Wishlist toggle */}
                  <button 
                    onClick={() => setWishlisted(prev => ({ ...prev, [detailProduct.id]: !prev[detailProduct.id] }))}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-black font-semibold transition-all"
                  >
                    <Heart className={`h-4 w-4 transition-all ${wishlisted[detailProduct.id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    <span>{wishlisted[detailProduct.id] ? 'Saved to wishlists' : 'Add to Wishlist'}</span>
                  </button>

                  {/* Share link */}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setShareToast(true);
                      setTimeout(() => setShareToast(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-black font-semibold transition-all"
                  >
                    <Share2 className="h-4 w-4 text-gray-400" />
                    <span>Share Product</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================= */}
          {/* FREQUENTLY BOUGHT TOGETHER (COMBO BUNDLER) */}
          {/* ========================================= */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3">Frequently Bought Together</h3>
            
            <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
              <div className="flex flex-wrap items-center gap-4 text-left">
                
                {/* Item 1 (This Product) */}
                <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100/40">
                  <input 
                    type="checkbox" 
                    checked={bundleChecked[0]} 
                    onChange={() => setBundleChecked(prev => [!prev[0], prev[1], prev[2]])}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer" 
                  />
                  <img src={detailProduct.image} alt={detailProduct.name} className="h-12 w-12 object-contain bg-white rounded border border-gray-100" referrerPolicy="no-referrer" />
                  <div>
                    <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">CURRENT ITEM</span>
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[120px] block">{detailProduct.name}</span>
                    <span className="text-xs font-mono font-bold text-black">${detailProduct.price.toFixed(2)}</span>
                  </div>
                </div>

                <span className="text-lg font-bold text-gray-300 select-none">+</span>

                {/* Companion Accessory 1 */}
                <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100/40">
                  <input 
                    type="checkbox" 
                    checked={bundleChecked[1]} 
                    onChange={() => setBundleChecked(prev => [prev[0], !prev[1], prev[2]])}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer" 
                  />
                  <img src={getBundleAccessories(detailProduct)[0].image} alt="Accessory 1" className="h-12 w-12 object-contain bg-white rounded border border-gray-100" referrerPolicy="no-referrer" />
                  <div>
                    <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">RECOMMENDED</span>
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[120px] block">{getBundleAccessories(detailProduct)[0].name}</span>
                    <span className="text-xs font-mono font-bold text-black">${getBundleAccessories(detailProduct)[0].price.toFixed(2)}</span>
                  </div>
                </div>

                <span className="text-lg font-bold text-gray-300 select-none">+</span>

                {/* Companion Accessory 2 */}
                <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100/40">
                  <input 
                    type="checkbox" 
                    checked={bundleChecked[2]} 
                    onChange={() => setBundleChecked(prev => [prev[0], prev[1], !prev[2]])}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer" 
                  />
                  <img src={getBundleAccessories(detailProduct)[1].image} alt="Accessory 2" className="h-12 w-12 object-contain bg-white rounded border border-gray-100" referrerPolicy="no-referrer" />
                  <div>
                    <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">RECOMMENDED</span>
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[120px] block">{getBundleAccessories(detailProduct)[1].name}</span>
                    <span className="text-xs font-mono font-bold text-black">${getBundleAccessories(detailProduct)[1].price.toFixed(2)}</span>
                  </div>
                </div>

              </div>

              {/* Bundle action buy box */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3 w-full lg:w-64 text-left select-none flex-shrink-0">
                <div className="text-xs">
                  <span className="text-gray-500 font-medium">Selected Bundle Price:</span>
                  <div className="text-2xl font-extrabold text-black font-mono mt-0.5">
                    ${(
                      (bundleChecked[0] ? detailProduct.price : 0) +
                      (bundleChecked[1] ? getBundleAccessories(detailProduct)[0].price : 0) +
                      (bundleChecked[2] ? getBundleAccessories(detailProduct)[1].price : 0)
                    ).toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    let addedAny = false;
                    if (bundleChecked[0]) { onAddProductToCart(detailProduct); addedAny = true; }
                    
                    const accs = getBundleAccessories(detailProduct);
                    if (bundleChecked[1]) {
                      const companion1: Product = {
                        id: `${detailProduct.id}-acc-1`,
                        name: accs[0].name,
                        description: `Companion accessory for ${detailProduct.name}`,
                        price: accs[0].price,
                        rating: 4.8,
                        image: accs[0].image,
                        category: detailProduct.category,
                        subcategory: 'Accessories',
                        stock: 100,
                        brand: 'Ocean',
                        variants: { colors: ['Standard'], sizes: ['Standard'] },
                        specifications: { Compatibility: detailProduct.name },
                        sellerId: detailProduct.sellerId,
                        reviewsCount: 15
                      };
                      onAddProductToCart(companion1);
                      addedAny = true;
                    }
                    if (bundleChecked[2]) {
                      const companion2: Product = {
                        id: `${detailProduct.id}-acc-2`,
                        name: accs[1].name,
                        description: `Companion accessory for ${detailProduct.name}`,
                        price: accs[1].price,
                        rating: 4.8,
                        image: accs[1].image,
                        category: detailProduct.category,
                        subcategory: 'Accessories',
                        stock: 100,
                        brand: 'Ocean',
                        variants: { colors: ['Standard'], sizes: ['Standard'] },
                        specifications: { Compatibility: detailProduct.name },
                        sellerId: detailProduct.sellerId,
                        reviewsCount: 15
                      };
                      onAddProductToCart(companion2);
                      addedAny = true;
                    }

                    if (addedAny) setIsCartOpen(true);
                  }}
                  disabled={!bundleChecked[0] && !bundleChecked[1] && !bundleChecked[2]}
                  className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  Add Bundle to Bag
                </button>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* DETAILS TABS SECTION (Description, Specifications, Reviews, FAQ) */}
          {/* ========================================= */}
          <div id="product-tabs-section" className="bg-white border border-gray-100 rounded-2xl overflow-hidden select-none shadow-xs">
            
            {/* Tabs selection header */}
            <div className="flex flex-wrap border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {[
                { id: 'desc', label: 'Description' },
                { id: 'specs', label: 'Technical Specifications' },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
                { id: 'faq', label: 'Questions & Answers' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProductPageTab(tab.id as any)}
                  className={`px-6 py-4 border-r border-gray-100 transition-all ${
                    productPageTab === tab.id ? 'bg-white text-black border-b-2 border-b-black font-extrabold' : 'hover:bg-gray-100/55 hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8 text-left">
              
              {/* TAB 1: PRODUCT DESCRIPTION */}
              {productPageTab === 'desc' && (
                <div className="space-y-4 max-w-3xl leading-relaxed text-gray-600 text-xs">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider">Premium Engineering Design</h4>
                  <p>{detailProduct.description}</p>
                  <p>
                    Engineered in the Ocean Acoustic & Robotics Laboratories to ensure total compliance with international premium ergonomics. Constructed with recyclable carbon neutrality offsets, luxury metals, and anodized composites.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-[11px] font-medium text-gray-500">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-black" />
                      <span>Carbon Neutral Materials & Zero Toxicity</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
                      <Award className="h-5 w-5 text-black" />
                      <span>Precision Machined Aerospace Grade Tolerances</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL SPECIFICATIONS GRID */}
              {productPageTab === 'specs' && (
                <div className="space-y-4 max-w-2xl text-xs">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider">Technical Specifications</h4>
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                    {Object.entries(detailProduct.specifications).map(([key, value], idx) => (
                      <div key={idx} className={`grid grid-cols-3 p-3.5 ${idx % 2 === 0 ? 'bg-gray-50/40' : 'bg-white'} border-b border-gray-100 last:border-0`}>
                        <span className="font-bold text-gray-500 col-span-1">{key}</span>
                        <span className="text-gray-700 font-semibold col-span-2">{formatSpecValue(key, String(value))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: VERIFIED REVIEWS INTUITIVE CARD */}
              {productPageTab === 'reviews' && (
                <div className="space-y-8">
                  {/* Interactive Star Distribution & Scorecard Header */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-gray-100 pb-8">
                    <div className="md:col-span-4 text-center space-y-2">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">QUALITY GRADE INDEX</span>
                      <span className="text-6xl font-extrabold text-black font-mono tracking-tight">{detailProduct.rating}</span>
                      <div className="flex justify-center">{renderStars(detailProduct.rating)}</div>
                      <span className="text-[11px] text-gray-400 font-medium block">Based on {reviews.length} authentic buyer reports</span>
                    </div>

                    {/* Star Rating Distribution progress bars */}
                    <div className="md:col-span-5 space-y-2 select-none">
                      {[
                        { stars: 5, pct: 75, count: 12 },
                        { stars: 4, pct: 15, count: 3 },
                        { stars: 3, pct: 5, count: 1 },
                        { stars: 2, pct: 3, count: 0 },
                        { stars: 1, pct: 2, count: 0 }
                      ].map((bar, i) => (
                        <div 
                          key={i} 
                          onClick={() => setReviewStarFilter(reviewStarFilter === bar.stars ? null : bar.stars)}
                          className={`flex items-center gap-3 text-xs cursor-pointer group p-1 rounded-md transition-all hover:bg-gray-50 ${
                            reviewStarFilter === bar.stars ? 'bg-gray-100 font-semibold text-black' : 'text-gray-500'
                          }`}
                        >
                          <span className="w-12 text-left font-semibold">{bar.stars} Star</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black" style={{ width: `${bar.pct}%` }}></div>
                          </div>
                          <span className="w-8 text-right font-mono text-[11px] text-gray-400 group-hover:text-black">{bar.pct}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Quality indicators from reviews summaries API */}
                    <div className="md:col-span-3 bg-gray-50/50 border border-gray-100 p-4 rounded-xl text-xs space-y-2">
                      <h5 className="font-bold text-black uppercase tracking-wider text-[10px]">AI Reviews Digest Summary</h5>
                      {isLoadingAiSummary ? (
                        <p className="text-[11px] text-gray-400 animate-pulse">Scanning summaries...</p>
                      ) : aiSummary ? (
                        <p className="italic text-gray-500 text-[11px] leading-relaxed">"{aiSummary.summary}"</p>
                      ) : (
                        <p className="text-gray-400 text-[11px]">Best-in-class comfort and reliability metrics reported.</p>
                      )}
                    </div>
                  </div>

                  {/* Displaying verified buyer experiences */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                        <Filter className="h-3.5 w-3.5" /> Buyer Experiences 
                        {reviewStarFilter && <span className="bg-black text-white text-[9px] px-2 py-0.5 rounded-full">Only {reviewStarFilter}-Star</span>}
                      </h4>
                      {reviewStarFilter && (
                        <button onClick={() => setReviewStarFilter(null)} className="text-[10px] text-gray-400 hover:text-black font-bold uppercase tracking-wider">
                          Clear filter
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                      {reviews
                        .filter(r => !reviewStarFilter || r.rating === reviewStarFilter)
                        .length === 0 ? (
                          <p className="text-xs text-gray-400 py-6 text-center">No buyer comments found matching your selected rating filter.</p>
                        ) : (
                          reviews
                            .filter(r => !reviewStarFilter || r.rating === reviewStarFilter)
                            .map((r) => (
                              <div key={r.id} className="p-4 bg-white border border-gray-100 rounded-xl space-y-2 shadow-xs text-xs">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-black">
                                      {r.userName.charAt(0)}
                                    </div>
                                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                      {r.userName} 
                                      {r.verified && (
                                        <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                          <ShieldCheck className="h-3 w-3" /> Verified Buyer
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-400">{r.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5">{renderStars(r.rating)}</div>
                                <p className="text-gray-600 leading-relaxed font-medium">"{r.comment}"</p>
                              </div>
                            ))
                        )}
                    </div>

                    {/* Submission Form */}
                    <form onSubmit={handleSubmitReview} className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 max-w-xl text-xs">
                      <h5 className="text-xs font-bold text-black uppercase tracking-wider">Document Your Experience</h5>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium">Your Rating:</span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setNewRating(star)}
                              className="text-lg transition-transform hover:scale-110 focus:outline-none"
                            >
                              <span className={star <= newRating ? 'text-black font-semibold' : 'text-gray-200'}>★</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <textarea
                          rows={2}
                          required
                          placeholder="Describe product weight, tactile feedback, switch acoustics, and materials finish..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      {reviewAlert && (
                        <div className={`p-3 rounded-lg text-xs font-semibold ${reviewAlert.isFake ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                          {reviewAlert.isFake 
                            ? `Note: Review scanning filters flagged uncharacteristic phrasing. Retained for evaluation.` 
                            : `Review logged successfully in the verified buyer registry.`}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-lg transition-all"
                      >
                        Submit Experience Report
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: INTERACTIVE Q&A SUPPORT */}
              {productPageTab === 'faq' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 select-none">
                    <div>
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider">Customer Questions & Answers</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Explore existing replies or ask a customized product question.</p>
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search questions..." 
                        value={faqSearchQuery} 
                        onChange={(e) => setFaqSearchQuery(e.target.value)}
                        className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-black w-56 transition-all"
                      />
                      <Search className="absolute left-2.5 top-2 text-gray-400 h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Expandable FAQs Accordion */}
                  <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-2 text-xs leading-relaxed">
                    {[
                      { q: 'Is the device compatible with macOS and Windows natively?', a: 'Yes! All Ocean products are natively plug-and-play across macOS, Windows, iPadOS, iOS, Linux, and Android. No software downloads required.' },
                      { q: 'What is the exact battery life under heavy Active Noise Cancellation (ANC)?', a: 'Under continuous maximum active cancellation, the premium high-excursion cell delivers up to 38 hours of high-fidelity playback. Turning ANC off extends battery life up to 45 hours.' },
                      { q: 'Where do Ocean orders ship from and what are the delivery charges?', a: 'All items are processed in our advanced automated carbon-offset hubs in Seattle and Rotterdam, and shipped via expedited courier. Shipping is complimentary on orders above $100.' },
                      { q: 'Does this item include a standard hardware warranty?', a: 'Every purchase from our official Ocean storefront includes a 3-Year Complimentary Extended Hardware Warranty with priority repairs.' }
                    ]
                      .concat(customFaqs[detailProduct.id] || [])
                      .filter(f => !faqSearchQuery || f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || f.a.toLowerCase().includes(faqSearchQuery.toLowerCase()))
                      .map((faq, i) => (
                        <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2 shadow-xs">
                          <div className="flex gap-2 items-start text-black">
                            <span className="bg-black text-white rounded font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase flex-shrink-0 mt-0.5">Q</span>
                            <p className="font-bold text-gray-900">{faq.q}</p>
                          </div>
                          <div className="h-px bg-gray-200/50 my-1"></div>
                          <div className="flex gap-2 items-start text-gray-600">
                            <span className="bg-gray-200 text-gray-800 rounded font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase flex-shrink-0 mt-0.5">A</span>
                            <div className="font-medium">
                              <p>{faq.a}</p>
                              <span className="text-[10px] text-gray-400 block mt-1 font-semibold">Answered by Ocean Logistics Core Support</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {[
                      { q: 'Is the device compatible with macOS and Windows natively?', a: 'Yes! All Ocean products are natively plug-and-play across macOS, Windows, iPadOS, iOS, Linux, and Android. No software downloads required.' },
                      { q: 'What is the exact battery life under heavy Active Noise Cancellation (ANC)?', a: 'Under continuous maximum active cancellation, the premium high-excursion cell delivers up to 38 hours of high-fidelity playback. Turning ANC off extends battery life up to 45 hours.' },
                      { q: 'Where do Ocean orders ship from and what are the delivery charges?', a: 'All items are processed in our advanced automated carbon-offset hubs in Seattle and Rotterdam, and shipped via expedited courier. Shipping is complimentary on orders above $100.' },
                      { q: 'Does this item include a standard hardware warranty?', a: 'Every purchase from our official Ocean storefront includes a 3-Year Complimentary Extended Hardware Warranty with priority repairs.' }
                    ]
                      .concat(customFaqs[detailProduct.id] || [])
                      .filter(f => !faqSearchQuery || f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || f.a.toLowerCase().includes(faqSearchQuery.toLowerCase()))
                      .length === 0 && (
                        <p className="text-xs text-gray-400 py-4 text-center">No matching questions or support answers found.</p>
                      )}
                  </div>

                  {/* Ask a Question Interactive Area */}
                  <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl space-y-4 max-w-xl text-xs shadow-xs">
                    <h5 className="font-bold text-black uppercase tracking-wider">Ask a New Product Question</h5>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g., Does this headphone include an adapter for airline plugs?" 
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black font-medium text-gray-800 font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (!userQuestion.trim()) return;
                          setIsAsking(true);
                          
                          setTimeout(() => {
                            const ans = `Thank you for your question. Yes, the ${detailProduct.name} fully supports that configuration under official standard operation parameters. Full materials documentation is included in the premium case package.`;
                            const updated = customFaqs[detailProduct.id] || [];
                            setCustomFaqs(prev => ({
                              ...prev,
                              [detailProduct.id]: [...updated, { q: userQuestion, a: ans }]
                            }));
                            setUserQuestion('');
                            setIsAsking(false);
                          }, 1000);
                        }}
                        className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
                      >
                        Submit Question
                      </button>
                    </div>
                    {isAsking && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 animate-pulse font-semibold pl-1">
                        <span className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-gray-400"></span>
                        Analyzing question vocabulary to generate instant verified answer...
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Related Curated Carousel below */}
          <div className="flex flex-col gap-4 text-left border-t border-gray-100 pt-10 select-none">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Customers Also Bought (Related curations)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products
                .filter(x => x.id !== detailProduct.id)
                .slice(0, 4)
                .map(p => (
                  <div 
                    key={p.id}
                    onClick={() => {
                      handleOpenProductDetails(p);
                      document.getElementById('catalog-products-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white border border-gray-100 p-4 rounded-xl cursor-pointer hover:border-gray-200 hover:shadow-xs transition-all text-left flex flex-col gap-3 group"
                  >
                    <div className="w-full h-28 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain grayscale-[10%] group-hover:scale-102 transition-all" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">{p.brand}</span>
                      <h5 className="text-xs font-bold text-gray-900 group-hover:underline truncate mt-0.5">{p.name}</h5>
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-xs font-semibold text-black font-mono">${p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400 font-bold">Quick View →</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

    </div>
  )}

      {/* 2. ORDER HISTORY & LOGISTICS TRACKING VIEW */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          {/* Orders list */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-base text-black mb-1">
              Your Purchased Log
            </h3>
            {orders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
                <ShoppingBag className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => setActiveTab('shop')}
                  className="mt-2 text-xs font-bold text-black underline"
                >
                  Start shopping now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white border p-4 rounded-xl cursor-pointer transition-all ${
                        isSelected ? 'border-black shadow-xs bg-gray-50/10' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-xs font-bold text-black">{order.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-gray-100 text-black">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Placed: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium">
                          {order.items.reduce((acc, i) => acc + i.quantity, 0)} refined items
                        </span>
                        <span className="text-xs font-semibold text-black font-mono">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Details and Logistics Timeline Tracker */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 space-y-6">
                
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-150">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">ORDER REFERENCE</span>
                    <h2 className="font-mono text-lg font-bold text-black">{selectedOrder.id}</h2>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">TOTAL AMOUNT</span>
                    <h2 className="font-mono text-lg font-bold text-black">${selectedOrder.total.toFixed(2)}</h2>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">DELIVERY CARRIER</span>
                    <h2 className="text-sm font-semibold text-gray-800">Standard Eco Logistics</h2>
                  </div>
                </div>

                {/* Animated Order Status Progress Bar and Milestones */}
                <OrderStatusTracker order={selectedOrder} onStatusUpdated={fetchOrders} />

                {/* Items in this order */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Package Inventory</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100 grayscale-[8%]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h5 className="font-bold text-xs text-gray-900 truncate">{item.name}</h5>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Color: {item.selectedColor} • Size: {item.selectedSize}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-bold text-gray-500 font-mono block">Qty: {item.quantity}</span>
                          <span className="text-xs font-semibold text-black font-mono block">${item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping address details */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery Destination</h4>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-left text-xs font-medium text-gray-700 leading-normal">
                      <p className="font-bold text-black">Vicky B. (Customer Residence)</p>
                      <p className="mt-1">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Vertical tracking timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logistics Milestones</h4>
                  <div className="relative pl-6 border-l border-gray-200 space-y-6">
                    {selectedOrder.timeline.map((event, idx) => {
                      const isLast = idx === selectedOrder.timeline.length - 1;
                      return (
                        <div key={idx} className="relative text-left">
                          {/* Dot marker */}
                          <div className={`absolute -left-[30px] top-1 h-4 w-4 rounded-full border-4 border-white flex items-center justify-center ${
                            isLast ? 'bg-black h-4 w-4 ring-2 ring-black/10' : 'bg-gray-300'
                          }`} />
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold uppercase tracking-wider ${isLast ? 'text-black' : 'text-gray-500'}`}>
                                {event.status}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl py-24 text-center text-gray-400">
                <ShoppingBag className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold">Select an order from the column list to inspect full timeline log.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SLIDE-OVER SIDEBAR SHOPPING CART (COMPREHENSIVE CHECKOUT PANEL) */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              
              {/* Overlay shadow */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="absolute inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
              />

              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.22 }}
                  className="pointer-events-auto w-screen max-w-md"
                >
                  <div className="flex h-full flex-col bg-white shadow-2xl overflow-y-auto">
                    
                    {/* Cart Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        Your Shopping Bag ({cartItemCount})
                      </h2>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="text-gray-400 hover:text-black p-1 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {checkoutSuccess ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="h-14 w-14 rounded-full bg-black flex items-center justify-center text-white">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-black">Order Placed Successfully</h3>
                        <p className="text-xs text-gray-400 leading-normal max-w-xs">
                          Your premium purchase has been validated and handed over to standard courier dispatch tracking. Redirecting...
                        </p>
                      </div>
                    ) : isCheckingOut ? (
                      
                      /* 4. CHECKOUT SCREEN */
                      <div className="flex-1 flex flex-col p-6 space-y-6">
                        <div className="flex items-center gap-2 text-left">
                          <button 
                            onClick={() => setIsCheckingOut(false)}
                            className="text-xs text-gray-400 hover:text-black font-semibold uppercase tracking-wider"
                          >
                            ← Back to Bag
                          </button>
                        </div>

                        <div className="text-left space-y-5">
                          <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                            Billing & Delivery Details
                          </h3>

                          {/* Address area */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Shipping Delivery Address
                            </label>
                            <textarea
                              rows={3}
                              placeholder="e.g. 123 Pine St, Apt 4B, Seattle, WA 98101"
                              value={checkoutAddress}
                              onChange={(e) => setCheckoutAddress(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4.5 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                            />
                          </div>

                          {/* Card details name */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Cardholder Full Name
                            </label>
                            <input
                              type="text"
                              placeholder="Vicky B."
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                            />
                          </div>

                          {/* Card number */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Credit or Debit Card Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="4242 4242 4242 4242"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                              />
                              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          {/* Order Summary box */}
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2 text-xs">
                            <div className="flex justify-between font-medium text-gray-500">
                              <span>Bag Subtotal</span>
                              <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
                            </div>
                            {appliedCoupon && (
                              <div className="flex justify-between font-medium text-black">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span className="font-mono">-${couponDiscount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium text-gray-500">
                              <span>Eco Shipping Delivery</span>
                              <span>{shippingFee === 0 ? 'Complimentary' : `$${shippingFee}`}</span>
                            </div>
                            <div className="h-px bg-gray-200 my-2"></div>
                            <div className="flex justify-between font-bold text-black text-sm">
                              <span>Total Payment</span>
                              <span className="font-mono">${cartTotal.toFixed(2)}</span>
                            </div>
                          </div>

                          {checkoutError && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" /> {checkoutError}
                            </p>
                          )}

                          <button
                            onClick={handleCheckout}
                            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
                          >
                            Authorize & Pay ${cartTotal.toFixed(2)}
                          </button>
                        </div>
                      </div>
                    ) : (
                      
                      /* 5. STANDARD CART INVENTORY SCREEN */
                      <div className="flex-1 flex flex-col justify-between">
                        {cart.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                            <ShoppingBag className="h-10 w-10 text-gray-300 mb-2" />
                            <p className="text-xs font-semibold">Your bag is empty.</p>
                            <button 
                              onClick={() => setIsCartOpen(false)}
                              className="mt-3 text-xs font-bold text-black underline"
                            >
                              Browse curate catalog
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            {cart.map((item, idx) => (
                              <div key={idx} className="flex gap-4 p-3.5 bg-gray-50/40 border border-gray-100 rounded-xl relative">
                                <button 
                                  onClick={() => handleRemoveFromCart(item.product.id)}
                                  className="absolute top-2 right-2 text-gray-300 hover:text-black p-0.5 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>

                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name} 
                                  className="w-16 h-16 rounded-lg object-cover border border-gray-100 flex-shrink-0 grayscale-[8%]"
                                  referrerPolicy="no-referrer"
                                />

                                <div className="flex-1 min-w-0 text-left space-y-1">
                                  <h4 className="font-bold text-xs text-gray-900 truncate pr-6">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-[10px] text-gray-400">
                                    Color: {item.selectedColor} • Size: {item.selectedSize}
                                  </p>
                                  <span className="text-xs font-bold text-black font-mono block">
                                    ${item.product.price}
                                  </span>

                                  <div className="flex items-center gap-2 mt-2">
                                    <button 
                                      onClick={() => handleUpdateCartQty(item.product.id, -1)}
                                      className="p-1 rounded bg-white hover:bg-gray-100 border border-gray-200"
                                    >
                                      <Minus className="h-2.5 w-2.5 text-gray-500" />
                                    </button>
                                    <span className="text-xs font-bold text-gray-800 px-1 font-mono">{item.quantity}</span>
                                    <button 
                                      onClick={() => handleUpdateCartQty(item.product.id, 1)}
                                      className="p-1 rounded bg-white hover:bg-gray-100 border border-gray-200"
                                    >
                                      <Plus className="h-2.5 w-2.5 text-gray-500" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {cart.length > 0 && (
                          <div className="border-t border-gray-100 p-6 space-y-4 bg-gray-50/30">
                            
                            {/* Free Shipping thresholds */}
                            {cartSubtotal < 100 ? (
                              <p className="text-[10px] text-gray-400 text-left font-semibold">
                                Spend <strong className="font-mono">${(100 - cartSubtotal).toFixed(2)}</strong> more to receive Complimentary priority courier delivery.
                              </p>
                            ) : (
                              <p className="text-[10px] text-emerald-600 text-left font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Your order qualifies for Complimentary shipping.
                              </p>
                            )}

                            {/* Applied Promo Code */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Promo Code (OCEAN15)"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                              />
                              <button 
                                onClick={handleApplyCoupon}
                                className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all"
                              >
                                Apply
                              </button>
                            </div>

                            {couponError && <p className="text-[10px] text-red-600 text-left font-semibold">{couponError}</p>}
                            {appliedCoupon && (
                              <p className="text-[10px] text-emerald-600 text-left font-bold">
                                Code applied: {appliedCoupon.code} ({appliedCoupon.description})
                              </p>
                            )}

                            {/* Subtotals & Totals summary */}
                            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                              <div className="flex justify-between font-medium text-gray-500">
                                <span>Bag Subtotal</span>
                                <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
                              </div>
                              {appliedCoupon && (
                                <div className="flex justify-between font-medium text-black">
                                  <span>Discount Applied</span>
                                  <span className="font-mono">-${couponDiscount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium text-gray-500">
                                <span>Shipping Logistics</span>
                                <span>{shippingFee === 0 ? 'Complimentary' : `$${shippingFee}`}</span>
                              </div>
                              <div className="h-px bg-gray-200 my-2"></div>
                              <div className="flex justify-between font-bold text-black text-sm">
                                <span>Estimated Total</span>
                                <span className="font-mono">${cartTotal.toFixed(2)}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (user?.isGuest || user?.id === 'guest') {
                                  if (onRequireLogin) onRequireLogin();
                                } else {
                                  setIsCheckingOut(true);
                                }
                              }}
                              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                            >
                              Proceed to Checkout
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. COMPREHENSIVE PRODUCT DETAILS MODAL (POPUP DIALOG VIEW) */}
      <AnimatePresence>
        {detailProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              
              {/* Overlay shadow */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseProductDetails}
                className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl flex flex-col md:flex-row h-auto max-h-[90vh] overflow-y-auto"
              >
                
                {/* Close Button */}
                <button
                  onClick={handleCloseProductDetails}
                  className="absolute right-4 top-4 text-gray-400 hover:text-black p-1 rounded-md z-30 transition-colors bg-white/80 backdrop-blur-sm"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Left side product image & variant visualizer */}
                <div className="w-full md:w-1/2 bg-gray-50/50 flex flex-col justify-center border-r border-gray-100 p-6 md:p-8">
                  <div className="w-full h-[320px] rounded-xl overflow-hidden bg-white border border-gray-100 shadow-xs relative">
                    <img 
                      src={detailProduct.image} 
                      alt={detailProduct.name} 
                      className="w-full h-full object-contain p-4 grayscale-[5%]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Specifications details sheet below image */}
                  <div className="mt-6 text-left space-y-3">
                    <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Technical Architecture Specifications
                    </h5>
                    <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                      {Object.entries(detailProduct.specifications).map(([key, value], idx) => (
                        <div key={idx} className={`grid grid-cols-3 p-2.5 ${idx % 2 === 0 ? 'bg-gray-50/40' : 'bg-white'} border-b border-gray-100 last:border-0`}>
                          <span className="font-semibold text-gray-500 col-span-1">{key}</span>
                          <span className="text-gray-700 col-span-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side product purchase controls & reviews list */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[90vh]">
                  
                  {/* Brand & Title */}
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">
                      {detailProduct.brand}
                    </span>
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
                      {detailProduct.name}
                    </h2>
                    
                    {/* Star Rating & Review counts */}
                    <div className="flex items-center gap-2">
                      {renderStars(detailProduct.rating)}
                      <span className="text-xs text-gray-400 font-medium">
                        ({detailProduct.reviewsCount} verified reviews)
                      </span>
                    </div>

                    <div className="h-px bg-gray-100 my-3"></div>

                    {/* Price and Stock */}
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-black font-mono">
                        ${detailProduct.price}
                      </span>
                      <span className={`text-xs font-semibold ${detailProduct.stock > 0 ? 'text-black' : 'text-red-500'}`}>
                        {detailProduct.stock > 0 ? `In Stock (${detailProduct.stock} units)` : 'Out of Stock'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed pt-2">
                      {detailProduct.description}
                    </p>
                  </div>

                  {/* Customizable Options Dropdown fields (Colors and Sizes) */}
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        Curated Colorway
                      </label>
                      <select 
                        value={selectedColor} 
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 w-full focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        {(detailProduct.variants?.colors || []).map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        Dimension Fit
                      </label>
                      <select 
                        value={selectedSize} 
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 w-full focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        {(detailProduct.variants?.sizes || []).map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Add to Cart checkout actions */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (detailProduct.stock > 0) {
                          onAddProductToCart(detailProduct);
                          setIsCartOpen(true);
                        }
                      }}
                      disabled={detailProduct.stock === 0}
                      className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-150 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
                    >
                      {detailProduct.stock > 0 ? "Add Curated Item to Bag" : "Temporarily Out of Stock"}
                    </button>
                  </div>

                  {/* QUIET INTUATIVE AI REVIEW INTELLIGENCE CARD (STYLISH STATIC GRID) */}
                  <div className="p-4.5 bg-gray-50 border border-gray-100 rounded-xl space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Silent Reviews Digest
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-semibold">Quality Index:</span>
                        <span className="font-bold text-xs bg-black text-white px-1.5 py-0.5 rounded font-mono">
                          {isLoadingAiSummary ? '...' : aiSummary?.grade || 'A'}
                        </span>
                      </div>
                    </div>

                    {isLoadingAiSummary ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 animate-pulse font-medium">
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-gray-400"></span>
                        Scanning review statements for authentic user patterns...
                      </div>
                    ) : aiSummary ? (
                      <div className="space-y-3.5 text-xs leading-relaxed text-gray-600">
                        <p className="italic font-medium text-gray-500">"{aiSummary.summary}"</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">Highlighted Benefits</span>
                            <ul className="list-disc pl-3.5 space-y-0.5 text-[11px] text-gray-500">
                              {aiSummary.pros.slice(0, 2).map((pro, i) => (
                                <li key={i}>{pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Points to Consider</span>
                            <ul className="list-disc pl-3.5 space-y-0.5 text-[11px] text-gray-500">
                              {aiSummary.cons.slice(0, 2).map((con, i) => (
                                <li key={i}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 leading-normal">
                        Verify general review trends based on authentic consumer purchase feedback loops.
                      </p>
                    )}
                  </div>

                  {/* REVIEWS INVENTORY LIST & SUBMISSION FORM */}
                  <div className="space-y-4 text-left border-t border-gray-100 pt-5">
                    <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                      Verified Buyer Experiences ({reviews.length})
                    </h4>
                    
                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
                      {reviews.length === 0 ? (
                        <p className="text-xs text-gray-400">No buyer experiences posted for this curation yet.</p>
                      ) : (
                        reviews.map((r) => (
                          <div key={r.id} className="p-3 bg-white border border-gray-100 rounded-xl space-y-1.5 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                {r.userName} 
                                {r.verified && (
                                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                                    Verified
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-gray-400">{r.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {renderStars(r.rating)}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                              {r.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* POST A NEW REVIEW INLINE FORM */}
                    <form onSubmit={handleSubmitReview} className="space-y-3.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Document Your Experience
                      </h5>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Rating Fit:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setNewRating(star)}
                              className="text-lg transition-transform hover:scale-110 focus:outline-none"
                            >
                              <span className={star <= newRating ? 'text-black' : 'text-gray-300'}>★</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <textarea
                          rows={2}
                          required
                          placeholder="Provide detailed feedback on dimensions, quality, and aesthetics..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      {reviewAlert && (
                        <div className={`p-3 rounded-lg text-xs font-semibold ${reviewAlert.isFake ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {reviewAlert.isFake 
                            ? `Note: Review scanning filters detected uncharacteristic vocabulary. Feedback flagged for review.` 
                            : `Review experience documented successfully in verification registry.`}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-lg transition-all"
                      >
                        Submit Experience
                      </button>
                    </form>
                  </div>

                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING COMPARE BAR */}
      {Object.values(compared).filter(Boolean).length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 border border-gray-150 p-4 rounded-2xl shadow-xl max-w-sm md:max-w-md w-auto flex items-center gap-4 animate-[bounce_1s_infinite_short] backdrop-blur-md">
          <div className="flex -space-x-2.5 overflow-hidden">
            {products.filter(p => compared[p.id]).slice(0, 3).map(p => (
              <img 
                key={p.id}
                src={p.image} 
                alt={p.name} 
                className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-contain bg-gray-50 border border-gray-100 p-1"
              />
            ))}
          </div>
          <div className="text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-sans">Specification Sync</span>
            <span className="text-xs font-bold text-gray-900 block">{products.filter(p => compared[p.id]).length} items for comparison</span>
          </div>
          <div className="flex gap-2 ml-auto">
            <button 
              onClick={() => setCompared({})}
              className="text-gray-400 hover:text-black text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
            >
              Clear
            </button>
            <button 
              onClick={() => setShowCompareModal(true)}
              className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all"
            >
              Compare
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN COMPARE MODAL */}
      <AnimatePresence>
        {showCompareModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCompareModal(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-5xl h-auto max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 z-10"
              >
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest block font-mono">Ocean Analytics Compare Engine</span>
                    <h3 className="text-lg font-black text-gray-900 mt-0.5">Product Specification Matrix</h3>
                  </div>
                  <button 
                    onClick={() => setShowCompareModal(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="p-3 font-bold text-gray-400 uppercase tracking-wider w-1/4">Feature</th>
                        {products.filter(p => compared[p.id]).map(p => (
                          <th key={p.id} className="p-3 w-1/4 min-w-[200px]">
                            <div className="space-y-3 text-center md:text-left">
                              <div className="h-24 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-100">
                                <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain p-1" referrerPolicy="no-referrer" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-gray-400 font-bold uppercase block">{p.brand}</span>
                                <h4 className="font-bold text-gray-900 leading-snug line-clamp-2 h-8">{p.name}</h4>
                                <span className="text-xs font-black text-indigo-600 block font-mono">${p.price.toFixed(2)}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  if (p.stock > 0) {
                                    onAddProductToCart(p);
                                    setIsCartOpen(true);
                                  }
                                }}
                                disabled={p.stock === 0}
                                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                              >
                                {p.stock > 0 ? "Add to Bag" : "Sold Out"}
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                      <tr>
                        <td className="p-3 font-semibold text-gray-400">Rating Index</td>
                        {products.filter(p => compared[p.id]).map(p => (
                          <td key={p.id} className="p-3">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-black">{p.rating}★</span>
                              <span className="text-gray-450 text-[10px]">({p.reviewsCount} reviews)</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-gray-400">Inventory Status</td>
                        {products.filter(p => compared[p.id]).map(p => (
                          <td key={p.id} className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${p.stock > 5 ? 'bg-emerald-50 text-emerald-700' : p.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                              {p.stock > 5 ? `In Stock (${p.stock} units)` : p.stock > 0 ? `Low Stock (${p.stock})` : "Sold Out"}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-gray-400">Primary Category</td>
                        {products.filter(p => compared[p.id]).map(p => (
                          <td key={p.id} className="p-3 text-gray-900 font-bold">{p.category}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-gray-400">Subcategory</td>
                        {products.filter(p => compared[p.id]).map(p => (
                          <td key={p.id} className="p-3">{p.subcategory}</td>
                        ))}
                      </tr>
                      {/* Gather unique specs keys among all compared products */}
                      {Array.from(new Set(products.filter(p => compared[p.id]).flatMap(p => Object.keys(p.specifications)))).map((specKey: string) => (
                        <tr key={specKey}>
                          <td className="p-3 font-semibold text-gray-400 capitalize">{specKey}</td>
                          {products.filter(p => compared[p.id]).map(p => (
                            <td key={p.id} className="p-3 text-gray-900 font-medium">{(p.specifications as any)[specKey] || <span className="text-gray-300 font-mono">—</span>}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
