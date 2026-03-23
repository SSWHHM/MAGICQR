import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { landingData } from '../../data/landingData';

export default function Footer() {
    const { banner, columns, copyright } = landingData.footer;
    const navigate = useNavigate();

    return (
        <footer className="relative pt-32 pb-12 px-6 border-t border-white/5 bg-white/1">
            <div className="max-w-7xl mx-auto">
                {/* Final CTA Banner */}
                <motion.section 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32 relative group"
                >
                    <div className="p-px rounded-[3rem] bg-linear-to-br from-primary via-secondary to-primary shadow-2xl shadow-primary/20">
                        <div className="p-12 md:p-24 rounded-[calc(3rem-1px)] bg-bg relative overflow-hidden text-center">
                            {/* Animated Background Orbs */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] -z-10 animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[100px] -z-10 animate-pulse" />
                            
                            <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight bg-linear-to-br from-white to-white/60 bg-clip-text text-transparent">
                                {banner.headline}
                            </h2>
                            <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-2xl mx-auto font-medium italic">
                                "{banner.subtext}"
                            </p>
                            
                            <motion.button 
                                whileHover={{ scale: 1.05, shadow: "0 0 30px rgba(124,58,237,0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/signup')}
                                className="px-12 py-6 bg-linear-to-r from-primary to-secondary text-white font-black text-2xl rounded-2xl shadow-2xl transition-all"
                            >
                                {banner.cta} →
                            </motion.button>
                            
                            <p className="mt-8 text-white/20 font-black tracking-[0.3em] font-mono text-xs uppercase">
                                CANCEL ANYTIME. START THE ALCHEMY.
                            </p>
                        </div>
                    </div>
                </motion.section>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-8 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                                M
                            </div>
                            <span className="text-2xl font-black bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                                MAGIC QR
                            </span>
                        </div>
                        <p className="text-text-muted leading-relaxed max-w-sm font-medium">
                            India's #1 QR review tool for local businesses. Elevating physical customer experiences into digital gold since 2026.
                        </p>
                    </div>

                    {columns.map((col, i) => (
                        <div key={i}>
                            <h4 className="font-black text-white mb-8 uppercase tracking-widest text-xs">{col.title}</h4>
                            <ul className="space-y-4 text-text-muted font-bold text-sm">
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-[10px] md:text-xs text-text-muted font-black uppercase tracking-[0.2em]">
                    <div className="text-center md:text-left">{copyright}</div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href="mailto:wildnutbeats@gmail.com" className="hover:text-white transition-colors underline decoration-primary/50 underline-offset-4">wildnutbeats@gmail.com</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
