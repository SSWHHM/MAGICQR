import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TIERS = [
    {
        name: 'Starter',
        monthlyPrice: 499,
        yearlyPrice: 399,
        features: ['1 location', '50 scans', 'Basic QR design', 'Standard support'],
        btnText: 'Start Free Trial',
        popular: false
    },
    {
        name: 'Growth',
        monthlyPrice: 1999,
        yearlyPrice: 1599,
        features: ['Unlimited locations', 'Unlimited scans', 'SEO review boost', 'Full analytics', 'Priority support'],
        btnText: 'Go Growth',
        popular: true
    },
    {
        name: 'Pro',
        monthlyPrice: 4999,
        yearlyPrice: 3999,
        features: ['White-label QR', 'Agency tools (5 clients)', 'API Access', '24/7 VIP support', 'Custom branding'],
        btnText: 'Get Pro',
        popular: false
    }
];

export default function PricingTable() {
    const [isYearly, setIsYearly] = useState(false);
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return price.toLocaleString('en-IN');
    };

    return (
        <section className="py-24 px-6" id="pricing">
            <div className="max-w-6xl mx-auto">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #00b894 0%, #fab1a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Pick your growth plan
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', marginBottom: '3rem' }}>
                        14-day free trial on every plan. No credit card required.
                    </p>

                    {/* Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ color: !isYearly ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Monthly</span>
                        <button 
                            onClick={() => setIsYearly(!isYearly)}
                            style={{
                                width: '56px',
                                height: '28px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '2rem',
                                padding: '3px',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                background: '#00b894',
                                borderRadius: '50%',
                                transform: isYearly ? 'translateX(28px)' : 'translateX(0)',
                                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: isYearly ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Yearly</span>
                            <span style={{ background: 'rgba(0,184,148,0.15)', color: '#00b894', padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 800 }}>Save 20%</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {TIERS.map((tier) => (
                        <div key={tier.name} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${tier.popular ? 'rgba(0,184,148,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '2rem',
                            padding: '3rem 2rem',
                            position: 'relative',
                            backdropFilter: 'blur(12px)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {tier.popular && (
                                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#00b894', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                    Most Popular
                                </div>
                            )}
                            
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>{tier.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '2rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>₹{formatPrice(isYearly ? tier.yearlyPrice : tier.monthlyPrice)}</span>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>/{isYearly ? 'yr' : 'mo'}</span>
                            </div>

                            <div style={{ flex: 1, marginBottom: '2.5rem' }}>
                                {tier.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                                        <Check size={18} color="#00b894" />
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => navigate('/signup')}
                                style={{
                                    width: '100%',
                                    padding: '1.2rem',
                                    borderRadius: '1rem',
                                    border: 'none',
                                    background: tier.popular ? '#00b894' : 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tier.btnText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
