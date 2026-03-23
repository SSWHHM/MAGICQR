import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getBusiness, updateService, deleteService } from '../../lib/db';

export default function ServiceEdit() {
    const { id: restaurantId, serviceId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    
    const [service, setService] = useState({ name: '', description: '' });
    const [business, setBusiness] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                // Load business for context
                const biz = await getBusiness(restaurantId);
                setBusiness(biz);

                // Load specific service
                const { data, error: srvError } = await supabase
                    .from('services')
                    .select('*')
                    .eq('id', serviceId)
                    .single();
                
                if (srvError) throw srvError;
                setService(data);
            } catch (err) {
                console.error('Error loading service:', err);
                setError('Failed to load service details.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [restaurantId, serviceId]);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await updateService(restaurantId, serviceId, {
                name: service.name,
                description: service.description
            });
            navigate(`/admin/restaurant/${restaurantId}`);
        } catch (err) {
            console.error('Error saving service:', err);
            setError('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
        
        setDeleting(true);
        try {
            await deleteService(restaurantId, serviceId);
            navigate(`/admin/restaurant/${restaurantId}`);
        } catch (err) {
            console.error('Error deleting service:', err);
            setError('Failed to delete service.');
        } finally {
            setDeleting(false);
        }
    }

    if (loading) return <div className="p-8 text-center color-text-muted">Loading service details...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem' }}>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '1.5rem' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '0.25rem' }}>Edit Service</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            {business?.name} • Service Management
                        </p>
                    </div>
                    <Link 
                        to={`/admin/restaurant/${restaurantId}`}
                        style={{ 
                            textDecoration: 'none', 
                            fontSize: '0.85rem', 
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        ← Back
                    </Link>
                </header>

                {error && (
                    <div style={{ background: 'rgba(255,100,100,0.1)', color: '#ff6b6b', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(255,100,100,0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>SERVICE NAME</label>
                        <input 
                            type="text"
                            value={service.name}
                            onChange={e => setService({ ...service, name: e.target.value })}
                            required
                            placeholder="e.g., Digital Printing"
                            style={{ 
                                width: '100%', 
                                padding: '1rem', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>DESCRIPTION</label>
                        <textarea 
                            rows="4"
                            value={service.description}
                            onChange={e => setService({ ...service, description: e.target.value })}
                            placeholder="Describe what this service covers..."
                            style={{ 
                                width: '100%', 
                                padding: '1rem', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="btn-primary" 
                            style={{ flex: 2, padding: '1rem' }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ 
                                flex: 1, 
                                padding: '1rem',
                                background: 'rgba(255,107,107,0.1)',
                                color: '#ff6b6b',
                                border: '1px solid rgba(255,107,107,0.2)',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.9rem'
                            }}
                        >
                            {deleting ? '...' : 'Delete'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
