import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { landingData } from '../../data/landingData';

const FAQItem = ({ q, a, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="mb-4"
        >
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-8 rounded-3xl text-left transition-all duration-300 flex items-center justify-between group ${
                    isOpen ? 'bg-primary/10 border-primary/30' : 'bg-white/3 border-white/5 hover:bg-white/6'
                } border backdrop-blur-xl`}
            >
                <span className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors">
                    {q}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isOpen ? 'bg-primary text-white rotate-180' : 'bg-white/5 text-text-muted'
                }`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-8 pt-0 text-text-muted leading-relaxed font-medium">
                            <p className="border-l-2 border-primary/30 pl-6 py-4">
                                {a}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function FAQ() {
    const { title, subtitle, items } = landingData.faq;

    return (
        <section id="faq" className="py-32 px-6 max-w-4xl mx-auto relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10 rounded-full" />
            
            <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-6 tracking-tighter"
                >
                    {title}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-text-muted font-medium"
                >
                    {subtitle}
                </motion.p>
            </div>

            <div className="space-y-4">
                {items.map((item, i) => (
                    <FAQItem key={i} index={i} q={item.q} a={item.a} />
                ))}
            </div>

            {/* Support Callout */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-20 p-8 rounded-4xl bg-linear-to-r from-primary/5 to-secondary/5 border border-white/5 text-center backdrop-blur-md"
            >
                <p className="text-white/60 font-bold mb-4 uppercase tracking-widest text-xs">Still have questions?</p>
                <h3 className="text-2xl font-black text-white mb-6">Our digital alchemists are standing by...</h3>
                <button className="px-8 py-3 bg-white/5 text-white font-black rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    Contact Support
                </button>
            </motion.div>
        </section>
    );
}
