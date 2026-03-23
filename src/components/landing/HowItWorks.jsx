import React from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin, Star } from 'lucide-react';
import { landingData } from '../../data/landingData';

const icons = {
    Zap: Zap,
    MapPin: MapPin,
    Star: Star
};

export default function HowItWorks() {
    const { title, subtitle, steps } = landingData.howItWorks;

    return (
        <section id="how-it-works" className="py-32 px-6 max-w-7xl mx-auto relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] -z-10 rounded-full" />
            
            <div className="text-center mb-24">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-6"
                >
                    {title}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-text-muted"
                >
                    {subtitle}
                </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-16 relative">
                {/* Connecting Dash Line (Desktop) */}
                <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-linear-to-r from-transparent via-primary/20 to-transparent -z-10" />
                
                {steps.map((step, i) => {
                    const Icon = icons[step.icon];
                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary to-secondary p-0.5 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/20">
                                    <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                                        <Icon size={40} className="text-white group-hover:text-primary transition-colors duration-500" />
                                    </div>
                                </div>
                                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-lg border-4 border-surface shadow-lg">
                                    {step.id}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors">
                                {step.title}
                            </h3>
                            <p className="text-text-muted leading-relaxed max-w-xs font-medium">
                                {step.desc}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
