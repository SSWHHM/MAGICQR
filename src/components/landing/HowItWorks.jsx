import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Printer, TrendingUp } from 'lucide-react';
import { landingData } from '../../data/landingData';

const icons = {
    QrCode: QrCode,
    Printer: Printer,
    TrendingUp: TrendingUp
};

export default function HowItWorks() {
    const { title, subtitle, steps } = landingData.howItWorks;

    return (
        <section id="how-it-works" className="py-32 px-6 max-w-6xl mx-auto relative">
            <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
                >
                    {title}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-text-muted font-bold"
                >
                    {subtitle}
                </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
                {steps.map((step, i) => {
                    const Icon = icons[step.icon];
                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-2xl bg-surface border border-border relative group"
                        >
                            <div className="text-8xl font-black text-white/5 absolute top-0 right-4 group-hover:text-primary/10 transition-colors">
                                {step.id}
                            </div>
                            
                            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-8 ring-1 ring-primary/20">
                                <Icon size={32} className="text-primary" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-white mb-4">
                                {step.title}
                            </h3>
                            <p className="text-text-muted leading-relaxed font-bold">
                                {step.desc}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
