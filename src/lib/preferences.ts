// Global preferences utilities and metadata for the frontend.

export interface UserPreferences {
  country: string;
  language: string;
  currency: string;
  timezone: string;
  units: 'Metric' | 'Imperial';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  theme: 'Light' | 'Dark' | 'System';
}

export interface CurrencyDetails {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export const FALLBACK_CURRENCIES: CurrencyDetails[] = [
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

// Fallback rates map
export const FALLBACK_RATES: Record<string, number> = {};
FALLBACK_CURRENCIES.forEach(c => {
  FALLBACK_RATES[c.code] = c.rate;
});

/**
 * Convert USD price to target currency using available rates
 */
export function convertPrice(priceUSD: number, targetCurrency: string, rates?: Record<string, number>): number {
  const currentRates = rates && Object.keys(rates).length > 0 ? rates : FALLBACK_RATES;
  const rate = currentRates[targetCurrency] || 1.0;
  return priceUSD * rate;
}

/**
 * Formats a currency amount with the appropriate symbol.
 * Specifically handles Indian Lakhs & Crores formatting when INR is chosen.
 */
export function formatCurrency(amountUSD: number, targetCurrency: string = 'USD', rates?: Record<string, number>): string {
  const converted = convertPrice(amountUSD, targetCurrency, rates);
  
  if (targetCurrency === 'INR') {
    // Indian formatting rules: commas at thousand, then every two digits
    const parts = converted.toFixed(2).split('.');
    let x = parts[0];
    const decimal = parts[1] ? '.' + parts[1] : '';
    
    let lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + decimal;
    return '₹' + res;
  }

  // Find symbol
  const match = FALLBACK_CURRENCIES.find(c => c.code === targetCurrency);
  const symbol = match ? match.symbol : targetCurrency + ' ';
  
  return symbol + converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format a standard ISO date string to user preferred date format.
 */
export function formatDate(dateString: string, format: string = 'MM/DD/YYYY'): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear());
    
    if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    } else if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    } else {
      return `${month}/${day}/${year}`;
    }
  } catch {
    return dateString;
  }
}

/**
 * Dynamic Unit Conversions:
 * Formats weights and dimensions dynamically based on metric vs imperial choice
 */
export function formatWeight(weightGrams: number, preferredUnits: 'Metric' | 'Imperial' = 'Metric'): string {
  if (preferredUnits === 'Imperial') {
    const lbs = weightGrams / 453.59237;
    if (lbs < 1) {
      const oz = lbs * 16;
      return `${oz.toFixed(1)} oz`;
    }
    return `${lbs.toFixed(2)} lbs`;
  }
  
  if (weightGrams >= 1000) {
    return `${(weightGrams / 1000).toFixed(2)} kg`;
  }
  return `${weightGrams} g`;
}

export function formatDimension(mm: number, preferredUnits: 'Metric' | 'Imperial' = 'Metric'): string {
  if (preferredUnits === 'Imperial') {
    const inches = mm / 25.4;
    return `${inches.toFixed(1)} in`;
  }
  if (mm >= 10) {
    return `${(mm / 10).toFixed(1)} cm`;
  }
  return `${mm} mm`;
}

export interface LocalizationData {
  currency: string;
  languages: string[];
  shippingDays: number;
  taxRate: number;
  taxName: string;
  festival: {
    name: string;
    description: string;
    bannerUrl: string;
  } | null;
  trendingSearch: string;
  offers: string[];
  bannerText: {
    title: string;
    subtitle: string;
    tagline: string;
  };
}

/**
 * Returns dynamic, cascading localized metadata based on user's country selection.
 * Fully customized like Amazon.
 */
