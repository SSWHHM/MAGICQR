import { supabase } from './supabase.js';

/**
 * Fetches keywords for review generation using LRU strategy:
 * 2x priority-1 (highest SEO impact) + 1x priority-2 (supporting)
 * Updates inject_count + last_injected atomically via RPC.
 * Writes junction table entry if variantId provided.
 *
 * @param {string} serviceId
 * @param {string|null} variantId - UUID of the generated variant (for audit trail)
 * @returns {string[]} array of keyword strings to inject into review prompt
 */
export async function getKeywordsForReview(serviceId, variantId = null) {
    const [{ data: p1 }, { data: p2 }] = await Promise.all([
        supabase
            .from('seo_keywords')
            .select('id, keyword')
            .eq('service_id', serviceId)
            .eq('is_active', true)
            .eq('priority', 1)
            .order('last_injected', { ascending: true, nullsFirst: true })
            .limit(2),
        supabase
            .from('seo_keywords')
            .select('id, keyword')
            .eq('service_id', serviceId)
            .eq('is_active', true)
            .eq('priority', 2)
            .order('last_injected', { ascending: true, nullsFirst: true })
            .limit(1),
    ]);

    const selected = [...(p1 || []), ...(p2 || [])];
    if (!selected.length) return [];

    const selectedIds = selected.map((k) => k.id);

    // Atomic LRU update
    await supabase.rpc('increment_keyword_inject', { keyword_ids: selectedIds });

    // Write audit junction table (denormalized text survives soft-deletes)
    if (variantId && selected.length) {
        await supabase.from('review_keyword_usage').insert(
            selected.map((k) => ({
                variant_id: variantId,
                keyword_id: k.id,
                keyword_text: k.keyword,
            }))
        );
    }

    return selected.map((k) => k.keyword);
}

/**
 * Fetches all active SEO keywords for a service (admin panel display)
 */
export async function getServiceKeywords(serviceId) {
    const { data, error } = await supabase
        .from('seo_keywords')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .order('inject_count', { ascending: false });
    if (error) return [];
    return data;
}

/**
 * Triggers the scan-keywords Edge Function (non-blocking fire-and-forget)
 * Called by ServiceForm after saving a service.
 */
export async function triggerKeywordScan(serviceId) {
    // Mark pending in DB immediately so Realtime badge updates
    await supabase
        .from('services')
        .update({ seo_status: 'pending' })
        .eq('id', serviceId);

    // Non-blocking invoke — Edge Function handles the rest
    supabase.functions.invoke('scan-keywords', {
        body: { service_id: serviceId },
    }).catch((err) => {
        console.warn('[triggerKeywordScan] Edge Function invoke failed:', err.message);
    });
}

/**
 * Manually adds a keyword to a service (power feature for SEO-aware admins)
 */
export async function addKeywordManually(businessId, serviceId, keyword, type = 'service_based', priority = 2) {
    const { error } = await supabase
        .from('seo_keywords')
        .insert({ business_id: businessId, service_id: serviceId, keyword, type, priority, is_active: true });
    if (error) throw error;
}

/**
 * Soft-deletes a keyword from the admin panel
 */
export async function removeKeyword(keywordId) {
    const { error } = await supabase
        .from('seo_keywords')
        .update({ is_active: false })
        .eq('id', keywordId);
    if (error) throw error;
}
