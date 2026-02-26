import { NextRequest, NextResponse } from 'next/server'

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Indian cities and regions with their WAQI search terms or coordinates
const INDIAN_LOCATIONS = {
    // States
    'West Bengal': 'west bengal',
    'Delhi': 'delhi',
    'Maharashtra': 'maharashtra',
    'Karnataka': 'karnataka',
    'Tamil Nadu': 'tamil nadu',
    'Uttar Pradesh': 'lucknow',
    'Rajasthan': 'jaipur',
    'Gujarat': 'ahmedabad',

    // Cities
    'Kolkata': 'kolkata',
    'New Delhi': 'delhi',
    'Mumbai': 'mumbai',
    'Bengaluru': 'bangalore',
    'Chennai': 'chennai',
    'Hyderabad': 'hyderabad',
    'Pune': 'pune',
    'Ahmedabad': 'ahmedabad',
    'Jaipur': 'jaipur',
    'Lucknow': 'lucknow',
    'Durgapur': 'durgapur',
    'Siliguri': 'siliguri',

    // Forests & Regions
    'Sundarbans': '@8805',
    'Western Ghats': 'geo:14.0;75.0',
    'Himalayas': 'geo:30.0;78.0',
    'Corbett': 'geo:29.5;78.8',
    'Kaziranga': 'geo:26.5;93.4',
    'Gir Forest': 'geo:21.1;70.5',
    'Kanha': 'geo:22.3;80.6',
    'Bandipur': 'geo:11.6;76.6'
}

// Indian AQI standards and colors
const getIndianAQICategory = (aqi: number) => {
    if (aqi <= 50) return { category: 'Good', color: '#00E400', healthImpact: 'Minimal' }
    if (aqi <= 100) return { category: 'Satisfactory', color: '#7CFC00', healthImpact: 'Minor issues for sensitive people' }
    if (aqi <= 200) return { category: 'Moderate', color: '#FFFF00', healthImpact: 'Breathing discomfort for sensitive groups' }
    if (aqi <= 300) return { category: 'Poor', color: '#FF7E00', healthImpact: 'Breathing discomfort for most people' }
    if (aqi <= 400) return { category: 'Very Poor', color: '#FF0000', healthImpact: 'Respiratory illness on prolonged exposure' }
    return { category: 'Severe', color: '#8B0000', healthImpact: 'Health impacts even on light physical work' }
}

