import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, BarChart3, Loader2, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError('');
        const { error: googleError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/onboard`
            }
        });
        if (googleError) {
            // If it's the "Unsupported provider" error, give a helpful hint
            if (googleError.message.includes('not enabled')) {
                setError('Google Auth is not enabled yet. Please follow the setup guide or use Email below.');
            } else {
                setError(googleError.message);
            }
        }
        setLoading(false);
    };

    const handleEmailSignup = async (e) => {
        if (e) e.preventDefault();
        if (password.length < 8) return setError('Password must be at least 8 characters');
        
        setLoading(true);
        setError('');
        
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/onboard`
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            // Redirect to onboard
            window.location.href = '/onboard';
        }
    };

    return (
        <div style={{ 
            background: '#0a0a0a', 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background mesh particles */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(108, 92, 231, 0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
            </div>

            <main className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center" style={{ position: 'relative', zIndex: 1 }}>
                
                {/* LEFT: Hero Content */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{ 
                        fontSize: '4rem', fontWeight: 950, marginBottom: '2.25rem',
                        background: 'linear-gradient(135deg, #22c55e 0%, #fab1a0 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.04em'
                    }}>
                        ✨ MAGIC QR
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem' }}>
                        Instant 5★ Google Reviews via QR Scan
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', maxWidth: '500px', lineHeight: 1.6, marginBottom: '3.5rem' }}>
                        Print QR once. Customers scan. Reviews boost your Google ranking instantly. No friction, just growth.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: '#22c55e', padding: '0.6rem', borderRadius: '0.75rem', display: 'flex' }}>
                                <CheckCircle size={22} color="white" />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Easy Setup</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: '#3b82f6', padding: '0.6rem', borderRadius: '0.75rem', display: 'flex' }}>
                                <BarChart3 size={22} color="white" />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>More Reviews</span>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT: Glass Form Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '2.5rem',
                        padding: '4rem 3rem',
                        maxWidth: '460px',
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        margin: '0 auto'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: 950, color: 'white', marginBottom: '0.75rem' }}>Sign Up</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem' }}>Get your custom QR code in 2 minutes.</p>
                    </div>

                    {error && (
                        <div style={{ 
                            padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', 
                            color: '#fca5a5', borderRadius: '1.25rem', marginBottom: '1.75rem', fontSize: '0.9rem', textAlign: 'center' 
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Google Button */}
                        <button 
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            style={{
                                width: '100%', height: '64px', background: 'white',
                                borderRadius: '1.25rem', border: 'none',
                                color: '#0f172a', fontWeight: 800, fontSize: '1.1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                cursor: 'pointer', transition: 'transform 0.2s',
                                boxShadow: '0 8px 20px -6px rgba(0,0,0,0.3)'
                            }}
                        >
                            <FcGoogle size={28} /> Continue with Google
                        </button>

                        <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                            <span style={{ position: 'absolute', background: '#0a0a0a', padding: '0 1.25rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>OR</span>
                        </div>

                        {/* Email Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input 
                                type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                                style={{
                                    width: '100%', height: '64px', padding: '0 1.5rem', borderRadius: '1.25rem',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', fontSize: '1.1rem', outline: 'none'
                                }}
                            />
                            <input 
                                type="password" placeholder="Password (8+ chars)" value={password} onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: '100%', height: '64px', padding: '0 1.5rem', borderRadius: '1.25rem',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', fontSize: '1.1rem', outline: 'none'
                                }}
                            />
                        </div>

                        <button 
                            onClick={handleEmailSignup}
                            disabled={loading || !email || password.length < 8}
                            style={{
                                width: '100%', height: '64px', borderRadius: '1.25rem',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                                color: 'white', fontWeight: 900, fontSize: '1.25rem', border: 'none',
                                cursor: 'pointer', boxShadow: '0 10px 30px -5px rgba(124, 58, 237, 0.5)',
                                transition: 'all 0.3s', opacity: (loading || !email || password.length < 8) ? 0.6 : 1
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" size={32} /> : <>Sign Up Free <ArrowRight size={22} style={{marginLeft: '0.5rem'}} /></>}
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>
                        Have account? <Link to="/login" style={{ color: '#a29bfe', fontWeight: 900, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </motion.div>

            </main>
        </div>
    );
}
