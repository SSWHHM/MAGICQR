import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    setDoc,
} from 'firebase/firestore';
import { db, isConfigured } from '../firebase';
import {
    MOCK_BUSINESSES,
    MOCK_SERVICES,
    MOCK_VARIANTS,
    MOCK_EVENTS,
} from './mockData';

// ─── Mock helpers (no-op when not configured) ────────────────────────────────
// Writes in mock mode are intentionally silent — state lives only in-memory
// for the duration of the session. This is for UI testing only.

function notConfiguredWrite(opName) {
    console.info(`[mock] ${opName} — Firebase not configured, write is a no-op`);
    return Promise.resolve({ id: `mock-${Date.now()}` });
}

// ─── Businesses ──────────────────────────────────────────────────────────────

export async function getBusinessBySlug(slug) {
    if (!isConfigured) {
        const found = MOCK_BUSINESSES.find((r) => r.slug === slug) ?? null;
        return found;
    }
    const q = query(collection(db, 'businesses'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getBusiness(id) {
    if (!isConfigured) {
        return MOCK_BUSINESSES.find((r) => r.id === id) ?? null;
    }
    const snap = await getDoc(doc(db, 'businesses', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function getAllBusinesses() {
    if (!isConfigured) return MOCK_BUSINESSES;
    const snap = await getDocs(collection(db, 'businesses'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createBusiness(data) {
    if (!isConfigured) return notConfiguredWrite('createBusiness');
    return addDoc(collection(db, 'businesses'), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function updateBusiness(id, data) {
    if (!isConfigured) return notConfiguredWrite('updateBusiness');
    return updateDoc(doc(db, 'businesses', id), data);
}

export async function deleteBusiness(id) {
    if (!isConfigured) return notConfiguredWrite('deleteBusiness');
    return deleteDoc(doc(db, 'businesses', id));
}

// Backward-compat aliases (used by RestaurantForm, VariantManager, Analytics)
export const getRestaurantBySlug = getBusinessBySlug;
export const getRestaurant = getBusiness;
export const getAllRestaurants = getAllBusinesses;
export const createRestaurant = createBusiness;
export const updateRestaurant = updateBusiness;
export const deleteRestaurant = deleteBusiness;

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getServices(restaurantId) {
    if (!isConfigured) {
        return (MOCK_SERVICES[restaurantId] ?? []).filter((s) => s.active);
    }
    const snap = await getDocs(
        query(collection(db, 'businesses', restaurantId, 'services'), where('active', '==', true))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllServicesAdmin(restaurantId) {
    if (!isConfigured) {
        return MOCK_SERVICES[restaurantId] ?? [];
    }
    const snap = await getDocs(collection(db, 'businesses', restaurantId, 'services'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createService(restaurantId, data) {
    if (!isConfigured) return notConfiguredWrite('createService');
    return addDoc(collection(db, 'businesses', restaurantId, 'services'), {
        ...data,
        active: true,
    });
}

export async function updateService(restaurantId, serviceId, data) {
    if (!isConfigured) return notConfiguredWrite('updateService');
    return updateDoc(doc(db, 'businesses', restaurantId, 'services', serviceId), data);
}

export async function deleteService(restaurantId, serviceId) {
    if (!isConfigured) return notConfiguredWrite('deleteService');
    return deleteDoc(doc(db, 'businesses', restaurantId, 'services', serviceId));
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export async function getActiveVariants(restaurantId, serviceId) {
    if (!isConfigured) {
        return (MOCK_VARIANTS[serviceId] ?? []).filter((v) => v.status === 'active');
    }
    const q = query(
        collection(db, 'businesses', restaurantId, 'services', serviceId, 'variants'),
        where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRandomVariants(restaurantId, serviceId, count = 4, excludeIds = []) {
    if (!isConfigured) {
        const pool = (MOCK_VARIANTS[serviceId] ?? []).filter(
            (v) => v.status === 'active' && !excludeIds.includes(v.id)
        );
        // Shuffle and take first `count`
        const shuffled = pool.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    const variants = await getActiveVariants(restaurantId, serviceId);
    const now = new Date();
    const available = variants.filter((v) => {
        if (excludeIds.includes(v.id)) return false;
        if (v.deprioritizedUntil && v.deprioritizedUntil.toDate && v.deprioritizedUntil.toDate() > now) return false;
        return true;
    });
    available.sort((a, b) => {
        const aTime = a.lastServedAt?.toDate?.()?.getTime() || 0;
        const bTime = b.lastServedAt?.toDate?.()?.getTime() || 0;
        return aTime - bTime;
    });
    return available.slice(0, count);
}

export async function markVariantsServed(restaurantId, serviceId, variantIds) {
    if (!isConfigured) return notConfiguredWrite('markVariantsServed');
    const promises = variantIds.map((vid) =>
        updateDoc(
            doc(db, 'businesses', restaurantId, 'services', serviceId, 'variants', vid),
            { lastServedAt: serverTimestamp() }
        )
    );
    return Promise.all(promises);
}

export async function markVariantUsed(restaurantId, serviceId, variantId) {
    if (!isConfigured) return notConfiguredWrite('markVariantUsed');
    return updateDoc(
        doc(db, 'businesses', restaurantId, 'services', serviceId, 'variants', variantId),
        { status: 'used', usedAt: serverTimestamp() }
    );
}

export async function deprioritizeVariant(restaurantId, serviceId, variantId, days = 7) {
    if (!isConfigured) return notConfiguredWrite('deprioritizeVariant');
    const deprioritizedUntil = Timestamp.fromDate(
        new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    );
    return updateDoc(
        doc(db, 'businesses', restaurantId, 'services', serviceId, 'variants', variantId),
        { deprioritizedUntil }
    );
}

export async function createVariant(restaurantId, serviceId, text) {
    if (!isConfigured) return notConfiguredWrite('createVariant');
    return addDoc(
        collection(db, 'businesses', restaurantId, 'services', serviceId, 'variants'),
        {
            text,
            status: 'active',
            lastServedAt: null,
            usedAt: null,
            deprioritizedUntil: null,
            createdAt: serverTimestamp(),
        }
    );
}

export async function createVariantsBatch(restaurantId, serviceId, texts) {
    if (!isConfigured) return notConfiguredWrite('createVariantsBatch');
    const promises = texts.map((text) => createVariant(restaurantId, serviceId, text));
    return Promise.all(promises);
}

export async function updateVariant(restaurantId, serviceId, variantId, data) {
    if (!isConfigured) return notConfiguredWrite('updateVariant');
    return updateDoc(
        doc(db, 'businesses', restaurantId, 'services', serviceId, 'variants', variantId),
        data
    );
}

export async function deleteVariant(restaurantId, serviceId, variantId) {
    if (!isConfigured) return notConfiguredWrite('deleteVariant');
    return deleteDoc(
        doc(db, 'businesses', restaurantId, 'services', serviceId, 'variants', variantId)
    );
}

export async function getAllVariantsAdmin(restaurantId, serviceId) {
    if (!isConfigured) {
        return MOCK_VARIANTS[serviceId] ?? [];
    }
    const snap = await getDocs(
        collection(db, 'businesses', restaurantId, 'services', serviceId, 'variants')
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Events / Analytics ───────────────────────────────────────────────────────

export async function logEvent(restaurantId, type, data = {}) {
    if (!isConfigured) {
        // In mock mode, events are intentionally not persisted
        return notConfiguredWrite(`logEvent:${type}`);
    }
    return addDoc(collection(db, 'businesses', restaurantId, 'events'), {
        type,
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function getEvents(restaurantId) {
    if (!isConfigured) {
        return MOCK_EVENTS[restaurantId] ?? [];
    }
    const snap = await getDocs(
        query(
            collection(db, 'businesses', restaurantId, 'events'),
            orderBy('createdAt', 'desc'),
            limit(5000)
        )
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
