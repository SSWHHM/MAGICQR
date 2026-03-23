import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, BarChart3, Loader2, Mail, Lock } from 'lucide-react';

export default function SignupEmailOnly() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            color: 'white'
        }}>
            <main className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Hero Section */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ fontSize: '4rem', fontWeight: 950, marginBottom: '2rem', background: 'linear-gradient(135deg, #22c55e 0%, #fab1a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ✨ MAGIC QR
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Instant 5★ Google Reviews</h1>
                    <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', marginBottom: '3rem' }}>
                        Join Mumbai businesses boosting reviews effortlessly.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle size={24} color="#22c55e" />
                            <span style={{ fontWeight: 700 }}>Easy Setup</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <BarChart3 size={24} color="#3b82f6" />
                            <span style={{ fontWeight: 700 }}>More Reviews</span>
                        </div>
                    </div>
                </motion.div>

                {/* Glass Form Card */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{
                    background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '2.5rem', padding: '3.5rem 2.5rem', maxWidth: '440px'
                }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, textAlign: 'center', marginBottom: '2.5rem' }}>Sign Up</h2>
                    
                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', height: '60px', padding: '0 1.25rem 0 3.5rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem' }} required />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
                            <input type="password" placeholder="Password (8+ chars)" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', height: '60px', padding: '0 1.25rem 0 3.5rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem' }} required minLength={8} />
                        </div>
                        <button type="submit" disabled={loading} style={{ height: '60px', borderRadius: '1.25rem', background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)', color: 'white', fontWeight: 900, fontSize: '1.25rem', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                            {loading ? <Loader2 className="animate-spin mx-auto" size={28} /> : 'Sign Up Free'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'rgba(255,255,255,0.4)' }}>
                        Have account? <Link to="/login" style={{ color: '#a29bfe', fontWeight: 900 }}>Sign In</Link>
                    </p>
                </motion.div>

            </main>
        </div>
    );
}
