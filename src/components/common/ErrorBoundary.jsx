import React from 'react';

/**
 * 🛡️ MAGIC QR Error Boundary
 * Prevents "Blank Screen" syndrome by catching React errors 
 * and showing a helpful recovery UI.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0d0c1a',
                    color: 'white',
                    padding: '2rem',
                    textAlign: 'center',
                    fontFamily: 'sans-serif'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Something took a small detour.</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', maxWidth: '400px' }}>
                        The wizard encountered an unexpected glitch. Don't worry, your data is likely safe.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                            color: 'white',
                            border: 'none',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        Try Refreshing ✨
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre style={{ marginTop: '2rem', color: '#fb7185', fontSize: '0.7rem', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem' }}>
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
