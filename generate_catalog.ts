import fs from 'fs';
import path from 'path';

// Output directory configuration
const OUTPUT_DIR = path.join(process.cwd(), 'products');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// -------------------------------------------------------------
// CONSTANTS & TARGET COUNTS
// -------------------------------------------------------------
const TOTAL_PRODUCTS_TARGET = 18000;
const TOTAL_SELLERS_COUNT = 500;
const REVIEWS_PER_PRODUCT = 6; // 18,000 * 6 = 108,000 reviews!
const TOTAL_BRANDS_COUNT = 310;
const TOTAL_COLLECTIONS_COUNT = 160;

// Helper to slugify strings
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Helper to choose random items
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -------------------------------------------------------------
// 1. GENERATE SELLERS (500)
// -------------------------------------------------------------
console.log('Generating 500 unique sellers...');
const STATES_CITIES = [
  { country: 'United States', state: 'California', city: 'San Jose', warehouses: ['WH-US-WEST-1', 'WH-US-WEST-2'] },
  { country: 'United States', state: 'New York', city: 'Buffalo', warehouses: ['WH-US-EAST-1'] },
  { country: 'Germany', state: 'Bavaria', city: 'Munich', warehouses: ['WH-EU-CENTRAL-1'] },
  { country: 'Singapore', state: 'Central Region', city: 'Singapore', warehouses: ['WH-APAC-SG-1'] },
  { country: 'India', state: 'Maharashtra', city: 'Mumbai', warehouses: ['WH-IN-WEST-1', 'WH-IN-MUMBAI-2'] },
  { country: 'United Kingdom', state: 'England', city: 'London', warehouses: ['WH-UK-NORTH-1'] },
  { country: 'Japan', state: 'Tokyo', city: 'Yokohama', warehouses: ['WH-JP-EAST-1'] },
  { country: 'Australia', state: 'New South Wales', city: 'Sydney', warehouses: ['WH-AUS-EAST-1'] }
];

const SELLER_ADJECTIVES = ['Alpha', 'Vanguard', 'Apex', 'Zenith', 'Nova', 'Prime', 'Elite', 'Global', 'Direct', 'Super', 'Express', 'Curated', 'Nexus', 'Elysium', 'Meridian', 'Summit', 'Pulse', 'Aura'];
const SELLER_NOUNS = ['Retailers', 'Distributors', 'Merchants', 'Boutique', 'Mart', 'Zone', 'Depot', 'Logistics', 'Supplies', 'Solutions', 'Goods', 'Hub', 'Stall', 'Market', 'Emporium', 'Trading'];

interface Seller {
  sellerId: string;
  name: string;
  logo: string;
  rating: number;
  followers: number;
  responseRate: number;
  responseTime: string;
  joinedDate: string;
  verifiedBadge: boolean;
  fulfillmentRate: number;
  gstNumber: string;
  country: string;
  state: string;
  city: string;
  warehouseLocations: string[];
  yearsOnPlatform: number;
  businessDescription: string;
}

const sellers: Seller[] = [];
for (let i = 1; i <= TOTAL_SELLERS_COUNT; i++) {
  const loc = STATES_CITIES[i % STATES_CITIES.length];
  const adj = SELLER_ADJECTIVES[i % SELLER_ADJECTIVES.length];
  const noun = SELLER_NOUNS[Math.floor(i / 1.5) % SELLER_NOUNS.length];
  const suffix = i > SELLER_ADJECTIVES.length * SELLER_NOUNS.length ? ` ${Math.ceil(i / 100)}` : '';
  const storeName = `${adj} ${noun}${suffix}`;

  sellers.push({
    sellerId: `sell-${i}`,
    name: storeName,
    logo: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80&sig=s-${i}`,
    rating: parseFloat((4.1 + Math.random() * 0.9).toFixed(1)),
    followers: Math.floor(1200 + Math.random() * 198800),
    responseRate: Math.floor(90 + Math.random() * 10),
    responseTime: Math.random() > 0.6 ? 'Within 10 minutes' : 'Within 1 hour',
    joinedDate: new Date(2018 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
    verifiedBadge: Math.random() > 0.25,
    fulfillmentRate: Math.floor(96 + Math.random() * 4),
    gstNumber: `GSTIN${randomInt(10, 99)}ABCDE${randomInt(1000, 9999)}F${randomInt(1, 9)}Z${randomInt(0, 9)}`,
    country: loc.country,
    state: loc.state,
    city: loc.city,
    warehouseLocations: loc.warehouses,
    yearsOnPlatform: randomInt(1, 8),
    businessDescription: `Official verified merchant store of ${storeName}, specializing in top-quality consumer products and global premium fulfillment.`
  });
}

// Save sellers file
fs.writeFileSync(path.join(OUTPUT_DIR, 'sellers.json'), JSON.stringify(sellers, null, 2), 'utf-8');
console.log(`-> Wrote ${sellers.length} sellers to products/sellers.json`);


// -------------------------------------------------------------
// 2. GENERATE BRANDS (310)
// -------------------------------------------------------------
console.log('Generating 310 unique brands...');
const CORE_REAL_BRANDS = [
  'Apple', 'Samsung', 'Google', 'Sony', 'Microsoft', 'OnePlus', 'Nothing', 'Xiaomi', 'ASUS', 'Lenovo', 'HP', 'Dell',
  'Acer', 'LG', 'Canon', 'Nikon', 'Bose', 'JBL', 'Marshall', 'Logitech', 'Razer', 'Nike', 'Adidas', 'Puma', "Levi's",
  'H&M', 'Zara', 'Allen Solly', 'Louis Philippe', 'Titan', 'Fossil', 'Casio', 'Tissot', 'Seiko', 'Rolex', 'Philips',
  'Dyson', 'KitchenAid', 'IKEA', 'Lego', 'Hasbro', 'Mattel'
];

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  rating: number;
  originCountry: string;
  yearEstablished: number;
  description: string;
}

const brands: Brand[] = [];
for (let i = 1; i <= TOTAL_BRANDS_COUNT; i++) {
  let name = '';
  if (i <= CORE_REAL_BRANDS.length) {
    name = CORE_REAL_BRANDS[i - 1];
  } else {
    // Generate high quality sub-brand / custom series names
    const prefixes = ['Quantum', 'Aether', 'Aura', 'Vanguard', 'Elysium', 'Meridian', 'Apex', 'Zenith', 'Equinox', 'Nova', 'Crest', 'Sartorial', 'Verdant', 'Pulse', 'Oasis', 'Volta', 'Lumina'];
    const suffixes = ['Labs', 'Design', 'Gear', 'Dynamics', 'Goods', 'Instruments', 'Styles', 'Acoustics', 'Athletics', 'Concepts', 'Pro', 'Studio', 'Wear'];
    name = `${prefixes[i % prefixes.length]} ${suffixes[Math.floor(i / prefixes.length) % suffixes.length]} ${Math.ceil(i / 100)}`;
  }

  brands.push({
    id: `brand-${i}`,
    name,
    slug: slugify(name),
    logo: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80&sig=b-${i}`,
    rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
    originCountry: randomChoice(['USA', 'Germany', 'Japan', 'South Korea', 'Singapore', 'UK', 'Sweden', 'Italy']),
    yearEstablished: randomInt(1920, 2024),
    description: `Leading innovator in high-quality design, engineering, and customer satisfaction for ${name} collections.`
  });
}

