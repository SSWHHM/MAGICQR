import React from 'react';
import { Check } from 'lucide-react';

const TIERS = [
    {
        name: 'Starter',
        price: '499',
        features: ['1 location', '50 scans', 'Basic QR design', 'Standard support'],
        btnText: 'Start Free Trial',
        popular: false
    },
    {
        name: 'Growth',
        price: '1,999',
        features: ['Unlimited locations', 'Unlimited scans', 'SEO review boost', 'Full analytics', 'Priority support'],
        btnText: 'Go Growth',
        popular: true
    },
    {
        name: 'Pro',
        price: '4,999',
        features: ['White-label QR', 'Agency tools (5 clients)', 'API Access', '24/7 VIP support', 'Custom branding'],
        btnText: 'Get Pro',
        popular: false
    }
];

export default function PricingTable() {
    return (
        <section className="py-20 px-6" id="pricing">
            <div className="max-w-6xl mx-auto">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(135deg, #00b894 0%, #fab1a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Pick your growth plan
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem' }}>14-day free trial on every plan. No credit card required.</p>
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
                            transition: 'transform 0.3s ease',
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
                                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>₹{tier.price}</span>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>/mo</span>
                            </div>

                            <div style={{ flex: 1, marginBottom: '2.5rem' }}>
                                {tier.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                                        <Check size={18} color="#00b894" />
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '1rem',
                                border: 'none',
                                background: tier.popular ? '#00b894' : 'rgba(255,255,255,0.08)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                {tier.btnText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
