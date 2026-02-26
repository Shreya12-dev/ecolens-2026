import { NextRequest, NextResponse } from 'next/server';

// ML Model Server URL (Python Flask server)
const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['lat', 'lon', 'ndvi', 'humidity', 'wind_speed', 'temp'];
        for (const field of requiredFields) {
            if (!(field in body)) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Call Python ML server
        const response = await fetch(`${ML_SERVER_URL}/predict/fire`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('ML model server error');
        }

        const prediction = await response.json();

        return NextResponse.json(prediction);
    } catch (error) {
        console.error('Fire prediction error:', error);
        return NextResponse.json(
            { error: 'Failed to predict fire risk' },
            { status: 500 }
        );
    }
}

// GET endpoint for report/analysis
export async function GET() {
    try {
        const response = await fetch(`${ML_SERVER_URL}/report/fire`, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error('ML model server error or report missing');
        }

        const report = await response.json();
        return NextResponse.json(report, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch fire analysis report' },
            { status: 503 }
        );
    }
}
