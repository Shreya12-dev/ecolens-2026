import { NextRequest, NextResponse } from 'next/server';

// OpenAQI API (World Air Quality Index)
const OPENAQ_API_URL = 'https://api.waqi.info';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat') || '22.0'; // Default to Sundarbans
        const lon = searchParams.get('lon') || '89.0';

        const apiKey = process.env.OPENAQ_API_KEY || 'demo'; // 'demo' for testing, but limited

        // Get nearest AQI station
        const response = await fetch(
            `${OPENAQ_API_URL}/feed/geo:${lat};${lon}/?token=${apiKey}`
        );

        if (!response.ok) {
            throw new Error('OpenAQI API error');
        }

        const data = await response.json();

        if (data.status !== 'ok') {
            return NextResponse.json(
                { error: 'No AQI data available for this location' },
                { status: 404 }
            );
        }

        // Process AQI data
        const aqi = data.data.aqi;
        const city = data.data.city.name;
        const pollutants = data.data.iaqi;

        // Calculate risk level
        const getRiskLevel = (aqi: number) => {
            if (aqi <= 50) return { level: 'Good', color: 'green' };
            if (aqi <= 100) return { level: 'Moderate', color: 'yellow' };
            if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'orange' };
            if (aqi <= 200) return { level: 'Unhealthy', color: 'red' };
            if (aqi <= 300) return { level: 'Very Unhealthy', color: 'purple' };
            return { level: 'Hazardous', color: 'maroon' };
        };

        const risk = getRiskLevel(aqi);

        // Estimate carbon emissions based on AQI (simplified)
        const estimatedCO2 = {
            pm25: pollutants.pm25?.v || 0,
            pm10: pollutants.pm10?.v || 0,
            co: pollutants.co?.v || 0,
            no2: pollutants.no2?.v || 0,
            so2: pollutants.so2?.v || 0,
            o3: pollutants.o3?.v || 0,
        };

        return NextResponse.json({
            location: {
                city,
                lat: parseFloat(lat),
                lon: parseFloat(lon),
            },
            aqi: {
                value: aqi,
                level: risk.level,
                color: risk.color,
            },
            pollutants: estimatedCO2,
            timestamp: data.data.time.s,
            health_impact: getHealthImpact(aqi),
            recommendations: getRecommendations(aqi),
        });
    } catch (error) {
        console.error('Carbon emissions API error:', error);

        // Return mock data if API fails
        return NextResponse.json({
            location: {
                city: 'Sundarbans',
                lat: 22.0,
                lon: 89.0,
            },
            aqi: {
                value: 85,
                level: 'Moderate',
                color: 'yellow',
            },
            pollutants: {
                pm25: 35,
                pm10: 50,
                co: 0.5,
                no2: 20,
                so2: 10,
                o3: 45,
            },
            timestamp: new Date().toISOString(),
            health_impact: getHealthImpact(85),
            recommendations: getRecommendations(85),
            note: 'Using mock data - API key may be invalid',
        });
    }
}

function getHealthImpact(aqi: number): string {
    if (aqi <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
    if (aqi <= 100) return 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
    if (aqi <= 150) return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
    if (aqi <= 200) return 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
    if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone.';
    return 'Health warning of emergency conditions: everyone is more likely to be affected.';
}

function getRecommendations(aqi: number): string[] {
    if (aqi <= 50) {
        return ['Enjoy outdoor activities', 'Air quality is good for all groups'];
    }
    if (aqi <= 100) {
        return [
            'Unusually sensitive people should consider reducing prolonged outdoor exertion',
            'Everyone else can enjoy normal outdoor activities',
        ];
    }
    if (aqi <= 150) {
        return [
            'Sensitive groups should reduce prolonged or heavy outdoor exertion',
            'Wear a mask if you\'re in a sensitive group',
            'Everyone else should limit prolonged outdoor exertion',
        ];
    }
    if (aqi <= 200) {
        return [
            'People with respiratory or heart disease should avoid prolonged outdoor exertion',
            'Everyone should limit prolonged outdoor exertion',
            'Wear a mask when going outside',
        ];
    }
    return [
        'Everyone should avoid all outdoor physical activity',
        'Stay indoors with air purifiers if possible',
        'Wear N95 masks if you must go outside',
    ];
}
