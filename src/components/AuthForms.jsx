import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin + '/onboard'
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            navigate('/onboard');
        }
    };

    return (
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', width: '20px' }} />
                <input 
                    type="email" 
                    placeholder="your@email.com" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.5rem', borderRadius: '1.25rem',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(10px)',
                        transition: 'border-color 0.2s'
                    }}
                />
            </div>
            
            <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', width: '20px' }} />
                <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Password (8+ chars)" 
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: '100%', padding: '1.25rem 3.5rem 1.25rem 3.5rem', borderRadius: '1.25rem',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(10px)',
                        transition: 'border-color 0.2s'
                    }}
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {error && (
                <div style={{ color: '#ff7675', fontSize: '0.9rem', padding: '0.75rem', background: 'rgba(255,118,117,0.1)', borderRadius: '1rem', textAlign: 'center', border: '1px solid rgba(255,118,117,0.2)' }}>
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading || !email || !password}
                style={{
                    padding: '1.25rem', borderRadius: '1.25rem', border: 'none',
                    background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                    boxShadow: '0 10px 30px -10px rgba(108, 92, 231, 0.5)',
                    color: 'white', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: (loading || !email || !password) ? 0.6 : 1
                }}
            >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Sign Up Free <ArrowRight size={20} /></>}
            </button>
        </form>
    );
}

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

        if (loginError) {
            setError(loginError.message);
            setLoading(false);
        } else {
            navigate('/onboard');
        }
    };

    return (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', width: '20px' }} />
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.5rem', borderRadius: '1.25rem',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(10px)'
                    }}
                />
            </div>
            
            <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', width: '20px' }} />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.5rem', borderRadius: '1.25rem',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(10px)'
                    }}
                />
            </div>

            {error && (
                <div style={{ color: '#ff7675', fontSize: '0.9rem', padding: '0.75rem', background: 'rgba(255,118,117,0.1)', borderRadius: '1rem', textAlign: 'center', border: '1px solid rgba(255,118,117,0.2)' }}>
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                style={{
                    padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    transition: 'all 0.3s ease'
                }}
            >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Login <ArrowRight size={20} /></>}
            </button>
        </form>
    );
}
