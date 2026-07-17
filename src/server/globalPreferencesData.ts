export interface CountryPreference {
  code: string;
  name: string;
  flag: string;
  currency: string;
  languages: string[];
  shippingCountry: string;
  taxRules: string;
  taxRate: number;
  offers: string[];
  banners: {
    title: string;
    subtitle: string;
    bgColor: string;
  };
  festivals: string;
  trend: string;
}

export interface CurrencyDetails {
  code: string;
  name: string;
  symbol: string;
  rate: number; // 1 USD = rate units
}

export const CURRENCIES: CurrencyDetails[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$', rate: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.78 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.50 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.36 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.50 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 158.00 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1380.00 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.34 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', rate: 3.67 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.45 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.25 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF ', rate: 0.89 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 1.63 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', rate: 18.20 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.80 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr ', rate: 10.50 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr ', rate: 10.60 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr ', rate: 6.85 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 32.80 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 88.00 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R ', rate: 18.10 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR ', rate: 3.75 },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', rate: 3.70 },
  { code: 'MYR', name: 'Malaysia Ringgit', symbol: 'RM ', rate: 4.70 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp ', rate: 16400.00 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 36.50 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 58.50 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 25400.00 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP ', rate: 48.00 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1500.00 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨ ', rate: 278.00 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳ ', rate: 117.00 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD ', rate: 0.31 },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', rate: 32.40 }
];

export interface LanguagePreference {
  name: string;
  code: string;
}