// Save brands file
fs.writeFileSync(path.join(OUTPUT_DIR, 'brands.json'), JSON.stringify(brands, null, 2), 'utf-8');
console.log(`-> Wrote ${brands.length} brands to products/brands.json`);


// -------------------------------------------------------------
// 3. GENERATE CATEGORIES & COLLECTIONS (160)
// -------------------------------------------------------------
console.log('Generating taxonomy (categories & 160 collections)...');

// Explicit Taxonomy Mapping
const CATEGORY_MAP: Record<string, { subcategories: string[]; files: string[] }> = {
  'Mobiles': {
    subcategories: ['Smartphones', 'Feature Phones', 'Phone Cases', 'Chargers', 'Power Banks'],
    files: ['mobiles.json']
  },
  'Laptops': {
    subcategories: ['Laptops', 'Gaming Laptops', 'MacBooks', 'Desktop PCs', 'Monitors', 'Computer Components', 'Processors', 'Graphics Cards', 'Motherboards', 'RAM', 'SSD', 'HDD'],
    files: ['laptops.json']
  },
  'Televisions': {
    subcategories: ['Televisions', 'Streaming Devices', 'Gaming Consoles', 'PlayStation', 'Xbox', 'Nintendo', 'Games', 'VR Headsets'],
    files: ['televisions.json']
  },
  'Electronics': {
    subcategories: ['Smart Watches', 'Earbuds', 'Headphones', 'Cameras', 'DSLR', 'Mirrorless', 'Action Cameras', 'Drones', 'Networking', 'Routers', 'Printers', 'Projectors', 'Speakers'],
    files: ['electronics.json']
  },
  'Fashion Men': {
    subcategories: ["Men's Clothing", "Winter Wear", "Summer Collection", "Shoes", "Sneakers", "Running Shoes", "Sandals", "Slippers", "Boots", "Wallets", "Belts", "Sunglasses"],
    files: ['fashion-men.json']
  },
  'Fashion Women': {
    subcategories: ["Women's Clothing", "Kids Fashion", "Baby Clothing", "Jewelry", "Handbags", "Bags", "Watches"],
    files: ['fashion-women.json']
  },
  'Sports': {
    subcategories: ['Exercise Equipment', 'Gym Equipment', 'Cycles', 'Outdoor Recreation', 'Cricket', 'Football', 'Basketball', 'Swimming', 'Yoga'],
    files: ['sports.json']
  },
  'Books': {
    subcategories: ['Fiction', 'Non-Fiction', 'Comics', 'Manga', 'Educational', 'Novels', 'Programming', 'Competitive Exams'],
    files: ['books.json']
  },
  'Beauty': {
    subcategories: ['Skincare', 'Haircare', 'Perfumes', 'Makeup', 'Personal Care', 'Men Grooming'],
    files: ['beauty.json']
  },
  'Home': {
    subcategories: ['Kitchen Appliances', 'Cookware', 'Tableware', 'Bedding', 'Home Decor', 'Lighting', 'Bathroom', 'Furniture', 'Storage', 'Cleaning', 'Garden'],
    files: ['home.json']
  },
  'Toys': {
    subcategories: ['Action Figures', 'Educational Toys', 'LEGO', 'Remote Cars', 'Board Games', 'Puzzles'],
    files: ['toys.json']
  },
  'Other': {
    subcategories: ['Automotive', 'Helmets', 'Car Accessories', 'Bike Accessories', 'Lubricants', 'Tyres', 'Pet Supplies', 'Musical Instruments', 'Office Supplies', 'Industrial Equipment', 'Luxury Goods', 'Health Devices', 'Medical Equipment', 'Groceries', 'Organic Foods', 'Beverages'],
    files: ['other.json']
  }
};

const MAIN_CATEGORIES_KEYS = Object.keys(CATEGORY_MAP);

