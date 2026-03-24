import React from 'react';
import { motion } from 'framer-motion';
import { landingData } from '../../data/landingData';

export default function StatsBar() {
    const { stats, ticker } = landingData.statsBar;

    return (
        <div className="w-full bg-surface border-y border-border py-12 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-8">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-4xl md:text-5xl font-black text-white">
                            {stat.value}
                        </span>
                        <span className="text-sm font-bold text-text-muted uppercase tracking-widest">
                            {stat.label}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Ticker Marquee */}
            <div className="w-full py-4 bg-primary/5 border-t border-border/50">
                <div className="marquee-container overflow-hidden whitespace-nowrap">
                    <motion.div 
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                    >
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="mx-12 text-xs font-black text-primary uppercase tracking-[0.3em]">
                                {ticker}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