export function getLocalizationDetails(country: string): LocalizationData {
  const norm = (country || 'United States').trim().toLowerCase();
  
  if (norm.includes('india')) {
    return {
      currency: 'INR',
      languages: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'],
      shippingDays: 2,
      taxRate: 0.18,
      taxName: 'GST (18%)',
      festival: {
        name: '🪔 Festive Diwali & Dussehra Grand Sale 🪔',
        description: 'Celebrate the Festival of Lights with dynamic 50% checkout cashbacks & express hand delivery across all Indian cities.',
        bannerUrl: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=1600&auto=format&fit=crop&q=80'
      },
      trendingSearch: 'premium brass oil lamps, pure wool pashmina shawls, walnut tech workspace',
      offers: [
        '✨ Festive Welcome: ₹1,000 instant cashback on your first wallet reload!',
        '💳 Ocean Cards Offer: Extra 10% instant discount on major local banks',
        '🚚 Zero-cost delivery across 15,000+ pin codes in India!'
      ],
      bannerText: {
        title: 'Shubh Deepawali Celebration.',
        subtitle: 'Authentic handcrafted brass, walnut solid organizers, and precision studio sound engineered for local homes.',
        tagline: 'INDIA LOCALIZED DISCOVERY'
      }
    };
  } else if (norm.includes('united kingdom') || norm.includes('uk') || norm.includes('great britain')) {
    return {
      currency: 'GBP',
      languages: ['English', 'Welsh', 'Gaelic'],
      shippingDays: 1,
      taxRate: 0.20,
      taxName: 'VAT (20%)',
      festival: {
        name: '🇬🇧 Royal Summer Solstice Festival 🇬🇧',
        description: 'Enjoy exclusive Royal Club lounge benefits, zero VAT on essential home items, and ultra-expedited next-day delivery.',
        bannerUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?w=1600&auto=format&fit=crop&q=80'
      },
      trendingSearch: 'tweed audio cases, luxury rainwater botanicals, high-precision thermal mugs',
      offers: [
        '✨ UK Exclusive: £50 welcome bonus on setting up Direct Debit',
        '🚚 Standard Next-Day Royal Courier included on all premium tech catalog orders',
        '🎟️ Save 15% on high-fidelity noise cancelling audio series with voucher code SUMMER24'
      ],
      bannerText: {
        title: 'British Sound & Solstice Design.',
        subtitle: 'Engineered for London weather with resilient coatings and warm editorial wool finishes.',
        tagline: 'ROYAL COURIER GUARANTEE'
      }
    };
  } else if (norm.includes('canada')) {
    return {
      currency: 'CAD',
      languages: ['English', 'French'],
      shippingDays: 3,
      taxRate: 0.13,
      taxName: 'HST (13%)',
      festival: {
        name: '🍁 Happy Canada Day Celebration 🍁',
        description: 'Sizzle up with 20% off all modern ergonomic workspace organizers and zero shipping across all provinces.',
        bannerUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=1600&auto=format&fit=crop&q=80'
      },
      trendingSearch: 'hardwood maple docks, sub-zero battery packs, thermal desk pads',
      offers: [
        '🍁 Canada Special: CA$75 signup gift on active digital wallet deposits of CA$200+',
        '🚚 Free shipping on remote post-codes and major metropolitan zones alike',
        '🛡️ Enhanced Canadian duty coverage - fully prepayed customs checkout guarantees!'
      ],
      bannerText: {
        title: 'Great White North Ergonomics.',
        subtitle: 'Authentic Canadian Walnut, maple structural alloys, and heavy weather acoustics.',
        tagline: 'MAPLE WOOD EXPERTS'
      }
    };
  } else if (norm.includes('japan')) {
    return {
      currency: 'JPY',
      languages: ['Japanese', 'English'],
      shippingDays: 1,
      taxRate: 0.10,
      taxName: 'Consumption Tax (10%)',
      festival: {
        name: '🌸 Hanami Sakura Season Cherry Blossom 🌸',
        description: 'Immerse in minimalist design aesthetics with custom wood finishes, origami tech wraps, and swift Tokyo logistics.',
        bannerUrl: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=1600&auto=format&fit=crop&q=80'
      },
      trendingSearch: 'origami audio sleeves, hinoki wood organizers, zero-clutter cable trays',
      offers: [
        '🌸 Sakura Welcome: ¥5,000 instant credit on card reloads of ¥20,000+',
        '🚚 Yamato Transport instant delivery within major Tokyo & Osaka districts',
        '🌿 100% sustainably-sourced Hinoki cedar workspace edition releases'
      ],
      bannerText: {
        title: 'Minimalist Tokyo Craftsmanship.',
        subtitle: 'Precision engineering celebrating silence, functional simplicity, and beautiful natural textures.',
        tagline: 'SHIBUI MINIMAL DESIGNS'
      }
    };
  } else if (norm.includes('germany') || norm.includes('deutschland')) {
    return {
      currency: 'EUR',
      languages: ['German', 'English'],
      shippingDays: 2,
      taxRate: 0.19,
      taxName: 'MwSt (19%)',
      festival: {
        name: '🍺 Munich Oktoberfest Jubilee 🍺',
        description: 'Prost! Benefit from 19% MwSt instant refunds, free structural alloy upgrades, and DHL Express shipping.',
        bannerUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&auto=format&fit=crop&q=80'
      },
      trendingSearch: 'brutalist concrete docks, high-performance mechanical caps, anilox leather trays',
      offers: [
        '✨ Germany Special: €50 starting credits on direct SEPA authorization',
        '🚚 Eco-friendly carbon-neutral DHL shipping standard on all local orders',
        '🛡️ Certified 5-Year European Union replacement warranties on structural workspace metals'
      ],
      bannerText: {
        title: 'Bauhaus Functional Bauhaus.',
        subtitle: 'Meticulously crafted with clinical precision, structural integrity, and architectural grade alloys.',
        tagline: 'DEUTSCHLAND PRECISION'
      }
    };
  } else if (norm.includes('united arab emirates') || norm.includes('uae') || norm.includes('dubai')) {
    return {
      currency: 'AED',
      languages: ['Arabic', 'English'],
      shippingDays: 1,
      taxRate: 0.05,
      taxName: 'VAT (5%)',
      festival: {
        name: '🕌 Grand Dubai Shopping Festival 🕌',
        description: 'Experience ultra-luxury with VIP priority courier, complimentary leather custom gold monogramming, and tax-free bargains.',
        bannerUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&auto=format&fit=crop&q=80'
      },
      trendingSearch: 'gold-plated audio dials, top-grain camel leather trays, climate-controlled organizers',
      offers: [
        '🕌 Dubai VIP Welcome: AED 250 credit applied immediately to premium metal Ocean accounts',
        '🚚 Same-day courier drone drop-off simulation within major skyscraper residential areas',
        '🎟️ Complimentary access to Ocean Premium Lounge at Dubai Mall'
      ],
      bannerText: {
        title: 'Elite Golden Sands Ergonomics.',
        subtitle: 'Ultra-luxurious custom leather, precious gold highlights, and temperature-immune precision tech.',
        tagline: 'DUBAI ULTRA LUXURY'
      }
    };
  } else if (norm.includes('australia')) {
    return {
      currency: 'AUD',
      languages: ['English'],
      shippingDays: 3,
      taxRate: 0.10,
      taxName: 'GST (10%)',
      festival: {
        name: '🐨 Southern Cross Outback Festival 🐨',
        description: 'Stay relaxed with extra cooling gel workspace desk pads, water-sealed active noise headphones, and fast shipping.',
        bannerUrl: 'https://images.unsplash.com/photo-1524820197278-540916411e20?w=1600&auto=format&fit=crop&q=80'
      },
      trendingSearch: 'eucalyptus wood stands, sand-resistant tech sleeves, marine-grade keycaps',
      offers: [
        '🐨 Aussie Welcome: A$60 signup reward on active digital wallet deposits of A$150+',
        '🚚 Australia-wide express air dispatch including remote territorial outposts',
        '🌿 10% proceeds donated directly to Great Barrier Reef restoration fund'
      ],
      bannerText: {
        title: 'Outback Ruggedized Studio.',
        subtitle: 'Marine-grade alloys, water-sealed active noise, and sustainable eucalyptus woods.',
        tagline: 'SOUTHERN CROSS OUTBACK'
      }
    };
  }
  
  // Default fallback (e.g. United States)
  return {
    currency: 'USD',
    languages: ['English', 'Spanish'],
    shippingDays: 2,
    taxRate: 0.08,
    taxName: 'Sales Tax (8%)',
    festival: {
      name: '🇺🇸 Independence Day Grand Celebration 🇺🇸',
      description: 'Upgrade your digital lifestyle with special sitewide price drops and free 2-day delivery across all US states.',
      bannerUrl: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=1600&auto=format&fit=crop&q=80'
    },
    trendingSearch: 'walnut workspace, wireless audio lab, minimalist desk, led accessories',
    offers: [
      '✨ Welcome Bonus: $50 instant gift card credits on account creation',
      '🚚 Free 2-Day Shipping on all standard metropolitan cart orders over $100',
      '🎟️ Apply code WELCOME50 on checkout to receive $50 sandbox credits instantly!'
    ],
    bannerText: {
      title: 'Ocean Premium Engineering.',
      subtitle: 'Uncompromising aesthetics, functional minimalism, and durable alloys. Meticulously localized for your exact style.',
      tagline: 'OCEAN MASTER LABS'
    }
  };
}
