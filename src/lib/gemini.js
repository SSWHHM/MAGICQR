import { isConfigured } from '../firebase';
import { MOCK_GENERATED_VARIANTS } from './mockData';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateVariants(serviceName, serviceDescription = '', count = 200) {
    // Mock mode: return sample variants with a fake delay so the spinner shows
    if (!isConfigured || !import.meta.env.VITE_GEMINI_API_KEY) {
        await new Promise((r) => setTimeout(r, 1500)); // simulate network call
        // Repeat/expand the mock variants to match the requested count
        const expanded = [];
        for (let i = 0; i < count; i++) {
            const base = MOCK_GENERATED_VARIANTS[i % MOCK_GENERATED_VARIANTS.length];
            // Add a unique suffix to avoid identical strings in the batch
            expanded.push(i < MOCK_GENERATED_VARIANTS.length ? base : `${base} (variant ${i + 1})`);
        }
        return expanded.slice(0, count);
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const contextLine = serviceDescription
        ? `Service context: ${serviceDescription}.`
        : '';

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

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 1.2,
                maxOutputTokens: 30000,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} ${errorData?.error?.message || ''}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response from Gemini');

    try {
        const reviews = JSON.parse(text);
        if (!Array.isArray(reviews)) throw new Error('Response is not an array');
        return reviews.filter((r) => typeof r === 'string' && r.trim().length > 0);
    } catch {
        // Try to extract JSON array from the response
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
            const reviews = JSON.parse(match[0]);
            return reviews.filter((r) => typeof r === 'string' && r.trim().length > 0);
        }
        throw new Error('Failed to parse Gemini response as JSON array');
    }
}