// Calculate environmental impact based on AQI
const calculateEnvironmentalImpact = (aqi: number) => {
    // Vegetation Health (0-100%)
    let vegetationHealth = 100
    if (aqi > 50) vegetationHealth = Math.max(0, 100 - ((aqi - 50) * 0.8))

    // Wildlife Stress Level
    let wildlifeStress = 'Low'
    if (aqi > 100) wildlifeStress = 'Moderate'
    if (aqi > 200) wildlifeStress = 'High'
    if (aqi > 300) wildlifeStress = 'Severe'

    // Forest Fire Risk
    let forestFireRisk = 'Low'
    if (aqi > 150) forestFireRisk = 'Medium'
    if (aqi > 250) forestFireRisk = 'High'
    if (aqi > 350) forestFireRisk = 'Critical'

    // Water Quality Impact
    let waterQualityImpact = 'Minimal'
    if (aqi > 100) waterQualityImpact = 'Moderate'
    if (aqi > 200) waterQualityImpact = 'Significant'
    if (aqi > 300) waterQualityImpact = 'Severe'

    return {
        vegetation_health: Math.round(vegetationHealth),
        wildlife_stress: wildlifeStress,
        forest_fire_risk: forestFireRisk,
        water_quality_impact: waterQualityImpact
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const location = searchParams.get('location') || 'Kolkata'

        // Check cache first
        const cacheKey = `waqi_${location}`
        const cached = cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return NextResponse.json({ ...cached.data, cached: true, cache_age_seconds: Math.floor((Date.now() - cached.timestamp) / 1000) })
        }

        // Get API key from environment
        const apiKey = process.env.WQI_API_KEY
        if (!apiKey) {
            console.warn('WQI_API_KEY not set, using mock data')
            return NextResponse.json(getMockData(location))
        }

        let apiUrl: string

        // Check if we have a direct mapping
        const mappedValue = INDIAN_LOCATIONS[location as keyof typeof INDIAN_LOCATIONS]

        if (mappedValue && mappedValue.startsWith('geo:')) {
            // Handle custom geo coordinates directly from map
            const coords = mappedValue.replace('geo:', '')
            apiUrl = `https://api.waqi.info/feed/geo:${coords}/?token=${apiKey}`
        } else if (location === 'Sundarbans') {
            // Setup specific for Sundarbans if needed, though covered by map now if we updated map
            apiUrl = `https://api.waqi.info/feed/geo:22.0;89.0/?token=${apiKey}`
        } else {
            // Search by city name
            const searchTerm = mappedValue || location.toLowerCase()
            apiUrl = `https://api.waqi.info/feed/${searchTerm}/?token=${apiKey}`
        }

        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data.status !== 'ok' || !data.data) {
            console.warn(`WAQI API error for ${location}:`, data)
            return NextResponse.json(getMockData(location))
        }

        const aqiData = data.data
        const aqiValue = aqiData.aqi
        const aqiInfo = getIndianAQICategory(aqiValue)

        // Extract pollutants
        const iaqi = aqiData.iaqi || {}
        const pollutants = {
            pm25: iaqi.pm25?.v || 0,
            pm10: iaqi.pm10?.v || 0,
            no2: iaqi.no2?.v || 0,
            so2: iaqi.so2?.v || 0,
            o3: iaqi.o3?.v || 0,
            co: iaqi.co?.v || 0
        }

        // Extract weather data
        const weather = {
            temp: iaqi.t?.v || null,
            humidity: iaqi.h?.v || null,
            wind: iaqi.w?.v || null,
            pressure: iaqi.p?.v || null
        }

        // Find dominant pollutant
        const dominantPollutant = Object.entries(pollutants)
            .reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['pm25', 0])[0]

        const result = {
            success: true,
            data: {
                aqi_value: aqiValue,
                aqi_category: aqiInfo.category,
                aqi_color: aqiInfo.color,
                health_impact: aqiInfo.healthImpact,
                dominant_pollutant: dominantPollutant,
                location_name: aqiData.city?.name || location,
                coordinates: {
                    lat: aqiData.city?.geo?.[0] || 22.5,
                    lon: aqiData.city?.geo?.[1] || 88.3
                },
                timestamp: aqiData.time?.iso || new Date().toISOString(),
                pollutants,
                weather,
                environmental_impact: calculateEnvironmentalImpact(aqiValue)
            },
            cached: false,
            cache_age_seconds: 0
        }

        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: Date.now() })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Error fetching WAQI data:', error)
        const location = new URL(request.url).searchParams.get('location') || 'Kolkata'
        return NextResponse.json(getMockData(location))
    }
}

// Mock data for fallback
function getMockData(location: string) {
    const mockAQI = location === 'Kolkata' ? 156 : location === 'Sundarbans' ? 89 : 128
    const aqiInfo = getIndianAQICategory(mockAQI)

    return {
        success: true,
        data: {
            aqi_value: mockAQI,
            aqi_category: aqiInfo.category,
            aqi_color: aqiInfo.color,
            health_impact: aqiInfo.healthImpact,
            dominant_pollutant: 'pm25',
            location_name: `${location}, West Bengal, India`,
            coordinates: {
                lat: location === 'Sundarbans' ? 22.0 : 22.5,
                lon: location === 'Sundarbans' ? 89.0 : 88.3
            },
            timestamp: new Date().toISOString(),
            pollutants: {
                pm25: (mockAQI * 0.5) + Math.random(),
                pm10: (mockAQI * 0.6) + Math.random(),
                no2: (mockAQI * 0.3) + Math.random(),
                so2: (mockAQI * 0.2) + Math.random(),
                o3: (mockAQI * 0.25) + Math.random(),
                co: (mockAQI * 0.1) + Math.random()
            },
            weather: {
                temp: 28 + (Math.random() * 5),
                humidity: 65 + (Math.random() * 20),
                wind: 5 + (Math.random() * 10),
                pressure: 1012 + (Math.random() * 5)
            },
            environmental_impact: calculateEnvironmentalImpact(mockAQI)
        },
        cached: false,
        cache_age_seconds: 0,
        mock: true
    }
}
