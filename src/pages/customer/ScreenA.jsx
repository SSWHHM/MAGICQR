import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    collection,
    query,
    where,
    limit,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from '../../firebase';
import { getBusinessBySlug, logEvent } from '../../lib/firestore';
import { getSessionId } from '../../lib/utils';
import { MOCK_SERVICES, MOCK_GENERATED_VARIANTS } from '../../lib/mockData';

// ─── Constants ────────────────────────────────────────────────────────────────
const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ─── Component ────────────────────────────────────────────────────────────────
export default function ScreenA() {
    const { slug } = useParams();
    const navigate = useNavigate();

    // ── Business / loading state ──────────────────────────────────────────────
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Screen state machine ──────────────────────────────────────────────────
    // valid values: 'rating' | 'service-select' | 'review-variants' | 'negative-feedback'
    const [screen, setScreen] = useState('rating');
    const [starRating, setStarRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    // ── Service selection state ───────────────────────────────────────────────
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);

    // ── Review variants state ─────────────────────────────────────────────────
    const [reviewVariants, setReviewVariants] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // ── Copy / redirect ───────────────────────────────────────────────────────
    const [copiedId, setCopiedId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const copyInFlightRef = useRef(false);

    // ── Toast ─────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState(null);

    // ── Negative feedback ─────────────────────────────────────────────────────
    const [negativeFeedback, setNegativeFeedback] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);

    // ─── Fetch business on mount ──────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const biz = await getBusinessBySlug(slug);
                if (!biz) {
                    setError('Business not found');
                    setLoading(false);
                    return;
                }
                setBusiness(biz);
                const sessionId = getSessionId();
                await logEvent(biz.id, 'scan', { anonSessionId: sessionId });
            } catch (err) {
                console.error(err);
                setError('Something went wrong. Please try again.');
            }
            setLoading(false);
        }
        load();
    }, [slug]);

    // ─── Subscribe to services in real-time once business is loaded ───────────
    useEffect(() => {
        if (!business) return;

        if (!isConfigured) {
            // Mock mode: use in-memory mock services
            const bizServices = MOCK_SERVICES[business.id] ?? [];
            setServices(bizServices.filter((s) => s.active !== false));
            return;
        }

        const q = query(
            collection(db, 'businesses', business.id, 'services'),
            where('active', '!=', false)
        );
        const unsub = onSnapshot(
            q,
            (snap) => {
                setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            },
            async (err) => {
                // Firestore rules may not cover 'businesses' yet — fall back to helper
                console.warn('[ScreenA] onSnapshot services failed, falling back:', err.message);
                try {
                    const { getServices } = await import('../../lib/firestore');
                    const svc = await getServices(business.id);
                    setServices(svc);
                } catch (e2) {
                    console.error('[ScreenA] getServices fallback also failed:', e2);
                }
            }
        );
        return unsub;
    }, [business]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    /** Step 3: Star rating handler */
    const handleStarClick = (star) => {
        setStarRating(star);
        if (star >= 4) {
            setScreen('service-select');
        } else {
            setScreen('negative-feedback');
        }
    };

    /** Step 4: Service selection */
    const handleServiceSelect = async (service) => {
        setSelectedService(service);
        setScreen('review-variants');
        await loadReviewVariants(service);
    };

    /** Step 5: Load / generate review variants with deduplication */
    const loadReviewVariants = async (service) => {
        setIsGenerating(true);
        const serviceId = service?.id ?? 'general';
        const businessName = business.displayName;

        if (!isConfigured) {
            // Mock mode: simulate a delay then return mock variants
            await new Promise((r) => setTimeout(r, 1200));
            const serviceVariants = MOCK_GENERATED_VARIANTS.slice(0, 3).map((text, i) => ({
                id: `mock-${serviceId}-${i}`,
                text,
                serviceId,
            }));
            setReviewVariants(serviceVariants);
            setIsGenerating(false);
            return;
        }

        try {
            // Try fetching unused pre-generated variants first
            const q = query(
                collection(db, 'businesses', business.id, 'reviews'),
                where('used', '==', false),
                where('serviceId', '==', serviceId),
                limit(3)
            );
            const snap = await getDocs(q);

            if (snap.docs.length >= 3) {
                setReviewVariants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setIsGenerating(false);
                return;
            }

            // Fewer than 3 unused — generate fresh ones via Gemini
            const prompt = service
                ? `Generate 3 different genuine 5-star Google reviews for a business called "${businessName}" specifically about their "${service.name}" service. ${service.description ? `Context: ${service.description}.` : ''} Each review must be between 40-70 words. Sound like a real customer. Do not use words like 'outstanding', 'exceptional', or 'top-notch'. Return ONLY a valid JSON array of 3 strings, no extra text.`
                : `Generate 3 different genuine 5-star Google reviews for a business called "${businessName}". Each review must be between 40-70 words. Sound like a real customer. Do not use words like 'outstanding', 'exceptional', or 'top-notch'. Return ONLY a valid JSON array of 3 strings, no extra text.`;

            const response = await fetch(
                `${GEMINI_API_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 1.1,
                            maxOutputTokens: 4096,
                            responseMimeType: 'application/json',
                        },
                    }),
                }
            );

            if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

            const data = await response.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch {
                const match = raw.match(/\[[\s\S]*\]/);
                parsed = match ? JSON.parse(match[0]) : [];
            }
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty response');

            // Save to Firestore (deduplication pool) and surface to UI
            const saved = await Promise.all(
                parsed.slice(0, 3).map(async (text) => {
                    const ref = await addDoc(
                        collection(db, 'businesses', business.id, 'reviews'),
                        {
                            text,
                            serviceId,
                            serviceName: service?.name ?? 'General',
                            used: false,
                            usedAt: null,
                            createdAt: serverTimestamp(),
                        }
                    );
                    return { id: ref.id, text, serviceId };
                })
            );
            setReviewVariants(saved);
        } catch (err) {
            console.error('Error loading review variants:', err);
            // Graceful fallback — never leave the user stuck
            setReviewVariants([
                {
                    id: 'f1',
                    text: `Really happy with the ${service?.name ?? 'service'} here. Would definitely recommend.`,
                },
                {
                    id: 'f2',
                    text: `Great experience overall. The ${service?.name ?? 'team'} was professional and efficient.`,
                },
                {
                    id: 'f3',
                    text: `Visited recently and was genuinely impressed. Will be coming back for sure.`,
                },
            ]);
        }
        setIsGenerating(false);
    };

    /** Step 6: Copy review text + mark used + open Google */
    const handleCopyAndRedirect = async (review) => {
        if (copyInFlightRef.current) return;
        copyInFlightRef.current = true;
        setSelectedReview(review);

        try {
            await navigator.clipboard.writeText(review.text);
            setCopiedId(review.id);
            showToast('✅ Copied! Now paste it on Google.');
        } catch {
            showToast('⚠️ Auto-copy failed — select the text and copy manually.');
        }

        // Mark as used in Firestore BEFORE redirecting
        if (isConfigured && !review.id.startsWith('f') && !review.id.startsWith('mock-')) {
            try {
                await updateDoc(doc(db, 'businesses', business.id, 'reviews', review.id), {
                    used: true,
                    usedAt: serverTimestamp(),
                });
            } catch (e) {
                console.warn('Could not mark review as used:', e);
            }
        }

        // Log event
        const sessionId = getSessionId();
        await logEvent(business.id, 'copy_open', {
            anonSessionId: sessionId,
            serviceId: selectedService?.id ?? 'general',
            reviewId: review.id,
        });

        setTimeout(() => {
            window.location.href = `https://search.google.com/local/writereview?placeid=${business.placeId}`;
        }, 600);
    };

    // Submit negative feedback text
    const handleFeedbackSubmit = async () => {
        const sessionId = getSessionId();
        await logEvent(business.id, 'negative_feedback', {
            anonSessionId: sessionId,
            starRating,
            message: negativeFeedback.trim(),
        });
        setFeedbackSent(true);
    };

    // ─── Render helpers ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="bg-mesh">
                <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div className="spinner" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-mesh">
                <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{error}</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>Check the URL and try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Business header (shared across screens) ──────────────────────────────
    const BusinessHeader = () => (
        <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
            {business.logoUrl && (
                <img
                    src={business.logoUrl}
                    alt={business.displayName}
                    style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '1.25rem',
                        objectFit: 'cover',
                        margin: '0 auto 1rem',
                        border: '2px solid rgba(255,255,255,0.1)',
                        display: 'block',
                    }}
                />
            )}
            <h1
                style={{
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                {business.displayName}
            </h1>
        </div>
    );

    // ─── SCREEN: rating ───────────────────────────────────────────────────────
    if (screen === 'rating') {
        return (
            <div className="bg-mesh">
                <div className="page-container fade-in">
                    <BusinessHeader />

                    <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '1rem' }}>
                            How was your experience?
                        </p>
                        <div className="star-rating" style={{ justifyContent: 'center' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={star <= (hoverRating || starRating) ? 'active' : ''}
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                    style={{ fontSize: '2.5rem', transition: 'transform 0.1s', transform: star <= (hoverRating || starRating) ? 'scale(1.15)' : 'scale(1)' }}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
                            Tap a star to continue
                        </p>
                    </div>

                    {toast && <div className="toast">{toast}</div>}
                </div>
            </div>
        );
    }

    // ─── SCREEN: service-select ───────────────────────────────────────────────
    if (screen === 'service-select') {
        return (
            <div className="bg-mesh">
                <div className="page-container fade-in">
                    <BusinessHeader />

                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            What did you experience today?
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                            Select a service to personalize your review
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {services.map((svc) => (
                                <button
                                    key={svc.id}
                                    className="radio-card"
                                    onClick={() => handleServiceSelect(svc)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1rem 1.25rem',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.875rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        cursor: 'pointer',
                                        color: 'var(--color-text)',
                                        fontWeight: '500',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {svc.name}
                                    {svc.description && (
                                        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', fontWeight: '400' }}>
                                            {svc.description}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handleServiceSelect(null)}
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                padding: '0.75rem',
                                background: 'none',
                                border: '1px dashed rgba(255,255,255,0.15)',
                                borderRadius: '0.875rem',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                            }}
                        >
                            Skip — General Experience
                        </button>
                    </div>

                    {toast && <div className="toast">{toast}</div>}
                </div>
            </div>
        );
    }

    // ─── SCREEN: review-variants ──────────────────────────────────────────────
    if (screen === 'review-variants') {
        return (
            <div className="bg-mesh">
                <div className="page-container fade-in">
                    <BusinessHeader />

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Choose your review</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            Tap one to copy it, then paste it on Google
                        </p>
                    </div>

                    {isGenerating ? (
                        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                Crafting personalized reviews for you...
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {reviewVariants.map((review, idx) => (
                                <button
                                    key={review.id}
                                    onClick={() => handleCopyAndRedirect(review)}
                                    className="slide-up"
                                    style={{
                                        animationDelay: `${idx * 80}ms`,
                                        textAlign: 'left',
                                        padding: '1.25rem',
                                        border: `1px solid ${copiedId === review.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '0.875rem',
                                        background: copiedId === review.id
                                            ? 'rgba(108, 92, 231, 0.15)'
                                            : 'rgba(255,255,255,0.04)',
                                        cursor: 'pointer',
                                        color: 'var(--color-text)',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.55',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {copiedId === review.id && (
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-primary-light)', marginBottom: '0.4rem', fontWeight: '600' }}>
                                            ✅ Copied!
                                        </span>
                                    )}
                                    "{review.text}"
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Hint */}
                    {!isGenerating && (
                        <div style={{
                            textAlign: 'center',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            background: 'rgba(108, 92, 231, 0.08)',
                            border: '1px solid rgba(108, 92, 231, 0.15)',
                        }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                💡 Tap a review above to copy it. On Google, <strong>long-press → Paste → Post</strong>.
                            </p>
                        </div>
                    )}

                    {toast && <div className="toast">{toast}</div>}
                </div>
            </div>
        );
    }

    // ─── SCREEN: negative-feedback ────────────────────────────────────────────
    if (screen === 'negative-feedback') {
        return (
            <div className="bg-mesh">
                <div className="page-container fade-in">
                    <BusinessHeader />

                    <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                        {feedbackSent ? (
                            <>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
                                <h2 style={{ marginBottom: '0.5rem' }}>Thank you!</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    We appreciate your honest feedback. We'll work on improving.
                                </p>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>😔</div>
                                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                                    We're sorry to hear that
                                </h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                    Your feedback helps us improve. What went wrong?
                                </p>
                                <textarea
                                    value={negativeFeedback}
                                    onChange={(e) => setNegativeFeedback(e.target.value)}
                                    placeholder="Tell us what we can do better..."
                                    rows={4}
                                    className="input"
                                    style={{ resize: 'vertical', marginBottom: '1rem', textAlign: 'left' }}
                                />
                                <button
                                    className="btn-primary"
                                    onClick={handleFeedbackSubmit}
                                    disabled={!negativeFeedback.trim()}
                                >
                                    Send Feedback
                                </button>
                            </>
                        )}
                    </div>

                    {toast && <div className="toast">{toast}</div>}
                </div>
            </div>
        );
    }

    return null;
}
