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
        <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[100px] -z-10" />

            <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-10 tracking-tighter"
                >
                    {title}
                </motion.h2>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-text-muted'}`}>Monthly</span>
                    <button 
                        onClick={() => setIsYearly(!isYearly)}
                        className="w-14 h-7 bg-white/10 rounded-full p-1 relative transition-colors focus:ring-2 ring-primary/50 outline-hidden"
                    >
                        <motion.div 
                            animate={{ x: isYearly ? 28 : 0 }}
                            className="w-5 h-5 bg-primary rounded-full shadow-lg"
                        />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-text-muted'}`}>Yearly</span>
                        <span className="bg-success/20 text-success text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">Save 20%</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {tiers.map((tier, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative p-10 rounded-[2.5rem] flex flex-col transition-all duration-500 hover:scale-[1.02] ${
                            tier.popular 
                            ? 'bg-linear-to-b from-primary/20 via-surface to-surface border-primary/30' 
                            : 'bg-white/3 border-white/5'
                        } border backdrop-blur-3xl overflow-hidden`}
                    >
                        {tier.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-b-xl shadow-lg">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-10">
                            <h3 className="text-xl font-black text-white mb-2">{tier.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">{tier.price}</span>
                                <span className="text-text-muted font-bold">/{isYearly ? 'yr' : 'mo'}</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 mb-12">
                            {tier.features.map((feature, j) => (
                                <div key={j} className="flex items-center gap-3 text-sm font-medium text-text-muted group">
                                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                                        <Check size={12} className="text-success" />
                                    </div>
                                    <span className="group-hover:text-white transition-colors">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => navigate('/signup')}
                            className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl ${
                                tier.popular 
                                ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark' 
                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                            }`}
                        >
                            Start Transformation
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
