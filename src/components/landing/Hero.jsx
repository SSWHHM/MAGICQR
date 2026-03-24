import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { landingData } from '../../data/landingData';

export default function Hero() {
    const { headline, subheadline, primaryCTA, secondaryCTA, trustBadges } = landingData.hero;
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center lg:text-left"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight text-white mb-8 whitespace-pre-line">
                        {headline}
                    </h1>
                    
                    <p className="text-xl text-text-muted mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                        {subheadline}
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
                        <motion.button 
                            whileHover={{ scale: 1.05, shadow: "0 0 40px rgba(255, 77, 0, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                            className="px-10 py-5 bg-primary hover:bg-primary-light text-white font-black text-xl rounded-xl shadow-2xl transition-all flex items-center gap-3"
                        >
                            {primaryCTA} <ArrowRight size={24} />
                        </motion.button>
                        <button 
                            onClick={() => scrollToSection('#how-it-works')}
                            className="px-10 py-5 bg-surface text-white font-bold text-xl rounded-xl border border-border hover:bg-card transition-all flex items-center gap-3"
                        >
                            <Play size={20} fill="white" className="text-white" /> {secondaryCTA}
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-4">
                        {trustBadges.map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm font-bold text-text-muted">
                                <CheckCircle2 size={16} className="text-success" />
                                {badge}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Floating Mockup */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative hidden lg:block"
                >
                    <div className="relative z-10 p-1 rounded-2xl bg-linear-to-br from-white/10 to-transparent border border-white/5 shadow-2xl">
                        <div className="bg-card rounded-2xl p-6 border border-border">
                            <div className="flex justify-between items-center mb-10">
                                <div className="w-10 h-10 bg-primary/20 rounded-lg" />
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 bg-white/5 rounded-full" />
                                    <div className="w-8 h-8 bg-white/5 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="h-6 w-3/4 bg-border rounded-lg" />
                                <div className="h-3 w-1/2 bg-white/5 rounded-lg" />
                                <div className="py-12 flex justify-center">
                                    <motion.div 
                                        animate={{ scale: [1, 1.02, 1], rotate: [0, 1, 0] }}
                                        transition={{ duration: 6, repeat: Infinity }}
                                        className="w-48 h-48 bg-white p-4 rounded-xl shadow-[0_0_50px_rgba(255,77,0,0.1)]"
                                    >
                                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MAGIC-QR-ENTERPRISE" alt="QR Demo" className="w-full h-full" />
                                    </motion.div>
                                </div>
                                <div className="h-4 w-full bg-border rounded-lg" />
                                <div className="h-4 w-2/3 bg-border rounded-lg" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Floating Accent */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[80px] -z-10 rounded-full" />
                </motion.div>
            </div>
        </section>
    );
}
