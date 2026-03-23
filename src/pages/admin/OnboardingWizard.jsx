import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { createBusiness, createService } from '../../lib/db';
import { supabase } from '../../lib/supabase';

const STEPS = [
    { n: 1, label: 'Find Business' },
    { n: 2, label: 'Your Services' },
    { n: 3, label: 'Your QR Code' },
];

function categoryFromTypes(types) {
    if (!types) return 'other';
    if (types.some(t => ['restaurant', 'cafe', 'food', 'meal_takeaway', 'meal_delivery'].includes(t))) return 'restaurant';
    if (types.some(t => ['beauty_salon', 'hair_care'].includes(t))) return 'salon';
    if (types.some(t => ['doctor', 'dentist', 'hospital', 'health', 'pharmacy'].includes(t))) return 'clinic';
    if (types.some(t => ['store', 'shop', 'retail', 'shopping_mall', 'clothing_store'].includes(t))) return 'retail';
    if (types.includes('spa')) return 'spa';
    if (types.some(t => ['lodging', 'hotel'].includes(t))) return 'hotel';
    if (types.some(t => ['gym', 'fitness_center'].includes(t))) return 'gym';
    return 'other';
}

export default function OnboardingWizard() {
    const navigate = useNavigate();
    const context = useOutletContext();
    const refreshBusinesses = context?.refreshBusinesses;

    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);

    // Step 1 — search
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const autocompleteService = useRef(null);
    const debounceTimer = useRef(null);

    // Step 2 — business data
    const [data, setData] = useState({
        name: '', slug: '', category: '',
        city: '', neighborhood: '', google_place_id: '',
    });

    // Step 2 — services
    const [services, setServices] = useState([
        { id: Date.now(), name: '', description: '', writing: false, rewriting: false }
    ]);
    const [serviceErrors, setServiceErrors] = useState({}); // { serviceId: errorText }

    // ── Google Maps ────────────────────────────────────────────────────────────
    useEffect(() => {
        console.log('🔑 GEMINI KEY:', import.meta.env.VITE_GEMINI_API_KEY ?? 'UNDEFINED - KEY MISSING');
    }, []);

    useEffect(() => {
        function initService() {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
        if (window.google?.maps?.places) { initService(); return; }
        if (document.getElementById('gm-wizard-script')) {
            const t = setInterval(() => { if (window.google?.maps?.places) { clearInterval(t); initService(); } }, 150);
            return () => clearInterval(t);
        }
        const script = document.createElement('script');
        script.id = 'gm-wizard-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initService;
        document.head.appendChild(script);
    }, []);

    function handleSearchInput(value) {
        setSearchQuery(value);
        setSelectedPlace(null);
        clearTimeout(debounceTimer.current);
        if (value.length < 2) { setSuggestions([]); return; }
        debounceTimer.current = setTimeout(() => {
            autocompleteService.current?.getPlacePredictions(
                { input: value, types: ['establishment'] },
                (predictions, status) => setSuggestions(status === 'OK' ? (predictions || []) : [])
            );
        }, 300);
    }

    function handleSelectSuggestion(suggestion) {
        setSuggestions([]);
        setSearchQuery(suggestion.structured_formatting.main_text);
        const mapDiv = document.createElement('div');
        const svc = new window.google.maps.places.PlacesService(mapDiv);
        svc.getDetails(
            { placeId: suggestion.place_id, fields: ['name', 'address_components', 'types', 'place_id'] },
            (place, status) => {
                if (status !== 'OK' || !place) return;
                const comps = place.address_components || [];
                const city = comps.find(c => c.types.includes('locality'))?.long_name
                    || comps.find(c => c.types.includes('administrative_area_level_2'))?.long_name || '';
                const neighborhood = comps.find(c => c.types.includes('sublocality_level_1'))?.long_name
                    || comps.find(c => c.types.includes('neighborhood'))?.long_name || '';
                const slug = place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                setSelectedPlace({ name: place.name, city, neighborhood, slug, category: categoryFromTypes(place.types), google_place_id: place.place_id });
            }
        );
    }

    function continueWithPlace() {
        setData(p => ({ ...p, ...selectedPlace }));
        setStep(2);
    }

    // ── Services CRUD ──────────────────────────────────────────────────────────
    function addService() {
        setServices(prev => [...prev, { id: Date.now(), name: '', description: '', writing: false, rewriting: false }]);
    }
    function removeService(id) {
        setServices(prev => prev.filter(s => s.id !== id));
    }
    function updateService(id, field, value) {
        setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    }

    // ── Gemini API call ────────────────────────────────────────────────────────
    async function callGemini(serviceId, mode) {
        // mode: 'write' = generate fresh | 'rewrite' = improve existing
        const svc = services.find(s => s.id === serviceId);
        if (!svc?.name?.trim()) return;

        // Set loading flag for the correct button
        setServices(prev => prev.map(s =>
            s.id === serviceId ? { ...s, [mode === 'write' ? 'writing' : 'rewriting']: true } : s
        ));

        const prompt = mode === 'write'
            ? `Write a single clear sentence (max 20 words) describing this product or service for customers.
Business: ${data.name}
Product/Service: ${svc.name}
Rules: plain English, no emojis, no quotes, return ONLY the sentence, nothing else.`
            : `Rewrite this description to be clearer and more appealing. Keep it to 1 sentence, max 25 words.
Business: ${data.name}
Product/Service: ${svc.name}
Current description: ${svc.description || '(none)'}
Rules: plain English, no emojis, no quotes, return ONLY the improved sentence, nothing else.`;

        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 80, temperature: 0.7 }
                    })
                }
            );

            // Resiliency: If 429 (quota) or any error, we won't throw, just stop loading
            if (!res.ok) {
                const errorText = await res.text();
                // Special handling for quota
                if (res.status === 429 || errorText.includes('RESOURCE_EXHAUSTED')) {
                    console.warn('[Gemini Quota] 429 detected. Falling back to user text.');
                    setServiceErrors(prev => ({ ...prev, [serviceId]: 'AI Quota exceeded. Using your original text.' }));
                } else {
                    console.error(`[Gemini Error] ${res.status}:`, errorText);
                }
                
                // Stop the spinner and exit catch early
                setServices(prev => prev.map(s => s.id === serviceId ? { ...s, writing: false, rewriting: false } : s));
                
                // Auto-clear notification
                setTimeout(() => setServiceErrors(prev => { const n = { ...prev }; delete n[serviceId]; return n; }), 4000);
                return;
            }

            const json = await res.json();
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            
            if (!text) {
                console.warn('[Gemini] Empty response received.');
                setServices(prev => prev.map(s => s.id === serviceId ? { ...s, writing: false, rewriting: false } : s));
                return;
            }

            setServices(prev => prev.map(s =>
                s.id === serviceId
                    ? { ...s, description: text, writing: false, rewriting: false }
                    : s
            ));
        } catch (err) {
            console.error('[Gemini Fatal Error]:', err);
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, writing: false, rewriting: false } : s
            ));
        }
    }

    // ── Logo ───────────────────────────────────────────────────────────────────
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    // ── Save ───────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            let logo_url = null;
            if (logoFile) {
                const ext = logoFile.name.split('.').pop();
                const fileName = `logos/${data.slug}-${Date.now()}.${ext}`;
                const { error: upErr } = await supabase.storage.from('logos').upload(fileName, logoFile, { upsert: true });
                if (upErr) throw upErr;
                const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
                logo_url = publicUrl;
                setLogoUrl(publicUrl);
            }
            const business = await createBusiness({ ...data, logo_url });
            const validServices = services.filter(s => s.name.trim());
            await Promise.all(validServices.map(s =>
                createService(business.id, { name: s.name.trim(), description: s.description.trim() || null })
            ));
            if (refreshBusinesses) await refreshBusinesses();
            setStep(3);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    // ── QR download ────────────────────────────────────────────────────────────
    const downloadQR = () => {
        const el = document.getElementById('qr-printable');
        if (!el) return;
        html2canvas(el, { backgroundColor: '#ffffff', scale: 3 }).then(canvas => {
            const a = document.createElement('a');
            a.download = `${data.slug}-qr.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        });
    };

    const canSave = data.name && services.some(s => s.name.trim());
    const qrUrl = window.location.origin + '/r/' + data.slug;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes meshShift {
                    0%,100% { background-position: 0% 0%, 100% 100%; }
                    50%     { background-position: 100% 0%, 0% 100%; }
                }
                @keyframes wizFadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes wizSlideLeft {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes confettiFall {
                    0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
                    100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .wiz-overlay {
                    position: fixed; inset: 0; z-index: 1000;
                    display: flex; align-items: flex-start; justify-content: center;
                    background:
                        radial-gradient(ellipse at 20% 30%, rgba(108,92,231,0.22) 0%, transparent 55%),
                        radial-gradient(ellipse at 80% 70%, rgba(0,184,148,0.14) 0%, transparent 55%),
                        #0d0c1a;
                    background-size: 200% 200%, 200% 200%, auto;
                    animation: meshShift 16s ease infinite;
                    overflow-y: auto;
                    padding: 2rem 1rem;
                }
                .wiz-card {
                    width: 100%; max-width: 540px;
                    background: rgba(21,20,38,0.88);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 2rem;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(108,92,231,0.07);
                    padding: 2.5rem;
                    animation: wizFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
                }
                .wiz-step-panel { animation: wizSlideLeft 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }

                .wiz-pill-bar {
                    display: flex; margin-bottom: 2.5rem;
                    background: rgba(255,255,255,0.04); border-radius: 100px; padding: 4px;
                }
                .wiz-pill-step {
                    flex: 1; text-align: center; padding: 0.55rem 0.25rem; border-radius: 100px;
                    font-size: 0.78rem; font-weight: 600; transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
                    color: rgba(255,255,255,0.3); letter-spacing: 0.01em;
                }
                .wiz-pill-step.active { background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white; box-shadow: 0 4px 16px rgba(108,92,231,0.5); }
                .wiz-pill-step.done   { color: #00b894; }

                .wiz-search-input {
                    width: 100%; padding: 0.9rem 1rem 0.9rem 3rem; font-size: 0.95rem;
                    border-radius: 1rem; border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.06); color: white; outline: none;
                    transition: border-color 0.2s; box-sizing: border-box;
                }
                .wiz-search-input:focus   { border-color: rgba(108,92,231,0.5); background: rgba(108,92,231,0.07); }
                .wiz-search-input::placeholder { color: rgba(255,255,255,0.28); }

                .wiz-suggestion {
                    padding: 0.875rem 1.25rem; cursor: pointer;
                    border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;
                }
                .wiz-suggestion:last-child { border-bottom: none; }
                .wiz-suggestion:hover { background: rgba(108,92,231,0.18); }

                .svc-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 1.25rem;
                    padding: 1.25rem 1.25rem 1rem;
                    transition: border-color 0.2s;
                }
                .svc-card:focus-within { border-color: rgba(108,92,231,0.35); }

                .wiz-input {
                    width: 100%; padding: 0.7rem 0.9rem; border-radius: 0.75rem;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                    color: white; font-size: 0.9rem; outline: none;
                    transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
                    font-family: inherit;
                }
                .wiz-input:focus { border-color: rgba(108,92,231,0.55); background: rgba(108,92,231,0.06); }
                .wiz-input::placeholder { color: rgba(255,255,255,0.22); }
                .wiz-textarea { resize: vertical; min-height: 72px; }

                .wiz-add-btn {
                    width: 100%; padding: 0.85rem;
                    border: 2px dashed rgba(255,255,255,0.12); border-radius: 1.1rem;
                    background: transparent; color: rgba(255,255,255,0.4);
                    font-size: 0.88rem; font-weight: 600; cursor: pointer;
                    transition: border-color 0.2s, color 0.2s, background 0.2s;
                    font-family: inherit;
                }
                .wiz-add-btn:hover { border-color: rgba(108,92,231,0.5); color: #a29bfe; background: rgba(108,92,231,0.06); }

                .wiz-ai-btn {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.38rem 0.8rem; border-radius: 0.6rem;
                    font-size: 0.75rem; font-weight: 600; cursor: pointer;
                    transition: all 0.2s; font-family: inherit; border: 1px solid;
                }
                .wiz-ai-btn.write {
                    background: rgba(0,184,148,0.12); border-color: rgba(0,184,148,0.25); color: #00b894;
                }
                .wiz-ai-btn.write:hover:not(:disabled) { background: rgba(0,184,148,0.25); border-color: rgba(0,184,148,0.5); }
                .wiz-ai-btn.rewrite {
                    background: rgba(108,92,231,0.15); border-color: rgba(108,92,231,0.25); color: #a29bfe;
                }
                .wiz-ai-btn.rewrite:hover:not(:disabled) { background: rgba(108,92,231,0.28); border-color: rgba(108,92,231,0.5); }
                .wiz-ai-btn:disabled { opacity: 0.35; cursor: not-allowed; }

                .wiz-del-btn {
                    display: inline-flex; align-items: center; padding: 0.35rem 0.55rem;
                    border-radius: 0.6rem; background: rgba(225,112,85,0.1);
                    border: 1px solid rgba(225,112,85,0.18); color: #e17055;
                    font-size: 0.82rem; cursor: pointer; transition: all 0.2s; font-family: inherit;
                }
                .wiz-del-btn:hover { background: rgba(225,112,85,0.22); }

                .wiz-btn-primary {
                    width: 100%; padding: 0.95rem; border-radius: 1rem; font-weight: 700;
                    font-size: 0.95rem; border: none; cursor: pointer;
                    background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white;
                    box-shadow: 0 8px 24px rgba(108,92,231,0.4);
                    transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 0.6rem;
                    font-family: inherit;
                }
                .wiz-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(108,92,231,0.55); }
                .wiz-btn-primary:disabled { opacity: 0.42; cursor: not-allowed; transform: none; }

                .wiz-btn-ghost {
                    background: none; border: none; color: rgba(255,255,255,0.35);
                    font-size: 0.82rem; cursor: pointer; text-decoration: underline;
                    transition: color 0.2s; font-family: inherit;
                }
                .wiz-btn-ghost:hover { color: rgba(255,255,255,0.65); }

                .wiz-spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.2); border-top-color: currentColor; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; flex-shrink: 0; }
                .wiz-spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }

                .confetti-anchor { position: relative; }
                .confetti-anchor::before, .confetti-anchor::after {
                    content: ''; position: absolute; width: 10px; height: 10px;
                    border-radius: 3px; animation: confettiFall 1.8s ease-out forwards;
                }
                .confetti-anchor::before { top: 0; left: 15%; background: #6c5ce7; animation-delay: 0.05s; }
                .confetti-anchor::after  { top: 0; right: 15%; background: #00b894; animation-delay: 0.25s; }
            `}</style>

            <div className="wiz-overlay">
                <div className="wiz-card">

                    {/* Pill bar */}
                    <div className="wiz-pill-bar">
                        {STEPS.map(s => (
                            <div key={s.n} className={`wiz-pill-step ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                                {step > s.n ? `✓ ${s.label}` : s.label}
                            </div>
                        ))}
                    </div>

                    {/* ━━━━ STEP 1 ━━━━ */}
                    {step === 1 && (
                        <div className="wiz-step-panel">
                            <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#a29bfe', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Step 1 of 3</p>
                            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'white', lineHeight: 1.2, marginBottom: '0.4rem' }}>Find your business 📍</h1>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>We'll auto-fill your details from Google.</p>

                            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
                                <input autoFocus className="wiz-search-input" value={searchQuery} onChange={e => handleSearchInput(e.target.value)} placeholder="Search your business name..." />
                                {suggestions.length > 0 && (
                                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1a1929', border: '1px solid rgba(108,92,231,0.3)', borderRadius: '1rem', overflow: 'hidden', zIndex: 999, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                        {suggestions.map(s => (
                                            <div key={s.place_id} className="wiz-suggestion" onClick={() => handleSelectSuggestion(s)}>
                                                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'white' }}>{s.structured_formatting.main_text}</div>
                                                <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', marginTop: '2px' }}>{s.structured_formatting.secondary_text}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedPlace && (
                                <div style={{ padding: '1.25rem 1.5rem', borderRadius: '1.25rem', marginBottom: '1.25rem', background: 'rgba(0,184,148,0.07)', border: '1px solid rgba(0,184,148,0.22)', animation: 'wizFadeUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}>
                                    <span style={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#00b894', background: 'rgba(0,184,148,0.12)', border: '1px solid rgba(0,184,148,0.22)', borderRadius: '100px', padding: '0.2rem 0.6rem', marginBottom: '0.65rem' }}>
                                        ✓ Found on Google
                                    </span>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', lineHeight: 1.3, marginBottom: '0.25rem' }}>{selectedPlace.name}</div>
                                    {(selectedPlace.city || selectedPlace.neighborhood) && (
                                        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)' }}>📍 {[selectedPlace.neighborhood, selectedPlace.city].filter(Boolean).join(', ')}</div>
                                    )}
                                </div>
                            )}

                            {selectedPlace ? (
                                <>
                                    <button className="wiz-btn-primary" style={{ marginBottom: '0.875rem' }} onClick={continueWithPlace}>
                                        Continue with {selectedPlace.name} →
                                    </button>
                                    <div style={{ textAlign: 'center' }}>
                                        <button className="wiz-btn-ghost" onClick={() => { setSelectedPlace(null); setSearchQuery(''); setSuggestions([]); }}>
                                            Wrong business? Search again
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                    <button className="wiz-btn-ghost" onClick={() => setStep(2)}>
                                        Can't find it on Google? Enter details manually →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ━━━━ STEP 2 ━━━━ */}
                    {step === 2 && (
                        <div className="wiz-step-panel">
                            <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#a29bfe', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Step 2 of 3</p>
                            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'white', lineHeight: 1.2, marginBottom: '0.4rem' }}>What do you offer? 🛎️</h1>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Add your products & services. Customers will leave reviews for these.</p>

                            {/* Place badge */}
                            {data.google_place_id && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', borderRadius: '0.875rem', marginBottom: '1.5rem', background: 'rgba(0,184,148,0.07)', border: '1px solid rgba(0,184,148,0.18)' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>📍 <strong>{data.name}</strong>{data.city ? ` · ${data.city}` : ''}</span>
                                    <button className="wiz-btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => { setStep(1); setSelectedPlace(null); setSearchQuery(''); }}>Change</button>
                                </div>
                            )}

                            {/* Business name (manual entry only) */}
                            {!data.google_place_id && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', display: 'block', marginBottom: '0.5rem' }}>Business Name *</label>
                                    <input className="wiz-input" value={data.name} placeholder="e.g. Sharma's Dhaba" onChange={e => { const v = e.target.value; setData(p => ({ ...p, name: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })); }} />
                                </div>
                            )}

                            {/* ── Logo ── */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', display: 'block', marginBottom: '0.65rem' }}>
                                    Logo <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.22)' }}>(optional)</span>
                                </label>
                                <label htmlFor="wiz-logo-input" style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                    padding: '1.25rem 1.5rem', borderRadius: '1.25rem', cursor: 'pointer',
                                    border: '2px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)',
                                    transition: 'all 0.2s', minHeight: '76px',
                                }}>
                                    <input type="file" id="wiz-logo-input" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                                    {logoPreview ? (
                                        <>
                                            <img src={logoPreview} alt="logo" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.6rem', border: '2px solid rgba(108,92,231,0.35)', flexShrink: 0 }} />
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '0.85rem', color: '#a29bfe', fontWeight: 600 }}>Logo uploaded ✓</div>
                                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', marginTop: '2px' }}>Click to change</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>📷</div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Upload your logo</div>
                                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', marginTop: '2px' }}>PNG or JPG, up to 5MB</div>
                                            </div>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* ── Service cards ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1rem' }}>
                                {services.map((svc, idx) => (
                                    <div key={svc.id} className="svc-card">
                                        {/* Card header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                            <label style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
                                                Product / Service{services.length > 1 ? ` ${idx + 1}` : ''}
                                            </label>
                                            {services.length > 1 && (
                                                <button className="wiz-del-btn" onClick={() => removeService(svc.id)} title="Remove">🗑</button>
                                            )}
                                        </div>

                                        {/* Name input */}
                                        <input
                                            className="wiz-input"
                                            value={svc.name}
                                            placeholder="e.g. Butter Chicken, Haircut, Book Printing..."
                                            onChange={e => updateService(svc.id, 'name', e.target.value)}
                                            style={{ marginBottom: '0.65rem' }}
                                        />

                                        {/* Description label */}
                                        <label style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', display: 'block', marginBottom: '0.4rem' }}>
                                            Description <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.22)' }}>(optional)</span>
                                        </label>

                                        {/* Description textarea */}
                                        <textarea
                                            className="wiz-input wiz-textarea"
                                            rows={3}
                                            value={svc.description}
                                            placeholder="What makes it special..."
                                            onChange={e => updateService(svc.id, 'description', e.target.value)}
                                            style={{ marginBottom: '0.65rem' }}
                                        />

                                        {/* AI buttons row */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {/* Button 1: Write Description (generates from scratch) */}
                                            <button
                                                className="wiz-ai-btn write"
                                                disabled={!svc.name.trim() || svc.writing || svc.rewriting}
                                                onClick={() => callGemini(svc.id, 'write')}
                                                title="Generate a description from the service name"
                                            >
                                                {svc.writing
                                                    ? <><span className="wiz-spinner" /> Writing…</>
                                                    : '📝 Write Description'}
                                            </button>

                                            {/* Button 2: Rewrite with AI (improves existing) */}
                                            <button
                                                className="wiz-ai-btn rewrite"
                                                disabled={!svc.name.trim() || svc.writing || svc.rewriting}
                                                onClick={() => callGemini(svc.id, 'rewrite')}
                                                title="Improve existing description with AI"
                                            >
                                                {svc.rewriting
                                                    ? <><span className="wiz-spinner" /> Rewriting…</>
                                                    : '✨ Rewrite with AI'}
                                            </button>
                                        </div>

                                        {/* Inline Error Message */}
                                        {serviceErrors[svc.id] && (
                                            <div style={{ color: '#e17055', fontSize: '0.72rem', marginTop: '0.6rem', textAlign: 'right', fontWeight: '500', animation: 'wizFadeUp 0.2s ease-out' }}>
                                                ⚠️ {serviceErrors[svc.id]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add service button */}
                            <button className="wiz-add-btn" onClick={addService} style={{ marginBottom: '1.5rem' }}>
                                + Add Product or Service
                            </button>

                            {error && (
                                <div style={{ padding: '0.75rem 1rem', borderRadius: '0.875rem', background: 'rgba(225,112,85,0.1)', border: '1px solid rgba(225,112,85,0.2)', color: '#e17055', fontSize: '0.82rem', marginBottom: '1rem' }}>
                                    {error}
                                </div>
                            )}

                            <button className="wiz-btn-primary" onClick={handleSave} disabled={!canSave || saving}>
                                {saving
                                    ? <><span className="wiz-spinner-sm" /> Setting up your business…</>
                                    : 'Generate My QR Code →'}
                            </button>
                        </div>
                    )}

                    {/* ━━━━ STEP 3 ━━━━ */}
                    {step === 3 && (
                        <div className="wiz-step-panel confetti-anchor" style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#00b894', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>All done!</p>
                            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'white', marginBottom: '0.4rem' }}>Your QR code is ready 🎉</h1>
                            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.9rem', marginBottom: '2rem' }}>Every scan collects a new Google review.</p>

                            <div id="qr-printable" style={{ display: 'inline-block', padding: '2rem', background: 'white', borderRadius: '1.75rem', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', marginBottom: '2rem' }}>
                                <QRCodeSVG 
                                    value={qrUrl} 
                                    size={200} 
                                    level="H" 
                                    includeMargin={false} 
                                    imageSettings={logoUrl ? {
                                        src: logoUrl,
                                        height: 48,
                                        width: 48,
                                        excavate: true,
                                    } : undefined}
                                />
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e' }}>{data.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.15rem' }}>/r/{data.slug}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                {[['⬇️ Download PNG', downloadQR], ['🖨️ Print', () => window.print()]].map(([label, fn]) => (
                                    <button key={label} onClick={fn} style={{ padding: '0.85rem', borderRadius: '1rem', fontWeight: '600', fontSize: '0.875rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', transition: 'background 0.2s', fontFamily: 'inherit' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.11)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <button className="wiz-btn-primary" onClick={() => navigate('/admin')}>
                                Go to Dashboard →
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}