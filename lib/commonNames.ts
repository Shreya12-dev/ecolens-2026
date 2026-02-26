import fs from 'fs';
import path from 'path';

interface CommonNameCache {
    [scientificName: string]: string;
}

const CACHE_FILE = path.join(process.cwd(), '.cache', 'common-names-cache.json');
export let inMemoryCache: CommonNameCache = {};
let cacheLoaded = false;

// Load cache from file
function loadCache(): CommonNameCache {
    if (cacheLoaded) return inMemoryCache;

    try {
        const cacheDir = path.dirname(CACHE_FILE);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf-8');
            inMemoryCache = JSON.parse(data);
            console.log(`[COMMON NAMES] Loaded ${Object.keys(inMemoryCache).length} cached names`);
        }
    } catch (error) {
        console.error('[COMMON NAMES] Error loading cache:', error);
        inMemoryCache = {};
    }

    cacheLoaded = true;
    return inMemoryCache;
}

// Save cache to file
function saveCache() {
    try {
        const cacheDir = path.dirname(CACHE_FILE);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        fs.writeFileSync(CACHE_FILE, JSON.stringify(inMemoryCache, null, 2));
        console.log(`[COMMON NAMES] Saved ${Object.keys(inMemoryCache).length} names to cache`);
    } catch (error) {
        console.error('[COMMON NAMES] Error saving cache:', error);
    }
}

// Fetch common name from GBIF API
async function fetchCommonNameFromGBIF(scientificName: string): Promise<string | null> {
    try {
        // Search for species in GBIF
        const searchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`;
        const searchResponse = await fetch(searchUrl);
        
        if (!searchResponse.ok) {
            return null;
        }

        const searchData = await searchResponse.json();
        
        if (!searchData.usageKey) {
            return null;
        }

        // Get vernacular names
        const vernacularUrl = `https://api.gbif.org/v1/species/${searchData.usageKey}/vernacularNames`;
        const vernacularResponse = await fetch(vernacularUrl);
        
        if (!vernacularResponse.ok) {
            return null;
        }

        const vernacularData = await vernacularResponse.json();
        
        if (!vernacularData.results || vernacularData.results.length === 0) {
            return null;
        }

        // Prefer English names
        const englishName = vernacularData.results.find(
            (v: any) => v.language === 'eng' || v.language === 'en'
        );

        if (englishName) {
            return englishName.vernacularName;
        }

        // Fall back to first available name
        return vernacularData.results[0].vernacularName || null;
    } catch (error) {
        console.error(`[COMMON NAMES] Error fetching name for ${scientificName}:`, error);
        return null;
    }
}

// Get common name with caching
export async function getCommonName(scientificName: string): Promise<string> {
    // Load cache if not loaded
    loadCache();

    // Check cache first
    if (inMemoryCache[scientificName]) {
        return inMemoryCache[scientificName];
    }

    // Fetch from GBIF API
    console.log(`[COMMON NAMES] Fetching common name for: ${scientificName}`);
    const commonName = await fetchCommonNameFromGBIF(scientificName);

    // Cache the result (even if null, to avoid repeated API calls)
    if (commonName) {
        inMemoryCache[scientificName] = commonName;
        saveCache();
        return commonName;
    } else {
        // Cache the scientific name as fallback to avoid repeated failed lookups
        inMemoryCache[scientificName] = scientificName;
        saveCache();
        return scientificName;
    }
}

// Batch fetch common names
export async function getCommonNames(scientificNames: string[]): Promise<{ [key: string]: string }> {
    loadCache();
    
    const results: { [key: string]: string } = {};
    const namesToFetch: string[] = [];

    // Check cache first
    for (const name of scientificNames) {
        if (inMemoryCache[name]) {
            results[name] = inMemoryCache[name];
        } else {
            namesToFetch.push(name);
        }
    }

    // Fetch uncached names (with rate limiting)
    for (let i = 0; i < namesToFetch.length; i++) {
        const name = namesToFetch[i];
        
        // Rate limit: max 10 requests, 200ms delay between requests
        if (i >= 10) {
            console.log(`[COMMON NAMES] Rate limit reached, skipping remaining ${namesToFetch.length - i} names`);
            results[name] = name; // Use scientific name as fallback
            continue;
        }

        if (i > 0) {
            // Add delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const commonName = await getCommonName(name);
        results[name] = commonName;
    }

    return results;
}

// Pre-populate cache with known common names
export function initializeCommonNamesCache() {
    loadCache();

    // Add some common species if cache is empty
    if (Object.keys(inMemoryCache).length === 0) {
        const knownNames: CommonNameCache = {
            'Pavo cristatus': 'Indian Peafowl',
            'Panthera tigris': 'Bengal Tiger',
            'Elephas maximus': 'Asian Elephant',
            'Corvus splendens': 'House Crow',
            'Acridotheres tristis': 'Common Myna',
            'Columba livia': 'Rock Pigeon',
            'Psittacula krameri': 'Rose-ringed Parakeet',
            'Halcyon smyrnensis': 'White-throated Kingfisher',
            'Dendrocitta vagabunda': 'Rufous Treepie',
            'Dicrurus macrocercus': 'Black Drongo'
        };

        Object.assign(inMemoryCache, knownNames);
        saveCache();
    }
}
