import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { landingData } from '../../data/landingData';

export default function Testimonials() {
    const { title, items } = landingData.testimonials;

    return (
        <section className="py-32 px-6 max-w-6xl mx-auto">
            <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-6 tracking-tight italic"
                >
                    {title}
                </motion.h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {items.map((item, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-10 rounded-2xl bg-surface border border-border relative group shadow-xl"
                    >
                        <div className="flex gap-1 mb-6">
                            {[...Array(item.rating)].map((_, j) => (
                                <Star key={j} size={18} className="fill-primary text-primary" />
                            ))}
                        </div>
                        
                        <p className="text-lg font-bold text-white mb-8 italic leading-relaxed">
                            "{item.text}"
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-black text-primary">
                                {item.author[0]}
                            </div>
                            <div>
                                <h4 className="font-black text-white">{item.author}</h4>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                                    {item.biz} · {item.city || "Mumbai"}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
