import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Map IUCN codes to full names
const IUCN_MAP: { [key: string]: string } = {
    'LC': 'Least Concern',
    'NT': 'Near Threatened',
    'VU': 'Vulnerable',
    'EN': 'Endangered',
    'CR': 'Critically Endangered',
    'EW': 'Extinct in the Wild',
    'EX': 'Extinct',
    'DD': 'Data Deficient'
};

// Map species groups to class names
const CLASS_MAP: { [key: string]: string } = {
    'birds': 'Aves',
    'mammals': 'Mammalia',
    'reptiles': 'Reptilia'
};

// Load common names from local JSON
let commonNamesCache: { [key: string]: string } = {};
let gbifCache: { [key: string]: string } = {};

function loadCommonNames() {
    try {
        const commonNamesPath = path.join(process.cwd(), 'public', 'commonNames.json');
        if (fs.existsSync(commonNamesPath)) {
            commonNamesCache = JSON.parse(fs.readFileSync(commonNamesPath, 'utf-8'));
        }
    } catch (e) {
        console.error('Error loading common names:', e);
    }
}

function loadGbifCache() {
    try {
        const cachePath = path.join(process.cwd(), '.cache', 'common-names-cache.json');
        if (fs.existsSync(cachePath)) {
            gbifCache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        }
    } catch (e) {
        console.error('Error loading GBIF cache:', e);
    }
}

function saveGbifCache() {
    try {
        const cachePath = path.join(process.cwd(), '.cache', 'common-names-cache.json');
        fs.writeFileSync(cachePath, JSON.stringify(gbifCache, null, 2));
    } catch (e) {
        console.error('Error saving GBIF cache:', e);
    }
}

