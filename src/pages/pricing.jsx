import React from 'react';
import { motion } from 'framer-motion';
import PricingTable from '../components/PricingTable';

export default function Pricing() {
    return (
        <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '100px 0' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '1rem' }}
            >
                <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(0,184,148,0.1)', color: '#00b894', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
                    SaaS Pricing
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Pick your growth plan</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto' }}>
                    Simple, transparent pricing for any stage of growth. 14-day free trial on every plan.
                </p>
            </motion.div>

            <PricingTable />

            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                Need a custom plan? <a href="mailto:wildnutbeats@gmail.com" style={{ color: '#00b894', fontWeight: 600 }}>Contact Sales</a>
            </div>
        </div>
    );
}
