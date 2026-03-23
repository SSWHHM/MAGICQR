import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBusinessBySlug, logEvent, getRandomVariants, markVariantsServed, submitFeedback, getServices } from '../../lib/db';
import { generateReviewVariants } from '../../lib/gemini';
import { getSessionId } from '../../lib/utils';

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

    // ─── Subscribe to services once business is loaded ───────────────────────
    useEffect(() => {
        if (!business) return;
        getServices(business.id).then(setServices);
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

    /** Step 5: Load review variants (Supabase DB first, Gemini fallback) */
    const loadReviewVariants = async (service) => {
        setIsGenerating(true);
        try {
            // Try DB variants first (LRU order)
            const dbVariants = await getRandomVariants(business.id, service?.id ?? null, 3, []);
            if (dbVariants.length >= 2) {
                setReviewVariants(dbVariants.slice(0, 3));
                await markVariantsServed(business.id, service?.id, dbVariants.map((v) => v.id));
                setIsGenerating(false);
                return;
            }
            // Not enough DB variants — generate live with Gemini (SEO keywords auto-injected)
            const generated = await generateReviewVariants(business, service, starRating, []);
            setReviewVariants(generated.map((g, i) => ({ id: `gen-${i}`, text: g.text })));
        } catch (err) {
            console.error('Error loading review variants:', err);
            setReviewVariants([
                { id: 'f1', text: `Really happy with the ${service?.name ?? 'service'} here. Would definitely recommend.` },
                { id: 'f2', text: `Great experience overall. The ${service?.name ?? 'team'} was professional and efficient.` },
                { id: 'f3', text: `Visited recently and was genuinely impressed. Will be coming back for sure.` },
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
            window.location.href = `https://search.google.com/local/writereview?placeid=${business.google_place_id}`;
        }, 600);
    };

    // Submit negative feedback to feedback_inbox table
    const handleFeedbackSubmit = async () => {
        try {
            await submitFeedback(
                business.id,
                selectedService?.id ?? null,
                starRating,
                negativeFeedback.trim()
            );
            const sessionId = getSessionId();
            await logEvent(business.id, 'negative_feedback', { anonSessionId: sessionId, rating: starRating });
        } catch (err) {
            console.warn('[ScreenA] submitFeedback failed:', err.message);
        }
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
            {business.logo_url && (
                <img
                    src={business.logo_url}
                    alt={business.name}
                    style={{ width: '72px', height: '72px', borderRadius: '1.25rem', objectFit: 'cover', margin: '0 auto 1rem', border: '2px solid rgba(255,255,255,0.1)', display: 'block' }}
                />
            )}
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {business.name}
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
