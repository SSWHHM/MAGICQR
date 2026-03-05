import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from '../../firebase';
import { getBusiness, createService, updateService, deleteService } from '../../lib/firestore';
import { MOCK_SERVICES } from '../../lib/mockData';
import { QRCodeSVG } from 'qrcode.react';

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

    // ── One-time: load business metadata ─────────────────────────────────────
    useEffect(() => {
        async function loadBusiness() {
            const biz = await getBusiness(id);
            setBusiness(biz);
            setLoading(false);
        }
        loadBusiness();
    }, [id]);

    // ── Real-time: subscribe to services via onSnapshot ───────────────────────
    useEffect(() => {
        if (!id) return;

        if (!isConfigured) {
            // Mock mode: flatten all mock services across businesses
            const allMockServices = Object.values(MOCK_SERVICES).flat();
            const bizServices = allMockServices.filter((s) => s.businessId === id);
            setServices(bizServices);
            return;
        }

        const q = query(
            collection(db, 'businesses', id, 'services'),
            orderBy('createdAt', 'asc')
        );
        const unsub = onSnapshot(q, (snap) => {
            setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, [id]);

    async function handleAddService(e) {
        e.preventDefault();
        if (!newServiceName.trim()) return;
        setAddingService(true);
        if (isConfigured) {
            await addDoc(collection(db, 'businesses', id, 'services'), {
                name: newServiceName.trim(),
                description: newServiceDescription.trim(),
                active: true,
                createdAt: serverTimestamp(),
            });
        } else {
            // Mock mode fallback
            await createService(id, {
                name: newServiceName.trim(),
                description: newServiceDescription.trim(),
            });
        }
        setNewServiceName('');
        setNewServiceDescription('');
        setAddingService(false);
    }

    async function handleToggleActive(svc) {
        await updateService(id, svc.id, { active: !svc.active });
        // onSnapshot will automatically refresh the list
    }

    async function handleDeleteService(svcId) {
        if (!confirm('Delete this service? All its variants will be lost.')) return;
        await deleteService(id, svcId);
        // onSnapshot will automatically refresh the list
    }

    async function handleEditSave(svcId) {
        if (!editName.trim()) return;
        await updateService(id, svcId, { name: editName.trim() });
        setEditingId(null);
        // onSnapshot will automatically refresh the list
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!business) {
        return <p style={{ color: 'var(--color-text-muted)' }}>Business not found.</p>;
    }

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                {business.logoUrl && (
                    <img
                        src={business.logoUrl}
                        alt={business.displayName}
                        style={{ width: '56px', height: '56px', borderRadius: '1rem', objectFit: 'cover' }}
                    />
                )}
                <div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        {business.displayName}
                    </h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        /{business.slug} • Place ID: {business.placeId}
                    </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <Link
                        to={`/admin/restaurant/${id}/edit`}
                        className="btn-secondary"
                        style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        ✏️ Edit
                    </Link>
                    <Link
                        to={`/admin/restaurant/${id}/analytics`}
                        className="btn-secondary"
                        style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        📊 Analytics
                    </Link>
                </div>
            </div>

            {/* Add Service */}
            <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Services / Products
                </h2>
                <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            className="input"
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                            placeholder="Service name (e.g. Haircut, Tax Filing, Car Service)"
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn-primary"
                            type="submit"
                            disabled={addingService || !newServiceName.trim()}
                            style={{ width: 'auto', padding: '0.75rem 1.25rem', minHeight: 'auto' }}
                        >
                            {addingService ? '...' : '➕ Add'}
                        </button>
                    </div>
                    <input
                        className="input"
                        value={newServiceDescription}
                        onChange={(e) => setNewServiceDescription(e.target.value)}
                        placeholder="Short description (optional) — helps AI generate better reviews"
                    />
                </form>

                {/* Service List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {services.map((svc) => (
                        <div key={svc.id} className="glass-light" style={{
                            padding: '0.875rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            {editingId === svc.id ? (
                                <input
                                    className="input"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave(svc.id)}
                                    autoFocus
                                    style={{ flex: 1 }}
                                />
                            ) : (
                                <span style={{ flex: 1, fontWeight: '500' }}>{svc.name}</span>
                            )}

                            <span className={`badge ${svc.active !== false ? 'badge-active' : 'badge-archived'}`}>
                                {svc.active !== false ? 'Active' : 'Inactive'}
                            </span>

                            <Link
                                to={`/admin/restaurant/${id}/service/${svc.id}/variants`}
                                style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--color-primary-light)',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                📝 Variants
                            </Link>

                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                {editingId === svc.id ? (
                                    <>
                                        <button
                                            onClick={() => handleEditSave(svc.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                            title="Save"
                                        >
                                            ✅
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                            title="Cancel"
                                        >
                                            ❌
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setEditingId(svc.id); setEditName(svc.name); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(svc)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                            title={svc.active !== false ? 'Deactivate' : 'Activate'}
                                        >
                                            {svc.active !== false ? '🔴' : '🟢'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(svc.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {services.length === 0 && (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.9rem' }}>
                            No services yet. Add one above to get started!
                        </p>
                    )}
                </div>
            </div>

            {/* QR Code */}
            <QRSection slug={business.slug} />
        </div>
    );
}

// ─── QR Code Section ───────────────────────────────────────────────────────────

function QRSection({ slug }) {
    const qrUrl = `${window.location.origin}/r/${slug}`;
    const svgRef = useRef(null);

    function handleDownload() {
        // Find the SVG element rendered by QRCodeSVG
        const svgEl = svgRef.current?.querySelector('svg');
        if (!svgEl) return;

        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // White background
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
        <div className="glass" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                🔗 Customer QR Code
            </h2>

            {/* URL display */}
            <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: 'var(--color-secondary)',
                wordBreak: 'break-all',
                marginBottom: '1.25rem',
            }}>
                {qrUrl}
            </div>

            {/* QR Code */}
            <div
                ref={svgRef}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.25rem',
                }}
            >
                <div style={{
                    background: '#ffffff',
                    padding: '1rem',
                    borderRadius: '1rem',
                    display: 'inline-flex',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}>
                    <QRCodeSVG
                        value={qrUrl}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#1a1a2e"
                        level="H"
                        marginSize={1}
                    />
                </div>

                <button
                    onClick={handleDownload}
                    className="btn-secondary"
                    style={{ width: 'auto', padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}
                >
                    ⬇️ Download QR Code (PNG)
                </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                Print or display this QR code at your business for customers to scan.
            </p>
        </div>
    );
}
