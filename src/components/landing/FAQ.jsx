import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { landingData } from '../../data/landingData';

export default function FAQ() {
    const { title, items } = landingData.faq;
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section id="faq" className="py-32 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
                >
                    {title}
                </motion.h2>
            </div>

            <div className="space-y-4">
                {items.map((item, i) => (
                    <div 
                        key={i}
                        className="border-b border-border"
                    >
                        <button 
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full py-8 flex items-center justify-between text-left group"
                        >
                            <span className={`text-xl font-bold transition-colors ${
                                openIndex === i ? 'text-primary' : 'text-white'
                            }`}>
                                {item.q}
                            </span>
                            <div className={`transition-transform duration-300 ${openIndex === i ? 'text-primary' : 'text-text-muted'}`}>
                                {openIndex === i ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                        </button>
                        <AnimatePresence>
                            {openIndex === i && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="pb-8 text-lg font-bold text-text-muted leading-relaxed">
                                        {item.a}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
}
