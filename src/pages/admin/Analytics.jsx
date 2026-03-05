import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBusiness, getEvents, getAllServicesAdmin } from '../../lib/firestore';

export default function Analytics() {
    const { id } = useParams();
    const [business, setBusiness] = useState(null);
    const [events, setEvents] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        const [biz, evts, svcs] = await Promise.all([
            getBusiness(id),
            getEvents(id),
            getAllServicesAdmin(id),
        ]);
        setBusiness(biz);
        setEvents(evts);
        setServices(svcs);
        setLoading(false);
    }

    // Compute stats
    const scans = events.filter((e) => e.type === 'scan').length;
    const nextClicks = events.filter((e) => e.type === 'next').length;
    const copyOpens = events.filter((e) => e.type === 'copy_open').length;
    const confirmed = events.filter((e) => e.type === 'confirm_posted').length;

    // Funnel percentages
    const scanToNext = scans > 0 ? ((nextClicks / scans) * 100).toFixed(1) : '0.0';
    const nextToCopy = nextClicks > 0 ? ((copyOpens / nextClicks) * 100).toFixed(1) : '0.0';
    const copyToConfirm = copyOpens > 0 ? ((confirmed / copyOpens) * 100).toFixed(1) : '0.0';
    const dropOff = scans > 0 ? (((scans - copyOpens) / scans) * 100).toFixed(1) : '0.0';

    // Top services
    const serviceStats = {};
    events.forEach((e) => {
        if (e.serviceId && e.type === 'next') {
            serviceStats[e.serviceId] = (serviceStats[e.serviceId] || 0) + 1;
        }
    });
    const topServices = Object.entries(serviceStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([svcId, count]) => {
            const svc = services.find((s) => s.id === svcId);
            return { name: svc?.name || svcId, count };
        });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Breadcrumb */}
            <div style={{ marginBottom: '1rem' }}>
                <Link
                    to={`/admin/restaurant/${id}`}
                    style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                    ← Back to {business?.displayName}
                </Link>
            </div>

            <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>
                📊 Analytics
            </h1>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
            }}>
                <div className="stat-card">
                    <div className="stat-value">{scans}</div>
                    <div className="stat-label">QR Scans</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{nextClicks}</div>
                    <div className="stat-label">Next Clicks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{copyOpens}</div>
                    <div className="stat-label">Copy & Open</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{confirmed}</div>
                    <div className="stat-label">Confirmed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{dropOff}%</div>
                    <div className="stat-label">Drop-off</div>
                </div>
            </div>

            {/* Funnel */}
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                    📈 Conversion Funnel
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                        { label: 'Scan → Next', value: scanToNext, count: `${scans} → ${nextClicks}` },
                        { label: 'Next → Copy & Open', value: nextToCopy, count: `${nextClicks} → ${copyOpens}` },
                        { label: 'Copy → Confirmed', value: copyToConfirm, count: `${copyOpens} → ${confirmed}` },
                    ].map((step) => (
                        <div key={step.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{step.label}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    {step.value}% ({step.count})
                                </span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                                <div style={{
                                    height: '100%',
                                    borderRadius: '3px',
                                    background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                                    width: `${Math.min(parseFloat(step.value), 100)}%`,
                                    transition: 'width 0.5s ease',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Services */}
            {topServices.length > 0 && (
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                        🏆 Top Services
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {topServices.map((s, i) => (
                            <div key={s.name} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                            }}>
                                <span style={{
                                    width: '1.75rem',
                                    height: '1.75rem',
                                    borderRadius: '50%',
                                    background: 'rgba(108, 92, 231, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: 'var(--color-primary-light)',
                                }}>
                                    {i + 1}
                                </span>
                                <span style={{ flex: 1, fontWeight: '500' }}>{s.name}</span>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    {s.count} selections
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
