const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getApiKey() {
    return import.meta.env.VITE_GEMINI_API_KEY;
}

async function callGemini(prompt, temperature = 0.75, maxTokens = 8000) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set');

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error ${response.status}: ${err?.error?.message || ''}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');
    return text;
}

// ─── Bulk Variant Generation (VariantManager — admin) ────────────────────────
// Generates up to 200 review variants for a service in batch (temperature 1.2 for max variety)

export async function generateVariants(serviceName, serviceDescription = '', count = 200) {
    const contextLine = serviceDescription ? `Service context: ${serviceDescription}.` : '';

    const prompt = `Generate exactly ${count} unique short Google review texts for a business's "${serviceName}" service. ${contextLine}
Requirements:
- Each review should be 1-3 sentences
- Write in casual, natural, friendly English
- Make each review genuinely unique with varied phrasing, different aspects mentioned
- Include a mix of enthusiastic, satisfied, and warm tones
- Do NOT use words like 'outstanding', 'exceptional', or 'top-notch'
- Do NOT use repetitive patterns or templates
- Do NOT start multiple reviews the same way
- Sound like a real customer, not a marketer
- Output ONLY a JSON array of strings, no other text
- Example format: ["Review 1 text here", "Review 2 text here", ...]`;

    const text = await callGemini(prompt, 1.2, 30000);

    try {
        const reviews = JSON.parse(text);
        if (!Array.isArray(reviews)) throw new Error('Not an array');
        return reviews.filter((r) => typeof r === 'string' && r.trim().length > 0);
    } catch {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]).filter((r) => typeof r === 'string');
        throw new Error('Failed to parse Gemini response');
    }
}

// ─── SEO Keyword Generation (Edge Function — server-side) ────────────────────
// Called by the scan-keywords Edge Function once per service.
// Temperature 0.75 for creative local long-tail variety.

export async function scanServiceKeywords(business, service) {
    const prompt = `You are a local SEO expert for Indian businesses.

BUSINESS: ${business.name} (${business.category || 'business'}) in ${business.neighborhood || ''} ${business.city || ''}
SERVICE: ${service.name} — ${service.description || ''}
TAGS: ${(service.tags || []).join(', ')}

Generate exactly 20 SEO keywords that, when naturally written in a Google review, help this business rank on Google Maps for this service.

Rules:
- Mix types: branded, service_based, location_based, long_tail, intent_based
- Must sound NATURAL inside a review sentence written by a customer
- Prioritize local intent (city/neighborhood/landmark specific)
- Long-tail: think how Indians actually search: "best [service] near [landmark]", "[item] worth trying in [area]"
- Priority: 1 = highest ranking impact (7 keywords), 2 = supporting (8 keywords), 3 = variety (5 keywords)
- Return ONLY valid JSON, no markdown

{"keywords":[{"keyword":"...","type":"service_based","priority":1}]}`;

    const text = await callGemini(prompt, 0.75, 4000);
    const parsed = JSON.parse(text);
    if (!parsed.keywords?.length) throw new Error('No keywords returned');
    return parsed.keywords;
}

// ─── Service-Aware Review Generation (ScreenB — customer-facing) ──────────────
// Called live at scan time. Keywords are pre-loaded from DB (cheap SELECT).
// Temperature 0.4 — consistency and human-likeness matter here.

export async function generateReviewFromService(business, service, rating, keywords = [], length = 'medium') {
    const wordTargets = { short: '40-60', medium: '70-90', long: '110-130' };
    const negativeNote = rating <= 2 ? 'TONE: Disappointed but constructive and fair.' : '';

    const keywordBlock = keywords.length
        ? `Naturally include 2-3 of these phrases (don't force all of them):\n${keywords.map((k) => `- "${k}"`).join('\n')}`
        : '';

    const prompt = `Write a genuine Google review from a real customer.

Business: ${business.name}, ${business.city || ''}
Service used: ${service.name}${service.description ? ' — ' + service.description : ''}
Star rating: ${rating}/5
${negativeNote}

${keywordBlock}

Rules:
- Sound like a real person, NOT a marketer
- No bullet points, no headers
- Vary sentence structure naturally
- NEVER use: outstanding, exceptional, impeccable, top-notch, five-star
- Word count: ${wordTargets[length] || '70-90'} words

Write the review now (output ONLY the review text, no quotes, no label):`;

    const text = await callGemini(prompt, 0.4, 1000);
    return text.trim().replace(/^["']|["']$/g, '');
}

// ─── Generate 3 length variants (short/medium/long) for ScreenB ──────────────

export async function generateReviewVariants(business, service, rating, keywords = []) {
    const [short, medium, long] = await Promise.all([
        generateReviewFromService(business, service, rating, keywords, 'short'),
        generateReviewFromService(business, service, rating, keywords, 'medium'),
        generateReviewFromService(business, service, rating, keywords, 'long'),
    ]);
    return [
        { text: short, length: 'short', label: 'Quick & simple' },
        { text: medium, length: 'medium', label: 'Just right' },
        { text: long, length: 'long', label: 'Detailed' },
    ];
}
