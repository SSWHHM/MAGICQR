import React from 'react';
import { LoginForm } from '../components/AuthForms';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            {/* Background Decorations */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,184,148,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(250,177,160,0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2rem',
                    padding: '3rem 2.5rem', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1,
                    textAlign: 'center'
                }}
            >
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem', background: 'linear-gradient(135deg, #00b894 0%, #fab1a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Login to your dashboard to manage your businesses.</p>
                </div>

                <LoginForm />

                <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: '#00b894', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
                </div>
            </motion.div>
        </div>
    );
}
