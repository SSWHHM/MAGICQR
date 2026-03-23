import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Target, TrendingUp, LayoutDashboard, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { landingData } from '../../data/landingData';

const icons = {
    QrCode: QrCode,
    Target: Target,
    TrendingUp: TrendingUp,
    LayoutDashboard: LayoutDashboard,
    MessageCircle: MessageCircle
};

export default function Features() {
    const { title, subtitle, grid } = landingData.features;
    const navigate = useNavigate();

    return (
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-24">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-7xl font-black mb-6 tracking-tighter"
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {grid.map((feature, i) => {
                    const Icon = icons[feature.icon];
                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="relative group p-10 rounded-3xl bg-white/3 border border-white/5 backdrop-blur-3xl overflow-hidden"
                        >
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-500">
                                    <Icon size={28} className="text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-primary transition-colors duration-500">
                                    {feature.title}
                                </h3>
                                <p className="text-text-muted leading-relaxed font-medium group-hover:text-white/80 transition-colors duration-500">
                                    {feature.desc}
                                </p>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/20 transition-all" />
                        </motion.div>
                    );
                })}

                {/* Final CTA Card */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="relative group p-1 rounded-3xl bg-linear-to-br from-primary to-secondary overflow-hidden shadow-2xl shadow-primary/20"
                >
                    <div className="h-full w-full bg-surface rounded-[calc(1.5rem-1px)] p-10 flex flex-col justify-center">
                        <h3 className="text-3xl font-black mb-4 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Scale Your Empire
                        </h3>
                        <p className="text-text-muted mb-8 font-medium italic">
                            Join 500+ Mumbai businesses already dominating...
                        </p>
                        <button 
                            onClick={() => navigate('/signup')}
                            className="w-fit text-primary font-black flex items-center gap-2 group-hover:gap-4 transition-all duration-300"
                        >
                            Get Started <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
