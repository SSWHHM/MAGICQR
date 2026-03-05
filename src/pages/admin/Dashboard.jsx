import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getAllBusinesses, getEvents } from '../../lib/firestore';

export default function Dashboard() {
    const { businesses } = useOutletContext();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [businesses]);

    async function loadStats() {
        setLoading(true);
        const aggregated = {
            totalScans: 0,
            totalNext: 0,
            totalCopyOpen: 0,
            totalConfirmed: 0,
        };

        for (const b of businesses) {
            try {
                const events = await getEvents(b.id);
                events.forEach((e) => {
                    switch (e.type) {
                        case 'scan': aggregated.totalScans++; break;
                        case 'next': aggregated.totalNext++; break;
                        case 'copy_open': aggregated.totalCopyOpen++; break;
                        case 'confirm_posted': aggregated.totalConfirmed++; break;
                    }
                });
            } catch (err) {
                console.error('Error loading events for', b.id, err);
            }
        }
        setStats(aggregated);
        setLoading(false);
    }

    const dropOffRate = stats.totalScans > 0
        ? (((stats.totalScans - stats.totalCopyOpen) / stats.totalScans) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Overview of all businesses
                </p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="spinner" />
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalScans}</div>
                            <div className="stat-label">QR Scans</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalNext}</div>
                            <div className="stat-label">Next Clicks</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalCopyOpen}</div>
                            <div className="stat-label">Copy & Open</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalConfirmed}</div>
                            <div className="stat-label">Confirmed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{dropOffRate}%</div>
                            <div className="stat-label">Drop-off</div>
                        </div>
                    </div>

                    {/* Business List */}
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                        Your Businesses
                    </h2>
                    {businesses.length === 0 ? (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏢</div>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                No businesses yet. Create your first one!
                            </p>
                            <Link to="/admin/restaurants/new" className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }}>
                                ➕ Add Business
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {businesses.map((r) => (
                                <Link key={r.id} to={`/admin/restaurant/${r.id}`} style={{ textDecoration: 'none' }}>
                                    <div className="glass-light" style={{
                                        padding: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                    }}>
                                        {r.logoUrl ? (
                                            <img
                                                src={r.logoUrl}
                                                alt={r.displayName}
                                                style={{ width: '48px', height: '48px', borderRadius: '0.75rem', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '0.75rem',
                                                background: 'rgba(108, 92, 231, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.25rem',
                                            }}>
                                                🏢
                                            </div>
                                        )}
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                                {r.displayName}
                                            </h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                /{r.slug} • {r.placeId ? '✅ Place ID set' : '⚠️ No Place ID'}
                                            </p>
                                        </div>
                                        <div style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>→</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
