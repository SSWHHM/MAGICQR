import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getBusiness, updateBusiness } from '../../lib/db';
import { supabase } from '../../lib/supabase';

export default function RestaurantForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshBusinesses } = useOutletContext();

    const [form, setForm] = useState({
        name: '',
        slug: '',
        category: '',
        city: '',
        neighborhood: '',
        google_place_id: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBusiness();
    }, [id]);

    async function loadBusiness() {
        try {
            const data = await getBusiness(id);
            if (data) {
                setForm({
                    name: data.name || '',
                    slug: data.slug || '',
                    category: data.category || '',
                    city: data.city || '',
                    neighborhood: data.neighborhood || '',
                    google_place_id: data.google_place_id || '',
                });
                if (data.logo_url) setLogoPreview(data.logo_url);
            }
        } catch (err) {
            setError('Failed to load business details');
        } finally {
            setLoading(false);
        }
    }

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

        if (!form.name || !form.slug) {
            setError('Business Name and URL Slug are required');
            return;
        }

        setSaving(true);
        try {
            let logo_url = logoPreview;

            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `logos/${form.slug}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('logos')
                    .upload(fileName, logoFile, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
                logo_url = publicUrl;
            }

            const data = {
                name: form.name,
                slug: form.slug,
                category: form.category || null,
                city: form.city || null,
                neighborhood: form.neighborhood || null,
                google_place_id: form.google_place_id || null,
                ...(logo_url && { logo_url }),
            };

            await updateBusiness(id, data);
            await refreshBusinesses();
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    const categories = ['restaurant', 'cafe', 'salon', 'clinic', 'retail', 'spa', 'hotel', 'gym', 'other'];

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
                background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '2rem'
            }}>
                Edit Business
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* LOGO UPLOAD */}
                <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                        Business Logo
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '1.25rem', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '2px dashed rgba(255,255,255,0.1)' }}>
                                📷
                            </div>
                        )}
                        <label style={{ cursor: 'pointer' }}>
                            <span className="btn-secondary" style={{ display: 'inline-block', width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                                Change Logo
                            </span>
                            <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                {/* BASIC INFO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Business Name *</label>
                        <input className="input" name="name" value={form.name} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>URL Slug *</label>
                        <input className="input" name="slug" value={form.slug} onChange={handleSlugChange} required />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                        <select className="input" name="category" value={form.category} onChange={handleChange}>
                            <option value="">Select category...</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>City</label>
                            <input className="input" name="city" value={form.city} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Neighborhood</label>
                            <input className="input" name="neighborhood" value={form.neighborhood} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(225, 112, 85, 0.1)', border: '1px solid rgba(225, 112, 85, 0.2)', color: 'var(--color-error)', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
                    {saving ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <div className="spinner spinner-sm" /> Updating...
                        </span>
                    ) : 'Update Business Details →'}
                </button>
            </form>
        </div>
    );
}
