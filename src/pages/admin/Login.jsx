import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            setError(err.message?.includes('Invalid') ? 'Invalid email or password' : (err.message || 'Sign in failed'));
        }
        setLoading(false);
    };

    return (
        <div className="bg-mesh">
            <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '24rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔮</div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Magic QR Admin
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            Sign in to manage your restaurants
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                                Email
                            </label>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@restaurant.com"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                                Password
                            </label>
                            <input
                                className="input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
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
                        <button className="btn-primary" type="submit" disabled={loading}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="spinner spinner-sm" /> Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
