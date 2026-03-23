import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { getBusiness, createService, updateService, deleteService, getAllServicesAdmin } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import { triggerKeywordScan } from '../../lib/keywords';
import { QRCodeSVG } from 'qrcode.react';

const SEO_BADGE = {
    pending:  { icon: '⏳', label: 'Pending',  color: 'rgba(255,200,0,0.6)' },
    scanning: { icon: '🔄', label: 'Scanning…', color: 'rgba(108,92,231,0.6)' },
    ready:    { icon: '✅', label: 'SEO Ready', color: 'rgba(0,200,120,0.6)' },
    failed:   { icon: '❌', label: 'Failed',    color: 'rgba(225,112,85,0.6)' },
};

export default function RestaurantDetail() {
    const { id } = useParams();
    const { refreshBusinesses } = useOutletContext();
    const [business, setBusiness] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceDescription, setNewServiceDescription] = useState('');
    const [addingService, setAddingService] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    // Load business metadata
    useEffect(() => {
        async function load() {
            const [biz, svcs] = await Promise.all([
                getBusiness(id),
                getAllServicesAdmin(id),
            ]);
            setBusiness(biz);
            setServices(svcs);
            setLoading(false);
        }
        load();
    }, [id]);

    // Supabase Realtime — live SEO status badge updates
    useEffect(() => {
        if (!id) return;
        const channel = supabase
            .channel(`services-seo-${id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'services',
                filter: `business_id=eq.${id}`,
            }, (payload) => {
                setServices((prev) =>
                    prev.map((s) => s.id === payload.new.id ? { ...s, ...payload.new } : s)
                );
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [id]);

    async function handleAddService(e) {
        e.preventDefault();
        if (!newServiceName.trim()) return;
        setAddingService(true);
        try {
            const svc = await createService(id, {
                name: newServiceName.trim(),
                description: newServiceDescription.trim(),
            });
            setServices((prev) => [...prev, svc]);
            setNewServiceName('');
            setNewServiceDescription('');
            // Trigger SEO keyword scan non-blocking
            triggerKeywordScan(svc.id);
        } catch (err) {
            console.error(err);
        }
        setAddingService(false);
    }

    async function handleToggleActive(svc) {
        await updateService(id, svc.id, { active: !svc.active });
        setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, active: !svc.active } : s));
    }

    async function handleDeleteService(svcId) {
        if (!confirm('Delete this service? All its variants will be lost.')) return;
        await deleteService(id, svcId);
        setServices((prev) => prev.filter((s) => s.id !== svcId));
    }

    async function handleEditSave(svcId) {
        if (!editName.trim()) return;
        await updateService(id, svcId, { name: editName.trim() });
        setServices((prev) => prev.map((s) => s.id === svcId ? { ...s, name: editName.trim() } : s));
        setEditingId(null);
    }

    async function handleRetryKeywordScan(svcId) {
        await updateService(id, svcId, { seo_status: 'pending', seo_retry_count: 0, seo_error: null });
        setServices((prev) => prev.map((s) => s.id === svcId ? { ...s, seo_status: 'pending' } : s));
        triggerKeywordScan(svcId);
    }

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;
    }

    if (!business) {
        return <p style={{ color: 'var(--color-text-muted)' }}>Business not found.</p>;
    }

    return (
        <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
            {/* Horizontal Header Nav (Compact) */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.75rem 0', 
                borderBottom: '1px solid rgba(255,255,255,0.06)', 
                marginBottom: '1.5rem',
                position: 'sticky',
                top: 0,
                background: 'var(--color-bg)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {business.logo_url && (
                        <img src={business.logo_url} alt={business.name} style={{ width: '32px', height: '32px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                    )}
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: '700', lineHeight: 1 }}>{business.name}</h1>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: '700', marginTop: '0.2rem' }}>● LIVE</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to={`/admin/restaurant/${id}/edit`} className="btn-secondary" style={{ padding: '0.5rem 1rem', minHeight: 'auto', fontSize: '0.8rem', textDecoration: 'none' }}>
                        🖊️ Edit Biz
                    </Link>
                </div>
            </div>

            {/* Main Grid Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left Column: QR Section (Compact) */}
                <div id="qrs">
                    <QRSection slug={business.slug} logoUrl={business.logo_url} businessName={business.name} />
                </div>

                {/* Right Column: Services & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Services Management (Compact Grid) */}
                    <div id="services" className="glass" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Services ({services.length})</h3>
                            <button 
                                className="btn-primary" 
                                onClick={() => setAddingService(!addingService)}
                                style={{ width: 'auto', padding: '0.5rem 1rem', minHeight: 'auto', fontSize: '0.8rem' }}
                            >
                                {addingService ? '✕' : '➕ Add'}
                            </button>
                        </div>

                        {addingService && (
                            <div className="glass-light" style={{ padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <input
                                        className="input"
                                        style={{ padding: '0.6rem' }}
                                        value={newServiceName}
                                        onChange={(e) => setNewServiceName(e.target.value)}
                                        placeholder="Name (e.g. Printing)"
                                    />
                                    <textarea
                                        className="input"
                                        style={{ padding: '0.6rem', minHeight: '60px', borderRadius: '0.5rem', resize: 'none' }}
                                        value={newServiceDescription}
                                        onChange={(e) => setNewServiceDescription(e.target.value)}
                                        placeholder="Service description..."
                                    />
                                    <button className="btn-success" type="submit" disabled={!newServiceName.trim()} style={{ width: '100%', minHeight: 'auto', padding: '0.6rem' }}>
                                        Save Service
                                    </button>
                                </form>
                            </div>
                        )}

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                            gap: '1rem' 
                        }}>
                            {services.map((svc) => (
                                <div 
                                    key={svc.id} 
                                    className="glass-light"
                                    style={{ 
                                        padding: '1rem', 
                                        borderRadius: '0.75rem',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        height: '110px'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>{svc.name}</h4>
                                            <span style={{ fontSize: '0.6rem', color: svc.active !== false ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                                {svc.active !== false ? '●' : '○'}
                                            </span>
                                        </div>
                                        <p style={{ 
                                            fontSize: '0.75rem', 
                                            color: 'var(--color-text-muted)', 
                                            marginTop: '0.25rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.2'
                                        }}>
                                            {svc.description || "No description provided."}
                                        </p>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem' }}>
                                        <Link to={`/admin/restaurant/${id}/service/${svc.id}/edit`} style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: '600' }}>
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDeleteService(svc.id)} style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'rgba(225,112,85,0.6)', fontWeight: '600' }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {services.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    No services added yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analytics Section (Compact Belt) */}
                    <div id="analytics" className="glass" style={{ 
                        padding: '1.25rem 2rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(90deg, rgba(30,30,40,0.6) 0%, rgba(20,20,30,0.8) 100%)'
                    }}>
                        <div style={{ display: 'flex', gap: '3rem' }}>
                            <div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Scans</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>42 <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginLeft: '0.5rem' }}>↑ 12%</span></h3>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--color-success)' }}>5 <span style={{ fontSize: '0.8rem', color: 'white', opacity: 0.5, marginLeft: '0.5rem' }}>vs 3</span></h3>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, maxWidth: '200px', height: '40px', marginLeft: '2rem', opacity: 0.8 }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path 
                                    d="M 0 35 Q 20 30 40 10 T 80 15 T 100 5" 
                                    stroke="var(--color-success)" 
                                    strokeWidth="3" 
                                    fill="none" 
                                    strokeLinecap="round" 
                                />
                            </svg>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', fontWeight: '800' }}>LIVE BROADCAST</p>
                            <span style={{ fontSize: '0.6rem', color: 'var(--color-success)' }}>● ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── QR Code Section ──────────────────────────────────────────────────────────

function QRSection({ slug, logoUrl, businessName }) {
    const qrUrl = `${window.location.origin}/r/${slug}`;
    const svgRef = useRef(null);

    function handleDownload() {
        const svgEl = svgRef.current?.querySelector('svg');
        if (!svgEl) return;
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            const link = document.createElement('a');
            link.download = `${slug}-qr.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = url;
    }

    return (
        <div id="qrs-container" className="glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>Business QR</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '1.25rem' }}>Scan to leave a review</p>
            
            <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '0.5rem', 
                padding: '0.5rem', 
                fontFamily: 'monospace', 
                fontSize: '0.7rem', 
                color: 'var(--color-secondary-light)', 
                wordBreak: 'break-all', 
                marginBottom: '1.25rem', 
                border: '1px solid rgba(255,255,255,0.05)' 
            }}>
                {qrUrl.replace('https://', '')}
            </div>

            <div ref={svgRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '1rem', display: 'inline-flex', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                    <QRCodeSVG 
                        value={qrUrl} 
                        size={210} 
                        bgColor="#ffffff" 
                        fgColor="#1a1a2e" 
                        level="H" 
                        marginSize={1} 
                        imageSettings={logoUrl ? {
                            src: logoUrl,
                            height: 48,
                            width: 48,
                            excavate: true,
                        } : undefined}
                    />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
                    <button onClick={handleDownload} className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.75rem', minHeight: 'auto' }}>
                        ⬇️ PNG
                    </button>
                    <button onClick={() => {
                        const text = `Check out our services at ${businessName}: ${qrUrl}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem', minHeight: 'auto', background: '#25D366', color: 'white', border: 'none' }}>
                        💬 WhatsApp
                    </button>
                    <a href="#analytics" className="btn-secondary" style={{ gridColumn: 'span 2', padding: '0.5rem', fontSize: '0.75rem', minHeight: 'auto', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        📊 View Stats
                    </a>
                </div>
            </div>
            
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '1.25rem' }}>
                Place this QR on tables or at checkout.
            </p>
        </div>
    );
}