// Format and save categories.json
const categoriesOutput = MAIN_CATEGORIES_KEYS.map((name, index) => ({
  id: `cat-${index + 1}`,
  name,
  slug: slugify(name),
  subcategories: CATEGORY_MAP[name].subcategories
}));
fs.writeFileSync(path.join(OUTPUT_DIR, 'categories.json'), JSON.stringify(categoriesOutput, null, 2), 'utf-8');
console.log(`-> Wrote categories schema to products/categories.json`);

// 160 Curated Collections
const COLLECTION_PREFIXES = ['Autumn Luxe', 'Eco Choice', 'Studio Series', 'Cyberpunk Tech', 'Silent Luxury', 'Urban Explorer', 'Active Pro', 'Artisanal Crafted', 'Nordic Space', 'Heritage Classic', 'Modular Living', 'Midnight Edition', 'Neon Glow', 'Botanical Refresh', 'Retro Wave', 'Genesis'];
const COLLECTION_SUFFIXES = ['Collection', 'Curations', 'Aesthetics', 'Essentials', 'Picks', 'Vault', 'Lineup', 'Innovations', 'Selects', 'Basics'];

const collections: { id: string; name: string; slug: string; description: string }[] = [];
for (let i = 1; i <= TOTAL_COLLECTIONS_COUNT; i++) {
  const pfx = COLLECTION_PREFIXES[i % COLLECTION_PREFIXES.length];
  const sfx = COLLECTION_SUFFIXES[Math.floor(i / COLLECTION_PREFIXES.length) % COLLECTION_SUFFIXES.length];
  const name = `${pfx} ${sfx}`;
  collections.push({
    id: `col-${i}`,
    name,
    slug: slugify(name),
    description: `A meticulously curated, high-end thematic release featuring the ultimate ${name} standards.`
  });
}
fs.writeFileSync(path.join(OUTPUT_DIR, 'collections.json'), JSON.stringify(collections, null, 2), 'utf-8');
console.log(`-> Wrote ${collections.length} collections to products/collections.json`);


// -------------------------------------------------------------
// 4. GENERATE SYNONYMS & WAREHOUSES
// -------------------------------------------------------------
const synonymsData: Record<string, string[]> = {
  'phone': ['smartphone', 'cellphone', 'mobile', 'feature phone'],
  'laptop': ['notebook', 'macbook', 'gaming pc', 'computer'],
  'headphones': ['earbuds', 'headset', 'speakers', 'earphones'],
  'shoes': ['sneakers', 'running shoes', 'boots', 'footwear'],
  'watch': ['smart watch', 'timepiece', 'chronograph'],
  'shirt': ['t-shirt', 'clothing', 'apparel', 'top'],
  'sofa': ['couch', 'furniture', 'chair', 'lounge'],
  'book': ['novel', 'manga', 'textbook', 'comics']
};
fs.writeFileSync(path.join(OUTPUT_DIR, 'synonyms.json'), JSON.stringify(synonymsData, null, 2), 'utf-8');

const warehouseLocations = [
  { id: 'WH-US-WEST-1', name: 'Silicon Valley Logistics Hub', capacity: 500000, state: 'California', city: 'San Jose' },
  { id: 'WH-US-WEST-2', name: 'Pacific Northwest Warehouse', capacity: 250000, state: 'Oregon', city: 'Portland' },
  { id: 'WH-US-EAST-1', name: 'Tristate Fulfillment Center', capacity: 750000, state: 'New York', city: 'Buffalo' },
  { id: 'WH-EU-CENTRAL-1', name: 'Frankfurt Central Distribution', capacity: 600000, state: 'Bavaria', city: 'Munich' },
  { id: 'WH-APAC-SG-1', name: 'Changi Global Port Depot', capacity: 800000, state: 'Central Region', city: 'Singapore' },
  { id: 'WH-IN-WEST-1', name: 'JNPT Port Industrial Compound', capacity: 1000000, state: 'Maharashtra', city: 'Mumbai' },
  { id: 'WH-IN-MUMBAI-2', name: 'Thane Smart Warehouse', capacity: 450000, state: 'Maharashtra', city: 'Mumbai' },
  { id: 'WH-UK-NORTH-1', name: 'Manchester Gateway Hub', capacity: 350000, state: 'England', city: 'Manchester' },
  { id: 'WH-JP-EAST-1', name: 'Tokyo Bay Automated Compound', capacity: 900000, state: 'Tokyo', city: 'Yokohama' },
  { id: 'WH-AUS-EAST-1', name: 'Sydney Botany Cargo Facility', capacity: 400000, state: 'New South Wales', city: 'Sydney' }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'warehouse.json'), JSON.stringify(warehouseLocations, null, 2), 'utf-8');


