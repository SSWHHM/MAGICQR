import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllBusinesses } from '../../lib/firestore';

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
            <nav className="admin-sidebar">
                <div style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
                    <h2 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        🔮 Magic QR
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        {user?.email}
                    </p>
                </div>

                <Link to="/admin" className={isActive('/admin') && !location.pathname.includes('/restaurant') ? 'active' : ''}>
                    📊 Dashboard
                </Link>
                <Link to="/admin/restaurants/new" className={isActive('/admin/restaurants/new') ? 'active' : ''}>
                    ➕ New Business
                </Link>

                {businesses.length > 0 && (
                    <>
                        <div style={{
                            padding: '0.75rem 1rem 0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}>
                            Businesses
                        </div>
                        {businesses.map((r) => (
                            <Link
                                key={r.id}
                                to={`/admin/restaurant/${r.id}`}
                                className={isActive(`/admin/restaurant/${r.id}`) ? 'active' : ''}
                            >
                                🏢 {r.displayName}
                            </Link>
                        ))}
                    </>
                )}

                <div style={{ flex: 1 }} />

                <button onClick={handleLogout} style={{ color: 'var(--color-error)' }}>
                    🚪 Sign Out
                </button>
            </nav>

            <main className="admin-main">
                <Outlet context={{ businesses, refreshBusinesses: loadBusinesses }} />
            </main>
        </div>
    );
}
