import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Target, LayoutDashboard, MapPin, MessageCircle, Shield } from 'lucide-react';
import { landingData } from '../../data/landingData';

const icons = {
    QrCode: QrCode,
    Target: Target,
    LayoutDashboard: LayoutDashboard,
    MapPin: MapPin,
    MessageCircle: MessageCircle,
    Shield: Shield
};

export default function Features() {
    const { title, grid } = landingData.features;

    return (
        <section id="features" className="py-32 px-6 max-w-6xl mx-auto">
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grid.map((feature, i) => {
                    const Icon = icons[feature.icon];
                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="p-10 rounded-2xl bg-card border border-border hover:border-primary transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                                <Icon size={24} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wider">
                                {feature.title}
                            </h3>
                            <p className="text-text-muted leading-relaxed font-bold">
                                {feature.desc}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