// -------------------------------------------------------------
// 5. HELPER TEMPLATES FOR HIGH QUALITY COPYWRITING (NO LOREM IPSUM)
// -------------------------------------------------------------
const DESCRIPTORS = {
  'Mobiles': {
    features: ['Vibrant OLED Display', 'Pro-Grade Dual Camera System', 'Long-lasting Battery Life', 'High-Speed 5G Chipset'],
    highlights: ['Next-generation wireless charging and dynamic cooling', 'IP68 water and impact certification', 'Enhanced cryptographic storage partition', 'Premium physical aluminum and ceramic construction'],
    origin: 'South Korea'
  },
  'Laptops': {
    features: ['Thermal-Optimized Ventilation', 'Premium Backlit Mechanical Keyboard', 'Ultra-fast SSD Storage Expansion', 'Studio-Grade Display Panel'],
    highlights: ['Advanced modular upgradability for RAM and NVMe slots', 'Military-grade high-tensile structural integrity', 'Dual intelligent sub-cooling fan matrix', 'Hi-Res certified dynamic audio stage'],
    origin: 'Japan'
  },
  'Televisions': {
    features: ['Dolby Vision Atmospheric Sounding', 'Self-lit Active Matrix Pixels', 'Intelligent AI Super-Resolution Processor', 'Low-Latency Auto Gaming Profile'],
    highlights: ['Zero-bezel seamless architectural wall hanging', 'Smart Home hub controller capability', 'Whisper-quiet thermal fanless operations', 'Multi-room synchronized wireless casting'],
    origin: 'Japan'
  },
  'Electronics': {
    features: ['Precision-Engineered Acoustic Drivers', 'Multi-point Ambient Sync Wireless', 'Intuitive Tactile Operations Dial', 'High-Fidelity Audio Compression'],
    highlights: ['Adaptive noise suppression algorithms', 'Water-resistant workout safe construction', 'Sleek premium leather headband finish', 'Instant multi-device magnetic auto connection'],
    origin: 'Germany'
  },
  'Fashion Men': {
    features: ['Zero-drift Structural Double Stitching', 'Wrinkle-resistant Breathable Fiber Mesh', 'Premium Branded Custom-milled Buttons', 'Tailored Modern Athletic Ergonomics'],
    highlights: ['Preshrunk premium fiber-blend weave', 'Hidden secure zipper-locked stash pockets', 'Active moisture-wicking and quick-drying core', 'Engineered to last through 500+ wash cycles safely'],
    origin: 'Italy'
  },
  'Fashion Women': {
    features: ['Luxury Sourced Premium Threads', 'Elegant Draping Silhouette Design', 'Featherlight Breathable Summer Weave', 'High-contrast Aesthetic Detail Lines'],
    highlights: ['Double reinforced stress points for lifetime utility', 'Organic natural wax finish preservation', 'Designed in collaboration with European fashion houses', 'Hypoallergenic secure-clasp high-polish hardware'],
    origin: 'France'
  },
  'Sports': {
    features: ['High-tensile Non-slip Grip Coating', 'Dynamic Impact Shock Absorption', 'Precision-calibrated Resistance Gears', 'Lightweight Aerodynamic Profile'],
    highlights: ['Anti-rust electroplated weather coating', 'Integrated biometric performance telemetry sensors', 'Folds flat for compact minimal storage', 'Fully tested under extreme active strain curves'],
    origin: 'USA'
  },
  'Books': {
    features: ['Full-color Premium Linen Foil-Stamping', 'Eco-friendly High-opacity Acid-free Pages', 'Detailed Professional Diagrams & Indexing', 'Authoritative Comprehensive Guide Layout'],
    highlights: ['Includes exclusive access to smart web testing portals', 'Over 100 visual reference charts and blueprints', 'Foil embossed collector spine wrapping', 'Perfect-bound layout lay-flat reading optimization'],
    origin: 'USA'
  },
  'Beauty': {
    features: ['Organic Sourced Botanical Essences', 'Hypoallergenic Clinically Verified Base', 'Long-lasting Deep Moisture Retention', 'Ultra-refined Lightweight Serum Texture'],
    highlights: ['100% cruelty-free zero toxic chemicals certification', 'Infused with mineral micro-nutrients', 'Airless vacuum pump leakproof packaging', 'Visible results within 7 active days of usage'],
    origin: 'Japan'
  },
  'Home': {
    features: ['FSC-Certified Solid Hardwood base', 'Precision-milled Anti-corrosive Hinges', 'Food-grade Double Wall Insulation', 'Energy Efficient Quiet Motor Unit'],
    highlights: ['Stain-resistant scratch-proof sealant', 'Architectural structural space-saving profile', 'Easy 15-minute modular tool-less assembly', 'Designed to blend into contemporary interiors'],
    origin: 'Sweden'
  },
  'Toys': {
    features: ['Eco-friendly Certified Non-toxic Polycarbonate', 'Smooth Snug-fit Joint Integration', 'Bright Eye-safe Aesthetic Palette', 'Encourages Logical Three-dimensional Play'],
    highlights: ['Fully certified child safe impact resistance', 'Includes detailed step-by-step assembly guides', 'Compatible with global standard custom blocks', 'Lifetime structural piece replacement assurance'],
    origin: 'Denmark'
  },
  'Other': {
    features: ['Heavy-duty Industrial Grade Material', 'Certified Maximum Impact Protection', 'Waterproof Secure-seal Multi-latches', 'Ergonomic Easy-carry Balancing Handles'],
    highlights: ['Approved for all extreme climate operations', 'Anti-slip base pads for secure stationary placements', 'Double wall vibration absorbing composite shell', 'Includes comprehensive multi-use attachments kit'],
    origin: 'Germany'
  }
};

