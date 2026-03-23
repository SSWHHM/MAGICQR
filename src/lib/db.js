import { supabase } from './supabase.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function toSlug(name) {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ─── Businesses ──────────────────────────────────────────────────────────────

export async function getBusinessBySlug(slug) {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) return null;
    return data;
}

export async function getBusiness(id) {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return data;
}

export async function getAllBusinesses() {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

export async function createBusiness(data) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate deterministic slug from name if not provided
    const slug = data.slug || toSlug(data.name);
    
    const { data: result, error } = await supabase
        .from('businesses')
        .upsert(
            { ...data, slug, owner_id: user.id },
            { onConflict: 'slug' }
        )
        .select('id, name, slug')
        .single();
        
    if (error) throw error;
    return result;
}

export async function updateBusiness(id, data) {
    const { error } = await supabase
        .from('businesses')
        .update(data)
        .eq('id', id);
    if (error) throw error;
}

export async function deleteBusiness(id) {
    const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// Backward-compat aliases
export const getRestaurantBySlug = getBusinessBySlug;
export const getRestaurant = getBusiness;
export const getAllRestaurants = getAllBusinesses;
export const createRestaurant = createBusiness;
export const updateRestaurant = updateBusiness;
export const deleteRestaurant = deleteBusiness;

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getServices(businessId) {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('active', true)
        .order('created_at', { ascending: true });
    if (error) return [];
    return data;
}

export async function getAllServicesAdmin(businessId) {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: true });
    if (error) return [];
    return data;
}

export async function createService(businessId, data) {
    const { error } = await supabase
        .from('services')
        .insert({ ...data, business_id: businessId, active: true, seo_status: 'pending' });
    if (error) throw error;
}

export async function updateService(businessId, serviceId, data) {
    const { error } = await supabase
        .from('services')
        .update(data)
        .eq('id', serviceId)
        .eq('business_id', businessId);
    if (error) throw error;
}

export async function deleteService(businessId, serviceId) {
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('business_id', businessId);
    if (error) throw error;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export async function getActiveVariants(businessId, serviceId) {
    const { data, error } = await supabase
        .from('review_variants')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .eq('status', 'active');
    if (error) return [];
    return data;
}

export async function getRandomVariants(businessId, serviceId, count = 4, excludeIds = []) {
    const { data, error } = await supabase.rpc('get_random_variants', {
        p_service_id: serviceId,
        p_count: count,
        p_exclude_ids: excludeIds,
    });
    if (error) return [];
    return data;
}

export async function markVariantsServed(businessId, serviceId, variantIds) {
    const now = new Date().toISOString();
    const { error } = await supabase
        .from('review_variants')
        .update({ last_used: now })
        .in('id', variantIds);
    if (error) throw error;
}

export async function markVariantUsed(businessId, serviceId, variantId) {
    const { error } = await supabase
        .from('review_variants')
        .update({ status: 'used', last_used: new Date().toISOString() })
        .eq('id', variantId);
    if (error) throw error;
}

export async function deprioritizeVariant(businessId, serviceId, variantId, days = 7) {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
        .from('review_variants')
        .update({ status: 'deprioritized', deprioritized_until: until })
        .eq('id', variantId);
    if (error) throw error;
}

export async function createVariant(businessId, serviceId, text, length = null) {
    const { data, error } = await supabase
        .from('review_variants')
        .insert({
            service_id: serviceId,
            business_id: businessId,
            text,
            length,
            status: 'active',
            is_active: true,
        })
        .select('id, text')
        .single();
    if (error) throw error;
    return data;
}

export async function createVariantsBatch(businessId, serviceId, texts) {
    const rows = texts.map((text) => ({
        service_id: serviceId,
        business_id: businessId,
        text,
        status: 'active',
        is_active: true,
    }));
    const { error } = await supabase.from('review_variants').insert(rows);
    if (error) throw error;
}

export async function updateVariant(businessId, serviceId, variantId, data) {
    const { error } = await supabase
        .from('review_variants')
        .update(data)
        .eq('id', variantId);
    if (error) throw error;
}

export async function deleteVariant(businessId, serviceId, variantId) {
    const { error } = await supabase
        .from('review_variants')
        .update({ is_active: false })
        .eq('id', variantId);
    if (error) throw error;
}

export async function getAllVariantsAdmin(businessId, serviceId) {
    const { data, error } = await supabase
        .from('review_variants')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

// ─── Events / Analytics ───────────────────────────────────────────────────────

export async function logEvent(businessId, type, metadata = {}) {
    const { error } = await supabase
        .from('events')
        .insert({ business_id: businessId, type, metadata });
    if (error) console.warn('[logEvent] failed:', error.message);
}

export async function getEvents(businessId) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5000);
    if (error) return [];
    return data;
}

// ─── Feedback Inbox ───────────────────────────────────────────────────────────

export async function submitFeedback(businessId, serviceId, rating, message) {
    const { error } = await supabase
        .from('feedback_inbox')
        .insert({ business_id: businessId, service_id: serviceId, rating, message });
    if (error) throw error;
}

export async function getFeedback(businessId) {
    const { data, error } = await supabase
        .from('feedback_inbox')
        .select('*, services(name)')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

export async function resolveFeedback(feedbackId) {
    const { error } = await supabase
        .from('feedback_inbox')
        .update({ is_resolved: true })
        .eq('id', feedbackId);
    if (error) throw error;
}
