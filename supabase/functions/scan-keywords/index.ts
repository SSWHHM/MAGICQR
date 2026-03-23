import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_TIMEOUT_MS = 25000;

serve(async (req) => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const { service_id, is_retry = false } = await req.json();
    if (!service_id) return new Response(JSON.stringify({ error: 'service_id required' }), { status: 400, headers });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ─── Idempotency guard ───────────────────────────────────────────────────
    const { data: service, error: fetchErr } = await supabase
      .from('services')
      .select('*, businesses(*)')
      .eq('id', service_id)
      .single();

    if (fetchErr || !service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers });
    }

    // Don't re-scan if already ready (unless forced retry)
    if (service.seo_status === 'ready' && !is_retry) {
      return new Response(JSON.stringify({ status: 'already_ready' }), { headers });
    }
    // Don't scan if too many retries
    if (service.seo_retry_count >= 3) {
      return new Response(JSON.stringify({ status: 'max_retries_reached' }), { headers });
    }

    // Mark as scanning
    await supabase.from('services').update({
      seo_status: 'scanning',
      seo_last_attempt: new Date().toISOString(),
      seo_retry_count: (service.seo_retry_count || 0) + 1,
    }).eq('id', service_id);

    // ─── Build Gemini prompt ─────────────────────────────────────────────────
    const biz = service.businesses;
    const prompt = `You are a local SEO expert for Indian businesses.

BUSINESS: ${biz.name} (${biz.category || 'business'}) in ${biz.neighborhood || ''} ${biz.city || ''}
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

    // ─── Call Gemini with timeout ────────────────────────────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    let geminiData: any;
    try {
      const geminiResp = await fetch(
        `${GEMINI_URL}?key=${Deno.env.get('GEMINI_API_KEY')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 4000, responseMimeType: 'application/json' },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      if (!geminiResp.ok) throw new Error(`Gemini HTTP ${geminiResp.status}`);
      geminiData = await geminiResp.json();
    } catch (err) {
      clearTimeout(timeoutId);
      const errMsg = err instanceof Error ? err.message : String(err);
      await supabase.from('services').update({ seo_status: 'failed', seo_error: errMsg }).eq('id', service_id);
      return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers });
    }

    // ─── Parse keywords ──────────────────────────────────────────────────────
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty Gemini response');

    let parsed: any;
    try { parsed = JSON.parse(rawText); } catch { throw new Error('Invalid JSON from Gemini'); }
    const keywords = parsed.keywords;
    if (!Array.isArray(keywords) || !keywords.length) throw new Error('No keywords in response');

    // ─── Soft-delete old keywords + insert fresh batch ───────────────────────
    await supabase.from('seo_keywords').update({ is_active: false }).eq('service_id', service_id);

    const rows = keywords.map((k: any) => ({
      business_id: service.business_id,
      service_id,
      keyword: k.keyword,
      type: k.type || 'service_based',
      priority: k.priority || 2,
      is_active: true,
    }));
    await supabase.from('seo_keywords').insert(rows);

    // ─── Mark service ready ──────────────────────────────────────────────────
    await supabase.from('services').update({
      seo_status: 'ready',
      seo_keyword_count: keywords.length,
      seo_error: null,
    }).eq('id', service_id);

    return new Response(JSON.stringify({ status: 'ok', keyword_count: keywords.length }), { headers });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers });
  }
});