const IMAGES_TEMPLATES: Record<string, string[]> = {
  'Mobiles': ['photo-1511707171634-5f897ff02aa9', 'photo-1580910051074-3eb694886505', 'photo-1598327105666-5b89351aff97', 'photo-1565849652289-482262d05714'],
  'Laptops': ['photo-1496181130204-755241524eab', 'photo-1588872657578-7efd1f1555ed', 'photo-1603302576837-37561b2e2302', 'photo-1593642632823-8f785ba67e45'],
  'Televisions': ['photo-1593305841991-05c297ba4575', 'photo-1558885561-56c2a4e2f333', 'photo-1606813907291-d86efa9b94db', 'photo-1550745165-9bc0b252726f'],
  'Electronics': ['photo-1505740420928-5e560c06d30e', 'photo-1546868871-7041f2a55e12', 'photo-1545454675-3531b543be5d', 'photo-1516259762381-22954d7d3ad2'],
  'Fashion Men': ['photo-1539109136881-3be0616acf4b', 'photo-1549298916-b41d501d3772', 'photo-1505022610485-0249ba5b3675', 'photo-1516257984-b1b4d707412e'],
  'Fashion Women': ['photo-1483985988355-763728e1935b', 'photo-1524592094714-0f0654e20314', 'photo-1509631179647-0177331693ae', 'photo-1490481651871-ab68de25d43d'],
  'Sports': ['photo-1517838277536-f5f99be501cd', 'photo-1476480862126-209bfaa8edc8', 'photo-1507398941214-572c25f4b1dc', 'photo-1518611012118-696072aa579a'],
  'Books': ['photo-1544947950-fa07a98d237f', 'photo-1495446815901-a7297e633e8d', 'photo-1532012197267-da84d127e765', 'photo-1512820790803-83ca734da794'],
  'Beauty': ['photo-1522335789203-aabd1fc54bc9', 'photo-1598440947619-2c35fc9aa908', 'photo-1571781926291-c477ebfd024b', 'photo-1608248597279-f99d160bfcbc'],
  'Home': ['photo-1556911220-e15b29be8c8f', 'photo-1584346133934-a3afd2a33c4c', 'photo-1616486338812-3dadae4b4ace', 'photo-1505693416388-ac5ce068fe85'],
  'Toys': ['photo-1558060370-d644479cb6f7', 'photo-1610890716171-6b1bb98ffd09', 'photo-1566576912321-d748ef342d8c', 'photo-1596461404969-9ae70f2830c1'],
  'Other': ['photo-1516738901171-8eb4fc13bd20', 'photo-1506015391300-4802dc74de2e', 'photo-1500382017468-9049fed747ef', 'photo-1513151233558-d860c5398176']
};

const REVIEW_TEXTS_POSITIVE = [
  'Absolutely stellar quality. Surpassed all my expectations. The craftsmanship is flawless and heavy!',
  'A true quiet-luxury item. Looks extremely beautiful on my workspace and functions with zero drift.',
  'Highly recommend this to everyone! Superb modern engineering and lightning fast shipping.',
  'An outstanding product. The packaging is absolutely pristine, heavy, and the metal hinges feel premium.',
  'Zero regrets with this purchase. Premium quality, comfortable fit, and beautiful finish.',
  'Excellent value for the price. Built to last and looks highly architectural. Delighted with this purchase!'
];

const REVIEW_TEXTS_NEUTRAL = [
  'Good product overall. Meets the general specifications. However, the price point is slightly premium.',
  'Decent build quality. Functions as advertised, although delivery took an extra couple of days to arrive.',
  'Solid performance. It does exactly what you expect daily, but has some learning curves for full potential.',
  'Satisfactory product. A bit heavier than expected, but the structural elements are genuinely high-grade.'
];

const REVIEW_TEXTS_NEGATIVE = [
  'Slightly disappointed. Expected a more premium surface finish for this cost. Customer care was helpful though.',
  'Average quality. Arrived with a tiny cosmetic scuff mark. Works okay, but expected strict quality control.',
  'The unit works fine, but the user setup manual was missing in the package. Had to fetch the PDF online.'
];

const REVIEW_PROS_CONS = [
  { pros: ['Superb ergonomics', 'Excellent battery life'], cons: ['Slightly heavy base'] },
  { pros: ['Stunning OLED screen', 'Ultra fast response'], cons: ['Adapter sold separately'] },
  { pros: ['Premium thread weave', 'Pre-shrunk seams'], cons: ['Professional dry-clean only'] },
  { pros: ['Architectural solid timber', 'Zero wobble'], cons: ['Requires two people for assembly'] },
  { pros: ['Beautiful linen foil cover', 'Acid-free pages'], cons: ['Very heavy weight'] },
  { pros: ['100% organic, non-toxic', 'Visible glow'], cons: ['Expensive price tag'] }
];

const REVIEWER_NAMES = [
  'Sophia Sterling', 'Marcus Vance', 'Ethan Mercer', 'Olivia Sinclair', 'Liam Thorne',
  'Emma Westwood', 'Noah Sterling', 'Ava Dupont', 'Lucas Hayes', 'Isabella King',
  'Mason Cole', 'Mia Lindqvist', 'Jacob Shaw', 'Charlotte Croft', 'Elijah Niles',
  'Amelia Jaeger', 'James Knight', 'Harper Finch', 'Benjamin Tate', 'Evelyn Royce'
];


// -------------------------------------------------------------
// 6. MAIN MULTI-CHOOSE CATALOG LOOP (18,000 PRODUCTS)
// -------------------------------------------------------------
console.log(`Starting main generation loop for ${TOTAL_PRODUCTS_TARGET} products...`);

const productMetadata: {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  keywords: string[];
}[] = [];

// To write review records compact-by-compact
const reviewWriteStream = fs.createWriteStream(path.join(OUTPUT_DIR, 'reviews.json'), { encoding: 'utf-8' });
reviewWriteStream.write('[\n');

let reviewCounter = 0;
let globalProductCounter = 1;

