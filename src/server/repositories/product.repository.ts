import fs from 'fs';
import path from 'path';
import { Product } from '../../types';
import { parseTruncatedJsonArray, matchesSearch } from '../utils';

// Root directory containing catalog files
const PRODUCTS_DIR = path.join(process.cwd(), 'products');

export interface ProductQueryFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  sellerId?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string; // product id for cursor-based pagination
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest';
}

export class ProductRepository {
  private productsCache: Product[] = [];
  private indexById: Map<string, Product> = new Map();
  private indexBySlug: Map<string, Product> = new Map();
  private initialized = false;

  constructor() {
    this.init();
  }

  /**
   * Initializes the repository by scanning category files and lazy-loading them
   */
  public init() {
    if (this.initialized) return;

    try {
      if (fs.existsSync(PRODUCTS_DIR)) {
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
          'inventory.json'
        ]);

        const allFiles = fs.readdirSync(PRODUCTS_DIR);
        const productFiles = allFiles.filter(file => file.endsWith('.json') && !nonProductFiles.has(file));

        for (const file of productFiles) {
          try {
            const fileData = fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf-8');
            const data = parseTruncatedJsonArray<any>(fileData);
            const list = Array.isArray(data) ? data : [];
            for (const p of list) {
              if (p && p.id) {
                // Ensure legacy field compatibility
                const compatProduct: Product = {
                  ...p,
                  name: p.name || p.title,
                  image: p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                  variants: p.variants || { colors: ['Default'], sizes: ['Standard'] },
                  specifications: p.specifications || {},
                  reviewsCount: p.reviewsCount || 0
                };
                this.productsCache.push(compatProduct);
                this.indexById.set(compatProduct.id, compatProduct);
                if (p.slug) {
                  this.indexBySlug.set(p.slug, compatProduct);
                }
              }
            }
          } catch (e) {
            console.error(`[ProductRepository] Failed to read catalog file: ${file}`, e);
          }
        }
      }
      this.initialized = true;
      console.log(`[ProductRepository] Successfully index-cached ${this.productsCache.length} products.`);
    } catch (e) {
      console.error('[ProductRepository] Error loading product catalog:', e);
    }
  }

  /**
   * Gets all products from cached catalog
   */
  public getAll(): Product[] {
    this.init();
    return this.productsCache;
  }

  /**
   * Find product by ID
   */
  public findById(id: string): Product | null {
    this.init();
    return this.indexById.get(id) || null;
  }

  /**
   * Find product by Slug
   */
  public findBySlug(slug: string): Product | null {
    this.init();
    return this.indexBySlug.get(slug) || null;
  }

  /**
   * Query catalog with enterprise-grade filters, sorting, and pagination
   */
  public find(filters: ProductQueryFilters, page: PaginationOptions = {}): { items: Product[]; total: number; nextCursor: string | null } {
    this.init();
    let filtered = [...this.productsCache];

    // Apply Filters
    if (filters.category && filters.category !== 'All') {
      const lower = filters.category.toLowerCase();
      filtered = filtered.filter(p => p.category.toLowerCase() === lower);
    }
    if (filters.subcategory) {
      const lower = filters.subcategory.toLowerCase();
      filtered = filtered.filter(p => p.subcategory && p.subcategory.toLowerCase() === lower);
    }
    if (filters.brand) {
      const lower = filters.brand.toLowerCase();
      filtered = filtered.filter(p => p.brand.toLowerCase() === lower);
    }
    if (filters.sellerId) {
      filtered = filtered.filter(p => p.sellerId === filters.sellerId);
    }
    if (filters.collection) {
      const lower = filters.collection.toLowerCase();
      filtered = filtered.filter(p => (p as any).collection && (p as any).collection.toLowerCase() === lower);
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.query) {
      filtered = filtered.filter(p => matchesSearch(p, filters.query!));
    }

    // Apply Sorting
    const sortBy = page.sortBy || 'popularity';
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const dA = new Date((a as any).launchDate || 0).getTime();
        const dB = new Date((b as any).launchDate || 0).getTime();
        return dB - dA;
      });
    }

    const total = filtered.length;

    // Apply Pagination (Cursor or Offset)
    let paginatedItems: Product[] = [];
    const limit = page.limit || 20;

    if (page.cursor) {
      const cursorIndex = filtered.findIndex(p => p.id === page.cursor);
      if (cursorIndex !== -1) {
        paginatedItems = filtered.slice(cursorIndex + 1, cursorIndex + 1 + limit);
      } else {
        paginatedItems = filtered.slice(0, limit);
      }
    } else {
      const offset = page.offset || 0;
      paginatedItems = filtered.slice(offset, offset + limit);
    }

    const nextCursor = paginatedItems.length > 0 && paginatedItems.length === limit
      ? paginatedItems[paginatedItems.length - 1].id
      : null;

    return {
      items: paginatedItems,
      total,
      nextCursor
    };
  }

  /**
   * Save a product back to repository state (inserts or updates)
   */
  public save(product: Product): void {
    this.init();
    const existingIdx = this.productsCache.findIndex(p => p.id === product.id);
    if (existingIdx !== -1) {
      this.productsCache[existingIdx] = product;
    } else {
      this.productsCache.push(product);
    }
    this.indexById.set(product.id, product);
    if (product.slug) {
      this.indexBySlug.set(product.slug, product);
    }
  }
}

export const productRepository = new ProductRepository();
