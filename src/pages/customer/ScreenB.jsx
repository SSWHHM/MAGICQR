import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    getRandomVariants,
    markVariantsServed,
    markVariantUsed,
    deprioritizeVariant,
    logEvent,
} from '../../lib/firestore';
import { copyToClipboard, openGoogleReview, getSessionId } from '../../lib/utils';

export default function ScreenB() {
    const location = useLocation();
    const navigate = useNavigate();
    const { business, service, starRating } = location.state || {};

    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCopyFallback, setShowCopyFallback] = useState(false);
    // useRef ensures loadVariants always reads the latest accumulated IDs,
    // avoiding stale closure issues across multiple reshuffles.
    const servedIdsRef = useRef([]);
    // Prevents double-fire on rapid/double taps of "Copy & Open Google"
    const copyInFlightRef = useRef(false);
    const [toast, setToast] = useState(null);
    const [reshuffling, setReshuffling] = useState(false);

    // Redirect if no state
    useEffect(() => {
        if (!business || !service) {
            navigate('/', { replace: true });
        }
    }, [business, service, navigate]);

    // Load variants
    useEffect(() => {
        if (business && service) {
            loadVariants();
        }
    }, [business, service]);

    async function loadVariants(extraExcludeIds = []) {
        setLoading(true);
        try {
            const allExcluded = [...servedIdsRef.current, ...extraExcludeIds];
            const results = await getRandomVariants(business.id, service.id, 4, allExcluded);
            setVariants(results);
            setSelectedVariant(null);

            // Mark as served and accumulate into ref (always fresh, never stale)
            if (results.length > 0) {
                const ids = results.map((v) => v.id);
                servedIdsRef.current = [...servedIdsRef.current, ...ids];
                await markVariantsServed(business.id, service.id, ids);

                // Log shown event
                const sessionId = getSessionId();
                await logEvent(business.id, 'shown', {
                    anonSessionId: sessionId,
                    serviceId: service.id,
                    variantIds: ids,
                });
            }
        } catch (err) {
            console.error('Error loading variants:', err);
        }
        setLoading(false);
    }

    async function handleReshuffle() {
        setReshuffling(true);
        await loadVariants(variants.map((v) => v.id));
        setReshuffling(false);
    }

    async function handleCopyAndOpen() {
        if (!selectedVariant) return;
        if (copyInFlightRef.current) return;
        copyInFlightRef.current = true;

        const sessionId = getSessionId();
        const copied = await copyToClipboard(selectedVariant.text);

        if (copied) {
            setCopySuccess(true);
            showToast('✅ Review copied to clipboard!');
        } else {
            setShowCopyFallback(true);
            copyInFlightRef.current = false;
            return;
        }

        await logEvent(business.id, 'copy_open', {
            anonSessionId: sessionId,
            serviceId: service.id,
            variantId: selectedVariant.id,
        });

        setTimeout(() => {
            openGoogleReview(business.placeId);
            setTimeout(() => setShowConfirmModal(true), 1000);
        }, 500);

        copyInFlightRef.current = false;
    }

    async function handleFallbackCopy() {
        const copied = await copyToClipboard(selectedVariant.text);
        if (copied) {
            setCopySuccess(true);
            setShowCopyFallback(false);
            showToast('✅ Review copied!');

            const sessionId = getSessionId();
            await logEvent(business.id, 'copy_open', {
                anonSessionId: sessionId,
                serviceId: service.id,
                variantId: selectedVariant.id,
            });

            setTimeout(() => {
                openGoogleReview(business.placeId);
                setTimeout(() => setShowConfirmModal(true), 1000);
            }, 500);
        } else {
            showToast('❌ Copy failed. Please manually copy the text above.');
        }
    }

    async function handleConfirmPosted(confirmed) {
        const sessionId = getSessionId();
        if (confirmed) {
            await markVariantUsed(business.id, service.id, selectedVariant.id);
            await logEvent(business.id, 'confirm_posted', {
                anonSessionId: sessionId,
                serviceId: service.id,
                variantId: selectedVariant.id,
            });
            showToast('🎉 Thank you for your review!');
        } else {
            await deprioritizeVariant(business.id, service.id, selectedVariant.id);
        }
        setShowConfirmModal(false);
    }

    function showToast(message) {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    }

    if (!business || !service) return null;

    // Fallback reviews used when no variants exist for this service
    const FALLBACK_REVIEWS = [
        { id: 'f1', text: `Really happy with the ${service?.name ?? 'service'} here. Would definitely recommend.` },
        { id: 'f2', text: `Great experience overall. The ${service?.name ?? 'team'} was professional and efficient.` },
        { id: 'f3', text: `Visited recently and was genuinely impressed. Will be coming back for sure.` },
    ];
    const displayVariants = variants.length > 0 ? variants : FALLBACK_REVIEWS;

    return (
        <div className="bg-mesh">
            <div className="page-container fade-in">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingTop: '1rem' }}>
                    <h1 style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Pick a review
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Select one and we'll copy it for you
                    </p>
                </div>

                {/* Variant Selection */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                        {displayVariants.map((v, idx) => (
                            <label key={v.id} className="radio-card slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
                                <input
                                    type="radio"
                                    name="variant"
                                    value={v.id}
                                    checked={selectedVariant?.id === v.id}
                                    onChange={() => setSelectedVariant(v)}
                                />
                                <div className="card-content">
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--color-text)' }}>
                                        "{v.text}"
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                {/* Try 4 More */}
                {!loading && displayVariants.length > 0 && (
                    <button
                        className="btn-secondary"
                        onClick={handleReshuffle}
                        disabled={reshuffling}
                        style={{ marginBottom: '1rem' }}
                    >
                        {reshuffling ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <div className="spinner spinner-sm" /> Loading...
                            </span>
                        ) : (
                            '🔄 Try 4 more options'
                        )}
                    </button>
                )}

                {/* Instruction */}
                <div style={{
                    textAlign: 'center',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(108, 92, 231, 0.08)',
                    border: '1px solid rgba(108, 92, 231, 0.15)',
                    marginBottom: '1rem',
                }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        💡 We'll copy your review. On Google, <strong>long-press → Paste → Post</strong>.
                    </p>
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Copy & Open Button */}
                <div style={{ paddingBottom: '2rem' }}>
                    <button
                        className="btn-success"
                        onClick={handleCopyAndOpen}
                        disabled={!selectedVariant}
                    >
                        📋 Copy & Open Google
                    </button>
                </div>
            </div>

            {/* Clipboard Fallback Modal */}
            {showCopyFallback && selectedVariant && (
                <div className="modal-overlay" onClick={() => setShowCopyFallback(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                            📋 Copy your review
                        </h3>
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            userSelect: 'all',
                            WebkitUserSelect: 'all',
                        }}>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{selectedVariant.text}</p>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Select the text above and copy it, or tap the button below.
                        </p>
                        <button className="btn-primary" onClick={handleFallbackCopy}>
                            Tap to Copy
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                Did you post the review?
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                Let us know so we can show you fresh options next time!
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button className="btn-primary" onClick={() => handleConfirmPosted(true)}>
                                ✅ Yes, I posted it!
                            </button>
                            <button className="btn-secondary" onClick={() => handleConfirmPosted(false)}>
                                Not yet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