async function getCommonName(scientificName: string): Promise<string> {
    // 1. Check local commonNames.json
    if (commonNamesCache[scientificName]) {
        return commonNamesCache[scientificName];
    }

    // 2. Check GBIF cache
    if (gbifCache[scientificName]) {
        return gbifCache[scientificName];
    }

    // 3. Try GBIF API (optional - can be async)
    try {
        const response = await fetch(
            `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`
        );
        if (response.ok) {
            const data = await response.json();
            if (data.usageKey) {
                const vernacularResponse = await fetch(
                    `https://api.gbif.org/v1/species/${data.usageKey}/vernacularNames`
                );
                if (vernacularResponse.ok) {
                    const vernacularData = await vernacularResponse.json();
                    const englishName = vernacularData.results?.find(
                        (v: any) => v.language === 'eng'
                    )?.vernacularName;
                    if (englishName) {
                        gbifCache[scientificName] = englishName;
                        saveGbifCache();
                        return englishName;
                    }
                }
            }
        }
    } catch (e) {
        // Silently fail
    }

    return 'Not Available';
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupFilter = searchParams.get('group'); // birds, mammals, reptiles
    const onlyFilter = searchParams.get('only'); // endangered

    // Load caches on first request
    if (Object.keys(commonNamesCache).length === 0) {
        loadCommonNames();
        loadGbifCache();
    }

    try {
        // Read CSV file from datasets folder
        const csvPath = path.join(process.cwd(), 'backend', 'datasets', 'biodiversity.csv');

        if (!fs.existsSync(csvPath)) {
            return NextResponse.json(
                { error: 'Biodiversity dataset not found' },
                { status: 404 }
            );
        }

        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim());

        console.log(`[BIODIVERSITY] Total rows in CSV: ${lines.length}`);

        // Parse header
        const headers = parseCSVLine(lines[0]);
        console.log(`[BIODIVERSITY] Headers found: ${headers.length}`, headers.slice(0, 5));

        const scientificNameIdx = headers.indexOf('scientificName');
        const acceptedNameIdx = headers.indexOf('acceptedScientificName');
        const occurrencesIdx = headers.indexOf('numberOfOccurrences');
        const taxonRankIdx = headers.indexOf('taxonRank');
        const classIdx = headers.indexOf('class');
        const iucnIdx = headers.indexOf('iucnRedListCategory');

        // Log first data row for debugging
        if (lines.length > 1) {
            const firstRow = parseCSVLine(lines[1]);
            console.log(`[BIODIVERSITY] First data row:`, {
                scientificName: firstRow[scientificNameIdx],
                acceptedScientificName: firstRow[acceptedNameIdx],
                numberOfOccurrences: firstRow[occurrencesIdx],
                taxonRank: firstRow[taxonRankIdx],
                class: firstRow[classIdx],
                iucnRedListCategory: firstRow[iucnIdx]
            });
        }

        // Get filter class if specified
        let filterClass: string | null = null;
        if (groupFilter) {
            filterClass = CLASS_MAP[groupFilter.toLowerCase()] || null;
        }

        // Parse data
        const speciesSet = new Set<string>();
        let endangeredCount = 0;
        let processedRows = 0;
        let totalOccurrences = 0;
        
        // Track species by class
        const speciesByClass: { [key: string]: Set<string> } = {
            'Aves': new Set(),
            'Mammalia': new Set(),
            'Reptilia': new Set(),
            'Other': new Set()
        };
        
        // Track IUCN categories
        const iucnCategories: { [key: string]: number } = {
            'CR': 0,
            'EN': 0,
            'VU': 0,
            'NT': 0,
            'LC': 0,
            'DD': 0,
            'EW': 0,
            'EX': 0,
            'NOT_EVALUATED': 0
        };

        for (let i = 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]);

            const taxonClass = cols[classIdx] || 'Unknown';
            const scientificName = cols[acceptedNameIdx] || cols[scientificNameIdx];
            if (!scientificName || scientificName === '""') continue;

            const iucnCode = (cols[iucnIdx] || '').trim().replace(/\"/g, '');
            const occurrences = parseInt(cols[occurrencesIdx] || '0', 10) || 0;

            // Count all unique species (not just SPECIES rank)
            speciesSet.add(scientificName);
            totalOccurrences += occurrences;
            
            // Track by class
            if (speciesByClass[taxonClass]) {
                speciesByClass[taxonClass].add(scientificName);
            } else {
                speciesByClass['Other'].add(scientificName);
            }

            // Count IUCN categories
            if (iucnCode && iucnCategories.hasOwnProperty(iucnCode)) {
                iucnCategories[iucnCode]++;
            } else if (!iucnCode) {
                iucnCategories['NOT_EVALUATED']++;
            }

            // Count endangered (CR, EN, VU, NT) - only for SPECIES rank
            const taxonRank = cols[taxonRankIdx];
            if (taxonRank === 'SPECIES' && ['CR', 'EN', 'VU', 'NT'].includes(iucnCode)) {
                endangeredCount++;
            }

            processedRows++;
        }

        const totalUniqueSpecies = speciesSet.size;
        const avgOccurrences = processedRows > 0 ? Math.round((totalOccurrences / processedRows) * 10) / 10 : 0;
        const endangeredRatio = totalUniqueSpecies > 0 ? endangeredCount / totalUniqueSpecies : 0;
        const biodiversityIndex = (1 - endangeredRatio) * 100;

        console.log(`[BIODIVERSITY] Processed ${processedRows} records`);
        console.log(`[BIODIVERSITY] Total unique species: ${totalUniqueSpecies}`);
        console.log(`[BIODIVERSITY] Avg occurrences: ${avgOccurrences}`);
        console.log(`[BIODIVERSITY] Species breakdown - Birds: ${speciesByClass['Aves'].size}, Mammals: ${speciesByClass['Mammalia'].size}, Reptiles: ${speciesByClass['Reptilia'].size}, Other: ${speciesByClass['Other'].size}`);
        console.log(`[BIODIVERSITY] Endangered species (SPECIES rank): ${endangeredCount}`);
        console.log(`[BIODIVERSITY] Endangered ratio: ${(endangeredRatio * 100).toFixed(2)}%`);
        console.log(`[BIODIVERSITY] Biodiversity Index: ${biodiversityIndex.toFixed(2)}`);
        console.log(`[BIODIVERSITY] IUCN Categories:`, iucnCategories);

        // Load wildlife forecasts and transform to expected format
        let forecastData = null;
        try {
            const forecastPath = path.join(process.cwd(), 'backend', 'ml_models', 'wildlife_forecast.json');
            if (fs.existsSync(forecastPath)) {
                const rawForecast = JSON.parse(fs.readFileSync(forecastPath, 'utf-8'));
                
                // Transform forecast data to match component expectations
                if (rawForecast.forecasts) {
                    forecastData = {};
                    
                    for (const [speciesName, speciesData] of Object.entries(rawForecast.forecasts)) {
                        const data: any = speciesData;
                        
                        // Extract years and populations from forecast array
                        const forecastYears = data.forecast?.map((f: any) => f.year) || [];
                        const forecastPop = data.forecast?.map((f: any) => f.predicted_population) || [];
                        
                        // Generate historical data (mock for now)
                        const currentYear = new Date().getFullYear();
                        const historicalYears = Array.from({length: 5}, (_, i) => currentYear - 5 + i);
                        const basePopulation = forecastPop[0] || 1000;
                        const historicalPop = historicalYears.map((_, i) => basePopulation * (0.9 + i * 0.05));
                        
                        // Generate stress and anthropogenic data
                        const historicalStress = historicalYears.map(() => Math.random() * 0.3 + 0.3);
                        const historicalAnthro = historicalYears.map(() => Math.random() * 0.3 + 0.2);
                        const forecastStress = forecastYears.map(() => Math.random() * 0.4 + 0.3);
                        const forecastAnthro = forecastYears.map(() => Math.random() * 0.4 + 0.3);
                        
                        forecastData[speciesName] = {
                            historical: {
                                years: historicalYears,
                                population: historicalPop,
                                stress: historicalStress,
                                anthropogenic: historicalAnthro
                            },
                            forecast: {
                                years: forecastYears,
                                population: forecastPop,
                                stress: forecastStress,
                                anthropogenic: forecastAnthro
                            },
                            risk_score: data.status === 'declining' ? 0.7 : 0.3,
                            predicted_category: data.status === 'declining' ? 'Vulnerable' : 'Least Concern',
                            confidence_interval: 0.15,
                            evaluation: {
                                mae: data.metrics?.mae || 0,
                                rmse: data.metrics?.rmse || 0
                            }
                        };
                    }
                }
            }
        } catch (e) {
            console.error('Error loading wildlife forecasts:', e);
        }

        const responseData = {
            summary: {
                total_species: totalUniqueSpecies,
                endangered_species: endangeredCount,
                endangered_ratio: parseFloat((endangeredRatio * 100).toFixed(2)),
                biodiversity_index: parseFloat(biodiversityIndex.toFixed(2)),
                avg_occurrences: avgOccurrences,
                group_filter: groupFilter || 'all',
                timestamp: new Date().toISOString()
            },
            species_by_class: {
                birds: speciesByClass['Aves'].size,
                mammals: speciesByClass['Mammalia'].size,
                reptiles: speciesByClass['Reptilia'].size,
                other: speciesByClass['Other'].size
            },
            iucn_categories: iucnCategories,
            data: {
                metrics: {
                    totalUniqueSpecies,
                    endangeredCount,
                    endangeredRatio: parseFloat((endangeredRatio * 100).toFixed(2)),
                    biodiversityIndex: parseFloat(biodiversityIndex.toFixed(2)),
                    avgOccurrences
                }
            },
            forecasts: forecastData
        };



        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Biodiversity API error:', error);
        return NextResponse.json(
            { error: 'Failed to load biodiversity data', details: String(error) },
            { status: 500 }
        );
    }
}
