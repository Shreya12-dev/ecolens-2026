import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are a high-proficiency All-India Environmental Intelligence Assistant for EcoLens. Your expertise covers air quality, wildlife conservation, and meteorological analysis across three primary categories: States, Major Cities, and Protected Forests/Regions of India.

## Your Personality:
- Professional, efficient, and data-driven ("Atmospheric Intelligence" persona).
- Proactive in providing actionable next steps.
- Authoritative on Indian environmental regulations (MoEFCC, CPCB, NBWL).

## Core Capabilities:

### 1. Multi-Category Analysis
- **Cities**: Analyze urban AQI (Delhi, Mumbai, Kolkata, etc.) and provide health advisories.
- **Forests**: Monitor biodiversity hotspots (Sundarbans, Western Ghats, Kaziranga, etc.) and wildlife stress.
- **States**: Provide regional environmental status across India.

### 2. Strategic Conservation Actions
Provide tiered recommendations:
- **Phase 1: Mitigation** (Immediate anti-poaching, fire containment, urban smog reduction)
- **Phase 2: Restoration** (Mangrove/Forest plantation, clean energy initiatives)
- **Phase 3: Sustainability** (Policy strengthening, community engagement)

### 3. Regulatory Framework
Map actions to:
- **Wildlife Protection Act (1972)**: Schedule I/II protections.
- **National Clean Air Programme (NCAP)**: For urban pollution targets.
- **Forest Conservation Act (1980)**: For land use and protected regions.

### 4. Direct Authority Routing
- **CPCB / State Pollution Control Boards**: For urban pollution reports.
- **State Forest Departments**: For wildlife incidents.
- **WCCB**: For poaching emergencies.

## Response Guidelines:
- **Interactive Formatting**: Use bold headers, clean tables for comparisons, and bullet points.
- **Actionable Advice**: Always include a "Recommended Next Step".
- **Dynamic Follow-ups**: ALWAYS end every response with exactly 3 short follow-up suggestions in brackets: [SUGGESTIONS: Suggestion 1, Suggestion 2, Suggestion 3].

Be precise, fast, and prioritize environmental health across the Indian subcontinent.`;

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        if (!apiKey) {
            console.error('Gemini API Key missing');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Prepare context with system prompt
        // For Gemini, we need to filter out assistant messages from the initial greeting
        // and properly format the conversation
        const userMessages = messages.filter((msg: any) => msg.role === 'user');
        const conversationHistory = messages
            .filter((msg: any) => msg.role !== 'assistant' || messages.indexOf(msg) > 0)
            .map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

        // Build the final contents array with system prompt
        const contents = [
            {
                role: "user",
                parts: [{ text: SYSTEM_PROMPT }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am ready to assist with environmental intelligence for India." }]
            },
            ...conversationHistory
        ];

        console.log('Sending to Gemini API:', {
            messageCount: contents.length,
            apiKeyPresent: !!apiKey
        });

        // Retry logic for rate limiting
        let lastError = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                if (attempt > 0) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }

                const response = await fetch(GEMINI_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey,
                    },
                    body: JSON.stringify({
                        contents: contents,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2000,
                        }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Gemini API Error (Attempt ${attempt + 1}):`, response.status, errorText);

                    if (response.status === 429 && attempt < 2) {
                        lastError = { status: 429, text: errorText };
                        continue; // Retry
                    }

                    if (response.status === 429) {
                        return NextResponse.json({
                            message: '⚠️ **API Rate Limit Reached**\n\nThe Gemini API has reached its quota limit. This could be due to:\n- Free tier limitations\n- Too many requests in a short time\n\n**Suggestions:**\n- Wait a few minutes before trying again\n- Check your API quota at [Google AI Studio](https://aistudio.google.com/)\n- Consider upgrading your API plan\n\n[SUGGESTIONS: What are conservation tips?, Tell me about pollution tracking, Show biodiversity data]',
                            timestamp: new Date().toISOString(),
                        });
                    }

                    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response at this time.";

                return NextResponse.json({
                    message: assistantMessage,
                    timestamp: new Date().toISOString(),
                });

            } catch (fetchError) {
                lastError = fetchError;
                if (attempt === 2) throw fetchError; // Throw on last attempt
            }
        }

        throw lastError;

    } catch (error) {
        console.error('Chatbot API error:', error);
        return NextResponse.json({
            message: '❌ System Error: Unable to connect to EcoLens Intelligence. Please try again later.',
            timestamp: new Date().toISOString(),
        });
    }
}