export const LANGUAGES: LanguagePreference[] = [
  { name: 'English', code: 'en' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Bengali', code: 'bn' },
  { name: 'Russian', code: 'ru' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Italian', code: 'it' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Telugu', code: 'te' },
  { name: 'Tamil', code: 'ta' }
];

export interface TimezonePreference {
  name: string;
  offset: string;
  countries?: string[];
  code?: string;
}

export const TIMEZONES: TimezonePreference[] = [
  { name: 'UTC', offset: 'UTC', countries: [], code: 'UTC' },
  { name: 'PST (Pacific Standard Time)', offset: 'PST', countries: ['United States', 'Canada'], code: 'USD' },
  { name: 'EST (Eastern Standard Time)', offset: 'EST', countries: ['United States', 'Canada'], code: 'USD' },
  { name: 'CST (Central Standard Time)', offset: 'CST', countries: ['United States', 'Canada', 'Mexico'], code: 'USD' },
  { name: 'GMT (Greenwich Mean Time)', offset: 'GMT', countries: ['United Kingdom'], code: 'GBP' },
  { name: 'CET (Central European Time)', offset: 'CET', countries: ['Germany', 'France', 'Italy'], code: 'EUR' },
  { name: 'IST (Indian Standard Time)', offset: 'IST', countries: ['India'], code: 'INR' },
  { name: 'JST (Japan Standard Time)', offset: 'JST', countries: ['Japan'], code: 'JPY' },
  { name: 'KST (Korea Standard Time)', offset: 'KST', countries: ['South Korea', 'Korea'], code: 'KRW' },
  { name: 'AEST (Australian Eastern Standard Time)', offset: 'AEST', countries: ['Australia'], code: 'AUD' },
  { name: 'GST (Gulf Standard Time)', offset: 'GST', countries: ['UAE'], code: 'AED' },
  { name: 'BRT (Brasilia Time)', offset: 'BRT', countries: ['Brazil'], code: 'BRL' },
  { name: 'SGT (Singapore Time)', offset: 'SGT', countries: ['Singapore'], code: 'SGD' }
];

export const COUNTRIES: CountryPreference[] = [
  {
    code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR',
    languages: ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Malayalam', 'Marathi'],
    shippingCountry: 'India', taxRules: 'GST - 18%', taxRate: 0.18,
    offers: ['Festive ₹2,500 Coupon on Audio Gear', 'Free Delivery above ₹1,999', 'Flat 10% instant off on UPI cards'],
    banners: {
      title: 'Grand Festive Bazaar',
      subtitle: 'Celebrate with up to 40% off curated elite designs. Quick domestic shipping!',
      bgColor: 'linear-gradient(135deg, #d35400, #c0392b)'
    },
    festivals: 'Diwali Lights Celebration',
    trend: 'Premium active noise-cancelling setups, smart wearable analytics, and heritage block crafts'
  },
  {
    code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD',
    languages: ['English', 'Spanish'],
    shippingCountry: 'United States', taxRules: 'US Sales Tax - 8.5%', taxRate: 0.085,
    offers: ['Save $150 on Ocean Ascent Wearables', 'Free 2-day delivery with Ocean Prime membership', '15% off smart home items'],
    banners: {
      title: 'Ocean Independence Collection',
      subtitle: 'Curated modern workspace upgrades & smart technology systems. Next-day air shipping!',
      bgColor: 'linear-gradient(135deg, #2c3e50, #2980b9)'
    },
    festivals: 'Summer Solstice Savings',
    trend: 'Autonomous acoustic enclosures, premium aerospace grade titanium timepieces'
  },
  {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP',
    languages: ['English'],
    shippingCountry: 'United Kingdom', taxRules: 'UK VAT - 20%', taxRate: 0.20,
    offers: ['Save £20 on Welcome Reward coupon', 'Next day UK mainland shipping', '5% Cashback on Eco-tech purchases'],
    banners: {
      title: 'The British Editorial Edit',
      subtitle: 'Bespoke mechanical peripherals & sustainable premium audio with express delivery.',
      bgColor: 'linear-gradient(135deg, #1abc9c, #16a085)'
    },
    festivals: 'Midsummer Festival',
    trend: 'Mechanical modular artisan keypads, solid brass charging solutions'
  },
  {
    code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD',
    languages: ['English', 'French'],
    shippingCountry: 'Canada', taxRules: 'HST - 13%', taxRate: 0.13,
    offers: ['Flat CA$35 off your first luxury order', 'Free shipping above CA$120'],
    banners: {
      title: 'Great Canadian Escape',
      subtitle: 'Heavy-duty titanium smartwatches & rugged electronics ready for the outdoors.',
      bgColor: 'linear-gradient(135deg, #7f8c8d, #34495e)'
    },
    festivals: 'Canada Day Celebrations',
    trend: 'Multi-sport biometric monitors, premium indoor micro-herb cultivators'
  },
  {
    code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD',
    languages: ['English'],
    shippingCountry: 'Australia', taxRules: 'GST - 10%', taxRate: 0.10,
    offers: ['Save A$25 on select items', 'Zero customs duty on technology shipments'],
    banners: {
      title: 'Outback Rugged Gear',
      subtitle: 'Engineered for wild terrains and elite athletic training. Fast track shipping.',
      bgColor: 'linear-gradient(135deg, #e67e22, #d35400)'
    },
    festivals: 'Winter Solstice Special',
    trend: 'Autonomous botanical systems, military-grade outdoor navigators'
  },
  {
    code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR',
    languages: ['German', 'English'],
    shippingCountry: 'Germany', taxRules: 'German MwSt - 19%', taxRate: 0.19,
    offers: ['Save €25 off on Welcome code', 'Free European Union delivery above €75'],
    banners: {
      title: 'Deutsche Ingenieurskunst',
      subtitle: 'Flawless precision keycaps & high fidelity studio acoustic gear.',
      bgColor: 'linear-gradient(135deg, #2c3e50, #bdc3c7)'
    },
    festivals: 'Bavarian Autumnfest Countdown',
    trend: 'Audiophile grade studio headphones, mechanical desk organizers'
  },
  {
    code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR',
    languages: ['French'],
    shippingCountry: 'France', taxRules: 'French TVA - 20%', taxRate: 0.20,
    offers: ['Save €30 off orders above €200', 'Free delivery on apparel and accessories'],
    banners: {
      title: 'The Parisian Curator',
      subtitle: 'Aesthetically premium design accessories & minimalist desk enhancements.',
      bgColor: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
    },
    festivals: 'Bastille Day Grand Sale',
    trend: 'Handmade luxury leather desk mats, dynamic sound wellness pods'
  },
  {
    code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY',
    languages: ['Japanese'],
    shippingCountry: 'Japan', taxRules: 'Consumption Tax - 10%', taxRate: 0.10,
    offers: ['Save ¥4000 on SoundWave items', 'Free delivery across Honshu island'],
    banners: {
      title: 'Tokyo Cyberpunk Aesthetic',
      subtitle: 'Next-gen minimalist keypads, custom laser-etched design caps, and high-tech wearable monitors.',
      bgColor: 'linear-gradient(135deg, #1abc9c, #2980b9)'
    },
    festivals: 'Tanabata Star Stars Festival',
    trend: 'Custom mechanical modular macro-pads, hybrid titanium sport gears'
  },
  {
    code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW',
    languages: ['Korean'],
    shippingCountry: 'South Korea', taxRules: 'VAT - 10%', taxRate: 0.10,
    offers: ['Save ₩30,000 on smart wearables', 'Free metropolitan overnight delivery'],
    banners: {
      title: 'Seoul Premium Innovation',
      subtitle: 'State-of-the-art sensory acoustics and automatic botanical installations.',
      bgColor: 'linear-gradient(135deg, #34495e, #2c3e50)'
    },
    festivals: 'Chuseok National Harvest Specials',
    trend: 'Intelligent multi-sensor hydroponics, low-latency audio monitors'
  },
  {
    code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD',
    languages: ['English', 'Malay', 'Chinese', 'Tamil'],
    shippingCountry: 'Singapore', taxRules: 'GST - 9%', taxRate: 0.09,
    offers: ['Save S$15 on orders above S$100', 'Same-day island-wide priority delivery'],
    banners: {
      title: 'Smart City Smart Living',
      subtitle: 'Space-saving interior gardens and ultra-dense workspace docks.',
      bgColor: 'linear-gradient(135deg, #3498db, #2980b9)'
    },
    festivals: 'National Day Mega Deals',
    trend: 'Walnut wood dual magnetic device charging stations, high fidelity studio pods'
  },
  {
    code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED',
    languages: ['Arabic', 'English'],
    shippingCountry: 'United Arab Emirates', taxRules: 'VAT - 5%', taxRate: 0.05,
    offers: ['Save 100 AED on first tech luxury purchase', 'Free delivery inside Dubai & Abu Dhabi'],
    banners: {
      title: 'Emirati Prestige Club',
      subtitle: 'Gilded aerospace details, smart athletic gadgets, and hyper-premium acoustic sets.',
      bgColor: 'linear-gradient(135deg, #f1c40f, #f39c12)'
    },
    festivals: 'Eid Al-Adha Festive Treats',
    trend: 'Satin finish titanium luxury wearables, designer indoor botany systems'
  },
  {
    code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL',
    languages: ['Portuguese'],
    shippingCountry: 'Brazil', taxRules: 'ICMS - 17%', taxRate: 0.17,
    offers: ['Save R$80 on SoundWave', 'Up to 6 interest-free payments on credit cards'],
    banners: {
      title: 'Rio Carnival of Design',
      subtitle: 'Bring home beautiful sensory items & mechanical gear. Quick shipping options.',
      bgColor: 'linear-gradient(135deg, #27ae60, #f1c40f)'
    },
    festivals: 'Carnaval Celebration Specials',
    trend: 'Solid timber luxury charging bases, active sport sound controllers'
  },
  // Adding remaining countries to complete around 100+ countries
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'BRL', languages: ['Spanish'], shippingCountry: 'Argentina', taxRules: 'VAT - 21%', taxRate: 0.21, offers: [], banners: { title: 'Argentine Premium Edit', subtitle: 'Crafted design accents', bgColor: '#16a085' }, festivals: 'May Revolution Day', trend: 'Leather accessories' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', currency: 'EUR', languages: ['German'], shippingCountry: 'Austria', taxRules: 'MwSt - 20%', taxRate: 0.20, offers: [], banners: { title: 'Vienna Classical Design', subtitle: 'Premium studio audio', bgColor: '#34495e' }, festivals: 'National Day', trend: 'Acoustic monitoring headsets' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', currency: 'EUR', languages: ['Dutch', 'French', 'German'], shippingCountry: 'Belgium', taxRules: 'VAT - 21%', taxRate: 0.21, offers: [], banners: { title: 'Brussels Design Collective', subtitle: 'Modern desktop items', bgColor: '#2c3e50' }, festivals: 'National Holiday', trend: 'Artisan mechanical desk keycaps' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', currency: 'EUR', languages: ['Bulgarian'], shippingCountry: 'Bulgaria', taxRules: 'VAT - 20%', taxRate: 0.20, offers: [], banners: { title: 'Sofia Tech Hub', subtitle: 'Custom electronics and accessories', bgColor: '#7f8c8d' }, festivals: 'Liberation Day', trend: 'Ergonomic input systems' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', languages: ['German', 'French', 'Italian'], shippingCountry: 'Switzerland', taxRules: 'VAT - 8.1%', taxRate: 0.081, offers: [], banners: { title: 'Swiss Precision Atelier', subtitle: 'Exquisite aerospace-grade timepieces & audio', bgColor: '#e74c3c' }, festivals: 'Swiss National Day', trend: 'Chronographs, luxury titanium watches' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Chile', taxRules: 'VAT - 19%', taxRate: 0.19, offers: [], banners: { title: 'Andean Premium Tech', subtitle: 'Durable adventure watches', bgColor: '#1abc9c' }, festivals: 'Fiestas Patrias', trend: 'Outdoor navigation systems' },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', languages: ['Chinese'], shippingCountry: 'China', taxRules: 'VAT - 13%', taxRate: 0.13, offers: [], banners: { title: 'Shanghai Modernity', subtitle: 'Cutting edge electronics and workspace layouts', bgColor: '#c0392b' }, festivals: 'Lunar New Year Grand Festival', trend: 'Macro desk configurations, custom metal keypads' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Colombia', taxRules: 'VAT - 19%', taxRate: 0.19, offers: [], banners: { title: 'Bogota Modern Living', subtitle: 'Eco-conscious design setups', bgColor: '#f1c40f' }, festivals: 'Independence Day', trend: 'Organic design botany boxes' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Costa Rica', taxRules: 'VAT - 13%', taxRate: 0.13, offers: [], banners: { title: 'Pura Vida Tech', subtitle: 'Eco-responsible adventure accessories', bgColor: '#3498db' }, festivals: 'Independence Day', trend: 'Outdoor active wearables' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', currency: 'EUR', languages: ['Greek', 'Turkish'], shippingCountry: 'Cyprus', taxRules: 'VAT - 19%', taxRate: 0.19, offers: [], banners: { title: 'Cyprus Luxury Living', subtitle: 'Elite seaside style items', bgColor: '#27ae60' }, festivals: 'Independence Day', trend: 'Waterproof wearables' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', currency: 'EUR', languages: ['Czech'], shippingCountry: 'Czech Republic', taxRules: 'VAT - 21%', taxRate: 0.21, offers: [], banners: { title: 'Prague Craft Guild', subtitle: 'Exceptional visual glassware designs', bgColor: '#8e44ad' }, festivals: 'St. Wenceslas Day', trend: 'Minimalist handblown design lights' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK', languages: ['Danish'], shippingCountry: 'Denmark', taxRules: 'Moms - 25%', taxRate: 0.25, offers: [], banners: { title: 'Copenhagen Hygge Modern', subtitle: 'Timeless Scandinavian furniture & acoustic structures', bgColor: '#d35400' }, festivals: 'Constitution Day', trend: 'Walnut wooden magnetic chargers, architectural acoustics' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Dominican Republic', taxRules: 'ITBIS - 18%', taxRate: 0.18, offers: [], banners: { title: 'Dominican Coastal Aesthetics', subtitle: 'Luxury beachside leisure', bgColor: '#2980b9' }, festivals: 'Restoration Day', trend: 'Polarized optics and rugged timers' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Ecuador', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Equator Tech Lifestyle', subtitle: 'Adventure fitness gadgets', bgColor: '#16a085' }, festivals: 'Independence Day', trend: 'Ultra rugged multi-sport watches' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', currency: 'EUR', languages: ['Estonian'], shippingCountry: 'Estonia', taxRules: 'VAT - 22%', taxRate: 0.22, offers: [], banners: { title: 'Tallinn Cyber Future', subtitle: 'Pioneering desktop configurations & secure smart devices', bgColor: '#2c3e50' }, festivals: 'Independence Day', trend: 'Cryptographic security locks, wireless docks' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', currency: 'EGP', languages: ['Arabic', 'English'], shippingCountry: 'Egypt', taxRules: 'VAT - 14%', taxRate: 0.14, offers: [], banners: { title: 'Cairo Heritage Modern', subtitle: 'Timeless crafts and premium sound systems', bgColor: '#bdc3c7' }, festivals: 'Revolution Day', trend: 'Hand-hammered brass, smart acoustics' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', languages: ['Spanish'], shippingCountry: 'Spain', taxRules: 'Spanish IVA - 21%', taxRate: 0.21, offers: [], banners: { title: 'The Spanish Atelier', subtitle: 'Contemporary leather crafts and high design audio', bgColor: '#e74c3c' }, festivals: 'La Fiesta Nacional', trend: 'Artisan full grain desk mats, waterproof sports audio' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', currency: 'EUR', languages: ['Finnish', 'Swedish'], shippingCountry: 'Finland', taxRules: 'VAT - 25.5%', taxRate: 0.255, offers: [], banners: { title: 'Nordic Pure Living', subtitle: 'Eco-intelligent botanical pods & premium health tools', bgColor: '#34495e' }, festivals: 'Independence Day', trend: 'Silent desk sensory gardens, biometric sensors' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', currency: 'EUR', languages: ['Greek'], shippingCountry: 'Greece', taxRules: 'VAT - 24%', taxRate: 0.24, offers: [], banners: { title: 'Mediterranean Serenity', subtitle: 'Minimalist seaside layout & luxury wearables', bgColor: '#2980b9' }, festivals: 'Ochi Day Celebration', trend: 'Satin finished titanium watches, outdoor audio' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', languages: ['Chinese', 'English'], shippingCountry: 'Hong Kong', taxRules: 'Sales Tax - 0%', taxRate: 0.0, offers: [], banners: { title: 'Hong Kong High-Density Life', subtitle: 'Space-saving magnetic desks & hybrid digital audio', bgColor: '#c0392b' }, festivals: 'Mid-Autumn Festival', trend: 'Walnut wood multi-device charging hubs, macro-pads' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', currency: 'EUR', languages: ['Croatian'], shippingCountry: 'Croatia', taxRules: 'VAT - 25%', taxRate: 0.25, offers: [], banners: { title: 'Adriatic Escape', subtitle: 'Premium design gadgets for the explorer', bgColor: '#1abc9c' }, festivals: 'Statehood Day', trend: 'Waterproof wireless sound setups' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', currency: 'EUR', languages: ['Hungarian'], shippingCountry: 'Hungary', taxRules: 'VAT - 27%', taxRate: 0.27, offers: [], banners: { title: 'Budapest Classicism', subtitle: 'Exquisite technical peripherals', bgColor: '#9b59b6' }, festivals: 'St. Stephen Day', trend: 'Precision metal mechanical keycaps' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', languages: ['Indonesian'], shippingCountry: 'Indonesia', taxRules: 'VAT - 11%', taxRate: 0.11, offers: [], banners: { title: 'Nusantara Craft & Tech', subtitle: 'Ethically harvested solid teak desk accessories', bgColor: '#27ae60' }, festivals: 'Independence Day Proclamation', trend: 'Teakwood acoustic speaker setups, smart watches' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', currency: 'EUR', languages: ['English', 'Irish'], shippingCountry: 'Ireland', taxRules: 'VAT - 23%', taxRate: 0.23, offers: [], banners: { title: 'Dublin Tech Vanguard', subtitle: 'Elite audio engineering & premium workspace docks', bgColor: '#16a085' }, festivals: 'St. Patrick\'s Feast', trend: 'High fidelity ANC systems, magnetic desk mats' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', currency: 'ILS', languages: ['Hebrew', 'Arabic', 'English'], shippingCountry: 'Israel', taxRules: 'VAT - 17%', taxRate: 0.17, offers: [], banners: { title: 'Tel Aviv Start-Up Grid', subtitle: 'Pioneering sensory interfaces & smart botany pods', bgColor: '#3498db' }, festivals: 'Hanukkah Special Lights', trend: 'Autonomous plant cultivation boxes, macro keycaps' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', currency: 'EUR', languages: ['Icelandic'], shippingCountry: 'Iceland', taxRules: 'VAT - 24%', taxRate: 0.24, offers: [], banners: { title: 'Icelandic Volcanic Modernity', subtitle: 'Aerospace-grade items to tackle extreme terrains', bgColor: '#34495e' }, festivals: 'National Day', trend: 'Premium multi-sport military watches' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', languages: ['Italian'], shippingCountry: 'Italy', taxRules: 'Italian IVA - 22%', taxRate: 0.22, offers: [], banners: { title: 'Milano Alta Moda & Tecnologia', subtitle: 'Elite leather accessories and audiophile acoustics', bgColor: '#2c3e50' }, festivals: 'Festa della Repubblica', trend: 'Full grain calfskin desk organizers, bespoke studio headsets' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', currency: 'AED', languages: ['Arabic'], shippingCountry: 'Jordan', taxRules: 'Sales Tax - 16%', taxRate: 0.16, offers: [], banners: { title: 'Amman Ancient and Modern', subtitle: 'Minimalist tech and lifestyle items', bgColor: '#e67e22' }, festivals: 'Independence Day', trend: 'Smart wrist wearables' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'USD', languages: ['Swahili', 'English'], shippingCountry: 'Kenya', taxRules: 'VAT - 16%', taxRate: 0.16, offers: [], banners: { title: 'Nairobi Silicon Savannah', subtitle: 'Innovative digital widgets & adventure gear', bgColor: '#27ae60' }, festivals: 'Jamhuri Day Celebration', trend: 'Multi-sport fitness sensors' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', languages: ['Arabic', 'English'], shippingCountry: 'Kuwait', taxRules: 'Customs - 5%', taxRate: 0.05, offers: [], banners: { title: 'Kuwait City Elite Selection', subtitle: 'Prestige smart electronics & gold finish items', bgColor: '#f1c40f' }, festivals: 'National Day Celebration', trend: 'Aerospace finish titanium watch cases, studio pods' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', currency: 'EUR', languages: ['French', 'German', 'Luxembourgish'], shippingCountry: 'Luxembourg', taxRules: 'VAT - 17%', taxRate: 0.17, offers: [], banners: { title: 'Luxembourg Capital Club', subtitle: 'Hyper curated luxury lifestyle items', bgColor: '#34495e' }, festivals: 'National Day', trend: 'Active noise-cancelling studio headwear' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', currency: 'EUR', languages: ['Latvian'], shippingCountry: 'Latvia', taxRules: 'VAT - 21%', taxRate: 0.21, offers: [], banners: { title: 'Riga Baltic Studio', subtitle: 'High design workspace peripherals', bgColor: '#7f8c8d' }, festivals: 'Proclamation Day', trend: 'Precision custom desktop pads' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', currency: 'AED', languages: ['Arabic', 'French'], shippingCountry: 'Morocco', taxRules: 'VAT - 20%', taxRate: 0.20, offers: [], banners: { title: 'Casablanca Contemporary', subtitle: 'Sleek tech details styled with geometric patterns', bgColor: '#c0392b' }, festivals: 'Throne Day', trend: 'Teakwood geometric charging stations' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', currency: 'EUR', languages: ['Maltese', 'English'], shippingCountry: 'Malta', taxRules: 'VAT - 18%', taxRate: 0.18, offers: [], banners: { title: 'Valletta Maritime Elite', subtitle: 'Waterproof premium digital tools', bgColor: '#2980b9' }, festivals: 'Victory Day', trend: 'Marine grade sports monitors' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', languages: ['Spanish'], shippingCountry: 'Mexico', taxRules: 'IVA - 16%', taxRate: 0.16, offers: [], banners: { title: 'Ciudad de Mexico Vanguardia', subtitle: 'Acoustic excellence and handcraft accessories', bgColor: '#16a085' }, festivals: 'Grito de Dolores Celebration', trend: 'Authentic solid wood desk organizers, outdoor audio' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', languages: ['Malay', 'English', 'Chinese', 'Tamil'], shippingCountry: 'Malaysia', taxRules: 'SST - 10%', taxRate: 0.10, offers: [], banners: { title: 'Kuala Lumpur Elite Tech', subtitle: 'Space-saving workspace chargers & smart accessories', bgColor: '#3498db' }, festivals: 'Merdeka Independence Day', trend: 'Teak multi-charger trays, waterproof adventure audio' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', languages: ['Dutch', 'English'], shippingCountry: 'Netherlands', taxRules: 'BTW - 21%', taxRate: 0.21, offers: [], banners: { title: 'Amsterdam Studio Line', subtitle: 'Stunning minimalist design keypads & soundscapes', bgColor: '#e67e22' }, festivals: 'King\'s Day Carnival', trend: 'Artisan anodized aluminum keypads, organic sound waves' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK', languages: ['Norwegian'], shippingCountry: 'Norway', taxRules: 'MVA - 25%', taxRate: 0.25, offers: [], banners: { title: 'Fjord Rugged Adventure', subtitle: 'Indestructible titanium watches & premium wireless pods', bgColor: '#34495e' }, festivals: 'Constitution Day', trend: 'Polar multisport tracking, outdoor emergency acoustics' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', languages: ['English', 'Maori'], shippingCountry: 'New Zealand', taxRules: 'GST - 15%', taxRate: 0.15, offers: [], banners: { title: 'Kiwi Expedition Wear', subtitle: 'Military grade GPS timepieces & premium travel cases', bgColor: '#1abc9c' }, festivals: 'Waitangi Day Celebration', trend: 'Tough GPS outdoor monitors, botanical gardens' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', currency: 'AED', languages: ['Arabic'], shippingCountry: 'Oman', taxRules: 'VAT - 5%', taxRate: 0.05, offers: [], banners: { title: 'Muscat Architectural Luxury', subtitle: 'Pristine soundscapes & metallic accessories', bgColor: '#d35400' }, festivals: 'National Day Celebration', trend: 'Premium active noise cancellation, luxury watches' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Panama', taxRules: 'ITBMS - 7%', taxRate: 0.07, offers: [], banners: { title: 'Panama Canal Tech Center', subtitle: 'Global high fidelity selection', bgColor: '#2980b9' }, festivals: 'Separation Day', trend: 'Seaside outdoor fitness accessories' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Peru', taxRules: 'IGV - 18%', taxRate: 0.18, offers: [], banners: { title: 'Andean Luxury Crafts', subtitle: 'Premium adventure chronographs & tools', bgColor: '#16a085' }, festivals: 'Fiestas Patrias', trend: 'Tough GPS sport watches' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP', languages: ['Tagalog', 'English'], shippingCountry: 'Philippines', taxRules: 'VAT - 12%', taxRate: 0.12, offers: [], banners: { title: 'Manila Contemporary Living', subtitle: 'Compact desk grids and high quality acoustics', bgColor: '#3498db' }, festivals: 'Independence Day Specials', trend: 'Teakwood magnetic chargers, wireless sound blocks' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'EUR', languages: ['Polish'], shippingCountry: 'Poland', taxRules: 'VAT - 23%', taxRate: 0.23, offers: [], banners: { title: 'Warsaw Tech Atelier', subtitle: 'Flawless mechanical keycaps and sound docks', bgColor: '#2c3e50' }, festivals: 'Constitution Day', trend: 'Bespoke custom keypads, wireless desk setups' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', languages: ['Portuguese'], shippingCountry: 'Portugal', taxRules: 'VAT - 23%', taxRate: 0.23, offers: [], banners: { title: 'Lisbon Maritime Living', subtitle: 'Sustainable cork and oak workspace details', bgColor: '#e67e22' }, festivals: 'Portugal Day', trend: 'Handmade oak desk accessories, water sports audio' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'AED', languages: ['Arabic', 'English'], shippingCountry: 'Qatar', taxRules: 'Customs - 5%', taxRate: 0.05, offers: [], banners: { title: 'Doha Prestige Selection', subtitle: 'Bespoke chronometers & ultra premium acoustics', bgColor: '#f1c40f' }, festivals: 'National Day Celebration', trend: 'Aerospace finish watch frames, luxury audio' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', currency: 'EUR', languages: ['Romanian'], shippingCountry: 'Romania', taxRules: 'TVA - 19%', taxRate: 0.19, offers: [], banners: { title: 'Bucharest Tech Hub', subtitle: 'Custom workspace tools & high fidelity audio', bgColor: '#7f8c8d' }, festivals: 'Great Union Day', trend: 'Artisan mechanical keycaps' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', languages: ['Arabic'], shippingCountry: 'Saudi Arabia', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Riyadh Luxury Guild', subtitle: 'Curated golden accents & ultra premium smart wear', bgColor: '#27ae60' }, festivals: 'National Day Celebration', trend: 'Satin finished titanium watches, acoustic speaker docks' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', languages: ['Swedish'], shippingCountry: 'Sweden', taxRules: 'Moms - 25%', taxRate: 0.25, offers: [], banners: { title: 'Stockholm Nordic Studio', subtitle: 'Organic sound wave systems & bespoke timber details', bgColor: '#34495e' }, festivals: 'National Day', trend: 'Walnut wooden magnetic chargers, premium travel headphones' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB', languages: ['Thai'], shippingCountry: 'Thailand', taxRules: 'VAT - 7%', taxRate: 0.07, offers: [], banners: { title: 'Bangkok Modern Escape', subtitle: 'Space-saving desktop arrangements & active acoustics', bgColor: '#e74c3c' }, festivals: 'Songkran Festive Specials', trend: 'Teak multi-charging trays, active noise cancelling pods' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY', languages: ['Turkish'], shippingCountry: 'Turkey', taxRules: 'VAT - 20%', taxRate: 0.20, offers: [], banners: { title: 'Istanbul Grand Design', subtitle: 'Bespoke geometric crafts and beautiful acoustic engineering', bgColor: '#d35400' }, festivals: 'Republic Day Celebration', trend: 'Traditional timber charging docks, high definition studio headwear' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', currency: 'TWD', languages: ['Chinese'], shippingCountry: 'Taiwan', taxRules: 'VAT - 5%', taxRate: 0.05, offers: [], banners: { title: 'Hsinchu Silicon Vanguard', subtitle: 'Flawless next-gen mechanical keypads & monitors', bgColor: '#16a085' }, festivals: 'Double Tenth Day', trend: 'Custom anodized aluminum keypads, macro desk hubs' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', currency: 'EUR', languages: ['Ukrainian'], shippingCountry: 'Ukraine', taxRules: 'VAT - 20%', taxRate: 0.20, offers: [], banners: { title: 'Kyiv Modern Design', subtitle: 'Innovative technical peripherals & smart accessories', bgColor: '#2980b9' }, festivals: 'Independence Day', trend: 'Precision mechanical keypads' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Uruguay', taxRules: 'VAT - 22%', taxRate: 0.22, offers: [], banners: { title: 'Montevideo Coastal Aesthetics', subtitle: 'Premium athletic gear', bgColor: '#1abc9c' }, festivals: 'Constitution Day', trend: 'Outdoor fitness GPS trackers' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currency: 'VND', languages: ['Vietnamese'], shippingCountry: 'Vietnam', taxRules: 'VAT - 10%', taxRate: 0.10, offers: [], banners: { title: 'Hanoi Contemporary Craft', subtitle: 'Ethically harvested bamboo & luxury workspace docks', bgColor: '#c0392b' }, festivals: 'National Day Celebration', trend: 'Bamboo sound accessories, waterproof adventure wearables' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', languages: ['English', 'Afrikaans', 'Zulu'], shippingCountry: 'South Africa', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Cape Town Sunset Studio', subtitle: 'Rugged titanium adventure watches & sound systems', bgColor: '#e67e22' }, festivals: 'Heritage Day Festival', trend: 'Polar multi-sport wrist navigators' },
  // Let's add more simple country placeholders to reach 100+ countries
  { code: 'AL', name: 'Albania', flag: '🇦🇱', currency: 'EUR', languages: ['Albanian'], shippingCountry: 'Albania', taxRules: 'VAT - 20%', taxRate: 0.20, offers: [], banners: { title: 'Albania Elite', subtitle: 'Curated products', bgColor: '#2c3e50' }, festivals: 'Independence Day', trend: 'Modern audio' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', currency: 'RUB', languages: ['Armenian'], shippingCountry: 'Armenia', taxRules: 'VAT - 20%', taxRate: 0.20, offers: [], banners: { title: 'Armenia Premium', subtitle: 'Curated selections', bgColor: '#34495e' }, festivals: 'Independence Day', trend: 'Tech wearables' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', currency: 'USD', languages: ['Portuguese'], shippingCountry: 'Angola', taxRules: 'VAT - 14%', taxRate: 0.14, offers: [], banners: { title: 'Angola Elite', subtitle: 'Premium electronics', bgColor: '#27ae60' }, festivals: 'Independence Day', trend: 'Active audio' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', currency: 'TRY', languages: ['Azerbaijani'], shippingCountry: 'Azerbaijan', taxRules: 'VAT - 18%', taxRate: 0.18, offers: [], banners: { title: 'Baku Luxury Hub', subtitle: 'Prestige items', bgColor: '#f1c40f' }, festivals: 'Republic Day', trend: 'Titanium watches' },
  { code: 'BA', name: 'Bosnia & Herzegovina', flag: '🇧🇦', currency: 'EUR', languages: ['Bosnian'], shippingCountry: 'Bosnia', taxRules: 'VAT - 17%', taxRate: 0.17, offers: [], banners: { title: 'Sarajevo Selections', subtitle: 'Premium electronics', bgColor: '#7f8c8d' }, festivals: 'Statehood Day', trend: 'Acoustic pods' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', currency: 'AED', languages: ['Arabic', 'English'], shippingCountry: 'Bahrain', taxRules: 'VAT - 10%', taxRate: 0.10, offers: [], banners: { title: 'Manama Elite Selection', subtitle: 'Prestige items', bgColor: '#c0392b' }, festivals: 'National Day', trend: 'Luxury watches' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Bolivia', taxRules: 'VAT - 13%', taxRate: 0.13, offers: [], banners: { title: 'La Paz Ascent', subtitle: 'Rugged sports electronics', bgColor: '#16a085' }, festivals: 'Independence Day', trend: 'Adventure chronometers' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', currency: 'EGP', languages: ['Arabic'], shippingCountry: 'Algeria', taxRules: 'VAT - 19%', taxRate: 0.19, offers: [], banners: { title: 'Algiers Modern Design', subtitle: 'Minimalist gadgets', bgColor: '#2c3e50' }, festivals: 'Revolution Day', trend: 'Smart wrist wearables' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', currency: 'TRY', languages: ['Georgian'], shippingCountry: 'Georgia', taxRules: 'VAT - 18%', taxRate: 0.18, offers: [], banners: { title: 'Tbilisi Atelier', subtitle: 'Curated goods', bgColor: '#8e44ad' }, festivals: 'Independence Day', trend: 'Artisan keycaps' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'USD', languages: ['English'], shippingCountry: 'Ghana', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Accra Smart Living', subtitle: 'Innovative electronics', bgColor: '#27ae60' }, festivals: 'Independence Day', trend: 'Fitness trackers' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Guatemala', taxRules: 'VAT - 12%', taxRate: 0.12, offers: [], banners: { title: 'Guatemala Crafts & Tech', subtitle: 'Premium smart wear', bgColor: '#3498db' }, festivals: 'Independence Day', trend: 'Outdoor GPS watches' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Honduras', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Honduras Premium', subtitle: 'Adventure fitness gadgets', bgColor: '#1abc9c' }, festivals: 'Independence Day', trend: 'Rugged smartwatches' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', currency: 'USD', languages: ['English'], shippingCountry: 'Jamaica', taxRules: 'GCT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Kingston Coastal Style', subtitle: 'Waterproof sound setups', bgColor: '#f1c40f' }, festivals: 'Independence Day', trend: 'Beach active audio' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', currency: 'RUB', languages: ['Kazakh', 'Russian'], shippingCountry: 'Kazakhstan', taxRules: 'VAT - 12%', taxRate: 0.12, offers: [], banners: { title: 'Almaty Tech Hub', subtitle: 'Workspace systems', bgColor: '#2c3e50' }, festivals: 'Republic Day', trend: 'Anodized keypads' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', currency: 'AED', languages: ['Arabic', 'French'], shippingCountry: 'Lebanon', taxRules: 'VAT - 11%', taxRate: 0.11, offers: [], banners: { title: 'Beirut Contemporary', subtitle: 'Sleek tech details', bgColor: '#bdc3c7' }, festivals: 'Independence Day', trend: 'Teakwood docks' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', currency: 'INR', languages: ['Sinhala', 'Tamil', 'English'], shippingCountry: 'Sri Lanka', taxRules: 'VAT - 18%', taxRate: 0.18, offers: [], banners: { title: 'Colombo Coastal Living', subtitle: 'Intelligent acoustics & botany', bgColor: '#1abc9c' }, festivals: 'Independence Day', trend: 'Active noise cancelling' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', currency: 'EUR', languages: ['Lithuanian'], shippingCountry: 'Lithuania', taxRules: 'VAT - 21%', taxRate: 0.21, offers: [], banners: { title: 'Vilnius Tech Guild', subtitle: 'Precision workspace peripherals', bgColor: '#7f8c8d' }, festivals: 'Statehood Day', trend: 'Bespoke keycaps' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', currency: 'EUR', languages: ['Romanian'], shippingCountry: 'Moldova', taxRules: 'VAT - 20%', taxRate: 0.20, offers: [], banners: { title: 'Chisinau Hub', subtitle: 'Curated products', bgColor: '#34495e' }, festivals: 'Independence Day', trend: 'Studio acoustics' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', currency: 'EUR', languages: ['Montenegrin'], shippingCountry: 'Montenegro', taxRules: 'VAT - 21%', taxRate: 0.21, offers: [], banners: { title: 'Podgorica Coastal Style', subtitle: 'Modern wearables', bgColor: '#2980b9' }, festivals: 'Statehood Day', trend: 'Waterproof sound pods' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', currency: 'EUR', languages: ['Macedonian'], shippingCountry: 'North Macedonia', taxRules: 'VAT - 18%', taxRate: 0.18, offers: [], banners: { title: 'Skopje Premium Selections', subtitle: 'Sleek workspace tools', bgColor: '#8e44ad' }, festivals: 'Independence Day', trend: 'Ergonomic devices' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', currency: 'CNY', languages: ['Mongolian'], shippingCountry: 'Mongolia', taxRules: 'VAT - 10%', taxRate: 0.10, offers: [], banners: { title: 'Ulaanbaatar Rugged Wear', subtitle: 'Heavy duty military adventure watches', bgColor: '#34495e' }, festivals: 'Naadam Festival Day', trend: 'Multisport tracking watch sets' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', currency: 'USD', languages: ['English', 'French'], shippingCountry: 'Mauritius', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Mauritius Luxury Living', subtitle: 'Waterproof premium gear', bgColor: '#1abc9c' }, festivals: 'Republic Day', trend: 'Seaside sports monitors' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', currency: 'INR', languages: ['Nepali'], shippingCountry: 'Nepal', taxRules: 'VAT - 13%', taxRate: 0.13, offers: [], banners: { title: 'Kathmandu High Ascent', subtitle: 'Extreme rugged high-altitude sensors', bgColor: '#e74c3c' }, festivals: 'Republic Day', trend: 'Heavy-duty titanium watches' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', currency: 'USD', languages: ['Spanish'], shippingCountry: 'Paraguay', taxRules: 'VAT - 10%', taxRate: 0.10, offers: [], banners: { title: 'Asuncion Premium Tech', subtitle: 'Smart sports systems', bgColor: '#27ae60' }, festivals: 'Independence Day', trend: 'Adventure GPS sensors' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'AED', languages: ['Arabic', 'English'], shippingCountry: 'Qatar', taxRules: 'Customs - 5%', taxRate: 0.05, offers: [], banners: { title: 'Doha Prestige Selection', subtitle: 'Ultra premium acoustics', bgColor: '#f1c40f' }, festivals: 'National Day Celebration', trend: 'Luxury audio setups' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', currency: 'EUR', languages: ['Serbian'], shippingCountry: 'Serbia', taxRules: 'VAT - 20%', taxRate: 0.20, offers: [], banners: { title: 'Belgrade Workspace Atelier', subtitle: 'Mechanical modular keypads', bgColor: '#2c3e50' }, festivals: 'Statehood Day', trend: 'Precision custom keycaps' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', currency: 'USD', languages: ['Spanish'], shippingCountry: 'El Salvador', taxRules: 'VAT - 13%', taxRate: 0.13, offers: [], banners: { title: 'San Salvador Tech', subtitle: 'Rugged sports electronics', bgColor: '#3498db' }, festivals: 'Independence Day', trend: 'Biometric multisport monitors' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', currency: 'EGP', languages: ['Arabic', 'French'], shippingCountry: 'Tunisia', taxRules: 'VAT - 19%', taxRate: 0.19, offers: [], banners: { title: 'Tunis Modern Guild', subtitle: 'Sleek wood docks', bgColor: '#d35400' }, festivals: 'Independence Day', trend: 'Geometric wood chargers' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', currency: 'USD', languages: ['Swahili', 'English'], shippingCountry: 'Tanzania', taxRules: 'VAT - 18%', taxRate: 0.18, offers: [], banners: { title: 'Dar es Salaam Valley', subtitle: 'Adventure watches', bgColor: '#27ae60' }, festivals: 'Union Day Celebration', trend: 'Biometric wrist trackers' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'USD', languages: ['Swahili', 'English'], shippingCountry: 'Uganda', taxRules: 'VAT - 18%', taxRate: 0.18, offers: [], banners: { title: 'Kampala Premium Selections', subtitle: 'Smart sports tools', bgColor: '#34495e' }, festivals: 'Independence Day', trend: 'Active fitness monitors' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', currency: 'RUB', languages: ['Uzbek', 'Russian'], shippingCountry: 'Uzbekistan', taxRules: 'VAT - 12%', taxRate: 0.12, offers: [], banners: { title: 'Tashkent Tech Station', subtitle: 'Modular workspace keyboards', bgColor: '#7f8c8d' }, festivals: 'Independence Day', trend: 'Anodized aluminum peripherals' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', currency: 'SAR', languages: ['Arabic'], shippingCountry: 'Yemen', taxRules: 'Sales Tax - 10%', taxRate: 0.10, offers: [], banners: { title: 'Yemen Elite Selection', subtitle: 'High design audio & peripherals', bgColor: '#bdc3c7' }, festivals: 'National Unity Day', trend: 'Acoustic monitoring headwear' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', currency: 'USD', languages: ['English'], shippingCountry: 'Zimbabwe', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Harare Premium Selections', subtitle: 'Rugged multi-sport watches', bgColor: '#34495e' }, festivals: 'Independence Day', trend: 'GPS tracking wrist monitors' },
  // Placeholders to reach exactly 105 total countries
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', currency: 'EUR', languages: ['Catalan'], shippingCountry: 'Andorra', taxRules: 'VAT - 4.5%', taxRate: 0.045, offers: [], banners: { title: 'Andorra Luxury', subtitle: 'Premium alpine gear', bgColor: '#34495e' }, festivals: 'Our Lady of Meritxell', trend: 'Sport altimeters' },
  { code: 'AG', name: 'Antigua & Barbuda', flag: '🇦🇬', currency: 'USD', languages: ['English'], shippingCountry: 'Antigua', taxRules: 'ABST - 15%', taxRate: 0.15, offers: [], banners: { title: 'Antigua Resort Edit', subtitle: 'Leisure optics & tools', bgColor: '#2980b9' }, festivals: 'Independence Day', trend: 'Sailing active wearables' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', currency: 'USD', languages: ['English'], shippingCountry: 'Bahamas', taxRules: 'VAT - 10%', taxRate: 0.10, offers: [], banners: { title: 'Bahamas Elite Life', subtitle: 'Marine active wearables', bgColor: '#1abc9c' }, festivals: 'Independence Day', trend: 'Polarized marine timers' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', currency: 'USD', languages: ['English'], shippingCountry: 'Barbados', taxRules: 'VAT - 17.5%', taxRate: 0.175, offers: [], banners: { title: 'Barbados Coastal Prestiges', subtitle: 'Yacht luxury watches', bgColor: '#2c3e50' }, festivals: 'Independence Day', trend: 'Waterproof chronometers' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', currency: 'USD', languages: ['English'], shippingCountry: 'Belize', taxRules: 'GST - 12.5%', taxRate: 0.125, offers: [], banners: { title: 'Belizean Wilderness Tech', subtitle: 'Outdoor active monitors', bgColor: '#27ae60' }, festivals: 'Independence Day', trend: 'Submersible dive timers' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', currency: 'USD', languages: ['English'], shippingCountry: 'Fiji', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Fiji Elite Escape', subtitle: 'Waterproof sports tools', bgColor: '#3498db' }, festivals: 'Fiji Day Celebration', trend: 'Marine dive smartwatches' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩', currency: 'USD', languages: ['English'], shippingCountry: 'Grenada', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Grenada Elite Selection', subtitle: 'Seaside style items', bgColor: '#16a085' }, festivals: 'Independence Day', trend: 'Waterproof sports audio' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', currency: 'USD', languages: ['English'], shippingCountry: 'Guyana', taxRules: 'VAT - 14%', taxRate: 0.14, offers: [], banners: { title: 'Guyanese Premium Hub', subtitle: 'Adventure fitness gadgets', bgColor: '#7f8c8d' }, festivals: 'Republic Day', trend: 'Rugged smart wristwatches' },
  { code: 'KN', name: 'St. Kitts & Nevis', flag: '🇰🇳', currency: 'USD', languages: ['English'], shippingCountry: 'St. Kitts', taxRules: 'VAT - 17%', taxRate: 0.17, offers: [], banners: { title: 'St. Kitts Premium Selections', subtitle: 'Luxury marine electronics', bgColor: '#bdc3c7' }, festivals: 'Independence Day', trend: 'Dive wrist chronographs' },
  { code: 'LC', name: 'St. Lucia', flag: '🇱🇨', currency: 'USD', languages: ['English'], shippingCountry: 'St. Lucia', taxRules: 'VAT - 12.5%', taxRate: 0.125, offers: [], banners: { title: 'St. Lucian Prestige Living', subtitle: 'Marine sports trackers', bgColor: '#2980b9' }, festivals: 'Independence Day', trend: 'Waterproof marine trackers' },
  { code: 'VC', name: 'St. Vincent & Grenadines', flag: '🇻🇨', currency: 'USD', languages: ['English'], shippingCountry: 'St. Vincent', taxRules: 'VAT - 16%', taxRate: 0.16, offers: [], banners: { title: 'St. Vincent Resort Edit', subtitle: 'Premium marine gear', bgColor: '#1abc9c' }, festivals: 'Independence Day', trend: 'Marine navigation watches' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', currency: 'USD', languages: ['Samoan', 'English'], shippingCountry: 'Samoa', taxRules: 'VAGST - 15%', taxRate: 0.15, offers: [], banners: { title: 'Samoan Elite Selections', subtitle: 'Waterproof dive monitors', bgColor: '#34495e' }, festivals: 'Independence Day', trend: 'Submersible multi-sport watches' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴', currency: 'USD', languages: ['Tongan', 'English'], shippingCountry: 'Tonga', taxRules: 'CT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Tongan Elite Selections', subtitle: 'Outdoor marine electronics', bgColor: '#2c3e50' }, festivals: 'National Day', trend: 'Rugged water sport trackers' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', currency: 'USD', languages: ['English', 'French'], shippingCountry: 'Vanuatu', taxRules: 'VAT - 15%', taxRate: 0.15, offers: [], banners: { title: 'Vanuatu Coastal Selections', subtitle: 'Submersible dive wrist trackers', bgColor: '#16a085' }, festivals: 'Independence Day', trend: 'Heavy-duty marine smartwatches' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', currency: 'EUR', languages: ['French', 'Italian', 'English'], shippingCountry: 'Monaco', taxRules: 'TVA - 20%', taxRate: 0.20, offers: [], banners: { title: 'Monaco Prestige Yachting', subtitle: 'Exquisite premium chronographs & sound', bgColor: '#f1c40f' }, festivals: 'Sovereign Prince\'s Day', trend: 'Luxury custom watches, studio acoustics' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲', currency: 'EUR', languages: ['Italian'], shippingCountry: 'San Marino', taxRules: 'Single Stage Tax - 17%', taxRate: 0.17, offers: [], banners: { title: 'San Marino Classical Edit', subtitle: 'Curated designs', bgColor: '#bdc3c7' }, festivals: 'Republic Anniversary', trend: 'Minimalist desk enhancements' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', currency: 'CHF', languages: ['German'], shippingCountry: 'Liechtenstein', taxRules: 'VAT - 8.1%', taxRate: 0.081, offers: [], banners: { title: 'Vaduz Precision Atelier', subtitle: 'Elite aerospace timepieces', bgColor: '#e74c3c' }, festivals: 'National Day', trend: 'Aerospace watch gear' }
];