// Prepare category-wise output arrays.
// Because 1,500 products * 12 files = 18,000 total, we generate them category file by category file!
const ADJECTIVES = ['Premium', 'Luxury', 'Minimalist', 'Eco-Friendly', 'Smart', 'Advanced', 'Classic', 'Pro', 'Ultra', 'Sleek', 'Durable', 'High-Performance', 'Tactile', 'Compact', 'Ergonomic', 'Reclaimed', 'Curated', 'Artisanal'];
const NOUN_MODIFIERS = ['Organic', 'Aerospace', 'Grade-A', 'Bamboo', 'Handcrafted', 'Anodized', 'Copper-infused', 'Double-shot', 'Wireless', 'Carbon-fiber', 'Breathable', 'Self-watering', 'Full-spectrum', 'High-excursion', 'Precision-milled'];

for (const catName of MAIN_CATEGORIES_KEYS) {
  const catConfig = CATEGORY_MAP[catName];
  const targetCount = 1500; // 1,500 per main category file -> exactly 18,000 total!
  const catProducts: any[] = [];
  
  console.log(`-> Generating ${targetCount} products for ${catName}...`);

  for (let j = 0; j < targetCount; j++) {
    const subcat = randomChoice(catConfig.subcategories);
    const mappedBrandObj = brands[(globalProductCounter % TOTAL_BRANDS_COUNT)];
    const brand = mappedBrandObj.name;
    const adj = randomChoice(ADJECTIVES);
    const mod = randomChoice(NOUN_MODIFIERS);
    
    const title = `${brand} ${adj} ${mod} ${subcat} ${globalProductCounter}`;
    const shortTitle = `${adj} ${subcat}`;
    const desc = `Elevate your lifestyle with the professional ${title}. Crafted in ${mappedBrandObj.originCountry} using high-grade structural components and dynamic ergonomics. Rated class-leading for durability, design aesthetic, and daily performance. Includes a full multi-year brand warranty.`;
    const shortDescription = `Enterprise grade, high-performance ${shortTitle} styled in sleek custom colors.`;
    
    const productId = `prod-${globalProductCounter}`;
    const slug = `${slugify(title)}-${globalProductCounter}`;
    
    // Pricing
    const isPremium = Math.random() > 0.8;
    const isLuxury = Math.random() > 0.95;
    const price = isLuxury 
      ? parseFloat((299.99 + Math.random() * 2200).toFixed(2)) 
      : (isPremium ? parseFloat((89.99 + Math.random() * 200).toFixed(2)) : parseFloat((12.99 + Math.random() * 75).toFixed(2)));
    
    const discountPercent = Math.random() > 0.4 ? randomInt(5, 45) : 0;
    const originalPrice = discountPercent > 0 
      ? parseFloat((price / (1 - discountPercent / 100)).toFixed(2)) 
      : price;

    const wholesalePrice = parseFloat((price * 0.6).toFixed(2));
    const emiOption = `Starting at $${(price / 12).toFixed(2)}/mo for 12 mos`;
    const coupon = Math.random() > 0.5 ? `SAVE${randomInt(5, 20)}` : '';
    const flashSalePrice = Math.random() > 0.85 ? parseFloat((price * 0.8).toFixed(2)) : null;

    // Inventory status
    const stockQty = Math.random() > 0.05 ? randomInt(1, 250) : 0;
    const reservedStock = Math.floor(stockQty * 0.1);
    let inventoryLabel = '';
    if (stockQty === 0) {
      inventoryLabel = 'Out of Stock';
    } else if (stockQty <= 3) {
      inventoryLabel = `Only ${stockQty} left in stock`;
    } else {
      inventoryLabel = `${stockQty} available`;
    }

    const warehouseMapping = randomChoice(warehouseLocations);

    // Unsplash Images Mapping
    const unsplashIds = IMAGES_TEMPLATES[catName] || IMAGES_TEMPLATES['Other'];
    const selectedBaseUnsplash = randomChoice(unsplashIds);
    const images: string[] = [];
    const imageCount = randomInt(6, 9);
    for (let imgIdx = 1; imgIdx <= imageCount; imgIdx++) {
      images.push(`https://images.unsplash.com/${selectedBaseUnsplash}?w=800&auto=format&fit=crop&q=80&sig=p-${globalProductCounter}-${imgIdx}`);
    }
    const thumbnail = images[0];

    // Seller mapping
    const sellerIdx = globalProductCounter % TOTAL_SELLERS_COUNT;
    const mappedSeller = sellers[sellerIdx];

    // Specifications setup
    const specifications: Record<string, string> = {
      'Manufacturer Origin': mappedBrandObj.originCountry,
      'Warranty Period': `${randomInt(1, 5)} Year Global Warranty`,
      'Core Material': `${mod} Composite Matrix`,
      'Safety Standard': 'CE, UL & RoHS Certified',
      'Structural Rating': 'Class-A Grade certified'
    };

    if (catName === 'Mobiles' || catName === 'Laptops') {
      specifications['RAM Memory'] = `${randomChoice(['8GB', '16GB', '32GB', '64GB'])} High-speed DDR5`;
      specifications['Display Technology'] = 'Full HDR Pro Retina Active-Matrix';
    }

    // Dynamic Tags
    const tags = [
      catName.toLowerCase(),
      subcat.toLowerCase(),
      brand.toLowerCase(),
      isLuxury ? 'luxury' : 'standard',
      'ocean-curated'
    ];

    // Recommendation IDs (interconnected using globalProductCounter offsets)
    const frequentlyBoughtTogether = [`prod-${Math.max(1, globalProductCounter - 1)}`, `prod-${Math.min(TOTAL_PRODUCTS_TARGET, globalProductCounter + 1)}`];
    const similarProducts = [`prod-${Math.max(1, globalProductCounter - 10)}`, `prod-${Math.min(TOTAL_PRODUCTS_TARGET, globalProductCounter + 12)}`];
    const accessories = [`prod-${Math.max(1, globalProductCounter - 2)}`, `prod-${Math.min(TOTAL_PRODUCTS_TARGET, globalProductCounter + 2)}`];
    const alternativeProducts = [`prod-${Math.max(1, globalProductCounter - 5)}`];
    const premiumUpgrade = [`prod-${Math.min(TOTAL_PRODUCTS_TARGET, globalProductCounter + 50)}`];
    const budgetAlternative = [`prod-${Math.max(1, globalProductCounter - 50)}`];
    const recentlyViewed = [`prod-${Math.max(1, globalProductCounter - 3)}`];
    const crossSell = [`prod-${Math.max(1, globalProductCounter + 100)}`];
    const upsell = [`prod-${Math.min(TOTAL_PRODUCTS_TARGET, globalProductCounter + 100)}`];

    // Analytics Metrics
    const views = randomInt(500, 100000);
    const cartAdditions = Math.floor(views * 0.15);
    const purchases = Math.floor(cartAdditions * 0.22);
    const wishlistCount = Math.floor(views * 0.08);

    // Assemble dynamic Product
    const p = {
      id: productId,
      name: title, // compat
      title,
      shortTitle,
      slug,
      sku: `OC-${catName.substring(0, 3).toUpperCase()}-${100000 + globalProductCounter}-${randomInt(10, 99)}`,
      barcode: `890${randomInt(1000000, 9999999)}${randomInt(100, 999)}`,
      sellerId: mappedSeller.sellerId,
      sellerName: mappedSeller.name,
      brand,
      brandId: mappedBrandObj.id,
      category: catName,
      subcategory: subcat,
      collection: collections[globalProductCounter % TOTAL_COLLECTIONS_COUNT].name,
      collectionId: collections[globalProductCounter % TOTAL_COLLECTIONS_COUNT].id,
      description: desc,
      shortDescription,
      specifications,
      features: DESCRIPTORS[catName]?.features || DESCRIPTORS['Other'].features,
      highlights: DESCRIPTORS[catName]?.highlights || DESCRIPTORS['Other'].highlights,
      boxContents: [`1 x Main ${shortTitle} Unit`, '1 x Quick Start User Guide', '1 x Premium Multi-voltage Power Adapter', '1 x Warranty Certificate'],
      warranty: specifications['Warranty Period'],
      returnPolicy: '30-Day Hassle-Free Full Refund Policy',
      countryOfOrigin: mappedBrandObj.originCountry,
      manufacturer: `${brand} Global Manufacturing Corp`,
      modelNumber: `OC-MOD-${globalProductCounter}`,
      launchDate: new Date(2025, randomInt(0, 11), randomInt(1, 28)).toISOString().split('T')[0],

      // Media
      images,
      image: thumbnail, // compat
      thumbnail,
      support360: true,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      arModelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',

      // Pricing
      price,
      mrp: originalPrice,
      sellingPrice: price, // compat
      discountPercentage: discountPercent,
      coupon,
      flashSalePrice,
      emi: emiOption,
      gst: 18,
      currency: 'USD',
      wholesalePrice,

      // Inventory
      stock: stockQty,
      reservedStock,
      warehouse: warehouseMapping.id,
      dispatchTime: stockQty > 0 ? 'Within 24 Hours' : 'Ships in 7 days',
      deliveryEstimate: `Delivered within ${randomInt(2, 5)} business days`,
      restockDate: stockQty === 0 ? new Date(2026, 7, randomInt(15, 30)).toISOString().split('T')[0] : null,
      lowStockThreshold: 10,

      // Relationships
      similarProducts,
      frequentlyBoughtTogether,
      accessories,
      alternativeProducts,
      premiumUpgrade,
      budgetAlternative,
      recentlyViewed,
      crossSell,
      upsell,

      // Search Optimization
      keywords: [brand.toLowerCase(), subcat.toLowerCase(), catName.toLowerCase(), adj.toLowerCase(), mod.toLowerCase(), ...tags],
      synonyms: synonymsData[subcat.toLowerCase()] || [shortTitle.toLowerCase()],
      searchTokens: [title.toLowerCase(), brand.toLowerCase(), subcat.toLowerCase()],
      embeddingPlaceholder: `VectorSpaceEmbedding-${productId}`,
      vectorId: `v-${globalProductCounter}`,
      rankingScore: parseFloat((Math.random() * 10).toFixed(2)),
      popularity: parseFloat((views / 100000).toFixed(3)),
      seasonality: randomChoice(['All-Season', 'Summer Peaks', 'Winter Premium']),
      searchFrequency: randomInt(1000, 500000),

      // AI Ready
      semanticMeta: `This is a high quality ${title} listed under ${catName} -> ${subcat} category. Designed beautifully with top components.`,
      recommendationMeta: `Recommended for curators looking for supreme premium aesthetics in ${catName}.`,
      aiSummary: `Review Summary for ${title}: Visual Appeal is rated exceptionally high (★★★★★). Built using premium structural elements, users praised the durable feel and modern aesthetics. Common feedback: extremely versatile but charger blocks/cases are sold separately.`,
      visualSearchToken: `visual-feature-matrix-${productId}`,
      smartBundles: [`bundle-${globalProductCounter}`, `bundle-${globalProductCounter + 1}`],

      // Analytics
      views,
      wishlistCount,
      cartAdditions,
      purchases,
      conversionRate: parseFloat(((purchases / views) * 100).toFixed(2)),
      returnRate: parseFloat((Math.random() * 3).toFixed(2)),
      refundRate: parseFloat((Math.random() * 1.5).toFixed(2)),
      repeatPurchaseRate: parseFloat((5 + Math.random() * 15).toFixed(1)),

      rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
      reviewsCount: REVIEWS_PER_PRODUCT
    };

    catProducts.push(p);

    // Save metadata for search index, recommendations, inventory compilation
    productMetadata.push({
      id: productId,
      title,
      category: catName,
      price,
      stock: stockQty,
      keywords: p.keywords
    });

    // Write compact dynamic reviews directly to our stream to scale beautifully
    for (let rIdx = 1; rIdx <= REVIEWS_PER_PRODUCT; rIdx++) {
      reviewCounter++;
      const revId = `rev-${globalProductCounter}-${rIdx}`;
      const rating = rIdx === REVIEWS_PER_PRODUCT ? 2 : (rIdx >= 4 ? randomChoice([5, 4]) : randomChoice([3, 4]));
      let comment = '';
      let prosCons = randomChoice(REVIEW_PROS_CONS);
      
      if (rating >= 4) {
        comment = REVIEW_TEXTS_POSITIVE[reviewCounter % REVIEW_TEXTS_POSITIVE.length];
      } else if (rating === 3) {
        comment = REVIEW_TEXTS_NEUTRAL[reviewCounter % REVIEW_TEXTS_NEUTRAL.length];
      } else {
        comment = REVIEW_TEXTS_NEGATIVE[reviewCounter % REVIEW_TEXTS_NEGATIVE.length];
      }

      const reviewObj = {
        id: revId,
        productId,
        reviewerName: REVIEWER_NAMES[reviewCounter % REVIEWER_NAMES.length],
        rating,
        verifiedPurchase: Math.random() > 0.15,
        helpfulCount: randomInt(0, 450),
        images: Math.random() > 0.8 ? [`https://images.unsplash.com/${selectedBaseUnsplash}?w=400&auto=format&fit=crop&q=80&sig=rev-${reviewCounter}`] : [],
        videos: [],
        pros: prosCons.pros,
        cons: prosCons.cons,
        detailedReview: `${comment} Extremely satisfied with the response times of seller ${mappedSeller.name}.`,
        reviewDate: new Date(2026, 6, randomInt(1, 12)).toISOString().split('T')[0],
        aiSentiment: rating >= 4 ? 'positive' : (rating === 3 ? 'neutral' : 'negative')
      };

      reviewWriteStream.write((reviewCounter > 1 ? ',\n' : '') + JSON.stringify(reviewObj));
    }

    globalProductCounter++;
  }

  // Write category file
  const filename = catConfig.files[0];
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(catProducts, null, 2), 'utf-8');
  console.log(`-> Saved ${catProducts.length} items inside products/${filename}`);
}

