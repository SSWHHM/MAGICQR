import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { createBusiness, getBusiness, updateBusiness } from '../../lib/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

// Removed — replaced with inline robust init below

export default function RestaurantForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshBusinesses } = useOutletContext();
    const isEditing = !!id;

    const [form, setForm] = useState({
        displayName: '',
        slug: '',
    });
    // placeId comes from Autocomplete, not typed manually
    const [placeId, setPlaceId] = useState('');
    const autocompleteInputRef = useRef(null);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEditing);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            loadBusiness();
        }
    }, [id]);

    async function loadBusiness() {
        const data = await getBusiness(id);
        if (data) {
            setForm({
                displayName: data.displayName || '',
                slug: data.slug || '',
            });
            if (data.placeId) {
                setPlaceId(data.placeId);
                // Pre-fill the autocomplete input with the existing name in edit mode
                if (autocompleteInputRef.current) {
                    autocompleteInputRef.current.value = data.displayName || '';
                }
            }
            if (data.logoUrl) setLogoPreview(data.logoUrl);
        }
        setLoading(false);
    }

    // Init Google Places Autocomplete — robust pattern that handles script timing
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) return;

        const initAutocomplete = () => {
            if (!autocompleteInputRef.current) return;
            const autocomplete = new window.google.maps.places.Autocomplete(
                autocompleteInputRef.current,
                { types: ['establishment'] }
            );
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.place_id) return;
                const slug = place.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                setForm((prev) => ({
                    ...prev,
                    displayName: prev.displayName || place.name,
                    slug: prev.slug || slug,
                }));
                setPlaceId(place.place_id);
            });
        };

        if (window.google?.maps?.places) {
            // Script already fully loaded
            initAutocomplete();
        } else {
            const existingScript = document.getElementById('google-maps-script');
            if (existingScript) {
                existingScript.addEventListener('load', initAutocomplete);
                return () => existingScript.removeEventListener('load', initAutocomplete);
            }
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.addEventListener('load', initAutocomplete);
            document.head.appendChild(script);
            return () => script.removeEventListener('load', initAutocomplete);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSlugChange = (e) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
        setForm((prev) => ({ ...prev, slug: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.displayName || !form.slug) {
            setError('Business Name and URL Slug are required');
            return;
        }
        if (!placeId) {
            setError('Please search and select your business from Google Maps above');
            return;
        }

        setSaving(true);
        try {
            let logoUrl = logoPreview;

            // Upload logo if new file selected
            if (logoFile) {
                const storageRef = ref(storage, `logos/${form.slug}-${Date.now()}`);
                await uploadBytes(storageRef, logoFile);
                logoUrl = await getDownloadURL(storageRef);
            }

            const data = {
                displayName: form.displayName,
                slug: form.slug,
                placeId,
                ...(logoUrl && { logoUrl }),
            };

            if (isEditing) {
                await updateBusiness(id, data);
            } else {
                await createBusiness(data);
            }

            await refreshBusinesses();
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ maxWidth: '32rem' }}>
            <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>
                {isEditing ? 'Edit Business' : 'New Business'}
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Logo Upload */}
                <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                        Logo
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt="Logo"
                                style={{ width: '64px', height: '64px', borderRadius: '1rem', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                            />
                        ) : (
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '1rem',
                                background: 'rgba(255,255,255,0.06)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                                border: '2px dashed rgba(255,255,255,0.1)',
                            }}>
                                📷
                            </div>
                        )}
                        <label style={{ cursor: 'pointer' }}>
                            <span className="btn-secondary" style={{ display: 'inline-block', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                Choose File
                            </span>
                            <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                {/* Display Name */}
                <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                        Business Name *
                    </label>
                    <input
                        className="input"
                        name="displayName"
                        value={form.displayName}
                        onChange={handleChange}
                        placeholder="My Amazing Service"
                        required
                    />
                </div>

                {/* Slug */}
                <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                        URL Slug * <span style={{ fontSize: '0.75rem' }}>(used in QR link: /r/{form.slug || 'my-business'})</span>
                    </label>
                    <input
                        className="input"
                        name="slug"
                        value={form.slug}
                        onChange={handleSlugChange}
                        placeholder="my-business"
                        required
                    />
                </div>

                {/* Google Maps Autocomplete */}
                <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                        Search Business on Google Maps *
                    </label>
                    <input
                        ref={autocompleteInputRef}
                        className="input"
                        type="text"
                        placeholder="Type your business name to search Google Maps..."
                        defaultValue={isEditing ? form.displayName : ''}
                    />
                    {placeId ? (
                        <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            ✅ Place ID captured: <code style={{ opacity: 0.7 }}>{placeId}</code>
                        </p>
                    ) : (
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
                            {import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                                ? 'Select your business from the dropdown to capture the Place ID automatically.'
                                : '⚠️ VITE_GOOGLE_MAPS_API_KEY not set — add it to .env to enable autocomplete.'}
                        </p>
                    )}
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(225, 112, 85, 0.1)',
                        border: '1px solid rgba(225, 112, 85, 0.2)',
                        color: 'var(--color-error)',
                        fontSize: '0.85rem',
                    }}>
                        {error}
                    </div>
                )}

                <button className="btn-primary" type="submit" disabled={saving}>
                    {saving ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="spinner spinner-sm" /> Saving...
                        </span>
                    ) : isEditing ? 'Update Business' : 'Create Business'}
                </button>
            </form>
        </div>
    );
}
