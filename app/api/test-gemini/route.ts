import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: 'Explain how AI works in a few words'
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'Gemini API Error',
                status: response.status,
                details: data
            }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            response: data.candidates?.[0]?.content?.parts?.[0]?.text,
            fullData: data
        });

    } catch (error) {
        return NextResponse.json({
            error: 'Request failed',
            details: String(error)
        }, { status: 500 });
    }
}