// Close reviews stream cleanly
reviewWriteStream.write('\n]');
reviewWriteStream.end();

reviewWriteStream.on('finish', () => {
  console.log(`-> Wrote total of ${reviewCounter} unique reviews inside products/reviews.json`);

  // Keep a copy in products/extra_reviews.json for perfect backward compatibility
  try {
    fs.copyFileSync(path.join(OUTPUT_DIR, 'reviews.json'), path.join(OUTPUT_DIR, 'extra_reviews.json'));
    console.log(`-> Copied products/reviews.json to products/extra_reviews.json`);
  } catch (copyErr) {
    console.error('Error copying reviews file:', copyErr);
  }

  // -------------------------------------------------------------
  // 7. COMPILE SUPPORT DATASETS
  // -------------------------------------------------------------
  console.log('Compiling support datasets (inventory, search-index, recommendations)...');

  // inventory.json
  const inventoryMap: Record<string, any> = {};
  productMetadata.forEach(p => {
    inventoryMap[p.id] = {
      stock: p.stock,
      reserved: Math.floor(p.stock * 0.1),
      warehouseId: p.stock % 2 === 0 ? 'WH-US-WEST-1' : 'WH-APAC-SG-1',
      lowStockAlert: p.stock <= 10,
      dispatchTime: '24 Hours',
      sku: `INV-${p.id}`
    };
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'inventory.json'), JSON.stringify(inventoryMap, null, 2), 'utf-8');

  // search-index.json
  const searchIndexMap: Record<string, string[]> = {};
  productMetadata.forEach(p => {
    p.keywords.forEach(kw => {
      if (!searchIndexMap[kw]) {
        searchIndexMap[kw] = [];
      }
      if (searchIndexMap[kw].length < 100) { // cap at 100 items per keyword for efficiency
        searchIndexMap[kw].push(p.id);
      }
    });
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'search-index.json'), JSON.stringify(searchIndexMap, null, 2), 'utf-8');

  // recommendations.json
  const recommendationsMap: Record<string, any> = {};
  productMetadata.forEach((p, idx) => {
    const nextIdx = (idx + 1) % productMetadata.length;
    const prevIdx = (idx - 1 + productMetadata.length) % productMetadata.length;
    recommendationsMap[p.id] = {
      frequentlyBoughtTogether: [productMetadata[nextIdx].id],
      similarProducts: [productMetadata[prevIdx].id],
      upsellOptions: [productMetadata[(idx + 2) % productMetadata.length].id]
    };
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'recommendations.json'), JSON.stringify(recommendationsMap, null, 2), 'utf-8');

  console.log('========================================================');
  console.log('CATALOG GENERATOR COMPLETED SUCCESSFULLY!');
  console.log(`Total Products Written: ${productMetadata.length}`);
  console.log(`Total Sellers Created: ${sellers.length}`);
  console.log(`Total Reviews Compiled: ${reviewCounter}`);
  console.log(`Support structures (brands, categories, search-index) completely established.`);
  console.log('========================================================');
});
