import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Auth gate is ACTIVE — remove this file's bypass to restore production auth.
// TODO (if you need to re-test without Firebase): set isConfigured bypass back.
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!user) return <Navigate to="/admin/login" replace />;

    return children;
}
