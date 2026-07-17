export type UserRole = 'Customer' | 'Seller' | 'Admin' | 'Warehouse' | 'Delivery';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletBalance: number;
  rewardCoins: number;
  // Auth & Onboarding extension
  password?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  birthday?: string;
  preferredLanguage?: string;
  currency?: string;
  country?: string;
  city?: string;
  address?: string;
  interests?: string[];
  permissions?: {
    location?: boolean;
    notifications?: boolean;
    camera?: boolean;
    microphone?: boolean;
  };
  isOnboarded?: boolean;
  isGuest?: boolean;
  failedAttempts?: number;
  lockedUntil?: string | null;
  username?: string;
  bio?: string;
  timezone?: string;
  twoFactorEnabled?: boolean;
  is2FAEnabled?: boolean;
  twoFactorType?: 'authenticator' | 'sms' | 'email' | 'none';
  recoveryCodes?: string[];
  securityQuestions?: { question: string; answer: string }[];
  language?: string;
  subscriptions?: {
    prime?: boolean;
    newsletter?: boolean;
    dailyDeals?: boolean;
    securityAlerts?: boolean;
  };
  communicationPreferences?: { 
    push?: boolean; 
    email?: boolean; 
    sms?: boolean; 
    whatsapp?: boolean; 
    promotional?: boolean; 
    orders?: boolean; 
    security?: boolean; 
    newsletter?: boolean;
  };
  loginHistory?: {
    timestamp: string;
    ip: string;
    device: string;
    status: string;
  }[];
}

export interface ProductVariant {
  colors: string[];
  sizes: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  subcategory: string;
  stock: number;
  brand: string;
  variants: ProductVariant;
  specifications: Record<string, string>;
  sellerId: string;
  reviewsCount: number;
  slug?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  isFake: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  image: string;
}

export interface OrderTimelineEvent {
  status: string;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  timeline: OrderTimelineEvent[];
  shippingAddress: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  status: 'Success' | 'Warning' | 'Alert';
  ip: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  description: string;
}
