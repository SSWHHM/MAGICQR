import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, BarChart3, ShieldCheck, Star } from 'lucide-react';
import PricingTable from '../components/PricingTable';

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            backdropFilter: 'blur(10px)'
        }}
    >
        <div style={{ background: 'rgba(0,184,148,0.1)', width: '50px', height: '50px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Icon size={24} color="#00b894" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
    </motion.div>
);

const Particle = ({ i }) => (
    <motion.div
        animate={{
            x: [0, 100, 0, -100, 0],
            y: [0, -100, 0, 100, 0],
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.2, 1, 0.8, 1]
        }}
        transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "linear"
        }}
        style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: 'rgba(0,184,148,0.3)',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
        }}
    />
);

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Background Decorations */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,184,148,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(250,177,160,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                {[...Array(20)].map((_, i) => <Particle key={i} i={i} />)}
            </div>

            <main style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2rem', textAlign: 'center' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <h1 style={{ 
                            fontSize: 'clamp(3rem, 8vw, 6rem)', 
                            fontWeight: 950, 
                            lineHeight: 1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.04em',
                            background: 'linear-gradient(135deg, #00b894 0%, #fab1a0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Instant 5★ Google Reviews via QR Scan
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                            Print QR once. Customers scan. Get more 5★ Google reviews for your services effortlessly.
                        </p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                onClick={() => navigate('/signup')} 
                                style={{ 
                                    padding: '1.2rem 2.5rem', borderRadius: '1.2rem', background: '#00b894', color: 'white', 
                                    fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'transform 0.2s',
                                    display: 'flex', alignItems: 'center', gap: '0.6rem'
                                }}
                            >
                                Start Free Trial <ArrowRight size={20} />
                            </button>
                            <button 
                                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                style={{ 
                                    padding: '1.2rem 2.5rem', borderRadius: '1.2rem', background: 'rgba(255,255,255,0.05)', color: 'white', 
                                    fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                                }}
                            >
                                See How It Works
                            </button>
                        </div>

                        <div style={{ marginTop: '4rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={16} color="#00b894" /> Boosts Google rankings</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={16} color="#00b894" /> Easy QR setup</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={16} color="#00b894" /> Mumbai businesses love it</div>
                        </div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section id="features" className="max-w-6xl mx-auto py-20 px-6">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Everything You Need to Rank #1</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Powerful tools designed for local business growth.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <FeatureCard icon={Zap} title="QR Generator" desc="Instant high-res QR codes for your storefront or receipts." />
                        <FeatureCard icon={Target} title="Service Reviews" desc="Direct customers to specific services for targeted 5★ feedback." />
                        <FeatureCard icon={BarChart3} title="Ranking Boost" desc="More positive volume signals to Google that you're the best in town." />
                        <FeatureCard icon={ShieldCheck} title="Smart Dashboard" desc="Manage all your locations and view scan metrics in real-time." />
                    </div>
                </section>

                {/* Pricing Section (Reusable Component) */}
                <PricingTable />

                {/* Testimonials */}
                <section style={{ padding: '8rem 2rem', background: 'rgba(255,255,255,0.02)' }} className="py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', marginBottom: '2rem' }}>
                            {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="#fab1a0" color="#fab1a0" />)}
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, fontStyle: 'italic', marginBottom: '2rem' }}>
                            "MAGIC QR made it so easy for my print shop. We used to struggle to get reviews, now they come in every day without us even asking!"
                        </h2>
                        <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>— Owner, Local Business (Mumbai)</div>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{ padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }} className="py-10 px-6">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                        <div style={{ fontWeight: 900, fontSize: '1.5rem', background: 'linear-gradient(135deg, #00b894 0%, #fab1a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            MAGIC QR
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                            <a href="mailto:wildnutbeats@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>wildnutbeats@gmail.com</a>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>© 2026 MAGIC QR. All rights reserved.</div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
