import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllBusinesses } from '../../lib/db';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [businesses, setBusinesses] = useState([]);

    useEffect(() => {
        loadBusinesses();
    }, []);

    async function loadBusinesses() {
        const data = await getAllBusinesses();
        setBusinesses(data);
    }

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="admin-layout">
            <nav className="admin-sidebar" style={{ width: '240px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'var(--color-bg)' }}>
                <div style={{ padding: '2rem 1.5rem', marginBottom: '1rem' }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: 'white',
                    }}>
                        🔮 Magic QR
                    </h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.4rem', fontWeight: '500' }}>
                        {user?.email}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
                    <Link to="/admin" className={isActive('/admin') && !location.pathname.includes('/restaurant') ? 'active' : ''} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>📊</span> Dashboard
                    </Link>
                    <Link to="/admin/restaurants/new" className={isActive('/admin/restaurants/new') ? 'active' : ''} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>➕</span> New Business
                    </Link>
                    <Link to="/admin/feedback" className={isActive('/admin/feedback') ? 'active' : ''} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>📬</span> Feedback Inbox
                    </Link>

                    {businesses.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{
                                padding: '0 1rem 0.5rem',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                color: 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}>
                                Businesses
                            </div>
                            {businesses.map((r) => (
                                <Link
                                    key={r.id}
                                    to={`/admin/restaurant/${r.id}`}
                                    className={isActive(`/admin/restaurant/${r.id}`) ? 'active' : ''}
                                    style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                                >
                                    <span>🏢</span> {r.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ padding: '1.5rem 0.75rem' }}>
                    <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: 'var(--color-error)', fontWeight: '600', fontSize: '0.9rem' }}>
                        🚪 Sign Out
                    </button>
                </div>
            </nav>

            <main className="admin-main">
                <Outlet context={{ businesses, refreshBusinesses: loadBusinesses }} />
            </main>
        </div>
    );
}
