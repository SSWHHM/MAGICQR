import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Star } from 'lucide-react';
import { landingData } from '../../data/landingData';

export default function Hero() {
    const { badge, headline, subheadline, primaryCTA, secondaryCTA, stats } = landingData.hero;
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-32 pb-20">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1] 
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.05, 0.08, 0.05] 
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-secondary/10 blur-[100px] rounded-full" 
                />
            </div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center lg:text-left"
                >
                    {/* Trust Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className="fill-warning text-warning" />
                            ))}
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest">
                            {badge}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter mb-8 bg-linear-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
                        {headline}
                    </h1>
                    
                    <p className="text-lg md:text-xl text-text-muted mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                        {subheadline}
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                            className="px-10 py-5 bg-linear-to-r from-primary to-secondary text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/30 transition-all flex items-center gap-3"
                        >
                            {primaryCTA} <ArrowRight size={24} />
                        </motion.button>
                        <motion.button 
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                            onClick={() => scrollToSection('#how-it-works')}
                            className="px-10 py-5 bg-white/5 text-white font-bold text-lg rounded-2xl border border-white/10 backdrop-blur-md transition-all flex items-center gap-3"
                        >
                            <Play size={20} fill="white" /> {secondaryCTA}
                        </motion.button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-6 mt-16 max-w-md mx-auto lg:mx-0">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="text-3xl font-black text-white">{stat.value}</span>
                                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="relative perspective-1000"
                >
                    {/* Phone Mockup Frame */}
                    <div className="relative w-full aspect-4/3 bg-white/5 rounded-[3rem] border border-white/10 p-4 backdrop-blur-3xl overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-inner">
                            {/* Inner Dashboard Mockup */}
                            <div className="p-8 h-full flex flex-col">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl" />
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 bg-white/5 rounded-full" />
                                        <div className="w-8 h-8 bg-white/5 rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-6 flex-1 flex flex-col justify-center">
                                    <div className="h-6 w-3/4 bg-white/10 rounded-lg animate-pulse mx-auto" />
                                    <div className="h-3 w-1/2 bg-white/5 rounded-lg animate-pulse mx-auto" />
                                    <div className="py-8 flex justify-center">
                                        <motion.div 
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="w-48 h-48 bg-white p-4 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] relative group-hover:shadow-primary/20 transition-all duration-700"
                                        >
                                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MAGIC-QR-DEMO" alt="QR Demo" className="w-full h-full" />
                                          <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 animate-pulse" />
                                        </motion.div>
                                    </div>
                                    <div className="text-center">
                                        <div className="inline-flex gap-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={20} className="fill-primary text-primary animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Floating Decorative Elements */}
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute -top-10 -right-6 p-5 rounded-2xl bg-primary text-white font-black shadow-2xl rotate-12 flex items-center gap-2"
                    >
                        <Star size={18} className="fill-white" /> +47 reviews this week
                    </motion.div>
                    <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="absolute -bottom-10 -left-6 p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold shadow-2xl -rotate-6"
                    >
                        Verified by Google
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
