/**
 * Robustly parses a potentially truncated JSON array of objects.
 * It scans the content, skipping strings and escape characters, and extracts
 * all fully-formed JSON objects (matching balanced curly braces at array depth 0).
 */
export function parseTruncatedJsonArray<T>(content: string): T[] {
  const results: T[] = [];
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let objStart = -1;

  // Find the first '['
  const arrayStart = content.indexOf('[');
  if (arrayStart === -1) {
    // If there's no opening array bracket, try parsing objects directly
    return parseIndividualObjects<T>(content);
  }

  for (let i = arrayStart + 1; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (depth === 0) {
          objStart = i;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && objStart !== -1) {
          const objStr = content.slice(objStart, i + 1);
          try {
            const parsed = JSON.parse(objStr);
            results.push(parsed);
          } catch (e) {
            // Ignore malformed objects
          }
          objStart = -1;
        }
      }
    }
  }

  // If no objects were parsed, or we want a fallback check, try scanning for complete objects directly
  if (results.length === 0) {
    return parseIndividualObjects<T>(content);
  }

  return results;
}

/**
 * Fallback parser that extracts balanced curly-brace sequences from anywhere in the string.
 */
function parseIndividualObjects<T>(content: string): T[] {
  const results: T[] = [];
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let objStart = -1;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (depth === 0) {
          objStart = i;
        }
        depth++;
      } else if (char === '}') {
        if (depth > 0) {
          depth--;
          if (depth === 0 && objStart !== -1) {
            const objStr = content.slice(objStart, i + 1);
            try {
              const parsed = JSON.parse(objStr);
              results.push(parsed);
            } catch (e) {
              // Ignore malformed
            }
            objStart = -1;
          }
        }
      }
    }
  }

  return results;
}

/**
 * Computes Levenshtein distance between two strings
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i, j;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

/**
 * Checks if query matches product using exact, fuzzy, and semantic synonym expansion.
 */
export function matchesSearch(product: any, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (q === 'all') {
    return (product.name || '').toLowerCase().split(/\s+/).includes('all') || (product.category || '').toLowerCase() === 'all';
  }

  const title = (product.name || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const category = (product.category || "").toLowerCase();
  const subcategory = (product.subcategory || "").toLowerCase();

  // 1. Exact or direct substring match (Blazing fast pass)
  if (
    title.includes(q) ||
    brand.includes(q) ||
    desc.includes(q) ||
    category.includes(q) ||
    subcategory.includes(q)
  ) {
    return true;
  }

  // 2. Token-level exact / substring match
  const queryTokens = q.split(/\s+/).filter(t => t.length > 2);
  const titleTokens = title.split(/\s+/).concat(brand.split(/\s+/));

  let tokenMatches = 0;
  for (const qToken of queryTokens) {
    // Check if token matches any title or category/subcategory word directly
    if (
      title.includes(qToken) ||
      brand.includes(qToken) ||
      category.includes(qToken) ||
      subcategory.includes(qToken)
    ) {
      tokenMatches++;
      continue;
    }

    // Fuzzy word-level match with Levenshtein distance (for typos)
    let foundFuzzy = false;
    for (const tToken of titleTokens) {
      if (tToken.length > 2) {
        const dist = getLevenshteinDistance(qToken, tToken);
        // If distance is <= 1 for short words, or <= 2 for longer words
        const allowedDist = qToken.length > 5 ? 2 : 1;
        if (dist <= allowedDist) {
          foundFuzzy = true;
          break;
        }
      }
    }
    if (foundFuzzy) {
      tokenMatches++;
    }
  }

  if (queryTokens.length > 0 && tokenMatches >= queryTokens.length) {
    return true;
  }

  // 3. Semantic expansion matching (Synonyms / Categories map)
  const synonymMap: Record<string, string[]> = {
    phone: ['mobile', 'mobiles', 'cellphone', 'smartphone', 'iphone', 'samsung', 'pixel', 'oneplus'],
    mobile: ['phone', 'mobiles', 'cellphone', 'smartphone', 'iphone', 'samsung', 'pixel', 'oneplus'],
    laptop: ['laptops', 'computer', 'notebook', 'macbook', 'asus', 'hp', 'dell', 'lenovo', 'pc'],
    pc: ['laptop', 'laptops', 'computer', 'notebook', 'macbook'],
    tv: ['television', 'televisions', 'screen', 'display', 'oled', 'led', 'lg', 'sony', 'samsung'],
    audio: ['sound', 'music', 'headphones', 'earphones', 'buds', 'speaker', 'acoustics', 'noise'],
    earphone: ['headphones', 'earphones', 'buds', 'speaker', 'sound', 'audio'],
    headphone: ['headphones', 'earphones', 'buds', 'speaker', 'sound', 'audio'],
    shirt: ['fashion', 'men', 'women', 'apparel', 'pants', 'clothes', 'jacket', 'clothing', 'shoes'],
    shoe: ['fashion', 'men', 'women', 'apparel', 'pants', 'clothes', 'jacket', 'clothing', 'sneakers'],
    toy: ['toys', 'game', 'boardgame', 'child', 'kid', 'puzzle', 'play'],
    kitchen: ['home', 'cup', 'pot', 'pan', 'chair', 'table', 'furniture', 'dining'],
    book: ['books', 'read', 'novel', 'author', 'fiction', 'literature'],
    beauty: ['makeup', 'cream', 'skincare', 'perfume', 'cosmetics'],
    workout: ['sports', 'run', 'gym', 'exercise', 'fitness', 'athletic']
  };

  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (q.includes(key)) {
      for (const syn of synonyms) {
        if (
          title.includes(syn) ||
          category.includes(syn) ||
          subcategory.includes(syn)
        ) {
          return true;
        }
      }
    }
    for (const syn of synonyms) {
      if (q.includes(syn)) {
        if (
          title.includes(key) ||
          category.includes(key) ||
          subcategory.includes(key)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
