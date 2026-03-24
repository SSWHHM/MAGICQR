import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { landingData } from '../../data/landingData';

export default function Pricing() {
    const { title, tiers } = landingData.pricing;
    const [isYearly, setIsYearly] = useState(false);
    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-32 px-6 max-w-6xl mx-auto relative overflow-hidden">
            <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-10 tracking-tight"
                >
                    {title}
                </motion.h2>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-text-muted'}`}>Monthly</span>
                    <button 
                        onClick={() => setIsYearly(!isYearly)}
                        className="w-14 h-7 bg-card rounded-full p-1 relative transition-colors border border-border"
                    >
                        <motion.div 
                            animate={{ x: isYearly ? 28 : 0 }}
                            className="w-5 h-5 bg-primary rounded-full"
                        />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-text-muted'}`}>Yearly</span>
                        <span className="bg-success text-white text-[10px] font-black px-2 py-1 rounded shadow-lg shadow-success/20 tracking-wider">20% OFF</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {tiers.map((tier, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative p-10 rounded-xl flex flex-col transition-all duration-300 ${
                            tier.popular 
                            ? 'bg-card border-2 border-primary shadow-[0_0_40px_rgba(255,77,0,0.1)] scale-105 z-10' 
                            : 'bg-surface border border-border'
                        }`}
                    >
                        {tier.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-b shadow-lg">
                                Recommended
                            </div>
                        )}

                        <div className="mb-10">
                            <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-4">{tier.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">{tier.price}</span>
                                <span className="text-text-muted font-bold text-lg">/{isYearly ? 'yr' : 'mo'}</span>
                            </div>
                        </div>

                        <ul className="flex-1 space-y-4 mb-12">
                            {tier.features.map((feature, j) => (
                                <li key={j} className="flex items-center gap-3 text-sm font-bold text-text-muted">
                                    <Check size={16} className="text-success" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => navigate('/signup')}
                            className={`w-full py-5 rounded-lg font-black text-lg transition-all active:scale-95 ${
                                tier.popular 
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-light' 
                                : 'bg-border text-white hover:bg-card'
                            }`}
                        >
                            Get Started
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
